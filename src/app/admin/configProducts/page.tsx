"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { db, storage } from "@/app/config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
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
  discount?: number;
  stock?: number;
  description: string;
  categoryId?: string;
  categoryName?: string;
  storeIds: string[];
  ingredients: string;
  brand: string;
  brandImageUrl?: string;
  url?: string;
  width?: number;
  height?: number;
  length?: number;
  weight?: number;
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

  // campos
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [brand, setBrand] = useState("");
  const [brandImageFile, setBrandImageFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);

  // dados auxiliares
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
    const snap = await getDocs(collection(db, "categories"));
    setCategories(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, "id">) }))
    );
  };

  const fetchStores = async () => {
    const snap = await getDocs(collection(db, "stores"));
    setStores(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Store, "id">) }))
    );
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const snap = await getDocs(collection(db, "produtos"));
    setProducts(
      snap.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          name: data.name,
          price: data.price ?? 0,
          discount: data.discount ?? 0,
          stock: data.stock ?? 0,
          description: data.description,
          url: data.url || "",
          categoryId: data.categoryId,
          categoryName: data.categoryName,
          storeIds: data.storeIds || [],
          ingredients: data.ingredients,
          brand: data.brand,
          brandImageUrl: data.brandImageUrl || "",
          width: data.width ?? 0,
          height: data.height ?? 0,
          length: data.length ?? 0,
          weight: data.weight ?? 0,
        };
      })
    );
    setLoadingProducts(false);
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
    setWidth(0);
    setHeight(0);
    setLength(0);
    setWeight(0);
    setEditingProductId(null);
  };

  const handleSaveProduct = async () => {
    if (!name || !description || !categoryId || storeIds.length === 0) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const formattedName = toTitleCase(name.trim());
    const category = categories.find((c) => c.id === categoryId);
    const categoryName = category?.name || "";

    try {
      let uploadedURL = "";
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        uploadedURL = await getDownloadURL(storageRef);
      } else if (editingProductId) {
        uploadedURL = products.find((p) => p.id === editingProductId)?.url || "";
      }

      let brandImageUrl = "";
      if (brandImageFile) {
        const brandRef = ref(storage, `brands/${Date.now()}-${brandImageFile.name}`);
        await uploadBytes(brandRef, brandImageFile);
        brandImageUrl = await getDownloadURL(brandRef);
      } else if (editingProductId) {
        brandImageUrl = products.find((p) => p.id === editingProductId)?.brandImageUrl || "";
      }

      const data = {
        name: formattedName,
        price,
        discount,
        stock,
        description,
        ingredients,
        brand,
        categoryId,
        categoryName,
        storeIds,
        brandImageUrl,
        url: uploadedURL,
        width,
        height,
        length,
        weight,
      };

      if (editingProductId) {
        await updateDoc(doc(db, "produtos", editingProductId), data);
        alert("Produto atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "produtos"), data);
        alert("Produto adicionado com sucesso!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar produto.");
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(product.price ?? 0);
    setDiscount(product.discount ?? 0);
    setStock(product.stock ?? 0);
    setDescription(product.description);
    setIngredients(product.ingredients);
    setBrand(product.brand);
    setCategoryId(product.categoryId || "");
    setStoreIds(product.storeIds);
    setWidth(product.width ?? 0);
    setHeight(product.height ?? 0);
    setLength(product.length ?? 0);
    setWeight(product.weight ?? 0);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Deseja realmente excluir?")) return;
    await deleteDoc(doc(db, "produtos", id));
    alert("Produto excluído.");
    fetchProducts();
  };

  if (loading) return <p className={styles.loading}>Carregando...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gerenciar Produtos</h1>

      {/* Formulário */}
     <div className={styles.formContainer}>
  <label>Nome do produto</label>
  <input placeholder="Nome do produto" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} />

  <label>Preço (R$)</label>
  <input type="number" placeholder="Preço" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={styles.input} />

  <label>Desconto (R$)</label>
  <input type="number" placeholder="Desconto" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className={styles.input} />

  <label>Estoque</label>
  <input type="number" placeholder="Estoque" value={stock} onChange={(e) => setStock(Number(e.target.value))} className={styles.input} />

  <label>Descrição</label>
  <textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} className={styles.input} />

  <label>Ingredientes</label>
  <textarea placeholder="Ingredientes" value={ingredients} onChange={(e) => setIngredients(e.target.value)} className={styles.input} />

  <label>Marca</label>
  <input placeholder="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} className={styles.input} />

  <label>Imagem da Marca</label>
  <input type="file" accept="image/*" onChange={(e) => setBrandImageFile(e.target.files?.[0] || null)} />

  <label>Imagem do Produto</label>
  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />

  <label>Categoria</label>
  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={styles.input}>
    <option value="">Selecione a categoria</option>
    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
  </select>

  <label>Lojas</label>
  <select multiple value={storeIds} onChange={(e) => setStoreIds(Array.from(e.target.selectedOptions, opt => opt.value))} className={styles.input}>
    {stores.map((s) => <option key={s.id} value={s.id}>{s.name} - {s.address}</option>)}
  </select>

  <label>Largura (cm)</label>
  <input type="number" placeholder="Largura" value={width} onChange={(e) => setWidth(Number(e.target.value))} className={styles.input} />

  <label>Altura (cm)</label>
  <input type="number" placeholder="Altura" value={height} onChange={(e) => setHeight(Number(e.target.value))} className={styles.input} />

  <label>Comprimento (cm)</label>
  <input type="number" placeholder="Comprimento" value={length} onChange={(e) => setLength(Number(e.target.value))} className={styles.input} />

  <label>Peso (g)</label>
  <input type="number" placeholder="Peso" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className={styles.input} />

  <button onClick={handleSaveProduct} className={styles.saveButton}>
    {editingProductId ? "Salvar Alterações" : "Adicionar Produto"}
  </button>
  {editingProductId && (
    <button onClick={resetForm} className={styles.cancelButton}>
      Cancelar Edição
    </button>
  )}
</div>

      {/* Lista de produtos */}
      <h2 className={styles.subTitle}>Produtos</h2>
      <div className={styles.cardsContainer}>
        {products.map((product) => (
          <div key={product.id} className={styles.card}>
            <img src={product.url} alt={product.name} className={styles.cardImage} />
            <h3>{product.name}</h3>
            <p><strong>Preço:</strong> R$ {product.price?.toFixed(2)}</p>
            <p><strong>Desconto:</strong> R$ {product.discount?.toFixed(2)}</p>
            <p><strong>Estoque:</strong> {product.stock}</p>
            <p><strong>Dimensões:</strong> {product.width}x{product.height}x{product.length} cm</p>
            <p><strong>Peso:</strong> {product.weight} g</p>
            <p><strong>Marca:</strong> {product.brand}</p>
            <button onClick={() => handleEditProduct(product)} className={styles.editButton}>Editar</button>
            <button onClick={() => handleDeleteProduct(product.id)} className={styles.deleteButton}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}
