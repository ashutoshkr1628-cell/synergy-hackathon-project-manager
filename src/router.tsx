import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RegisterPage from "./pages/RegisterPage";

export const routers = [
  {
    path: "/",
    name: "home",
    element: <Index />,
  },
  // Fallback routes for vanilla HTML pages (catches SPA redirect edge cases)
  {
    path: "/synergy.html",
    name: "synergy-fallback",
    element: <Index />,
  },
  {
    path: "/register.html",
    name: "register-fallback",
    element: <RegisterPage />,
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
