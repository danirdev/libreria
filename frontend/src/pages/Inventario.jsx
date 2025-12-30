import {useState, useEffect, useRef} from 'react';
import api from '../api';
import toast from 'react-hot-toast';
// Agregamos 'Copy' a los iconos importados
import {Package, Search, Plus, Trash2, Edit2, AlertCircle, Barcode, DollarSign, Image as ImageIcon, X, Save, Tag, AlertTriangle, Layers, ArrowUpDown, ArrowUp, ArrowDown, Minus, Copy} from 'lucide-react';

function Inventario ()
{
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    // Referencia para enfocar el input de código tras guardar
    const codigoInputRef = useRef(null); 
    const [editId, setEditId] = useState(null);
    const [esAdmin, setEsAdmin] = useState(false);
    const [preview, setPreview] = useState(null);
    const [sortConfig, setSortConfig] = useState({key: 'nombre', direction: 'asc'});
    const [showModal, setShowModal] = useState(false);

    // --- CAMBIO 1: Categorías más detalladas para tu negocio ---
    const CATEGORIAS = [
        "Papelería",      // Afiches, cartulinas, hojas
        "Escritura",      // Lapiceras, lápices, marcadores
        "Adhesivos",      // Plasticolas, cintas
        "Arte",           // Pinturas, pinceles
        "Cuadernos",      // Cuadernos, libretas
        "Carpetas",       // Carpetas, folios
        "Mochilas",       // Mochilas, cartucheras
        "Regalos",        // Juguetes, adornos
        "Cotillon",       // Cumpleaños
        "Fotocopias",     // Servicios de impresión
        "Golosinas",      // Kiosco
        "Varios"
    ];

    const [formData, setFormData] = useState({
        codigo_barras: '', nombre: '', precio_costo: '', precio_venta: '',
        stock_actual: '', stock_minimo: 5,
        categoria: 'Papelería', es_servicio: false, imagen: null
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
            stock_minimo: producto.stock_minimo || 5,
            categoria: producto.categoria || 'Papelería',
            es_servicio: producto.es_servicio || false,
            imagen: null
        });
        setPreview(producto.imagen_url);
        setShowModal(true);
    };

    // --- CAMBIO 2: Función para Duplicar Producto ---
    const duplicarProducto = (producto) => {
        setEditId(null); // Es un nuevo producto
        setFormData({
            codigo_barras: '', // Limpiamos código para evitar conflictos
            nombre: `${producto.nombre} (Copia)`,
            precio_costo: producto.precio_costo,
            precio_venta: producto.precio_venta,
            stock_actual: producto.stock_actual,
            stock_minimo: producto.stock_minimo || 5,
            categoria: producto.categoria || 'Papelería',
            es_servicio: producto.es_servicio || false,
            imagen: null // La imagen no se copia automáticamente para simplificar
        });
        setPreview(producto.imagen_url); // Mostramos la imagen anterior como referencia
        setShowModal(true);
        toast("Producto duplicado. Edita los detalles y guarda.", { icon: '📋' });
    };

    const cerrarModal = () => {
        setEditId(null);
        setFormData({
            codigo_barras: '', nombre: '', precio_costo: '', precio_venta: '',
            stock_actual: '', stock_minimo: 5, categoria: 'Papelería', es_servicio: false, imagen: null
        });
        setPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        setShowModal(false);
    };

    // --- CAMBIO 3: Lógica de guardado flexible (Cerrar o Continuar) ---
    const procesarGuardado = async (cerrarAlTerminar = true) => {
        // Validaciones
        if (parseFloat(formData.precio_venta) < parseFloat(formData.precio_costo)) {
            if (!confirm("⚠️ ¡CUIDADO! El precio de venta es MENOR al costo.\n¿Estás seguro de guardar así?")) return;
        }
        if (formData.imagen && formData.imagen.size > 2 * 1024 * 1024) {
            toast.error("La imagen es muy pesada. Máximo 2MB.");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if(key === 'imagen' && formData[key]) data.append(key, formData[key]);
                else if(key === 'nombre') data.append(key, formData.nombre.toUpperCase());
                else if(key !== 'imagen') data.append(key, formData[key]);
            });

            if(editId) await api.put(`/productos/${editId}`, data);
            else await api.post('/productos', data);

            cargarProductos();
            
            if (cerrarAlTerminar) {
                cerrarModal();
                toast.success(editId ? '¡Actualizado!' : '¡Creado!');
            } else {
                // Resetear formulario pero mantener categoría para carga rápida
                const catActual = formData.categoria;
                setFormData({
                    codigo_barras: '', nombre: '', precio_costo: '', precio_venta: '',
                    stock_actual: '', stock_minimo: 5, 
                    categoria: catActual, // Mantiene la categoría
                    es_servicio: false, imagen: null
                });
                setPreview(null);
                setEditId(null); // Asegurar que el siguiente es nuevo
                if(fileInputRef.current) fileInputRef.current.value = "";
                
                toast.success("¡Guardado! Listo para el siguiente.");
                // Enfocar el input de código de barras para seguir escaneando
                setTimeout(() => codigoInputRef.current?.focus(), 100);
            }

        } catch(err) {
            console.error(err);
            toast.error("Error al guardar. ¿Código duplicado?");
        } finally {
            setLoading(false);
        }
    };

    const guardarProducto = (e) => {
        e.preventDefault();
        procesarGuardado(true); // Por defecto guarda y cierra
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

    const ajustarStock = async (producto, delta) => {
        if (producto.es_servicio) return;
        const nuevoStock = parseInt(producto.stock_actual || 0) + delta;
        if (nuevoStock < 0) return;

        try {
            const data = new FormData();
            data.append('codigo_barras', producto.codigo_barras || '');
            data.append('nombre', producto.nombre);
            data.append('precio_costo', producto.precio_costo);
            data.append('precio_venta', producto.precio_venta);
            data.append('stock_actual', nuevoStock);
            data.append('stock_minimo', producto.stock_minimo || 5);
            data.append('categoria', producto.categoria || 'Papelería');
            data.append('es_servicio', producto.es_servicio);
            
            await api.put(`/productos/${producto.id}`, data);
            cargarProductos();
            toast.success(`Stock ${delta > 0 ? 'aumentado' : 'reducido'}`);
        } catch (err) {
            toast.error("Error al actualizar stock");
        }
    };

    const handleSort = (key) =>
    {
        let direction = 'asc';
        if(sortConfig.key === key && sortConfig.direction === 'asc')
        {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const productosFiltrados = productos
        .filter(p =>
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.codigo_barras && p.codigo_barras.includes(busqueda))
        )
        .sort((a, b) =>
        {
            if(sortConfig.key)
            {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                if(sortConfig.key === 'precio_venta' || sortConfig.key === 'stock_actual' || sortConfig.key === 'precio_costo')
                {
                    valA = Number(valA) || 0;
                    valB = Number(valB) || 0;
                } else if(typeof valA === 'string')
                {
                    valA = valA.toLowerCase();
                    valB = valB ? valB.toLowerCase() : '';
                }

                if(valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if(valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    return (
        <div className="space-y-6 animate-fade-in font-sans pb-12">
            
            {/* Header con Botón Nuevo Producto */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Package className="text-primary-600" /> Inventario
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gestiona tus productos y servicios</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)} 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-600/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus size={20} /> Nuevo Producto
                </button>
            </div>

            {/* MODAL FORMULARIO */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${editId ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'}`}>
                                        {editId ? <Edit2 size={24} /> : <Package size={24} />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                            {editId ? 'Editar Producto' : 'Nuevo Producto'}
                                        </h2>
                                        <p className="text-sm text-gray-500">Completa los detalles del producto</p>
                                    </div>
                                </div>
                                <button onClick={cerrarModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                {/* Código */}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Código</label>
                                    <input 
                                        ref={codigoInputRef}
                                        type="text" name="codigo_barras" value={formData.codigo_barras} onChange={handleChange} 
                                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary-500 dark:focus:border-primary-400 dark:text-white" 
                                        placeholder="Escanear..." autoFocus 
                                    />
                                </div>
                                {/* Nombre */}
                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Nombre</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary-500 dark:focus:border-primary-400 dark:text-white" placeholder="Nombre del producto" />
                                </div>
                                {/* Categoría */}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Categoría</label>
                                    <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary-500 dark:focus:border-primary-400 dark:text-white">
                                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {/* Costo */}
                                <div className="md:col-span-1">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Costo</label>
                                    <input type="number" name="precio_costo" value={formData.precio_costo} onChange={handleChange} step="0.01" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary-500 dark:focus:border-primary-400 dark:text-white" placeholder="0.00" />
                                </div>
                                {/* Venta */}
                                <div className="md:col-span-1">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Venta</label>
                                    <input type="number" name="precio_venta" value={formData.precio_venta} onChange={handleChange} required step="0.01" className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-green-200 dark:border-green-800 rounded-xl outline-none focus:border-green-500 font-bold text-green-700 dark:text-green-400" placeholder="0.00" />
                                </div>

                                {/* Stock y Checkbox Servicio */}
                                <div className="md:col-span-1">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Stock</label>
                                    <input type="number" name="stock_actual" value={formData.stock_actual} onChange={handleChange} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary-500 dark:focus:border-primary-400 dark:text-white" placeholder="0" />
                                </div>

                                {/* CHECKBOX DE SERVICIO INTEGRADO */}
                                <div className="md:col-span-1 flex items-center h-[46px]">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            name="es_servicio"
                                            checked={formData.es_servicio}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                                        />
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">¿Es Servicio?</span>
                                    </label>
                                </div>

                                {/* Alerta Mínimo */}
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-red-400 uppercase ml-1">Alerta Stock Mínimo</label>
                                    <div className="relative">
                                        <AlertTriangle size={14} className="absolute left-3 top-3 text-red-300" />
                                        <input
                                            type="number" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange}
                                            className="w-full pl-8 pr-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl outline-none focus:border-red-300 text-red-600 dark:text-red-300 font-medium"
                                            placeholder="5"
                                        />
                                    </div>
                                </div>

                                {/* Imagen */}
                                <div className="md:col-span-4">
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase ml-1">Imagen</label>
                                    <div className="flex items-center gap-3">
                                        {preview && (
                                            <img src={preview} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" />
                                        )}
                                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:text-gray-300" />
                                    </div>
                                </div>

                                {/* Botones Acción */}
                                <div className="md:col-span-6 flex gap-3 mt-4">
                                    <button type="button" onClick={cerrarModal} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        Cancelar
                                    </button>
                                    
                                    {/* Botón Guardar y Nuevo (Solo al crear) */}
                                    {!editId && (
                                        <button 
                                            type="button" 
                                            onClick={() => procesarGuardado(false)} 
                                            disabled={loading}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={18} /> Guardar y Agregar Otro
                                        </button>
                                    )}

                                    <button type="submit" disabled={loading} className={`flex-1 font-bold py-3 rounded-xl shadow-md text-white ${editId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary-600 hover:bg-primary-700'}`}>
                                        {loading ? 'Guardando...' : (editId ? 'Actualizar y Cerrar' : 'Guardar y Cerrar')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Buscar por nombre o código..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div className="text-xs font-bold text-gray-400 whitespace-nowrap">{productosFiltrados.length} Items</div>
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                            <tr>
                                <th className="p-3 w-16">Img</th>
                                <th
                                    className="p-3 cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => handleSort('nombre')}
                                >
                                    <div className="flex items-center gap-1">
                                        Producto
                                        {sortConfig.key === 'nombre' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-right cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => handleSort('precio_venta')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Precio
                                        {sortConfig.key === 'precio_venta' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-3 text-center cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => handleSort('stock_actual')}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        Stock
                                        {sortConfig.key === 'stock_actual' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                        ) : (
                                            <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" />
                                        )}
                                    </div>
                                </th>
                                <th className="p-3 text-center">Estado</th>
                                <th className="p-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {productosFiltrados.map(p => (
                                <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${editId === p.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                    <td className="p-3">
                                        {p.imagen_url ? (
                                            <img src={p.imagen_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-500">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{p.nombre}</div>
                                        <div className="flex gap-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-500">{p.codigo_barras}</span>
                                            {p.es_servicio && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1 rounded border border-purple-200 dark:border-purple-800">SERVICIO</span>}
                                            {/* Mostrar Categoría pequeña */}
                                            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1 rounded border border-gray-200 dark:border-gray-600">{p.categoria}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right font-bold dark:text-gray-200">${p.precio_venta}</td>
                                    
                                    {/* COLUMNA STOCK CON BOTONES RÁPIDOS */}
                                    <td className="p-3 text-center">
                                        {p.es_servicio ? (
                                            <span className="text-gray-400">∞</span>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => ajustarStock(p, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors">
                                                    <Minus size={12} />
                                                </button>
                                                <span className={`font-bold w-8 ${p.stock_actual <= (p.stock_minimo || 5) ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {p.stock_actual}
                                                </span>
                                                <button onClick={() => ajustarStock(p, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors">
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </td>

                                    <td className="p-3 text-center">
                                        {p.es_servicio ? (
                                            <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                                <Layers size={10} /> Servicio
                                            </span>
                                        ) : p.stock_actual <= (p.stock_minimo || 5) ? (
                                            <span className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                                <AlertTriangle size={10} /> Reponer
                                            </span>
                                        ) : (
                                            <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold">OK</span>
                                        )}
                                    </td>

                                    <td className="p-3 flex justify-center gap-2">
                                        <button onClick={() => iniciarEdicion(p)} className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-1.5 rounded-lg transition-colors" title="Editar"><Edit2 size={18} /></button>
                                        {/* Botón Duplicar */}
                                        <button onClick={() => duplicarProducto(p)} className="text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30 p-1.5 rounded-lg transition-colors" title="Duplicar"><Copy size={18} /></button>
                                        {esAdmin && <button onClick={() => eliminarProducto(p.id)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18} /></button>}
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