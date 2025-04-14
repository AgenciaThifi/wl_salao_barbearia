// src/app/pages/contato.js
"use client";

import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import Contact from "../components/Contact";
import { useRouter } from "next/navigation";

export default function Contato() {
  const router = useRouter();

  // Armazena a lista de lojas vindas do Firestore
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca as lojas na coleção "stores"
  useEffect(() => {
    async function fetchStores() {
      try {
        const snap = await getDocs(collection(db, "stores"));
        const storesList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStores(storesList);
      } catch (error) {
        console.error("Erro ao buscar lojas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4" style={{ color: "#333" }}>
        Carregando...
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="container mx-auto py-10 px-4" style={{ color: "#333" }}>
        Nenhuma loja cadastrada.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4" style={{ color: "#333" }}>
      <h1 className="text-3xl font-bold text-center mb-6" style={{ color: "#333" }}>
        Contato
      </h1>

      {/* Container para exibir as lojas horizontalmente */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          paddingBottom: "1rem",
        }}
      >
        {stores.map((store) => {
          // Prepara os links sociais, se existirem
          const socialLinks = [];
          if (store.socials?.instagram) {
            socialLinks.push({ name: "instagram", url: store.socials.instagram });
          }
          if (store.socials?.facebook) {
            socialLinks.push({ name: "facebook", url: store.socials.facebook });
          }
          if (store.socials?.tiktok) {
            socialLinks.push({ name: "tiktok", url: store.socials.tiktok });
          }

          // Define os horários (exemplo: "08:00 - 18:00")
          const hours = store.storeOpen && store.storeClose
            ? `${store.storeOpen} - ${store.storeClose}`
            : "Horário não definido";

          return (
            <div
              key={store.id}
              style={{
                backgroundColor: "#fff",
                padding: "1rem",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                minWidth: "280px",
                flexShrink: 0,
              }}
            >
              <Contact
                address={store.address || "Endereço não definido"}
                phone={store.phone || "Telefone não definido"}
                socialLinks={socialLinks}
                hours={hours}
              />

              {/* Apenas um botão "Agendar" por card */}
              <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                <button
                  onClick={() =>
                    router.push(`/agendamento?storeId=${store.id}`)
                  }
                  style={{
                    backgroundColor: "#0070f3",
                    color: "#fff",
                    padding: "0.75rem 1rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Agendar
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
