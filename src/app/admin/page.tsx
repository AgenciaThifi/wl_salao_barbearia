"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import styles from "./admimDashboard.module.css"; // arquivo CSS de estilos

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

      {/* Botão para voltar ao site */}
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
          onClick={() => router.push("/admin/config")}
          className={styles.optionButton}
        >
          Configurações de Agendamento
        </button>
      </div>
    </div>
  );
}
