# Manual Técnico de Desenvolvimento — Sistema PDV Web "Buteco da Gente"

> **Nota de uso:** este documento é o contexto de referência único para uma IA de desenvolvimento (agente de IDE) construir o projeto do zero. Segue as fases na ordem apresentada, respeita o "Definition of Done" de cada fase antes de avançar para a próxima, e usa exatamente os nomes de pastas, entidades, endpoints e convenções descritos aqui — não inventar estrutura alternativa.

**Versão 2.0 · Julho de 2026**

Versão enxuta de rápida produção: acesso restrito a cadastrados, controle de garçom e caixa, frontend na Vercel e backend + banco de dados em uma única instância Amazon EC2.

Esta versão substitui a v1.0 (multi-cloud: Vercel + Railway/Render + Supabase) por uma arquitetura enxuta de menor custo mensal: um único servidor Amazon EC2 hospeda backend e banco de dados via Docker Compose, e a Vercel hospeda apenas o frontend. O escopo foi reduzido ao essencial: login restrito, comandas do garçom e fechamento no caixa — **sem** tela de gestão de cardápio.

---

## 1. Introdução e Como Usar Este Documento

Este documento é o guia único para executar o projeto PDV Web (sistema de comandas para bar/restaurante) do zero: desde a criação do ambiente, passando pela codificação do backend e frontend, até o deploy em produção e a configuração completa da impressora térmica na máquina do caixa.

Decisões de arquitetura que priorizam simplicidade operacional e economia:

- **Escopo reduzido ao essencial:** uma página inicial bloqueada (só acessa quem está cadastrado), o controle do garçom (mapa de mesas e comandas) e o controle do caixa (fechamento e divisão de conta). **Não há tela de administração de cardápio.**
- **Sem múltiplos provedores de nuvem:** em vez de Vercel + Railway/Render + Supabase, o backend e o banco de dados PostgreSQL rodam juntos em uma única instância Amazon EC2, via Docker Compose. Só a Vercel fica de fora, hospedando o frontend.
- **Cadastro de produtos direto no banco de dados** (via script SQL/DBeaver), sem tela própria — reduz escopo de desenvolvimento sem travar a operação.
- **A impressão térmica (QZ Tray)** continua no escopo, pois é essencial para a operação do caixa.

O fluxo de execução define fases sequenciais e verificáveis, cada uma com critério de "pronto" (*Definition of Done*), para que o trabalho possa ser retomado em qualquer ponto sabendo exatamente o que falta.

> ⚠ **Convenção:** todo bloco de código é um comando de terminal, trecho de configuração ou código-fonte para usar/copiar exatamente como está (ajustando apenas segredos e domínios).

---

## 2. Visão Geral do Sistema

O sistema é uma SPA (Single Page Application) com backend RESTful e acesso totalmente restrito: a página inicial fica bloqueada por login, **sem cadastro público** — só entra quem já existe como `Usuario` no banco de dados (criado manualmente pelo administrador). Após o login, o sistema tem dois perfis com formas de acesso distintas:

| Ator | Dispositivo | Principais ações |
|---|---|---|
| Garçom | Celular / tablet (navegador) | Login seguro, visualizar mapa de mesas, lançar pedidos com observação |
| Caixa / Admin | PC / notebook local | Fechar e dividir conta, imprimir comanda |

### 2.1 Casos de uso (escopo enxuto)

- Fazer login seguro — página inicial bloqueada; autenticação com emissão de token JWT; sem cadastro público.
- Visualizar mapa de mesas — status Livre / Ocupada em tempo real.
- Lançar pedidos — com campo de observação por item, consultando os produtos ativos já cadastrados no banco.
- Imprimir comanda — integração local via QZ Tray (USB).
- Fechar e dividir conta — soma de itens + taxas, divisão por nº de pessoas.

> ⚠ **Fora do escopo desta versão:** tela de gerenciamento de cardápio e autocadastro de usuários. Produtos e usuários (garçom/caixa) são cadastrados diretamente no banco de dados via SQL — ver seção 7.6.

### 2.2 Modelagem de domínio

Entidades principais que devem ser mapeadas como `@Entity` no Hibernate/JPA:

