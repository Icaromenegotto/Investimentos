import { useEffect, useState } from "react";
import { api } from "../services/api";
import Layout from "../components/Layout";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Bar
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#f59e0b",
  "#7c3aed",
  "#0d9488",
  "#9333ea",
  "#ea580c"
];

export default function Dashboard() {
  const [evolucao, setEvolucao] = useState([]);
  const [aportes, setAportes] = useState([]);
  const [classe, setClasse] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [periodos, setPeriodos] = useState(null);
  const [classeFiltro, setClasseFiltro] = useState("");

  const [aporteMesAtual, setAporteMesAtual] = useState(0);

  useEffect(() => {
    carregar();
  }, [classeFiltro]);

  const carregar = async () => {
    const params = {
      params: {
        moeda: "BRL",
        classe: classeFiltro || null
      }
    };

    const ev = await api.get("/dashboard/evolucao", params);
    const ap = await api.get("/dashboard/aportes", params);
    const cl = await api.get("/dashboard/classe", params);
    const rs = await api.get("/dashboard/resumo", params);
    const rk = await api.get("/dashboard/ranking", params);
    const p = await api.get("/dashboard/periodos", params);

    setEvolucao(ev.data || []);
    setClasse(cl.data || []);
    setResumo(rs.data);
    setRanking(rk.data || []);
    setPeriodos(p.data);

    /* APORTES */
    let acumulado = 0;

    const dadosAporte = (ap.data || []).map(a => {
      const aporte = Number(a.aporte_mes || 0);
      acumulado += aporte;

      return {
        mes: `${a.mes}/${a.ano}`,
        aporte_mes: aporte,
        total: acumulado
      };
    });

    setAportes(dadosAporte);

    setAporteMesAtual(
      dadosAporte.length
        ? dadosAporte[dadosAporte.length - 1].aporte_mes
        : 0
    );
  };

  /* ===== FORMATACOES ===== */

  const evolucaoFormatada = evolucao.map((e, i, arr) => {
    const atual = Number(e.total || 0);
    const anterior = i > 0 ? Number(arr[i - 1].total || 0) : atual;

    return {
      mes: `${e.mes}/${e.ano}`,
      total: atual,
      variacao: atual - anterior
    };
  });

  /* 🔥 NOVO: GANHO REAL x APORTE */

  const mapaAportes = {};
  aportes.forEach(a => {
    mapaAportes[a.mes] = a.aporte_mes;
  });

  const evolucaoComGanho = evolucaoFormatada.map(e => {
    const aporteMes = mapaAportes[e.mes] || 0;
    const ganhoReal = e.variacao - aporteMes;

    return {
      mes: e.mes,
      total: e.total,
      aporteMes,
      ganhoReal
    };
  });

  const classeFormatada = classe.map(c => ({
    classe: c.classe,
    total: Number(c.total || 0)
  }));

  const totalCarteira = classeFormatada.reduce(
    (acc, c) => acc + c.total,
    0
  );

  const renderLabel = ({ name, value }) => {
    const perc = totalCarteira
      ? ((value / totalCarteira) * 100).toFixed(1)
      : 0;
    return `${name} (${perc}%)`;
  };

  return (
    <Layout>

      {/* RESUMO */}
      {resumo && (
        <div style={cardsTopo}>
          <ResumoValor titulo="Total Investido" valor={resumo.total_investido} />
          <ResumoValor titulo="Valor Atual" valor={resumo.valor_atual} />
          <ResumoValor titulo="Aporte do Mês" valor={aporteMesAtual} />
          <ResumoPercentual titulo="Rentabilidade" valor={resumo.ganho_percentual} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={box}>

          <h2 style={{ textAlign: "center" }}>Dashboard</h2>

<select
  value={classeFiltro}
  onChange={(e) => setClasseFiltro(e.target.value)}
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

          <div style={grid2}>

            {/* EVOLUÇÃO */}
            <div style={card}>
              <h3>Evolução da Carteira</h3>

              <ComposedChart width={450} height={260} data={evolucaoFormatada}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="variacao" fill="#93c5fd" />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </ComposedChart>
            </div>

            {/* APORTES */}
            <div style={card}>
              <h3>Evolução de Aportes</h3>

              <ComposedChart width={450} height={260} data={aportes}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="aporte_mes" fill="#94a3b8" />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
              </ComposedChart>
            </div>

            {/* 🔥 NOVO: GANHO REAL */}
            <div style={card}>
              <h3>Ganho Real x Aporte</h3>

              <ComposedChart width={450} height={260} data={evolucaoComGanho}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="aporteMes" fill="#86efac" />
                <Bar dataKey="ganhoReal" fill="#fca5a5" />

                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </ComposedChart>
            </div>

            {/* CLASSE */}
            <div style={card}>
              <h3>Alocação por Classe</h3>
              <PieChart width={450} height={260}>
                <Pie
                  data={classeFormatada}
                  dataKey="total"
                  nameKey="classe"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={renderLabel}
                >
                  {classeFormatada.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

          </div>
        </div>
      </div>

      {/* RANKING */}
      <h3 style={{ marginTop: 30 }}>Ranking de Ativos</h3>

      <table style={table}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th>Ativo</th>
            <th style={right}>Investido</th>
            <th style={right}>Atual</th>
            <th style={right}>Ganho</th>
            <th style={right}>%</th>
            <th style={right}>Meses Inv.</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((r, i) => {
            const valor_investido = r.total_investido - r.retirada_mes;
            const ganho = r.valor_atual - valor_investidoo;
            const perc = valor_investido           
              ? (ganho / valor_investido) * 100
              : 0;
            
             var mesInvestidos  = 0; 
             var anosInvestidos = 0;
              if(r.anoini == r.anoult){ 
                mesInvestidos = r.mesult - r.mesini }
              else{
                  anosInvestidos = (r.anoult-1) - r.anoini;
                  mesInvestidos = r.mesult+ (12-r.mesini) + anosInvestidos*12;
              }



            return (
              <tr key={i}>
                <td>{r.nome}</td>
                <td style={right}>R$ {Number(r.total_investido).toFixed(2)}</td>
                <td style={right}>R$ {Number(r.valor_atual).toFixed(2)}</td>
                <td style={{ ...right, color: ganho >= 0 ? "green" : "red" }}>
                  R$ {ganho.toFixed(2)}
                </td>
                <td style={{ ...right, color: perc >= 0 ? "green" : "red" }}>
                  {perc.toFixed(2)}%
                </td>
                <td style={{ ...right, color: mesInvestidos >= 0 ? "green" : "red" }}>
                  {mesInvestidos.toFixed(2)}
                </td>                
              </tr>
            );
          })}
        </tbody>
      </table>

    </Layout>
  );
}

/* COMPONENTES */

function ResumoValor({ titulo, valor }) {
  return (
    <div style={cardResumo}>
      <div>{titulo}</div>
      <strong>R$ {Number(valor || 0).toFixed(2)}</strong>
    </div>
  );
}

function ResumoPercentual({ titulo, valor }) {
  return (
    <div style={cardResumo}>
      <div>{titulo}</div>
      <strong>{Number(valor || 0).toFixed(2)}%</strong>
    </div>
  );
}

/* ESTILOS */

const box = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 1000,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20
};

const card = {
  background: "#f9fafb",
  padding: 15,
  borderRadius: 8
};

const cardsTopo = {
  display: "grid",
  gridTemplateColumns: "repeat(4,1fr)",
  gap: 10,
  marginBottom: 25
};

const cardResumo = {
  background: "#f9fafb",
  padding: 15,
  borderRadius: 8,
  textAlign: "center"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10
};

const right = { textAlign: "right" };
