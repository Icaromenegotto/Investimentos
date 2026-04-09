import { useState } from "react";
import { api } from "../services/api";
import Layout from "../components/Layout";

export default function CadastroAtivo() {
  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    classe: "",
    moeda: "BRL",
    data_inicio: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvar = async () => {
    await api.post("/ativos", form);
    alert("Ativo cadastrado com sucesso!");
    setForm({
      nome: "",
      tipo: "",
      classe: "",
      moeda: "BRL",
      data_inicio: ""
    });
  };

return (
  <Layout>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          width: 400,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ textAlign: "center" }}>Cadastrar Ativo</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          <input
            name="nome"
            placeholder="Nome do ativo"
            value={form.nome}
            onChange={handleChange}
            style={{ padding: 8 }}
          />

          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            style={{ padding: 8 }}
          >
            <option value="">Selecione o tipo</option>
            <option value="acao">Ação</option>
            <option value="fii">FII</option>
            <option value="etf">ETF</option>
            <option value="fundo">Fundo</option>
            <option value="renda_fixa">Renda Fixa</option>
            <option value="cripto">Cripto</option>
          </select>

          <select
            name="classe"
            value={form.classe}
            onChange={handleChange}
            style={{ padding: 8 }}
          >
            <option value="">Selecione a classe</option>
            <option value="acoes_br">Ações Brasil</option>
            <option value="acoes_eua">Ações EUA</option>
            <option value="fiis">Fundos Imobiliários</option>
            <option value="etfs">ETFs</option>
            <option value="multimercado">Multimercado</option>
            <option value="previdencia">Previdência</option>
            <option value="renda_fixa">Renda Fixa</option>
            <option value="cripto">Criptomoedas</option>
            <option value="reserva">Reserva</option>
            <option value="metais">Metais</option>
          </select>

          <input
            type="date"
            name="data_inicio"
            value={form.data_inicio}
            onChange={handleChange}
            style={{ padding: 8 }}
          />

          <select
            name="moeda"
            value={form.moeda}
            onChange={handleChange}
            style={{ padding: 8 }}
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </select>

          <button
            onClick={salvar}
            style={{
              padding: 10,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              cursor: "pointer"
            }}
          >
            Salvar
          </button>

        </div>
      </div>
    </div>
  </Layout>
);
}