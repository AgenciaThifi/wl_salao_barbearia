// src/app/store/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/app/config/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import styles from "../components/styles/store.module.css";
import { useUser } from "../context/UserContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  url: string;
  stock?: number;
  category?: string;
  sold?: number;
}

interface StoreProductRel {
  productId: string;
  price: number;
  stock: number;
}

export default function Store() {
  const router = useRouter();
  const { role, loading } = useUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(
    []
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOption, setSortOption] = useState("");

  const [stores, setStores] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  // agora guardamos preço e estoque por loja
  const [storeProductRels, setStoreProductRels] = useState<StoreProductRel[]>(
    []
  );

  // busca todos os produtos
  const fetchProducts = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "produtos"));
      const list = snap.docs.map((doc) => ({
        ...(doc.data() as Product),
        id: doc.id,
      }));
      setProducts(list);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    }
  }, []);

  // busca lojas e produtos iniciais
  useEffect(() => {
    async function fetchStores() {
      try {
        const snap = await getDocs(collection(db, "stores"));
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          name: (doc.data() as DocumentData).name || "(Sem nome)",
        }));
        setStores(list);
      } catch (err) {
        console.error("Erro ao buscar lojas:", err);
      }
    }
    fetchStores();
    fetchProducts();
  }, [fetchProducts]);

  // quando muda a loja, busca relacionamento storeProducts
  useEffect(() => {
    if (!selectedStoreId) {
      setStoreProductRels([]);
      return;
    }
    async function fetchStoreProducts() {
      try {
        const q = query(
          collection(db, "storeProducts"),
          where("storeId", "==", selectedStoreId)
        );
        const snap = await getDocs(q);
        const rels = snap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            productId: data.productId,
            price: data.price,
            stock: data.stock,
          } as StoreProductRel;
        });
        setStoreProductRels(rels);
      } catch (err) {
        console.error("Erro ao buscar produtos da loja:", err);
      }
    }
    fetchStoreProducts();
  }, [selectedStoreId]);

  // aplica filtros de busca, categoria, ordenação e loja
  useEffect(() => {
    let filtered = [...products];

    if (selectedStoreId) {
      const ids = storeProductRels.map((r) => r.productId);
      filtered = filtered.filter((p) => ids.includes(p.id));
    }

    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (sortOption === "priceAsc") {
      filtered.sort((a, b) => {
        const aRel = storeProductRels.find((r) => r.productId === a.id);
        const bRel = storeProductRels.find((r) => r.productId === b.id);
        const aPrice = aRel?.price ?? a.price ?? 0;
        const bPrice = bRel?.price ?? b.price ?? 0;
        return aPrice - bPrice;
      });
    } else if (sortOption === "priceDesc") {
      filtered.sort((a, b) => {
        const aRel = storeProductRels.find((r) => r.productId === a.id);
        const bRel = storeProductRels.find((r) => r.productId === b.id);
        const aPrice = aRel?.price ?? a.price ?? 0;
        const bPrice = bRel?.price ?? b.price ?? 0;
        return bPrice - aPrice;
      });
    } else if (sortOption === "mostSold") {
      filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    }

    setFilteredProducts(filtered);
  }, [
    search,
    categoryFilter,
    sortOption,
    products,
    selectedStoreId,
    storeProductRels,
  ]);

  // carrinho (idem)
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };
  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  const decreaseQuantity = (productId: string) =>
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  const increaseQuantity = (productId: string) =>
    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  const totalPrice = cart.reduce(
    (sum, i) => sum + (i.product.price ?? 0) * i.quantity,
    0
  );

  const finalizarCompra = async () => {
    try {
      localStorage.setItem("compraFinalizada", JSON.stringify(cart));
      const response = await fetch("/api/pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            title: item.product.name,
            quantity: item.quantity,
            unit_price:
              storeProductRels.find((r) => r.productId === item.product.id)
                ?.price ?? item.product.price ?? 0,
          })),
        }),
      });
      const data = await response.json();
      if (data.init_point) window.location.href = data.init_point;
      else alert("Erro ao redirecionar para o pagamento.");
    } catch {
      alert("Erro ao finalizar compra.");
    }
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.push("/")} className={styles.backButton}>
        ⬅ Voltar à página inicial
      </button>

      <h1 className={styles.title}>Loja de Produtos</h1>

      <div className={styles.filtersContainer}>
        <select
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          className={styles.selectInput}
        >
          <option value="">Selecione uma loja</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {selectedStoreId && (
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className={styles.searchInput}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">Todas as categorias</option>
              <option value="Shampoo">Shampoo</option>
              <option value="Condicionador">Condicionador</option>
              <option value="Máscara Capilar">Máscara Capilar</option>
              <option value="Óleo/Leave-in">Óleo/Leave-in</option>
              <option value="Acessórios">Acessórios</option>
              <option value="Outros">Outros</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">Ordenar por</option>
              <option value="priceAsc">Preço: Menor → Maior</option>
              <option value="priceDesc">Preço: Maior → Menor</option>
              <option value="mostSold">Mais Vendidos</option>
            </select>
          </>
        )}
      </div>

      {!selectedStoreId ? (
        <p style={{ textAlign: "center", color: "#777" }}>
          Por favor, selecione uma loja acima para ver os produtos.
        </p>
      ) : filteredProducts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777", fontStyle: "italic" }}>
          Esta loja ainda está sendo configurada. Volte mais tarde!
        </p>
      ) : (
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => {
            const rel = storeProductRels.find((r) => r.productId === product.id);
            const displayPrice = rel?.price ?? product.price ?? 0;
            const displayStock = rel?.stock ?? product.stock ?? 0;

            return (
              <Card key={product.id} className={styles.productCard}>
                <img
                  src={product.url}
                  alt={product.name}
                  className={styles.productImage}
                />
                <CardContent>
                  <h2 className={styles.productTitle}>
                    {product.name || "(Sem nome)"}
                  </h2>
                  <p className={styles.productDescription}>
                    {product.description}
                  </p>
                  <p className={styles.productCategory}>
                    <strong>Categoria:</strong>{" "}
                    {product.category || "Não especificada"}
                  </p>
                  <p className={styles.productPrice}>
                    R$ {displayPrice.toFixed(2)}
                  </p>
                  <p className={styles.productStock}>
                    Estoque: {displayStock}
                  </p>
                  <Button
                    onClick={() => addToCart(product)}
                    className={styles.addToCartButton}
                    disabled={displayStock === 0}
                  >
                    {displayStock === 0
                      ? "Indisponível"
                      : "Adicionar ao Carrinho"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className={styles.cartSection}>
        <h2 className={styles.cartTitle}>Carrinho</h2>
        {cart.length === 0 ? (
          <p className={styles.emptyCart}>Seu carrinho está vazio.</p>
        ) : (
          <>
            {cart.map((item) => {
              const rel = storeProductRels.find(
                (r) => r.productId === item.product.id
              );
              const price = rel?.price ?? item.product.price ?? 0;
              return (
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
                      R$ {(price * item.quantity).toFixed(2)}
                    </span>
                    <div className={styles.cartControls}>
                      <button
                        onClick={() => decreaseQuantity(item.product.id)}
                      >
                        –
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.product.id)}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className={styles.removeButton}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
