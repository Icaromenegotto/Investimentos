import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Controle de Investimentos</h1>

      <nav style={{ display: "flex", gap: 20 }}>
        <Link to="/ativos">Cadastrar Ativo</Link>
        <Link to="/fechamento">Fechamento Mensal</Link>
        <Link to="/carteira">Carteira</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
    </div>
  );
}