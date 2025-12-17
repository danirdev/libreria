import {useState, useEffect} from 'react';
import axios from 'axios';

function Caja ()
{
    const [estado, setEstado] = useState('CARGANDO');
    const [datosCaja, setDatosCaja] = useState(null);
    const [inputMonto, setInputMonto] = useState('');

    useEffect(() =>
    {
        consultarCaja();
    }, []);

    const consultarCaja = async () =>
    {
        try
        {
            const res = await axios.get('http://localhost:4000/caja/estado');
            setEstado(res.data.estado);
            if(res.data.datos) setDatosCaja(res.data.datos);
        } catch(error)
        {
            console.error(error);
        }
    };

    const abrirCaja = async (e) =>
    {
        e.preventDefault();
        if(!inputMonto) return alert("Ingresa con cuánto dinero empiezas");
        try
        {
            await axios.post('http://localhost:4000/caja/abrir', {monto_inicial: inputMonto});
            consultarCaja(); // Recargar para ver la pantalla verde
        } catch(error) {alert("Error al abrir");}
    };

    const cerrarCaja = async () =>
    {
        const real = prompt("Cuenta los billetes. ¿Cuánto dinero hay en total?");
        if(!real) return;

        try
        {
            await axios.post('http://localhost:4000/caja/cerrar', {
                id_caja: datosCaja.id,
                monto_final_real: real
            });
            alert("¡Turno cerrado!");
            consultarCaja(); // Recargar para ver la pantalla roja
        } catch(error) {alert("Error al cerrar");}
    };

    if(estado === 'CARGANDO') return <div>Cargando...</div>;

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', fontFamily: 'Arial'}}>
            <h1>💰 Administración de Caja</h1>

            {estado === 'CERRADA' ? (
                <div style={{background: '#ffebee', padding: '30px', borderRadius: '10px', border: '2px solid #ef5350'}}>
                    <h3>🔴 La caja está CERRADA</h3>
                    <p>Ingresa el "Cambio" o "Sencillo" inicial para comenzar a vender.</p>
                    <form onSubmit={abrirCaja}>
                        <input type="number" placeholder="$ 0.00" value={inputMonto} onChange={e => setInputMonto(e.target.value)} required style={{padding: '10px', fontSize: '18px', width: '150px'}} />
                        <br /><br />
                        <button type="submit" style={{padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer'}}>ABRIR TURNO</button>
                    </form>
                </div>
            ) : (
                <div style={{background: '#e8f5e9', padding: '30px', borderRadius: '10px', border: '2px solid #66bb6a'}}>
                    <h3>🟢 Caja ABIERTA</h3>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '20px 0'}}>
                        <div style={{background: 'white', padding: '10px'}}>Inicio: <strong>${datosCaja.monto_inicial}</strong></div>
                        <div style={{background: 'white', padding: '10px'}}>Ventas Hoy: <strong style={{color: 'green'}}>${datosCaja.total_ventas}</strong></div>
                        <div style={{gridColumn: 'span 2', background: '#333', color: 'white', padding: '15px', fontSize: '24px'}}>
                            Total en Cajón: <strong>${datosCaja.total_esperado}</strong>
                        </div>
                    </div>
                    <button onClick={cerrarCaja} style={{padding: '15px', background: '#d32f2f', color: 'white', border: 'none', cursor: 'pointer', width: '100%'}}>
                        CERRAR CAJA (Fin del día)
                    </button>
                </div>
            )}
        </div>
    );
}

export default Caja;