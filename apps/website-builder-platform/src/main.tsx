import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { PreviewApp } from './PreviewApp';

import './styles/main.scss';

const rootElement = document.getElementById('root');
if (rootElement) {
  const isPreview = window.location.search.includes('preview=true');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>{isPreview ? <PreviewApp /> : <App />}</React.StrictMode>,
  );
}
