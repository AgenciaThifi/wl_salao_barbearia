/*
NÃO ESTÁ MAIS SENDO UTILIZADO, MAS MANTIDO AQUI PARA FUTURAS REFERÊNCIAS
E POSSÍVEIS MELHORIAS
*/
"use client";

import React, { useState, useEffect } from "react";
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/app/config/firebase.js";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import styles from "../components/styles/AddProduct.module.css";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [productList, setProductList] = useState<any[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (showManagePanel) fetchProducts();
  }, [showManagePanel]);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    const products = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProductList(products);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
      setPreviewReady(true);
    }
  };

  const isFormValid =
    name.trim() !== "" &&
    description.trim() !== "" &&
    category.trim() !== "" &&
    price.trim() !== "" &&
    stock.trim() !== "" &&
    !isNaN(Number(price)) &&
    !isNaN(Number(stock)) &&
    imageFile;

  const handleSubmit = async () => {
    if (!isFormValid || !imageFile) return;

    try {
      setIsSubmitting(true);

      const imageRef = ref(storage, `produtos/${uuidv4()}`);
      await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(imageRef);

      await addDoc(collection(db, "produtos"), {
        name,
        description,
        category,
        price: Number(price),
        stock: Number(stock),
        url: downloadURL,
      });

      alert("Produto cadastrado com sucesso!");
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setStock("");
      setImageFile(null);
      setImageUrl("");
      setPreviewReady(false);
      if (showManagePanel) fetchProducts();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja excluir este produto?")) {
      await deleteDoc(doc(db, "produtos", id));
      fetchProducts();
    }
  };

  const handleEdit = (prod: any) => {
    setEditingProductId(prod.id);
  };

  const handleUpdate = async (id: string, updatedData: any) => {
    await updateDoc(doc(db, "produtos", id), updatedData);
    setEditingProductId(null);
    fetchProducts();
  };

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButton}>← Voltar à página inicial</a>

      <h1 className={styles.title}>Cadastro de Produto</h1>

      <label className={styles.label}>Nome do produto</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} />

      <label className={styles.label}>Descrição</label>
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={styles.input} />

      <label className={styles.label}>Categoria</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)} className={styles.input}>
        <option value="">Selecione uma categoria</option>
        <option value="Shampoo">Shampoo</option>
        <option value="Condicionador">Condicionador</option>
        <option value="Máscara Capilar">Máscara Capilar</option>
        <option value="Óleo/Leave-in">Óleo/Leave-in</option>
        <option value="Acessórios">Acessórios</option>
        <option value="Outros">Outros</option>
      </select>

      <label className={styles.label}>Preço</label>
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={styles.input} />

      <label className={styles.label}>Estoque</label>
      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className={styles.input} />

      <label className={styles.label}>Imagem do Produto</label>
      <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />

      {previewReady && (
        <div className={styles.previewBox}>
          <h2>Pré-visualização</h2>
          <p><strong>Nome:</strong> {name}</p>
          <p><strong>Descrição:</strong> {description}</p>
          <p><strong>Categoria:</strong> {category}</p>
          <p><strong>Preço:</strong> R$ {price}</p>
          <p><strong>Estoque:</strong> {stock}</p>
          {imageUrl && (
            <Image src={imageUrl} alt="Preview" width={200} height={200} className={styles.previewImage} />
          )}
        </div>
      )}

      <button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Cadastrando..." : "Cadastrar Produto"}
      </button>

      <button onClick={() => setShowManagePanel(!showManagePanel)} className={styles.toggleManageButtonHighlighted}>
        {showManagePanel ? "▲ Ocultar gerenciamento" : "▼ Gerenciar Produtos Existentes"}
      </button>

      {showManagePanel && (
        <div className={styles.managePanel}>
          <h2 className={styles.manageTitle}>Produtos Cadastrados</h2>
          {productList.map((prod) => (
            <div key={prod.id} className={styles.manageItem}>
              <Image src={prod.url} alt={prod.name} width={60} height={60} className={styles.manageImage} />
              <div className={styles.manageInfo}>
                {editingProductId === prod.id ? (
                  <>
                    <input
                      type="text"
                      defaultValue={prod.name}
                      onChange={(e) => (prod.name = e.target.value)}
                      className={styles.inputSmall}
                    />
                    <input
                      type="text"
                      defaultValue={prod.description}
                      onChange={(e) => (prod.description = e.target.value)}
                      className={styles.inputSmall}
                    />
                    <select
                      defaultValue={prod.category || ""}
                      onChange={(e) => (prod.category = e.target.value)}
                      className={styles.inputSmall}
                    >
                      <option value="">Categoria</option>
                      <option value="Shampoo">Shampoo</option>
                      <option value="Condicionador">Condicionador</option>
                      <option value="Máscara Capilar">Máscara Capilar</option>
                      <option value="Óleo/Leave-in">Óleo/Leave-in</option>
                      <option value="Acessórios">Acessórios</option>
                      <option value="Outros">Outros</option>
                    </select>
                    <input
                      type="number"
                      defaultValue={prod.price || 0}
                      onChange={(e) => (prod.price = Number(e.target.value))}
                      className={styles.inputSmall}
                    />
                    <input
                      type="number"
                      defaultValue={prod.stock || 0}
                      onChange={(e) => (prod.stock = Number(e.target.value))}
                      className={styles.inputSmall}
                    />
                    <button
                      onClick={() => handleUpdate(prod.id, prod)}
                      className={styles.saveButton}
                    >
                      Salvar
                    </button>
                  </>
                ) : (
                  <>
                    <p><strong>{prod.name}</strong></p>
                    <p>{prod.description}</p>
                    <p>Categoria: {prod.category || "—"}</p>
                    <p>R$ {Number(prod.price || 0).toFixed(2)} | Estoque: {prod.stock}</p>
                  </>
                )}
              </div>
              <div className={styles.manageActions}>
                <button onClick={() => handleEdit(prod)} className={styles.editButton}>Editar</button>
                <button onClick={() => handleDelete(prod.id)} className={styles.deleteButton}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}