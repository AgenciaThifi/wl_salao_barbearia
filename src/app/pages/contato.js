"use client";
import Contact from "../components/Contact"; // Importa o componente Contact

export default function Contato() {
  const contactInfo = {
    address: "Quadra 205 Águas Claras, Brasília", // Endereço da empresa
    phone: "+55 61 98254-1672", // Telefone da empresa
    socialLinks: [
      { name: "facebook", url: "https://facebook.com/thifi" },
      { name: "instagram", url: "https://instagram.com/thifi" }
    ],
    hours: "Segunda a Sexta - 9:00 às 18:00", // Horário de funcionamento
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Contato</h1>
      <Contact {...contactInfo} />
    </div>
  );
}
