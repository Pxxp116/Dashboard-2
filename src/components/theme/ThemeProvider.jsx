/**
 * @fileoverview Wrapper del ThemeProvider para fácil integración
 * Combina el contexto de temas con el contexto existente de la app
 */

import React from 'react';
import { ThemeProvider as ThemeContextProvider } from '../../context/ThemeContext';

/**
 * Provider wrapper que combina el contexto de temas
 * con otros providers necesarios
 */
export function ThemeProvider({ children }) {
  return (
    <ThemeContextProvider>
      {children}
    </ThemeContextProvider>
  );
}

export default ThemeProvider;