'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/app/config/firebase';
import { Product } from '../../type';
import Image from 'next/image';
import styles from '@/app/components/styles/productID.module.css';
import useCart from '../../components/hooks/userCart';
import Cart from '../../components/cart';
import Slider from 'react-slick';
import Link from 'next/link';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{ email: string; text: string }[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'produtos', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const discount = data.discount || 0;
          const originalPrice = data.price;
          const price = discount ? originalPrice * (1 - discount / 100) : originalPrice;

          const productData = {
            id: docSnap.id,
            name: data.name,
            price,
            originalPrice,
            discount,
            stock: data.stock,
            description: data.description,
            categoryName: data.categoryName,
            storeIds: data.storeIds,
            ingredients: Array.isArray(data.ingredients) ? data.ingredients.join(', ') : (data.ingredients || ''),
            brand: data.brand,
            brandImageUrl: data.brandImageUrl,
            url: data.url,
            rating: data.rating || 0,
          };
          setProduct(productData);
          setComments(data.comments || []);

          if (userEmail && data.ratings) {
            const existingRating = data.ratings.find((r: any) => r.email === userEmail);
            if (existingRating) setUserRating(existingRating.stars);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPromos = async () => {
      const snap = await getDocs(collection(db, 'produtos'));
      const items: Product[] = snap.docs
        .map(doc => {
          const data = doc.data();
          const discount = data.discount || 0;
          const originalPrice = data.price;
          const price = discount ? originalPrice * (1 - discount / 100) : originalPrice;

          return {
            id: doc.id,
            name: data.name,
            price,
            originalPrice,
            discount,
            stock: data.stock,
            description: data.description,
            categoryName: data.categoryName,
            storeIds: data.storeIds,
            ingredients: Array.isArray(data.ingredients) ? data.ingredients.join(', ') : (data.ingredients || ''),
            brand: data.brand,
            brandImageUrl: data.brandImageUrl,
            url: data.url,
            rating: data.rating || 0,
          };
        })
        .filter(p => p.id !== id && p.discount > 0);

      setPromoProducts(items);
    };

    fetchProduct();
    fetchPromos();
  }, [id, userEmail]);

  const addToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      quantity: 1,
      image: product.url || '/placeholder.png',
    });
    alert(`${product.name} foi adicionado ao carrinho!`);
  };

  const handleCommentSubmit = async () => {
    if (!userEmail || !comment.trim()) {
      alert('Você precisa estar logado e escrever algo para comentar.');
      return;
    }

    const newComment = { email: userEmail, text: comment.trim() };

    try {
      const productRef = doc(db, 'produtos', id as string);
      await updateDoc(productRef, {
        comments: arrayUnion(newComment),
      });
      setComments(prev => [...prev, newComment]);
      setComment('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      alert('Erro ao enviar comentário.');
    }
  };

  const handleStarClick = async (stars: number) => {
    if (!userEmail) {
      alert('Você precisa estar logado para avaliar o produto.');
      return;
    }

    const docRef = doc(db, 'produtos', id as string);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    const ratings = data.ratings || [];

    const filtered = ratings.filter((r: any) => r.email !== userEmail);
    const updatedRatings = [...filtered, { email: userEmail, stars }];
    const average = updatedRatings.reduce((acc, curr) => acc + curr.stars, 0) / updatedRatings.length;

    await updateDoc(docRef, {
      ratings: updatedRatings,
      rating: parseFloat(average.toFixed(1)),
    });

    setUserRating(stars);
    setProduct(prev => prev ? { ...prev, rating: parseFloat(average.toFixed(1)) } : null);
  };

  const renderStars = (rating: number, interactive = false) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={interactive ? () => handleStarClick(i) : undefined}
          style={{
            color: i <= (interactive ? userRating || 0 : fullStars) ? '#f5a623' : '#ccc',
            cursor: interactive ? 'pointer' : 'default',
            fontSize: '24px',
            marginRight: '4px',
          }}
        >★</span>
      );
    }
    return stars;
  };

  if (loading) return <p>Carregando...</p>;
  if (!product) return <p>Produto não encontrado.</p>;

  return (
    <div className={styles.container}>
      {/* Navegação */}
      <div className={styles.navigationButtons}>
        <Link href="/store"><button className={styles.navButton}>← Voltar para Loja</button></Link>
        <Link href="/"><button className={styles.navButton}>🏠 Página Principal</button></Link>
      </div>

      {/* Detalhes do Produto */}
      <h1 className={styles.title}>{product.name}</h1>
      <div className={styles.imageContainer}>
        <Image src={product.url || '/placeholder.png'} alt={product.name} width={300} height={300} className={styles.image} />
      </div>

      <p><strong>Categoria:</strong> {product.categoryName}</p>
      <p><strong>Preço original:</strong> R$ {product.originalPrice.toFixed(2)}</p>
      <p><strong>Desconto:</strong> {product.discount}%</p>
      <p><strong>Preço com desconto:</strong> R$ {product.price.toFixed(2)}</p>
      <p><strong>Estoque:</strong> {product.stock}</p>
      <p><strong>Descrição:</strong> {product.description}</p>
      <p><strong>Ingredientes:</strong> {product.ingredients || 'Não informado'}</p>
      <p><strong>Marca:</strong> {product.brand}</p>
      {product.brandImageUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <Image src={product.brandImageUrl} alt={product.brand} width={120} height={60} style={{ objectFit: 'contain' }} />
        </div>
      )}
      <p><strong>Avaliação:</strong> {renderStars(product.rating)} ({product.rating.toFixed(1)})</p>

      {userEmail && (
        <div>
          <p><strong>Avalie este produto:</strong></p>
          {renderStars(product.rating, true)}
        </div>
      )}

      <button className={styles.cartButton} onClick={addToCart}>Adicionar ao carrinho</button>

      {/* Promoções */}
      {promoProducts.length > 0 && (
        <div className={styles.promotionsSection}>
          <h2>🔥 Produtos em Promoção</h2>
          <Slider
            dots
            infinite
            speed={500}
            slidesToShow={3}
            slidesToScroll={1}
            autoplay
            autoplaySpeed={4000}
            responsive={[
              { breakpoint: 1024, settings: { slidesToShow: 2 } },
              { breakpoint: 768, settings: { slidesToShow: 1 } },
            ]}
          >
            {promoProducts.map(p => (
              <Link key={p.id} href={`/store/${p.id}`} className={styles.sliderCard}>
                <div>
                  <Image src={p.url || '/placeholder.png'} alt={p.name} width={150} height={150} />
                  <h3>{p.name}</h3>
                  <p>R$ {p.price?.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </Slider>
        </div>
      )}

      {/* Comentários */}
      <div className={styles.commentsSection}>
        <h2>Comentários</h2>
        <div className={styles.commentForm}>
          <textarea
            placeholder="Escreva seu comentário..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '0.5rem' }}
          />
          <button onClick={handleCommentSubmit} className={styles.cartButton}>Enviar Comentário</button>
        </div>

        {comments.length > 0 ? (
          <ul className={styles.commentList}>
            {comments.map((c, index) => (
              <li key={index} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
                <p><strong>{c.email}</strong></p>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Seja o primeiro a comentar!</p>
        )}
      </div>

      {/* Carrinho Flutuante */}
      <button className={styles.floatingCartButton} onClick={() => setIsCartOpen(!isCartOpen)}>🛒</button>
      {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}
