import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-DOM';
import '../CSS/flightadmin.css';

const FlightAdmin = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [formData, setFormData] = useState({
    codigoVuelo: '',
    idVuelo: '',
    idAerolinea: '',
    idOrigen: '',
    origenText: '',
    idDestino: '',
    destinoText: '',
    fechaSalida: '',
    horaSalida: '',
     fechaLlegada: '',
    horaLlegada: '',
    duracionMin: '',
    precio: '',
    asientosDisp: '',
    asientosTotales: '',
    numeroEscalas: 0
  });
  const [suggestions, setSuggestions] = useState({ origen: [], destino: [] });
  const [showSuggestions, setShowSuggestions] = useState({ origen: false, destino: false });
  const [loadingSuggestions, setLoadingSuggestions] = useState({ origen: false, destino: false });

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const loadFlights = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8090/api/vuelos-programados', {
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Error al cargar vuelos');
      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAirlines = async () => {
    try {
      const res = await fetch('http://localhost:8090/api/aerolineas', {
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Error al cargar aerolíneas');
      const data = await res.json();
      setAirlines(Array.isArray(data) ? data : []);
    } catch (err) {
      setAirlines([]);
    }
  };

  const searchAirports = async (query, field) => {
    if (!query || query.length < 2) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      setShowSuggestions(prev => ({ ...prev, [field]: false }));
      return;
    }
    setLoadingSuggestions(prev => ({ ...prev, [field]: true }));
    try {
      const res = await fetch(`http://localhost:8090/api/lugares/buscar?q=${encodeURIComponent(query)}`, {
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Error buscando aeropuertos');
      const data = await res.json();
      const mapped = Array.isArray(data) ? data.map(a => ({
        id: a.idAeropuerto || a.id,
        codigo: a.codigoIata || a.codigo,
        ciudad: a.ciudad,
        pais: a.pais,
        nombre: a.nombre,
        label: `${a.ciudad}, ${a.pais} (${a.codigoIata || a.codigo})`
      })) : [];
      setSuggestions(prev => ({ ...prev, [field]: mapped }));
      setShowSuggestions(prev => ({ ...prev, [field]: true }));
      } catch (err) {
        setSuggestions(prev => ({ ...prev, [field]: [] }));
        setShowSuggestions(prev => ({ ...prev, [field]: false }));
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [field]: false }));
    }
  };

  useEffect(() => {
    loadFlights();
    loadAirlines();
  }, []);

  const handleAdd = () => {
    setEditingFlight(null);
    setFormData({
      codigoVuelo: '',
      idVuelo: '',
      idAerolinea: '',
      idOrigen: '',
      origenText: '',
      idDestino: '',
      destinoText: '',
      fechaSalida: '',
      horaSalida: '',
       fechaLlegada: '',
      horaLlegada: '',
      duracionMin: '',
      precio: '',
      asientosDisp: '',
      asientosTotales: '',
      numeroEscalas: 0
    });
    setSuggestions({ origen: [], destino: [], vuelo: [] });
    setShowSuggestions({ origen: false, destino: false, vuelo: false });
    setShowModal(true);
  };

  const handleEdit = (flight) => {
    setEditingFlight(flight);
    const origen = flight.vuelo?.origen;
    const destino = flight.vuelo?.destino;
    setFormData({
      codigoVuelo: flight.vuelo?.codigoVuelo || '',
      idVuelo: flight.vuelo?.idVuelo || '',
      idAerolinea: flight.vuelo?.aerolinea?.idAerolinea || '',
      idOrigen: origen?.idAeropuerto || '',
      origenText: origen ? `${origen.ciudad}, ${origen.pais} (${origen.codigoIata})` : '',
      idDestino: destino?.idAeropuerto || '',
      destinoText: destino ? `${destino.ciudad}, ${destino.pais} (${destino.codigoIata})` : '',
      fechaSalida: flight.fechaSalida || '',
      horaSalida: flight.horaSalida || '',
       fechaLlegada: flight.fechaLlegada || '',
      horaLlegada: flight.horaLlegada || '',
      duracionMin: flight.vuelo?.duracionMin || '',
      precio: flight.precio || '',
      asientosDisp: flight.asientosDisp || '',
      asientosTotales: flight.asientosTotales || '',
      numeroEscalas: flight.numeroEscalas || 0
    });
    setSuggestions({ origen: [], destino: [] });
    setShowSuggestions({ origen: false, destino: false });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este vuelo programado?')) return;
    try {
      const res = await fetch(`http://localhost:8090/api/vuelos-programados/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Error al eliminar');
      alert('✅ Vuelo eliminado');
      loadFlights();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFlight 
        ? `http://localhost:8090/api/vuelos-programados/${editingFlight.idVueloProg}`
        : 'http://localhost:8090/api/vuelos-programados';
      
      const method = editingFlight ? 'PUT' : 'POST';

      let vueloIdToUse = formData.idVuelo; // Si seleccionó de autocomplete, usar ese ID

      // Si no hay idVuelo (nuevo vuelo), crear/actualizar el Vuelo
      if (!vueloIdToUse || editingFlight?.vuelo?.idVuelo) {
        const codigoVuelo = formData.codigoVuelo?.trim();
        if (!codigoVuelo) throw new Error('El código de vuelo es obligatorio');

        const vueloPayload = {
          codigoVuelo,
          aerolinea: { idAerolinea: parseInt(formData.idAerolinea, 10) },
          origen: { idAeropuerto: parseInt(formData.idOrigen, 10) },
          destino: { idAeropuerto: parseInt(formData.idDestino, 10) },
          duracionMin: formData.duracionMin ? parseInt(formData.duracionMin, 10) : 0
        };

        let savedVuelo = null;

        if (editingFlight?.vuelo?.idVuelo) {
          const vueloRes = await fetch(`http://localhost:8090/api/vuelos/${editingFlight.vuelo.idVuelo}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ ...vueloPayload, idVuelo: editingFlight.vuelo.idVuelo })
          });
          if (!vueloRes.ok) throw new Error('Error al actualizar vuelo base');
          savedVuelo = await vueloRes.json();
        } else {
          const vueloRes = await fetch('http://localhost:8090/api/vuelos', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(vueloPayload)
          });
          if (!vueloRes.ok) throw new Error('Error al crear vuelo base');
          savedVuelo = await vueloRes.json();
        }

        if (!savedVuelo?.idVuelo) {
          throw new Error('No se recibió idVuelo del backend');
        }
        vueloIdToUse = savedVuelo.idVuelo;
      }

      const body = {
        vuelo: { idVuelo: vueloIdToUse },
        fechaSalida: formData.fechaSalida,
        horaSalida: formData.horaSalida,
        fechaLlegada: formData.fechaLlegada,
        horaLlegada: formData.horaLlegada,
        precio: parseFloat(formData.precio),
        asientosDisp: parseInt(formData.asientosDisp, 10),
        asientosTotales: parseInt(formData.asientosTotales, 10),
        numeroEscalas: parseInt(formData.numeroEscalas, 10)
      };

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Error al guardar');
      
      alert(editingFlight ? '✅ Vuelo actualizado' : '✅ Vuelo creado');
      setShowModal(false);
      loadFlights();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Buscar aeropuertos mientras escribe
    if (name === 'origenText') {
      setFormData(prev => ({ ...prev, idOrigen: '' }));
      const timer = setTimeout(() => searchAirports(value, 'origen'), 300);
      return () => clearTimeout(timer);
    }
    if (name === 'destinoText') {
      setFormData(prev => ({ ...prev, idDestino: '' }));
      const timer = setTimeout(() => searchAirports(value, 'destino'), 300);
      return () => clearTimeout(timer);
    }
  };

  const selectAirport = (field, airport) => {
    if (field === 'origen') {
      setFormData(prev => ({
        ...prev,
        idOrigen: airport.id,
        origenText: airport.label
      }));
      setShowSuggestions(prev => ({ ...prev, origen: false }));
    } else if (field === 'destino') {
      setFormData(prev => ({
        ...prev,
        idDestino: airport.id,
        destinoText: airport.label
      }));
      setShowSuggestions(prev => ({ ...prev, destino: false }));
    }
  };

  const handleBack = () => navigate('/vuelos');

  if (loading) {
    return (
      <div className="admin-container">
        <p><i className="fas fa-spinner fa-spin"></i> Cargando vuelos...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1><i className="fas fa-plane-departure"></i> Administración de Vuelos</h1>
        <div className="admin-actions">
          <button className="btn-add" onClick={handleAdd}>
            <i className="fas fa-plus"></i> Agregar Vuelo
          </button>
          <button className="btn-back" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      <div className="flights-table-container">
        <table className="flights-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aerolínea</th>
              <th>Origen → Destino</th>
              <th>Fecha</th>
              <th>Salida</th>
              <th>Llegada</th>
              <th>Precio</th>
              <th>Asientos</th>
              <th>Escalas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {flights.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                  No hay vuelos registrados
                </td>
              </tr>
            ) : (
              flights.map(flight => (
                <tr key={flight.idVueloProg}>
                  <td>{flight.idVueloProg}</td>
                  <td>
                    <div className="airline-cell">
                      <strong>{flight.vuelo?.aerolinea?.nombre || 'N/A'}</strong>
                      <small>{flight.vuelo?.aerolinea?.codigo || ''}</small>
                    </div>
                  </td>
                  <td>
                    <div className="route-cell">
                      <span>{flight.vuelo?.origen?.ciudad || 'N/A'} ({flight.vuelo?.origen?.codigoIata || ''})</span>
                      <i className="fas fa-arrow-right"></i>
                      <span>{flight.vuelo?.destino?.ciudad || 'N/A'} ({flight.vuelo?.destino?.codigoIata || ''})</span>
                    </div>
                  </td>
                  <td>{flight.fechaSalida || 'N/A'}</td>
                  <td>{flight.horaSalida || 'N/A'}</td>
                  <td>{flight.horaLlegada || 'N/A'}</td>
                  <td>${flight.precio || 0}</td>
                  <td>{flight.asientosDisp || 0}</td>
                  <td>{flight.numeroEscalas || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEdit(flight)}
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDelete(flight.idVueloProg)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-plane"></i>
                {editingFlight ? ' Editar Vuelo' : ' Agregar Vuelo'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flight-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="codigoVuelo">
                    <i className="fas fa-ticket-alt"></i> Código de Vuelo
                  </label>
                  <input
                    id="codigoVuelo"
                    name="codigoVuelo"
                    type="text"
                    value={formData.codigoVuelo}
                    onChange={handleChange}
                    placeholder="Ej: LA1234"
                    maxLength="10"
                    required
                  />
                </div>

                <div className="form-group airline-full">
                  <label htmlFor="idAerolinea">
                    <i className="fas fa-plane"></i> Aerolínea
                  </label>
                  <select
                    id="idAerolinea"
                    name="idAerolinea"
                    value={formData.idAerolinea}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una aerolínea</option>
                    {airlines.map(airline => (
                      <option key={airline.idAerolinea} value={airline.idAerolinea}>
                        {airline.nombre} ({airline.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group autocomplete-wrapper">
                  <label htmlFor="origenText">
                    <i className="fas fa-plane-departure"></i> Origen
                  </label>
                  <input
                    id="origenText"
                    name="origenText"
                    type="text"
                    value={formData.origenText}
                    onChange={handleChange}
                    placeholder="Buscar ciudad o código"
                    autoComplete="off"
                    required
                  />
                  {loadingSuggestions.origen && (
                    <span className="loading-spinner-small">
                      <i className="fas fa-spinner fa-spin"></i>
                    </span>
                  )}
                  {showSuggestions.origen && suggestions.origen.length > 0 && (
                    <ul className="autocomplete-list">
                      {suggestions.origen.map(airport => (
                        <li key={airport.id} onClick={() => selectAirport('origen', airport)}>
                          <i className="fas fa-location-dot"></i>
                          <div>
                            <strong>{airport.ciudad}, {airport.pais}</strong>
                            <small>{airport.nombre} ({airport.codigo})</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="form-group autocomplete-wrapper">
                  <label htmlFor="destinoText">
                    <i className="fas fa-plane-arrival"></i> Destino
                  </label>
                  <input
                    id="destinoText"
                    name="destinoText"
                    type="text"
                    value={formData.destinoText}
                    onChange={handleChange}
                    placeholder="Buscar ciudad o código"
                    autoComplete="off"
                    required
                  />
                  {loadingSuggestions.destino && (
                    <span className="loading-spinner-small">
                      <i className="fas fa-spinner fa-spin"></i>
                    </span>
                  )}
                  {showSuggestions.destino && suggestions.destino.length > 0 && (
                    <ul className="autocomplete-list">
                      {suggestions.destino.map(airport => (
                        <li key={airport.id} onClick={() => selectAirport('destino', airport)}>
                          <i className="fas fa-location-dot"></i>
                          <div>
                            <strong>{airport.ciudad}, {airport.pais}</strong>
                            <small>{airport.nombre} ({airport.codigo})</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="fechaSalida">
                    <i className="fas fa-calendar"></i> Fecha de Salida
                  </label>
                  <input
                    id="fechaSalida"
                    name="fechaSalida"
                    type="date"
                    value={formData.fechaSalida}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="horaSalida">
                    <i className="fas fa-clock"></i> Hora de Salida
                  </label>
                  <input
                    id="horaSalida"
                    name="horaSalida"
                    type="time"
                    value={formData.horaSalida}
                    onChange={handleChange}
                    required
                  />
                </div>

                 <div className="form-group">
                   <label htmlFor="fechaLlegada">
                     <i className="fas fa-calendar"></i> Fecha de Llegada
                   </label>
                   <input
                     id="fechaLlegada"
                     name="fechaLlegada"
                     type="date"
                     value={formData.fechaLlegada}
                     onChange={handleChange}
                     required
                   />
                 </div>

                <div className="form-group">
                  <label htmlFor="horaLlegada">
                    <i className="fas fa-clock"></i> Hora de Llegada
                  </label>
                  <input
                    id="horaLlegada"
                    name="horaLlegada"
                    type="time"
                    value={formData.horaLlegada}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duracionMin">
                    <i className="fas fa-hourglass-half"></i> Duración (minutos)
                  </label>
                  <input
                    id="duracionMin"
                    name="duracionMin"
                    type="number"
                    min="0"
                    value={formData.duracionMin}
                    onChange={handleChange}
                    placeholder="Ej: 90"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precio">
                    <i className="fas fa-dollar-sign"></i> Precio (USD)
                  </label>
                  <input
                    id="precio"
                    name="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="asientosDisp">
                    <i className="fas fa-chair"></i> Asientos Disponibles
                  </label>
                  <input
                    id="asientosDisp"
                    name="asientosDisp"
                    type="number"
                    value={formData.asientosDisp}
                    onChange={handleChange}
                    required
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="asientosTotales">
                    <i className="fas fa-couch"></i> Asientos Totales
                  </label>
                  <input
                    id="asientosTotales"
                    name="asientosTotales"
                    type="number"
                    value={formData.asientosTotales}
                    onChange={handleChange}
                    required
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="numeroEscalas">
                    <i className="fas fa-route"></i> Número de Escalas
                  </label>
                  <input
                    id="numeroEscalas"
                    name="numeroEscalas"
                    type="number"
                    value={formData.numeroEscalas}
                    onChange={handleChange}
                    required
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  <i className="fas fa-save"></i> Guardar
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times"></i> Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightAdmin;
