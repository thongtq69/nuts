'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
    id: string;
    name: string;
    image: string;
    originalPrice: number;
    price: number;
    quantity: number;
    agentPrice?: number;
    bulkPricing?: { minQuantity: number; discountPercent: number }[];
    isAgent: boolean;
    weight?: number; // In kg
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: Omit<CartItem, 'price' | 'isAgent'>) => void;
    addToCartWithAgentPrice: (item: Omit<CartItem, 'price' | 'isAgent'>, isAgent: boolean, agentSettings?: { agentDiscountEnabled: boolean; agentDiscountPercent: number; bulkDiscountEnabled: boolean }) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    setQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    originalTotal: number;
    savingsTotal: number;
    getItemPrice: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculatePrice(
    originalPrice: number,
    quantity: number,
    isAgent: boolean,
    agentSettings?: { agentDiscountEnabled: boolean; agentDiscountPercent: number; bulkDiscountEnabled: boolean },
    bulkPricing?: { minQuantity: number; discountPercent: number }[]
): number {
    // Guard against invalid inputs
    if (!originalPrice || isNaN(originalPrice) || originalPrice <= 0) {
        console.warn('Invalid originalPrice:', originalPrice);
        return 0;
    }

    let finalPrice = originalPrice;

    if (!isAgent || !agentSettings?.agentDiscountEnabled) {
        if (agentSettings?.bulkDiscountEnabled && bulkPricing && bulkPricing.length > 0) {
            const sortedTiers = [...bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
            const applicableTier = sortedTiers.find(tier => quantity >= tier.minQuantity);
            if (applicableTier) {
                finalPrice = originalPrice * (1 - applicableTier.discountPercent / 100);
            }
        }
        return Math.round(finalPrice);
    }

    const agentDiscountPercent = agentSettings?.agentDiscountPercent || 10;
    const agentDiscountPrice = originalPrice * (1 - agentDiscountPercent / 100);

    if (agentSettings?.bulkDiscountEnabled && bulkPricing && bulkPricing.length > 0) {
        const sortedTiers = [...bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
        const applicableTier = sortedTiers.find(tier => quantity >= tier.minQuantity);
        if (applicableTier) {
            finalPrice = agentDiscountPrice * (1 - applicableTier.discountPercent / 100);
        } else {
            finalPrice = agentDiscountPrice;
        }
    } else {
        finalPrice = agentDiscountPrice;
    }

    return Math.round(finalPrice);
}

function parseStoredPrice(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const digits = value.replace(/[^\d]/g, '');
        const n = digits ? Number(digits) : NaN;
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}

function normalizeStoredCartItem(raw: any): CartItem | null {
    if (!raw || !raw.id) return null;

    const quantity = Math.max(1, Number(raw.quantity) || 1);

    const originalPriceCandidate =
        parseStoredPrice(raw.originalPrice) ||
        parseStoredPrice(raw.price) ||
        parseStoredPrice(raw.agentPrice);

    // If we still can't infer a valid price, drop the item instead of showing 0₫ everywhere.
    if (!originalPriceCandidate || originalPriceCandidate <= 0) return null;

    return {
        id: String(raw.id),
        name: String(raw.name || ''),
        image: String(raw.image || ''),
        originalPrice: originalPriceCandidate,
        price: parseStoredPrice(raw.price) || originalPriceCandidate,
        quantity,
        agentPrice: raw.agentPrice !== undefined ? parseStoredPrice(raw.agentPrice) : undefined,
        bulkPricing: Array.isArray(raw.bulkPricing) ? raw.bulkPricing : undefined,
        isAgent: Boolean(raw.isAgent),
        weight: typeof raw.weight === 'number' ? raw.weight : 0.5
    };
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [agentSettings, setAgentSettings] = useState<{
        agentDiscountEnabled: boolean;
        agentDiscountPercent: number;
        bulkDiscountEnabled: boolean;
    } | null>(null);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        fetch('/api/admin/affiliate-settings')
            .then(res => res.json())
            .then(data => {
                if (data && data.agentDiscountEnabled !== undefined) {
                    setAgentSettings({
                        agentDiscountEnabled: data.agentDiscountEnabled,
                        agentDiscountPercent: data.agentDiscountPercent || 10,
                        bulkDiscountEnabled: data.bulkDiscountEnabled !== false
                    });
                } else {
                    setAgentSettings({
                        agentDiscountEnabled: true,
                        agentDiscountPercent: 10,
                        bulkDiscountEnabled: true
                    });
                }
            })
            .catch(() => {
                setAgentSettings({
                    agentDiscountEnabled: true,
                    agentDiscountPercent: 10,
                    bulkDiscountEnabled: true
                });
            });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    const parsed = JSON.parse(savedCart);
                    if (Array.isArray(parsed)) {
                        const normalized = parsed
                            .map(normalizeStoredCartItem)
                            .filter(Boolean) as CartItem[];
                        setCartItems(normalized);
                    }
                } catch (e) {
                    console.error('Failed to parse cart', e);
                }
            }
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isMounted && cartItems.length > 0 && user) {
            const currentUserIsAgent = user?.role === 'sale';
            const needsRecalculation = cartItems.some(item => item.isAgent !== currentUserIsAgent);

            if (needsRecalculation) {
                setCartItems(prev => prev.map(item => ({
                    ...item,
                    isAgent: currentUserIsAgent,
                    price: calculatePrice(
                        item.originalPrice,
                        item.quantity,
                        currentUserIsAgent,
                        agentSettings || undefined,
                        item.bulkPricing
                    )
                })));
            }
        }
    }, [user, agentSettings, isMounted]);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isMounted]);

    const getItemPrice = useCallback((item: CartItem): number => {
        return calculatePrice(
            item.originalPrice,
            item.quantity,
            item.isAgent,
            agentSettings || undefined,
            item.bulkPricing
        );
    }, [agentSettings]);

    const addToCart = useCallback((item: Omit<CartItem, 'price' | 'isAgent'>) => {
        const isAgent = user?.role === 'sale';
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                const newQuantity = existing.quantity + item.quantity;
                return prev.map(i =>
                    i.id === item.id
                        ? {
                            ...i,
                            quantity: newQuantity,
                            price: calculatePrice(i.originalPrice, newQuantity, i.isAgent, agentSettings || undefined, i.bulkPricing)
                        }
                        : i
                );
            }
            const newItem: CartItem = {
                ...item,
                isAgent,
                price: calculatePrice(item.originalPrice, item.quantity, isAgent, agentSettings || undefined, item.bulkPricing),
                weight: item.weight || 0.5
            };
            return [...prev, newItem];
        });
    }, [user, agentSettings]);

    const addToCartWithAgentPrice = useCallback((
        item: Omit<CartItem, 'price' | 'isAgent'>,
        isAgent: boolean,
        settings?: { agentDiscountEnabled: boolean; agentDiscountPercent: number; bulkDiscountEnabled: boolean }
    ) => {
        const finalSettings = settings || agentSettings;
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                const newQuantity = existing.quantity + item.quantity;
                return prev.map(i =>
                    i.id === item.id
                        ? {
                            ...i,
                            quantity: newQuantity,
                            price: calculatePrice(i.originalPrice, newQuantity, i.isAgent, finalSettings || undefined, i.bulkPricing)
                        }
                        : i
                );
            }
            const newItem: CartItem = {
                ...item,
                isAgent,
                price: calculatePrice(item.originalPrice, item.quantity, isAgent, finalSettings || undefined, item.bulkPricing),
                weight: item.weight || 0.5
            };
            return [...prev, newItem];
        });
    }, [agentSettings]);

    const removeFromCart = useCallback((id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return {
                    ...item,
                    quantity: newQty,
                    price: calculatePrice(item.originalPrice, newQty, item.isAgent, agentSettings || undefined, item.bulkPricing)
                };
            }
            return item;
        }));
    }, [agentSettings]);

    const setQuantity = useCallback((id: string, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    quantity,
                    price: calculatePrice(item.originalPrice, quantity, item.isAgent, agentSettings || undefined, item.bulkPricing)
                };
            }
            return item;
        }));
    }, [agentSettings]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const cartTotal = cartItems.reduce((sum, item) => {
        return sum + (getItemPrice(item) * item.quantity);
    }, 0);

    const originalTotal = cartItems.reduce((sum, item) => {
        return sum + (item.originalPrice * item.quantity);
    }, 0);

    const savingsTotal = Math.max(0, originalTotal - cartTotal);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            addToCartWithAgentPrice,
            removeFromCart,
            updateQuantity,
            setQuantity,
            clearCart,
            cartCount,
            cartTotal,
            originalTotal,
            savingsTotal,
            getItemPrice
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
