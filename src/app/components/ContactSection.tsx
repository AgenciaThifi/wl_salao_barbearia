import React from 'react';
import Contact from './Contact';

const ContactSection: React.FC = () => {
  return (
    <section id="contato" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">Contato</h2>
        <Contact />
      </div>
    </section>
  );
};

export default ContactSection;