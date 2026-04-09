import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/ativos">Ativos</Link>
        <Link to="/fechamento">Fechamento</Link>
        <Link to="/carteira">Carteira</Link>
        <Link to="/dashboard">Dashboard</Link>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}