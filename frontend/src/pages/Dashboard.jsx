import {useEffect, useState} from 'react';
import api from '../api';
import {TrendingUp, Calendar, AlertTriangle, Award, ArrowUpRight} from 'lucide-react';

function Dashboard ()
{
    // Mantenemos tus estados originales + nuevos
    const [resumen, setResumen] = useState({hoy: 0, semana: 0, mes: 0, anio: 0, stock_bajo: 0});
    const [topProductos, setTopProductos] = useState([]);
    const [ventasSemana, setVentasSemana] = useState([]);
    const [ventasAnuales, setVentasAnuales] = useState([]);

    useEffect(() =>
    {
        cargarDatos();
    }, []);

    const cargarDatos = async () =>
    {
        try
        {
            const res1 = await api.get('/stats/resumen');
            setResumen(res1.data);

            const res2 = await api.get('/stats/top-productos');
            setTopProductos(res2.data);

            const res3 = await api.get('/stats/ventas-semana');
            setVentasSemana(res3.data);

            const res4 = await api.get('/stats/ventas-anuales');
            setVentasAnuales(res4.data);
        } catch(error) {console.error("Error cargando stats", error);}
    };

    // Componente de Tarjeta Mejorado
    const Card = ({title, value, icon: Icon, color, subtext}) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
                    <Icon size={24} />
                </div>
                {subtext && <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full">{subtext}</span>}
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in font-sans">

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resumen Ejecutivo</h1>
                    <p className="text-gray-500 dark:text-gray-400">Métricas clave de rendimiento en tiempo real</p>
                </div>
                <div className="flex items-center gap-4">
                    {resumen.stock_bajo > 0 && (
                        <div className="bg-red-100 dark:bg-red-900/40 px-4 py-2 rounded-xl text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-2 text-sm font-bold animate-pulse">
                            <AlertTriangle size={18} />
                            {resumen.stock_bajo} Productos con Stock Bajo
                        </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <Calendar size={16} />
                        {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>

            {/* TARJETAS SUPERIORES (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card
                    title="Ventas Hoy"
                    value={`$${resumen.hoy}`}
                    icon={TrendingUp}
                    color="green"
                    subtext="Diario"
                />
                <Card
                    title="Esta Semana"
                    value={`$${resumen.semana}`}
                    icon={Calendar}
                    color="purple"
                    subtext="Lun-Dom"
                />
                <Card
                    title="Este Mes"
                    value={`$${resumen.mes}`}
                    icon={Calendar}
                    color="blue"
                    subtext="Mensual"
                />
                <Card
                    title="Este Año"
                    value={`$${resumen.anio}`}
                    icon={Award}
                    color="orange"
                    subtext="Anual"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* TABLA TOP PRODUCTOS (Ocupa 1 columna) */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Award size={20} className="text-yellow-500" /> Top Productos
                        </h3>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full">
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {topProductos.map((p, i) => (
                                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-2 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                                <span className="font-medium text-gray-700 dark:text-gray-200 text-sm truncate max-w-[120px]" title={p.nombre}>{p.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-right font-bold text-gray-800 dark:text-gray-100 text-sm">
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

                {/* GRÁFICO SEMANAL (Ocupa 2 columnas) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary-500" /> Últimos 7 Días
                        </h3>
                    </div>

                    <div className="flex items-end justify-between h-48 gap-4 pt-4 border-b border-gray-50 dark:border-gray-700">
                        {ventasSemana.map((dia, i) =>
                        {
                            const maxVal = Math.max(...ventasSemana.map(d => parseFloat(d.total)), 100);
                            const altura = `${Math.round((parseFloat(dia.total) / maxVal) * 100)}%`;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                    <div className="w-full relative flex items-end justify-center h-full">
                                        <div className="absolute -top-8 bg-gray-800 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ${dia.total}
                                        </div>
                                        <div style={{height: altura}} className="w-full max-w-[50px] bg-primary-200 dark:bg-primary-900/50 group-hover:bg-primary-500 dark:group-hover:bg-primary-500 rounded-t-md transition-all duration-300 relative"></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400">{new Date(dia.fecha).getDate()}</span>
                                </div>
                            );
                        })}
                        {ventasSemana.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">Sin datos de semana</div>
                        )}
                    </div>
                </div>
            </div>

            {/* GRÁFICO ANUAL (Ancho completo) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Calendar size={20} className="text-blue-500" /> Desempeño Mensual (Año Actual)
                    </h3>
                </div>

                <div className="flex items-end justify-between h-56 gap-2 pt-4 border-b border-gray-50 dark:border-gray-700 overflow-x-auto">
                    {ventasAnuales.map((mes, i) =>
                    {
                        const maxVal = Math.max(...ventasAnuales.map(m => parseFloat(m.total)), 100);
                        const altura = `${Math.round((parseFloat(mes.total) / maxVal) * 100)}%`;

                        return (
                            <div key={i} className="flex-1 min-w-[40px] flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-full relative flex items-end justify-center h-full">
                                    <div className="absolute -top-8 bg-gray-800 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        ${mes.total}
                                    </div>
                                    <div style={{height: altura}} className="w-full max-w-[60px] bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-500 dark:group-hover:bg-blue-500 rounded-t-md transition-all duration-300"></div>
                                </div>
                                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">{mes.mes}</span>
                            </div>
                        );
                    })}
                    {ventasAnuales.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Sin datos anuales</div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default Dashboard;