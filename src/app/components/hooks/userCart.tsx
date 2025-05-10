'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/app/config/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
      setUserEmail(user?.email ?? null);  // Atualiza o email do usuário
    });

    return () => unsubscribe();
  }, []);

  const loadCart = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'Cart', userId, 'items'));
      const data: CartItem[] = snapshot.docs.map((doc) => doc.data() as CartItem);
      setCartItems(data);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadCart();
    else setCartItems([]);
  }, [userId]);

  const addItem = async (item: CartItem) => {
    if (!userId) {
      alert('Você precisa estar logado para adicionar itens ao carrinho.');
      return;
    }

    const existingSnapshot = await getDocs(collection(db, 'Cart', userId, 'items'));
    const existingItems = existingSnapshot.docs.map((doc) => doc.data() as CartItem);
    const existing = existingItems.find((i) => i.id === item.id);

    const newItem: CartItem = existing
      ? { ...existing, quantity: existing.quantity + item.quantity }
      : item;

    await setDoc(doc(db, 'Cart', userId, 'items', item.id), newItem);
    await loadCart();
  };

  const removeItem = async (id: string) => {
    if (!userId) return;

    const itemRef = doc(db, 'Cart', userId, 'items', id);
    await setDoc(itemRef, { quantity: 0 }, { merge: true });
    await deleteDoc(itemRef);
    await loadCart();
  };

  const incrementItem = async (id: string) => {
    if (!userId) return;

    const snapshot = await getDocs(collection(db, 'Cart', userId, 'items'));
    const items = snapshot.docs.map((doc) => doc.data() as CartItem);
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const updated = { ...item, quantity: item.quantity + 1 };
    await setDoc(doc(db, 'Cart', userId, 'items', id), updated);
    await loadCart();
  };

  const decrementItem = async (id: string) => {
    if (!userId) return;

    const snapshot = await getDocs(collection(db, 'Cart', userId, 'items'));
    const items = snapshot.docs.map((doc) => doc.data() as CartItem);
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const updated = { ...item, quantity: Math.max(item.quantity - 1, 1) };
    await setDoc(doc(db, 'Cart', userId, 'items', id), updated);
    await loadCart();
  };

  const clearCart = async () => {
    if (!userId) return;

    const snapshot = await getDocs(collection(db, 'Cart', userId, 'items'));

    const promises = snapshot.docs.map(async (docRef) => {
      const item = docRef.data() as CartItem;
      const ref = doc(db, 'Cart', userId, 'items', docRef.id);
      await setDoc(ref, { ...item, quantity: 0 });
      await deleteDoc(ref);
    });

    await Promise.all(promises);
    await loadCart();
  };

  return {
    cartItems,
    loading,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    userEmail,  // Inclui o email do usuário
  };
}
