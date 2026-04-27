import { Routes, Route } from "react-router-dom";
import Inicial from "../pages/Inicial";
import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicial />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Cadastro />} />
    </Routes>
  );
}
