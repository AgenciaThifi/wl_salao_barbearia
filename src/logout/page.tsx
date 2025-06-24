"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from '@/app/config/firebase'; // Certifique-se que esse caminho está correto

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await signOut(auth); // Desloga do Firebase Auth
        alert("Logout realizado com sucesso.");
        router.push("/"); // Redireciona para a página inicial
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao sair da conta.");
      }
    };

    doLogout();
  }, [router]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.2rem",
      }}
    >
      Saindo da conta...
    </div>
  );
}
