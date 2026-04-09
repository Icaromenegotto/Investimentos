import { useState } from "react";
import { api } from "../services/api";
import Layout from "../components/Layout";

const input = {
  width: "100%",
  padding: 6,
  boxSizing: "border-box"
};

export default function FechamentoMensal() {
  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");
  const [ativos, setAtivos] = useState([]);

  const carregar = async () => {
    const res = await api.get(`/fechamento/${ano}/${mes}`);
    setAtivos(res.data || []);
  };

  const handleChange = (id, field, value) => {
    setAtivos(prev =>
      prev.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      )
    );
  };

  const salvar = async () => {
    await api.post("/fechamento", { ano, mes, ativos });
    alert("Fechamento salvo!");
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            background: "#fff",
            padding: 20,
            borderRadius: 8,
            width: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>
            Fechamento Mensal
          </h2>

          {/* FILTRO */}
          <div
            style={{
              borderBottom: "1px solid #ddd",
              paddingBottom: 15,
              marginBottom: 20
            }}
          >
            <strong>Selecione o período</strong>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <div style={{ width: 120 }}>
                <label>Mês</label>
                <input
                  style={input}
                  value={mes}
                  onChange={e => setMes(e.target.value)}
                />
              </div>

              <div style={{ width: 120 }}>
                <label>Ano</label>
                <input
                  style={input}
                  value={ano}
                  onChange={e => setAno(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  onClick={carregar}
                  style={{
                    padding: 10,
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer"
                  }}
                >
                  Carregar
                </button>
              </div>
            </div>
          </div>

          {/* LISTA */}
          {ativos.map(a => {
            const usd = Number(a.valor_total_usd || 0);
            const cambio = Number(a.cambio_fechamento || 1);
            const valorBRL = usd * cambio;

            return (
              <div
                key={a.id}
                style={{
                  borderBottom: "1px solid #eee",
                  paddingBottom: 12,
                  marginBottom: 12
                }}
              >
                <strong>{a.nome}</strong>

                {/* CABEÇALHO */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                    gap: 8,
                    fontSize: 12,
                    marginTop: 6,
                    color: "#555"
                  }}
                >
                  <span>Valor USD</span>
                  <span>Câmbio</span>
                  <span>Valor BRL</span>
                  <span>Aporte</span>
                  <span>Venda</span>
                  <span>Proventos</span>
                </div>

                {/* INPUTS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                    gap: 8,
                    marginTop: 4
                  }}
                >
                  <input
                    style={input}
                    value={a.valor_total_usd || ""}
                    onChange={e =>
                      handleChange(a.id, "valor_total_usd", e.target.value)
                    }
                  />

                  <input
                    style={input}
                    value={a.cambio_fechamento || ""}
                    onChange={e =>
                      handleChange(a.id, "cambio_fechamento", e.target.value)
                    }
                  />

                  <input
                    style={input}
                    value={valorBRL.toFixed(2)}
                    disabled
                  />

                  <input
                    style={input}
                    value={a.aporte_mes || ""}
                    onChange={e =>
                      handleChange(a.id, "aporte_mes", e.target.value)
                    }
                  />

                  <input
                    style={input}
                    value={a.retirada_mes || ""}
                    onChange={e =>
                      handleChange(a.id, "retirada_mes", e.target.value)
                    }
                  />

                  <input
                    style={input}
                    value={a.proventos_mes || ""}
                    onChange={e =>
                      handleChange(a.id, "proventos_mes", e.target.value)
                    }
                  />
                </div>
              </div>
            );
          })}

          {/* BOTÃO */}
          {ativos.length > 0 && (
            <button
              onClick={salvar}
              style={{
                padding: 12,
                width: "100%",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                marginTop: 10
              }}
            >
              Salvar Fechamento
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
