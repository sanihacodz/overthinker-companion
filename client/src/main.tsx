import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import LandingPage from './components/landing/LandingPage.tsx'

function Root() {
  const [inApp, setInApp] = useState(false);

  if (inApp) return <App />;
  return <LandingPage onEnterApp={() => setInApp(true)} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
