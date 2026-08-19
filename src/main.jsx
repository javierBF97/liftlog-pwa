import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Ask the browser to exempt this origin's storage from eviction under disk
// pressure. Fire-and-forget: a denial just leaves us with best-effort storage.
navigator.storage?.persist?.();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
