# NLW Agents

Projeto desenvolvido durante a Next Level Week (NLW) da Rocketseat para criar uma API para gerenciamento de agentes.

## Tecnologias Utilizadas

*   **Node.js:** Ambiente de execução JavaScript.
*   **Fastify:** Framework web para Node.js, focado em performance e baixo overhead.
*   **PostgreSQL:** Banco de dados relacional.
*   **Drizzle ORM:** ORM (Object-Relational Mapper) para interagir com o banco de dados PostgreSQL.
*   **Zod:** Biblioteca para declaração e validação de schemas.
*   **Docker:** Plataforma para executar aplicações em containers.
*   **Biome:** Ferramenta para formatar e linter o código.

## Padrões de Projeto

*   **Clean Architecture:** O projeto busca separar as responsabilidades em camadas (domínio, aplicação, infraestrutura) para facilitar a manutenção e testabilidade.
*   **API REST:** A API segue os princípios REST para comunicação.

## Configuração do Projeto

1.  **Pré-requisitos:**
    *   Node.js (v18 ou superior)
    *   Docker
    *   pnpm

2.  **Instalação:**

    ```bash
    git clone <SEU_REPOSITÓRIO>
    cd nlw-agents
    pnpm install
    ```

3.  **Configuração do Banco de Dados:**

    *   Copie o arquivo `.env.example` para `.env`:

        ```bash
        cp .env.example .env
        ```

    *   Preencha as variáveis de ambiente no arquivo `.env` com as configurações do seu banco de dados PostgreSQL.

4.  **Executando o Banco de Dados com Docker:**

    ```bash
    docker-compose up -d
    ```

5.  **Executando as Migrações:**

    ```bash
    pnpm db:push
    ```

6.  **Seed do Banco de Dados (opcional):**

    ```bash
    pnpm db:seed
    ```

7.  **Executando o Servidor:**

    ```bash
    pnpm dev
    ```

A API estará disponível em `http://localhost:3333`. A interface do Swagger para documentação da API estará disponível em `http://localhost:3333/docs`.
