import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DamageNumberProvider } from './components/DamageNumber';
import { TooltipProvider } from './components/TooltipProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <DamageNumberProvider>
        <App />
      </DamageNumberProvider>
    </TooltipProvider>
  </StrictMode>,
);
