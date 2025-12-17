import React from 'react';

// 1. IMPORTANTE: Usamos React.forwardRef aquí para permitir que el componente reciba la referencia
const TicketImprimible = React.forwardRef((props, ref) =>
{

    // Extraemos los datos de las props
    const {venta, items, total, fecha} = props;

    return (
        // 2. IMPORTANTE: Asignamos ref={ref} al div principal. 
        // Sin esto, la impresora no sabe qué dibujar.
        <div ref={ref} style={{
            padding: '20px',
            width: '300px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: 'black',
            backgroundColor: 'white' // Fondo blanco asegurado
        }}>

            {/* Cabecera del Ticket */}
            <div style={{textAlign: 'center', marginBottom: '10px'}}>
                <h2 style={{margin: 0, fontSize: '16px'}}>LIBRERÍA</h2>
                <p style={{margin: '2px 0'}}>Av. Siempre Viva 123</p>
                <p style={{margin: '2px 0'}}>--------------------------------</p>
                <p style={{margin: '2px 0'}}>Fecha: {fecha}</p>
                <p style={{margin: '2px 0'}}>Ticket #: {venta ? venta.id : '---'}</p>
            </div>

            {/* Tabla de Productos */}
            <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '10px'}}>
                <thead>
                    <tr style={{borderBottom: '1px dashed black'}}>
                        <th style={{textAlign: 'left'}}>Cant.</th>
                        <th style={{textAlign: 'left'}}>Prod.</th>
                        <th style={{textAlign: 'right'}}>$$</th>
                    </tr>
                </thead>
                <tbody>
                    {items && items.map((item, i) => (
                        <tr key={i}>
                            <td style={{verticalAlign: 'top'}}>{item.cantidad}</td>
                            <td style={{paddingRight: '5px'}}>
                                {/* Cortamos el nombre si es muy largo */}
                                {item.nombre.length > 18 ? item.nombre.substring(0, 18) + '..' : item.nombre}
                            </td>
                            <td style={{textAlign: 'right', verticalAlign: 'top'}}>
                                ${item.precio_venta * item.cantidad}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totales */}
            <div style={{textAlign: 'right', borderTop: '1px dashed black', paddingTop: '5px'}}>
                <h3 style={{margin: 0, fontSize: '14px'}}>TOTAL: ${total}</h3>
            </div>

            {/* Pie de página */}
            <div style={{textAlign: 'center', marginTop: '20px'}}>
                <p style={{margin: 0}}>¡Gracias por su compra!</p>
            </div>

        </div>
    );
});

// Agregamos un nombre para facilitar la depuración (opcional pero recomendado)
TicketImprimible.displayName = 'TicketImprimible';

export default TicketImprimible;