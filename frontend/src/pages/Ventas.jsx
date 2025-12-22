import {useState, useEffect, useRef} from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import {useReactToPrint} from 'react-to-print';
import TicketImprimible from '../components/TicketImprimible';
import {Search, ShoppingCart, Trash2, CreditCard, Banknote, Printer, CheckCircle, Plus, Minus, ArrowRightLeft, Edit3} from 'lucide-react';

function Ventas ()
{
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [carrito, setCarrito] = useState([]);

    const [listaClientes, setListaClientes] = useState([]);
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');

    const [ultimaVenta, setUltimaVenta] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const inputRef = useRef(null);
    const ticketRef = useRef();

    // El total se calcula dinámicamente con el precio que tenga el item en ese momento
    const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);

    useEffect(() => {cargarClientes();}, []);

    const cargarClientes = async () =>
    {
        try
        {
            const res = await api.get('/clientes');
            setListaClientes(res.data);
        } catch(err) {console.error("Error clientes", err);}
    };

    const handlePrint = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket-${ultimaVenta?.id}`,
        onAfterPrint: () => cerrarModal()
    });

    const buscarProducto = async (e) =>
    {
        const term = e.target.value;
        setBusqueda(term);
        if(term.length > 1)
        {
            try
            {
                const res = await api.get('/productos/buscar/' + term);
                setResultados(res.data);
            } catch(err) {console.error(err);}
        } else
        {
            setResultados([]);
        }
    };

    const agregarAlCarrito = (producto) =>
    {
        // Si NO es servicio y no hay stock, bloqueamos.
        if(!producto.es_servicio && producto.stock_actual <= 0)
        {
            toast.error("¡Producto sin stock!");
            return;
        }
        const existe = carrito.find(item => item.id === producto.id);
        if(existe)
        {
            // Si es servicio, no validamos stock máximo
            if(!producto.es_servicio && existe.cantidad >= producto.stock_actual)
            {
                toast.error("No hay más stock");
                return;
            }
            actualizarCantidad(producto.id, existe.cantidad + 1, producto.stock_actual, producto.es_servicio);
        } else
        {
            setCarrito([...carrito, {...producto, cantidad: 1}]);
            toast.success("Agregado");
        }
        setBusqueda('');
        setResultados([]);
        if(inputRef.current) inputRef.current.focus();
    };

    const actualizarCantidad = (id, nuevaCantidad, stockMaximo, esServicio) =>
    {
        if(nuevaCantidad < 1) return;
        if(!esServicio && nuevaCantidad > stockMaximo)
        {
            toast.error(`Solo hay ${stockMaximo} unidades`);
            return;
        }
        setCarrito(carrito.map(item => item.id === id ? {...item, cantidad: nuevaCantidad} : item));
    };

    // NUEVA FUNCIÓN: Permite cambiar el precio unitario en el carrito
    const actualizarPrecio = (id, nuevoPrecio) =>
    {
        const precio = parseFloat(nuevoPrecio);
        if(precio < 0) return;
        setCarrito(carrito.map(item => item.id === id ? {...item, precio_venta: precio || 0} : item));
    };

    const eliminarDelCarrito = (id) =>
    {
        setCarrito(carrito.filter(item => item.id !== id));
    };

    const cobrar = async () =>
    {
        if(carrito.length === 0) return;

        if(metodoPago === 'Cuenta Corriente' && !clienteSeleccionado)
        {
            return toast.error("⚠️ Selecciona un cliente para fiar.");
        }

        try
        {
            const res = await api.post('/ventas', {
                total: total,
                items: carrito, // Enviamos el carrito con los precios modificados
                metodo_pago: metodoPago,
                id_cliente: metodoPago === 'Cuenta Corriente' ? clienteSeleccionado : null
            });

            const nombreCliente = listaClientes.find(c => c.id == clienteSeleccionado)?.nombre || 'Consumidor Final';

            setUltimaVenta({
                id: res.data.id_venta,
                items: [...carrito],
                total: total,
                fecha: new Date().toLocaleString(),
                cliente: metodoPago === 'Cuenta Corriente' ? nombreCliente : null,
                metodo: metodoPago
            });

            setMostrarModal(true);
            setCarrito([]);
            setMetodoPago('Efectivo');
            setClienteSeleccionado('');
            toast.success("¡Venta registrada con éxito!");
        } catch(err)
        {
            console.error(err);
            toast.error('Error al procesar la venta');
        }
    };

    const cerrarModal = () =>
    {
        setMostrarModal(false);
        setUltimaVenta(null);
        if(inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 animate-fade-in">

            {/* IZQUIERDA: BUSCADOR */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <Search className="text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar producto (Escanear código)..."
                        value={busqueda}
                        onChange={buscarProducto}
                        autoFocus
                        className="w-full outline-none text-lg text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
                    />
                </div>

                <div className="flex-1 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100/50 dark:border-gray-700/50 p-4 overflow-y-auto">
                    {resultados.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {resultados.map(prod => (
                                <div
                                    key={prod.id}
                                    onClick={() => agregarAlCarrito(prod)}
                                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-primary-200 dark:hover:border-primary-600 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${prod.es_servicio ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : (prod.stock_actual > 0 ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300')}`}>
                                            {prod.es_servicio ? 'Servicio' : `Stock: ${prod.stock_actual}`}
                                        </span>
                                        <Plus size={20} className="text-gray-300 group-hover:text-primary-500 dark:text-gray-600 dark:group-hover:text-primary-400" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">{prod.nombre}</h3>
                                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">${prod.precio_venta}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                            <Search size={48} className="mb-2" />
                            <p>Busca un producto para empezar...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DERECHA: TICKET */}
            <div className="w-full lg:w-[450px] bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
                <div className="bg-primary-600 p-4 text-white flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} />
                        <h2 className="font-bold tracking-wide">Ticket Actual</h2>
                    </div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{carrito.length} Items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/50">
                    {carrito.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <ShoppingCart size={40} className="opacity-20" />
                            <p className="text-sm">Carrito vacío</p>
                        </div>
                    ) : (
                        carrito.map((item, i) => (
                            <div key={i} className="flex flex-col bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 gap-3">

                                {/* 1. Nombre y Eliminar */}
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-2">{item.nombre}</span>
                                    <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* 2. Controles de Precio y Cantidad */}
                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">

                                    {/* CANTIDAD */}
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1, item.stock_actual, item.es_servicio)} className="w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300"><Minus size={12} /></button>
                                        <input
                                            type="number" value={item.cantidad}
                                            onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value) || 0, item.stock_actual, item.es_servicio)}
                                            className="w-10 text-center text-sm font-bold bg-transparent outline-none dark:text-white"
                                        />
                                        <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1, item.stock_actual, item.es_servicio)} className="w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300"><Plus size={12} /></button>
                                        <span className="text-xs text-gray-400 ml-1">unid.</span>
                                    </div>

                                    <span className="text-gray-300 dark:text-gray-600">|</span>

                                    {/* PRECIO EDITABLE (La magia está aquí) */}
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-400">$</span>
                                        <input
                                            type="number"
                                            value={item.precio_venta}
                                            onChange={(e) => actualizarPrecio(item.id, e.target.value)}
                                            className="w-16 text-right text-sm font-bold text-primary-700 dark:text-primary-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1 outline-none focus:border-primary-400"
                                        />
                                    </div>

                                </div>

                                {/* 3. Subtotal Renglón */}
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 mr-2">Subtotal:</span>
                                    <span className="font-bold text-gray-800 dark:text-white">${(item.precio_venta * item.cantidad).toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Total a Pagar</span>
                        <span className="text-3xl font-black text-gray-800 dark:text-white">${total.toFixed(2)}</span>
                    </div>

                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setMetodoPago('Efectivo')} className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs font-bold transition-all ${metodoPago === 'Efectivo' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <Banknote size={18} className="mb-1" /> Efectivo
                            </button>
                            <button onClick={() => setMetodoPago('Transferencia')} className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs font-bold transition-all ${metodoPago === 'Transferencia' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <ArrowRightLeft size={18} className="mb-1" /> Transferencia
                            </button>
                            <button onClick={() => setMetodoPago('Cuenta Corriente')} className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs font-bold transition-all ${metodoPago === 'Cuenta Corriente' ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <CreditCard size={18} className="mb-1" /> Fiado
                            </button>
                        </div>

                        {metodoPago === 'Cuenta Corriente' && (
                            <select
                                value={clienteSeleccionado}
                                onChange={(e) => setClienteSeleccionado(e.target.value)}
                                className="w-full p-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300 rounded-lg text-sm outline-none animate-slide-up"
                            >
                                <option value="">-- Seleccionar Cliente --</option>
                                {listaClientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        )}

                        <button onClick={cobrar} disabled={carrito.length === 0} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all">
                            COBRAR
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL EXITO */}
            {mostrarModal && ultimaVenta && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">¡Venta Exitosa!</h2>

                        <div className="hidden">
                            <TicketImprimible ref={ticketRef} venta={ultimaVenta} items={ultimaVenta.items} total={ultimaVenta.total} fecha={ultimaVenta.fecha} />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={handlePrint} className="flex-1 bg-primary-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2">
                                <Printer size={18} /> Imprimir
                            </button>
                            <button onClick={cerrarModal} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-semibold py-2.5 rounded-xl">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Ventas;