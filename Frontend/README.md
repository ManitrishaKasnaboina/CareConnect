# React + Vite

## Deployment

Set `VITE_API_URL` in the frontend hosting provider to the deployed backend URL
including `/api`, for example `https://your-backend.example.com/api`, then
redeploy the frontend. Vite embeds this value during the build, so changing it
requires a new deployment.

Set `VITE_GOOGLE_CLIENT_ID` to the Google OAuth **Web application** client ID in
the frontend hosting provider. In Google Cloud Console, open that same OAuth
client and add each deployed frontend origin under **Authorized JavaScript
origins**. Enter only the origin (scheme and hostname, plus a port if needed),
for example `https://your-frontend.example.com`—not a page path such as
`/login`. Add both the hosting-provider domain and any custom domain users visit.
For local development, keep `http://localhost:5173` registered as well.

If Google sign-in shows `Error 400: origin_mismatch` after deployment, the
current browser origin is missing from that OAuth client's authorized
JavaScript origins, or the deployed frontend is using a different client ID.
Match the frontend `VITE_GOOGLE_CLIENT_ID` to the backend `GOOGLE_CLIENT_ID`,
save the OAuth client settings, and redeploy the frontend if its environment
variable changed.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
