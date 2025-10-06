import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/authService';

function Login() {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Llamada real a la API
      const response = await loginUser({ rut, password });
      
      // Si el login es exitoso, actualizar el contexto
      login(response.token);
      navigate('/home');
    } catch (err) {
      // Manejar errores de la API
      setError(err.message || 'Error al iniciar sesión');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>RUT:</label>
          <input
            type="text"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="12345678-9"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default Login;