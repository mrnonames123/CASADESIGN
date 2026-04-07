# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## PDF AI Concierge (Groq)

The in-site **AI Concierge** button uses the PDF chatbot server in `pdf-chatbot/server`.

1. Add your key in `pdf-chatbot/server/.env` (see `pdf-chatbot/server/.env.example`):
   - `GROQ_API_KEY=...`
   - Optional: `GROQ_MODEL=llama-3.1-8b-instant`
2. Start the chatbot server in one terminal:
   - `npm run chatbot:server`
3. Start the Vite app in another terminal:
   - `npm run dev`

In dev, the frontend calls `POST /chat` and Vite proxies it to `http://localhost:5000`.

Optional (recommended for deployment): set `VITE_CHATBOT_API_URL` (e.g. `https://your-backend.example.com`) in a root `.env` / hosting env vars if the chatbot server is not hosted on the same origin as the frontend.
