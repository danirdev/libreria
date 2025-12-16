import {useState} from 'react';
import axios from 'axios';

function Inventario ()
{
    const [formData, setFormData] = useState({
        codigo_barras: '',
        nombre: '',
        precio_costo: '',
        precio_venta: '',
        stock_actual: '',
        categoria: 'Libreria',
        es_servicio: false
    });
    const [imagen, setImagen] = useState(null);

    const handleChange = (e) =>
    {
        const {name, value, type, checked} = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) =>
    {
        setImagen(e.target.files[0]);
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        // Para enviar archivos (imágenes), necesitamos usar FormData
        const data = new FormData();
        // Agregamos todos los campos al paquete
        Object.keys(formData).forEach(key =>
        {
            data.append(key, formData[key]);
        });
        if(imagen)
        {
            data.append('imagen', imagen);
        }

        try
        {
            await axios.post('http://localhost:4000/productos', data);
            alert('¡Producto guardado con éxito!');
            // Limpiar formulario (opcional)
        } catch(error)
        {
            console.error(error);
            alert('Error al guardar');
        }
    };

    return (
        <div style={{padding: '20px', maxWidth: '500px', margin: '0 auto'}}>
            <h2>Agregar Nuevo Producto</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>

                <input type="text" name="codigo_barras" placeholder="Código de Barras (opcional)" onChange={handleChange} />
                <input type="text" name="nombre" placeholder="Nombre del Producto" required onChange={handleChange} />

                <div style={{display: 'flex', gap: '10px'}}>
                    <input type="number" name="precio_costo" placeholder="Costo" onChange={handleChange} />
                    <input type="number" name="precio_venta" placeholder="Precio Venta" required onChange={handleChange} />
                </div>

                <div style={{display: 'flex', gap: '10px'}}>
                    <input type="number" name="stock_actual" placeholder="Stock Inicial" onChange={handleChange} />
                    <select name="categoria" onChange={handleChange}>
                        <option value="Libreria">Librería</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Kiosco">Kiosco</option>
                    </select>
                </div>

                <label>
                    <input type="checkbox" name="es_servicio" onChange={handleChange} />
                    ¿Es un Servicio? (Fotocopia, Anillado)
                </label>

                <input type="file" onChange={handleImageChange} />

                <button type="submit" style={{padding: '10px', background: '#007bff', color: 'white', border: 'none'}}>
                    Guardar Producto
                </button>
            </form>
        </div>
    );
}

export default Inventario;