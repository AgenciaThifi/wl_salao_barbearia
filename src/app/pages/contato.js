"use client";
import Contact from "../components/Contact";  // Importando o componente Contact

export default function Contato() {
  const contactInfo = {
    address: "Rua Exemplo, 123 - Cidade, Estado", // Endereço da empresa
    phone: "+55 61 98254-1672",                  // Telefone da empresa
    socialLinks: [
      { name: "facebook", url: "https://facebook.com/thifi" },
      { name: "instagram", url: "https://instagram.com/thifi" }
    ],
    hours: "Segunda a Sexta - 9:00 às 18:00",      // Horário de funcionamento
  };

  return (
    <div>
      <header>
        <h1>Contato</h1>
      </header>

      <main>
        <section id="contato">
          <Contact {...contactInfo} />
        </section>
      </main>
    </div>
  );
}
