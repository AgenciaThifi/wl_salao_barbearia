// src/app/components/Contact.js
import React from "react";

const Contact = ({ address, phone, socialLinks, hours }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("API key não encontrada!");
    return null;
  }

  return (
    <div
      className="contact"
      style={{
        color: "#333", // texto escuro
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div className="map" style={{ marginBottom: "1rem" }}>
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(
            address
          )}&key=${apiKey}`}
          width="100%"
          height="200"
          frameBorder="0"
          style={{ border: 0, borderRadius: "8px" }}
          allowFullScreen
          loading="lazy"
          title="Localização"
        />
      </div>
      <div className="contact-info" style={{ lineHeight: 1.5 }}>
        <p>
          <strong>Endereço:</strong> {address}
        </p>
        <p>
          <strong>Telefone:</strong>{" "}
          <a href={`tel:${phone}`} style={{ color: "#0070f3" }}>
            {phone}
          </a>
        </p>
        <p>
          <strong>Horário de Funcionamento:</strong> {hours}
        </p>
        <div className="social-links" style={{ marginTop: "0.5rem" }}>
          {socialLinks.map((link) => (
            <a
              href={link.url}
              key={link.name}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: "1rem", color: "#0070f3", fontSize: "1.2rem" }}
            >
              <i className={`social-icon ${link.name}`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