| Entidade | Atributos principais | Relacionamentos |
|---|---|---|
| `Usuario` | id, nome, pin (hash), role (ADMIN, GARCOM) | autentica e cria ItensComanda |
| `Mesa` | id, numero, status (LIVRE, OCUPADA) | 1 Mesa → 0..1 Comanda aberta |
| `Comanda` | id, dataAbertura, status, mesa | 1 Comanda → 1..* ItemComanda |
| `Produto` | id, nome, preco, categoria (COMIDA, BEBIDA), ativo | referenciado por ItemComanda |
| `ItemComanda` | id, quantidade, precoUnitario, observacao, produto, usuario, comanda | N:1 com Produto, Usuario e Comanda |

Métodos de negócio centrais:
- `Mesa.abrirComanda()`
- `Mesa.liberarMesa()`
- `Comanda.adicionarItem()`
- `Comanda.calcularTotal()`
- `Comanda.fecharComanda()`
- `ItemComanda.calcularSubtotal()`
- `Produto.atualizarPreco()`

### 2.3 Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Security (JWT), Hibernate/JPA |
| Frontend | React + Vite, TailwindCSS, Axios |
| Banco de dados | PostgreSQL |
| Hardware | QZ Tray (impressão térmica ESC/POS via USB) |
| Hospedagem | Frontend: Vercel · Backend + Banco: única instância Amazon EC2 (Docker Compose) |

> ⚠ **Arquitetura enxuta:** um único servidor EC2 concentra o backend Spring Boot e o PostgreSQL, ambos como containers Docker no mesmo Docker Compose. Isso elimina a mensalidade de provedores separados de backend e banco (Railway/Render/Supabase) — trade-off consciente: menor custo e menos peças móveis, em troca de escalabilidade mais limitada (aceitável para o porte deste cliente).

---

## 3. Preparação do Ambiente de Desenvolvimento

Antes de escrever a primeira linha de código, o ambiente local deve estar instalado e validado. Este passo deve ser concluído antes da Fase 1 do roadmap (seção 6).

### 3.1 Softwares obrigatórios

| Ferramenta | Versão | Finalidade |
|---|---|---|
| Git | atual | controle de versão |
| Java JDK | 17+ | compilar/rodar o backend Spring Boot |
| IntelliJ IDEA ou Eclipse | atual | IDE backend |
| Node.js | LTS 20+ | rodar o frontend Vite/React |
| VS Code | atual | IDE frontend |
| PostgreSQL | 15+ | banco de dados local |
| DBeaver ou pgAdmin | atual | administração visual do banco |
| QZ Tray (versão gratuita) | atual | impressão térmica local, na máquina que testa hardware |

### 3.2 Contas externas a criar (uma vez, pelo responsável de infraestrutura)

Contas de nuvem usadas apenas na Fase 7 (Deploy), mas o ideal é criá-las com antecedência:

- **GitHub** — repositório remoto e Pull Requests.
- **Vercel** — hospedagem do frontend.
- **AWS (Amazon Web Services)** — uma instância EC2 hospedará backend e banco de dados juntos.

> ⚠ Use o e-mail institucional do projeto para todas as contas de nuvem, não e-mails pessoais, para evitar perda de acesso quando alguém sair do time. Na AWS, ative o MFA (autenticação em dois fatores) na conta root e crie um usuário IAM separado para uso do dia a dia.

---

## 4. Estrutura de Repositório e Pastas (Obrigatória)

Repositório único (monorepo) com três pastas na raiz:

```
/backend (Spring Boot)
├── src/main/java/com/pdv/
│   ├── config/        (Filtros JWT, Beans, CORS)
│   ├── controllers/   (Endpoints REST)
│   ├── dtos/           (Records ou classes de transferência)
│   ├── models/         (Entidades JPA)
│   ├── repositories/   (Interfaces Spring Data)
│   └── services/        (Regras de negócio)
│   └── resources/application.properties

/frontend (React/Vite)
├── src/
│   ├── assets/        (Imagens, ícones globais)
│   ├── components/     (Botões, Modais, Cards genéricos)
│   ├── pages/           (Login, Mesas, Pedidos)
│   ├── services/        (Axios e QZ Tray)
│   └── utils/            (formatação de moeda/data)
└── package.json

/infra (Deploy e provisionamento)
├── docker-compose.yml  (serviços backend + postgres)
├── nginx/               (reverse proxy e config. SSL)
└── sql/                  (scripts de cadastro de usuários e produtos)
```

---

## 5. Padrões de Código

### 5.1 Backend (Java / Spring Boot)

