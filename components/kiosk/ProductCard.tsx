'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Item } from '@/data/types';
import { Plus } from 'lucide-react';
import { normalizeItemInput } from '@/utils/normalization';

interface ProductCardProps {
    item: Item;
    onAdd: (item: Item, quantity?: number) => void;
    disabled?: boolean;
}

export function ProductCard({ item, onAdd, disabled }: ProductCardProps) {
    const verifiedLocal = normalizeItemInput(item.name).localImage;
    const [imgSrc, setImgSrc] = useState(item.image || verifiedLocal || '/produce/default.jpg');
    const isOutOfStock = !item.inStock || item.quantity <= 0;

    return (
        <div className={`group bg-white rounded-2xl shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-brand-cream overflow-hidden flex flex-col min-h-0 md:min-h-[320px] ${disabled || isOutOfStock ? 'opacity-80 grayscale-[0.5]' : ''}`}>
            <div className="aspect-[4/3] bg-brand-cream relative overflow-hidden">
                <Image
                    src={imgSrc || verifiedLocal || '/produce/default.jpg'}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={() => {
                        if (imgSrc !== verifiedLocal && verifiedLocal) {
                            setImgSrc(verifiedLocal);
                        } else if (imgSrc !== '/produce/default.jpg') {
                            setImgSrc('/produce/default.jpg');
                        } else {
                            setImgSrc('https://placehold.co/300?text=Agro');
                        }
                    }}
                />
                {isOutOfStock ? (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-red-500/90 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
                            Sold Out
                        </span>
                    </div>
                ) : (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-white/90 backdrop-blur-md text-brand-dark px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50">
                            {item.category}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-3 md:p-5 flex-1 flex flex-col relative">
                <div className="flex justify-between items-start mb-2 md:mb-3">
                    <h3 className="font-bold text-gray-800 text-sm md:text-lg leading-tight group-hover:text-brand-primary transition-colors line-clamp-2 md:line-clamp-none mb-1">{item.name}</h3>
                    <div className="text-right pl-2 shrink-0">
                        <span className="block text-base md:text-lg font-extrabold text-brand-dark">₹{item.price}</span>
                        <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">/{item.unit}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 flex flex-col justify-end border-t border-gray-50">
                    <div className="text-xs font-medium text-gray-500 flex items-center space-x-1 mb-3">
                        <div className={`w-2 h-2 rounded-full ${item.quantity < 10 ? 'bg-brand-accent' : 'bg-brand-primary'}`}></div>
                        <span>{item.quantity} {item.unit} left</span>
                    </div>

                    {item.unit === 'kg' ? (
                        <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                            <button
                                onClick={() => onAdd(item, 0.25)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>250g</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{(item.price * 0.25).toFixed(0)}</span>
                            </button>
                            <button
                                onClick={() => onAdd(item, 0.5)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>500g</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{(item.price * 0.5).toFixed(0)}</span>
                            </button>
                            <button
                                onClick={() => onAdd(item, 1)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>1kg</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{item.price}</span>
                            </button>
                        </div>
                    ) : (item.unit === 'liter' || item.unit === 'litre' || item.unit === 'l') ? (
                        <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                            <button
                                onClick={() => onAdd(item, 0.25)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>250ml</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{(item.price * 0.25).toFixed(0)}</span>
                            </button>
                            <button
                                onClick={() => onAdd(item, 0.5)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>500ml</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{(item.price * 0.5).toFixed(0)}</span>
                            </button>
                            <button
                                onClick={() => onAdd(item, 1)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>1L</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{item.price}</span>
                            </button>
                        </div>
                    ) : item.allowFractional ? (
                        <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                            <button
                                onClick={() => onAdd(item, 0.25)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>¼ {item.unit}</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{(item.price * 0.25).toFixed(0)}</span>
                            </button>
                            <button
                                onClick={() => onAdd(item, 0.5)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>½ {item.unit}</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{(item.price * 0.5).toFixed(0)}</span>
                            </button>
                            <button
                                onClick={() => onAdd(item, 1)}
                                disabled={disabled || isOutOfStock}
                                className="py-2.5 px-1 rounded-full bg-gray-50 text-brand-dark hover:bg-brand-primary hover:text-white text-[11px] md:text-xs font-bold transition-all shadow-xs border border-gray-100/80 flex flex-col items-center justify-center"
                            >
                                <span>1 {item.unit}</span>
                                <span className="text-[10px] opacity-75 font-semibold">₹{item.price}</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onAdd(item)}
                            disabled={disabled || isOutOfStock}
                            className="w-full py-3 rounded-full bg-brand-secondary/10 text-brand-primary hover:bg-brand-primary hover:text-white flex items-center justify-center transition-all duration-300 font-bold text-sm shadow-xs"
                        >
                            <Plus size={16} className="mr-1 stroke-[3px]" />
                            Add
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
