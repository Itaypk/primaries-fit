/** Faux iOS status bar (purely decorative, matches the prototype). */
export function StatusBar() {
  return (
    <div
      style={{
        height: "44px",
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 26px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#2b2622",
      }}
    >
      <span>9:41</span>
      <div
        style={{
          width: "120px",
          height: "26px",
          background: "#faf6ef",
          borderRadius: "0 0 16px 16px",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: 0,
        }}
      />
      <span style={{ letterSpacing: "2px" }}>● ● ●</span>
    </div>
  );
}
