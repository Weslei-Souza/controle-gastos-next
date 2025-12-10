'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function formatCurrency(value) {
  const num =
    typeof value === 'number'
      ? value
      : Number(String(value || '0').replace(',', '.')) || 0;

  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function safeNumber(v) {
  return Number(v) || 0;
}

function monthLabel(ref) {
  const [y, m] = ref.split('-').map(Number);
  if (!y || !m) return ref;

  const d = new Date(y, m - 1, 1);

  return d.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}

export default function PlanejamentoPage() {
  const [rows, setRows] = useState([]);

  function carregar() {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith('cg_data_')
    );

    const meses = [];

    for (const key of keys) {
      const ref = key.replace('cg_data_', '');

      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;

        const data = JSON.parse(raw);

        const saldoInicial = safeNumber(data.saldoInicial);
        const dinheiroRecebido = safeNumber(data.dinheiroRecebido);
        const faturaCartao = safeNumber(data.faturaCartao);
        const faturaInter = safeNumber(data.faturaInter);
        const minhaParteInter = safeNumber(data.minhaParteInter);

        const fixas = Array.isArray(data.fixas) ? data.fixas : [];
        const variaveis = Array.isArray(data.variaveis) ? data.variaveis : [];

        const totalFixas = fixas.reduce(
          (acc, item) => acc + safeNumber(item.valor),
          0
        );
        const totalVariaveis = variaveis.reduce(
          (acc, item) => acc + safeNumber(item.valor),
          0
        );

        const parteInter = faturaInter * (minhaParteInter / 100);

        const receitas = saldoInicial + dinheiroRecebido;
        const cartoes = faturaCartao + parteInter;
        const totalDespesas = totalFixas + totalVariaveis + cartoes;
        const saldoPrevisto = receitas - totalDespesas;

        meses.push({
          ref,
          label: monthLabel(ref),
          receitas,
          totalFixas,
          totalVariaveis,
          cartoes,
          totalDespesas,
          saldoPrevisto,
        });
      } catch {}
    }

    meses.sort((a, b) => (a.ref < b.ref ? -1 : a.ref > b.ref ? 1 : -0));

    setRows(meses);
  }

  useEffect(() => {
    const id = setTimeout(() => {
      carregar();
    }, 0);

    return () => clearTimeout(id);
  }, []);

  return (
    <main className="wrap">
      <div className="row">
        <div className="grid-8">
          <h1>📊 Planejamento Mensal</h1>
          <p className="sub">
            Veja todos os meses salvos no navegador, com receitas, gastos fixos,
            variáveis e saldo previsto. Ideal para análise e planejamento financeiro.
          </p>
        </div>

        <div className="grid-4 right">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="btn small" onClick={carregar}>
              🔄 Recarregar dados
            </button>
            <Link href="/controle" className="btn small">
              Ir para Controle →
            </Link>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: '16px' }}>
        <div className="grid-12 card">
          <div className="badge">Resumo por mês</div>
          <div className="line" />

          {rows.length === 0 ? (
            <p className="hint">
              Nenhum mês encontrado. Vá até{' '}
              <Link href="/controle" className="pill">
                Controle de Gastos
              </Link>{' '}
              e salve um mês para aparecer aqui.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th className="right">Receitas</th>
                    <th className="right">Fixas</th>
                    <th className="right">Variáveis</th>
                    <th className="right">Cartões</th>
                    <th className="right">Total despesas</th>
                    <th className="right">Saldo previsto</th>
                    <th className="right">Situação</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((m) => {
                    const positivo = m.saldoPrevisto >= 0;

                    return (
                      <tr key={m.ref}>
                        <td>{m.label}</td>
                        <td className="right">{formatCurrency(m.receitas)}</td>
                        <td className="right">{formatCurrency(m.totalFixas)}</td>
                        <td className="right">{formatCurrency(m.totalVariaveis)}</td>
                        <td className="right">{formatCurrency(m.cartoes)}</td>
                        <td className="right">{formatCurrency(m.totalDespesas)}</td>
                        <td className="right">
                          <span className={positivo ? 'pos' : 'neg'}>
                            {formatCurrency(m.saldoPrevisto)}
                          </span>
                        </td>
                        <td className="right">
                          <span className="pill">
                            {positivo ? 'Superávit' : 'Déficit'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="hint" style={{ marginTop: '12px' }}>
            A tabela lê automaticamente todas as chaves <code>cg_data_YYYY-MM</code>{' '}
            do <span className="pill">localStorage</span>.  
            Sempre que salvar um mês no Controle, ele aparecerá aqui.
          </p>
        </div>
      </div>

      <p className="hint" style={{ marginTop: '10px' }}>
        <Link href="/" className="btn small">
          ← Voltar para Home
        </Link>
      </p>
    </main>
  );
}
