import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, validateRutFormat, validateEmail } from '../services/registerService';

function Register() {
  const [formData, setFormData] = useState({
    rut: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validaciones básicas del frontend
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    
    if (!validateRutFormat(formData.rut)) {
      setError('Formato de RUT inválido (ej: 12345678-9)');
      setLoading(false);
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Formato de email inválido');
      setLoading(false);
      return;
    }
    
    try {
      // Llamada real a la API
      const response = await registerUser(formData);
      
      if (response.success) {
        setSuccess('¡Registro exitoso! Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
      {success && <div style={{color: 'green', marginBottom: '10px'}}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>RUT:</label>
          <input
            type="text"
            name="rut"
            value={formData.rut}
            onChange={handleInputChange}
            placeholder="12345678-9"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Nombre de usuario:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Teléfono:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+56912345678"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Confirmar Contraseña:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}

export default Register;