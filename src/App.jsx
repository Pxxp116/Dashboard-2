/**
 * @fileoverview Componente raíz de la aplicación GastroBot Dashboard
 * Punto de entrada principal de React
 */

import React from 'react';
import Dashboard from './Dashboard';

/**
 * Componente principal de la aplicación
 * @returns {JSX.Element} Aplicación completa
 */
function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;