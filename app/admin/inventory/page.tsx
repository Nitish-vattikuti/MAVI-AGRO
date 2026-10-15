'use client';

import { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import { Item } from '@/data/types';
import { ItemModal } from '@/components/admin/ItemModal';
import { normalizeItemInput } from '@/utils/normalization';
import { Plus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';

export default function InventoryPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
    const [search, setSearch] = useState('');

    const loadItems = async () => {
        const data = await inventoryService.getAllItems();
        setItems(data);
    };

    useEffect(() => {
        // eslint-disable-next-line
        loadItems();
    }, []);

    const handleCreate = async (data: Omit<Item, 'id' | 'isDeleted'>) => {
        await inventoryService.addItem(data);
        loadItems();
    };

    const handleUpdate = async (data: Omit<Item, 'id' | 'isDeleted'>) => {
        if (editingItem) {
            await inventoryService.updateItem(editingItem.id, data);
            loadItems();
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await inventoryService.deleteItem(id);
            loadItems();
        }
    };

    const openCreateModal = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (item: Item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
                    <p className="text-gray-500">Manage your farm produce and stock levels</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition shadow-lg shadow-green-200 font-bold text-sm"
                >
                    <Plus size={20} />
                    <span>Add New Item</span>
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search vegetables..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-5 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 text-gray-800 font-medium"
                    />
                </div>
            </div>

            {/* Items Table */}
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.image || normalizeItemInput(item.name).localImage || '/produce/default.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const verified = normalizeItemInput(item.name).localImage;
                                    if (verified && !target.src.includes(verified)) {
                                        target.src = verified;
                                    } else if (!target.src.includes('/produce/default.jpg')) {
                                        target.src = '/produce/default.jpg';
                                    }
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 truncate pr-2">{item.name}</h3>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="p-2 text-gray-400 hover:text-brand-primary bg-gray-50 hover:bg-brand-secondary/30 rounded-full transition"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded-full border border-gray-100">{item.category}</p>
                            <div className="flex justify-between items-end pt-2">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stock</p>
                                    <p className={`text-sm font-bold ${item.quantity < 10 ? 'text-red-500' : 'text-gray-700'}`}>
                                        {item.quantity} <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-brand-dark">₹{item.price}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-soft border border-brand-cream overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-brand-cream/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 font-bold text-brand-dark text-xs uppercase tracking-wider">Item</th>
                                <th className="px-6 py-5 font-bold text-brand-dark text-xs uppercase tracking-wider">Category</th>
                                <th className="px-6 py-5 font-bold text-brand-dark text-xs uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-5 font-bold text-brand-dark text-xs uppercase tracking-wider">Price</th>
                                <th className="px-6 py-5 font-bold text-brand-dark text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 font-bold text-brand-dark text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <AlertCircle size={32} />
                                            <p>No items found in inventory.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-brand-cream/30 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={item.image || normalizeItemInput(item.name).localImage || '/produce/default.jpg'}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            const verified = normalizeItemInput(item.name).localImage;
                                                            if (verified && !target.src.includes(verified)) {
                                                                target.src = verified;
                                                            } else if (!target.src.includes('/produce/default.jpg')) {
                                                                target.src = '/produce/default.jpg';
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <span className="font-bold text-gray-800">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-brand-cream text-brand-dark rounded-full text-xs font-bold border border-brand-dark/5">
                                                 {item.category}
                                             </span>
                                         </td>
                                         <td className="px-6 py-4">
                                             <div className="flex items-center space-x-2">
                                                 <span className={`font-bold ${item.quantity < 10 ? 'text-brand-accent' : 'text-gray-700'}`}>
                                                     {item.quantity}
                                                 </span>
                                                 <span className="text-gray-400 text-xs font-medium uppercase">{item.unit}</span>
                                             </div>
                                         </td>
                                         <td className="px-6 py-4 font-bold text-brand-dark">₹{item.price}</td>
                                         <td className="px-6 py-4">
                                             {item.inStock && item.quantity > 0 ? (
                                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-secondary/30 text-brand-primary border border-brand-secondary">
                                                     <span className="w-2 h-2 rounded-full bg-brand-primary mr-2"></span>
                                                     Available
                                                 </span>
                                             ) : (
                                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                     <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                                     Out of Stock
                                                 </span>
                                             )}
                                         </td>
                                         <td className="px-6 py-4">
                                             <div className="flex items-center space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                 <button
                                                     onClick={() => openEditModal(item)}
                                                     className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-secondary/30 rounded-full transition"
                                                     title="Edit"
                                                 >
                                                     <Edit2 size={18} />
                                                 </button>
                                                 <button
                                                     onClick={() => handleDelete(item.id)}
                                                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                                     title="Delete"
                                                 >
                                                     <Trash2 size={18} />
                                                 </button>
                                             </div>
                                         </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ItemModal
                key={editingItem ? editingItem.id : 'new'}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={editingItem ? handleUpdate : handleCreate}
                initialData={editingItem}
            />
        </div>
    );
}
