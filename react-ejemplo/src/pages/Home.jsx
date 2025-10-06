import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, logoutUser } from '../services/authService';
import { useEffect, useState } from 'react';

function Home() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const data = getUserData();
    setUserData(data);
  }, []);

  const handleLogout = () => {
    // Limpiar datos del servicio y contexto
    logoutUser();
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h2>Home</h2>
      <p>Bienvenido a la aplicación. Esta es la vista protegida.</p>
      
      {userData && (
        <div style={{marginBottom: '20px', padding: '10px', border: '1px solid #ddd'}}>
          <h3>Información del Usuario:</h3>
          <p><strong>Usuario:</strong> {userData.username}</p>
          <p><strong>RUT:</strong> {userData.rut}</p>
          <p><strong>ID:</strong> {userData.user_id}</p>
          <p><strong>Rol:</strong> {userData.rous_nombre} (ID: {userData.rous_id})</p>
        </div>
      )}
      
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}

export default Home;