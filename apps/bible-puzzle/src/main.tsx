import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRoot } from '@puzzle-universe/shared-ui';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/600-italic.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/nunito/700.css';
import '@puzzle-universe/shared-ui/base.css';
import { product } from './product.ts';
import './theme.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Elemento #root ausente');
}

createRoot(root).render(
  <StrictMode>
    <AppRoot config={product} />
  </StrictMode>,
);