1. **DTOs são obrigatórios** — nunca retorne a entidade (Model) diretamente no Controller. Evita loops infinitos no JSON e protege dados sensíveis.
2. **Controller "burro"** — toda regra de negócio (cálculo de preço, verificação de mesa aberta, etc.) fica na camada `@Service`.
3. **Nomenclatura** — métodos e variáveis em `camelCase` (`abrirComanda`); classes em `PascalCase` (`ItemComanda`).

### 5.2 Frontend (React)

4. **Componentes funcionais e Hooks** (`useState`, `useEffect`). Proibido usar classes de ciclo de vida antigas.
5. **API centralizada** — todas as requisições passam por uma instância pré-configurada do Axios em `/services/api.js`, que injeta o token JWT no cabeçalho.
6. **Mobile-first** — telas de lançamento do garçom desenhadas primeiro para celular, com classes Tailwind (`flex-col`, `w-full`).

---

## 6. Roadmap de Execução (Fluxo Sequencial)

Fases técnicas encadeadas: cada fase só começa quando a anterior está com seu "Definition of Done" cumprido. Isso evita retrabalho e deixa claro o que falta a qualquer momento.

### Fase 1 — Setup do repositório e do ambiente

- Criar repositório no GitHub, proteger a branch `main` exigindo Pull Request.
- Gerar o projeto backend no Spring Initializr com: Spring Web, Spring Data JPA, PostgreSQL Driver, Spring Security. Subir em `/backend`.
- Rodar `npm create vite@latest frontend -- --template react`, instalar TailwindCSS e Axios. Subir em `/frontend`.
- Subir o backend e o frontend localmente e confirmar que ambos rodam sem erro de configuração.

**Definition of Done:** é possível clonar o repositório, rodar back e front localmente e acessar o Postgres local sem erros.

### Fase 2 — Banco de dados e domínio

- Modelar as tabelas `Mesa`, `Produto`, `Comanda`, `ItemComanda` e `Usuario` (ver seção 2.2).
- Definir os relacionamentos JPA (`@OneToMany`, `@ManyToOne`) e os Enums (`RoleEnum`, `StatusMesa`, `Categoria`).
- Deixar o Hibernate gerar as tabelas em modo update para desenvolvimento local (`ddl-auto=update`).
- Criar o script SQL de seed (`/infra/sql/seed.sql`) com os primeiros usuários (garçom/caixa) e produtos do cardápio, para reutilizar depois em produção.

**Definition of Done:** as entidades sobem sem erro e é possível inserir e consultar registros via DBeaver/pgAdmin.

### Fase 3 — Backend: autenticação e APIs REST

- Implementar autenticação por PIN com emissão de token JWT (Spring Security), **sem endpoint de autocadastro** — usuários só existem se inseridos direto no banco.
- Criar os endpoints REST: listar mesas, abrir comanda, adicionar item (com campo `observacao`), calcular total, fechar comanda, listar produtos ativos (somente leitura — sem CRUD de cardápio).
- Aplicar DTOs em todas as respostas — nunca expor a entidade JPA diretamente.
- Configurar CORS liberando a origem do frontend local (e depois a de produção na Vercel).

**Definition of Done:** todos os endpoints testados via Postman/Insomnia, com autenticação funcionando e respostas em formato DTO.

### Fase 4 — Frontend: telas principais

- Página inicial bloqueada: qualquer rota exige login válido; sem login redireciona sempre para a tela de autenticação.
- Tela de login (PIN) consumindo o endpoint de autenticação e armazenando o token.
- Tela de mapa de mesas (Livre/Ocupada).
- Tela de lançamento de pedidos do garçom, com campo de observação, mobile-first.
- Tela do caixa: fechamento e divisão de conta.

*Sem tela de gerenciamento de cardápio nesta versão — produtos são cadastrados/ativados direto no banco (seção 7.6).*

**Definition of Done:** fluxo completo — login, abrir mesa, lançar pedido, fechar conta — funciona ponta a ponta em ambiente local, e nenhuma rota é acessível sem login.

### Fase 5 — Integração da impressora (QZ Tray) em ambiente local

- Instalar a biblioteca do QZ Tray no React.
- Criar a função que captura a confirmação do pedido e envia a string em formato ESC/POS para a impressora configurada, sem caixas de diálogo.
- Testar localmente com o QZ Tray rodando em segundo plano na máquina do caixa.

**Definition of Done:** comanda impressa corretamente na térmica local ao confirmar um pedido de teste.

