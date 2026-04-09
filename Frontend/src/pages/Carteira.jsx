import { useEffect, useState } from "react";
import { api } from "../services/api";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

export default function Carteira() {
  const [dados, setDados] = useState([]);
  const [classe, setClasse] = useState("");
  const [moeda, setMoeda] = useState("BRL");
  const navigate = useNavigate();

  useEffect(() => {
    carregar();
  }, [moeda]);

  const carregar = async () => {
    const res = await api.get(`/carteira?moeda=${moeda}`);
    setDados(res.data);
  };

  const filtrados = classe
    ? dados.filter(d => d.classe === classe)
    : dados;

  const totalCarteira = filtrados.reduce(
    (s, a) => s + Number(a.valor_total || 0),
    0
  );

  const th = { padding: 8, textAlign: "left" };
  const td = { padding: 8 };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={box}>
          <h2 style={{ textAlign: "center" }}>Carteira</h2>

          {/* CONTROLES */}
          <div style={topo}>
            <div>
              <label>Classe</label><br/>
              <select
                value={classe}
                onChange={e => setClasse(e.target.value)}
                style={{ padding: 8, width: 200 }}
              >
                <option value="">Todas</option>
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
            </div>

            <div>
              <button onClick={() => setMoeda("BRL")}>R$</button>
              <button onClick={() => setMoeda("USD")} style={{ marginLeft: 5 }}>USD</button>
            </div>

            <div style={{ fontWeight: "bold", fontSize: 18 }}>
              Total: {moeda === "BRL" ? "R$" : "USD"}{" "}
              {totalCarteira.toFixed(2)}
            </div>
          </div>

          {/* TABELA */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={th}>Ativo</th>
                <th style={th}>Classe</th>
                <th style={th}>Valor</th>
                <th style={th}>Câmbio</th>
                <th style={th}>Ganho Mês</th>
                <th style={th}>%</th>
                <th style={th}>Ganho Total</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(a => (
                <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={td}>
                    <span
                      style={{ color: "#2563eb", cursor: "pointer" }}
                      onClick={() => navigate(`/ativo/${a.id}`)}
                    >
                      {a.nome}
                    </span>
                  </td>

                  <td style={td}>{a.classe}</td>

                  <td style={td}>
                    {moeda === "BRL" ? "R$" : "USD"}{" "}
                    {Number(a.valor_total || 0).toFixed(2)}
                  </td>

                  <td style={td}>
                    {Number(a.cambio_fechamento || 1).toFixed(2)}
                  </td>

                  <td
                    style={{
                      ...td,
                      color: a.ganho_mes >= 0 ? "green" : "red"
                    }}
                  >
                    {moeda === "BRL" ? "R$" : "USD"}{" "}
                    {Number(a.ganho_mes || 0).toFixed(2)}
                  </td>

                  <td
                    style={{
                      ...td,
                      color: a.ganho_percentual >= 0 ? "green" : "red"
                    }}
                  >
                    {Number(a.ganho_percentual || 0).toFixed(2)}%
                  </td>

                  <td
                    style={{
                      ...td,
                      color: a.ganho_mes >= 0 ? "green" : "red"
                    }}
                  >
                    {moeda === "BRL" ? "R$" : "USD"}{" "}
                    {Number(a.ganho_total || 0).toFixed(2)}
                  </td>            
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </Layout>
  );
}

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 950,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const topo = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  borderBottom: "1px solid #ddd",
  paddingBottom: 15
};
