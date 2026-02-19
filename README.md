💰 Gerenciador de Finanças Familiar
Um aplicativo moderno de controle financeiro desenvolvido com Next.js 14 e Node.js, focado em simplicidade, gestão multi-moeda e planejamento preventivo.

✨ Funcionalidades
🌍 Multi-idiomas: Suporte nativo para Português (BR), Inglês (US) e Italiano (IT).
🌓 Interface Adaptativa: Modo claro e escuro (Dark Mode) automático.
📊 Saldo Projetado: Sistema inteligente que diferencia o saldo atual do saldo previsto, ajudando a antecipar furos no orçamento.
🚨 Alertas Visuais: Notificações em tempo real (animações e cores) para saldos negativos ou riscos financeiros.
📅 Navegação Temporal: Filtros intuitivos por mês e ano para controle histórico.
📱 Mobile First: Totalmente responsivo e otimizado para uso em smartphones.
🏗️ Arquitetura do Projeto
O projeto é estruturado como um monorepo para facilitar o gerenciamento:

Frontend: Next.js hospedado na Vercel.
Backend: Node.js + Prisma ORM hospedado no Render.
Database: PostgreSQL hospedado no Supabase.

🚀 Tecnologias Utilizadas
Frontend: Next.js 14, Tailwind CSS, Lucide Icons, Context API.
Backend: Node.js, Express, Prisma ORM, JWT (Autenticação).
Banco de Dados: PostgreSQL.

🛠️ Como Executar o Projeto

1. Clone o repositório:

2. Configure o Backend:

Bash
cd backend
npm install

# Configure seu .env com DATABASE_URL e JWT_SECRET

npx prisma generate
npm start

3. Configure o Frontend:

Bash
cd ../frontend
npm install

# Configure seu .env.local com NEXT_PUBLIC_API_URL

npm run dev

Desenvolvido por Felipe Maillo com o auxílio de Gemini AI 🚀