### Fase 6 — Testes integrados e homologação interna

- Testar os fluxos completos com múltiplos usuários simultâneos (garçom + caixa).
- Validar casos de borda: mesa já ocupada, item sem observação, divisão de conta com resto (ex.: total não divisível igualmente).
- Revisão de código cruzada (Pull Request revisado antes do merge em `main`).

**Definition of Done:** checklist de aceite interno (seção 10) todo marcado antes de seguir para o deploy.

### Fase 7 — Deploy em produção (EC2 + Vercel)

- Provisionar a instância Amazon EC2 (seção 7.1).
- Instalar Docker e subir backend + PostgreSQL juntos via Docker Compose (seção 7.2 a 7.4).
- Configurar Nginx e HTTPS na frente do backend (seção 7.5).
- Cadastrar usuários e produtos reais direto no banco (seção 7.6).
- Publicar o frontend na Vercel apontando para a API do EC2 (seção 7.7).

**Definition of Done:** sistema acessível publicamente, front na Vercel conversando com o back no EC2 via HTTPS, sem dados de teste locais.

### Fase 8 — Configuração da impressora em produção

- Instalar o QZ Tray definitivo na máquina do caixa do estabelecimento (não é mais a máquina de um dev).
- Assinar digitalmente as requisições (certificado) para eliminar os pop-ups de segurança em produção (seção 8.2).
- Configurar o QZ Tray para iniciar automaticamente com o Windows.

**Definition of Done:** comanda real impressa a partir do sistema em produção, sem intervenção manual no QZ Tray.

### Fase 9 — Go-live e acompanhamento

- Cadastro real do cardápio, das mesas e dos usuários (garçom/caixa) do estabelecimento, direto no banco via script SQL (seção 7.6).
- Treinamento rápido do garçom e do caixa no uso do sistema.
- Acompanhamento próximo (plantão) durante o primeiro dia de operação real.

**Definition of Done:** um turno completo de operação real sem falhas críticas.

---

## 7. Deploy Detalhado, Passo a Passo (EC2 + Vercel)

Esta seção assume que o código já passou pela Fase 6 (testes locais aprovados). Arquitetura de produção enxuta: um único servidor Amazon EC2 roda dois containers Docker — backend (Spring Boot) e banco de dados (PostgreSQL) — orquestrados por um único `docker-compose.yml`. A Vercel cuida só do frontend. A ordem importa: **EC2 no ar → backend respondendo → frontend publicado apontando para ele.**

### 7.1 Provisionar a instância Amazon EC2

1. Criar conta AWS (ou usar a já existente) e acessar o console do EC2.
2. Lançar uma nova instância: **Ubuntu Server 22.04 LTS**, tipo **t3.small** (equilíbrio custo/desempenho para rodar backend + Postgres juntos; `t3.micro` é o mínimo aceitável em fase inicial de baixo volume).
3. Criar (ou reutilizar) um par de chaves SSH e guardar o arquivo `.pem` em local seguro — é a única forma de acessar o servidor.
4. Configurar o Security Group (firewall da AWS) liberando apenas: porta 22 (SSH, restrita ao IP de quem administra), porta 80 (HTTP) e porta 443 (HTTPS). **Nunca expor a porta do Postgres (5432) publicamente.**
5. Associar um Elastic IP à instância — garante que o IP público não muda se o servidor for reiniciado (o Elastic IP é gratuito enquanto estiver associado a uma instância em execução).
6. (Opcional, recomendado) Apontar um subdomínio do cliente para esse Elastic IP (ex.: `api.butecodagente.com.br`), via registro DNS tipo A — facilita o HTTPS na seção 7.4.

### 7.2 Instalar Docker e Docker Compose no servidor

Conectar via SSH:

```bash
ssh -i chave.pem ubuntu@<Elastic IP>
```

Atualizar o sistema e instalar o Docker:

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install -y docker-compose-plugin
```

Sair e reconectar via SSH para aplicar a permissão de grupo do Docker.

Clonar o repositório do projeto dentro do servidor:

```bash
git clone <url-do-repo> app && cd app
```

### 7.3 `docker-compose.yml` (backend + banco na mesma instância)

Arquivo único em `/infra/docker-compose.yml`, subindo os dois serviços juntos:

```yaml
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: pdv
      POSTGRES_USER: pdv_user
      POSTGRES_PASSWORD: <senha-forte-de-producao>
    volumes:
      - pgdata:/var/lib/postgresql/data
    # sem 'ports' expostas publicamente — só a rede interna do compose

  backend:
    build: ../backend
    restart: always
    depends_on:
      - postgres
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/pdv
      SPRING_DATASOURCE_USERNAME: pdv_user
      SPRING_DATASOURCE_PASSWORD: <senha-forte-de-producao>
      JWT_SECRET: <chave-secreta-so-de-producao>
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8080:8080"

