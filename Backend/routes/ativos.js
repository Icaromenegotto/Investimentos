import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// listar ativos
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM ativos ORDER BY nome");
  res.json(result.rows);
});

// criar ativo
router.post("/", async (req, res) => {
  const { nome, tipo, classe, moeda, data_inicio } = req.body;

  await pool.query(
    `INSERT INTO ativos (nome, tipo, classe, moeda, data_inicio)
     VALUES ($1,$2,$3,$4,$5)`,
    [nome, tipo, classe, moeda, data_inicio]
  );

  res.sendStatus(201);
});

router.get("/:id/detalhe", async (req,res)=>{
  const { id } = req.params;
  const { moeda="BRL" } = req.query;

  const resumo = await pool.query(`
      WITH ultimos AS (
        SELECT DISTINCT ON (ativo_id)
          ativo_id,
          valor_total_brl,
          valor_total_usd
        FROM metricas_mensais
        ORDER BY ativo_id, ano DESC, mes DESC
      )

      SELECT
        a.nome,
        a.classe,

        SUM(
          CASE
            WHEN a.classe IN ('acoes_eua','cripto')
              THEN (m.aporte_mes - m.retirada_mes) * m.cambio_fechamento
            ELSE (m.aporte_mes - m.retirada_mes)
          END
        ) AS total_investido_brl,

        SUM(m.aporte_mes - m.retirada_mes) AS total_investido_usd,

        SUM(
          CASE
            WHEN a.classe IN ('acoes_eua','cripto')
              THEN m.retirada_mes * m.cambio_fechamento
            ELSE m.retirada_mes
          END
        ) AS total_retirado_brl,

        SUM(m.retirada_mes) AS total_retirado_usd,

        u.valor_total_brl AS valor_atual_brl,
        u.valor_total_usd AS valor_atual_usd

      FROM ativos a
      JOIN metricas_mensais m ON m.ativo_id = a.id
      JOIN ultimos u ON u.ativo_id = a.id
      WHERE a.id = $1
      GROUP BY a.nome, a.classe, u.valor_total_brl, u.valor_total_usd;
  `,[id]);

  const hist = await pool.query(`
      SELECT
        ano,
        mes,

        CASE WHEN $2='USD' THEN valor_total_usd
            ELSE valor_total_brl END AS valor_total,

        CASE
          WHEN $2='USD' THEN aporte_mes
          ELSE aporte_mes * cambio_fechamento
        END AS aporte_mes,

        CASE
          WHEN $2='USD' THEN proventos_mes
          ELSE proventos_mes * cambio_fechamento
        END AS proventos_mes,

        CASE
          WHEN $2='USD' THEN retirada_mes
          ELSE retirada_mes * cambio_fechamento
        END AS valor_vendido,

        CASE WHEN $2='USD' THEN ganho_usd
            ELSE ganho_brl END AS ganho_valor,

        CASE WHEN $2='USD' THEN ganho_percentual_usd
            ELSE ganho_percentual_brl END AS ganho_percentual

      FROM metricas_mensais
      WHERE ativo_id = $1
      ORDER BY ano, mes
  `,[id,moeda]);

    const r = resumo.rows[0];

    const total_investido =
      moeda === "USD"
        ? Number(r.total_investido_usd)
        : Number(r.total_investido_brl);

    const valor_atual =
      moeda === "USD"
        ? Number(r.valor_atual_usd)
        : Number(r.valor_atual_brl);

    const total_retirado =
      moeda === "USD"
        ? Number(r.total_retirado_usd)
        : Number(r.total_retirado_brl);

    // ativo vendido se valor_atual = 0 e houve retirada
    const vendido = valor_atual === 0 && total_retirado > 0;

    const base = vendido ? total_retirado : valor_atual;
    const ganho = base - total_investido;
    const perc = total_investido ? (ganho/total_investido)*100 : 0;

  res.json({
    resumo:{
      nome:r.nome,
      total_investido,
      valor_atual,
      ganho_valor:ganho,
      ganho_percentual:perc
    },
    historico:hist.rows
  });
});


export default router;