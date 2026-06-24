export interface DownloadMetadata {
  id: string;
  title: string;
  posterUrl?: string;
  videoUrl: string;
  type: "MOVIE" | "EPISODE";
  season?: number;
  episodeNumber?: number;
  downloadedAt: number;
  sizeBytes?: number;
}

const STORAGE_KEY = "watchknot_downloads";

export const getDownloadedMedia = (): DownloadMetadata[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveDownloadMetadata = (metadata: DownloadMetadata) => {
  const current = getDownloadedMedia();
  const updated = current.filter(m => m.videoUrl !== metadata.videoUrl);
  updated.push(metadata);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const removeDownloadMetadata = (videoUrl: string) => {
  const current = getDownloadedMedia();
  const updated = current.filter(m => m.videoUrl !== videoUrl);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const isDownloaded = (videoUrl: string): boolean => {
  const current = getDownloadedMedia();
  return current.some(m => m.videoUrl === videoUrl);
};

export const downloadMedia = async (
  metadata: Omit<DownloadMetadata, "downloadedAt">, 
  onProgress?: (pct: number) => void
) => {
  if (!window.caches) throw new Error("Cache API not supported");

  const cache = await caches.open("watchknot-media-v1");
  
  // Fetch with no-store to ensure we download the fresh blob
  const response = await fetch(metadata.videoUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  // We read the stream to report progress
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Response body is not readable");

  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    if (value) {
      chunks.push(value);
      loaded += value.length;
      if (total && onProgress) {
        onProgress(Math.round((loaded / total) * 100));
      }
    }
  }

  // Create a new blob from the chunks
  const blob = new Blob(chunks as BlobPart[], { type: response.headers.get("content-type") || "video/mp4" });
  const cacheResponse = new Response(blob, {
    headers: {
      "Content-Type": blob.type,
      "Content-Length": blob.size.toString(),
    }
  });

  // Store in Cache API
  await cache.put(metadata.videoUrl, cacheResponse);

  // Save Metadata
  saveDownloadMetadata({
    ...metadata,
    downloadedAt: Date.now(),
    sizeBytes: blob.size
  });
};

export const removeDownloadedMedia = async (videoUrl: string) => {
  if (window.caches) {
    const cache = await caches.open("watchknot-media-v1");
    await cache.delete(videoUrl);
  }
  removeDownloadMetadata(videoUrl);
};
