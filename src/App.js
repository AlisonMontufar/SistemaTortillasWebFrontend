import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import OlvidePassword from "./pages/OlvidePassword";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/olvide-password" element={<OlvidePassword />} />
      </Routes>
    </Router>
  );
}

export default App;
