import {useState, useEffect} from 'react';
import api from '../api';
import {Pencil, Trash2, X, Save} from 'lucide-react'; // Iconos bonitos

function Inventario ()
{
    const [productos, setProductos] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false); // ¿Estamos creando o editando?
    const [idEdicion, setIdEdicion] = useState(null); // ID del producto a editar

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

    useEffect(() =>
    {
        cargarProductos();
    }, []);

    const cargarProductos = async () =>
    {
        try
        {
            const res = await api.get('/productos');
            setProductos(res.data);
        } catch(error) {console.error(error);}
    };

    // Prepara el formulario para editar
    const editarProducto = (prod) =>
    {
        setModoEdicion(true);
        setIdEdicion(prod.id);
        setFormData({
            codigo_barras: prod.codigo_barras || '',
            nombre: prod.nombre,
            precio_costo: prod.precio_costo || '',
            precio_venta: prod.precio_venta,
            stock_actual: prod.stock_actual,
            categoria: prod.categoria || 'Libreria',
            es_servicio: prod.es_servicio
        });
        // Nota: La imagen no la pre-cargamos en el input file por seguridad del navegador
        window.scrollTo({top: 0, behavior: 'smooth'}); // Subir al formulario
    };

    const cancelarEdicion = () =>
    {
        setModoEdicion(false);
        setIdEdicion(null);
        setFormData({codigo_barras: '', nombre: '', precio_costo: '', precio_venta: '', stock_actual: '', categoria: 'Libreria', es_servicio: false});
        setImagen(null);
    };

    const eliminarProducto = async (id) =>
    {
        if(!confirm('¿Seguro que quieres borrar este producto?')) return;
        try
        {
            await api.delete(`/productos/${id}`);
            cargarProductos();
            alert('Eliminado correctamente');
        } catch(error)
        {
            // Si el backend responde con error 400 (porque tiene ventas), mostramos el mensaje
            if(error.response && error.response.status === 400)
            {
                alert(error.response.data.error);
            } else
            {
                alert('Error al eliminar');
            }
        }
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if(imagen) data.append('imagen', imagen);

        try
        {
            if(modoEdicion)
            {
                // ACTUALIZAR (PUT)
                await api.put(`/productos/${idEdicion}`, data);
                alert('¡Producto actualizado! ✨');
            } else
            {
                // CREAR (POST)
                await api.post('/productos', data);
                alert('¡Producto creado! 🎉');
            }

            cargarProductos();
            cancelarEdicion(); // Limpiar formulario
        } catch(error)
        {
            console.error(error);
            alert('Error al guardar');
        }
    };

    const handleChange = (e) =>
    {
        const {name, value, type, checked} = e.target;
        setFormData({...formData, [name]: type === 'checkbox' ? checked : value});
    };

    return (
        <div style={{padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial'}}>

            {/* FORMULARIO */}
            <div style={{background: modoEdicion ? '#e3f2fd' : '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: modoEdicion ? '2px solid #2196f3' : '1px solid #ddd', transition: 'all 0.3s'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>{modoEdicion ? '✏️ Editando Producto' : '📝 Nuevo Producto'}</h2>
                    {modoEdicion && <button onClick={cancelarEdicion} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#666'}}><X /></button>}
                </div>

                <form onSubmit={handleSubmit} style={{display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr'}}>

                    <input type="text" name="codigo_barras" placeholder="Código Barras" value={formData.codigo_barras} onChange={handleChange} style={{padding: '8px'}} />
                    <input type="text" name="nombre" placeholder="Nombre *" required value={formData.nombre} onChange={handleChange} style={{padding: '8px'}} />

                    <input type="number" name="precio_costo" placeholder="$ Costo" value={formData.precio_costo} onChange={handleChange} style={{padding: '8px'}} />
                    <input type="number" name="precio_venta" placeholder="$ Venta *" required value={formData.precio_venta} onChange={handleChange} style={{padding: '8px'}} />

                    <input type="number" name="stock_actual" placeholder="Stock" value={formData.stock_actual} onChange={handleChange} style={{padding: '8px'}} />
                    <select name="categoria" value={formData.categoria} onChange={handleChange} style={{padding: '8px'}}>
                        <option value="Libreria">Librería</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Kiosco">Kiosco</option>
                    </select>

                    <label style={{gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <input type="checkbox" name="es_servicio" checked={formData.es_servicio} onChange={handleChange} />
                        ¿Es Servicio? (No usa stock)
                    </label>

                    <input type="file" onChange={(e) => setImagen(e.target.files[0])} style={{gridColumn: 'span 2'}} />

                    <button type="submit" style={{gridColumn: 'span 2', padding: '12px', background: modoEdicion ? '#2196f3' : '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
                        {modoEdicion ? <><Save size={18} /> ACTUALIZAR</> : <><Save size={18} /> GUARDAR</>}
                    </button>
                </form>
            </div>

            {/* TABLA */}
            <h3>📦 Inventario ({productos.length})</h3>
            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                <thead>
                    <tr style={{background: '#333', color: 'white', textAlign: 'left'}}>
                        <th style={{padding: '10px'}}>Foto</th>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((prod) => (
                        <tr key={prod.id} style={{borderBottom: '1px solid #ddd', background: 'white'}}>
                            <td style={{padding: '5px'}}>
                                {prod.imagen_url ? <img src={prod.imagen_url} width="40" height="40" style={{objectFit: 'cover', borderRadius: '4px'}} /> : '-'}
                            </td>
                            <td>{prod.codigo_barras || <small style={{color: '#ccc'}}>N/A</small>}</td>
                            <td>{prod.nombre}</td>
                            <td style={{fontWeight: 'bold'}}>${prod.precio_venta}</td>
                            <td style={{color: prod.stock_actual < 5 && !prod.es_servicio ? 'red' : 'green'}}>
                                {prod.es_servicio ? '∞' : prod.stock_actual}
                            </td>
                            <td style={{display: 'flex', gap: '10px', padding: '10px'}}>
                                <button onClick={() => editarProducto(prod)} title="Editar" style={{background: '#ffc107', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer'}}>
                                    <Pencil size={16} color="black" />
                                </button>
                                <button onClick={() => eliminarProducto(prod.id)} title="Borrar" style={{background: '#ff5252', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer'}}>
                                    <Trash2 size={16} color="white" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Inventario;