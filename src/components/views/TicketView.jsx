import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';

const TicketView = ({ currentSaleId, db, setCurrentView }) => {
  const [saleData, setSaleData] = useState(null);
  const [ticketError, setTicketError] = useState(null);

  useEffect(() => {
    const fetchSale = async () => {
      if (!db || !currentSaleId) return;
      try {
        const salesPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app'}/public/data/sales`;
        const saleDoc = await getDoc(doc(db, salesPath, currentSaleId));
        if (saleDoc.exists()) {
          setSaleData({ id: saleDoc.id, ...saleDoc.data() });
        } else {
          setTicketError('Venta no encontrada.');
        }
      } catch (e) {
        console.error("Error al cargar ticket:", e);
        setTicketError('Error al cargar la información del ticket.');
      }
    };
    fetchSale();
  }, [db, currentSaleId]);

  const handlePrint = () => window.print();

  if (ticketError) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{ticketError}</p>
      </div>
    );
  }

  if (!saleData) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Cargando ticket...</p>
      </div>
    );
  }

  const subtotal = saleData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;

  return (
    <div className="p-8 bg-white min-h-screen flex justify-center items-start">
      <div className="max-w-md w-full rounded-2xl bg-gray-50 shadow-xl print:hidden p-6">
        <div id="ticket" className="font-mono text-sm text-gray-700">
          <header className="mb-6">
            <h1 className="text-xl font-bold text-center mb-1">Mi Tienda S.A.</h1>
            <p className="text-center text-sm">Calle Falsa 123, Ciudad</p>
            <p className="text-center text-sm mb-2">Tel: (011) 1234-5678 | CUIT: 20-12345678-9</p>
            <hr className="border-dashed border-t border-gray-400" />
            <div className="mt-3 space-y-1 text-left text-sm">
              <p><span className="font-semibold">Ticket Nº:</span> {saleData.id}</p>
              <p><span className="font-semibold">Fecha:</span> {new Date(saleData.timestamp.seconds * 1000).toLocaleString()}</p>
              <p><span className="font-semibold">Cajero:</span> Admin</p>
            </div>
            <hr className="border-dashed border-t border-gray-400 mt-3" />
          </header>

          <section id="items" className="mb-6">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Cant.</TableHead>
                  <TableHead className="text-left">Descripción</TableHead>
                  <TableHead className="text-right">Precio U.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleData.items.map((item, i) => (
                  <TableRow key={i} className="odd:bg-gray-100">
                    <TableCell className="text-left">{item.quantity}</TableCell>
                    <TableCell className="text-left">{item.name}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <footer className="text-right space-y-2">
            <p><span className="font-semibold">Subtotal:</span> ${subtotal.toFixed(2)}</p>
            <p><span className="font-semibold">IVA (21%):</span> ${iva.toFixed(2)}</p>
            <p className="text-lg font-bold"><span>Total:</span> ${total.toFixed(2)}</p>
            <p className="text-center mt-4 italic text-gray-600">¡Gracias por su compra!</p>
          </footer>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <Button onClick={() => setCurrentView('pos')} variant="ghost" className="flex-1">
            Volver al POS
          </Button>
          <Button onClick={handlePrint} variant="default" className="flex-1">
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
