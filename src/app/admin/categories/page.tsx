// src/app/admin/categories/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { db } from "@/app/config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import styles from "./categories.module.css";

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Utility: transforma em Title Case
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Utility: gera slug amigável
function makeSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ConfigCategoriesPage() {
  const router = useRouter();
  const { role, loading } = useUser();

  // apenas admin
  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/");
    }
  }, [loading, role, router]);

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  // busca categorias
  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const snap = await getDocs(collection(db, "categories"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Category, "id">),
      }));
      setCategories(list);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // limpa form
  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  // adiciona ou atualiza
  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Preencha o nome da categoria.");
      return;
    }
    const formattedName = toTitleCase(trimmed);
    const slug = makeSlug(formattedName);

    try {
      if (editingId) {
        const ref = doc(db, "categories", editingId);
        await updateDoc(ref, { name: formattedName, slug });
        alert("Categoria atualizada!");
      } else {
        await addDoc(collection(db, "categories"), {
          name: formattedName,
          slug,
        });
        alert("Categoria adicionada!");
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
      alert("Erro ao salvar categoria.");
    }
  };

  // inicia edição
  const handleEdit = (cat: Category) => {
    setName(cat.name);
    setEditingId(cat.id);
  };

  // exclui categoria
  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta categoria?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      alert("Categoria excluída!");
      fetchCategories();
    } catch (err) {
      console.error("Erro ao excluir categoria:", err);
      alert("Erro ao excluir categoria.");
    }
  };

  if (loading) {
    return <p className={styles.loading}>Carregando...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gerenciar Categorias</h1>

      <button onClick={() => router.back()} className={styles.backButton}>
        ← Voltar ao Painel Administrativo
      </button>

      <div className={styles.formContainer}>
        <h2 className={styles.subTitle}>
          {editingId ? "Editar Categoria" : "Adicionar Nova Categoria"}
        </h2>
        <input
          type="text"
          placeholder="Nome da categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleSave} className={styles.saveButton}>
          {editingId ? "Salvar Alterações" : "Adicionar"}
        </button>
        {editingId && (
          <button onClick={resetForm} className={styles.cancelButton}>
            Cancelar
          </button>
        )}
      </div>

      <h2 className={styles.subTitle}>Categorias Existentes</h2>
      {loadingCats ? (
        <p className={styles.loading}>Carregando categorias...</p>
      ) : categories.length === 0 ? (
        <p>Nenhuma categoria cadastrada.</p>
      ) : (
        <div className={styles.cardsContainer}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{cat.name}</h3>
              <p className={styles.cardDescription}>
                Slug: <em>{cat.slug}</em>
              </p>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleEdit(cat)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
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
