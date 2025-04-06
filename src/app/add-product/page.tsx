"use client";

import React, { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "@/app/config/firebase.js";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import styles from "../components/styles/AddProduct.module.css";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

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
        price: Number(price),
        stock: Number(stock),
        url: downloadURL,
      });

      alert("Produto cadastrado com sucesso!");

      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImageFile(null);
      setImageUrl("");
      setPreviewReady(false);
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButton}>← Voltar à página inicial</a>

      <h1 className={styles.title}>Cadastro de Produto</h1>

      <label className={styles.label}>Nome do produto</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />

      <label className={styles.label}>Descrição</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={styles.input}
      />

      <label className={styles.label}>Preço</label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className={styles.input}
      />

      <label className={styles.label}>Estoque</label>
      <input
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className={styles.input}
      />

      <label className={styles.label}>Imagem do Produto</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className={styles.fileInput}
      />

      {previewReady && (
        <div className={styles.previewBox}>
          <h2>Pré-visualização</h2>
          <p><strong>Nome:</strong> {name}</p>
          <p><strong>Descrição:</strong> {description}</p>
          <p><strong>Preço:</strong> R$ {price}</p>
          <p><strong>Estoque:</strong> {stock}</p>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Preview"
              width={200}
              height={200}
              className={styles.previewImage}
            />
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isFormValid || isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? "Cadastrando..." : "Cadastrar Produto"}
      </button>
    </div>
  );
}