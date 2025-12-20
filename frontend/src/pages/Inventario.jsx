import {useState, useEffect, useRef} from 'react';
import api from '../api';
// 1. IMPORTAR TOAST
import toast from 'react-hot-toast';
import {Package, Search, Plus, Trash2, Edit2, AlertCircle, Barcode, DollarSign, Image as ImageIcon, X, Save, Tag} from 'lucide-react';

function Inventario ()
{
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        codigo_barras: '', nombre: '', precio_costo: '', precio_venta: '',
        stock_actual: '', categoria: '', es_servicio: false, imagen: null
    });

    useEffect(() => {cargarProductos();}, []);

    const cargarProductos = async () =>
    {
        try
        {
            const res = await api.get('/productos');
            setProductos(res.data);
        } catch(err)
        {
            console.error("Error cargando:", err);
            toast.error("Error al cargar productos"); // Notificación de error silenciosa
        }
    };

    const handleChange = (e) =>
    {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    };

    const handleFileChange = (e) =>
    {
        if(e.target.files && e.target.files[0])
        {
            setFormData(prev => ({...prev, imagen: e.target.files[0]}));
        }
    };

    const iniciarEdicion = (producto) =>
    {
        setEditId(producto.id);
        setFormData({
            codigo_barras: producto.codigo_barras || '',
            nombre: producto.nombre,
            precio_costo: producto.precio_costo,
            precio_venta: producto.precio_venta,
            stock_actual: producto.stock_actual,
            categoria: producto.categoria || '',
            es_servicio: producto.es_servicio || false,
            imagen: null
        });
        window.scrollTo({top: 0, behavior: 'smooth'});
        toast("Modo edición activado", {icon: '✏️'}); // Notificación simple
    };

    const cancelarEdicion = () =>
    {
        setEditId(null);
        setFormData({
            codigo_barras: '', nombre: '', precio_costo: '', precio_venta: '',
            stock_actual: '', categoria: '', es_servicio: false, imagen: null
        });
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const guardarProducto = async (e) =>
    {
        e.preventDefault();
        setLoading(true);

        // Creamos la promesa de la petición
        const guardarPromesa = new Promise(async (resolve, reject) =>
        {
            try
            {
                const data = new FormData();
                Object.keys(formData).forEach(key =>
                {
                    if(key === 'imagen' && formData[key]) data.append(key, formData[key]);
                    else if(key !== 'imagen') data.append(key, formData[key]);
                });

                if(editId)
                {
                    await api.put(`/productos/${editId}`, data, {headers: {'Content-Type': 'multipart/form-data'}});
                } else
                {
                    await api.post('/productos', data, {headers: {'Content-Type': 'multipart/form-data'}});
                }

                cancelarEdicion();
                cargarProductos();
                resolve(); // ¡Éxito!
            } catch(err)
            {
                console.error(err);
                reject(err); // ¡Error!
            } finally
            {
                setLoading(false);
            }
        });

        // 2. MAGIA DE TOAST.PROMISE: Muestra Cargando -> Éxito/Error automáticamente
        toast.promise(guardarPromesa, {
            loading: 'Guardando producto...',
            success: <b>{editId ? '¡Producto actualizado!' : '¡Producto creado!'}</b>,
            error: <b>Error al guardar. Intenta de nuevo.</b>,
        });
    };

    const eliminarProducto = async (id) =>
    {
        // Nota: Para confirmaciones, el "confirm" nativo sigue siendo lo más seguro y rápido,
        // pero hay formas de hacerlo con Toast customizados si prefieres.
        if(!confirm("¿Seguro que deseas eliminar este producto?")) return;

        const promesaEliminar = api.delete(`/productos/${id}`)
            .then(() => cargarProductos());

        toast.promise(promesaEliminar, {
            loading: 'Eliminando...',
            success: 'Producto eliminado',
            error: 'No se pudo eliminar (¿tiene ventas?)',
        });
    };

    // ... (El resto del return es idéntico al anterior) ...
    // Solo asegúrate de copiar el return completo de la respuesta anterior si lo necesitas
    // O mantén tu return actual si ya lo tienes bien.

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.codigo_barras && p.codigo_barras.includes(busqueda))
    );

    return (
        // ... Tu JSX de siempre ...
        <div className="space-y-6 animate-fade-in font-sans pb-12">
            {/* ... (El código del formulario y tabla que ya tenías) ... */}
            {/* ... Si quieres que te pase el JSX completo de nuevo avísame, pero es igual al anterior ... */}

            {/* SOLO UN CAMBIO EN EL BOTÓN PARA QUE SE VEA MEJOR EL LOADING (Opcional) */}
            {/* En el botón guardar, ya no necesitamos mostrar "Guardando..." en texto porque el Toast lo hace */}
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${editId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                {/* ... cabecera ... */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${editId ? 'bg-blue-200 text-blue-700' : 'bg-primary-100 text-primary-600'}`}>
                            {editId ? <Edit2 size={24} /> : <Package size={24} />}
                        </div>
                        <div>
                            <h1 className={`text-xl font-bold ${editId ? 'text-blue-800' : 'text-gray-800'}`}>
                                {editId ? 'Editando Producto' : 'Nuevo Producto'}
                            </h1>
                            <p className="text-sm text-gray-500">Gestión detallada del inventario</p>
                        </div>
                    </div>
                    {editId && (
                        <button onClick={cancelarEdicion} className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                            <X size={16} /> Cancelar
                        </button>
                    )}
                </div>

                <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    {/* ... Inputs iguales ... */}

                    {/* Código de Barras */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Código de Barras</label>
                        <div className="relative">
                            <Barcode size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text" name="codigo_barras" placeholder="Escanear..."
                                value={formData.codigo_barras} onChange={handleChange}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Nombre */}
                    <div className="md:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre del Producto</label>
                        <input
                            type="text" name="nombre" placeholder="Ej: Cuaderno Espiral A4" required
                            value={formData.nombre} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    {/* Categoría */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Categoría</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text" name="categoria" placeholder="Ej: Oficina, Escolar..."
                                value={formData.categoria} onChange={handleChange}
                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Costo */}
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Costo</label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="number" name="precio_costo" placeholder="0.00" step="0.01"
                                value={formData.precio_costo} onChange={handleChange}
                                className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Precio Venta */}
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Venta</label>
                        <div className="relative">
                            <DollarSign size={14} className="absolute left-3 top-3 text-green-600" />
                            <input
                                type="number" name="precio_venta" placeholder="0.00" required step="0.01"
                                value={formData.precio_venta} onChange={handleChange}
                                className="w-full pl-7 pr-3 py-2.5 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700"
                            />
                        </div>
                    </div>

                    {/* Stock */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock</label>
                        <input
                            type="number" name="stock_actual" placeholder="0" required
                            value={formData.stock_actual} onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    {/* Imagen Input */}
                    <div className="md:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Imagen (Opcional)</label>
                        <div className="relative">
                            <ImageIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange}
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Botón Guardar */}
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 h-[42px] text-white
                            ${editId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-600 hover:bg-primary-700'}`}
                        >
                            {loading ? '...' : (editId ? <><Save size={18} /> Actualizar Producto</> : <><Plus size={20} /> Agregar al Inventario</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- TABLA DE PRODUCTOS --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                {/* Buscador Tabla */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400"
                        />
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">
                        {productosFiltrados.length} Items
                    </div>
                </div>

                {/* Tabla Scrollable */}
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th className="py-3 px-4 w-16">Img</th>
                                <th className="py-3 px-4">Código</th>
                                <th className="py-3 px-4">Producto</th>
                                <th className="py-3 px-4">Categoría</th>
                                <th className="py-3 px-4 text-right">Costo</th>
                                <th className="py-3 px-4 text-right">Venta</th>
                                <th className="py-3 px-4 text-center">Stock</th>
                                <th className="py-3 px-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {productosFiltrados.length > 0 ? (
                                productosFiltrados.map(p => (
                                    <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${editId === p.id ? 'bg-blue-50' : ''}`}>
                                        <td className="py-2 px-4">
                                            {p.imagen_url ? (
                                                <img src={p.imagen_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-white" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 font-mono text-xs text-gray-500">{p.codigo_barras || '---'}</td>
                                        <td className="py-2 px-4 font-medium text-gray-800">{p.nombre}</td>
                                        <td className="py-2 px-4 text-gray-500 text-xs">{p.categoria || '-'}</td>
                                        <td className="py-2 px-4 text-right text-gray-400">${p.precio_costo}</td>
                                        <td className="py-2 px-4 text-right font-bold text-gray-800">${p.precio_venta}</td>
                                        <td className="py-2 px-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock_actual < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {p.stock_actual}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => iniciarEdicion(p)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => eliminarProducto(p.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle size={32} className="opacity-50" />
                                            <span>No se encontraron productos</span>
                                        </div>
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