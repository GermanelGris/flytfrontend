import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-DOM'; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function DataTable() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar destinos desde la API de vuelos programados
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:8090/api/vuelos-programados', {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Error al cargar datos');
        const data = await res.json();

        // Mapear a estructura para tabla (evita duplicados por destino usando código IATA)
        const destinosMap = {};
        data.forEach(vp => {
          const destino = vp?.vuelo?.destino;
            // Evita nulls
          if (!destino) return;
          const key = destino.codigoIata || destino.ciudad;
          if (!destinosMap[key]) {
            destinosMap[key] = {
              id: vp.idVueloProg,
              nombre: destino.ciudad || destino.nombre || 'N/A',
              codigo: destino.codigoIata || '---',
              pais: destino.pais || '',
              precio: Number(vp.precio ?? 0),
              stock: Number(vp.asientosDisp ?? 0)
            };
          } else {
            // Actualiza a menor precio y mayor stock si aparece otro vuelo
            destinosMap[key].precio = Math.min(destinosMap[key].precio, Number(vp.precio ?? 0));
            destinosMap[key].stock = Math.max(destinosMap[key].stock, Number(vp.asientosDisp ?? 0));
          }
        });

        setRows(Object.values(destinosMap));
      } catch (e) {
        setError(e.message || 'Error desconocido');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const exportToExcel = () => {
    if (!rows.length) return;
    // Preparar datos limpios
    const exportRows = rows.map(r => ({
      ID: r.id,
      Destino: r.nombre,
      Codigo_IATA: r.codigo,
      Pais: r.pais,
      Precio_USD: r.precio,
      Asientos_Disponibles: r.stock
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Destinos');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `destinos_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const handleGoHome = () => navigate('/vuelos');

  if (loading) return <p>Cargando destinos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className='section'>
      <div className="container">
        <h2 className="mb-4">
          <i className="fas fa-globe"></i> Destinos Disponibles
        </h2>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th><i className="fas fa-hashtag"></i> ID</th>
                <th><i className="fas fa-map-marker-alt"></i> Destino</th>
                <th><i className="fas fa-tag"></i> Código</th>
                <th><i className="fas fa-flag"></i> País</th>
                <th><i className="fas fa-dollar-sign"></i> Precio</th>
                <th><i className="fas fa-box"></i> Disponibilidad</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td data-label="ID">{r.id}</td>
                  <td data-label="Destino">{r.nombre}</td>
                  <td data-label="Código">{r.codigo}</td>
                  <td data-label="País">{r.pais}</td>
                  <td data-label="Precio">${r.precio.toLocaleString()}</td>
                  <td data-label="Disponibilidad">
                    <span className={`stock-badge ${r.stock > 10 ? 'high' : r.stock > 5 ? 'medium' : 'low'}`}>
                      {r.stock} asientos
                    </span>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6}>Sin datos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="button-group">
          <button className='btn btn-success' onClick={exportToExcel} disabled={!rows.length}>
            <i className="fas fa-download"></i> Exportar a Excel
          </button>
          <button className='btn btn-back' onClick={handleGoHome}>
            <i className="fas fa-arrow-left"></i> Volver al Main
          </button>
        </div>
      </div>
    </section>
  );
}

export default DataTable;

