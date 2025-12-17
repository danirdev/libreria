import {useState, useEffect} from 'react';
import axios from 'axios';

function Inventario ()
{
    // Estado para el formulario
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

    // Estado para la LISTA de productos
    const [productos, setProductos] = useState([]);

    // Cargar productos al iniciar la pantalla
    useEffect(() =>
    {
        cargarProductos();
    }, []);

    const cargarProductos = async () =>
    {
        try
        {
            const res = await axios.get('http://localhost:4000/productos');
            setProductos(res.data);
        } catch(error)
        {
            console.error("Error al cargar productos:", error);
        }
    };

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
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if(imagen) data.append('imagen', imagen);

        try
        {
            await axios.post('http://localhost:4000/productos', data);
            alert('¡Guardado!');
            cargarProductos(); // Recargar la lista automáticamente
            // Limpiar un poco el formulario
            setFormData({...formData, codigo_barras: '', nombre: '', precio_venta: ''});
            setImagen(null);
        } catch(error)
        {
            alert('Error: Revisa si el código ya existe o faltan datos.');
        }
    };

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial'}}>

            {/* SECCIÓN 1: FORMULARIO */}
            <div style={{background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px'}}>
                <h2>📝 Nuevo Producto</h2>
                <form onSubmit={handleSubmit} style={{display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr'}}>

                    <input type="text" name="codigo_barras" placeholder="Código (Ej: 779...)" value={formData.codigo_barras} onChange={handleChange} />
                    <input type="text" name="nombre" placeholder="Nombre (Ej: Cuaderno)" required value={formData.nombre} onChange={handleChange} />

                    <input type="number" name="precio_costo" placeholder="$ Costo" value={formData.precio_costo} onChange={handleChange} />
                    <input type="number" name="precio_venta" placeholder="$ Venta" required value={formData.precio_venta} onChange={handleChange} />

                    <input type="number" name="stock_actual" placeholder="Stock" value={formData.stock_actual} onChange={handleChange} />
                    <select name="categoria" value={formData.categoria} onChange={handleChange}>
                        <option value="Libreria">Librería</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Kiosco">Kiosco</option>
                    </select>

                    <label style={{gridColumn: 'span 2'}}>
                        <input type="checkbox" name="es_servicio" checked={formData.es_servicio} onChange={handleChange} />
                        ¿Es Servicio? (No usa stock)
                    </label>

                    <input type="file" onChange={handleImageChange} style={{gridColumn: 'span 2'}} />

                    <button type="submit" style={{gridColumn: 'span 2', padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer'}}>
                        GUARDAR PRODUCTO
                    </button>
                </form>
            </div>

            {/* SECCIÓN 2: LISTA DE PRODUCTOS */}
            <h3>📦 Inventario Actual ({productos.length})</h3>
            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                <thead>
                    <tr style={{background: '#333', color: 'white', textAlign: 'left'}}>
                        <th style={{padding: '10px'}}>Foto</th>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((prod) => (
                        <tr key={prod.id} style={{borderBottom: '1px solid #ddd'}}>
                            <td style={{padding: '5px'}}>
                                {prod.imagen_url ? (
                                    <img src={prod.imagen_url} alt="prod" width="50" height="50" style={{objectFit: 'cover', borderRadius: '4px'}} />
                                ) : (
                                    <span style={{color: '#ccc'}}>No img</span>
                                )}
                            </td>
                            <td>{prod.codigo_barras || '-'}</td>
                            <td>{prod.nombre}</td>
                            <td style={{fontWeight: 'bold', color: '#007bff'}}>${prod.precio_venta}</td>
                            <td style={{
                                color: prod.es_servicio ? 'purple' : (prod.stock_actual < 5 ? 'red' : 'green'),
                                fontWeight: 'bold'
                            }}>
                                {prod.es_servicio ? '∞' : prod.stock_actual}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}

export default Inventario;