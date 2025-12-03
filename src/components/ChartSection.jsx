import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-DOM';  
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, ArcElement);

function ChartSection() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:8090/api/vuelos-programados', {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Error cargando vuelos');
        const data = await res.json();
        const mapped = Array.isArray(data) ? data.map(vp => {
          const { vuelo, fechaSalida, horaSalida, horaLlegada, precio, asientosDisp, numeroEscalas } = vp;
          const durMin = vuelo?.duracionMin ?? 0;
          return {
            id: vp.idVueloProg,
            dateISO: fechaSalida || '',
            price: Number(precio ?? 0),
            stops: Number(numeroEscalas ?? 0),
            seats: Number(asientosDisp ?? 0),
            airline: vuelo?.aerolinea?.nombre || '',
            airlineCode: vuelo?.aerolinea?.codigo || '',
            departureCode: vuelo?.origen?.codigoIata || '',
            arrivalCode: vuelo?.destino?.codigoIata || '',
            departureTime: horaSalida ? horaSalida.substring(0,5) : '',
            arrivalTime: horaLlegada ? horaLlegada.substring(0,5) : '',
            duration: `${Math.floor(durMin/60)}h ${durMin%60}m`
          };
        }) : [];
        setFlights(mapped);
      } catch {
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const byDate = useMemo(() => {
    const m = {};
    flights.forEach(f => {
      if (!f.dateISO) return;
      if (!m[f.dateISO]) m[f.dateISO] = { c: 0, p: 0 };
      m[f.dateISO].c++;
      m[f.dateISO].p += f.price;
    });
    const labels = Object.keys(m).sort();
    return { labels, counts: labels.map(l => m[l].c), avgPrices: labels.map(l => +(m[l].p / m[l].c).toFixed(2)) };
  }, [flights]);

  const byStops = useMemo(() => {
    let zero=0, one=0, more=0;
    flights.forEach(f => {
      const s = f.stops;
      if (s <= 0) zero++; else if (s === 1) one++; else more++;
    });
    return { labels: ['Directo (0)','1 escala','2+ escalas'], data: [zero, one, more] };
  }, [flights]);

  const flightsPerDayData = { labels: byDate.labels, datasets: [{ label: 'Vuelos por día', data: byDate.counts, backgroundColor: 'rgba(102,126,234,0.8)' }] };
  const avgPriceByDayData = { labels: byDate.labels, datasets: [{ label: 'Precio promedio (USD)', data: byDate.avgPrices, borderColor: '#ff6384', backgroundColor: 'rgba(255,99,132,0.2)', tension: 0.3 }] };
  const stopsPieData = { labels: byStops.labels, datasets: [{ data: byStops.data, backgroundColor: ['#22c55e','#f59e0b','#ef4444'] }] };

  const empty = !loading && flights.length === 0;

  return (
    <section className="chart-section">
      <div className="chart-container">
        <h2 className="chart-title"><i className="fas fa-chart-bar" /> Análisis de Vuelos</h2>
        {loading && <p>Cargando...</p>}
        {empty && <p>Sin datos.</p>}
        {!loading && !empty && (
          <div className="charts-grid">
            <div className="chart-card"><Bar data={flightsPerDayData} /></div>
            <div className="chart-card"><Line data={avgPriceByDayData} /></div>
            <div className="chart-card"><Pie data={stopsPieData} /></div>
          </div>
        )}
      </div>
      <div className="chart-footer">
        <button className="btn-back-home-footer" onClick={() => navigate('/vuelos')}>
          <i className="fas fa-arrow-left" /> Volver al Main
        </button>
      </div>
    </section>
  );
}

export default ChartSection;