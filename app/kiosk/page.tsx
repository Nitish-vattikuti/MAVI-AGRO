'use client';

import { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import { orderService } from '@/services/OrderService';
import { Item, OrderItem, BuyerType, Announcement } from '@/data/types';
import { ProductCard } from '@/components/kiosk/ProductCard';
import { ShoppingBag, Search, X, ChevronRight, ArrowLeft, Loader2, Leaf, Sparkles, User, GraduationCap, Trash2, Megaphone, AlertOctagon, ChevronDown, ChevronUp, Copy, Printer, Check } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import { getDominantTickerTheme, getTickerTheme } from '@/utils/tickerTheme';

export default function KioskPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All Produce');

    // Checkout Form State
    const [buyerName, setBuyerName] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [buyerType, setBuyerType] = useState<BuyerType>('student');
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lastOrder, setLastOrder] = useState<any>(null); // Store last order for receipt
    const [isCheckoutExpanded, setIsCheckoutExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    // Farm Status & Announcements
    const [farmStatus, setFarmStatus] = useState('open');
    const [statusReason, setStatusReason] = useState('');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        loadItems();
        loadSettings();

        // Silent Polling for Real-Time Inventory
        const interval = setInterval(() => {
            loadItems();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const loadSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.settings) {
                setFarmStatus(data.settings.farm_status || 'open');
                setStatusReason(data.settings.farm_status_reason || '');
            }
            if (data.announcements) {
                setAnnouncements(data.announcements);
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }
    };

    const loadItems = async () => {
        const data = await inventoryService.getAllItems();
        setItems(data.filter(i => !i.isDeleted));
    };

    // Persistent Cart
    useEffect(() => {
        const saved = localStorage.getItem('agro_kiosk_cart');
        if (saved) {
            try {
                setCart(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        // Only save if cart has items to avoid clearing on initial empty render
        if (cart.length > 0) {
            localStorage.setItem('agro_kiosk_cart', JSON.stringify(cart));
        } else if (cart.length === 0 && localStorage.getItem('agro_kiosk_cart')) {
            // Optional: decide if we clear it. Usually yes if user emptied it.
            // But we need to distinguish between "loaded empty" and "user emptied".
            // For simplicity, we save empty array if it was loaded.
            localStorage.setItem('agro_kiosk_cart', JSON.stringify(cart));
        }
    }, [cart]);

    const addToCart = (item: Item, quantity: number = 1) => {
        setCart(prev => {
            const existing = prev.find(i => i.itemId === item.id);
            if (existing) {
                if (existing.quantity + quantity > item.quantity) {
                    // Ideally use a toast here
                    return prev;
                }
                return prev.map(i => i.itemId === item.id
                    ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * i.pricePerUnit }
                    : i
                );
            }
            return [...prev, {
                itemId: item.id,
                name: item.name,
                quantity: quantity,
                unit: item.unit,
                pricePerUnit: item.price,
                total: item.price * quantity
            }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.itemId !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.itemId === itemId) {
                    const newQty = parseFloat((item.quantity + delta).toFixed(2));
                    if (newQty <= 0) {
                        // Optional: Could prompt user, but for +/- buttons, usually implied.
                        // However, let's keep it clean: if 0, remove.
                        // But map expects returning item. filter handles removal.
                        // So we need to filter AFTER mapping or do a separate operation.
                        return { ...item, quantity: 0 };
                    }
                    const stockItem = items.find(i => i.id === itemId);
                    if (stockItem && newQty > stockItem.quantity) return item;
                    return { ...item, quantity: newQty, total: parseFloat((newQty * item.pricePerUnit).toFixed(2)) };
                }
                return item;
            }).filter(item => item.quantity > 0);
        });
    };

    const cartTotal = Math.round(cart.reduce((sum, item) => sum + item.total, 0));

    // Validates: 10 digits exactly
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        // Normalize: Remove non-digits
        const digitsOnly = input.replace(/\D/g, '');
        // Constraint: Max 10 chars
        if (digitsOnly.length <= 10) {
            setBuyerPhone(digitsOnly);
        }
    };

    // Handle Checkout
    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        if (!buyerName || (buyerType !== 'student' && !buyerPhone)) {
            alert('Please fill in required fields (Name and Phone for non-students)');
            return;
        }

        if (buyerType !== 'student' && buyerPhone.length !== 10) {
            alert('Please enter a valid 10-digit phone number.');
            return;
        }

        setIsOrdering(true);
        try {
            const newOrder = await orderService.createOrder({
                buyerName,
                phone: buyerPhone,
                buyerType: buyerType,
                items: cart,
            });

            // Success
            setOrderSuccess(true);
            setLastOrder(newOrder); // Save for receipt
            setCart([]);
            localStorage.removeItem('agro_kiosk_cart'); // Clear persistent cart
            setBuyerName('');
            setBuyerPhone('');
            setBuyerType('student');
            setIsCartOpen(false); // Close cart after successful order

            // Refresh items to show updated stock
            loadItems();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            alert('Order Failed: ' + err.message);
        } finally {
            setIsOrdering(false);
        }
    };

    // Filter items with fuzzy matched suggestions
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);

    useEffect(() => {
        let matches = items;

        // 1. Filter by Search
        if (search.trim()) {
            const q = search.toLowerCase();
            matches = matches.filter(i =>
                i.name.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q)
            );
        }

        // 2. Filter by Category
        if (activeCategory !== 'All Produce') {
            matches = matches.filter(i => i.category === activeCategory);
        }

        setFilteredItems(matches);
    }, [search, items, activeCategory]);


    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595855709915-f65b4882746e?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[2.5rem] max-w-lg w-full text-center space-y-6 shadow-2xl relative z-10 animate-in zoom-in duration-500">

                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-glow-lg animate-in bounce-in duration-700">
                        <Check size={40} strokeWidth={4} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Order Placed!</h1>
                        <p className="text-white/60 font-medium">Please save your Order ID.</p>
                    </div>

                    {/* Order ID Card */}
                    {lastOrder && (
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-inner border border-white/50 transform hover:scale-[1.02] transition-transform duration-300">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Order ID</p>
                            <div className="flex items-center justify-center space-x-3 mb-4">
                                <span className="text-3xl font-mono font-black text-brand-dark tracking-wider">
                                    #{lastOrder.id.slice(0, 8)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(lastOrder.id);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        } catch {
                                            // Fallback for non-secure contexts (http)
                                            prompt('Copy your Order ID:', lastOrder.id);
                                        }
                                    }}
                                    className="flex items-center justify-center space-x-2 py-3 px-5 bg-gray-100 hover:bg-gray-200 text-brand-dark rounded-full font-bold text-xs uppercase tracking-wide transition-colors"
                                >
                                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                    <span>{copied ? 'Copied' : 'Copy ID'}</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const receiptContent = `
                                            <html>
                                                <head>
                                                    <title>Receipt - ${lastOrder.id.slice(0, 8)}</title>
                                                    <style>
                                                        body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; margin: 0 auto; }
                                                        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                                                        .item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
                                                        .total { border-top: 2px dashed #000; margin-top: 10px; padding-top: 10px; display: flex; justify-content: space-between; font-weight: bold; }
                                                        .footer { margin-top: 20px; text-align: center; font-size: 10px; }
                                                    </style>
                                                </head>
                                                <body>
                                                    <div class="header">
                                                        <h2>MAVI AGRO</h2>
                                                        <p>Order #${lastOrder.id.slice(0, 6)}</p>
                                                        <p>${format(new Date(), 'dd MMM yyyy, HH:mm')}</p>
                                                        <p>Buyer: ${lastOrder.buyerName} (${lastOrder.buyerType})</p>
                                                    </div>
                                                    ${lastOrder.items.map((i: OrderItem) => `
                                                        <div class="item">
                                                            <span>${i.name} x${i.quantity}${i.unit}</span>
                                                            <span>₹${(i.total || (i.pricePerUnit * i.quantity)).toFixed(2)}</span>
                                                        </div>
                                                    `).join('')}
                                                    <div class="total">
                                                        <span>TOTAL</span>
                                                        <span>₹${lastOrder.totalAmount}</span>
                                                    </div>
                                                    <div class="footer">
                                                        <p>Please show this to collect your order.</p>
                                                        <p>Thank you!</p>
                                                    </div>
                                                    <script>window.print();</script>
                                                </body>
                                            </html>
                                        `;
                                        const win = window.open('', '', 'width=400,height=600');
                                        win?.document.write(receiptContent);
                                        win?.document.close();
                                    }}
                                    className="flex items-center justify-center space-x-2 py-3 px-5 bg-brand-primary text-white hover:bg-brand-dark rounded-full font-bold text-xs uppercase tracking-wide transition-colors"
                                >
                                    <Printer size={16} />
                                    <span>Receipt</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 space-y-4">
                        <button
                            onClick={() => { setOrderSuccess(false); setIsCartOpen(false); setLastOrder(null); }}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-bold transition-all"
                        >
                            Start New Order
                        </button>
                        <Link href="/" className="block text-brand-secondary/80 hover:text-brand-secondary font-bold transition-colors uppercase tracking-widest text-xs">Return Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-cream relative pb-24 font-sans selection:bg-brand-primary selection:text-white overflow-x-hidden">

            {/* Immersive Hero Header */}
            {/* Removed overflow-hidden from outer container to allow search bar to straddle the line */}
            <header className="relative z-10">
                {/* Announcements Marquee - Dynamic Live Ticker */}
                {announcements.length > 0 && (() => {
                    const dominantTheme = getDominantTickerTheme(announcements);
                    return (
                        <div
                            style={dominantTheme.isCustom ? { backgroundColor: dominantTheme.color } : undefined}
                            className={`${dominantTheme.bgClass} ${dominantTheme.textClass} py-2.5 overflow-hidden relative z-30 font-bold text-sm tracking-wide shadow-md transition-colors duration-500`}
                        >
                            <Marquee gradient={false} speed={40}>
                                {announcements.map((a) => {
                                    const theme = getTickerTheme(a.type);
                                    const isEmergency = theme.id === 'emergency';
                                    return (
                                        <span key={a.id} className="mx-8 flex items-center space-x-2.5">
                                            {isEmergency ? (
                                                <span className="flex h-2.5 w-2.5 relative shrink-0">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                                </span>
                                            ) : (
                                                <Megaphone size={14} className={`${dominantTheme.iconClass} shrink-0`} />
                                            )}
                                            <span className="font-bold tracking-wide">{a.message}</span>
                                        </span>
                                    );
                                })}
                            </Marquee>
                        </div>
                    );
                })()}

                {/* --- MOBILE HERO (Premium Emerald) --- */}
                <div className="md:hidden relative min-h-[35vh] rounded-b-[2.5rem] overflow-hidden shadow-2xl flex flex-col justify-center pb-6 ring-1 ring-white/10">
                    <div className="absolute inset-0 bg-[#0F2F23]"> {/* Rich Deep Green */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2574')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#051F16]/90 via-[#0F2F23]/80 to-[#1B4332]/90"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40"></div>
                    </div>

                    {/* Mobile Navbar */}
                    <nav className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center z-20">
                        <Link href="/" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform">
                            <ArrowLeft size={20} />
                        </Link>
                        <button onClick={() => setIsCartOpen(true)} className="relative w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform">
                            <ShoppingBag size={20} />
                            {cart.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-black text-[9px] font-bold rounded-full flex items-center justify-center">{cart.length}</span>}
                        </button>
                    </nav>

                    {/* Mobile Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 pt-10 h-full">
                        <div className="animate-in slide-in-from-bottom-8 duration-1000 max-w-4xl mx-auto w-full">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 backdrop-blur-md mb-5 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                                <Sparkles size={10} className="text-[#D4AF37]" strokeWidth={2.5} fill="#D4AF37" />
                                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em]">Premium Harvest</span>
                            </div>

                            <h1 className="text-3xl font-black text-white tracking-tight mb-6 drop-shadow-lg leading-tight">
                                Fresh. Organic. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] to-[#22c55e]">Daily.</span>
                            </h1>

                            {/* Mobile Glass Search - Matching Laptop Pill Design */}
                            <div className="relative max-w-md mx-auto w-full group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/50 to-brand-secondary/50 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-1.5 rounded-full flex items-center shadow-2xl transition-all focus-within:bg-white/15 focus-within:border-white/30">
                                    <div className="w-10 h-10 bg-white text-brand-dark rounded-full flex items-center justify-center shrink-0 shadow-md">
                                        <Search size={18} className="w-4 h-4 text-brand-dark" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search vegetables..."
                                        className="bg-transparent border-none outline-none font-bold text-white placeholder:text-white/50 w-full px-3.5 text-base focus:ring-0"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ caretColor: '#4ADE80' }}
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="p-2 text-white/60 hover:text-white transition-colors mr-1 rounded-full hover:bg-white/10"
                                            aria-label="Clear search"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- DESKTOP HERO (Original Classic) --- */}
                <div className="hidden md:flex relative h-[70vh] rounded-b-[4rem] overflow-hidden shadow-2xl flex-col justify-center">
                    <div className="absolute inset-0 bg-brand-dark">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-80"></div>
                    </div>

                    {/* Desktop Navbar */}
                    <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
                        <Link href="/" className="group flex items-center space-x-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full hover:bg-white/20 transition-all border border-white/10">
                            <ArrowLeft size={20} className="text-white group-hover:-translate-x-1 transition-transform" />
                            <span className="text-white font-bold text-sm tracking-wide">Back</span>
                        </Link>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="group relative flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full hover:bg-brand-primary hover:border-brand-primary transition-all border border-white/10"
                        >
                            <span className="text-white font-bold text-sm tracking-wide">My Basket</span>
                            <div className="bg-white text-brand-dark w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                                {cart.length}
                            </div>
                        </button>
                    </div>

                    {/* Desktop Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 h-full">
                        <div className="animate-in slide-in-from-bottom-8 duration-1000 max-w-4xl mx-auto w-full">
                            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-brand-accent text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-glow-sm">
                                <Sparkles size={12} />
                                <span>Premium Harvest</span>
                            </div>
                            <h1 className="text-7xl lg:text-9xl font-black text-white tracking-tighter mb-8 drop-shadow-2xl leading-[0.9]">
                                Fresh<span className="text-brand-primary">.</span> Organic<span className="text-brand-primary">.</span><br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary via-white to-brand-secondary">Daily.</span>
                            </h1>

                            {/* Desktop Search Bar */}
                            <div className="max-w-xl mx-auto relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/50 to-brand-secondary/50 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full flex items-center shadow-2xl">
                                    <div className="p-3 bg-white text-brand-dark rounded-full">
                                        <Search size={20} className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search vegetables..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-transparent border-none outline-none text-xl font-bold text-white placeholder:text-white/50 w-full px-4 h-12"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="p-2 text-white/60 hover:text-white transition-colors mr-2 rounded-full hover:bg-white/10"
                                            aria-label="Clear search"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-32 relative z-0">

                {/* Visual Category Filters - Clean No-Scrollbar */}
                <div className="pb-4 md:pb-8">
                    <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-1 scrollbar-hide px-1">
                        {['All Produce', 'Vegetables', 'Fruits', 'Leafy Greens', 'Spices'].map((label) => (
                            <button
                                key={label}
                                onClick={() => setActiveCategory(label)}
                                className={`px-6 py-3.5 md:px-8 md:py-4 rounded-full text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap border-2 ${activeCategory === label
                                    ? 'bg-brand-dark text-white border-brand-dark shadow-xl scale-105'
                                    : 'bg-transparent border-brand-dark/10 text-gray-400 hover:border-brand-dark hover:text-brand-dark'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
                    {filteredItems.map(item => (
                        <ProductCard key={item.id} item={item} onAdd={addToCart} />
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-32 opacity-50">
                        <Leaf size={64} className="mx-auto text-brand-dark mb-4" />
                        <h3 className="text-2xl font-bold text-brand-dark">No harvest found</h3>
                    </div>
                )}
            </main>

            {/* Mobile Floating Cart Bar */}
            {cart.length > 0 && (
                <div className="fixed bottom-6 left-4 right-4 z-30 md:hidden animate-in slide-in-from-bottom-4">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="w-full bg-brand-dark text-white p-4 rounded-full shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm">
                                {cart.length}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm">View Basket</p>
                                <p className="text-xs text-gray-400">Total: ₹{cartTotal}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 font-bold text-sm uppercase tracking-wide pr-2">
                            <span>Checkout</span>
                            <ChevronRight size={18} />
                        </div>
                    </button>
                </div>
            )}

            {/* Cart Drawer - Premium Glass */}
            {isCartOpen && (
                <>
                    <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-md z-40 transition-opacity duration-500" onClick={() => setIsCartOpen(false)} />
                    <div className="fixed inset-0 md:inset-y-2 md:right-2 md:left-auto z-50 w-full md:w-[480px] bg-white/90 backdrop-blur-2xl md:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l md:border border-white/50 overflow-hidden">

                        {/* Cart Header */}
                        <div className="p-8 pb-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black text-brand-dark tracking-tight">Basket</h2>
                                <p className="text-gray-400 font-medium text-sm">{cart.length} items selected</p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-brand-dark transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-300">
                                    <ShoppingBag size={80} strokeWidth={1} />
                                    <p className="text-xl font-bold text-gray-400">Your basket is empty</p>
                                </div>
                            ) : (
                                cart.map(item => {
                                    const isFractional = item.unit === 'kg' || item.unit === 'liter' || item.unit === 'litre' || item.unit === 'l';
                                    const step = isFractional ? 0.25 : 1;
                                    return (
                                        <div key={item.itemId} className="flex items-center p-4 bg-white rounded-3xl shadow-sm border border-gray-100 group">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-brand-dark text-lg">{item.name}</h4>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">₹{item.pricePerUnit} / {item.unit}</p>
                                            </div>
                                            <div className="flex items-center bg-gray-50 rounded-full p-1.5 gap-2">
                                                <button onClick={() => updateQuantity(item.itemId, -step)} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-brand-dark font-bold hover:scale-105 transition-transform">-</button>
                                                <span className="font-bold text-sm min-w-[20px] text-center text-brand-dark">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.itemId, step)} className="w-8 h-8 rounded-full bg-brand-primary text-white shadow flex items-center justify-center font-bold hover:scale-105 transition-transform">+</button>
                                            </div>
                                            <div className="w-20 text-right font-black text-brand-dark text-lg">
                                                ₹{item.total}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.itemId)}
                                                className="ml-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                title="Remove item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Cart Footer */}
                        {/* Cart Footer */}
                        <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                            <div className="flex justify-between items-center mb-0 cursor-pointer" onClick={() => setIsCheckoutExpanded(!isCheckoutExpanded)}>
                                <div className="space-y-1">
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Total Amount</p>
                                    <p className="text-4xl md:text-5xl font-black text-brand-dark tracking-tighter">₹{cartTotal}</p>
                                </div>

                                {cart.length > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsCheckoutExpanded(!isCheckoutExpanded);
                                        }}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isCheckoutExpanded
                                            ? 'bg-gray-100 text-brand-dark hover:bg-gray-200'
                                            : 'bg-brand-primary text-white hover:bg-brand-dark hover:scale-105 animate-pulse'}`}
                                    >
                                        {isCheckoutExpanded ? <ChevronDown size={28} /> : <ChevronUp size={28} />}
                                    </button>
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCheckoutExpanded ? 'max-h-[600px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                                    <form onSubmit={handleCheckout} className="space-y-4">
                                        {farmStatus === 'closed' ? (
                                            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center space-y-2 animate-in slide-in-from-bottom-2">
                                                <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <AlertOctagon size={24} />
                                                </div>
                                                <h3 className="text-red-800 font-black text-lg">Ordering Paused</h3>
                                                <p className="text-red-600 font-medium text-sm">
                                                    {statusReason || 'Farm is currently closed for new orders.'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center space-x-2 text-brand-dark/50 text-xs font-bold uppercase tracking-wider mb-2">
                                                    <span className="w-full h-px bg-gray-100"></span>
                                                    <span className="whitespace-nowrap">Enter Details</span>
                                                    <span className="w-full h-px bg-gray-100"></span>
                                                </div>

                                                {/* Role Selection */}
                                                <div className="flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setBuyerType('student')}
                                                        className={`flex-1 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${buyerType === 'student' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                                    >
                                                        <GraduationCap size={18} />
                                                        <span className="text-sm uppercase tracking-wide">Student</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setBuyerType('staff')}
                                                        className={`flex-1 py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${buyerType === 'staff' ? 'bg-brand-dark text-white shadow-lg shadow-brand-dark/20 scale-[1.02]' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                                    >
                                                        <User size={18} />
                                                        <span className="text-sm uppercase tracking-wide">Lecturer</span>
                                                    </button>
                                                </div>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Your Full Name"
                                                    value={buyerName}
                                                    onChange={(e) => setBuyerName(e.target.value)}
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-full outline-none text-brand-dark font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-inner"
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    value={buyerPhone}
                                                    onChange={handlePhoneChange}
                                                    maxLength={10}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-full outline-none text-brand-dark font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-brand-primary/20 transition-all font-mono shadow-inner"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isOrdering}
                                                    className="w-full mt-4 py-5 bg-brand-primary text-white rounded-full font-black text-lg hover:bg-brand-dark transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl shadow-brand-primary/30 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:scale-100"
                                                >
                                                    {isOrdering ? (
                                                        <Loader2 size={24} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span>Place Order</span>
                                                            <ChevronRight size={20} strokeWidth={3} />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
