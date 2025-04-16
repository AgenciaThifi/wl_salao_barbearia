"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { db } from "@/app/config/firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import styles from "./storeProducts.module.css";

interface Store {
  id: string;
  name: string;
  address?: string;      // Adicionei para exibir no card
}

interface Product {
  id: string;
  name: string;
  description?: string;  // Adicione se existir no Firestore
  category?: string;     // Adicione se existir no Firestore
  url?: string;          // URL da imagem (se existir)
}

interface StoreProduct {
  id: string;
  storeId: string;
  productId: string;
  price: number;
  stock: number;
}

export default function StoreProductsPage() {
  const { role, loading } = useUser();
  const router = useRouter();

  // Estados para listagem
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [relationships, setRelationships] = useState<StoreProduct[]>([]);

  // Estados para filtro
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("all");
  const [selectedProductFilter, setSelectedProductFilter] = useState("all");

  // Estados de seleção (loja/produto) via card
  const [storeId, setStoreId] = useState("");
  const [productId, setProductId] = useState("");

  // Estados do formulário de criação
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  // Estado para editar um relacionamento existente
  const [editingRelId, setEditingRelId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [editingStock, setEditingStock] = useState("");

  // Verifica se é admin
  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/");
    }
  }, [loading, role, router]);

  // Carrega as lojas e produtos ao montar o componente
  useEffect(() => {
    async function fetchStoresAndProducts() {
      try {
        // Lojas
        const storeSnap = await getDocs(collection(db, "stores"));
        const storeList: Store[] = storeSnap.docs.map((dc) => ({
          id: dc.id,
          name: dc.data().name || "(Sem nome)",
          address: dc.data().address || "",
        }));
        setStores(storeList);

        // Produtos
        const productSnap = await getDocs(collection(db, "produtos"));
        const productList: Product[] = productSnap.docs.map((dc) => ({
          id: dc.id,
          name: dc.data().name || "(Sem nome)",
          description: dc.data().description || "",
          category: dc.data().category || "",
          url: dc.data().url || "",
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Erro ao carregar lojas e produtos:", error);
      }
    }
    fetchStoresAndProducts();
  }, []);

  // Carrega relacionamentos conforme filtros
  useEffect(() => {
    fetchRelationships();
  }, [selectedStoreFilter, selectedProductFilter]);

  async function fetchRelationships() {
    try {
      const relRef = collection(db, "storeProducts");
      let qRef = query(relRef);

      // Se o filtro de loja for diferente de "all", filtra por storeId
      if (selectedStoreFilter !== "all") {
        qRef = query(relRef, where("storeId", "==", selectedStoreFilter));
      }

      // Se também tiver filtro de produto
      if (selectedProductFilter !== "all") {
        if (selectedStoreFilter !== "all") {
          qRef = query(
            relRef,
            where("storeId", "==", selectedStoreFilter),
            where("productId", "==", selectedProductFilter)
          );
        } else {
          qRef = query(relRef, where("productId", "==", selectedProductFilter));
        }
      }

      const snap = await getDocs(qRef);
      const rels: StoreProduct[] = snap.docs.map((dc) => ({
        id: dc.id,
        storeId: dc.data().storeId,
        productId: dc.data().productId,
        price: dc.data().price,
        stock: dc.data().stock,
      }));
      setRelationships(rels);
    } catch (error) {
      console.error("Erro ao buscar relacionamentos:", error);
    }
  }

  async function handleAddRelationship() {
    // Validações
    if (!storeId) {
      alert("Selecione uma loja.");
      return;
    }
    if (!productId) {
      alert("Selecione um produto.");
      return;
    }
    if (!price || parseFloat(price) < 0) {
      alert("Preço inválido.");
      return;
    }
    if (!stock || parseInt(stock) < 0) {
      alert("Estoque inválido.");
      return;
    }

    try {
      await addDoc(collection(db, "storeProducts"), {
        storeId,
        productId,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      });
      alert("Relacionamento adicionado com sucesso!");
      // Reseta campos
      setStoreId("");
      setProductId("");
      setPrice("");
      setStock("");
      // Recarrega tabela
      fetchRelationships();
    } catch (error) {
      console.error("Erro ao adicionar relacionamento:", error);
    }
  }

  async function handleDeleteRelationship(relId: string) {
    if (!window.confirm("Tem certeza que deseja excluir este relacionamento?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "storeProducts", relId));
      alert("Relacionamento excluído com sucesso!");
      fetchRelationships();
    } catch (error) {
      console.error("Erro ao excluir relacionamento:", error);
    }
  }

  function getStoreNameById(id: string) {
    const st = stores.find((s) => s.id === id);
    return st ? st.name : "(Loja desconhecida)";
  }

  function getProductNameById(id: string) {
    const pr = products.find((p) => p.id === id);
    return pr ? pr.name : "(Produto desconhecido)";
  }

  // =================== Edição ===================
  function startEditRelationship(rel: StoreProduct) {
    setEditingRelId(rel.id);
    setEditingPrice(String(rel.price));
    setEditingStock(String(rel.stock));
  }

  function cancelEdit() {
    setEditingRelId(null);
    setEditingPrice("");
    setEditingStock("");
  }

  async function saveEditRelationship(relId: string) {
    // Valida se price e stock não são negativos
    if (!editingPrice || parseFloat(editingPrice) < 0) {
      alert("Preço inválido para edição.");
      return;
    }
    if (!editingStock || parseInt(editingStock) < 0) {
      alert("Estoque inválido para edição.");
      return;
    }

    try {
      const docRef = doc(db, "storeProducts", relId);
      await updateDoc(docRef, {
        price: parseFloat(editingPrice),
        stock: parseInt(editingStock, 10),
      });
      alert("Atualizado com sucesso!");
      cancelEdit();
      fetchRelationships();
    } catch (error) {
      console.error("Erro ao atualizar relacionamento:", error);
    }
  }

  // =================== RENDER ===================
  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => router.push("/admin")}
      >
        ← Voltar ao Painel Administrativo
      </button>

      <h1 className={styles.title}>Gerenciar Produtos por Loja</h1>

      {/* FILTROS */}
      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filtrar por Loja:</label>
          <select
            value={selectedStoreFilter}
            onChange={(e) => setSelectedStoreFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todas as Lojas</option>
            {stores.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filtrar por Produto:</label>
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos os Produtos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FORMULÁRIO PARA CRIAR UM NOVO RELACIONAMENTO */}
      <div className={styles.formBox}>
        <h2 className={styles.formTitle}>Adicionar Produto em uma Loja</h2>

        {/* ============ SELEÇÃO DE LOJA POR CARDS ============ */}
        <div className={styles.cardContainer}>
          {stores.map((st) => (
            <div
              key={st.id}
              className={`${styles.storeCard} ${
                storeId === st.id ? styles.selectedCard : ""
              }`}
              onClick={() => setStoreId(st.id)}
            >
              <h4>{st.name}</h4>
              {st.address && <p>{st.address}</p>}
            </div>
          ))}
        </div>
        {storeId && (
          <p className={styles.selectedInfo}>Loja selecionada: {getStoreNameById(storeId)}</p>
        )}

        {/* ============ SELEÇÃO DE PRODUTO POR CARDS ============ */}
        <div className={styles.cardContainer}>
          {products.map((p) => (
            <div
              key={p.id}
              className={`${styles.productCard} ${
                productId === p.id ? styles.selectedCard : ""
              }`}
              onClick={() => setProductId(p.id)}
            >
              {/* Exemplo: nome, descrição, categoria, e imagem */}
              <h4>{p.name}</h4>
              {p.description && <p>{p.description}</p>}
              {p.category && <p><em>{p.category}</em></p>}
              {p.url && (
                <img
                  src={p.url}
                  alt={p.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
              )}
            </div>
          ))}
        </div>
        {productId && (
          <p className={styles.selectedInfo}>
            Produto selecionado: {getProductNameById(productId)}
          </p>
        )}

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Preço</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Estoque</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={styles.formInput}
          />
        </div>

        <button className={styles.addButton} onClick={handleAddRelationship}>
          Adicionar
        </button>
      </div>

      {/* TABELA DE RELACIONAMENTOS */}
      <h2 className={styles.subtitle}>Relacionamentos Existentes</h2>
      <div className={styles.tableContainer}>
        <table className={styles.myTable}>
          <thead>
            <tr>
              <th>Loja</th>
              <th>Produto</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {relationships.map((rel) => {
              const isEditing = editingRelId === rel.id;
              return (
                <tr key={rel.id}>
                  <td>{getStoreNameById(rel.storeId)}</td>
                  <td>{getProductNameById(rel.productId)}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        className={styles.editInput}
                      />
                    ) : (
                      rel.price
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editingStock}
                        onChange={(e) => setEditingStock(e.target.value)}
                        className={styles.editInput}
                      />
                    ) : (
                      rel.stock
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button
                          className={styles.saveButton}
                          onClick={() => saveEditRelationship(rel.id)}
                        >
                          Salvar
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={styles.editButton}
                          onClick={() => startEditRelationship(rel)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteRelationship(rel.id)}
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {relationships.length === 0 && (
              <tr>
                <td colSpan={5}>Nenhum relacionamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
