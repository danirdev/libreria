import {useEffect, useState} from 'react';
import api from '../api';
import {TrendingUp, Calendar, AlertTriangle, Award, ArrowUpRight} from 'lucide-react';

function Dashboard ()
{
    // Mantenemos tus estados originales
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
            // Mantenemos tus llamadas a la API originales
            const res1 = await api.get('/stats/resumen');
            setResumen(res1.data);

            const res2 = await api.get('/stats/top-productos');
            setTopProductos(res2.data);

            const res3 = await api.get('/stats/ventas-semana');
            setVentasSemana(res3.data);
        } catch(error) {console.error("Error cargando stats", error);}
    };

    // Componente de Tarjeta Mejorado
    const Card = ({title, value, icon: Icon, color, subtext}) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                    <Icon size={24} />
                </div>
                {subtext && <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">{subtext}</span>}
            </div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 group-hover:scale-105 transition-transform origin-left">{value}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in font-sans">

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Resumen Ejecutivo</h1>
                    <p className="text-gray-500">Métricas clave de rendimiento en tiempo real</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Calendar size={16} />
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* TARJETAS SUPERIORES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    title="Ventas Hoy"
                    value={`$${resumen.hoy}`}
                    icon={TrendingUp}
                    color="green"
                    subtext="Ingresos diarios"
                />
                <Card
                    title="Acumulado Mes"
                    value={`$${resumen.mes}`}
                    icon={Calendar}
                    color="blue"
                    subtext="Este mes"
                />
                <Card
                    title="Alertas Stock"
                    value={resumen.stock_bajo}
                    icon={AlertTriangle}
                    color="orange"
                    subtext="Productos críticos"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* TABLA TOP PRODUCTOS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Award size={20} className="text-primary-500" /> Productos Estrella
                        </h3>
                        <span className="text-xs font-bold text-gray-400 uppercase">Top 5</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left rounded-l-lg">Producto</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Unidades</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topProductos.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                                <span className="font-medium text-gray-700">{p.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                                            {p.cantidad_total}
                                        </td>
                                    </tr>
                                ))}
                                {topProductos.length === 0 && (
                                    <tr><td colSpan="2" className="text-center py-4 text-gray-400">Sin datos aún</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* GRÁFICO SEMANAL (Barras CSS Modernas) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary-500" /> Tendencia Semanal
                        </h3>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowUpRight size={18} className="text-gray-400" />
                        </button>
                    </div>

                    <div className="flex items-end justify-between h-64 gap-2 pt-4 border-b border-gray-50">
                        {ventasSemana.map((dia, i) =>
                        {
                            // Calculamos altura relativa (máximo 100%)
                            const maxVal = Math.max(...ventasSemana.map(d => parseFloat(d.total)), 100);
                            const altura = `${Math.round((parseFloat(dia.total) / maxVal) * 100)}%`;

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-full relative flex items-end justify-center h-full">
                                        {/* Tooltip con valor */}
                                        <div className="absolute -top-8 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ${dia.total}
                                        </div>
                                        {/* Barra */}
                                        <div
                                            style={{height: altura}}
                                            className="w-full max-w-[40px] bg-primary-200 group-hover:bg-primary-500 rounded-t-md transition-all duration-300 relative overflow-hidden"
                                        >
                                            <div className="absolute bottom-0 w-full h-1 bg-primary-300/30"></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 group-hover:text-primary-600 transition-colors">
                                        {new Date(dia.fecha).toLocaleDateString(undefined, {weekday: 'short'})}
                                    </span>
                                </div>
                            );
                        })}
                        {ventasSemana.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No hay ventas en los últimos 7 días
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;