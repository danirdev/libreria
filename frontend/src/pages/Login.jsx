import {useState} from 'react';
import axios from 'axios';

function Login ({onLogin})
{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        try
        {
            const res = await axios.post('http://localhost:4000/auth/login', {email, password});

            // Si el login es exitoso:
            // 1. Guardamos el token en la memoria del navegador (localStorage)
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

            // 2. Avisamos a App.jsx que ya entramos
            onLogin();

        } catch(err)
        {
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5'}}>
            <div style={{background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '300px', textAlign: 'center'}}>
                <h2 style={{color: '#333'}}>📚 Acceso Librería</h2>

                {error && <p style={{color: 'red', fontSize: '14px'}}>{error}</p>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <input
                        type="email"
                        placeholder="usuario@email.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password} onChange={e => setPassword(e.target.value)}
                        style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
                        required
                    />
                    <button type="submit" style={{padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>
                        ENTRAR
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;