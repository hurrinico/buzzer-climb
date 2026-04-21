import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import CardFrameDemo from "./components/cards/CardFrameDemo.jsx";
import "./styles/variables.css";
import "./styles/noir.css";

const demoMode = new URLSearchParams(window.location.search).get("demo");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>{demoMode === "cards" ? <CardFrameDemo /> : <App />}</React.StrictMode>
);
