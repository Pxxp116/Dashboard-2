/**
 * @fileoverview Componente raíz de la aplicación GastroBot Dashboard
 * Punto de entrada principal de React
 */

import React from 'react';
import Dashboard from './Dashboard';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';

/**
 * Componente principal de la aplicación
 * @returns {JSX.Element} Aplicación completa
 */
function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="App">
          <Dashboard />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;