volumes:
  pgdata:
```

Criar `application-prod.properties` no backend com `ddl-auto=validate` (**nunca `update` em produção**, para não alterar o schema real sem controle).

Subir os dois serviços:

```bash
cd infra && docker compose up -d --build
```

Conferir que ambos os containers estão de pé:

```bash
docker compose ps
```

`restart: always` garante que, se o servidor reiniciar (ex.: manutenção da AWS), backend e banco voltam sozinhos, sem intervenção manual.

### 7.4 Nginx como reverse proxy e HTTPS (Certbot)

O backend roda na porta 8080 dentro do servidor; o Nginx expõe esse serviço publicamente nas portas 80/443 com certificado SSL gratuito.

Instalar Nginx e Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Criar `/etc/nginx/sites-available/pdv` com um `proxy_pass` para `localhost:8080`, e ativar com um link em `sites-enabled`.

Gerar o certificado HTTPS gratuito apontando para o domínio configurado:

```bash
sudo certbot --nginx -d api.butecodagente.com.br
```

O Certbot renova o certificado automaticamente (cron/systemd timer já vem configurado pela instalação).

Testar: acessar `https://api.butecodagente.com.br/api/mesas` pelo navegador e confirmar resposta do backend, com cadeado válido.

### 7.5 Backups e resiliência do banco (essencial, sem plataforma gerenciada)

Como o Postgres não está mais em um provedor gerenciado, o backup passa a ser responsabilidade do próprio servidor: configurar um cron diário rodando `pg_dump` para um arquivo local (e, idealmente, copiando esse arquivo para o Amazon S3 ou outro armazenamento externo).

```bash
# Exemplo de linha de cron (todo dia às 3h da manhã)
0 3 * * * docker exec <container_postgres> pg_dump -U pdv_user pdv > /home/ubuntu/backups/pdv_$(date +\%F).sql
```

Manter os backups dos últimos 7 a 14 dias e apagar os mais antigos automaticamente (rotação simples via `find ... -mtime +14 -delete`).

### 7.6 Cadastro de usuários e produtos direto no banco

Sem tela de administração nesta versão: usuários (garçom/caixa) e produtos do cardápio são inseridos por script SQL, executado uma vez na implantação e sempre que o cliente pedir um ajuste de cardápio.

```sql
-- Exemplo: cadastro de usuário (pin já em hash) e produto
INSERT INTO usuario (nome, pin, role)
VALUES ('João Garçom', '<hash-do-pin>', 'GARCOM');

INSERT INTO produto (nome, preco, categoria, ativo)
VALUES ('Chopp 300ml', 9.90, 'BEBIDA', true);
```

Conectar ao Postgres do servidor via túnel SSH (sem expor a porta 5432 publicamente):

```bash
ssh -i chave.pem -L 5432:localhost:5432 ubuntu@<Elastic IP>
```

Com o túnel aberto, conectar o DBeaver/pgAdmin local em `localhost:5432` normalmente e rodar os scripts de `/infra/sql/`.

> ⚠ Esse fluxo manual é aceitável para o volume atual do cliente. Se o cardápio começar a mudar com muita frequência, vale reavaliar a criação de uma tela simples de cardápio no futuro.

### 7.7 Frontend React (Vercel)

1. Criar conta em vercel.com com o e-mail institucional (login via GitHub facilita a integração).
2. No painel da Vercel, clicar em "Add New Project" e importar o repositório do GitHub.
3. Definir o **Root Directory** do projeto como `frontend` (essencial em monorepo, senão a Vercel tenta buildar a raiz errada).
4. **Framework Preset:** Vite. **Build Command:** `npm run build`. **Output Directory:** `dist`.
5. Cadastrar a variável de ambiente que aponta para a API no EC2:

```
VITE_API_URL=https://api.butecodagente.com.br/api
```

