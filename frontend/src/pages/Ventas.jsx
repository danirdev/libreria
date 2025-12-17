import {useState, useRef} from 'react';
import axios from 'axios';

function Ventas ()
{
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const inputRef = useRef(null);

    // Calcular total automáticamente
    const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);

    // Buscar productos mientras escribes
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

    // Agregar al carrito
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
        inputRef.current.focus(); // Volver el foco al buscador
    };

    // Cobrar
    const cobrar = async () =>
    {
        if(carrito.length === 0) return;
        if(!confirm(`¿Cobrar $${total}?`)) return;

        try
        {
            await axios.post('http://localhost:4000/ventas', {
                total: total,
                items: carrito,
                metodo_pago: 'Efectivo'
            });
            alert('¡Venta registrada! 💰');
            setCarrito([]); // Limpiar ticket
        } catch(err)
        {
            alert('Error al cobrar');
        }
    };

    return (
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', height: '90vh', gap: '20px', padding: '20px'}}>

            {/* IZQUIERDA: BUSCADOR */}
            <div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="🔍 Buscar producto o escanear..."
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

            {/* DERECHA: TICKET */}
            <div style={{background: '#f9f9f9', padding: '20px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column'}}>
                <h3>🛒 Ticket</h3>
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
        </div>
    );
}

export default Ventas;