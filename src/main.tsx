import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./styles/globals.css";
import { APP_BASENAME } from "./lib/config";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={APP_BASENAME}>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  </React.StrictMode>,
);
