"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/config/firebase.js";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import styles from "../components/styles/store.module.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  url: string;
  stock: number;
}

export default function Store() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsList);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const itemExists = prevCart.find((item) => item.product.id === product.id);
      if (itemExists) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const decreaseQuantity = (productId: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const increaseQuantity = (productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const finalizarCompra = async () => {
    try {
      localStorage.setItem("compraFinalizada", JSON.stringify(cart));
  
      const response = await fetch("/api/pagamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            title: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
          })),
        }),
      });
  
      const data = await response.json();
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Erro ao redirecionar para o pagamento.");
      }
    } catch (err) {
      console.error("Erro ao finalizar compra:", err);
      alert("Erro ao finalizar compra.");
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.push("/")} className={styles.backButton}>
        ⬅ Voltar à página inicial
      </button>

      <h1 className={styles.title}>Loja de Produtos</h1>

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <Card key={product.id} className={styles.productCard}>
            <img src={product.url} alt={product.name} className={styles.productImage} />
            <CardContent>
              <h2 className={styles.productTitle}>{product.name || "(Sem nome)"}</h2>
              <p className={styles.productDescription}>{product.description}</p>
              <p className={styles.productPrice}>R$ {product.price?.toFixed(2)}</p>
              <p className={styles.productStock}>Estoque: {product.stock ?? 0}</p>
              <Button
                onClick={() => addToCart(product)}
                className={styles.addToCartButton}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Indisponível" : "Adicionar ao Carrinho"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={styles.cartSection}>
        <h2 className={styles.cartTitle}>Carrinho</h2>
        {cart.length === 0 && <p className={styles.emptyCart}>Seu carrinho está vazio.</p>}
        {cart.map((item) => (
          <div key={item.product.id} className={styles.cartItem}>
            <img
              src={item.product.url}
              alt={item.product.name}
              className={styles.cartItemImage}
            />
            <div className={styles.cartItemDetails}>
              <span className={styles.cartItemName}>
                {item.product.name}
              </span>
              <span className={styles.cartItemPrice}>
                R$ {(item.product.price * item.quantity).toFixed(2)}
              </span>
              <div className={styles.cartControls}>
                <button onClick={() => decreaseQuantity(item.product.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQuantity(item.product.id)}>+</button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className={styles.removeButton}
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        ))}
        {cart.length > 0 && (
          <>
            <div className={styles.cartTotal}>
              <strong>Total: R$ {totalPrice.toFixed(2)}</strong>
            </div>
            <button
              className={styles.checkoutButton}
              onClick={finalizarCompra}
            >
              Finalizar Compra
            </button>
          </>
        )}
      </div>
    </div>
  );
}
