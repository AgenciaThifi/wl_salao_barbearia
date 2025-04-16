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

import styles from "./storeServices.module.css";

// Tipos básicos
interface Store {
  id: string;
  name: string;
  address?: string; // Para exibir no card
}

interface Service {
  id: string;
  name: string;
  descricao?: string; // Descrição opcional
  imagem?: string;    // URL de imagem opcional
}

interface StoreService {
  id: string;
  storeId: string;
  serviceId: string;
  price: number; // preço específico para essa loja
  time: string;  // tempo específico para essa loja
}

export default function StoreServicesPage() {
  // Autenticação e navegação
  const { role, loading } = useUser();
  const router = useRouter();

  // Estados para listagem
  const [stores, setStores] = useState<Store[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [relationships, setRelationships] = useState<StoreService[]>([]);

  // Filtros
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("all");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("all");

  // Formulário de criação
  const [storeId, setStoreId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [price, setPrice] = useState("");
  const [time, setTime] = useState("");

  // Edição
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editTime, setEditTime] = useState("");

  // Verifica se usuário é admin
  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/");
    }
  }, [loading, role, router]);

  // Carrega lojas e serviços no início
  useEffect(() => {
    async function fetchStoresAndServices() {
      try {
        // Lojas
        const storeSnap = await getDocs(collection(db, "stores"));
        const storeList: Store[] = storeSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "(Sem nome)",
          address: doc.data().address || "(Endereço não definido)",
        }));
        setStores(storeList);

        // Serviços
        const serviceSnap = await getDocs(collection(db, "servicos"));
        const serviceList: Service[] = serviceSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().nome || "(Sem nome)",
          descricao: doc.data().descricao || "",
          // Alterado: utiliza o campo "imageUrl" conforme gravado na coleção "servicos"
          imagem: doc.data().imageUrl || "",
        }));
        setServices(serviceList);
      } catch (error) {
        console.error("Erro ao carregar lojas e serviços:", error);
      }
    }
    fetchStoresAndServices();
  }, []);

  // Carrega relacionamentos (storeServices) conforme filtros
  useEffect(() => {
    fetchRelationships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreFilter, selectedServiceFilter]);

  async function fetchRelationships() {
    try {
      const relRef = collection(db, "storeServices");
      let qRef = query(relRef);

      // Filtra por loja
      if (selectedStoreFilter !== "all") {
        qRef = query(relRef, where("storeId", "==", selectedStoreFilter));
      }
      // Filtra também por serviço
      if (selectedServiceFilter !== "all") {
        if (selectedStoreFilter !== "all") {
          qRef = query(
            relRef,
            where("storeId", "==", selectedStoreFilter),
            where("serviceId", "==", selectedServiceFilter)
          );
        } else {
          qRef = query(relRef, where("serviceId", "==", selectedServiceFilter));
        }
      }

      const snap = await getDocs(qRef);
      const rels: StoreService[] = snap.docs.map((doc) => ({
        id: doc.id,
        storeId: doc.data().storeId,
        serviceId: doc.data().serviceId,
        price: doc.data().price,
        time: doc.data().time,
      }));
      setRelationships(rels);
    } catch (error) {
      console.error("Erro ao buscar relacionamentos:", error);
    }
  }

  // ========== ADIÇÃO DE RELACIONAMENTO ==========
  async function handleAddRelationship() {
    // Verifica campos obrigatórios
    if (!storeId) {
      alert("Selecione uma loja.");
      return;
    }
    if (!serviceId) {
      alert("Selecione um serviço.");
      return;
    }
    if (!price || !time) {
      alert("Preencha todos os campos (preço e tempo).");
      return;
    }

    // Verifica se price e time são válidos
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("O preço deve ser um valor numérico positivo.");
      return;
    }

    const timeNum = parseInt(time, 10);
    if (isNaN(timeNum) || timeNum <= 0) {
      alert("O tempo deve ser um valor numérico maior que zero.");
      return;
    }

    try {
      await addDoc(collection(db, "storeServices"), {
        storeId,
        serviceId,
        price: priceNum,
        time: time, // mantemos como string (ex.: "30")
      });
      alert("Relacionamento adicionado com sucesso!");
      // Reseta campos
      setStoreId("");
      setServiceId("");
      setPrice("");
      setTime("");
      fetchRelationships();
    } catch (error) {
      console.error("Erro ao adicionar relacionamento:", error);
    }
  }

  // ========== EXCLUSÃO ==========
  async function handleDeleteRelationship(relId: string) {
    if (!window.confirm("Tem certeza que deseja excluir este relacionamento?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "storeServices", relId));
      alert("Relacionamento excluído com sucesso!");
      fetchRelationships();
    } catch (error) {
      console.error("Erro ao excluir relacionamento:", error);
    }
  }

  // ========== EDIÇÃO ==========
  function handleEditRelationship(rel: StoreService) {
    setEditId(rel.id);
    setEditPrice(String(rel.price));
    setEditTime(rel.time);
  }

  async function handleSaveEdit(rel: StoreService) {
    if (!editPrice || !editTime) {
      alert("Preencha todos os campos para editar (preço e tempo).");
      return;
    }

    // Verifica se price e time são válidos
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("O preço deve ser um valor numérico positivo.");
      return;
    }

    const timeNum = parseInt(editTime, 10);
    if (isNaN(timeNum) || timeNum <= 0) {
      alert("O tempo deve ser um valor numérico maior que zero.");
      return;
    }

    try {
      await updateDoc(doc(db, "storeServices", rel.id), {
        price: priceNum,
        time: editTime,
      });
      alert("Editado com sucesso!");
      setEditId(null);
      setEditPrice("");
      setEditTime("");
      fetchRelationships();
    } catch (error) {
      console.error("Erro ao editar relacionamento:", error);
    }
  }

  function handleCancelEdit() {
    setEditId(null);
    setEditPrice("");
    setEditTime("");
  }

  // Mapeia IDs para nomes
  function getStoreNameById(id: string) {
    const st = stores.find((s) => s.id === id);
    return st ? st.name : "(Loja desconhecida)";
  }
  function getServiceNameById(id: string) {
    const sv = services.find((p) => p.id === id);
    return sv ? sv.name : "(Serviço desconhecido)";
  }

  // Renderiza "cards" de lojas
  function renderStoreCards() {
    return (
      <div className={styles.cardContainer}>
        {stores.map((st) => {
          const isSelected = storeId === st.id;
          return (
            <div
              key={st.id}
              className={`${styles.storeCard} ${
                isSelected ? styles.selectedCard : ""
              }`}
              onClick={() => setStoreId(st.id)}
            >
              <h3>{st.name}</h3>
              <p>{st.address}</p>
            </div>
          );
        })}
      </div>
    );
  }

  // Renderiza "cards" de serviços
  function renderServiceCards() {
    return (
      <div className={styles.cardContainer}>
        {services.map((sv) => {
          const isSelected = serviceId === sv.id;
          return (
            <div
              key={sv.id}
              className={`${styles.serviceCard} ${
                isSelected ? styles.selectedCard : ""
              }`}
              onClick={() => setServiceId(sv.id)}
            >
              <h3>{sv.name}</h3>
              {sv.descricao && <p>{sv.descricao}</p>}
              {sv.imagem && (
                <img
                  src={sv.imagem}
                  alt="Imagem do serviço"
                  className={styles.serviceImage}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => router.push("/admin")}
      >
        ← Voltar ao Painel Administrativo
      </button>

      <h1 className={styles.title}>Gerenciar Serviços por Loja</h1>

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
          <label className={styles.filterLabel}>Filtrar por Serviço:</label>
          <select
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos os Serviços</option>
            {services.map((sv) => (
              <option key={sv.id} value={sv.id}>
                {sv.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FORMULÁRIO PARA CRIAR UM NOVO RELACIONAMENTO */}
      <div className={styles.formBox}>
        <h2 className={styles.formTitle}>Adicionar Serviço em uma Loja</h2>

        {/* Exibe cards de lojas */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Escolha uma Loja (clique para selecionar)
          </label>
          {renderStoreCards()}
        </div>

        {/* Exibe cards de serviços */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Selecione o Serviço (clique para selecionar)
          </label>
          {renderServiceCards()}
        </div>

        {/* Inputs para preço e tempo */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Preço (somente números)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tempo (ex.: "30" minutos)</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
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
              <th>Serviço</th>
              <th>Preço</th>
              <th>Tempo</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {relationships.map((rel) => {
              const isEditing = editId === rel.id;
              if (isEditing) {
                // Modo Edição
                return (
                  <tr key={rel.id}>
                    <td>{getStoreNameById(rel.storeId)}</td>
                    <td>{getServiceNameById(rel.serviceId)}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className={styles.editInput}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className={styles.editInput}
                      />
                    </td>
                    <td>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleSaveEdit(rel)}
                      >
                        Salvar
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={handleCancelEdit}
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                );
              } else {
                // Modo Normal
                return (
                  <tr key={rel.id}>
                    <td>{getStoreNameById(rel.storeId)}</td>
                    <td>{getServiceNameById(rel.serviceId)}</td>
                    <td>{rel.price}</td>
                    <td>{rel.time}</td>
                    <td>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditRelationship(rel)}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteRelationship(rel.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              }
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
