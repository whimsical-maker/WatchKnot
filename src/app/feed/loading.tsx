export default function Loading() {
  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ height: "60px", width: "40%", backgroundColor: "var(--color-border)", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "200px", width: "100%", backgroundColor: "var(--color-border)", borderRadius: "16px", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "300px", width: "100%", backgroundColor: "var(--color-border)", borderRadius: "16px", animation: "pulse 1.5s infinite" }} />
      <div style={{ height: "250px", width: "100%", backgroundColor: "var(--color-border)", borderRadius: "16px", animation: "pulse 1.5s infinite" }} />
    </div>
  );
}
