const Contact = ({ address, phone, socialLinks, hours }) => {
  const apiKey = "AIzaSyCId3SHkxs7Qy485D8H9IxIRbwRyOz0XXI"; // substitua aqui

  return (
    <div className="contact">
      <div className="map">
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(
            address
          )}&key=${apiKey}`}
          width="100%"
          height="450"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Localização"
        />
      </div>
      <div className="contact-info">
        <p>
          <strong>Endereço:</strong> {address}
        </p>
        <p>
          <strong>Telefone:</strong> <a href={`tel:${phone}`}>{phone}</a>
        </p>
        <div className="social-links">
          {socialLinks.map((link) => (
            <a
              href={link.url}
              key={link.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className={`social-icon ${link.name}`} />
            </a>
          ))}
        </div>
        <p>
          <strong>Horário de Funcionamento:</strong> {hours}
        </p>
      </div>
    </div>
  );
};

export default Contact;
