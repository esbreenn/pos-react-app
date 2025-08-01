import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, addDoc, updateDoc, writeBatch } from 'firebase/firestore';

// Importaciones de los componentes de UI
import { Button } from './ui/button';

// Importa tus componentes de vista
import DashboardView from './components/views/DashboardView';
import PosView from './components/views/PosView';
import TicketView from './components/views/TicketView';
// Importa el nuevo componente
import StockListView from './components/views/StockListView'; 

// Tu configuración de Firebase. Asegúrate de que estos valores sean los correctos.
const firebaseConfig = {
    apiKey: "AIzaSyBoERNPo-BGGUhcn-2IJhv7Lt9ExjtplfE",
    authDomain: "spos-3e87c.firebaseapp.com",
    projectId: "spos-3e87c",
    storageBucket: "spos-3e87c.firebasestorage.app",
    messagingSenderId: "978108147807",
    appId: "1:978108147807:web:41824bdb5bdbb06928d3ea"
};

// SVG Icons
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const ScanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scan-line">
        <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
        <line x1="7" x2="17" y1="12" y2="12"/>
    </svg>
);

// Icono para la vista de stock
const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-checks">
        <path d="m3 16 2-2 2 2" />
        <path d="M7 6h14" />
        <path d="M7 12h14" />
        <path d="M7 18h14" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
    </svg>
);


