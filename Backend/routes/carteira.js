import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { moeda = "BRL" } = req.query;

  const r = await pool.query(`
    SELECT
      a.id,
      a.nome,
      a.classe,
      a.moeda,

      CASE 
        WHEN $1 = 'USD' THEN ma.valor_total_usd
        ELSE ma.valor_total_brl
      END AS valor_total,

      CASE 
        WHEN $1 = 'USD' THEN ma.ganho_usd
        ELSE ma.ganho_brl
      END AS ganho_mes,

      CASE 
        WHEN $1 = 'USD' THEN mm.ganho_percentual_usd
        ELSE mm.ganho_percentual_brl
      END AS ganho_percentual,

      CASE 
        WHEN $1 = 'USD' THEN ma.ganho_total_usd
        ELSE ma.ganho_total_brl
      END AS ganho_total,

      CASE 
        WHEN $1 = 'USD' THEN ma.ganho_3m_usd
        ELSE ma.ganho_3m_brl
      END AS ganho_3m,

      CASE 
        WHEN $1 = 'USD' THEN ma.ganho_6m_usd
        ELSE ma.ganho_6m_brl
      END AS ganho_6m,

      CASE 
        WHEN $1 = 'USD' THEN ma.ganho_12m_usd
        ELSE ma.ganho_12m_brl
      END AS ganho_12m

    FROM ativos a
    JOIN metricas_acumuladas ma 
      ON ma.ativo_id = a.id

    JOIN metricas_mensais mm
      ON mm.ativo_id = a.id
     AND (mm.ano, mm.mes) = (
        SELECT ano, mes 
        FROM snapshot_mensal
        ORDER BY ano DESC, mes DESC 
        LIMIT 1
     )

    WHERE (ma.ano, ma.mes) = (
      SELECT ano, mes FROM snapshot_mensal
      ORDER BY ano DESC, mes DESC LIMIT 1
    )

    ORDER BY a.CLASSE, ganho_total_brl desc, A.id
  `,[moeda]);

  res.json(r.rows);
});

export default router;
