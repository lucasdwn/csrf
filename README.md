## CSRF – Demonstração de Ataque e Mitigação

Este projeto tem como objetivo demonstrar, de forma prática, a vulnerabilidade Cross-Site Request Forgery (CSRF) em aplicações web. A estrutura do projeto está dividida em dois servidores:
- server-vitima: aplicação vulnerável que simula funcionalidades reais de um sistema web (login, alteração de senha, cadastro de contatos);
- server-ataque: aplicação controlada pelo atacante, utilizada para forjar requisições maliciosas contra o sistema vítima.

### 📁 Estrutura do projeto
```
├── server-vitima/
│   ├── public/
│   │   └── login.html
│   ├── src/
│   │   ├── routes/
│   │   │   ├── db.ts
│   │   │   └── index.ts
│   │   ├── comandos.sql
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── server-ataque/
    ├── public/
    │   ├── csrf-get-attack.html
    │   ├── csrf-post-attack-seguro.html
    │   └── csrf-post-attack.html
    ├── src/
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

### Como executar o projeto

1. Clonando o repositório e instalando as dependências
```
git clone http://github.com/arleysouza/csrf.git server
cd server/server-vitima
npm i
cd ..
cd server/server-ataque
npm i
```

2. Configurando o BD PostgreSQL
- Crie um BD chamado `bdaula` no PostgreSQL (ou outro nome de sua preferência);
- Atualize o arquivo `.env` com os dados de acesso ao banco;

3. Execute os comandos SQL presentes no arquivo `server-vitima/src/comandos.sql` para criar as tabelas necessárias;

4. Iniciando o servidor
Será necessário executar o comando a seguir em cada um dos servidores (vítima e ataaque):
```
npm start
npm run dev
```
