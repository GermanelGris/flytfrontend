import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../CSS/flightsearch.css';

const FlightSearch = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    origin: '', originCode: '',
    destination: '', destinationCode: '',
    departureDate: '',
    airline: '', airlineCode: ''
  });

  const [suggestions, setSuggestions] = useState({ origin: [], destination: [], airline: [] });
  const [showSuggestions, setShowSuggestions] = useState({ origin: false, destination: false, airline: false });
  const [loading, setLoading] = useState({ origin: false, destination: false, airline: false });

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const airlineRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (originRef.current && !originRef.current.contains(e.target)) setShowSuggestions(p => ({ ...p, origin: false }));
      if (destinationRef.current && !destinationRef.current.contains(e.target)) setShowSuggestions(p => ({ ...p, destination: false }));
      if (airlineRef.current && !airlineRef.current.contains(e.target)) setShowSuggestions(p => ({ ...p, airline: false }));
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const fetchAeropuertos = useCallback(async (query, field) => {
    if (!query || query.length < 2) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      setShowSuggestions(prev => ({ ...prev, [field]: false }));
      return;
    }
    setLoading(prev => ({ ...prev, [field]: true }));
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`http://localhost:8090/api/aeropuertos/buscar?q=${encodeURIComponent(query)}`, { headers });
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
    } catch (e) {
      setSuggestions(prev => ({ ...prev, [field]: [] }));
      setShowSuggestions(prev => ({ ...prev, [field]: false }));
    } finally {
      setLoading(prev => ({ ...prev, [field]: false }));
    }
  }, []);

  const fetchAerolineas = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions(prev => ({ ...prev, airline: [] }));
      setShowSuggestions(prev => ({ ...prev, airline: false }));
      return;
    }
    setLoading(prev => ({ ...prev, airline: true }));
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`http://localhost:8090/api/aerolineas/buscar?q=${encodeURIComponent(query)}`, { headers });
      if (!res.ok) throw new Error('Error buscando aerolíneas');
      const data = await res.json();
      const mapped = Array.isArray(data) ? data.map(al => ({
        id: al.idAerolinea || al.id,
        nombre: al.nombre,
        codigo: al.codigo,
        label: `${al.nombre} (${al.codigo})`
      })) : [];
      setSuggestions(prev => ({ ...prev, airline: mapped }));
      setShowSuggestions(prev => ({ ...prev, airline: true }));
    } catch (e) {
      setSuggestions(prev => ({ ...prev, airline: [] }));
      setShowSuggestions(prev => ({ ...prev, airline: false }));
    } finally {
      setLoading(prev => ({ ...prev, airline: false }));
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (formData.origin) fetchAeropuertos(formData.origin, 'origin'); }, 300);
    return () => clearTimeout(t);
  }, [formData.origin, fetchAeropuertos]);

  useEffect(() => {
    const t = setTimeout(() => { if (formData.destination) fetchAeropuertos(formData.destination, 'destination'); }, 300);
    return () => clearTimeout(t);
  }, [formData.destination, fetchAeropuertos]);

  useEffect(() => {
    const t = setTimeout(() => { if (formData.airline) fetchAerolineas(formData.airline); }, 300);
    return () => clearTimeout(t);
  }, [formData.airline, fetchAerolineas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Si se escribe manualmente, limpiamos códigos
    if (name === 'origin') setFormData(prev => ({ ...prev, originCode: '' }));
    if (name === 'destination') setFormData(prev => ({ ...prev, destinationCode: '' }));
    if (name === 'airline') setFormData(prev => ({ ...prev, airlineCode: '' }));
  };

  const selectSuggestion = (field, s) => {
    if (field === 'origin') setFormData(prev => ({ ...prev, origin: s.label, originCode: s.codigo }));
    if (field === 'destination') setFormData(prev => ({ ...prev, destination: s.label, destinationCode: s.codigo }));
    if (field === 'airline') setFormData(prev => ({ ...prev, airline: s.nombre, airlineCode: s.codigo }));
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      origin: formData.origin,
      originCode: formData.originCode,
      destination: formData.destination,
      destinationCode: formData.destinationCode,
      departureDate: formData.departureDate,
      airline: formData.airline,
      airlineCode: formData.airlineCode
    });
  };

  const handleClear = () => {
    const empty = { origin: '', originCode: '', destination: '', destinationCode: '', departureDate: '', airline: '', airlineCode: '' };
    setFormData(empty);
    setSuggestions({ origin: [], destination: [], airline: [] });
    setShowSuggestions({ origin: false, destination: false, airline: false });
    onSearch(empty);
  };

  return (
    <div className="flight-search-container">
      <form onSubmit={handleSubmit} className="flight-search-form">
        <div className="search-field" ref={originRef}>
          <label htmlFor="origin"><i className="fas fa-plane-departure"></i> Origen</label>
          <input id="origin" name="origin" type="text" placeholder="Ciudad o código" value={formData.origin} onChange={handleChange} autoComplete="off" />
          {loading.origin && <span className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></span>}
          {showSuggestions.origin && suggestions.origin.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.origin.map(s => (
                <li key={s.id} onClick={() => selectSuggestion('origin', s)}>
                  <i className="fas fa-location-dot"></i>
                  <div><strong>{s.ciudad}, {s.pais}</strong><small>{s.nombre} ({s.codigo})</small></div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="search-field" ref={destinationRef}>
          <label htmlFor="destination"><i className="fas fa-plane-arrival"></i> Destino</label>
          <input id="destination" name="destination" type="text" placeholder="Ciudad o código" value={formData.destination} onChange={handleChange} autoComplete="off" />
          {loading.destination && <span className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></span>}
          {showSuggestions.destination && suggestions.destination.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.destination.map(s => (
                <li key={s.id} onClick={() => selectSuggestion('destination', s)}>
                  <i className="fas fa-location-dot"></i>
                  <div><strong>{s.ciudad}, {s.pais}</strong><small>{s.nombre} ({s.codigo})</small></div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="search-field">
          <label htmlFor="departureDate"><i className="fas fa-calendar-alt"></i> Fecha de salida</label>
          <input id="departureDate" name="departureDate" type="date" value={formData.departureDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="search-field" ref={airlineRef}>
          <label htmlFor="airline"><i className="fas fa-plane"></i> Aerolínea (opcional)</label>
          <input id="airline" name="airline" type="text" placeholder="Buscar aerolínea" value={formData.airline} onChange={handleChange} autoComplete="off" />
          {loading.airline && <span className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></span>}
          {showSuggestions.airline && suggestions.airline.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.airline.map(s => (
                <li key={s.id} onClick={() => selectSuggestion('airline', s)}>
                  <i className="fas fa-plane"></i>
                  <div><strong>{s.nombre}</strong><small>{s.codigo}</small></div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="search-buttons">
          <button type="submit" className="btn-search"><i className="fas fa-search"></i> Buscar vuelos</button>
          <button type="button" className="btn-clear" onClick={handleClear}><i className="fas fa-times"></i> Limpiar</button>
        </div>
      </form>
    </div>
  );
};

export default FlightSearch;

