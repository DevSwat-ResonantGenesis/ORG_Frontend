# ResonantGraph AI Frontend

React + TypeScript + Vite frontend for ResonantGraph AI governance platform.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will run on `http://localhost:5175`

### Build

```bash
# Build for production
npm run build
```

Output will be in `dist/` directory.

---

## 🌐 Environment Variables

**Build-time variables** (set in DigitalOcean):

- `VITE_API_URL` - Backend API URL (e.g., `https://api.dev-swat.com`)
- `VITE_FASTAPI_URL` - FastAPI URL (e.g., `https://api.dev-swat.com`)

**Default (development):**
- `http://localhost:8001`

---

## 📦 Deployment

### DigitalOcean App Platform (Static Site)

1. **Connect GitHub:**
   - Repository: `louienemesh/ResonantGraphAI_FrontendV0.1`
   - Branch: `main`

2. **Build Settings:**
   - Build command: `npm install && npm run build`
   - Output directory: `dist`

3. **Environment Variables:**
   ```
   VITE_API_URL=https://api.dev-swat.com
   VITE_FASTAPI_URL=https://api.dev-swat.com
   ```

4. **Routes:**
   - Route: `/` (catch-all for SPA routing)

5. **Domain:**
   - Configure: `dev-swat.com`

---

## 🏗️ Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable components
├── pages/           # Page components
├── theme/           # Theme and styling
├── router/          # React Router configuration
├── store/           # Zustand state management
└── utils/           # Utility functions
```

---

## 🔗 Backend Connection

The frontend connects to the backend API at:
- **Production:** `https://api.dev-swat.com`
- **Development:** `http://localhost:8001`

Configure via `VITE_FASTAPI_URL` environment variable.

---

## 📝 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Charts and visualizations

---

## 🎨 Features

- Dark/Light theme support
- Responsive design
- Real-time data visualization
- Evidence graph visualization
- Compliance monitoring
- Audit logging
- Multi-tenant support

---

## 📄 License

Proprietary - ResonantGraph AI

