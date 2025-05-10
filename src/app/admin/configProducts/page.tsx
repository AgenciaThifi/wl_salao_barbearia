// src/app/admin/configProducts/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { app, db, storage } from "@/app/config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getFirestore,
  query,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./configProducts.module.css";

interface Store {
  id: string;
  name: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  price?: number;
  discount?: number; // ← novo campo
  stock?: number;
  description: string;
  categoryId?: string;
  categoryName?: string;
  storeIds: string[];
  ingredients: string;
  brand: string;
  brandImageUrl?: string;
  url?: string;
}

interface Category {
  id: string;
  name: string;
}


function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ConfigProductsPage() {
  const router = useRouter();
  const { role, loading } = useUser();
  const [discount, setDiscount] = useState<number>(0);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState("");
  const [brand, setBrand] = useState("");
  const [brandImageFile, setBrandImageFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/");
    }
  }, [loading, role, router]);

  useEffect(() => {
    fetchCategories();
    fetchStores();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Category, "id">),
        }))
      );
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    }
  };

  const fetchStores = async () => {
    try {
      const snap = await getDocs(collection(db, "stores")); // <-- Corrigido aqui
      const lojas = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Store, "id">),
      }));
      setStores(lojas);
    } catch (err) {
      console.error("Erro ao carregar lojas:", err);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const snap = await getDocs(collection(db, "produtos"));
      const list: Product[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          name: data.name,
          price: data.price ?? 0,
          discount: data.discount ?? 0,
          stock: data.stock ?? 0,
          description: data.description,
          url: data.url || data.imageUrl || "",
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          storeIds: data.storeIds || [],
          ingredients: data.ingredients,
          brand: data.brand,
          brandImageUrl: data.brandImageUrl || "",
        };
      });
      setProducts(list);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice(0);
    setDiscount(0);
    setStock(0);
    setDescription("");
    setCategoryId("");
    setStoreIds([]);
    setIngredients("");
    setBrand("");
    setBrandImageFile(null);
    setImageFile(null);
    setEditingProductId(null);
  };

  const handleSaveProduct = async () => {
    if (!name.trim() || !description.trim() || !categoryId || storeIds.length === 0) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const formattedName = toTitleCase(name.trim());

    try {
          let uploadedURL = "";
    if (imageFile) {
      const storageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      uploadedURL = await getDownloadURL(storageRef);
    } else if (editingProductId) {
      const existingProduct = products.find(p => p.id === editingProductId);
      uploadedURL = existingProduct?.url || "";
    }

    let brandImageUrl = "";
    if (brandImageFile) {
      const brandRef = ref(storage, `brands/${Date.now()}-${brandImageFile.name}`);
      await uploadBytes(brandRef, brandImageFile);
      brandImageUrl = await getDownloadURL(brandRef);
    } else if (editingProductId) {
      const existingProduct = products.find(p => p.id === editingProductId);
      brandImageUrl = existingProduct?.brandImageUrl || "";
    }


      const category = categories.find((c) => c.id === categoryId);
      const categoryName = category?.name || "";

      const data = {
        name: formattedName,
        price,
        discount,
        stock,
        description,
        categoryId,
        categoryName,
        storeIds,
        ingredients,
        brand,
        brandImageUrl,
        url: uploadedURL,
      };

      if (!editingProductId) {
        await addDoc(collection(db, "produtos"), data);
        alert("Produto adicionado com sucesso!");
      } else {
        const docRef = doc(db, "produtos", editingProductId);
        await updateDoc(docRef, data);
        alert("Produto atualizado com sucesso!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteDoc(doc(db, "produtos", productId));
      alert("Produto excluído com sucesso!");
      fetchProducts();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto.");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price ?? 0);
    setDiscount(product.discount ?? 0);
    setStock(product.stock ?? 0);
    setDescription(product.description);
    setCategoryId(product.categoryId || "");
    setStoreIds(product.storeIds);
    setIngredients(product.ingredients);
    setBrand(product.brand);
  };

  if (loading) return <p className={styles.loading}>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gerenciar Produtos</h1>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← Voltar ao Painel Administrativo
      </button>

      <div className={styles.formContainer}>
  <h2 className={styles.subTitle}>
    {editingProductId ? "Editar Produto" : "Adicionar Novo Produto"}
  </h2>

  <label><strong>Nome do Produto:</strong></label>
  <input type="text" placeholder="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} />

  <label><strong>Valor (R$):</strong></label>
  <input type="number" placeholder="Valor (R$)" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={styles.input} />
  <label><strong>Desconto (R$):</strong></label>
  <input
    type="number"
    placeholder="Valor de desconto"
    value={discount}
    onChange={(e) => setDiscount(Number(e.target.value))}
    className={styles.input}
  />

  <label><strong>Quantidade em Estoque:</strong></label>
  <input type="number" placeholder="Quantidade em estoque" value={stock} onChange={(e) => setStock(Number(e.target.value))} className={styles.input} />

  <label><strong>Descrição:</strong></label>
  <textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} className={styles.input} />

  <label><strong>Ingredientes:</strong></label>
  <textarea placeholder="Ingredientes" value={ingredients} onChange={(e) => setIngredients(e.target.value)} className={styles.input} />

  <label><strong>Marca / Nome do Fabricante:</strong></label>
  <input type="text" placeholder="Marca / Nome do Fabricante" value={brand} onChange={(e) => setBrand(e.target.value)} className={styles.input} />

  <label><strong>Imagem da marca (opcional):</strong></label>
  <input type="file" accept="image/*" onChange={(e) => setBrandImageFile(e.target.files?.[0] || null)} />

  <label><strong>Categoria:</strong></label>
  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={styles.input}>
    <option value="">Selecione a categoria</option>
    {categories.map((cat) => (
      <option key={cat.id} value={cat.id}>{cat.name}</option>
    ))}
  </select>

  <label><strong>Selecione as Lojas:</strong></label>
  <select multiple value={storeIds} onChange={(e) => setStoreIds(Array.from(e.target.selectedOptions, (opt) => opt.value))} className={styles.input}>
    {stores.map((store) => (
      <option key={store.id} value={store.id}>
        {store.name} - {store.address}
      </option>
    ))}
  </select>

  <label><strong>Imagem do Produto (opcional):</strong></label>
  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />

  <button onClick={handleSaveProduct} className={styles.saveButton}>
    {editingProductId ? "Salvar Alterações" : "Adicionar"}
  </button>
  {editingProductId && (
    <button onClick={resetForm} className={styles.cancelButton}>
      Cancelar Edição
    </button>
  )}
</div>


      <h2 className={styles.subTitle}>Produtos Existentes</h2>
      {loadingProducts ? (
        <p className={styles.loading}>Carregando produtos...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <div className={styles.cardsContainer}>
          {products.map((product) => (
            <div key={product.id} className={styles.card}>
              {product.url ? (
                <img src={product.url} alt={product.name} className={styles.cardImage} />
              ) : (
                <div className={styles.noImage}>Sem imagem</div>
              )}
              <h3 className={styles.cardTitle}>{product.name}</h3>
              <p><strong>ID:</strong> {product.id}</p>
              <p><strong>Preço:</strong> R$ {(product.price ?? 0).toFixed(2)}</p>
              <p><strong>Desconto:</strong> R$ {(product.discount ?? 0).toFixed(2)}</p>
              <p><strong>Estoque:</strong> {product.stock ?? 0}</p>
              <p className={styles.cardDescription}>{product.description}</p>
              <p><strong>Categoria:</strong> {product.categoryName}</p>
              <p><strong>Ingredientes:</strong> {product.ingredients}</p>
              <p><strong>Marca:</strong> {product.brand}</p>
              <p><strong>Lojas:</strong> {product.storeIds.map((id) => {
                const store = stores.find((s) => s.id === id);
                return store ? store.address : id;
              }).join(", ")}</p>
              <div className={styles.cardActions}>
                <button onClick={() => handleEditProduct(product)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDeleteProduct(product.id)} className={styles.deleteButton}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
