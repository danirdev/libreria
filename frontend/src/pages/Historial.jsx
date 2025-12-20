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
            <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                    <Clock size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Historial de Ventas</h1>
                    <p className="text-gray-500">Últimas 50 operaciones registradas</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Fecha</th>
                            <th className="p-4">Cliente / Pago</th>
                            <th className="p-4 text-right">Total</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ventas.map(v => (
                            <>
                                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-gray-500">#{v.id}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(v.fecha_hora).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-gray-800">{v.nombre_cliente || 'Consumidor Final'}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${v.metodo_pago === 'Efectivo' ? 'bg-green-50 text-green-700 border-green-100' :
                                                v.metodo_pago === 'Cuenta Corriente' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {v.metodo_pago}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-lg text-gray-800">
                                        ${v.total}
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => toggleExpand(v.id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                            {expandedId === v.id ? <ChevronUp size={20} /> : <Eye size={20} />}
                                        </button>
                                        <button onClick={() => anularVenta(v.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Anular Venta">
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                                {/* DETALLE DESPLEGABLE */}
                                {expandedId === v.id && (
                                    <tr className="bg-gray-50/50 shadow-inner">
                                        <td colSpan="5" className="p-4">
                                            <div className="ml-12 p-4 bg-white border border-gray-200 rounded-xl max-w-2xl">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Detalle de productos</h4>
                                                <ul className="space-y-2 text-sm">
                                                    {v.items?.map((item, i) => (
                                                        <li key={i} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                                                            <span>{item.cantidad} x {item.nombre}</span>
                                                            <span className="font-mono text-gray-600">${item.precio} c/u</span>
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