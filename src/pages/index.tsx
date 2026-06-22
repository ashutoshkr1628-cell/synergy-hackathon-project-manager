import { useEffect } from "react";
import synergyContent from "../../public/synergy.html?raw";

/**
 * Synergy OS entry — bypasses SPA routing by writing the
 * vanilla HTML directly into the document (no server redirect needed).
 * All asset paths (styles.css, app.js) resolve to /public because
 * document.write() inherits the current origin as base URL.
 */
const Index = () => {
  useEffect(() => {
    // Completely replace the React document with the Synergy app
    document.open("text/html", "replace");
    document.write(synergyContent);
    document.close();
  }, []);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh", background: "#060913",
      color: "#9ca3af", fontFamily: "sans-serif", gap: "12px"
    }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "10px",
        background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "22px"
      }}>⬡</div>
      <span style={{ fontSize: "13px", letterSpacing: "1px" }}>LAUNCHING SYNERGY OS...</span>
    </div>
  );
};

export default Index;
