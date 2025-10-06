import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h2>Home</h2>
      <p>Bienvenido a la aplicación. Esta es la vista protegida.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;