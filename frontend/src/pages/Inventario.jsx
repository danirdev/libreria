import {useState, useEffect, useRef} from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import {Package, Search, Plus, Trash2, Edit2, AlertCircle, Barcode, DollarSign, Image as ImageIcon, X, Save, Tag, AlertTriangle} from 'lucide-react';

function Inventario ()
{
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [editId, setEditId] = useState(null);
    const [esAdmin, setEsAdmin] = useState(false);
    const [preview, setPreview] = useState(null);

    const CATEGORIAS = ["Libreria", "Fotocopias", "Cotillon", "Frescos", "Golosinas"];

    const [formData, setFormData] = useState({
        codigo_barras: '', nombre: '', precio_costo: '', precio_venta: '',
        stock_actual: '', stock_minimo: 5, // <--- NUEVO CAMPO
        categoria: 'Libreria', es_servicio: false, imagen: null
    });

    useEffect(() =>
    {
        cargarProductos();
        const u = JSON.parse(localStorage.getItem('usuario') || '{}');
        setEsAdmin(u.rol === 'admin');
    }, []);

    const cargarProductos = async () =>
    {
        try
        {
            const res = await api.get('/productos');
            setProductos(res.data);
        } catch(err) {toast.error("Error al cargar productos");}
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
            setPreview(URL.createObjectURL(e.target.files[0]));
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
            stock_minimo: producto.stock_minimo || 5, // <--- CARGAR DATO
            categoria: producto.categoria || 'Libreria',
            es_servicio: producto.es_servicio || false,
            imagen: null
        });
        setPreview(producto.imagen_url);
        window.scrollTo({top: 0, behavior: 'smooth'});
        toast("Modo edición activado", {icon: '✏️'});
    };

    const cancelarEdicion = () =>
    {
        setEditId(null);
        setFormData({
            codigo_barras: '', nombre: '', precio_costo: '', precio_venta: '',
            stock_actual: '', stock_minimo: 5, categoria: 'Libreria', es_servicio: false, imagen: null
        });
        setPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const guardarProducto = async (e) =>
    {
        e.preventDefault();
        setLoading(true);

        const guardarPromesa = new Promise(async (resolve, reject) =>
        {
            try
            {
                const data = new FormData();
                // Enviamos todos los datos incluido stock_minimo
                Object.keys(formData).forEach(key =>
                {
                    if(key === 'imagen' && formData[key]) data.append(key, formData[key]);
                    else if(key !== 'imagen') data.append(key, formData[key]);
                });

                if(editId) await api.put(`/productos/${editId}`, data);
                else await api.post('/productos', data);

                cancelarEdicion();
                cargarProductos();
                resolve();
            } catch(err) {reject(err);} finally {setLoading(false);}
        });

        toast.promise(guardarPromesa, {
            loading: 'Guardando...',
            success: <b>{editId ? '¡Actualizado!' : '¡Creado!'}</b>,
            error: <b>Error al guardar.</b>,
        });
    };

    const eliminarProducto = async (id) =>
    {
        if(!confirm("¿Eliminar producto?")) return;
        api.delete(`/productos/${id}`).then(() =>
        {
            cargarProductos();
            toast.success("Producto eliminado");
        });
    };

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.codigo_barras && p.codigo_barras.includes(busqueda))
    );

    return (
        <div className="space-y-6 animate-fade-in font-sans pb-12">
            <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${editId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                {/* Cabecera del form igual que antes... */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${editId ? 'bg-blue-200 text-blue-700' : 'bg-primary-100 text-primary-600'}`}>
                            {editId ? <Edit2 size={24} /> : <Package size={24} />}
                        </div>
                        <div>
                            <h1 className={`text-xl font-bold ${editId ? 'text-blue-800' : 'text-gray-800'}`}>
                                {editId ? 'Editando Producto' : 'Nuevo Producto'}
                            </h1>
                            <p className="text-sm text-gray-500">Gestión de inventario y alertas</p>
                        </div>
                    </div>
                    {editId && <button onClick={cancelarEdicion}><X size={16} /></button>}
                </div>

                <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">

                    {/* CODIGO, NOMBRE, CATEGORIA, COSTO, VENTA IGUAL QUE ANTES... */}
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Código</label>
                        <input type="text" name="codigo_barras" value={formData.codigo_barras} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary-500" placeholder="Escanear..." />
                    </div>
                    <div className="md:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary-500" placeholder="Nombre del producto" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Categoría</label>
                        <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary-500">
                            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Costo</label>
                        <input type="number" name="precio_costo" value={formData.precio_costo} onChange={handleChange} step="0.01" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary-500" placeholder="0.00" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Venta</label>
                        <input type="number" name="precio_venta" value={formData.precio_venta} onChange={handleChange} required step="0.01" className="w-full px-3 py-2.5 bg-white border border-green-200 rounded-xl outline-none focus:border-green-500 font-bold text-green-700" placeholder="0.00" />
                    </div>

                    {/* --- AQUI ESTAN LOS CAMBIOS DE STOCK --- */}
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Stock Actual</label>
                        <input type="number" name="stock_actual" value={formData.stock_actual} onChange={handleChange} required className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary-500" placeholder="0" />
                    </div>

                    {/* --- AGREGAR ESTO: CHECKBOX DE SERVICIO --- */}
                    <div className="md:col-span-1 flex items-center justify-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                            <input
                                type="checkbox"
                                name="es_servicio"
                                checked={formData.es_servicio}
                                onChange={handleChange}
                                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-gray-600 uppercase">¿Es Servicio?</span>
                        </label>
                    </div>
                    {/* ----------------------------------------- */}
                    <div className="md:col-span-1">
                        <label className="text-xs font-bold text-red-400 uppercase ml-1">Alerta Mínimo</label>
                        <div className="relative">
                            <AlertTriangle size={14} className="absolute left-3 top-3 text-red-300" />
                            <input
                                type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange}
                                className="w-full pl-8 pr-3 py-2.5 bg-red-50 border border-red-100 rounded-xl outline-none focus:border-red-300 text-red-600 font-medium"
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Imagen</label>
                        <div className="flex items-center gap-3">
                            {preview && (
                                <img src={preview} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-gray-50" />
                            )}
                            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm" />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <button type="submit" disabled={loading} className={`w-full font-bold py-2.5 rounded-xl shadow-md text-white ${editId ? 'bg-blue-600' : 'bg-primary-600'}`}>
                            {loading ? '...' : (editId ? 'Actualizar' : 'Agregar')}
                        </button>
                    </div>
                </form>
            </div>

            {/* TABLA DE RESULTADOS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                {/* ... Buscador igual que antes ... */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
                    <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2 bg-white border rounded-lg" />
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th className="p-3 w-16">Img</th>
                                <th className="p-3">Producto</th>
                                <th className="p-3 text-right">Precio</th>
                                <th className="p-3 text-center">Stock</th>
                                <th className="p-3 text-center">Estado</th>
                                <th className="p-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {productosFiltrados.map(p => (
                                <tr key={p.id} className={`hover:bg-gray-50 ${editId === p.id ? 'bg-blue-50' : ''}`}>
                                    <td className="p-3">
                                        {p.imagen_url ? (
                                            <img src={p.imagen_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-white" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800">{p.nombre}</div>
                                        <div className="text-xs text-gray-500">{p.codigo_barras}</div>
                                    </td>
                                    <td className="p-3 text-right font-bold">${p.precio_venta}</td>
                                    <td className="p-3 text-center">{p.stock_actual}</td>

                                    {/* --- COLUMNA DE ESTADO INTELIGENTE --- */}
                                    <td className="p-3 text-center">
                                        {p.stock_actual <= (p.stock_minimo || 5) ? (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                                <AlertTriangle size={10} /> Reponer
                                            </span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                                                OK
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-3 flex justify-center gap-2">
                                        <button onClick={() => iniciarEdicion(p)} className="text-blue-600 hover:bg-blue-100 p-1 rounded"><Edit2 size={16} /></button>
                                        {esAdmin && <button onClick={() => eliminarProducto(p.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Inventario;