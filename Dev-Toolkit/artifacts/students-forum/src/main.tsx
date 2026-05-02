import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { supabase } from '@/lib/supabase'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
<div id="root"></div>
createRoot(document.getElementById("root")!).render(<App />);
