// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Controle de Gastos — Simples e Offline',
  description:
    'Planilha interativa de controle de gastos, offline e salva no navegador, migrada para Next.js.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
