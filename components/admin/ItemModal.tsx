'use client';

import { useState, useEffect } from 'react';
import { Item, Unit } from '@/data/types';
import { normalizeItemInput } from '@/utils/normalization';
import { X } from 'lucide-react';

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Item, 'id' | 'isDeleted'>) => void;
    initialData?: Item;
}

const UNITS: Unit[] = ['kg', 'g', 'liter', 'ml', 'bundle', 'piece', 'packet'];
const CATEGORIES = ['Vegetables', 'Leafy Greens', 'Fruits', 'Spices', 'Tubers'];

export function ItemModal({ isOpen, onClose, onSubmit, initialData }: ItemModalProps) {
    const [formData, setFormData] = useState<Partial<Item>>(initialData || {
        name: '',
        category: 'Vegetables',
        price: 0,
        unit: 'kg',
        quantity: 0,
        inStock: true,
        image: '',
        allowFractional: false,
    });
    const [hasManualImage, setHasManualImage] = useState(false);
    const [isCustomUnit, setIsCustomUnit] = useState(false);

    // Auto-generate Verified/AI Image & Normalize Name
    useEffect(() => {
        if (!initialData && formData.name && formData.name.length > 2 && !hasManualImage) {
            const timeoutId = setTimeout(() => {
                // Normalize Input
                const normalized = normalizeItemInput(formData.name!);

                // Use verified local asset if available, else optimized prompt
                const autoImageUrl = normalized.localImage || `https://image.pollinations.ai/prompt/${encodeURIComponent(normalized.imageQuery)}?nologo=true`;

                setFormData(prev => {
                    // Only auto-correct name if it's a significant match/correction and differs
                    const shouldCorrectName = normalized.isCorrection && normalized.confidence >= 0.8;
                    return {
                        ...prev,
                        name: shouldCorrectName ? normalized.standardName : prev.name,
                        image: autoImageUrl
                    };
                });

            }, 400); // 400ms debounce

            return () => clearTimeout(timeoutId);
        }
    }, [formData.name, initialData, hasManualImage]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData as Omit<Item, 'id' | 'isDeleted'>);
        onClose();
    };

    const currentUnit = (formData.unit || 'kg').toLowerCase();
    const isWeight = currentUnit === 'kg' || currentUnit === 'g';
    const isVolume = currentUnit === 'liter' || currentUnit === 'litre' || currentUnit === 'l' || currentUnit === 'ml';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/70">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Edit Item' : 'Add New Item'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-800"
                            placeholder="e.g. Tomato"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800 bg-white"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Unit</label>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomUnit(!isCustomUnit)}
                                    className="text-xs text-brand-primary font-bold hover:underline"
                                >
                                    {isCustomUnit ? 'Choose preset' : '+ Custom'}
                                </button>
                            </div>
                            {isCustomUnit ? (
                                <input
                                    type="text"
                                    placeholder="e.g. crate, bunch, liter"
                                    value={formData.unit || ''}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800"
                                />
                            ) : (
                                <select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as Unit })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800 bg-white"
                                >
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per {formData.unit || 'unit'} (₹)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="any"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity ({formData.unit || 'units'})</label>
                            <input
                                required
                                type="number"
                                min="0"
                                step="any"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => {
                                    setFormData({ ...formData, image: e.target.value });
                                    setHasManualImage(!!e.target.value);
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800"
                                placeholder="https://... or /produce/..."
                            />
                            <label className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0">
                                <span className="text-sm font-bold">Upload</span>
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                                alert('File size must be less than 5MB');
                                                return;
                                            }

                                            const body = new FormData();
                                            body.append('file', file);

                                            try {
                                                const res = await fetch('/api/upload', {
                                                    method: 'POST',
                                                    body
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    setFormData({ ...formData, image: data.url });
                                                    setHasManualImage(true);
                                                } else {
                                                    alert('Upload failed: ' + data.error);
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Upload failed');
                                            }
                                        }
                                    }}
                                />
                            </label>
                        </div>
                        {!initialData && formData.name && !hasManualImage && (
                            <p className="text-xs text-brand-primary mt-1 flex items-center">
                                <span className="inline-block w-2 h-2 bg-brand-primary rounded-full animate-pulse mr-1"></span>
                                AI is auto-generating an image for &quot;{formData.name}&quot;...
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                        <input
                            type="checkbox"
                            id="inStock"
                            checked={formData.inStock}
                            onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                        />
                        <label htmlFor="inStock" className="text-sm font-medium text-gray-700 cursor-pointer">Available in Stock</label>
                    </div>

                    {/* Partial / Portion Options Selection & Preview */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="allowFractional"
                                checked={formData.allowFractional || isWeight || isVolume}
                                onChange={(e) => setFormData({ ...formData, allowFractional: e.target.checked })}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                            />
                            <label htmlFor="allowFractional" className="text-sm font-bold text-gray-800 cursor-pointer">
                                Enable Partial Portions {isVolume ? '(250ml, 500ml, 1L)' : '(250g, 500g, 1kg)'}
                            </label>
                        </div>

                        {(formData.allowFractional || isWeight || isVolume) && (
                            <div className="pt-2 border-t border-gray-200/60">
                                <p className="text-xs text-gray-500 font-medium mb-2">Customer Portion &amp; Pricing Breakdown (Auto-Calculated):</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 shadow-xs">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase">
                                            {isVolume ? '250ml' : isWeight ? '250g' : `¼ ${formData.unit}`}
                                        </p>
                                        <p className="text-sm font-black text-brand-dark mt-0.5">
                                            ₹{((formData.price || 0) * 0.25).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-xl border border-gray-200/70 shadow-xs">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase">
                                            {isVolume ? '500ml' : isWeight ? '500g' : `½ ${formData.unit}`}
                                        </p>
                                        <p className="text-sm font-black text-brand-dark mt-0.5">
                                            ₹{((formData.price || 0) * 0.5).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-2.5 rounded-xl border border-green-200 bg-green-50/30 shadow-xs">
                                        <p className="text-[11px] font-bold text-green-700 uppercase">
                                            {isVolume ? '1 Liter' : isWeight ? '1 kg' : `1 ${formData.unit}`}
                                        </p>
                                        <p className="text-sm font-black text-green-800 mt-0.5">
                                            ₹{Number(formData.price || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 font-bold transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-6 bg-brand-primary text-white rounded-full hover:bg-brand-dark font-bold shadow-lg shadow-brand-primary/20 transition-all text-sm"
                        >
                            {initialData ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
