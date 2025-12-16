import {useEffect, useState} from 'react';
import axios from 'axios';

function App ()
{
  const [mensaje, setMensaje] = useState('Cargando estado del servidor...');
  const [hora, setHora] = useState('');

  useEffect(() =>
  {
    // Aquí React le "habla" a Node.js en el puerto 4000
    axios.get('http://localhost:4000/test-db')
      .then(response =>
      {
        // Si todo sale bien, guardamos los datos
        setMensaje(response.data.mensaje);
        setHora(response.data.hora_servidor);
      })
      .catch(error =>
      {
        console.error("Hubo un error:", error);
        setMensaje('Error: No se pudo conectar con el Backend ❌');
      });
  }, []);

  return (
    <div style={{padding: '50px', fontFamily: 'Arial, sans-serif'}}>
      <h1>Panel de Control - Librería</h1>
      <hr />

      <div style={{
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: '#f9f9f9',
        maxWidth: '400px'
      }}>
        <h3>Prueba de Conexión:</h3>
        <p><strong>Estado:</strong> {mensaje}</p>
        <p><strong>Hora Local:</strong> {new Date(hora).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default App;