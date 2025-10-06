import { createContext, useContext, useState, useEffect } from 'react';

// Contexto de autenticación para manejar el estado de login/logout
const AuthContext = createContext();

// Hook para acceder al contexto de autenticación
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto que envuelve la aplicación
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar si hay un token en localStorage al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Función para simular login
  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  // Función para simular logout
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};