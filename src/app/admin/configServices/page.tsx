"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { db, storage } from "@/app/config/firebase"; // Ajuste o caminho conforme seu projeto
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./configServices.module.css";

interface Service {
  id: string;
  nome: string;
  descricao: string;
  imageUrl?: string;
}

export default function ConfigServicesPage() {
  const router = useRouter();
  const { role, loading } = useUser();

  // Se não for admin, redireciona
  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/");
    }
  }, [loading, role, router]);

  // Estados para criar ou editar serviços
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);

  // Carrega a lista de serviços do Firestore
  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      // Alterado para "servicos"
      const snap = await getDocs(collection(db, "servicos"));
      const list: Service[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Service, "id">),
      }));
      setServices(list);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Limpa campos do formulário
  const resetForm = () => {
    setNome("");
    setDescricao("");
    setImageFile(null);
    setEditingServiceId(null);
  };

  // Cria ou atualiza um serviço
  const handleSaveService = async () => {
    if (!nome.trim() || !descricao.trim()) {
      alert("Preencha todos os campos obrigatórios (nome, descrição).");
      return;
    }

    try {
      let imageUrl = "";
      if (imageFile) {
        // Faz upload no Storage
        const storageRef = ref(
          storage,
          `services/${Date.now()}-${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (!editingServiceId) {
        // Criando um novo serviço
        // Alterado para "servicos"
        await addDoc(collection(db, "servicos"), {
          nome,
          descricao,
          imageUrl: imageUrl || "",
        });
      } else {
        // Editando um serviço existente
        // Alterado para "servicos"
        const docRef = doc(db, "servicos", editingServiceId);
        await updateDoc(docRef, {
          nome,
          descricao,
          ...(imageUrl && { imageUrl }), // só atualiza imageUrl se houver upload
        });
      }

      alert("Serviço salvo com sucesso!");
      resetForm();
      fetchServices();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      alert("Erro ao salvar serviço.");
    }
  };

  // Exclui um serviço
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      // Alterado para "servicos"
      await deleteDoc(doc(db, "servicos", serviceId));
      alert("Serviço excluído com sucesso!");
      fetchServices();
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      alert("Erro ao excluir serviço.");
    }
  };

  // Preenche o form para editar um serviço
  const handleEditService = (service: Service) => {
    setEditingServiceId(service.id);
    setNome(service.nome);
    setDescricao(service.descricao);
    // Nota: não temos a imagem atual em file, mas você pode exibir a miniatura se quiser
  };

  // Renderização
  if (loading) {
    return <p className={styles.loading}>Carregando...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gerenciar Serviços</h1>

      <button onClick={() => router.back()} className={styles.backButton}>
        ← Voltar ao Painel Administrativo
      </button>

      {/* Formulário para criar/editar um serviço */}
      <div className={styles.formContainer}>
        <h2 className={styles.subTitle}>
          {editingServiceId ? "Editar Serviço" : "Adicionar Novo Serviço"}
        </h2>
        <input
          type="text"
          placeholder="Nome do serviço"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className={styles.input}
        />
        <div className={styles.fileInputContainer}>
          <label>Imagem (opcional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>
        <button onClick={handleSaveService} className={styles.saveButton}>
          {editingServiceId ? "Salvar Alterações" : "Adicionar"}
        </button>
        {editingServiceId && (
          <button onClick={resetForm} className={styles.cancelButton}>
            Cancelar Edição
          </button>
        )}
      </div>

      {/* Lista de Serviços Existentes */}
      <h2 className={styles.subTitle}>Serviços Existentes</h2>
      {loadingServices ? (
        <p>Carregando serviços...</p>
      ) : services.length === 0 ? (
        <p>Nenhum serviço cadastrado.</p>
      ) : (
        <div className={styles.cardsContainer}>
          {services.map((service) => (
            <div key={service.id} className={styles.card}>
              {service.imageUrl && (
                <img
                  src={service.imageUrl}
                  alt={service.nome}
                  className={styles.cardImage}
                />
              )}
              <h3 className={styles.cardTitle}>{service.nome}</h3>
              <p className={styles.cardDescription}>{service.descricao}</p>
              <div className={styles.cardActions}>
                <button
                  onClick={() => handleEditService(service)}
                  className={styles.editButton}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
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
