import { useEffect } from "react";
import registerContent from "../../public/register.html?raw";

/**
 * Serves the vanilla register.html as a React route fallback.
 * Uses the same document.write() technique as Index.tsx.
 */
const RegisterPage = () => {
  useEffect(() => {
    document.open("text/html", "replace");
    document.write(registerContent);
    document.close();
  }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#060913", color: "#9ca3af",
      fontFamily: "sans-serif", fontSize: "13px", letterSpacing: "1px"
    }}>
      LOADING REGISTRATION...
    </div>
  );
};

export default RegisterPage;
