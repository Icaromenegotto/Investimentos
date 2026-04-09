import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { mes, ano, ativos } = req.body;

  for (const a of ativos) {

    const valorUSD = Number(a.valor_total_usd || 0);
    const cambio = Number(a.cambio_fechamento || 1);
    const valorBRL = valorUSD * cambio;

    await pool.query(`
      INSERT INTO snapshot_mensal
      (
        ativo_id,
        ano,
        mes,
        valor_total_usd,
        cambio_fechamento,
        valor_total_brl,
        aporte_mes,
        retirada_mes,
        proventos_mes,
        valor_total
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (ativo_id, ano, mes)
      DO UPDATE SET
        valor_total_usd = EXCLUDED.valor_total_usd,
        cambio_fechamento = EXCLUDED.cambio_fechamento,
        valor_total_brl = EXCLUDED.valor_total_brl,
        aporte_mes = EXCLUDED.aporte_mes,
        retirada_mes = EXCLUDED.retirada_mes,
        proventos_mes = EXCLUDED.proventos_mes
    `, [
      a.id,
      ano,
      mes,
      valorUSD,
      cambio,
      valorBRL,
      a.aporte_mes || 0,
      a.retirada_mes || 0,
      a.proventos_mes || 0,
      valorBRL
    ]);

    // 🔹 NOVA REGRA DE STATUS DO ATIVO
    if (valorUSD === 0 && valorBRL === 0) {
      await pool.query(
        `UPDATE ativos SET ativo = false WHERE id = $1`,
        [a.id]
      );
    } else {
      await pool.query(
        `UPDATE ativos SET ativo = true WHERE id = $1`,
        [a.id]
      );
    }

  }

  res.sendStatus(200);
});


router.get("/:ano/:mes", async (req, res) => {
  const { ano, mes } = req.params;

  const result = await pool.query(`
    SELECT 
      a.id,
      a.nome,
      a.moeda,
      COALESCE(s.valor_total_usd, 0) AS valor_total_usd,
      COALESCE(s.cambio_fechamento, 1) AS cambio_fechamento,
      COALESCE(s.valor_total_brl, 0) AS valor_total_brl,
      COALESCE(s.aporte_mes, 0) AS aporte_mes,
      COALESCE(s.retirada_mes, 0) AS retirada_mes,
      COALESCE(s.proventos_mes, 0) AS proventos_mes
    FROM ativos a
    LEFT JOIN snapshot_mensal s
      ON s.ativo_id = a.id
      AND s.ano = $1
      AND s.mes = $2
    WHERE a.data_inicio <= make_date($1,$2,28)
    AND   a.ativo is true
    ORDER BY a.CLASSE, A.id
  `, [ano, mes]);

  res.json(result.rows);
});

export default router;