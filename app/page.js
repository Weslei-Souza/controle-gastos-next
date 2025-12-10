// app/page.js
import Link from 'next/link';

export default function Home() {
  return (
    <main className="wrap">
      <div className="row">
        <div className="grid-8">
          <h1>💸 Controle de Gastos — Versão Next.js</h1>
          <p className="sub">
            Este projeto é uma migração de uma planilha interativa em HTML/CSS/JS
            para Next.js. Ele permite controlar receitas, despesas fixas,
            variáveis e cartões, salvando tudo no navegador de forma offline.
          </p>
        </div>
      </div>

      <div className="row" style={{ marginTop: '16px' }}>
        <div className="grid-6 card">
          <div className="badge">Página principal</div>
          <div className="line" />
          <p className="hint">
            A página de controle de gastos foi implementada como um componente
            client-side, preservando o uso de <span className="pill">localStorage</span>{' '}
            e toda a lógica original em JavaScript.
          </p>
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/controle" className="btn acc">
              Ir para o Controle de Gastos →
            </Link>
            <Link href="/planejamento" className="btn">
              Ver tabela de meses →
            </Link>
          </div>
        </div>

        <div className="grid-6 card">
          <div className="badge">Sobre o projeto</div>
          <div className="line" />
          <ul className="hint" style={{ paddingLeft: '18px' }}>
            <li>Projeto original: página única em HTML/CSS/JS.</li>
            <li>
              Migração para Next.js com três rotas: Home (SSG), Controle (CSR) e
              Planejamento (CSR).
            </li>
            <li>Dados permanecem locais, sem envio para a internet.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
