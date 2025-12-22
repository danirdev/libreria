import {useState, useEffect} from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import {Users, Search, UserPlus, DollarSign, Phone, User, X} from 'lucide-react';

function Clientes ()
{
    const [clientes, setClientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    // Estados para formulario
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoTel, setNuevoTel] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);

    useEffect(() => {cargarClientes();}, []);

    const cargarClientes = async () =>
    {
        try
        {
            const res = await api.get('/clientes');
            setClientes(res.data);
        } catch(err) {console.error(err);}
    };

    const crearCliente = async (e) =>
    {
        e.preventDefault();
        try
        {
            await api.post('/clientes', {nombre: nuevoNombre, telefono: nuevoTel});
            setNuevoNombre(''); setNuevoTel(''); setMostrarForm(false);
            cargarClientes();
            toast.success("Cliente registrado correctamente ✨");
        } catch(err)
        {
            toast.error("Error al crear cliente");
        }
    };

    const registrarPago = async (cliente) =>
    {
        const monto = prompt(`Deuda actual: $${cliente.saldo_deudor}. ¿Cuánto paga?`);
        if(!monto) return;
        try
        {
            await api.post('/clientes/pagar', {id_cliente: cliente.id, monto: parseFloat(monto)});
            cargarClientes();
            toast.success(`Pago de cliente registrado 💵`);
        } catch(err)
        {
            toast.error("Error al registrar el pago");
        }
    };

    const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <div className="space-y-6 animate-fade-in">

            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="bg-primary-100 dark:bg-primary-900/40 p-3 rounded-xl text-primary-600 dark:text-primary-300">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Clientes</h1>
                        <p className="text-gray-500 dark:text-gray-400">Gestión de cuentas corrientes</p>
                    </div>
                </div>
                <button
                    onClick={() => setMostrarForm(!mostrarForm)}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                    {mostrarForm ? <X size={20} /> : <UserPlus size={20} />}
                    {mostrarForm ? 'Cancelar' : 'Nuevo Cliente'}
                </button>
            </div>

            {/* FORMULARIO DESPLEGABLE */}
            {mostrarForm && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 p-6 rounded-2xl animate-slide-up">
                    <form onSubmit={crearCliente} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-primary-800 dark:text-primary-200 uppercase ml-1">Nombre Completo</label>
                            <input type="text" placeholder="Ej: Juan Pérez" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required
                                className="w-full p-3 rounded-xl border border-primary-200 dark:border-primary-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-400 outline-none" />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-primary-800 dark:text-primary-200 uppercase ml-1">Teléfono</label>
                            <input type="text" placeholder="Ej: 388-1234567" value={nuevoTel} onChange={e => setNuevoTel(e.target.value)}
                                className="w-full p-3 rounded-xl border border-primary-200 dark:border-primary-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-400 outline-none" />
                        </div>
                        <button type="submit" className="bg-primary-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-700 transition-all shadow-md">
                            Guardar
                        </button>
                    </form>
                </div>
            )}

            {/* LISTA DE TARJETAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Buscador */}
                <div className="col-span-full mb-2">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-primary-400 outline-none text-lg text-gray-800 dark:text-white dark:placeholder-gray-500"
                        />
                    </div>
                </div>

                {clientesFiltrados.map(c => (
                    <div key={c.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500 dark:text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    <User size={20} />
                                </div>
                                {parseFloat(c.saldo_deudor) > 0 && (
                                    <span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-bold px-2 py-1 rounded-full border border-red-100 dark:border-red-800">
                                        Debe Dinero
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{c.nombre}</h3>
                            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm mt-1">
                                <Phone size={14} /> {c.telefono || 'Sin teléfono'}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Saldo Actual</p>
                                <p className={`text-xl font-black ${parseFloat(c.saldo_deudor) > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                                    ${c.saldo_deudor}
                                </p>
                            </div>
                            {parseFloat(c.saldo_deudor) > 0 && (
                                <button
                                    onClick={() => registrarPago(c)}
                                    className="bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 font-bold py-2 px-4 rounded-lg text-sm transition-all flex items-center gap-1"
                                >
                                    <DollarSign size={16} /> Pagar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Clientes;