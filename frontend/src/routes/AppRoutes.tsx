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
import ResultadoSessao from "../pages/ResultadoSessao";
import DadosAdm from "../pages/DadosAdm";
import FiltroRelatorio from "../pages/FiltroRelatorio";
import RelatorioAdm from "../pages/RelatorioAdm";
import RelatorioAtleta from "../pages/RelatorioAtleta";
import ProtectedRoute from "../components/ProtectedRoute";

// gerenciamento das rotas do app
export default function AppRoutes() {
  return (
    <Routes>
      
      <Route path="/" element={<Inicial />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/resultado-sessao" element={<ResultadoSessao />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRole="atleta" />}>
        <Route path="/menu-atleta" element={<MenuAtleta />} />
        <Route path="/pre-sessao" element={<PreSessao />} />
        <Route path="/durante-sessao" element={<DuranteSessao />} />
        <Route path="/pos-sessao" element={<PosSessao />} />
        <Route path="/dados-atleta" element={<DadosAtleta/>}/>
        <Route path="/relatorio-atleta" element={<RelatorioAtleta/>}/>
      </Route>
      
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path="/filtro-relatorio" element={<FiltroRelatorio/>}/>
        <Route path="/menu-adm" element={<MenuAdm />} />
        <Route path="/dados-adm" element={<DadosAdm/>}/>
        <Route path="/relatorio-adm" element={<RelatorioAdm/>}/>  
      </Route>

    </Routes>
  );
}
