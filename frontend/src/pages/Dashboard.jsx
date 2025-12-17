import {useEffect, useState} from 'react';
import axios from 'axios';
import {TrendingUp, Calendar, AlertTriangle, Award} from 'lucide-react';

function Dashboard ()
{
    const [resumen, setResumen] = useState({hoy: 0, mes: 0, stock_bajo: 0});
    const [topProductos, setTopProductos] = useState([]);
    const [ventasSemana, setVentasSemana] = useState([]);

    useEffect(() =>
    {
        cargarDatos();
    }, []);

    const cargarDatos = async () =>
    {
        try
        {
            const res1 = await axios.get('http://localhost:4000/stats/resumen');
            setResumen(res1.data);

            const res2 = await axios.get('http://localhost:4000/stats/top-productos');
            setTopProductos(res2.data);

            const res3 = await axios.get('http://localhost:4000/stats/ventas-semana');
            setVentasSemana(res3.data);
        } catch(error) {console.error("Error cargando stats", error);}
    };

    return (
        <div style={{padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial'}}>
            <h2>📊 Reportes del Negocio</h2>

            {/* TARJETAS SUPERIORES */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
                <Card titulo="Ventas Hoy" valor={`$${resumen.hoy}`} icono={<TrendingUp color="green" />} color="#e8f5e9" />
                <Card titulo="Ventas del Mes" valor={`$${resumen.mes}`} icono={<Calendar color="blue" />} color="#e3f2fd" />
                <Card titulo="Stock Bajo" valor={`${resumen.stock_bajo} productos`} icono={<AlertTriangle color="orange" />} color="#fff3e0" />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>

                {/* TABLA TOP PRODUCTOS */}
                <div style={{background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                    <h3><Award size={20} /> Lo más vendido</h3>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <tbody>
                            {topProductos.map((p, i) => (
                                <tr key={i} style={{borderBottom: '1px solid #eee'}}>
                                    <td style={{padding: '10px'}}>#{i + 1} <strong>{p.nombre}</strong></td>
                                    <td style={{textAlign: 'right'}}>{p.cantidad_total} unid.</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* GRÁFICO SIMPLE (Barras CSS) */}
                <div style={{background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                    <h3>📈 Últimos 7 Días</h3>
                    <div style={{display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px', paddingTop: '20px'}}>
                        {ventasSemana.map((dia, i) => (
                            <div key={i} style={{flex: 1, textAlign: 'center'}}>
                                <div style={{
                                    height: `${Math.min((dia.total / 5000) * 100, 100)}%`, // Escala simple
                                    background: '#007bff',
                                    borderRadius: '4px 4px 0 0',
                                    minHeight: '4px'
                                }}></div>
                                <small style={{fontSize: '10px'}}>{dia.fecha}</small>
                            </div>
                        ))}
                        {ventasSemana.length === 0 && <p>No hay datos suficientes</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Componente pequeño para las tarjetas
function Card ({titulo, valor, icono, color})
{
    return (
        <div style={{background: color, padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
                <small style={{color: '#555'}}>{titulo}</small>
                <div style={{fontSize: '24px', fontWeight: 'bold'}}>{valor}</div>
            </div>
            {icono}
        </div>
    );
}

export default Dashboard;