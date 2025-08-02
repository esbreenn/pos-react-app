import React from 'react';
// ...importa tus componentes como ya tenés

const PosView = ({
  cart,
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
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8 bg-gray-50 min-h-screen">
      {/* Escáner y agregar producto */}
      <div className="w-full md:w-1/2">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Punto de Venta</h2>
        <div className="bg-white rounded-2xl shadow-lg border mb-6">
          <div className="px-6 pt-6">
            <div className="text-xl font-bold text-blue-600 mb-4">Escáner de Barcode</div>
            <div className="flex flex-col items-center">
              {isScanning ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 mb-4">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                </div>
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-200 rounded-xl mb-4">
                  <p className="text-gray-500">Presiona "Escanear" para iniciar.</p>
                </div>
              )}
              <button
                onClick={() => setIsScanning(!isScanning)}
                className="w-full md:w-auto px-6 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition"
              >
                {isScanning ? 'Detener Escáner' : 'Escanear'}
              </button>
              <p className="mt-4 text-center text-sm text-gray-600">
                Último escaneo: <span className="font-mono text-gray-800">{scanResult || 'N/A'}</span>
              </p>
            </div>
          </div>
        </div>
        {/* Formulario agregar producto */}
        {showAddProductForm && (
          <div className="bg-white rounded-2xl shadow-lg border mb-6 mt-4">
            <div className="px-6 pt-6">
              <div className="text-xl font-bold text-orange-500 mb-2">Producto no encontrado</div>
              <div className="text-gray-500 mb-6">Añade un nuevo producto con código <span className="font-mono">{scanResult}</span>.</div>
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Nombre</label>
                  <input id="name" className="w-full rounded-lg border px-4 py-2 bg-gray-50 text-gray-800 shadow focus:ring-2 focus:ring-blue-400 transition" placeholder="Nombre del producto"
                    value={newProductData.name} onChange={e => setNewProductData({ ...newProductData, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="price" className="block text-gray-700 font-semibold mb-1">Precio</label>
                  <input id="price" type="number" className="w-full rounded-lg border px-4 py-2 bg-gray-50 text-gray-800 shadow focus:ring-2 focus:ring-blue-400 transition" placeholder="Precio"
                    value={newProductData.price} onChange={e => setNewProductData({ ...newProductData, price: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-gray-700 font-semibold mb-1">Stock</label>
                  <input id="stock" type="number" className="w-full rounded-lg border px-4 py-2 bg-gray-50 text-gray-800 shadow focus:ring-2 focus:ring-blue-400 transition" placeholder="Stock inicial"
                    value={newProductData.stock} onChange={e => setNewProductData({ ...newProductData, stock: parseInt(e.target.value, 10) })} />
                </div>
              </div>
              <button
                onClick={() => handleAddProduct(newProductData)}
                className="mt-6 w-full md:w-auto px-6 py-2 rounded-lg bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition"
              >
                Guardar Producto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Carrito */}
      <div className="w-full md:w-1/2">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Carrito de Compras</h2>
        <div className="bg-white rounded-2xl shadow-lg border">
          <div className="p-6">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="font-semibold text-gray-600 pb-2">Producto</th>
                  <th className="font-semibold text-gray-600 pb-2">Precio</th>
                  <th className="font-semibold text-gray-600 pb-2">Cant.</th>
                  <th className="font-semibold text-gray-600 pb-2">Total</th>
                  <th className="font-semibold text-gray-600 pb-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? (
                  cart.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2">${item.price.toFixed(2)}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleUpdateCartItem(item.id, -1)} className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition">{/* icono menos */}-</button>
                          <span className="font-bold">{item.quantity}</span>
                          <button onClick={() => handleUpdateCartItem(item.id, 1)} className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition">{/* icono más */}+</button>
                        </div>
                      </td>
                      <td className="py-2 font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                      <td className="py-2">
                        <button onClick={() => handleRemoveCartItem(item.id)} className="p-2 rounded bg-red-200 hover:bg-red-300 text-red-700 transition">{/* icono trash */}🗑️</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">El carrito está vacío.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Total y botón checkout */}
          {cart.length > 0 && (
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center p-6 border-t">
              <div className="w-full text-right text-2xl font-bold text-gray-900">Total: ${total.toFixed(2)}</div>
              <button
                onClick={handleCheckout}
                className="mt-4 md:mt-0 px-8 py-3 rounded-lg bg-blue-500 text-white font-bold shadow hover:bg-blue-600 transition"
              >
                Finalizar Venta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosView;
