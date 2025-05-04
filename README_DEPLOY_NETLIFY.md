# Netlify Deployment Checklist for Vite React App

## 1. Environment Variables
- Only variables prefixed with `VITE_` are exposed to the client. Move any secrets (API keys, etc.) that should NOT be public out of `.env` or rename them so they are NOT prefixed with `VITE_`.
- Your `.env` should contain only these for frontend:
  ```env
  VITE_API_URL=https://backend1-fo76.onrender.com/api
  VITE_WS_URL=wss://backend1-fo76.onrender.com/ws
  ```

## 2. Build Command
- Netlify will use `npm run build` by default for Vite projects.

## 3. Publish Directory
- Set to `dist` in Netlify settings.

## 4. Routing (Optional)
- For client-side routing (React Router), add a `_redirects` file in your `public` folder with:
  ```
  /*    /index.html   200
  ```

## 5. Deploy Steps
1. Push your code to a Git repo (GitHub/GitLab/Bitbucket).
2. Connect your repo to Netlify.
3. Set the environment variables in the Netlify dashboard (matching your `.env`).
4. Deploy!

## 6. Security
- **Never** expose secrets (API keys, Firebase credentials, etc.) in `.env` with the `VITE_` prefix or in any client code.

---

**This file was generated to help you safely deploy your Vite React app to Netlify.**
