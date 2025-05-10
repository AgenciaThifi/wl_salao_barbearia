// src/utils/migrarCarrinho.ts
import { db } from '@/app/config/firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc
} from 'firebase/firestore';

// Função para migrar os dados
export async function migrarCarrinhoAntigoParaNovo() {
  const usuariosRef = collection(db, 'usuarios');
  const usuariosSnapshot = await getDocs(usuariosRef);

  for (const usuarioDoc of usuariosSnapshot.docs) {
    const userId = usuarioDoc.id;
    const carrinhoRef = collection(db, `usuarios/${userId}/carrinho`);
    const carrinhoSnapshot = await getDocs(carrinhoRef);

    for (const item of carrinhoSnapshot.docs) {
      const dadosItem = item.data();
      const produtoId = dadosItem.produtoId;

      // Confirma se o produto ainda existe
      const produtoRef = doc(db, 'produtos', produtoId);
      const produtoSnap = await getDoc(produtoRef);
      if (!produtoSnap.exists()) {
        console.warn(`Produto ${produtoId} não encontrado, pulando...`);
        continue;
      }

      // Adiciona na nova coleção "Cart"
      await addDoc(collection(db, 'Cart'), {
        userId,
        produtoId,
        quantidade: dadosItem.quantidade || 1,
      });

      console.log(`Item ${produtoId} migrado para Cart para o usuário ${userId}`);
    }
  }

  console.log('✅ Migração concluída!');
}
