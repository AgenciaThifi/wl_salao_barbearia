import { db, storage } from "@/app/config/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const addProduct = async (
  name: string,
  description: string,
  price: string,
  stock: string,
  imageFile: File | null
) => {
  if (!name || !description || !price || !stock || !imageFile) {
    throw new Error("Preencha todos os campos!");
  }

  try {
    // Upload da imagem
    const storageRef = ref(storage, `produtos/${Date.now()}-${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    // Salvando no Firestore
    await addDoc(collection(db, "produtos"), {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      imageUrl,
    });

    return "Produto cadastrado com sucesso!";
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    throw new Error("Erro ao cadastrar produto!");
  }
};
