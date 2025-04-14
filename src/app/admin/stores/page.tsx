"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import styles from "./stores.module.css";

export default function StoresList() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const fetchStores = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "stores"));
      const storesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStores(storesList);
    } catch (error) {
      console.error("Erro ao buscar lojas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleEdit = (storeId: string) => {
    router.push(`/admin/stores/${storeId}`);
  };

  const handleDelete = async (storeId: string) => {
    if (confirm("Tem certeza de que deseja excluir esta loja?")) {
      try {
        await deleteDoc(doc(db, "stores", storeId));
        alert("Loja excluída com sucesso!");
        fetchStores();
      } catch (error) {
        console.error("Erro ao excluir loja:", error);
        alert("Erro ao excluir loja.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Minhas Lojas</h1>

      {/* Botão para voltar ao painel admin */}
      <button
        className={styles.backButton}
        onClick={() => router.push("/admin")}
      >
        ← Voltar ao Painel
      </button>

      <button
        className={styles.addButton}
        onClick={() => router.push("/admin/stores/new")}
      >
        + Adicionar Nova Loja
      </button>

      {loading ? (
        <p>Carregando lojas...</p>
      ) : stores.length === 0 ? (
        <p>Nenhuma loja encontrada.</p>
      ) : (
        <div className={styles.cardsContainer}>
          {stores.map((store) => (
            <div key={store.id} className={styles.card}>
              <h2>{store.name || "Loja sem Nome"}</h2>
              <p><strong>Endereço:</strong> {store.address || "Não definido"}</p>
              <p><strong>Telefone:</strong> {store.phone || "Não definido"}</p>
              <p>
                <strong>Funcionamento:</strong>{" "}
                {store.storeOpen || "08:00"} - {store.storeClose || "22:00"}
              </p>
              <div className={styles.cardButtons}>
                <button onClick={() => handleEdit(store.id)}>Editar</button>
                <button onClick={() => handleDelete(store.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
