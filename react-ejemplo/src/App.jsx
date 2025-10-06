import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import './App.css';

// Este componente maneja la redirección desde la ruta raíz ('/').
// Si el usuario está autenticado, se redirige a la página de inicio (Home).
// De lo contrario, se redirige a la página de inicio de sesión (Login).
function RootRedirect() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
}

// Este componente protege ciertas rutas verificando si el usuario está autenticado.
// Si el usuario está autenticado, se renderizan los componentes hijos.
// De lo contrario, el usuario es redirigido a la página de inicio de sesión (Login).
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// El componente principal App configura las rutas de la aplicación.
// Utiliza React Router para definir diferentes rutas y sus componentes correspondientes.
function App() {
  return (
    <Router>
      <Routes>
        {/* La ruta raíz ('/') redirige a Login o Home dependiendo del estado de autenticación. */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* La página de inicio de sesión está accesible en '/login'. */}
        <Route path="/login" element={<Login />} />
        
        {/* La página de registro está accesible en '/register'. */}
        <Route path="/register" element={<Register />} />
        
        {/* La página de inicio (Home) es una ruta protegida, accesible solo si el usuario está autenticado. */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
