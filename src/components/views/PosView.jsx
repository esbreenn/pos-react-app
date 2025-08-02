import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { PlusIcon, MinusIcon } from '../icons/Icons';
import {
    getFirestore,
    onSnapshot,
    collection,
    query,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';

const PosView = ({ cart, products, handleUpdateCartItem, handleRemoveCartItem, handleCheckout }) => {

    const ProductItem = ({ product }) => (
        <div className="flex items-center justify-between p-2 border-b">
            <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
            </div>
            <Button onClick={() => handleUpdateCartItem(product.id, 1)}>
                <PlusIcon />
            </Button>
        </div>
    );

    const CartItem = ({ item }) => (
        <div className="flex items-center justify-between p-2 border-b">
            <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleUpdateCartItem(item.id, -1)} size="icon"><MinusIcon /></Button>
                <Button variant="secondary" onClick={() => handleUpdateCartItem(item.id, 1)} size="icon"><PlusIcon /></Button>
                <Button variant="destructive" onClick={() => handleRemoveCartItem(item.id)}>Eliminar</Button>
            </div>
        </div>
    );

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold mb-6">Punto de Venta</h2>
            {/* Usamos la clase grid-cols-2 que ya tienes en tu CSS para la maquetación.
                Tu CSS ya se encarga de convertirlo en una sola columna en pantallas pequeñas. */}
            <div className="grid-cols-2">
                {/* Panel de Productos */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {products.length > 0 ? (
                                Object.values(products).map(product => (
                                    <ProductItem key={product.id} product={product} />
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No hay productos disponibles.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Panel del Carrito y resumen */}
                <div className="flex flex-col gap-4">
                    <Card className="flex-grow">
                        <CardHeader>
                            <CardTitle>Carrito</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {cart.length > 0 ? (
                                cart.map(item => (
                                    <CartItem key={item.id} item={item} />
                                ))
                            ) : (
                                <p className="text-center text-gray-500">El carrito está vacío.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumen y Botón de Checkout */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-lg">Total:</span>
                                <span className="font-bold text-2xl">${total.toFixed(2)}</span>
                            </div>
                            <Button className="w-full button-default" onClick={handleCheckout}>
                                Finalizar Venta
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PosView;