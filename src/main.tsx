import React from "react";
import { createRoot } from "react-dom/client";
import FactoryMindDemo from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FactoryMindDemo />
  </React.StrictMode>,
);
