import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  // Strict mode makes useEffect run twice which results in error
  // when using axios
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/*" element={<App />}></Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
