# Controle de Gastos Next

## 🌐 Aplicação em Produção

O projeto está hospedado gratuitamente na Vercel e pode ser acessado em:
**[https://controle-gastos-next.vercel.app](https://controle-gastos-next.vercel.app)**

---

## 📝 Descrição do Projeto

Este projeto consiste na migração de uma página única em HTML, CSS e JavaScript puro para o framework **Next.js**. O código original foi reescrito para utilizar o novo App Router do Next.js.

O objetivo principal do sistema é fornecer um **controle de gastos pessoais** com foco em simplicidade e performance. A lógica de armazenamento de dados foi mantida no cliente via `localStorage`, garantindo persistência offline. O usuário pode registrar e visualizar em tempo real:
* Saldo inicial
* Receitas
* Despesas fixas e variáveis
* Faturas de cartão

## 🗺️ Arquitetura e Renderização (Next.js App Router)

O projeto adota diferentes estratégias de renderização para otimizar a performance de cada rota:

| Página | Rota | Tipo de Renderização | Justificativa Técnica |
| :--- | :--- | :--- | :--- |
| **Home** | `/` | **SSG** (Static Site Generation) | Implementada como SSG por ter conteúdo essencialmente estático (descrição do sistema e links de navegação). Isso permite servir HTML pré-gerado com ótimo desempenho, cache e benefícios de SEO. |
| **Controle de Gastos** | `/controle` | **CSR** (Client-Side Rendering) | Migrada como CSR (componentes marcados como `use client`) por depender de APIs do navegador (`localStorage`) e de intensa interação em tempo real. O CSR favorece a atualização instantânea da interface, melhorando a experiência do usuário. |
| **Planejamento Mensal** | `/planejamento` | **CSR** (Client-Side Rendering) | Também utiliza CSR, pois lê todos os dados salvos no navegador e gera uma visão consolidada de vários meses. A renderização no lado do cliente é ideal para ler e processar dados sensíveis à performance do usuário de forma dinâmica. |

## 💡 Reflexão: Abordagem de Frontend Desacoplado

A escolha do Next.js e a separação clara das preocupações do projeto reforça uma abordagem de **Frontend Desacoplado**.

1.  **Separação de Camadas:** O Next.js atua como uma camada de apresentação (o frontend), focado inteiramente na interface do usuário e na experiência de navegação (SSG/CSR).
2.  **Backend Simplificado (Local):** A lógica de persistência de dados via `localStorage` atende às necessidades atuais do projeto (armazenamento local/offline) de forma desacoplada.
3.  **Preparação para o Futuro:** Essa arquitetura permite que o projeto evolua facilmente para integrar um backend robusto (como uma API REST ou GraphQL) com um banco de dados real, sem a necessidade de reescrever a lógica de apresentação e as interações do usuário. O frontend já está pronto para consumir dados de qualquer fonte externa, mantendo a responsabilidade de *build* e *deploy* separada do backend.

---

## 📈 Comparação de Performance (Lighthouse - Desktop)

Os testes do Lighthouse demonstram a eficácia da migração para o Next.js, com melhorias em todas as áreas, atingindo a pontuação máxima (100) em Performance, Acessibilidade e Boas Práticas.

| Métrica | Antes (HTML/CSS/JS) | Depois (Next.js) | Comentários |
| :--- | :--- | :--- | :--- |
| **Performance** | **94** | **100** | **Melhoria Significativa:** Atingiu a nota máxima. O Next.js, utilizando **SSG (Static Site Generation) na Home**, garante que o First Contentful Paint (FCP) e o Largest Contentful Paint (LCP) sejam extremamente rápidos, resultando em uma experiência de usuário quase instantânea no carregamento inicial. |
| **Acessibilidade** | **96** | **100** | **Melhoria Completa:** Atingiu a nota máxima. O uso de padrões e componentes do ecossistema React/Next.js ajudou a resolver pequenos problemas de *markup* ou foco que existiam na versão vanilla. |
| **Boas Práticas** | **92** | **100** | **Melhoria Completa:** Atingiu a nota máxima. A Vercel e o Next.js gerenciam automaticamente otimizações de rede, segurança e outras boas práticas técnicas (como uso de HTTP/2), facilitando a manutenção de um código de alta qualidade. |
| **SEO** | **100** | **100** | A pontuação máxima de SEO foi mantida, reforçando a vantagem do Next.js em servir conteúdo pré-renderizado (SSG) de forma otimizada para rastreadores. |

---

## 💻 Iniciando o Projeto

Este é um projeto Next.js criado com `create-next-app`.

### Servidor de Desenvolvimento

Para rodar o projeto localmente, execute o seguinte comando no diretório raiz:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
