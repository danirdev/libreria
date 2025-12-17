import {useState, useRef} from 'react';
import axios from 'axios';
import {useReactToPrint} from 'react-to-print';
import TicketImprimible from '../components/TicketImprimible';
import {CheckCircle} from 'lucide-react'; // Iconos opcionales

function Ventas ()
{
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [carrito, setCarrito] = useState([]);

    // ESTADOS PARA EL TICKET Y MODAL
    const [ultimaVenta, setUltimaVenta] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const inputRef = useRef(null);
    const ticketRef = useRef(); // Referencia al ticket

    const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);

    // CONFIGURACIÓN DE IMPRESIÓN
    const handlePrint = useReactToPrint({
        content: () => ticketRef.current,
        documentTitle: `Ticket-${ultimaVenta?.id}`,
        onAfterPrint: () => cerrarModal() // Opcional: cerrar al terminar de imprimir
    });

    const buscarProducto = async (e) =>
    {
        const term = e.target.value;
        setBusqueda(term);
        if(term.length > 1)
        {
            try
            {
                const res = await axios.get('http://localhost:4000/productos/buscar/' + term);
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

    const cobrar = async () =>
    {
        if(carrito.length === 0) return;

        try
        {
            const res = await axios.post('http://localhost:4000/ventas', {
                total: total,
                items: carrito,
                metodo_pago: 'Efectivo'
            });

            // 1. GUARDAMOS LA VENTA
            const ventaGuardada = {
                id: res.data.id_venta,
                items: [...carrito],
                total: total,
                fecha: new Date().toLocaleString()
            };

            setUltimaVenta(ventaGuardada);

            // 2. ABRIMOS EL MODAL (No imprimimos automático)
            setMostrarModal(true);

            // 3. LIMPIAMOS EL CARRITO DE ATRÁS
            setCarrito([]);

        } catch(err)
        {
            alert('Error al cobrar');
        }
    };

    const cerrarModal = () =>
    {
        setMostrarModal(false);
        setUltimaVenta(null);
        if(inputRef.current) inputRef.current.focus(); // Volver a buscar
    };

    return (
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', height: '90vh', gap: '20px', padding: '20px', fontFamily: 'Arial'}}>

            {/* IZQUIERDA: BUSCADOR (Igual que antes) */}
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

            {/* DERECHA: TICKET (Igual que antes) */}
            <div style={{background: '#f9f9f9', padding: '20px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column'}}>
                <h3>🛒 Nueva Venta</h3>
                <div style={{flex: 1}}>
                    {carrito.map((item, i) => (
                        <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                            <span>{item.cantidad} x {item.nombre}</span>
                            <strong>${item.precio_venta * item.cantidad}</strong>
                        </div>
                    ))}
                </div>
                <h2 style={{textAlign: 'right', borderTop: '2px solid black'}}>Total: ${total}</h2>
                <button onClick={cobrar} style={{padding: '15px', background: '#28a745', color: 'white', border: 'none', fontSize: '18px', cursor: 'pointer'}}>
                    COBRAR
                </button>
            </div>

            {/* --- MODAL DE ÉXITO E IMPRESIÓN --- */}
            {mostrarModal && ultimaVenta && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{background: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'}}>

                        <CheckCircle size={50} color="green" style={{margin: '0 auto', marginBottom: '10px'}} />
                        <h2>¡Venta Registrada!</h2>
                        <p>Ticket #{ultimaVenta.id} guardado.</p>

                        {/* AQUÍ ESTÁ EL TICKET VISIBLE (Previsualización) */}
                        <div style={{border: '1px solid #ccc', margin: '20px auto', background: '#fff'}}>
                            <TicketImprimible
                                ref={ticketRef}   // <--- ¡ESTO NO PUEDE FALTAR!
                                venta={ultimaVenta}
                                items={ultimaVenta.items}
                                total={ultimaVenta.total}
                                fecha={ultimaVenta.fecha}
                            />
                        </div>

                        <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                            <button onClick={handlePrint} style={{padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                IMPRIMIR
                            </button>

                            <button onClick={cerrarModal} style={{padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                CERRAR
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Ventas;