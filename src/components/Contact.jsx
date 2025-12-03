import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-DOM'; // FIX
import '../CSS/Contact.css';

const Contact = () => {
  const navigate = useNavigate();
  const [contact, setContact] = useState({
    id: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    password: '',            
    confirmPassword: ''      
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    console.log('TOKEN:', localStorage.getItem('token')); // diagnostico
    const loadContact = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8090/api/clientes/me', { headers: authHeaders() });
        if (res.status === 404) {
          setContact({ id: '', nombre: '', email: '', telefono: '', fechaNacimiento: '' });
          setError(null);
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Status ${res.status}: ${txt}`);
        }
        const data = await res.json();
        setContact({
          id: data.id || data.idCliente || '',
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          fechaNacimiento: (data.fechaNacimiento || '').substring(0,10),
          password: '',                 // ← vacíos al cargar
          confirmPassword: ''
        });
        setError(null);
      } catch (e) {
        setError(e.message || 'Error al cargar contacto');
      } finally {
        setLoading(false);
      }
    };
    loadContact();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Validación de contraseña (opcional)
      if (contact.password || contact.confirmPassword) {
        if (contact.password !== contact.confirmPassword) {
          alert('Las contraseñas no coinciden');
          return;
        }
        if (contact.password.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres');
          return;
        }
      }
      setSaving(true);
      const method = contact.id ? 'PUT' : 'POST';
      const url = contact.id
        ? `http://localhost:8090/api/clientes/${contact.id}`
        : 'http://localhost:8090/api/clientes';
      const fechaISO = contact.fechaNacimiento ? contact.fechaNacimiento : null;
      const body = {
        nombre: contact.nombre,
        apellido: contact.apellido,
        email: contact.email,
        telefono: contact.telefono,
        fechaNacimiento: fechaISO
      };
      if (contact.password) body.contrasena = contact.password; // ← clave que espera el backend
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      if (res.status === 401) throw new Error('No autorizado (token inválido)');
      if (res.status === 403) throw new Error('Prohibido (rol insuficiente o endpoint no permitido)');
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt}`);
      }
      const saved = await res.json();
      setContact(prev => ({ ...prev, id: saved.id || saved.idCliente || prev.id }));
      alert('Contacto guardado');
    } catch (e) {
      alert(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const logoutAndGoRoot = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/'); // ← redirige a raíz ./
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar contacto? Se cerrará sesión y volverás al inicio.')) return;
    try {
      if (contact.id) {
        await fetch(`http://localhost:8090/api/clientes/${contact.id}`, {
          method: 'DELETE',
          headers: authHeaders()
        }).catch(() => {});
      }
    } finally {
      logoutAndGoRoot(); // ← siempre cierra sesión y navega a ./
    }
  };

  const handleBack = () => navigate('/vuelos');

  if (loading) return <div className="contact-container"><p>Cargando contacto...</p></div>;

  return (
    <section className="contact-section">
      <div className="contact-container">
        <h2><i className="fas fa-id-card"></i> Contacto</h2>
        {error && <p style={{ color: '#b91c1c', fontWeight: 600 }}>Error: {error}</p>}
        <form className="contact-form" onSubmit={handleSave}>
          <div className="form-row">
            <label htmlFor="nombre"><i className="fas fa-user"></i> Nombre</label>
            <input id="nombre" name="nombre" type="text" value={contact.nombre} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label htmlFor="apellido"><i className="fas fa-user-tag"></i> Apellido</label>
            <input id="apellido" name="apellido" type="text" value={contact.apellido} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label htmlFor="email"><i className="fas fa-envelope"></i> Email</label>
            <input id="email" name="email" type="email" value={contact.email} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label htmlFor="telefono"><i className="fas fa-phone"></i> Teléfono</label>
            <input id="telefono" name="telefono" type="tel" value={contact.telefono} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label htmlFor="fechaNacimiento"><i className="fas fa-cake-candles"></i> Fecha de nacimiento</label>
            <input id="fechaNacimiento" name="fechaNacimiento" type="date" value={contact.fechaNacimiento} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label htmlFor="password"><i className="fas fa-lock"></i> Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              value={contact.password}
              onChange={handleChange}
              placeholder="Nueva contraseña (opcional)"
            />
          </div>
          <div className="form-row">
            <label htmlFor="confirmPassword"><i className="fas fa-lock"></i> Confirmar contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={contact.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-back" onClick={() => navigate('/vuelos')}>
              <i className="fas fa-arrow-left"></i> Volver
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <i className="fas fa-save"></i> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              <i className="fas fa-trash"></i> Eliminar y salir
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;