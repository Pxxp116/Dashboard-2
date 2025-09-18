/**
 * @fileoverview Hook personalizado para manejar localStorage con React
 * Proporciona sincronización automática entre estado de React y localStorage
 */

import { useState, useEffect } from 'react';

/**
 * Hook para manejar persistencia en localStorage
 * @param {string} key - Clave del localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 * @returns {[any, function]} - [valor, función para actualizar valor]
 */
export function useLocalStorage(key, initialValue) {
  // Obtener valor inicial del localStorage o usar el valor por defecto
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Función para actualizar el valor
  const setValue = (value) => {
    try {
      // Permitir que value sea una función para compatibilidad con useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Actualizar estado
      setStoredValue(valueToStore);

      // Guardar en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(new Event('localStorage-change'));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Escuchar cambios en localStorage de otras pestañas
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error syncing localStorage key "${key}":`, error);
      }
    };

    // Escuchar eventos de storage y nuestro evento personalizado
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorage-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorage-change', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;