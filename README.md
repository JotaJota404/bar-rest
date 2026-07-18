# 🍺 Buteco da Gente - Sistema PDV Web

Bem-vindo ao repositório do **Buteco da Gente**, um sistema PDV voltado para bares e restaurantes com arquitetura enxuta e fluxo mobile-first.

## 🚀 Tecnologias Utilizadas
- **Frontend**: React 19, Vite, TailwindCSS v4
- **Backend**: Spring Boot 3, Java 17, Spring Security (JWT)
- **Banco de Dados**: PostgreSQL 15
- **Infraestrutura**: Docker Compose, Amazon EC2, Vercel

## 📁 Estrutura do Projeto
O repositório está organizado como um *Monorepo*:
- `/frontend` - SPA em React (foco na operação do Garçom e Caixa).
- `/backend` - API RESTful em Spring Boot.
- `/infra` - Configurações de Docker, Nginx e scripts SQL (banco de dados).

## 🛠️ Como rodar o projeto localmente

### 1. Frontend (Interface)
Certifique-se de ter o Node.js instalado (v20+).
```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:5173`. O sistema iniciará com um Mock (dados fictícios) no ambiente de desenvolvimento inicial.

### 2. Backend & Banco de Dados (Via Docker)
Certifique-se de ter o Docker e Docker Compose instalados.
```bash
cd infra
docker compose up -d
```
O banco PostgreSQL será iniciado na porta 5432 (rede interna do docker) e a API na porta 8080.

## 🔐 Segurança e Variáveis de Ambiente
Nenhum dado sensível (senhas reais, tokens JWT de produção) deve ser subido para o repositório. O projeto utiliza variáveis de ambiente (arquivos `.env`) para lidar com as credenciais em cada ambiente.
