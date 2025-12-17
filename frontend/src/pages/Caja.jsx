import {useState, useEffect} from 'react';
import api from '../api';
import {DollarSign, Lock, Unlock, TrendingUp, AlertCircle} from 'lucide-react';

function Caja ()
{
    const [estadoCaja, setEstadoCaja] = useState('CARGANDO'); // 'ABIERTA', 'CERRADA' o 'CARGANDO'
    const [datos, setDatos] = useState(null);
    const [montoInput, setMontoInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {cargarDatos();}, []);

    const cargarDatos = async () =>
    {
        try
        {
            const res = await api.get('/caja/estado');
            // Tu backend devuelve { estado: 'ABIERTA', datos: {...} } o { estado: 'CERRADA' }
            setEstadoCaja(res.data.estado);
            if(res.data.datos) setDatos(res.data.datos);
        } catch(err) {console.error(err);}
    };

    const abrirCaja = async (e) =>
    {
        e.preventDefault();
        if(!montoInput) return;
        setLoading(true);
        try
        {
            // FIX: Usamos 'monto_inicial' que es lo que espera tu backend actual
            await api.post('/caja/abrir', {monto_inicial: parseFloat(montoInput)});
            setMontoInput('');
            cargarDatos();
        } catch(err) {alert("Error al abrir caja");}
        setLoading(false);
    };

    const cerrarCaja = async () =>
    {
        const real = prompt("Conteo final de billetes. ¿Cuánto dinero hay en realidad?");
        if(!real) return;

        try
        {
            await api.post('/caja/cerrar', {
                id_caja: datos.id,
                monto_final_real: parseFloat(real)
            });
            cargarDatos();
        } catch(err) {alert("Error al cerrar caja");}
    };

    if(estadoCaja === 'CARGANDO') return <div className="p-8 text-center text-gray-500">Cargando...</div>;

    const estaAbierta = estadoCaja === 'ABIERTA';

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

            {/* HEADER DE ESTADO */}
            <div className={`p-8 rounded-3xl shadow-lg border text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden ${estaAbierta ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-green-200' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
                <div className="flex items-center gap-6 relative z-10">
                    <div className={`p-4 rounded-2xl ${estaAbierta ? 'bg-green-400/30' : 'bg-gray-600/50'} backdrop-blur-sm`}>
                        {estaAbierta ? <Unlock size={40} /> : <Lock size={40} />}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{estaAbierta ? 'Caja Abierta' : 'Caja Cerrada'}</h2>
                        <p className="text-white/80 font-medium">{estaAbierta ? 'Operando normalmente' : 'Debes abrir turno para vender'}</p>
                    </div>
                </div>

                {estaAbierta && (
                    <div className="text-right relative z-10">
                        <p className="text-sm text-white/70 uppercase font-bold tracking-wider mb-1">Total Esperado</p>
                        <div className="text-5xl font-black tracking-tighter">
                            ${datos?.total_esperado || '0.00'}
                        </div>
                    </div>
                )}
            </div>

            {/* PANEL DE CONTROL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* IZQUIERDA: ACCIONES */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary-600" /> Gestión de Turno
                    </h3>

                    {!estaAbierta ? (
                        <form onSubmit={abrirCaja} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Monto Inicial (Cambio)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={montoInput}
                                        onChange={e => setMontoInput(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold text-lg text-gray-700"
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200/50 transition-all flex justify-center gap-2">
                                {loading ? 'Abriendo...' : 'ABRIR CAJA'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm">
                                ⚠️ Al cerrar la caja, se guardará el total actual y se reiniciarán los contadores.
                            </div>
                            <button onClick={cerrarCaja} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg transition-all flex justify-center gap-2">
                                <Lock size={18} /> CERRAR TURNO
                            </button>
                        </div>
                    )}
                </div>

                {/* DERECHA: RESUMEN (Solo si está abierta) */}
                {estaAbierta && datos && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                        <h3 className="font-bold text-gray-800 mb-2">Resumen del Día</h3>

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="text-gray-500 font-medium">Fondo Inicial</span>
                            <span className="text-xl font-bold text-gray-700">${datos.monto_inicial}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="flex items-center gap-2">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600"><DollarSign size={18} /></div>
                                <span className="text-green-800 font-medium">Ventas Efectivo</span>
                            </div>
                            <span className="text-xl font-bold text-green-700">+${datos.total_ventas}</span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
                            Calculado automáticamente desde las ventas
                        </div>
                    </div>
                )}

                {!estaAbierta && (
                    <div className="flex flex-col items-center justify-center text-gray-400 p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <AlertCircle size={48} className="mb-2 opacity-50" />
                        <p>Caja cerrada. No hay datos para mostrar.</p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Caja;