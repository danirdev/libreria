import {useState, useEffect} from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import {Clock, Trash2, Eye, ChevronDown, ChevronUp, AlertTriangle} from 'lucide-react';

function Historial ()
{
    const [ventas, setVentas] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {cargarHistorial();}, []);

    const cargarHistorial = async () =>
    {
        try
        {
            const res = await api.get('/ventas');
            setVentas(res.data);
        } catch(err) {toast.error("Error al cargar historial");}
    };

    const anularVenta = async (id) =>
    {
        if(!confirm("¿ESTÁS SEGURO? Esto devolverá el stock y anulará la deuda si corresponde.")) return;

        const promesa = api.delete(`/ventas/${id}`).then(() => cargarHistorial());

        toast.promise(promesa, {
            loading: 'Anulando...',
            success: 'Venta anulada y stock restaurado 📦',
            error: 'Error al anular'
        });
    };

    const toggleExpand = (id) =>
    {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-xl text-purple-600 dark:text-purple-300">
                    <Clock size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Historial de Ventas</h1>
                    <p className="text-gray-500 dark:text-gray-400">Últimas 50 operaciones registradas</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Cliente / Pago</th>
                            <th className="p-4 text-right">Total</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {ventas.map(v => (
                            <>
                                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-mono text-gray-500 dark:text-gray-400">#{v.id}</td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                        {new Date(v.fecha_hora).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-gray-800 dark:text-white">{v.nombre_cliente || 'Consumidor Final'}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${v.metodo_pago === 'Efectivo' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800' :
                                            v.metodo_pago === 'Cuenta Corriente' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800' :
                                                'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800'
                                            }`}>
                                            {v.metodo_pago}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-lg text-gray-800 dark:text-white">
                                        ${v.total}
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => toggleExpand(v.id)} className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg">
                                            {expandedId === v.id ? <ChevronUp size={20} /> : <Eye size={20} />}
                                        </button>
                                        <button onClick={() => anularVenta(v.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Anular Venta">
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                                {/* DETALLE DESPLEGABLE */}
                                {expandedId === v.id && (
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/50 shadow-inner">
                                        <td colSpan="5" className="p-4">
                                            <div className="ml-12 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl max-w-2xl">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Detalle de productos</h4>
                                                <ul className="space-y-2 text-sm">
                                                    {v.items?.map((item, i) => (
                                                        <li key={i} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1 last:border-0">
                                                            <span className="text-gray-700 dark:text-gray-300">{item.cantidad} x {item.nombre}</span>
                                                            <span className="font-mono text-gray-600 dark:text-gray-400">${item.precio} c/u</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
                {ventas.length === 0 && <div className="p-8 text-center text-gray-400">No hay ventas registradas aún.</div>}
            </div>
        </div>
    );
}

export default Historial;