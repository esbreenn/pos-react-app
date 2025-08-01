import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { PencilIcon, SaveIcon, XIcon, PlusIcon, MinusIcon } from '../icons/Icons';
import { updateDoc, doc } from 'firebase/firestore';

const StockListView = ({ products, db }) => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [editedData, setEditedData] = useState({});

    // Convierte el objeto de productos en un array para mapear
    const productList = Object.values(products);

    const handleEditClick = (product) => {
        setEditingProduct(product.id);
        // Utiliza una copia del objeto para evitar mutar el estado directamente
        setEditedData({ ...product });
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setEditedData({});
    };

    const handleSaveEdit = async () => {
        if (!db || !editingProduct) return;
        try {
            const productsPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app'}/public/data/products`;
            const productRef = doc(db, productsPath, editingProduct);
            await updateDoc(productRef, {
                name: editedData.name,
                price: parseFloat(editedData.price),
                stock: parseInt(editedData.stock, 10),
            });
            handleCancelEdit();
        } catch (e) {
            console.error("Error al actualizar el producto:", e);
        }
    };

    const handleStockChange = async (productId, change) => {
        if (!db || !products[productId]) return;
        const currentStock = products[productId].stock;
        const newStock = Math.max(0, currentStock + change);
        
        try {
            const productsPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app'}/public/data/products`;
            const productRef = doc(db, productsPath, productId);
            await updateDoc(productRef, { stock: newStock });
        } catch (e) {
            console.error("Error al actualizar el stock:", e);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold mb-6">Control de Stock</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Productos en Stock</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productList.length > 0 ? (
                                productList.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.id}</TableCell>
                                        <TableCell>
                                            {editingProduct === product.id ? (
                                                <Input
                                                    value={editedData.name || ''}
                                                    onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                                                    className="w-full"
                                                />
                                            ) : (
                                                <span>{product.name}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingProduct === product.id ? (
                                                <Input
                                                    type="number"
                                                    value={editedData.price || ''}
                                                    onChange={(e) => setEditedData({...editedData, price: e.target.value})}
                                                    className="w-full"
                                                />
                                            ) : (
                                                <span>${product.price.toFixed(2)}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {editingProduct === product.id ? (
                                                    <Input
                                                        type="number"
                                                        value={editedData.stock || ''}
                                                        onChange={(e) => setEditedData({...editedData, stock: e.target.value})}
                                                        className="w-16 text-center"
                                                    />
                                                ) : (
                                                    <>
                                                        <Button onClick={() => handleStockChange(product.id, -1)} variant="secondary" size="icon" className="bg-gray-200 hover:bg-gray-300"><MinusIcon /></Button>
                                                        <span className="font-bold w-12 text-center">{product.stock}</span>
                                                        <Button onClick={() => handleStockChange(product.id, 1)} variant="secondary" size="icon" className="bg-gray-200 hover:bg-gray-300"><PlusIcon /></Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {editingProduct === product.id ? (
                                                <div className="flex gap-2">
                                                    <Button onClick={handleSaveEdit} variant="default" size="icon"><SaveIcon /></Button>
                                                    <Button onClick={handleCancelEdit} variant="secondary" size="icon" className="bg-red-200 hover:bg-red-300 text-red-600"><XIcon /></Button>
                                                </div>
                                            ) : (
                                                <Button onClick={() => handleEditClick(product)} variant="secondary" size="icon"><PencilIcon /></Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="5" className="text-center py-8 text-gray-500">
                                        No hay productos en stock.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default StockListView;
