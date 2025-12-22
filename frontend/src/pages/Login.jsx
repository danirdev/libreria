import {useState} from 'react';
import api from '../api';
import {BookOpen, LogIn, Lock, Mail} from 'lucide-react';

function Login ({onLogin})
{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        setCargando(true);
        setError('');

        try
        {
            const res = await api.post('/auth/login', {email, password});
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
            onLogin();
        } catch(err)
        {
            setError('Credenciales incorrectas');
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-50 dark:bg-gray-900 p-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">

                {/* Encabezado Azul */}
                <div className="bg-primary-600 dark:bg-primary-800 p-8 text-center transition-colors">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <BookOpen size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Fotocopias Ramos</h2>
                    <p className="text-primary-100 dark:text-primary-200 text-sm mt-1">Sistema de Gestión</p>
                </div>

                {/* Formulario */}
                <div className="p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                                    placeholder="admin@libreria.com"
                                    value={email} onChange={e => setEmail(e.target.value)} required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                                    placeholder="••••••••"
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-bold py-2.5 rounded-lg shadow-md transition-all flex justify-center gap-2 items-center disabled:opacity-70"
                        >
                            {cargando ? 'Entrando...' : <><LogIn size={18} /> Ingresar</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;