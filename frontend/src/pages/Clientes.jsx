import {useState, useEffect} from 'react';
import axios from 'axios';
import {UserPlus, DollarSign} from 'lucide-react';

function Clientes ()
{
    const [clientes, setClientes] = useState([]);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoTel, setNuevoTel] = useState('');

    useEffect(() => {cargarClientes();}, []);

    const cargarClientes = async () =>
    {
        const res = await axios.get('http://localhost:4000/clientes');
        setClientes(res.data);
    };

    const crearCliente = async (e) =>
    {
        e.preventDefault();
        await axios.post('http://localhost:4000/clientes', {nombre: nuevoNombre, telefono: nuevoTel});
        setNuevoNombre(''); setNuevoTel('');
        cargarClientes();
    };

    const registrarPago = async (cliente) =>
    {
        const monto = prompt(`El cliente debe $${cliente.saldo_deudor}. ¿Cuánto paga hoy?`);
        if(!monto) return;

        try
        {
            await axios.post('http://localhost:4000/clientes/pagar', {id_cliente: cliente.id, monto: parseFloat(monto)});
            alert("Pago registrado 💰");
            cargarClientes();
        } catch(err) {alert("Error al pagar");}
    };

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
            <h1>📒 Clientes y Cuentas Corrientes</h1>

            {/* FORMULARIO */}
            <div style={{background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
                <h3>Nuevo Cliente</h3>
                <form onSubmit={crearCliente} style={{display: 'flex', gap: '10px'}}>
                    <input type="text" placeholder="Nombre" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required style={{padding: '8px', flex: 1}} />
                    <input type="text" placeholder="Teléfono" value={nuevoTel} onChange={e => setNuevoTel(e.target.value)} style={{padding: '8px'}} />
                    <button type="submit" style={{background: '#007bff', color: 'white', border: 'none', padding: '0 20px', cursor: 'pointer'}}>
                        <UserPlus size={18} /> AGREGAR
                    </button>
                </form>
            </div>

            {/* LISTA */}
            <table style={{width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                <thead>
                    <tr style={{background: '#333', color: 'white'}}>
                        <th style={{padding: '10px', textAlign: 'left'}}>Nombre</th>
                        <th style={{padding: '10px', textAlign: 'left'}}>Teléfono</th>
                        <th style={{padding: '10px', textAlign: 'left'}}>Deuda</th>
                        <th style={{padding: '10px', textAlign: 'center'}}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map(c => (
                        <tr key={c.id} style={{borderBottom: '1px solid #eee'}}>
                            <td style={{padding: '10px'}}>{c.nombre}</td>
                            <td>{c.telefono}</td>
                            <td style={{fontWeight: 'bold', color: c.saldo_deudor > 0 ? 'red' : 'green'}}>
                                ${c.saldo_deudor}
                            </td>
                            <td style={{textAlign: 'center'}}>
                                {c.saldo_deudor > 0 && (
                                    <button onClick={() => registrarPago(c)} style={{background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}>
                                        <DollarSign size={16} /> PAGAR
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Clientes;