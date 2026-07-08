import express from "express";
import { pool } from "../db.js";

const router = express.Router();


// 🔹 EVOLUÇÃO MENSAL
router.get("/evolucao", async (req,res)=>{
  const { moeda = "BRL", classe } = req.query;

  const r = await pool.query(`
    SELECT
      ano,
      mes,
      SUM(
        CASE WHEN $1='USD' THEN valor_total_usd
             ELSE valor_total_brl END
      ) AS total
    FROM snapshot_mensal s
    JOIN ativos a ON a.id = s.ativo_id
    WHERE a.ativo = true
    AND ($2::text IS NULL OR a.classe = $2)
    GROUP BY ano, mes
    ORDER BY ano, mes
  `,[moeda, classe || null]);

  res.json(r.rows);
});


// 🔹 ALOCAÇÃO POR CLASSE
router.get("/classe", async (req,res)=>{
  const { moeda = "BRL", classe } = req.query;


  const r = await pool.query(`
    SELECT
      a.classe,
      SUM(
        CASE WHEN $1='USD' THEN s.valor_total_usd
             ELSE s.valor_total_brl END
      ) AS total
    FROM snapshot_mensal s
    JOIN ativos a ON a.id = s.ativo_id
    WHERE a.ativo = true
    AND (s.ano,s.mes)=(
      SELECT ano,mes FROM snapshot_mensal
      ORDER BY ano DESC, mes DESC LIMIT 1
    )
    GROUP BY a.classe
  `,[moeda]);

  res.json(r.rows);
});

// 🔹 RESUMO DA CARTEIRA
router.get("/resumo", async (req,res)=>{
  const { moeda="BRL", classe } = req.query;

  const r = await pool.query(`
    WITH ultimos AS (
      SELECT DISTINCT ON (ativo_id)
        ativo_id,
        valor_total_usd,
        valor_total_brl
      FROM snapshot_mensal
      ORDER BY ativo_id, ano DESC, mes DESC
    ),
    investido AS (
      SELECT
        s.ativo_id,
        SUM(
          CASE 
            WHEN a.classe = 'acoes_eua' OR a.classe = 'cripto'
              THEN s.aporte_mes * s.cambio_fechamento
            ELSE s.aporte_mes
          END
        ) AS investido_brl,
        SUM(s.aporte_mes) AS investido_usd
      FROM snapshot_mensal s
      JOIN ativos a ON a.id = s.ativo_id
      WHERE a.ativo = true
      AND ($2::text IS NULL OR a.classe = $2)
      GROUP BY s.ativo_id
    ),
    retirada AS (
      SELECT
        s.ativo_id,        
        SUM(s.retirada_mes) AS retirada_mes
      FROM snapshot_mensal s
      JOIN ativos a ON a.id = s.ativo_id
      WHERE a.ativo = true
      AND ($2::text IS NULL OR a.classe = $2)
      GROUP BY s.ativo_id
    )    
    SELECT
      SUM(
        CASE WHEN $1='USD' THEN i.investido_usd
             ELSE i.investido_brl END
      ) - sum(r.retirada_mes)  AS total_investido,

      SUM(
        CASE WHEN $1='USD' THEN u.valor_total_usd
             ELSE u.valor_total_brl
        END
      ) AS valor_atual
    FROM ultimos u
    JOIN investido i ON i.ativo_id = u.ativo_id
    JOIN retirada r ON r.ativo_id = u.ativo_id
  `,[moeda, classe || null]);

  const t = r.rows[0];

  const total = Number(t.total_investido) || 0;
  const atual = Number(t.valor_atual) || 0;

  const ganho = atual - total;

  const perc = total ? (ganho / total) * 100 : 0;

  res.json({
    total_investido: total,
    valor_atual: atual,
    ganho_valor: ganho,
    ganho_percentual: Number(perc.toFixed(2))
  });
});



// 🔹 RANKING
router.get("/ranking", async (req,res)=>{
  const { moeda="BRL", classe } = req.query;

  const r = await pool.query(`
    WITH ultimos AS (
      SELECT DISTINCT ON (ativo_id)
        ativo_id,
        valor_total_usd,
        valor_total_brl,
        cambio_fechamento,
        mes,
        ano,
        retirada_mes
      FROM snapshot_mensal
      ORDER BY ativo_id, ano DESC, mes DESC
    ),
    investido AS (
      SELECT
        s.ativo_id,
        SUM(
          CASE 
            WHEN a.classe = 'acoes_eua' OR a.classe = 'cripto'
              THEN s.aporte_mes * s.cambio_fechamento
            ELSE s.aporte_mes
          END
        ) AS investido_brl,
        SUM(s.aporte_mes) AS investido_usd
      FROM snapshot_mensal s
      JOIN ativos a ON a.id = s.ativo_id
      WHERE a.ativo = true
      AND ($2::text IS NULL OR a.classe = $2)
      GROUP BY s.ativo_id
    ),
    retiradas AS (
      SELECT
        s.ativo_id,
        SUM(s.retirada_mes) AS retirada_mes
      FROM snapshot_mensal s
      JOIN ativos a ON a.id = s.ativo_id
      WHERE a.ativo = true
      AND ($2::text IS NULL OR a.classe = $2)
      GROUP BY s.ativo_id
    )    
    SELECT
      a.id,
      a.nome,
      a.classe,
      DATE_PART('year', a.data_inicio) anoini,
      DATE_PART('month', a.data_inicio) mesini,
      u.ano anoult,
      u.mes mesult,
      r.retirada_mes,

      CASE WHEN $1='USD'
        THEN u.valor_total_usd
        ELSE u.valor_total_brl
      END AS valor_atual,

      CASE WHEN $1='USD'
        THEN i.investido_usd
        ELSE i.investido_brl
      END AS total_investido

    FROM ativos a
    JOIN ultimos u ON u.ativo_id = a.id
    JOIN investido i ON i.ativo_id = a.id
    JOIN retiradas r ON r.ativo_id = a.id
    WHERE a.ativo = true
    AND ($2::text IS NULL OR a.classe = $2)
    ORDER BY valor_atual DESC
  `,[moeda, classe || null]);

  res.json(r.rows);
});


