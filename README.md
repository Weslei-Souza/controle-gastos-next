## Descrição do projeto

Este projeto é uma migração de uma página única em HTML/CSS/JS para Next.js,
mantendo a lógica de controle de gastos pessoais com armazenamento local
via `localStorage`. O usuário consegue registrar saldo inicial, receitas,
despesas fixas e variáveis, além de faturas de cartão, visualizando tudoa respeito de
finanças em tempo real.

## Páginas e tipos de renderização

- `/` — Home (SSG): página estática com descrição do sistema e links de navegação.
- `/controle` — Controle de Gastos (CSR): página interativa que utiliza
  JavaScript no cliente e `localStorage` para persistência offline.
- `/planejamento`— Tabela de Meses (CSR): página também client-side, que
lê todos os dados salvos no navegador e gera uma visão consolidada de vários
meses, exibindo receitas, despesas e saldo previsto de cada período.

### Justificativa técnica

A Home foi implementada como página SSG por ter conteúdo essencialmente estático,
o que permite servir HTML pré-gerado com ótimo desempenho, cache e SEO. 

Já o Controle de Gastos e Planejamento foi migrado como página CSR porque depende de APIs do
navegador, como `localStorage` e de intensa interação em tempo real, o que
favorece a atualização instantânea da interface semque precise recarregar a página toda hora,
assim melhorando a experiência do usuário no navegador. 



----------------------------------------------------------------

Este é um projeto Next.js criado com create-next-app.

## Iniciando 

Primeiro, execute o servidor de desenvolvimento:

npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev

## Vizualização

Abra ("http://localhost:3000") no seu navegador para ver o resultado.

Você pode começar a editar a página modificando o arquivo app/page.js. A página será atualizada automaticamente conforme você salva as alterações.

Este projeto utiliza next/font para otimizar e carregar automaticamente a família de fontes Geist, da Vercel.



