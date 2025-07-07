import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

// Carrega as variáveis de ambiente definidas no arquivo .env
dotenv.config();

// Inicializa a aplicação Express
const app = express();

// Define a porta utilizada pelo servidor
const PORT = process.env.PORT || 3000;

// Inicializa o servidor na porta definida
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// ****** ROTAS PARA PÁGINAS HTML ESTÁTICAS ******
app.get("/csrf-get-attack", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "csrf-get-attack.html"));
});

app.get("/csrf-post-attack", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "csrf-post-attack.html"));
});

app.get("/csrf-post-attack-seguro", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "csrf-post-attack-seguro.html"));
});

app.use(function (_: Request, res: Response) {
  res.status(404).json({error: "Rota não encontrada"});
});
