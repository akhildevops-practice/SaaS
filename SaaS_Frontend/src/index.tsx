import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { MODE } from "./config";

/**
 * This section overrides the console log function calls with a blank body in production
 */
if (MODE === "production") console.log = () => {};

// Use React 18's createRoot API
const container = document.getElementById("root");

if (container) {
  const root = ReactDOM.createRoot(container);
  // Optionally wrap with <React.StrictMode>
  root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
}
