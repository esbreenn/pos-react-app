import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { BackIcon, PrinterIcon } from '../icons/Icons';

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

  const handlePrint = () => {
    window.print();
  };

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
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto card p-6 shadow-xl print-hidden">
        <div id="ticket" className="font-mono text-xs text-center">
          <header className="mb-4">
            <h1 className="ticket-title">Mi Tienda S.A.</h1>
            <p className="ticket-info">Calle Falsa 123, Ciudad</p>
            <p className="ticket-info">Tel: (011) 1234-5678 | CUIT: 20-12345678-9</p>
            <hr className="my-2 border-dashed" />
            <div className="meta text-left">
              <p><span className="font-bold">Ticket Nº:</span> <span>{saleData.id}</span></p>
              <p><span className="font-bold">Fecha:</span> <span>{new Date(saleData.timestamp.seconds * 1000).toLocaleString()}</span></p>
              <p><span className="font-bold">Cajero:</span> <span>Admin</span></p>
            </div>
            <hr className="my-2 border-dashed" />
          </header>
  
          <section id="items" className="mb-4">
            <Table className="ticket-items">
              <TableHeader>
                <TableRow>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Precio U.</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
  
          <footer>
            <div className="ticket-totals mb-4">
              <p><span className="font-bold">Subtotal:</span> <span>${subtotal.toFixed(2)}</span></p>
              <p><span className="font-bold">IVA (21%):</span> <span>${iva.toFixed(2)}</span></p>
              <p className="text-lg font-bold"><span className="text-lg">Total:</span> <span>${total.toFixed(2)}</span></p>
            </div>
            <p className="ticket-thanks">¡Gracias por su compra!</p>
          </footer>
        </div>
        <div className="actions mt-4 flex justify-between gap-2 print-hidden">
          <Button onClick={() => setCurrentView('pos')} variant="ghost">Volver al POS</Button>
          <Button onClick={handlePrint} variant="default">Imprimir</Button>
        </div>
      </div>
    </div>
  );
};

export default TicketView;