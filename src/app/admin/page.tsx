// src/app/admin/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import styles from "./admimDashboard.module.css";

export default function AdminDashboard() {
  const { role, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/");
    }
  }, [loading, role, router]);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Painel Administrativo</h1>

      <button
        className={styles.backSiteButton}
        onClick={() => router.push("/")}
      >
        ← Voltar para o site
      </button>

      <div className={styles.optionsContainer}>
        <button
          onClick={() => router.push("/admin/stores")}
          className={styles.optionButton}
        >
          Gerenciar Lojas
        </button>
        <button
          onClick={() => router.push("/admin/storeProducts")}
          className={styles.optionButton}
        >
          Gerenciar Produtos
        </button>
        <button
          onClick={() => router.push("/admin/storeServices")}
          className={styles.optionButton}
        >
          Gerenciar Serviços
        </button>
        <button
          onClick={() => router.push("/admin/configServices")}
          className={styles.optionButton}
        >
          Adicionar/Alterar/Excluir Serviços
        </button>
        <button
          onClick={() => router.push("/admin/configProducts")}
          className={styles.optionButton}
        >
          Adicionar/Alterar/Excluir Produtos
        </button>
        <button
          onClick={() => router.push("/admin/config")}
          className={styles.optionButton}
        >
          Configurações de Agendamento
        </button>
        <button
          onClick={() => router.push("/admin/categories")}
          className={styles.optionButton}
        >
          Gerenciar Categorias
        </button>
      </div>
    </div>
  );
}
