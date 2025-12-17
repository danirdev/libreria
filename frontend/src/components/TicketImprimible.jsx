import React from 'react';

const TicketImprimible = React.forwardRef(({venta, items, total, fecha}, ref) =>
{
    return (
        <div ref={ref} className="p-6 w-[300px] font-mono text-xs text-black bg-white">

            {/* Cabecera */}
            <div className="text-center mb-4">
                <h2 className="text-base font-bold uppercase tracking-wider mb-1">Fotocopias Ramos</h2>
                <p className="text-gray-600">Av. Siempre Viva 123</p>
                <p>Tel: (388) 123-4567</p>

                <div className="my-3 border-b border-dashed border-black"></div>

                <div className="flex justify-between text-[10px] uppercase">
                    <span>Fecha: {fecha?.split(',')[0]}</span>
                    <span>Hora: {fecha?.split(',')[1]}</span>
                </div>
                <p className="text-left text-[10px] uppercase mt-1">
                    Ticket #: <span className="font-bold">{venta?.id || '---'}</span>
                </p>
            </div>

            {/* Tabla de Productos */}
            <table className="w-full border-collapse mb-4">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="text-left py-1 font-bold">Cant.</th>
                        <th className="text-left py-1 font-bold">Descripción</th>
                        <th className="text-right py-1 font-bold">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map((item, i) => (
                        <tr key={i}>
                            <td className="py-1 align-top text-center">{item.cantidad}</td>
                            <td className="py-1 align-top pl-1">
                                <div className="truncate max-w-[130px]">{item.nombre}</div>
                                <div className="text-[10px] text-gray-500">${item.precio_venta} c/u</div>
                            </td>
                            <td className="py-1 align-top text-right font-medium">
                                ${(item.precio_venta * item.cantidad).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totales */}
            <div className="border-t border-dashed border-black pt-2">
                <div className="flex justify-between items-center text-sm font-bold mt-1">
                    <span>TOTAL A PAGAR</span>
                    <span className="text-lg">${total}</span>
                </div>
                {venta?.metodo && (
                    <p className="text-right text-[10px] uppercase mt-1">Pago: {venta.metodo}</p>
                )}
            </div>

            {/* Pie de página */}
            <div className="text-center mt-6 space-y-1">
                <p>¡Gracias por su compra!</p>
                <p className="text-[10px] text-gray-500">No válido como factura fiscal</p>
                <div className="mt-4 pt-2 border-t border-dashed border-gray-300 text-[10px] italic">
                    Sistema desarrollado por Fotocopias Ramos
                </div>
            </div>
        </div>
    );
});

TicketImprimible.displayName = 'TicketImprimible';
export default TicketImprimible;