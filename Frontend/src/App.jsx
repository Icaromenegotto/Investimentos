import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Carteira from "./pages/Carteira";
import FechamentoMensal from "./pages/FechamentoMensal";
import CadastroAtivo from "./pages/CadastroAtivo";
import Dashboard from "./pages/Dashboard";
import DetalheAtivo from "./pages/DetalheAtivo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ativos" element={<CadastroAtivo />} />
        <Route path="/fechamento" element={<FechamentoMensal />} />
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ativo/:id" element={<DetalheAtivo />} />
      </Routes>
    </BrowserRouter>
  );
}