const App = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [products, setProducts] = useState({});
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // POS State
    const [cart, setCart] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const videoRef = useRef(null);
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [newProductData, setNewProductData] = useState({ name: '', price: 0, stock: 0 });

    // Ticket State
    const [currentSaleId, setCurrentSaleId] = useState(null);

    // --- Firebase Setup ---
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const firebaseAuth = getAuth(app);
            setDb(firestore);
            setAuth(firebaseAuth);

            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    try {
                        await signInAnonymously(firebaseAuth);
                        setUserId(firebaseAuth.currentUser.uid);
                    } catch (e) {
                        console.error("Error al iniciar sesión:", e);
                        setError("Error de autenticación. No se puede conectar a la base de datos.");
                    }
                }
                setIsAuthReady(true);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Error al inicializar Firebase:", e);
            setError("Error al inicializar Firebase. Asegúrate de que la configuración sea correcta.");
            setLoading(false);
        }
    }, []);

    // --- Data Fetching from Firestore ---
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;

        // Listen to products collection
        const productsPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app'}/public/data/products`;
        const productsQuery = query(collection(db, productsPath));
        const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
            const fetchedProducts = {};
            snapshot.forEach(doc => {
                fetchedProducts[doc.id] = { id: doc.id, ...doc.data() };
            });
            setProducts(fetchedProducts);
        }, (e) => {
            console.error("Error al obtener productos:", e);
            setError("Error al cargar los productos.");
        });

        // Listen to sales collection
        const salesPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app'}/public/data/sales`;
        const salesQuery = query(collection(db, salesPath));
        const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
            const fetchedSales = [];
            snapshot.forEach(doc => {
                fetchedSales.push({ id: doc.id, ...doc.data() });
            });
            setSales(fetchedSales);
        }, (e) => {
            console.error("Error al obtener ventas:", e);
            setError("Error al cargar las ventas.");
        });

        return () => {
            unsubscribeProducts();
            unsubscribeSales();
        };
    }, [isAuthReady, db, userId]);

    // --- Barcode Scanner Logic ---
    useEffect(() => {
        let videoStream;
        let scanInterval;

        if (isScanning && videoRef.current) {
            const startStream = async () => {
                try {
                    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    videoRef.current.srcObject = videoStream;
                    videoRef.current.play();

                    if ('BarcodeDetector' in window) {
                        const barcodeDetector = new BarcodeDetector({ formats: ['ean_13', 'upc_a'] });
                        scanInterval = setInterval(async () => {
                            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                                const barcodes = await barcodeDetector.detect(videoRef.current);
                                if (barcodes.length > 0) {
                                    const barcode = barcodes[0].rawValue;
                                    handleScan(barcode);
                                }
                            }
                        }, 500);
                    } else {
                        console.warn('BarcodeDetector no es compatible con este navegador.');
                    }
                } catch (err) {
                    console.error('Error al acceder a la cámara:', err);
                    setIsScanning(false);
                    // Usar un modal o un mensaje en la UI en lugar de alert()
                }
            };
            startStream();
        }

        return () => {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
            }
            if (scanInterval) {
                clearInterval(scanInterval);
            }
        };
    }, [isScanning]);

    const handleScan = (barcode) => {
        if (!db || !userId) return;
        setScanResult(barcode);
        setIsScanning(false);

        if (products[barcode]) {
            const existingItem = cart.find(item => item.id === barcode);
            if (existingItem) {
                setCart(cart.map(item =>
                    item.id === barcode ? { ...item, quantity: item.quantity + 1 } : item
                ));
            } else {
                setCart([...cart, { ...products[barcode], quantity: 1 }]);
            }
            setShowAddProductForm(false);
        } else {
            setShowAddProductForm(true);
        }
    };

    const handleAddProduct = async (productData) => {
        if (!scanResult || !productData.name || productData.price <= 0 || productData.stock <= 0) {
            // Usar un modal o un mensaje en la UI en lugar de alert()
            console.warn("Por favor, completa todos los campos del producto.");
            return false;
        }
        try {
            const productsPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app'}/public/data/products`;
            const productDocRef = doc(db, productsPath, scanResult);
            await setDoc(productDocRef, {
                name: productData.name,
                price: parseFloat(productData.price),
                stock: parseInt(productData.stock, 10),
            });
            // Usar un modal o un mensaje en la UI en lugar de alert()
            console.log("Producto añadido exitosamente.");
            setNewProductData({ name: '', price: 0, stock: 0 });
            setShowAddProductForm(false);
            setCart([...cart, { id: scanResult, name: productData.name, price: parseFloat(productData.price), quantity: 1 }]);
            return true;
        } catch (e) {
            console.error("Error al añadir producto:", e);
            // Usar un modal o un mensaje en la UI en lugar de alert()
            console.error("Error al añadir el producto. Intenta de nuevo.");
            return false;
        }
    };

    const handleUpdateCartItem = (id, change) => {
        setCart(prevCart => {
            const updatedCart = prevCart.map(item => {
                if (item.id === id) {
                    const newQuantity = Math.max(1, item.quantity + change);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
            return updatedCart.filter(item => item.quantity > 0);
        });
    };

    const handleRemoveCartItem = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleCheckout = async () => {
        if (!db || cart.length === 0) return;

        try {
            const batch = writeBatch(db);
            const productsPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app'}/public/data/products`;
            const salesPath = `/artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app'}/public/data/sales`;

            for (const item of cart) {
                const productRef = doc(db, productsPath, item.id);
                const productSnap = await getDoc(productRef);
                if (!productSnap.exists() || productSnap.data().stock < item.quantity) {
                    // Usar un modal o un mensaje en la UI en lugar de alert()
                    console.error(`Error: No hay suficiente stock de ${item.name}.`);
                    return;
                }
            }

            cart.forEach(item => {
                const productRef = doc(db, productsPath, item.id);
                batch.update(productRef, {
                    stock: products[item.id].stock - item.quantity,
                });
            });

            const newSaleRef = doc(collection(db, salesPath));
            const newSaleData = {
                timestamp: new Date(),
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                total: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
            };
            batch.set(newSaleRef, newSaleData);

            await batch.commit();

            setCurrentSaleId(newSaleRef.id);
            setCurrentView('ticket');
            setCart([]);
        } catch (e) {
            console.error("Error al finalizar la venta:", e);
            // Usar un modal o un mensaje en la UI en lugar de alert()
            console.error("Error al finalizar la venta. Intenta de nuevo.");
        }
    };

    // Dashboard Data Processing
    const dashboardData = sales.reduce((acc, sale) => {
        const date = sale.timestamp?.toDate().toISOString().split('T')[0];
        if (!date) return acc;
        if (!acc[date]) {
            acc[date] = { date, sales: 0, revenue: 0 };
        }
        acc[date].sales += sale.items.length;
        acc[date].revenue += sale.total;
        return acc;
    }, {});
    const chartData = Object.values(dashboardData).sort((a, b) => new Date(a.date) - new Date(b.date));
    const totalRevenue = chartData.reduce((acc, item) => acc + item.revenue, 0).toFixed(2);
    const totalProductsSold = chartData.reduce((acc, item) => acc + item.sales, 0);

    const renderContent = () => {
        if (loading) return <div className="text-center p-8 text-xl">Cargando...</div>;
        if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

        switch (currentView) {
            case 'dashboard':
                return <DashboardView chartData={chartData} totalRevenue={totalRevenue} totalProductsSold={totalProductsSold} products={products} />;
            case 'pos':
                return <PosView
                    cart={cart}
                    products={products}
                    isScanning={isScanning}
                    setIsScanning={setIsScanning}
                    scanResult={scanResult}
                    setScanResult={setScanResult}
                    videoRef={videoRef}
                    showAddProductForm={showAddProductForm}
                    setShowAddProductForm={setShowAddProductForm}
                    newProductData={newProductData}
                    setNewProductData={setNewProductData}
                    handleAddProduct={handleAddProduct}
                    handleUpdateCartItem={handleUpdateCartItem}
                    handleRemoveCartItem={handleRemoveCartItem}
                    handleCheckout={handleCheckout}
                    handleScan={handleScan}
                />;
            case 'stock':
                return <StockListView products={products} />;
            case 'ticket':
                return <TicketView currentSaleId={currentSaleId} db={db} setCurrentView={setCurrentView} />;
            default:
                return <DashboardView chartData={chartData} totalRevenue={totalRevenue} totalProductsSold={totalProductsSold} products={products} />;
        }
    };

    return (
        <div className="app-container">
            <nav className="nav">
                <div className="nav-buttons">
                    <Button onClick={() => setCurrentView('dashboard')} variant={currentView === 'dashboard' ? 'default' : 'ghost'} className="button flex items-center gap-2">
                        <HomeIcon /> Dashboard
                    </Button>
                    <Button onClick={() => setCurrentView('pos')} variant={currentView === 'pos' ? 'default' : 'ghost'} className="button flex items-center gap-2">
                        <ScanIcon /> POS
                    </Button>
                    <Button onClick={() => setCurrentView('stock')} variant={currentView === 'stock' ? 'default' : 'ghost'} className="button flex items-center gap-2">
                        <ListIcon /> Stock
                    </Button>
                </div>
            </nav>
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
