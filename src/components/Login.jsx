import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-DOM';
import '../CSS/login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/vuelos';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Correo inválido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8090/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const text = await response.text();
      let data = {};
      if (text) {
        try { data = JSON.parse(text); }
        catch { throw new Error('Respuesta inválida del servidor'); }
      }

      if (!response.ok) throw new Error(data.message || 'Credenciales inválidas');

      // Guardar sesión
      if (data.token) localStorage.setItem('token', data.token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido
      }));

      // Limpiar y redirigir
      setFormData({ email: '', password: '' });
      setErrors({});
      navigate(from, { replace: true });

    } catch (err) {
      setErrors({ general: err.message || 'Error al iniciar sesión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>Inicia sesión</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          {errors.general && (
            <div className="error-banner">
              <i className="fas fa-exclamation-circle"></i>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Correo Electrónico</label>
              <div className="input-caja">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="error-text"><i className="fas fa-exclamation-circle"></i> {errors.email}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-caja">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && <p className="error-text"><i className="fas fa-exclamation-circle"></i> {errors.password}</p>}
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (<><i className="fas fa-spinner fa-spin"></i> Iniciando sesión...</>) : (<>Iniciar Sesión</>)}
            </button>

            <div className="signup-link">
              <p>¿No tienes cuenta? <a href="/Registro">Regístrate aquí</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;