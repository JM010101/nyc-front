# NYC Real Estate Zoning Platform - Frontend

React + TypeScript frontend for the NYC Real Estate Zoning Platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Query** - Data fetching
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Mapbox GL JS** - Map visualization

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   Create `.env` file:
   ```
   VITE_API_URL=http://localhost:8000
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

   **Get Mapbox Token:**
   - Sign up at [mapbox.com](https://www.mapbox.com/)
   - Go to Account → Tokens
   - Copy your default public token
   - Add to `.env` as `VITE_MAPBOX_TOKEN`

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── PropertySearch.tsx  # Main search component
│   │   └── PropertyMap.tsx    # Mapbox map component
│   ├── hooks/         # Custom React hooks
│   │   └── usePropertyLookup.ts
│   ├── pages/         # Page components
│   │   └── Home.tsx
│   ├── services/      # API services
│   │   └── api.ts
│   ├── types/         # TypeScript types
│   │   └── index.ts
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

- ✅ Property lookup by address or BBL
- ✅ Display property details
- ✅ Show zoning districts
- ✅ Show nearby landmarks
- ✅ **Interactive Mapbox map visualization**
- ✅ Responsive design
- ✅ Loading states and error handling

## Mapbox Integration

The frontend includes Mapbox GL JS for interactive map visualization:

- Property location marker
- Nearby landmark markers
- Zoom and pan controls
- Popup information

**Note:** Mapbox requires a free account and access token. The map will show a placeholder message if the token is not configured.

## Deployment

See [RENDER_DEPLOYMENT.md](../RENDER_DEPLOYMENT.md) for deployment instructions.

**Important:** Set `VITE_MAPBOX_TOKEN` environment variable in your deployment platform (Render, Vercel, etc.).
