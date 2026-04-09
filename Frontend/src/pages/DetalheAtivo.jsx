import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import Layout from "../components/Layout";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export default function DetalheAtivo() {
  const { id } = useParams();

  const [dados, setDados] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [moeda, setMoeda] = useState("BRL");

  useEffect(() => {
    carregar();
  }, [moeda]);

  const carregar = async () => {
    const res = await api.get(`/ativos/${id}/detalhe?moeda=${moeda}`);

    setDados(res.data.resumo);

    setHistorico(
      (res.data.historico || []).sort(
        (a, b) =>
          a.ano === b.ano ? a.mes - b.mes : a.ano - b.ano
      )
    );
  };

  const historicoFormatado = historico.map(h => ({
    mes: `${h.mes}/${h.ano}`,
    valor_total: Number(h.valor_total || 0)
  }));

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={box}>

          {/* TOPO */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h2>{dados?.nome || "Ativo"}</h2>

            <div>
              <button onClick={()=>setMoeda("BRL")}>R$</button>
              <button onClick={()=>setMoeda("USD")} style={{marginLeft:5}}>USD</button>
            </div>
          </div>

          {/* CARDS */}
          {dados && (
            <div style={cards}>
                <Card titulo="Total Investido" valor={`${moeda==="BRL"?"R$":"USD"} ${Number(dados.total_investido).toFixed(2)}`} />

                {dados.vendido && (
                  <Card titulo="Valor da Venda" valor={`${moeda==="BRL"?"R$":"USD"} ${Number(dados.total_retirado).toFixed(2)}`} />
                )}

                <Card titulo="Valor Atual" valor={`${moeda==="BRL"?"R$":"USD"} ${Number(dados.valor_atual).toFixed(2)}`} />

                <Card titulo="Resultado" valor={`${moeda==="BRL"?"R$":"USD"} ${Number(dados.ganho_valor).toFixed(2)}`} />

                <Card titulo="Rentabilidade" valor={`${Number(dados.ganho_percentual).toFixed(2)}%`} />
            </div>
          )}

          {/* GRÁFICO */}
          <div style={{ marginTop: 30 }}>
            <h3 style={{ textAlign: "center" }}>Evolução</h3>

            {historicoFormatado.length > 0 ? (
              <LineChart width={800} height={300} data={historicoFormatado}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="valor_total" stroke="#2563eb" />
              </LineChart>
            ) : (
              <p style={{ textAlign: "center" }}>Sem histórico ainda</p>
            )}
          </div>

          {/* TABELA */}
          <table style={table}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={thLeft}>Mês</th>
                <th style={thRight}>Valor</th>
                <th style={thRight}>Aporte</th>
                <th style={thRight}>Proventos</th>
                <th style={thRight}>Venda</th>
                <th style={thRight}>Ganho</th>
                <th style={thRight}>%</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((h, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdLeft}>{h.mes}/{h.ano}</td>
                  <td style={tdRight}>{moeda==="BRL"?"R$":"USD"} {Number(h.valor_total).toFixed(2)}</td>
                  <td style={tdRight}>{moeda==="BRL"?"R$":"USD"} {Number(h.aporte_mes).toFixed(2)}</td>
                  <td style={tdRight}>{moeda==="BRL"?"R$":"USD"} {Number(h.proventos_mes).toFixed(2)}</td>
                  <td style={tdRight}>{moeda==="BRL"?"R$":"USD"} {Number(h.valor_vendido).toFixed(2)}</td>
                  <td style={{ ...tdRight, color: h.ganho_valor >= 0 ? "green" : "red" }}>
                    {moeda==="BRL"?"R$":"USD"} {Number(h.ganho_valor).toFixed(2)}
                  </td>
                  <td style={{ ...tdRight, color: h.ganho_percentual >= 0 ? "green" : "red" }}>
                    {Number(h.ganho_percentual).toFixed(2)}%
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

/* COMPONENTE CARD */
function Card({ titulo, valor }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 13, color: "#555" }}>{titulo}</div>
      <div style={{ fontSize: 18, fontWeight: "bold" }}>{valor}</div>
    </div>
  );
}

/* ESTILOS */

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 900,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 10,
  marginTop: 20
};

const card = {
  background: "#f9fafb",
  padding: 15,
  borderRadius: 8,
  textAlign: "center"
};

const table = {
  width: "100%",
  marginTop: 30,
  borderCollapse: "collapse",
  fontSize: 14
};

const thLeft = { padding: 8, textAlign: "left" };
const thRight = { padding: 8, textAlign: "right" };
const tdLeft = { padding: 8, textAlign: "left" };
const tdRight = { padding: 8, textAlign: "right" };
