/**
 * @fileoverview Componente raíz de la aplicación GastroBot Dashboard
 * Punto de entrada principal de React
 */

import React from 'react';
import Dashboard from './Dashboard';
import { AppProvider } from './context/AppContext';

/**
 * Componente principal de la aplicación
 * @returns {JSX.Element} Aplicación completa
 */
function App() {
  return (
    <AppProvider>
      <div className="App">
        <Dashboard />
      </div>
    </AppProvider>
  );
}

export default App;