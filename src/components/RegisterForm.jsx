import { useState } from 'react';
import { useNavigate } from 'react-router-DOM';
import RegisterHeader from './RegisterHeader';

const calcularFuerza = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthLevels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
    const strengthColors = ['#ff4757', '#ff6b7a', '#ffa502', '#2ed573', '#1dd1a1'];
    
    return {
        level: strength,
        text: strengthLevels[strength] || strengthLevels[0],
        color: strengthColors[strength] || strengthColors[0]
    };
};

const RegisterForm = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        password: '',
        confirmPassword: ''
    });

    const [passwordStrength, setPasswordStrength] = useState({
        level: 0,
        text: 'Muy débil',
        color: '#ff4757'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        
        if (name === 'password') {
            const result = calcularFuerza(value);
            setPasswordStrength(result);
        }
    };
    
    const validateForm = (data) => {
        const m_error = {};

        if (data.firstName.length === 0) m_error.firstName = 'El campo Nombre no puede ir vacío';
        else if (data.firstName.length <= 2) m_error.firstName = 'Debe ingresar un nombre correcto';
        else if (/[0-9]/.test(data.firstName)) m_error.firstName = 'El nombre no debe contener números';
        else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(data.firstName)) m_error.firstName = 'El nombre solo debe contener letras';
        
        if (data.lastName.length === 0) m_error.lastName = 'El campo Apellido no puede ir vacío';
        else if (data.lastName.length <= 2) m_error.lastName = 'Debe ingresar un apellido correcto';
        else if (/[0-9]/.test(data.lastName)) m_error.lastName = 'El apellido no debe contener números';
        else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(data.lastName)) m_error.lastName = 'El apellido solo debe contener letras';

        if (data.email.length === 0) m_error.email = 'El correo no puede ir vacío';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) m_error.email = 'Debe ingresar un correo válido (ej: usuario@dominio.com)';

        if (data.phone.length === 0) m_error.phone = 'El teléfono no puede ir vacío';
        else {
            const digits = data.phone.replace(/\D/g, '');
            if (!/^[0-9]{8,15}$/.test(digits)) m_error.phone = 'El teléfono debe tener entre 8 y 15 dígitos (solo números)';
        }

        if (data.birthDate.length === 0) m_error.birthDate = 'Debe ingresar su fecha de nacimiento';

        if (data.password.length < 8) m_error.password = 'La contraseña debe tener al menos 8 caracteres';
        
        if (data.confirmPassword.length === 0) m_error.confirmPassword = 'Debe confirmar la contraseña';
        else if (data.password !== data.confirmPassword) m_error.confirmPassword = 'Las contraseñas no coinciden';

        return m_error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            const errorList = Object.values(validationErrors).join('\n ');
            alert(`¡Hubo un error!\n ${errorList}`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8090/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: formData.firstName,
                    apellido: formData.lastName,
                    email: formData.email,
                    fono: formData.phone,              
                    fechaNacimiento: formData.birthDate, 
                    password: formData.password
                })
            });

            // Obtener texto primero
            const text = await response.text();
            console.log('Respuesta del servidor:', text);

            // Parsear JSON solo si hay contenido
            let data = {};
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('Error parseando JSON:', text);
                    throw new Error('Respuesta inválida del servidor');
                }
            }

            // Verificar errores HTTP
            if (!response.ok) {
                throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
            }

            console.log('Registro exitoso:', data);
            alert('¡Registro exitoso! Redirigiendo al login...');
            
            // Guardar datos en localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    id: data.id,
                    email: data.email,
                    nombre: data.nombre,
                    apellido: data.apellido
                }));
            }
            
            setFormData({
                firstName: '', lastName: '', email: '', phone: '',
                birthDate: '', password: '', confirmPassword: ''
            });
            setPasswordStrength({ level: 0, text: 'Muy débil', color: '#ff4757' });
            setErrors({});
            
            navigate('/login');
            
        } catch (error) {
            console.error('Error en registro:', error);
            alert(`Error al registrar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <RegisterHeader />
            <div className="register-container">
                <form id="form-registro" onSubmit={handleSubmit}>
                    <div className="form-container">
                        <div className="form-header">
                            <h1>Únete a FlyTranportation</h1>
                            <p>Crea tu cuenta y descubre un mundo de beneficios exclusivos</p>
                        </div>
                        
                        <div className="form-step active" id="step-1">
                            <h2>Información Personal</h2>
                            <p className="step-description">Completa tus datos básicos para crear tu cuenta</p>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label htmlFor="firstName">Nombre</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-user"></i>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            placeholder="Tu nombre"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            disabled={loading}
                                            aria-invalid={!!errors.firstName}
                                            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                                        />
                                    </div>
                                    {errors.firstName && <p id="firstName-error" className="error-text">{errors.firstName}</p>}
                                </div>
                                
                                <div className="input-group">
                                    <label htmlFor="lastName">Apellido</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-user"></i>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            placeholder="Tu apellido"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            disabled={loading}
                                            aria-invalid={!!errors.lastName}
                                            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                                        />
                                    </div>
                                    {errors.lastName && <p id="lastName-error" className="error-text">{errors.lastName}</p>}
                                </div>
                                
                                <div className="input-group full-width">
                                    <label htmlFor="email">Correo Electrónico</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-envelope"></i>
                                        <input
                                            type="email" 
                                            id="email"
                                            name="email"
                                            placeholder="tu@email.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={loading}
                                            aria-invalid={!!errors.email}
                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                        />
                                    </div>
                                    {errors.email && <p id="email-error" className="error-text">{errors.email}</p>}
                                </div>

                                <div className="input-group">
                                    <label htmlFor="phone">Teléfono</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-phone"></i>
                                        <span className="country-code">+</span>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="1 234 567 8900"
                                            inputMode="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={loading}
                                            aria-invalid={!!errors.phone}
                                            aria-describedby={errors.phone ? 'phone-error' : undefined}
                                        />
                                    </div>
                                    {errors.phone && <p id="phone-error" className="error-text">{errors.phone}</p>}
                                </div>

                                <div className="input-group">
                                    <label htmlFor="birthDate">Fecha de Nacimiento</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-calendar"></i>
                                        <input
                                            type="date"
                                            id="birthDate"
                                            name="birthDate"
                                            value={formData.birthDate}
                                            onChange={handleChange}
                                            disabled={loading}
                                            aria-invalid={!!errors.birthDate}
                                            aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
                                        />
                                    </div>
                                    {errors.birthDate && <p id="birthDate-error" className="error-text">{errors.birthDate}</p>}
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password">Contraseña</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-lock"></i>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            placeholder="Mínimo 8 caracteres"
                                            value={formData.password}
                                            onChange={handleChange}
                                            disabled={loading}
                                            aria-invalid={!!errors.password}
                                            aria-describedby={errors.password ? 'password-error' : undefined}
                                        />
                                    </div>
                                    <div className="password-strength">
                                        <div className="strength-bar">
                                            <div 
                                                className="strength-fill" 
                                                style={{ 
                                                    width: `${(passwordStrength.level / 4) * 100}%`,
                                                    backgroundColor: passwordStrength.color
                                                }}
                                            ></div>
                                        </div>
                                        <span className="strength-text" style={{ color: passwordStrength.color }}>
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    {errors.password && <p id="password-error" className="error-text">{errors.password}</p>}
                                </div>
                                
                                <div className="input-group">
                                    <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                    <div className="input-wrapper">
                                        <i className="fas fa-lock"></i>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="Repite tu contraseña"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            disabled={loading}
                                            aria-invalid={!!errors.confirmPassword}
                                            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p id="confirmPassword-error" className="error-text">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="form-navigation">
                            <button 
                                className="btn-primary submit-btn" 
                                id="btn-crear-cuenta" 
                                type="submit"
                                disabled={loading}
                            >
                                <i className="fas fa-check"></i>
                                {loading ? 'Registrando...' : 'Crear Cuenta'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default RegisterForm;