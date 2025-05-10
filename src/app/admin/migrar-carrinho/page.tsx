// src/app/admin/migrar-carrinho/page.tsx
'use client';

import { migrarCarrinhoAntigoParaNovo } from '@/utils/migrarCarrinho';

export default function MigrarCarrinhoPage() {
  const handleMigrar = async () => {
    await migrarCarrinhoAntigoParaNovo();
    alert('Migração finalizada!');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🔄 Migrar Carrinho Antigo</h1>
      <button onClick={handleMigrar}>Iniciar Migração</button>
    </div>
  );
}
