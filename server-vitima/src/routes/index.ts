import express, { Request, Response } from "express";
import db from "./db";
import { doubleCsrf } from "csrf-csrf";

const router = express.Router();

// Configuração do CSRF usando Double Submit Cookie
const {
  doubleCsrfProtection,
  generateCsrfToken,
  invalidCsrfTokenError,
  validateRequest,
} = doubleCsrf({
  // Segredo forte; em produção, use VAR DE AMBIENTE
  getSecret: () => process.env.CSRF_SECRET || "my-very-strong-secret-key",
  // Identificador de sessão (pode ser cookie de usuário ou session id)
  getSessionIdentifier: (req) => req.cookies.user || "",
  // Nome do cookie onde o token HMAC+nonce será armazenado
  cookieName: "XSRF-TOKEN",
  // Opções do cookie
  cookieOptions: {
    sameSite: "lax",
    path: "/",
    secure: false,    // true em HTTPS de produção
    httpOnly: true,   // impede acesso via JS
  },
  // Quais métodos NÃO precisam de proteção
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  // Como extrair o token enviado pelo front (header)
  getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"] as string,
});

// Simula login e define cookie de autenticação
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const result = await db.query(
    "SELECT id FROM users WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (result.rows.length > 0) {
    // Definindo cookie de autenticação
    res.cookie("user", result.rows[0].id, {
      sameSite: "lax", // Protege contra CSRF
      secure: false, // true em produção com HTTPS
    });

    res.json({ message: "Login efetuado com sucesso!" });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Rota para gerar token CSRF
router.get("/csrf-token", (req: Request, res: Response) => {
  const user = req.cookies.user;
  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }
  
  // generateCsrfToken define automaticamente o cookie XSRF-TOKEN e retorna o token
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

// Rota vulnerável a CSRF
// http://atacante.local:3002/csrf-get-attack
router.post("/contact", async (req: Request, res: Response) => {
  const { name, phone } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
  } else if (!name || !phone) {
    res.status(400).json({ error: "Nome e telefone são necessários" });
  } else {
    console.log(
      `Registrando contato: ${name}, ${phone} para o usuário: ${user}`
    );
    await db.query(
      "INSERT INTO contacts(user_id, name, phone) VALUES($1,$2,$3)",
      [user, name, phone]
    );

    res.json({ message: "Contato registrado com sucesso" });
  }
});

// Rota vulnerável a CSRF
// Teste rodando em outro servidor, por exemplo:
// http://atacante.local:3002/csrf-post-attack
router.post("/change-password", async (req: Request, res: Response) => {
  const { password } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
  } else if (!password) {
    res.status(400).json({ error: "Senha não fornecida" });
  } else {
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      password,
      user,
    ]);

    res.json({ message: "Senha alterada com sucesso" });
  }
});

// http://atacante.local:3002/csrf-post-attack-seguro
router.post("/change-password-segura", async (req: Request, res: Response) => {
  if (!req.headers.origin?.startsWith("http://vitima.local:3001")) {
    res.status(403).json({ error: "Requisição inválida" });
  } else {
    const { password } = req.body;
    const user = req.cookies.user;

    if (!user) {
      res.status(401).json({ error: "Usuário não autenticado" });
    } else if (!password) {
      res.status(400).json({ error: "Senha não fornecida" });
    } else {
      await db.query("UPDATE users SET password = $1 WHERE id = $2", [
        password,
        user,
      ]);

      res.json({ message: "Senha alterada com sucesso" });
    }
  }
});

// Wrapper para capturar erros CSRF e retornar JSON
const csrfProtectionWrapper = (req: Request, res: Response, next: any) => {
  doubleCsrfProtection(req, res, (error: any) => {
    if (error) {
      // Se houver erro CSRF, retorna JSON em vez de HTML
      return res.status(403).json({ error: "Token CSRF inválido ou ausente" });
    }
    next();
  });
};

// Parte da resposta do Exercício 3 - Protegida contra CSRF
router.post("/change-password-exer03", csrfProtectionWrapper, async (req: Request, res: Response) => {
  const { password, currentPassword } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
  } else if (!password || !currentPassword) {
    res.status(400).json({ error: "Preencha todos os campos" });
  } else {
    const result = await db.query(
      "SELECT * FROM users WHERE id = $1 AND password = $2",
      [user, currentPassword]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ error: "Senha atual incorreta" });
    } else {
      await db.query(
        "UPDATE users SET password = $1 WHERE id = $2", 
        [password,user]
      );

      res.json({ message: "Senha alterada com sucesso" });
    }
  }
});

export default router;
