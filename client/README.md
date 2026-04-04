# The Overthinker's Antidote - Frontend Client

This is the React client for the Antidote platform, bringing the chaotic, neon-themed UX to life. 

## 🎨 Code Flow & Architecture

1. **The Entry Point (`src/App.tsx`)**:
   - Manages the application-level state (`activeTab`, `thought` input, `treeData` payload).
   - Serves as the dashboard where a user can toggle between the "Solo Dump" mode and "Community Feed".
   - Handles the API `fetch` call to the FastAPI local backend (`http://localhost:8000/analyze`), passing the user's dilemma.
2. **The Canvas Visualization (`src/components/canvas/TreeCanvas.tsx`)**:
   - Once `App.tsx` receives the JSON payload, it mounts the `TreeCanvas`, wrapping the **React Flow** instance.
   - It maps all incoming node definitions to the `custom` type.
3. **The Custom Cyberpunk Node (`src/components/canvas/CustomNode.tsx`)**:
   - Parses the custom properties injected by the backend AI (like `vibeCheck`, `chaosLevel`, and `brainRotScore`).
   - Dynamically changes its glow radius and border colors based on whether the `chaosLevel` is "Extreme", "High", or "Low".
4. **The Styling**:
   - The project uses **Tailwind CSS v4**.
   - Custom CSS variables (`--color-neon-purple`, etc.) are configured in `src/index.css` inside the new `@theme` tailwind structure to give it a fast, flexible custom color palette.

## 🛠 Local Setup & Running

**1. Install Dependencies**
```powershell
npm install
```

**2. Configure Environment**
Copy `.env.sample` to `.env`:
```powershell
cp .env.sample .env
```
_Note: If you are setting up Supabase Realtime later for multiplayer syncing, fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`._

**3. Run the Development Server**
```powershell
npm run dev
```

Visit the outputted URL (usually `http://localhost:5173`) in your browser. Ensure the backend server is also running so that the Generate AI endpoint returns visual nodes!
