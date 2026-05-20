import { Routes, Route } from "react-router-dom";
import Inicial from "../pages/Inicial";
import Login from "../pages/Login";
import Cadastro from "../pages/Cadastro";
import MenuAdm from "../pages/MenuAdm";
import MenuAtleta from "../pages/MenuAtleta";
import PreSessao from "../pages/PreSessao";
import DuranteSessao from "../pages/DuranteSessao";
import DadosAtleta from "../pages/DadosAtleta";
import PosSessao from "../pages/PosSessao";
// gerenciamento das rotas do app
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Inicial />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/menu-adm" element={<MenuAdm />} />
      <Route path="/menu-atleta" element={<MenuAtleta />} />
      <Route path="/pre-sessao" element={<PreSessao />} />
      <Route path="/durante-sessao" element={<DuranteSessao />} />
      <Route path="/dados-atleta" element={<DadosAtleta/>}/>
      <Route path="/pos-sessao" element={<PosSessao />} />
    </Routes>
  );
}
