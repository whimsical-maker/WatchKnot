"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { downloadMedia, removeDownloadedMedia, isDownloaded, DownloadMetadata } from "@/lib/offlineManager";

export default function DownloadButton({ metadata }: { metadata: Omit<DownloadMetadata, "downloadedAt" | "sizeBytes"> }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setDownloaded(isDownloaded(metadata.videoUrl));
  }, [metadata.videoUrl]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setProgress(0);
      await downloadMedia(metadata, (pct) => setProgress(pct));
      setDownloaded(true);
    } catch (e: any) {
      alert("Download failed: " + e.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleRemove = async () => {
    if (confirm("Remove this downloaded media from your device?")) {
      await removeDownloadedMedia(metadata.videoUrl);
      setDownloaded(false);
    }
  };

  if (downloaded) {
    return (
      <button onClick={handleRemove} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "20px", border: "1px solid #137333", backgroundColor: "#e6f4ea", color: "#137333", fontWeight: "bold", cursor: "pointer" }} title="Downloaded. Click to remove.">
        <CheckCircle size={16} /> Downloaded <Trash2 size={14} style={{ marginLeft: "4px" }} />
      </button>
    );
  }

  if (downloading) {
    return (
      <button disabled style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "20px", border: "1px solid var(--color-border)", backgroundColor: "#f9f9f9", color: "#888", fontWeight: "bold" }}>
        <Loader2 size={16} className="animate-spin" /> Downloading {progress}%
      </button>
    );
  }

  return (
    <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "20px", border: "1px solid var(--color-border)", backgroundColor: "white", color: "var(--color-text)", fontWeight: "bold", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
      <Download size={16} /> Download Offline
    </button>
  );
}
