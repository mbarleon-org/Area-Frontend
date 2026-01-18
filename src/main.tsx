import { StrictMode } from 'react'
import './index.css'
import './MobileInteractions.css'
import App from './App'

if (typeof document !== 'undefined') {
  import('react-dom/client').then(({ createRoot }) => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }).catch(() => {
  });
}
