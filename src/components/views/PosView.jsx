import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { PlusIcon, MinusIcon, TrashIcon } from '../icons/Icons';

const PosView = ({ 
  cart, 
  products, 
  isScanning, 
  setIsScanning, 
  scanResult, 
  videoRef,
  showAddProductForm,
  newProductData,
  setNewProductData,
  handleAddProduct,
  handleUpdateCartItem,
  handleRemoveCartItem,
  handleCheckout
}) => {
  return (
    <div className="p-8 grid-cols-2">
      <div>
        <h2 className="text-3xl font-bold mb-6">Punto de Venta</h2>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Escáner de Barcode</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {isScanning ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 video-overlay mb-4">
                <video ref={videoRef} autoPlay playsInline className="video-stream"></video>
                <div className="video-overlay"></div>
              </div>
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gray-200 rounded-xl mb-4">
                <p className="text-gray-500">Presiona "Escanear" para iniciar.</p>
              </div>
            )}
            <Button onClick={() => setIsScanning(!isScanning)} variant="default">
              {isScanning ? 'Detener Escáner' : 'Escanear'}
            </Button>
            <p className="mt-4 text-center text-sm text-gray-600">Último escaneo: <span className="font-mono text-gray-800">{scanResult || 'N/A'}</span></p>
          </CardContent>
        </Card>
        {showAddProductForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Producto no encontrado</CardTitle>
              <CardDescription>Añade un nuevo producto con código {scanResult}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Nombre del producto" value={newProductData.name} onChange={(e) => setNewProductData({...newProductData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <Label htmlFor="price">Precio</Label>
                  <Input id="price" type="number" placeholder="Precio" value={newProductData.price} onChange={(e) => setNewProductData({...newProductData, price: parseFloat(e.target.value)})} />
                </div>
                <div className="form-group">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" placeholder="Stock inicial" value={newProductData.stock} onChange={(e) => setNewProductData({...newProductData, stock: parseInt(e.target.value, 10)})} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleAddProduct(newProductData)} variant="default">Guardar Producto</Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-6">Carrito de Compras</h2>
        <Card>
          <CardContent className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Cant.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length > 0 ? (
                  cart.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button onClick={() => handleUpdateCartItem(item.id, -1)} variant="ghost" className="button button-ghost"><MinusIcon /></Button>
                        <span className="font-bold">{item.quantity}</span>
                        <Button onClick={() => handleUpdateCartItem(item.id, 1)} variant="ghost" className="button button-ghost"><PlusIcon /></Button>
                      </TableCell>
                      <TableCell className="font-semibold">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleRemoveCartItem(item.id)} variant="ghost" className="button button-ghost"><TrashIcon /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                      El carrito está vacío.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {cart.length > 0 && (
            <CardFooter>
              <div className="w-full text-right text-2xl font-bold border-t pt-4">
                Total: ${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
              </div>
              <Button onClick={handleCheckout} variant="default">
                Finalizar Venta
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PosView;