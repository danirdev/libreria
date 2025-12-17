import {useState, useEffect, useRef} from 'react';
import api from '../api';
import {useReactToPrint} from 'react-to-print';
import TicketImprimible from '../components/TicketImprimible';
import {CheckCircle, Printer, X} from 'lucide-react';

function Ventas ()
{
    // ESTADOS DEL SISTEMA
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [carrito, setCarrito] = useState([]);

    // ESTADOS NUEVOS PARA CLIENTES
    const [listaClientes, setListaClientes] = useState([]);
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');

    // ESTADOS PARA TICKET E IMPRESIÓN
    const [ultimaVenta, setUltimaVenta] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const inputRef = useRef(null);
    const ticketRef = useRef();

    const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);

    // CARGAR CLIENTES AL INICIO
    useEffect(() =>
    {
        cargarClientes();
    }, []);

    const cargarClientes = async () =>
    {
        try
        {
            const res = await api.get('/clientes');
            setListaClientes(res.data);
        } catch(err) {console.error("Error cargando clientes");}
    };

    // CONFIGURACIÓN DE IMPRESIÓN
    const handlePrint = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket-${ultimaVenta?.id}`,
        onAfterPrint: () => cerrarModal()
    });

    // BUSCADOR DE PRODUCTOS
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
        const existe = carrito.find(item => item.id === producto.id);
        if(existe)
        {
            setCarrito(carrito.map(item => item.id === producto.id ? {...item, cantidad: item.cantidad + 1} : item));
        } else
        {
            setCarrito([...carrito, {...producto, cantidad: 1}]);
        }
        setBusqueda('');
        setResultados([]);
        inputRef.current.focus();
    };

    // FUNCIÓN DE COBRO ACTUALIZADA
    const cobrar = async () =>
    {
        if(carrito.length === 0) return;

        // Validación: Si es fiado, DEBE elegir un cliente
        if(metodoPago === 'Cuenta Corriente' && !clienteSeleccionado)
        {
            return alert("⚠️ Para fiar, debes seleccionar un cliente de la lista.");
        }

        try
        {
            const res = await api.post('/ventas', {
                total: total,
                items: carrito,
                metodo_pago: metodoPago,
                id_cliente: metodoPago === 'Cuenta Corriente' ? clienteSeleccionado : null
            });

            // Guardamos datos para el ticket (Incluyendo el nombre del cliente si fió)
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
            // Resetear formulario de pago
            setMetodoPago('Efectivo');
            setClienteSeleccionado('');

        } catch(err)
        {
            alert('Error al procesar la venta');
            console.error(err);
        }
    };

    const cerrarModal = () =>
    {
        setMostrarModal(false);
        setUltimaVenta(null);
        if(inputRef.current) inputRef.current.focus();
    };

    return (
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', height: '90vh', gap: '20px', padding: '20px', fontFamily: 'Arial'}}>

            {/* IZQUIERDA: BUSCADOR */}
            <div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="🔍 Buscar producto..."
                    value={busqueda}
                    onChange={buscarProducto}
                    autoFocus
                    style={{width: '100%', padding: '15px', fontSize: '18px', marginBottom: '10px'}}
                />
                <div style={{display: 'grid', gap: '10px'}}>
                    {resultados.map(prod => (
                        <div key={prod.id} onClick={() => agregarAlCarrito(prod)}
                            style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer', background: 'white'}}>
                            <strong>{prod.nombre}</strong> - <span style={{color: 'green'}}>${prod.precio_venta}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* DERECHA: TICKET Y PAGO */}
            <div style={{background: '#f9f9f9', padding: '20px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column'}}>
                <h3>🛒 Ticket</h3>

                {/* Lista de items */}
                <div style={{flex: 1, overflowY: 'auto', marginBottom: '10px'}}>
                    {carrito.map((item, i) => (
                        <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderBottom: '1px dashed #ccc', paddingBottom: '5px'}}>
                            <span>{item.cantidad} x {item.nombre}</span>
                            <strong>${item.precio_venta * item.cantidad}</strong>
                        </div>
                    ))}
                </div>

                {/* ZONA DE PAGO */}
                <div style={{background: '#eee', padding: '15px', borderRadius: '8px'}}>
                    <h2 style={{textAlign: 'right', margin: '0 0 10px 0'}}>Total: ${total}</h2>

                    <label style={{display: 'block', marginBottom: '5px', fontSize: '14px'}}>Método de Pago:</label>
                    <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        style={{width: '100%', padding: '10px', marginBottom: '10px'}}
                    >
                        <option value="Efectivo">💵 Efectivo</option>
                        <option value="Cuenta Corriente">📒 Cuenta Corriente (Fiado)</option>
                    </select>

                    {/* Selector de Cliente (Solo aparece si es Cuenta Corriente) */}
                    {metodoPago === 'Cuenta Corriente' && (
                        <div style={{animation: 'fadeIn 0.3s'}}>
                            <label style={{display: 'block', marginBottom: '5px', fontSize: '14px', color: 'red'}}>Seleccionar Cliente:</label>
                            <select
                                value={clienteSeleccionado}
                                onChange={(e) => setClienteSeleccionado(e.target.value)}
                                style={{width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid red'}}
                            >
                                <option value="">-- Seleccione --</option>
                                {listaClientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button onClick={cobrar} style={{width: '100%', padding: '15px', background: metodoPago === 'Efectivo' ? '#28a745' : '#ffc107', color: metodoPago === 'Efectivo' ? 'white' : 'black', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold'}}>
                        {metodoPago === 'Efectivo' ? 'COBRAR' : 'FIAR / ANOTAR'}
                    </button>
                </div>
            </div>

            {/* --- MODAL --- */}
            {mostrarModal && ultimaVenta && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
                    <div style={{background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'}}>
                        <CheckCircle size={50} color="green" style={{margin: '0 auto', marginBottom: '10px'}} />
                        <h2>{ultimaVenta.metodo === 'Cuenta Corriente' ? '¡Anotado en Cuenta!' : '¡Venta Registrada!'}</h2>

                        <div style={{border: '1px solid #ccc', margin: '20px auto', background: '#fff'}}>
                            <TicketImprimible ref={ticketRef} venta={ultimaVenta} items={ultimaVenta.items} total={ultimaVenta.total} fecha={ultimaVenta.fecha} />
                        </div>

                        <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                            <button onClick={handlePrint} style={{padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <Printer size={18} /> IMPRIMIR
                            </button>
                            <button onClick={cerrarModal} style={{padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <X size={18} /> CERRAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Ventas;