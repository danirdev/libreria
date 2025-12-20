import React from 'react';

const TicketImprimible = React.forwardRef(({venta, items, total, fecha}, ref) =>
{
    return (
        // CAMBIOS CLAVE: 
        // 1. w-[58mm] -> Ancho exacto para el papel
        // 2. min-h-0 -> Para evitar problemas de altura
        // 3. p-1 -> Padding mínimo para aprovechar el papel
        // 4. text-[10px] -> Letra más chica y legible en térmicas
        // 5. leading-tight -> Menos espacio entre líneas para ahorrar papel
        <div ref={ref} className="w-[58mm] min-h-0 p-1 font-mono text-[10px] leading-tight text-black bg-white overflow-hidden">

            {/* Cabecera */}
            <div className="text-center mb-2">
                <h2 className="text-sm font-black uppercase mb-1">Fotocopias RAMOS</h2>
                <p className="text-[9px]">Av. Siempre Viva 123</p>
                <p className="text-[9px]">Tel: (388) 123-4567</p>

                <div className="my-2 border-b border-dashed border-black"></div>

                {/* Fecha y Hora en una línea o dos si es muy angosto */}
                <div className="flex flex-col items-start text-[9px] uppercase">
                    <span>Fecha: {fecha?.split(',')[0]}</span>
                    <span>Hora: {fecha?.split(',')[1]}</span>
                    <span className="mt-1">Ticket #: <span className="font-bold">{venta?.id || '---'}</span></span>
                </div>
            </div>

            {/* Tabla de Productos Compacta */}
            <table className="w-full border-collapse mb-2">
                <thead>
                    <tr className="border-b border-dashed border-black">
                        <th className="text-left py-1 w-4 text-[9px]">#</th>
                        <th className="text-left py-1 text-[9px]">Desc.</th>
                        <th className="text-right py-1 text-[9px]">Tot.</th>
                    </tr>
                </thead>
                <tbody>
                    {items?.map((item, i) => (
                        <tr key={i}>
                            <td className="py-1 align-top text-center font-bold">{item.cantidad}</td>
                            <td className="py-1 align-top pl-1">
                                {/* line-clamp-2 corta el texto si es muy largo para que no rompa el ticket */}
                                <div className="line-clamp-2 font-medium leading-3">{item.nombre}</div>
                                <div className="text-[9px] text-gray-500">${item.precio_venta}</div>
                            </td>
                            <td className="py-1 align-top text-right font-bold">
                                ${(item.precio_venta * item.cantidad).toFixed(0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totales */}
            <div className="border-t border-dashed border-black pt-2">
                <div className="flex justify-between items-center text-xs font-black mt-1">
                    <span>TOTAL</span>
                    <span className="text-base">${total}</span>
                </div>
                {venta?.metodo && (
                    <p className="text-right text-[9px] uppercase mt-1 font-bold">Pago: {venta.metodo}</p>
                )}
            </div>

            {/* Pie de página */}
            <div className="text-center mt-4 space-y-1">
                <p className="font-bold">¡Gracias por su compra!</p>
                <p className="text-[8px] text-gray-500">No válido como factura fiscal</p>
                <div className="mt-2 pt-1 border-t border-dashed border-gray-300 text-[8px] italic">
                    Sistema LibreríaPOS
                </div>
            </div>
        </div>
    );
});

TicketImprimible.displayName = 'TicketImprimible';
export default TicketImprimible;