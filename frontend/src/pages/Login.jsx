import {useState} from 'react';
import api from '../api';
import {BookOpen, Key, Mail, ArrowRight, AlertCircle, Loader2} from 'lucide-react';

function Login ({onLogin})
{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        setCargando(true);
        setError('');

        try
        {
            const res = await api.post('/auth/login', {email, password});

            // Simular carga para suavidad
            setTimeout(() =>
            {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
                onLogin();
            }, 600);

        } catch(err)
        {
            console.error(err);
            if(err.response)
            {
                setError(err.response.data.error || 'Credenciales inválidas');
            } else
            {
                setError('Error de conexión con el servidor');
            }
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-primary-200/30 blur-3xl animate-float" />
                <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-primary-300/20 blur-3xl animate-float" style={{animationDelay: '-3s'}} />
            </div>

            <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50 z-10 animate-fade-in">

                {/* Left Side: Brand */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-primary-600 to-primary-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                            <BookOpen size={32} className="text-white" />
                        </div>
                        <h1 className="text-5xl font-bold mb-4 tracking-tight">Librería POS</h1>
                        <p className="text-primary-100 text-lg font-light tracking-wide opacity-90">Gestión inteligente para tu negocio.</p>
                    </div>

                    <div className="relative z-10 mt-12">
                        <div className="flex gap-3 mb-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 rounded-full ${i === 1 ? 'w-12 bg-white' : 'w-3 bg-white/30'}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white/60 relative">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h2>
                        <p className="text-gray-500">Ingresa a tu cuenta para continuar</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-slide-up shadow-sm">
                            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email</label>
                                <div className={`flex items-center px-4 py-3.5 rounded-xl border-2 transition-all duration-300 ${focusedField === 'email' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                                    <Mail className={`mr-3 transition-colors ${focusedField === 'email' ? 'text-primary-500' : 'text-gray-400'}`} size={20} />
                                    <input
                                        type="email"
                                        className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                                        placeholder="ejemplo@correo.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Contraseña</label>
                                <div className={`flex items-center px-4 py-3.5 rounded-xl border-2 transition-all duration-300 ${focusedField === 'password' ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
                                    <Key className={`mr-3 transition-colors ${focusedField === 'password' ? 'text-primary-500' : 'text-gray-400'}`} size={20} />
                                    <input
                                        type="password"
                                        className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded text-primary-600 border-gray-300 focus:ring-primary-500" />
                                <span className="text-sm text-gray-500 font-medium">Recordarme</span>
                            </label>
                            <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700">¿Olvidaste tu contraseña?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl"></div>
                            {cargando ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Ingresar al Sistema</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;