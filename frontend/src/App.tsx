import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

import React from 'react';
import ReactDOM from 'react-dom/client';

// Importa as variáveis globais e o reset para toda a aplicação


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