// 🔹 RELATÓRIOS
router.get("/relatorios", async (req,res)=>{
  const r = await pool.query(`
    WITH ultimos AS (
      SELECT DISTINCT ON (ativo_id)
        ativo_id,
        ganho_3m,
        ganho_6m,
        ganho_12m,
        ganho_total
      FROM metricas_acumuladas m
      JOIN ativos a ON a.id = m.ativo_id
      WHERE a.ativo = true
      ORDER BY ativo_id, ano DESC, mes DESC
    )
    SELECT
      SUM(ganho_3m) AS ganho_3m,
      SUM(ganho_6m) AS ganho_6m,
      SUM(ganho_12m) AS ganho_12m,
      SUM(ganho_total) AS ganho_total
    FROM ultimos
  `);

  res.json(r.rows[0]);
});


router.get("/periodos", async (req, res) => {
  const { moeda = "BRL" } = req.query;

  const r = await pool.query(`
      WITH base AS (
        SELECT
          m.*,
          a.classe,
          ROW_NUMBER() OVER (
            PARTITION BY m.ativo_id
            ORDER BY m.ano, m.mes
          ) AS ordem,
          COUNT(*) OVER (PARTITION BY m.ativo_id) AS total_ordem
        FROM metricas_mensais m
        JOIN ativos a ON a.id = m.ativo_id
        WHERE a.ativo = true
      ),

      capital AS (
        SELECT
          ativo_id,
          ordem,

          SUM(
            CASE
              WHEN classe IN ('acoes_eua','cripto')
                THEN aporte_mes * cambio_fechamento
              ELSE aporte_mes
            END
            -
            CASE
              WHEN classe IN ('acoes_eua','cripto')
                THEN retirada_mes * cambio_fechamento
              ELSE retirada_mes
            END
          ) OVER (
            PARTITION BY ativo_id
            ORDER BY ordem
          ) AS capital_acumulado

        FROM base
      ),

      periodos_ativo AS (
        SELECT
          b.ativo_id,

          SUM(b.ganho_brl) FILTER (WHERE b.ordem >= b.total_ordem-2) AS ganho_3m,
          SUM(b.ganho_brl) FILTER (WHERE b.ordem >= b.total_ordem-5) AS ganho_6m,
          SUM(b.ganho_brl) FILTER (WHERE b.ordem >= b.total_ordem-11) AS ganho_12m,
          SUM(b.ganho_brl) AS ganho_total,

          MAX(c.capital_acumulado) FILTER (WHERE b.ordem = b.total_ordem-2) AS base_3m,
          MAX(c.capital_acumulado) FILTER (WHERE b.ordem = b.total_ordem-5) AS base_6m,
          MAX(c.capital_acumulado) FILTER (WHERE b.ordem = b.total_ordem-11) AS base_12m,
          MAX(c.capital_acumulado) FILTER (WHERE b.ordem = 1) AS base_total

        FROM base b
        JOIN capital c
          ON c.ativo_id = b.ativo_id
        AND c.ordem = b.ordem

        GROUP BY b.ativo_id
      )

      SELECT
        SUM(ganho_3m) AS ganho_3m,
        SUM(ganho_6m) AS ganho_6m,
        SUM(ganho_12m) AS ganho_12m,
        SUM(ganho_total) AS ganho_total,

        SUM(base_3m) AS base_3m,
        SUM(base_6m) AS base_6m,
        SUM(base_12m) AS base_12m,
        SUM(base_total) AS base_total

      FROM periodos_ativo;
  `);

  res.json(r.rows[0]);
});

// 🔹 EVOLUÇÃO DE APORTES
router.get("/aportes", async (req, res) => {
  const { classe } = req.query;

  const r = await pool.query(`
    SELECT
      s.ano,
      s.mes,
      SUM(
        CASE
          WHEN a.classe IN ('acoes_eua','cripto')
            THEN s.aporte_mes * s.cambio_fechamento
          ELSE s.aporte_mes
        END
      ) AS aporte_mes
    FROM snapshot_mensal s
    JOIN ativos a ON a.id = s.ativo_id
    WHERE a.ativo = true
    AND ($1::text IS NULL OR a.classe = $1)
    GROUP BY s.ano, s.mes
    ORDER BY s.ano, s.mes
  `,[classe || null]);

  res.json(r.rows);
});



export default router;