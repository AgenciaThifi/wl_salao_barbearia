// src/app/admin/configProducts/page.tsx
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

interface Product {
  id: string;
  name: string;
  description: string;
  url?: string;
  categoryId?: string;
  categoryName?: string;
}

interface Category {
  id: string;
  name: string;
}

// Utility: transforma string em Title Case
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

  // redireciona se não for admin
  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/");
    }
  }, [loading, role, router]);

  // estados
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // busca categorias
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

  // busca produtos (com fallback para url ou imageUrl)
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const snap = await getDocs(collection(db, "produtos"));
      const list: Product[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        const url = data.url || data.imageUrl || "";
        return {
          id: docSnap.id,
          name: data.name,
          description: data.description,
          url,
          categoryId: data.categoryId,
          categoryName: data.categoryName,
        };
      });
      setProducts(list);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // limpa form
  const resetForm = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    setCategoryId("");
    setEditingProductId(null);
  };

  // salva novo ou atualiza existente
  const handleSaveProduct = async () => {
    if (!name.trim() || !description.trim() || !categoryId) {
      alert("Preencha Nome, Descrição e selecione Categoria.");
      return;
    }

    const formattedName = toTitleCase(name.trim());

    try {
      let uploadedURL = "";
      if (imageFile) {
        const storageRef = ref(
          storage,
          `products/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        uploadedURL = await getDownloadURL(storageRef);
      }

      const category = categories.find((c) => c.id === categoryId);
      const categoryName = category?.name || "";

      if (!editingProductId) {
        await addDoc(collection(db, "produtos"), {
          name: formattedName,
          description,
          url: uploadedURL || "",
          categoryId,
          categoryName,
        });
        alert("Produto adicionado com sucesso!");
      } else {
        const docRef = doc(db, "produtos", editingProductId);
        const updateData: any = {
          name: formattedName,
          description,
          categoryId,
          categoryName,
        };
        if (uploadedURL) updateData.url = uploadedURL;
        await updateDoc(docRef, updateData);
        alert("Produto atualizado com sucesso!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto.");
    }
  };

  // exclui produto
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

  // inicia edição
  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setDescription(product.description);
    setCategoryId(product.categoryId || "");
  };

  if (loading) {
    return <p className={styles.loading}>Carregando...</p>;
  }

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

        <input
          type="text"
          placeholder="Nome do produto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.input}
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={styles.input}
        >
          <option value="">Selecione a categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className={styles.fileInputContainer}>
          <label>Imagem (opcional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

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
                <img
                  src={product.url}
                  alt={product.name}
                  className={styles.cardImage}
                />
              ) : (
                <div className={styles.noImage}>Sem imagem</div>
              )}
              <h3 className={styles.cardTitle}>{product.name}</h3>
              <p className={styles.cardDescription}>
                {product.description}
              </p>
              <p className={styles.cardDescription}>
                <strong>Categoria:</strong> {product.categoryName}
              </p>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleEditProduct(product)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className={styles.deleteButton}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
