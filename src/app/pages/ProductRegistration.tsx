import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const ProductRegistration = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [user] = useAuthState(auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.email !== "thifi.contato.oficial@gmail.com") {
      alert("Acesso negado. Apenas administradores podem cadastrar produtos.");
      return;
    }
    try {
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        imageUrl,
      });
      setName("");
      setPrice("");
      setImageUrl("");
      alert("Produto cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar produto: ", error);
    }
  };

  return (
    <div>
      <h1>Cadastro de Produtos</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
        <input type="number" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} required />
        <input type="text" placeholder="URL da Imagem" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Cadastrar</button>
      </form>
    </div>
  );
};

export default ProductRegistration;
