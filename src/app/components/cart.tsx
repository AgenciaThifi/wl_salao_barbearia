'use client';

import useCart from '../components/hooks/userCart';
import styles from './styles/cart.module.css';
import Link from 'next/link'; // Importante

export default function Cart({ onClose }: { onClose?: () => void }) {
  const { cartItems, loading, removeItem, incrementItem, decrementItem, userEmail } = useCart();

  if (loading) {
    return <div className={styles.cartPanel}>Carregando...</div>;
  }

  const total = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
    0
  );

  return (
    <div className={styles.cartPanel}>
      <div className={styles.cartHeader}>
        <h2>Carrinho: {userEmail ? userEmail : 'Carregando...'}</h2>

        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ✖
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <p className={styles.emptyText}>Seu carrinho está vazio.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <Link href={`/store/${item.id}`} className={styles.cartItemLink}>
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  className={styles.cartItemImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.png';
                  }}
                />
              </Link>
              <div className={styles.cartItemInfo}>
                <Link href={`/store/${item.id}`} className={styles.itemName}>
                  <p><strong>{item.name}</strong></p>
                </Link>
                <p className={styles.itemDetail}>
                  Preço: R$ {item.price?.toFixed(2) ?? '0.00'}
                </p>
                <div className={styles.quantityControls}>
                  <button onClick={() => decrementItem(item.id)} className={styles.qtyButton}>−</button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button onClick={() => incrementItem(item.id)} className={styles.qtyButton}>+</button>
                </div>
                <button
                  className={styles.removeButton}
                  onClick={() => removeItem(item.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}

          <p className={styles.totalPrice}>
            Total: R$ {total.toFixed(2)}
          </p>
          <button className={styles.checkoutButton}>Finalizar Compra</button>
        </>
      )}
    </div>
  );
}
