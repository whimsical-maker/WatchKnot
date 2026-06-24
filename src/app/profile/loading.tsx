export default function Loading() {
  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "30px", alignItems: "center", marginBottom: "40px" }}>
        <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "var(--color-border)", animation: "pulse 1.5s infinite" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ height: "40px", width: "50%", backgroundColor: "var(--color-border)", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
          <div style={{ height: "20px", width: "30%", backgroundColor: "var(--color-border)", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
        </div>
      </div>
      <div style={{ height: "40px", width: "100%", backgroundColor: "var(--color-border)", borderRadius: "8px", animation: "pulse 1.5s infinite", marginBottom: "20px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: "250px", backgroundColor: "var(--color-border)", borderRadius: "16px", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  );
}
