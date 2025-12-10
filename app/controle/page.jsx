// app/controle/page.jsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ControlePage() {
  useEffect(() => {
    (function () {
      // ======= Util =======
      const fmtBRL = (v) =>
        (isNaN(v) ? 0 : v).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
      const num = (v) => Number(String(v).replace(',', '.')) || 0;
      const el = (sel) => document.querySelector(sel);
      const tbody = (id) => document.querySelector(id + ' tbody');
      const today = new Date();

      // ======= Estado =======
      const emptyMonth = () => ({
        saldoInicial: 0,
        dinheiroRecebido: 0,
        faturaCartao: 0,
        faturaInter: 0,
        minhaParteInter: 50,
        diasRestantes: '',
        fixas: [],
        variaveis: [],
      });

      const monthsKey = 'cg_ref_months_v1';
      const dataKey = (ref) => `cg_data_${ref}`; // ref = YYYY-MM

      // ======= Mês de referência =======
      const refSel = el('#refMonth');
      function monthListAround() {
        const opts = [];
        const base = new Date(today.getFullYear(), today.getMonth(), 1);
        for (let i = -3; i <= 3; i++) {
          const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
          const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            '0'
          )}`;
          const label = d.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          });
          opts.push({ value: val, label });
        }
        return opts;
      }
      function renderMonthOptions() {
        refSel.innerHTML = '';
        for (const o of monthListAround()) {
          const op = document.createElement('option');
          op.value = o.value;
          op.textContent = o.label;
          refSel.appendChild(op);
        }
      }

      function getCurrentRef() {
        return refSel.value;
      }

      function ensureMonth(ref) {
        if (!localStorage.getItem(dataKey(ref))) {
          localStorage.setItem(dataKey(ref), JSON.stringify(emptyMonth()));
        }
      }

      function loadMonth(ref) {
        const raw = localStorage.getItem(dataKey(ref));
        return raw ? JSON.parse(raw) : emptyMonth();
      }

      function saveMonth(ref, obj) {
        localStorage.setItem(dataKey(ref), JSON.stringify(obj));
      }

      // ======= Tabelas (linhas dinâmicas) =======
      function addRow(kind, item = { desc: '', valor: 0 }) {
        const t = kind === 'fixas' ? '#tFixas' : '#tVar';
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><input type="text" placeholder="Descrição" value="${item.desc || ''}"></td>
      <td class="right"><input type="number" inputmode="decimal" step="0.01" value="${
        item.valor || 0
      }"></td>
      <td class="right">
        <button class="btn small danger">remover</button>
      </td>`;
        tbody(t).appendChild(tr);

        tr.querySelector('input[type="text"]').addEventListener('input', autoSave);
        tr
          .querySelector('input[type="number"]')
          .addEventListener('input', () => {
            autoSave();
            recalc();
          });
        tr.querySelector('.btn.danger').addEventListener('click', () => {
          tr.remove();
          autoSave();
          recalc();
        });
      }

      function readTable(kind) {
        const t = kind === 'fixas' ? '#tFixas' : '#tVar';
        const rows = Array.from(tbody(t).querySelectorAll('tr'));
        return rows
          .map((r) => ({
            desc: r.querySelector('input[type="text"]').value.trim(),
            valor: num(r.querySelector('input[type="number"]').value),
          }))
          .filter((x) => x.desc || x.valor);
      }

      function sum(kind) {
        return readTable(kind).reduce(
          (a, b) => a + (Number(b.valor) || 0),
          0
        );
      }

      // ======= Inputs principais =======
      const $ = {
        saldoInicial: el('#saldoInicial'),
        dinheiroRecebido: el('#dinheiroRecebido'),
        faturaCartao: el('#faturaCartao'),
        faturaInter: el('#faturaInter'),
        minhaParteInter: el('#minhaParteInter'),
        diasRestantes: el('#diasRestantes'),
      };

      Object.values($).forEach((inp) =>
        inp.addEventListener('input', () => {
          autoSave();
          recalc();
        })
      );

      // ======= KPIs =======
      const K = {
        receitas: el('#kpiReceitas'),
        fixas: el('#kpiFixas'),
        cartoes: el('#kpiCartoes'),
        saldo: el('#kpiSaldo'),
        variaveis: el('#kpiVariaveis'),
        pode: el('#kpiPode'),
        diario: el('#kpiDiario'),
        interPart: el('#kpiInterPart'),
        totalFixas: el('#totalFixas'),
        totalVar: el('#totalVar'),
      };

      function recalc() {
        const receitas = num($.saldoInicial.value) + num($.dinheiroRecebido.value);
        const fixas = sum('fixas');
        const variaveis = sum('variaveis');
        const interPart =
          num($.faturaInter.value) *
          ((num($.minhaParteInter.value) || 0) / 100);
        const cartoes = num($.faturaCartao.value) + interPart;
        const saldoPrev = receitas - (fixas + variaveis + cartoes);

        K.receitas.textContent = fmtBRL(receitas);
        K.fixas.textContent = fmtBRL(fixas);
        K.cartoes.textContent = fmtBRL(cartoes);
        K.variaveis.textContent = fmtBRL(variaveis);
        K.saldo.textContent = fmtBRL(saldoPrev);
        K.interPart.textContent = fmtBRL(interPart);

        K.totalFixas.textContent = fmtBRL(fixas);
        K.totalVar.textContent = fmtBRL(variaveis);

        const dias = Number($.diasRestantes.value);
        if (!isNaN(dias) && dias > 0) {
          const diario = saldoPrev / dias;
          K.diario.textContent = fmtBRL(diario);
          K.pode.textContent = diario >= 0 ? 'SIM' : 'NÃO';
          K.pode.className = 'v ' + (diario >= 0 ? 'pos' : 'neg');
        } else {
          K.diario.textContent = '—';
          K.pode.textContent = saldoPrev >= 0 ? 'SIM' : 'NÃO';
          K.pode.className = 'v ' + (saldoPrev >= 0 ? 'pos' : 'neg');
        }
      }

      // ======= Persistência =======
      function autoSave() {
        saveUI(getCurrentRef());
      }

      function saveUI(ref) {
        const obj = {
          saldoInicial: num($.saldoInicial.value),
          dinheiroRecebido: num($.dinheiroRecebido.value),
          faturaCartao: num($.faturaCartao.value),
          faturaInter: num($.faturaInter.value),
          minhaParteInter: Number($.minhaParteInter.value) || 0,
          diasRestantes: $.diasRestantes.value,
          fixas: readTable('fixas'),
          variaveis: readTable('variaveis'),
        };
        saveMonth(ref, obj);
      }

      function loadUI(ref) {
        ensureMonth(ref);
        const obj = loadMonth(ref);
        $.saldoInicial.value = obj.saldoInicial;
        $.dinheiroRecebido.value = obj.dinheiroRecebido;
        $.faturaCartao.value = obj.faturaCartao;
        $.faturaInter.value = obj.faturaInter;
        $.minhaParteInter.value = obj.minhaParteInter;
        $.diasRestantes.value = obj.diasRestantes;

        tbody('#tFixas').innerHTML = '';
        tbody('#tVar').innerHTML = '';
        (obj.fixas.length ? obj.fixas : [{}, {}]).forEach((x) =>
          addRow('fixas', x)
        );
        (obj.variaveis.length ? obj.variaveis : [{}]).forEach((x) =>
          addRow('variaveis', x)
        );

        recalc();
      }

      // ======= Export/Import =======
      function exportJSON() {
        const ref = getCurrentRef();
        const blob = new Blob([JSON.stringify(loadMonth(ref), null, 2)], {
          type: 'application/json',
        });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `controle-gastos-${ref}.json`;
        a.click();
      }

      function importJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const obj = JSON.parse(e.target.result);
            const ref = getCurrentRef();
            saveMonth(ref, obj);
            loadUI(ref);
          } catch (err) {
            alert('Arquivo inválido.');
          }
        };
        reader.readAsText(file);
      }

      // ======= Novo mês =======
      function novoMes() {
        const cur = refSel.value;
        const d = new Date(
          Number(cur.slice(0, 4)),
          Number(cur.slice(5)) - 1,
          1
        );
        const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const ref = `${next.getFullYear()}-${String(
          next.getMonth() + 1
        ).padStart(2, '0')}`;

        // cria com herança de saldo previsto positivo (opcional)
        const objAtual = loadMonth(cur);
        const receitas = objAtual.saldoInicial + objAtual.dinheiroRecebido;
        const interPart =
          objAtual.faturaInter * (objAtual.minhaParteInter / 100);
        const gastos =
          objAtual.fixas.reduce((a, b) => a + b.valor, 0) +
          objAtual.variaveis.reduce((a, b) => a + b.valor, 0) +
          objAtual.faturaCartao +
          interPart;
        const saldoPrev = receitas - gastos;

        const novo = emptyMonth();
        novo.saldoInicial = Math.max(
          0,
          Math.round((saldoPrev + Number.EPSILON) * 100) / 100
        );
        novo.minhaParteInter = objAtual.minhaParteInter;
        // mantém contas fixas
        novo.fixas = objAtual.fixas;

        saveMonth(ref, novo);
        // adiciona ao select e seleciona
        renderMonthOptions();
        refSel.value = ref;
        loadUI(ref);
      }

      // ======= Eventos UI =======
      el('#addFixa').addEventListener('click', () => addRow('fixas'));
      el('#addVar').addEventListener('click', () => addRow('variaveis'));
      el('#btnSalvar').addEventListener('click', () => {
        autoSave();
        alert('Salvo ✅');
      });
      el('#btnRecalc').addEventListener('click', recalc);
      el('#btnExport').addEventListener('click', exportJSON);
      el('#fileImport').addEventListener('change', (e) => {
        if (e.target.files[0]) importJSON(e.target.files[0]);
        e.target.value = '';
      });
      el('#btnZerar').addEventListener('click', () => {
        if (confirm('Limpar todos os dados deste mês?')) {
          saveMonth(getCurrentRef(), emptyMonth());
          loadUI(getCurrentRef());
        }
      });
      el('#btnNovoMes').addEventListener('click', novoMes);

      refSel.addEventListener('change', () => loadUI(getCurrentRef()));

      // ======= Boot =======
      renderMonthOptions();
      const curRef = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, '0')}`;
      refSel.value = curRef;
      ensureMonth(curRef);
      loadUI(curRef);
    })();
  }, []);

  return (
    <main className="wrap">
      <div className="row">
        <div className="grid-8">
          <h1>💸 Controle de Gastos</h1>
          <div className="sub">
            Planilha interativa (offline, salva no seu navegador). Preencha os
            campos, adicione itens e veja automaticamente{' '}
            <strong>quanto pode gastar</strong>,{' '}
            <strong>quanto vai dever</strong> e o{' '}
            <strong>saldo previsto do mês</strong>.
          </div>
        </div>
        <div className="grid-4 right">
          <span className="badge">
            Mês: <select id="refMonth"></select>
          </span>
        </div>
      </div>

      <div className="row">
        <div className="grid-6 card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div className="badge">Dados principais</div>
            <div className="hint">Valores em BRL</div>
          </div>
          <div className="line" />
          <div className="row">
            <div className="grid-6">
              <label htmlFor="saldoInicial">Saldo inicial do mês</label>
              <input
                id="saldoInicial"
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                step="0.01"
              />
            </div>
            <div className="grid-6">
              <label htmlFor="dinheiroRecebido">
                Dinheiro recebido (somatório)
              </label>
              <input
                id="dinheiroRecebido"
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                step="0.01"
              />
            </div>
            <div className="grid-6">
              <label htmlFor="faturaCartao">Cartão de crédito — fatura</label>
              <input
                id="faturaCartao"
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                step="0.01"
              />
            </div>
            <div className="grid-6">
              <label htmlFor="faturaInter">
                Cartão compartilhado — fatura total (Inter)
              </label>
              <input
                id="faturaInter"
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                step="0.01"
              />
            </div>
            <div className="grid-6">
              <label htmlFor="minhaParteInter">
                Minha parte da fatura compartilhada (%)
              </label>
              <input
                id="minhaParteInter"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue="50"
              />
            </div>
            <div className="grid-6">
              <label htmlFor="diasRestantes">
                Dias restantes no mês (opcional)
              </label>
              <input
                id="diasRestantes"
                type="number"
                min="0"
                step="1"
                placeholder="auto"
              />
            </div>
          </div>
        </div>

        <div className="grid-6 card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div className="badge">KPIs do mês</div>
            <button className="btn small" id="btnRecalc" type="button">
              Recalcular
            </button>
          </div>
          <div className="line" />
          <div className="kpi">
            <div className="tile">
              <div className="t">Receitas totais</div>
              <div className="v" id="kpiReceitas">
                R$ 0,00
              </div>
            </div>
            <div className="tile">
              <div className="t">Despesas fixas</div>
              <div className="v" id="kpiFixas">
                R$ 0,00
              </div>
            </div>
            <div className="tile">
              <div className="t">Cartões (incl. Inter)</div>
              <div className="v" id="kpiCartoes">
                R$ 0,00
              </div>
            </div>
            <div className="tile">
              <div className="t">Saldo previsto</div>
              <div className="v" id="kpiSaldo">
                R$ 0,00
              </div>
            </div>
          </div>
          <div className="line" />
          <div className="kpi">
            <div className="tile">
              <div className="t">Despesas variáveis planejadas</div>
              <div className="v" id="kpiVariaveis">
                R$ 0,00
              </div>
            </div>
            <div className="tile">
              <div className="t">Pode gastar hoje?*</div>
              <div className="v" id="kpiPode">
                —
              </div>
            </div>
            <div className="tile">
              <div className="t">Orçamento diário restante*</div>
              <div className="v" id="kpiDiario">
                —
              </div>
            </div>
            <div className="tile">
              <div className="t">Minha parte no Inter</div>
              <div className="v" id="kpiInterPart">
                R$ 0,00
              </div>
            </div>
          </div>
          <div className="hint" style={{ marginTop: '8px' }}>
            *Se você informar os dias restantes, calculamos um teto diário para
            não estourar o mês.
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: '14px' }}>
        <div className="grid-6 card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div className="badge">Contas Fixas</div>
            <button
              className="btn small acc"
              id="addFixa"
              type="button"
            >
              + adicionar
            </button>
          </div>
          <div className="line" />
          <table id="tFixas">
            <thead>
              <tr>
                <th>Descrição</th>
                <th className="right">Valor</th>
                <th className="right">Ações</th>
              </tr>
            </thead>
            <tbody />
            <tfoot>
              <tr>
                <td className="right">
                  <strong>Total</strong>
                </td>
                <td className="right" id="totalFixas">
                  R$ 0,00
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="grid-6 card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <div className="badge">Despesas Variáveis Planejadas</div>
            <button className="btn small acc" id="addVar" type="button">
              + adicionar
            </button>
          </div>
          <div className="line" />
          <table id="tVar">
            <thead>
              <tr>
                <th>Descrição</th>
                <th className="right">Valor</th>
                <th className="right">Ações</th>
              </tr>
            </thead>
            <tbody />
            <tfoot>
              <tr>
                <td className="right">
                  <strong>Total</strong>
                </td>
                <td className="right" id="totalVar">
                  R$ 0,00
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="row" style={{ marginTop: '14px' }}>
        <div className="grid-12 card">
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div className="badge">Ferramentas</div>
            <div className="footer">
              <button className="btn" id="btnSalvar" type="button">
                💾 Salvar
              </button>
              <button
                className="btn warn"
                id="btnNovoMes"
                type="button"
                title="Cria mês a partir do atual, zerando os valores variáveis"
              >
                📅 Novo mês
              </button>
              <button className="btn" id="btnExport" type="button">
                ⬇️ Exportar (JSON)
              </button>
              <label className="btn" htmlFor="fileImport">
                ⬆️ Importar (JSON)
              </label>
              <input
                id="fileImport"
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
              />
              <button className="btn danger" id="btnZerar" type="button">
                🗑️ Limpar mês
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="hint" style={{ marginTop: '10px' }}>
        Dica: clique em &quot;+ adicionar&quot; para criar linhas. Os dados
        ficam salvos por <span className="pill">mês/ano</span> no seu navegador
        (LocalStorage). Não enviamos nada para a internet.
      </p>

      <p className="hint" style={{ marginTop: '10px' }}>
        <Link href="/" className="btn small">
          ← Voltar para Home
        </Link>
      </p>
    </main>
  );
}
