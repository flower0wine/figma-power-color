import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('react-page');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} 