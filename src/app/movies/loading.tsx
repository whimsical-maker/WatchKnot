export default function Loading() {
  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ height: "60px", width: "30%", backgroundColor: "var(--color-border)", borderRadius: "8px", animation: "pulse 1.5s infinite", marginBottom: "30px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "25px" }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ height: "300px", backgroundColor: "var(--color-border)", borderRadius: "16px", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    </div>
  );
}
