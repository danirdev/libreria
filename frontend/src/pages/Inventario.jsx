import {useState, useEffect} from 'react';
import api from '../api';
import {Package, Search, Plus, Trash2, Edit2, AlertCircle} from 'lucide-react';

function Inventario ()
{
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    // Formulario simple (igual que tenías antes pero bonito)
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {cargarProductos();}, []);

    const cargarProductos = async () =>
    {
        try
        {
            const res = await api.get('/productos');
            setProductos(res.data);
        } catch(err) {console.error(err);}
    };

    const guardarProducto = async (e) =>
    {
        e.preventDefault();
        setLoading(true);
        try
        {
            // Envío datos tal cual el backend los espera
            await api.post('/productos', {
                nombre,
                precio_venta: parseFloat(precio),
                stock_actual: parseInt(stock)
            });
            setNombre(''); setPrecio(''); setStock('');
            cargarProductos();
        } catch(err) {alert('Error al guardar');}
        setLoading(false);
    };

    const eliminarProducto = async (id) =>
    {
        if(!confirm("¿Eliminar producto?")) return;
        try
        {
            await api.delete(`/productos/${id}`);
            cargarProductos();
        } catch(err) {alert("Error al eliminar");}
    };

    const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <div className="space-y-6 animate-fade-in">

            {/* CARD SUPERIOR: AGREGAR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary-100 p-2.5 rounded-lg text-primary-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Inventario</h1>
                        <p className="text-sm text-gray-500">Agrega productos al sistema</p>
                    </div>
                </div>

                <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Nombre</label>
                        <input
                            type="text"
                            placeholder="Ej: Lapicera Azul"
                            value={nombre} onChange={e => setNombre(e.target.value)} required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Precio</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={precio} onChange={e => setPrecio(e.target.value)} required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Stock</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={stock} onChange={e => setStock(e.target.value)} required
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white px-4 rounded-xl shadow-md flex items-center justify-center h-[46px] mt-auto">
                            <Plus size={24} />
                        </button>
                    </div>
                </form>
            </div>

            {/* LISTA */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-350px)]">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase">{productosFiltrados.length} Items</span>
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Producto</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right">Precio</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center">Stock</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {productosFiltrados.length > 0 ? (
                                productosFiltrados.map(p => (
                                    <tr key={p.id} className="hover:bg-primary-50/30 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-800">{p.nombre}</td>
                                        <td className="py-3 px-4 text-right text-gray-600 font-mono">${p.precio_venta}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock_actual < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {p.stock_actual}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button onClick={() => eliminarProducto(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-gray-400">
                                        <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                                        Sin resultados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Inventario;