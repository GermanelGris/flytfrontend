import React, { useState, useEffect } from 'react';
import FlightCard from './FlightCard';
import FlightSearch from './FlightSearch';
import ChartSection from './ChartSection'; // Asegúrate de que la ruta sea correcta

const FlightList = () => {
    const [flightsData, setFlightsData] = useState([]);
    const [filteredFlights, setFilteredFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar vuelos desde la API
    useEffect(() => {
        const fetchFlights = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8090/api/vuelos-programados', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Datos de la API:', data); // Debug
                
                // Mapear los datos de la API al formato que espera FlightCard
                const mappedFlights = Array.isArray(data) ? data.map(vp => {
                    const { vuelo, fechaSalida, horaSalida, horaLlegada, precio, asientosDisp, numeroEscalas } = vp;
                    const durMin = vuelo?.duracionMin ?? 0;
                    const durH = Math.floor(durMin / 60);
                    const durM = durMin % 60;
                    return {
                        id: vp.idVueloProg,
                        // Campos para gráficos
                        dateISO: fechaSalida || '',
                        price: Number(precio ?? 0),
                        stops: Number(numeroEscalas ?? 0),
                        seats: Number(asientosDisp ?? 0),
                        // Campos para tarjetas y filtros
                        airline: vuelo?.aerolinea?.nombre || '',
                        airlineCode: vuelo?.aerolinea?.codigo || '',
                        flightNumber: vuelo?.codigoVuelo || '',
                        departureCode: vuelo?.origen?.codigoIata || '',
                        departureCity: vuelo?.origen?.ciudad || '',
                        departurePais: vuelo?.origen?.pais || '',
                        arrivalCode: vuelo?.destino?.codigoIata || '',
                        arrivalCity: vuelo?.destino?.ciudad || '',
                        arrivalPais: vuelo?.destino?.pais || '',
                        departureTime: horaSalida ? horaSalida.substring(0,5) : '',
                        arrivalTime: horaLlegada ? horaLlegada.substring(0,5) : '',
                        duration: `${durH}h ${durM}m`,

                        date: fechaSalida 
                              ? new Date(fechaSalida).toLocaleDateString('es-ES',{ day:'2-digit', month:'short', year:'numeric' }) 
                              : ''
                    };
                }) : [];

                setFlightsData(mappedFlights);
                setFilteredFlights(mappedFlights);
                setError(null);
            } catch (err) {
                console.error('Error cargando vuelos:', err);
                setError(err.message || 'Error al cargar los vuelos');
            } finally {
                setLoading(false);
            }
        };

        fetchFlights();
    }, []);

    const handleSearch = (filters) => {
        let results = flightsData;

        if (filters.originCode?.trim()) {
            const code = filters.originCode.toLowerCase();
            results = results.filter(f => f.departureCode?.toLowerCase() === code);
        } else if (filters.origin?.trim()) {
            const q = filters.origin.toLowerCase();
            results = results.filter(f =>
                f.departureCode?.toLowerCase().includes(q) ||
                f.departureCity?.toLowerCase().includes(q) ||
                f.departurePais?.toLowerCase().includes(q)
            );
        }

        if (filters.destinationCode?.trim()) {
            const code = filters.destinationCode.toLowerCase();
            results = results.filter(f => f.arrivalCode?.toLowerCase() === code);
        } else if (filters.destination?.trim()) {
            const q = filters.destination.toLowerCase();
            results = results.filter(f =>
                f.arrivalCode?.toLowerCase().includes(q) ||
                f.arrivalCity?.toLowerCase().includes(q) ||
                f.arrivalPais?.toLowerCase().includes(q)
            );
        }

        if (filters.airlineCode?.trim()) {
            const ac = filters.airlineCode.toLowerCase();
            results = results.filter(f => f.airlineCode?.toLowerCase() === ac);
        } else if (filters.airline?.trim()) {
            const q = filters.airline.toLowerCase();
            results = results.filter(f => f.airline?.toLowerCase().includes(q));
        }

        if (filters.departureDate?.trim()) {
            results = results.filter(f => f.dateISO === filters.departureDate);
        }

        setFilteredFlights(results);
    };

    if (loading) {
        return (
            <div className="flights-page">
                <div className="flights-loading" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    gap: '1rem'
                }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#3b82f6' }}></i>
                    <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Cargando vuelos disponibles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flights-page">
                <div className="flights-error" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    gap: '1rem',
                    padding: '2rem'
                }}>
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#ef4444' }}></i>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', textAlign: 'center' }}>
                        Error al cargar los vuelos: {error}
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flights-page">
            <FlightSearch onSearch={handleSearch} />

            <div className="flights-container">
                <div className="flights-header">
                    <h2>Vuelos disponibles</h2>
                    <p>{filteredFlights.length} vuelo{filteredFlights.length !== 1 ? 's' : ''} encontrado{filteredFlights.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="flights-grid">
                    {filteredFlights.length > 0 ? (
                        filteredFlights.map(flight => (
                            <FlightCard key={flight.id} flight={flight} />
                        ))
                    ) : (
                        <div className="no-flights" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3rem',
                            gap: '1rem'
                        }}>
                            <i className="fas fa-search" style={{ fontSize: '3rem', color: '#94a3b8' }}></i>
                            <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                                No se encontraron vuelos con los criterios de búsqueda
                            </p>
                        </div>
                    )}
                </div>
            </div>

            
        </div>
    );
};

export default FlightList;