6. Clicar em Deploy. A Vercel gera automaticamente uma URL pública (ex.: `https://pdv-buteco.vercel.app`).
7. Testar o login real pela URL pública, confirmando que o frontend (Vercel) está se comunicando com o backend (EC2) via HTTPS.
8. (Opcional) Configurar um domínio próprio em Settings → Domains, apontando o DNS do domínio do estabelecimento.

### 7.8 Segurança e variáveis de ambiente

- Nunca commitar senhas, strings de conexão ou o `JWT_SECRET` no repositório — usar sempre variáveis de ambiente do `docker-compose.yml` (ou um arquivo `.env` fora do Git, referenciado por ele).
- Gerar um `JWT_SECRET` exclusivo de produção, diferente do usado em desenvolvimento local.
- No backend, restringir o CORS apenas à URL de produção da Vercel (e ao domínio próprio, se houver), removendo o `localhost` antes do go-live.
- HTTPS sempre via Nginx + Certbot (seção 7.4) — nunca operar login/senha em HTTP puro.
- Manter o servidor atualizado: `sudo apt update && sudo apt upgrade` periodicamente, e restringir o SSH por IP sempre que possível.

---

## 8. Configuração da Impressora Térmica (QZ Tray) em Produção

Esta é a etapa que diferencia um ambiente de teste de um ambiente real: a máquina do caixa do estabelecimento precisa ter o QZ Tray instalado e configurado para imprimir silenciosamente, sem pop-ups, sempre que o sistema web enviar uma comanda.

### 8.1 Instalação na máquina do caixa

1. Baixar o instalador oficial do QZ Tray (versão estável, não a de desenvolvimento) em `qz.io`.
2. Instalar no PC/notebook que ficará fixo no caixa, conectado à impressora térmica via USB.
3. Conectar a impressora térmica, instalar o driver do fabricante (se exigido pelo Windows) e confirmar que ela aparece em Painel de Controle → Dispositivos e Impressoras.
4. Abrir o QZ Tray uma vez manualmente e confirmar, pelo ícone na bandeja do sistema, que ele está "Ativo" e enxergando a impressora.

### 8.2 Certificado digital (eliminar pop-ups de segurança)

Por padrão, o navegador exibe um pop-up de confirmação toda vez que o site tenta imprimir via QZ Tray. Em produção isso trava o fluxo do caixa. A solução é assinar digitalmente as requisições:

1. Gerar (ou comprar) um certificado digital e sua chave privada dedicados ao QZ Tray, seguindo o guia oficial de "Signing Requests" da documentação do QZ Tray.
2. No backend (ou em uma função serverless dedicada), implementar o endpoint que assina cada requisição do QZ Tray com a chave privada (o QZ Tray nunca deve receber a chave privada diretamente no frontend).
3. No frontend, configurar `qz.security.setCertificatePromise()` e `qz.security.setSignaturePromise()` apontando para esse endpoint de assinatura.
4. Reiniciar o QZ Tray e testar: a impressão deve ocorrer sem qualquer pop-up de confirmação.

> ⚠ Sem esse certificado, o sistema funciona, mas o caixa terá que clicar em "Permitir" a cada comanda — inaceitável no dia a dia. Não pule esta etapa antes do go-live.

### 8.3 Inicialização automática com o Windows

- Nas configurações do QZ Tray, ativar a opção "Iniciar com o sistema" (Auto-start).
- Confirmar que o ícone do QZ Tray aparece automaticamente na bandeja após reiniciar o PC, sem necessidade de login manual em nenhum programa.
- Configurar o Windows para não entrar em suspensão automática durante o horário de funcionamento do estabelecimento (Painel de Controle → Opções de Energia).

### 8.4 Testes de impressão e checklist de hardware

| Verificação | Como testar |
|---|---|
| Impressora reconhecida pelo Windows | Painel de Controle → Dispositivos e Impressoras |
| QZ Tray ativo | Ícone verde/ativo na bandeja do sistema |
| Conexão do frontend com QZ Tray | `qz.websocket.connect()` retorna sucesso no console do navegador |
| Impressão sem pop-up | Confirmar um pedido de teste real e observar se não aparece nenhuma caixa de diálogo |
| Corte automático / formatação ESC/POS | Conferir se o cupom sai formatado (fonte, largura, corte de papel) igual ao padrão da casa |
| Recuperação após queda de energia | Desligar e religar o PC do caixa e confirmar que tudo volta a funcionar sozinho |

### 8.5 Troubleshooting comum

