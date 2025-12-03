import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-DOM';

const SearchForm = ({ isAuthenticated = false }) => {
  const navigate = useNavigate();
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fSalida, setFSalida] = useState('');
  const [fRegreso, setFRegreso] = useState('');
  const [pasajerosAdultos, setPasajerosAdultos] = useState('1 Adulto');
  const [pasajerosNinos, setPasajerosNinos] = useState('sin niño');
  const [lugaresTuristicos, setLugaresTuristicos] = useState([]);
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const cargarLugaresTuristicos = async () => {
      try {
        const respuesta = await fetch("./data/lugares-turisticos.json");
        const data = await respuesta.json();
        setLugaresTuristicos(data);
      } catch (error) {
        console.error('Error al cargar los lugares turísticos:', error);
      }
    };
    cargarLugaresTuristicos();

    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaHoy = `${anio}-${mes}-${dia}`;
    setFSalida(fechaHoy);
    setFRegreso(fechaHoy);
  }, []);

  useEffect(() => {
    if (fSalida) {
      setFRegreso(prevRegreso => (prevRegreso < fSalida ? fSalida : prevRegreso));
    }
  }, [fSalida]);

  const mostrarSugerencias = (inputVal, tipo) => {
    if (inputVal.length === 0) {
      if (tipo === 'origen') setSugerenciasOrigen([]);
      if (tipo === 'destino') setSugerenciasDestino([]);
      return;
    }

    const coincidencias = lugaresTuristicos.filter(lugar =>
      lugar.nombre.toLowerCase().startsWith(inputVal.toLowerCase()) ||
      lugar.ciudad.toLowerCase().startsWith(inputVal.toLowerCase()) ||
      lugar.pais.toLowerCase().startsWith(inputVal.toLowerCase())
    );

    if (tipo === 'origen') setSugerenciasOrigen(coincidencias);
    if (tipo === 'destino') setSugerenciasDestino(coincidencias);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const m_error = [];

    if (origen.trim().length === 0) m_error.push('El Origen no puede ir vacío');
    if (destino.trim().length === 0) m_error.push('El Destino no puede ir vacío');
    if (fSalida.length === 0) m_error.push('Debe Elegir una fecha de Salida');

    if (m_error.length > 0) {
      alert(`¡Hubo un error!\n  ${m_error.join('\n ')}`);
      return;
    }

    // si no está autenticado mostrar modal para logear/registrar
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // aquí la lógica de búsqueda / redirección si está autenticado
    window.location.href = "/vuelos";
  };

  return (
    <main>
      <form onSubmit={handleSearch}>
        <section className="buscar">
          <div className="buscar-background">
            <div className="buscar-overlay"></div>
          </div>
          <div className="buscar-content">
            <div className="container">
              <h1 className="buscar-title">Vuela hacia tus sueños</h1>
              <p className="buscar-subtitle">Descubre el mundo con <strong>Fly Transportation (FlyT)</strong>. Ofertas exclusivas y el mejor servicio te esperan.</p>
              <div className="search-form">
                <div className="search-fields">
                  <div className="field-group">
                    <div className="input-field">
                      <i className="fas fa-plane-departure"></i>
                      <div className="input-content">
                        <label htmlFor="origen">Origen</label>
                        <input
                          type="text"
                          id="origen"
                          placeholder="Desde"
                          value={origen}
                          onChange={(e) => {
                            setOrigen(e.target.value);
                            mostrarSugerencias(e.target.value, 'origen');
                          }}
                        />
                        {sugerenciasOrigen.length > 0 && (
                          <ul className="sugerencias-lista">
                            {sugerenciasOrigen.map((lugar, index) => (
                              <li key={index} onClick={() => {
                                setOrigen(lugar.nombre);
                                setSugerenciasOrigen([]);
                              }}>
                                {`${lugar.nombre}, ${lugar.ciudad}, ${lugar.pais}`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="input-field">
                      <i className="fas fa-plane-arrival"></i>
                      <div className="input-content">
                        <label htmlFor="destino">Destino</label>
                        <input
                          type="text"
                          id="destino"
                          name="destino"
                          placeholder="Hacia"
                          value={destino}
                          onChange={(e) => {
                            setDestino(e.target.value);
                            mostrarSugerencias(e.target.value, 'destino');
                          }}
                        />
                        {sugerenciasDestino.length > 0 && (
                          <ul className="sugerencias-lista">
                            {sugerenciasDestino.map((lugar, index) => (
                              <li key={index} onClick={() => {
                                setDestino(lugar.nombre);
                                setSugerenciasDestino([]);
                              }}>
                                {`${lugar.nombre}, ${lugar.ciudad}, ${lugar.pais}`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="field-group">
                    <div className="input-field">
                      <i className="fas fa-calendar"></i>
                      <div className="input-content">
                        <label>Salida</label>
                        <input
                          type="date"
                          id="f-salida"
                          value={fSalida}
                          onChange={(e) => setFSalida(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="input-field">
                      <i className="fas fa-calendar"></i>
                      <div className="input-content">
                        <label>Regreso</label>
                        <input
                          type="date"
                          id="f-regreso"
                          min={fSalida}
                          value={fRegreso}
                          onChange={(e) => setFRegreso(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="input-field">
                      <i className="fas fa-users"></i>
                      <div className="input-content">
                        <label>Pasajeros</label>
                        <select
                          value={pasajerosAdultos}
                          onChange={(e) => setPasajerosAdultos(e.target.value)}
                        >
                          <option>1 Adulto</option>
                          <option>2 Adultos</option>
                          <option>3 Adultos</option>
                          <option>4+ Adultos</option>
                        </select>
                      </div>
                    </div>
                    <div className="input-field">
                      <i className="fas fa-users"></i>
                      <div className="input-content">
                        <label>Pasajeros</label>
                        <select
                          value={pasajerosNinos}
                          onChange={(e) => setPasajerosNinos(e.target.value)}
                        >
                          <option>sin niño</option>
                          <option>1 niño</option>
                          <option>2 niños</option>
                          <option>3 niños</option>
                          <option>4+ niños</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="search-btn" type="submit">
                  <i className="fas fa-search"></i>
                  Buscar Vuelos
                </button>
              </div>
            </div>
          </div>
        </section>
      </form>

      {showAuthModal && (
        <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <div className="auth-modal-card">
            <h2 id="auth-modal-title">Necesitas una cuenta</h2>
            <p>Para buscar y reservar vuelos debes iniciar sesión o crear una cuenta.</p>
            <div className="auth-modal-actions">
              <button
                className="btn-primary"
                onClick={() => navigate('/login')}
                aria-label="Ir a iniciar sesión"
              >
                Iniciar sesión
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate('/registro')}
                aria-label="Ir a registrarme"
              >
                Registrarme
              </button>
            </div>
            <button className="auth-modal-close" onClick={() => setShowAuthModal(false)} aria-label="Cerrar">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SearchForm;
