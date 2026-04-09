import express from "express";
import cors from "cors";

import ativosRoutes from "./routes/ativos.js";
import fechamentoRoutes from "./routes/fechamento.js";
import carteiraRoutes from "./routes/carteira.js";
import dashboardRoutes from "./routes/dashboard.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use("/dashboard", dashboardRoutes);

app.use("/ativos", ativosRoutes);
app.use("/fechamento", fechamentoRoutes);
app.use("/carteira", carteiraRoutes);

app.listen(3000, () => {
  console.log("Backend rodando na porta 3000");
});