- **QZ Tray "não encontrado" no navegador:** confirmar que o programa está rodando em segundo plano e que a porta local (padrão 8181/8182) não está bloqueada por firewall/antivírus.
- **Pop-up de segurança continua aparecendo:** revisar a assinatura de certificado (seção 8.2) — geralmente é chave privada incorreta ou endpoint de assinatura fora do ar.
- **Cupom sai com caracteres estranhos:** revisar a codificação (charset) usada no comando ESC/POS enviado pelo frontend.
- **Impressora não aparece na lista do QZ Tray:** reinstalar o driver do fabricante e reconectar o cabo USB antes de reiniciar o QZ Tray.

---

## 9. Fluxo de Trabalho Git

1. Clonar o repositório principal.
2. Criar uma branch a partir da `main`:

```bash
git checkout -b feat/nova-tela
```

3. Commitar com mensagens claras e no padrão Conventional Commits:

```
feat: adicionado modal de observação
```

4. Abrir o Pull Request para `main`, com pelo menos 1 revisão aprovada antes do merge (branch `main` protegida).
5. Após o merge, a branch é apagada e o deploy automático (CI/CD da Vercel/Railway) publica a nova versão.

---

## 10. Checklist Final de Entrega (Definition of Done Geral)

- [ ] Repositório organizado conforme a estrutura obrigatória (seção 4), incluindo a pasta `/infra`.
- [ ] Página inicial bloqueada: nenhuma rota do frontend acessível sem login válido.
- [ ] Todos os endpoints protegidos por JWT e retornando DTOs; sem endpoint de autocadastro.
- [ ] Fluxo completo testado: login → mapa de mesas → lançar pedido → fechar/dividir conta.
- [ ] Instância EC2 no ar, com Elastic IP, Security Group restrito (22/80/443) e Docker instalado.
- [ ] `docker-compose.yml` subindo backend + Postgres juntos, ambos com `restart: always`.
- [ ] `ddl-auto=validate` em produção (nunca `update`).
- [ ] Nginx + Certbot configurados, backend acessível via HTTPS.
- [ ] Rotina de backup do Postgres (cron + pg_dump) configurada e testada.
- [ ] Usuários (garçom/caixa) e produtos reais cadastrados via SQL direto no banco.
- [ ] Frontend publicado na Vercel, apontando para a URL HTTPS do backend no EC2, com CORS restrito.
- [ ] QZ Tray instalado na máquina real do caixa, com certificado assinado (sem pop-ups).
- [ ] QZ Tray configurado para iniciar automaticamente com o Windows.
- [ ] Teste de impressão real aprovado, incluindo religar o PC do zero.
- [ ] Treinamento do garçom e do caixa realizado.
- [ ] Acompanhamento do primeiro turno de operação real concluído sem falhas críticas.

---

## 11. Glossário Rápido

| Termo | Significado |
|---|---|
| SPA | Single Page Application — aplicação web que carrega uma única página e atualiza o conteúdo dinamicamente |
| JWT | JSON Web Token — token usado para autenticação sem sessão no servidor |
| DTO | Data Transfer Object — objeto usado para trocar dados entre camadas sem expor a entidade do banco |
| ESC/POS | Padrão de comandos usado por impressoras térmicas para formatar o cupom |
| QZ Tray | Software que permite que uma página web imprima diretamente em impressoras locais (USB) sem diálogos do navegador |
| CORS | Cross-Origin Resource Sharing — mecanismo que controla quais domínios podem chamar a API |
| CI/CD | Integração/Entrega contínua — publicação automática a cada merge aprovado |
| EC2 | Amazon Elastic Compute Cloud — serviço da AWS que fornece um servidor virtual (instância) onde rodamos backend e banco |
| Docker / Docker Compose | Tecnologia que empacota a aplicação em containers isolados; o Compose orquestra vários containers (ex.: backend + banco) a partir de um único arquivo |
| Elastic IP | Endereço IP público fixo da AWS, associado à instância EC2 para que o endereço não mude a cada reinício |
| Security Group | Firewall da AWS que controla quais portas/IPs podem acessar a instância EC2 |
| Nginx | Servidor web usado como reverse proxy, recebendo as requisições HTTPS e repassando para o backend |
| Certbot | Ferramenta gratuita que emite e renova automaticamente certificados HTTPS (Let's Encrypt) |
| SSH | Protocolo seguro usado para acessar remotamente o terminal da instância EC2 |
