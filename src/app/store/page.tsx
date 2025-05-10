'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/config/firebase';
import styles from '../components/styles/store.module.css';
import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import Cart from '../components/cart';
import useCart from '../components/hooks/userCart';
import { Product } from '../type';

interface Store {
  id: string;
  name: string;
  address: string;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addItem } = useCart();
  const { cartItems } = useCart();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.uid) setUserId(user.uid);
  }, []);



  useEffect(() => {
    async function fetchData() {
      try {
        const [productSnap, storeSnap] = await Promise.all([
          getDocs(collection(db, 'produtos')),
          getDocs(collection(db, 'stores')),
        ]);

        const storesData: Store[] = storeSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          address: doc.data().address,
        }));

        const productsData: Product[] = productSnap.docs.map(doc => {
          const data = doc.data();
          const discount = data.discount ?? 0;
          const originalPrice = data.price ?? 0;
          const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

          return {
            id: doc.id,
            name: data.name,
            price: discountedPrice,
            originalPrice,
            discount,
            stock: data.stock ?? 0,
            description: data.description ?? '',
            categoryName: data.categoryName ?? '',
            storeIds: data.storeIds ?? [],
            ingredients: data.ingredients ?? '',
            brand: data.brand ?? '',
            brandImageUrl: data.brandImageUrl ?? '',
            url: data.url ?? '',
            rating: data.rating ?? Math.floor(Math.random() * 2) + 4,
          };
        });

        const uniqueCategories = Array.from(new Set(productsData.map(p => p.categoryName).filter(Boolean)));

        setProducts(productsData);
        setStores(storesData);
        setCategories(uniqueCategories);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    let updated = [...products];

    if (search) {
      const lowerSearch = search.toLowerCase();
      updated = updated.filter(product =>
        product.name.toLowerCase().includes(lowerSearch) ||
        product.description.toLowerCase().includes(lowerSearch) ||
        product.categoryName?.toLowerCase().includes(lowerSearch)
      );
    }

    if (categoryFilter) {
      updated = updated.filter(product => product.categoryName === categoryFilter);
    }

    if (storeFilter) {
      updated = updated.filter(product => product.storeIds.includes(storeFilter));
    }

    switch (sortOption) {
      case 'priceAsc':
        updated.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'priceDesc':
        updated.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'aToZ':
        updated.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'zToA':
        updated.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'mostSold':
        updated.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
        break;
    }

    setFilteredProducts(updated);
  }, [products, search, categoryFilter, storeFilter, sortOption]);

  const getStoreAddresses = (storeIds?: string[]) => {
    if (!storeIds?.length) return 'Nenhuma loja informada';
    return storeIds.map(id => {
      const store = stores.find(s => s.id === id);
      return store ? `${store.name} (${store.address})` : 'Loja desconhecida';
    }).join(', ');
  };

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#ffc107' : '#e4e5e9' }}>★</span>
    ));
  };

  const formatPrice = (price?: number) => `R$ ${(price ?? 0).toFixed(2)}`;

  const promocionais = products.filter(p => p.discount > 0);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) return <p>Carregando produtos...</p>;

  return (
    <div className={styles.container}>
      {isCartOpen && (
        <Cart cartItems={cartItems} onClose={() => setIsCartOpen(false)} />
      )}

      <div className={styles.topBar}>
        <Link href="/" className={styles.homeButton}>🏠 Home</Link>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="🔍 Buscar produtos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Todas as Categorias</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select className={styles.select} value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
          <option value="">Todas as Lojas</option>
          {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
        </select>
        <select className={styles.select} value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Ordenar por</option>
          <option value="priceAsc">Preço: Menor para Maior</option>
          <option value="priceDesc">Preço: Maior para Menor</option>
          <option value="aToZ">Nome: A-Z</option>
          <option value="zToA">Nome: Z-A</option>
          <option value="mostSold">Mais Vendidos</option>
        </select>
      </div>

      {promocionais.length > 0 && (
        <section className={styles.sliderWrapper}>
          <h2 className={styles.sliderTitle}>🔥 Promoções</h2>
          <Slider {...sliderSettings}>
            {promocionais.map(product => (
              <Link href={`/store/${product.id}`} key={product.id} className={styles.sliderCard}>
                <div>
                  {product.discount > 0 && <span className={styles.promotionLabel}>Promoção</span>}
                  <Image src={product.url || '/placeholder.png'} alt={`Imagem do produto ${product.name}`} width={150} height={150} className={styles.productImage} />
                  <h3>{product.name}</h3>
                  <p className={styles.discountPrice}>{formatPrice(product.price)}</p>
                  <p className={styles.originalPrice}>De: {formatPrice(product.originalPrice)}</p>
                  <div>{renderStars(product.rating)}</div>
                </div>
              </Link>
            ))}
          </Slider>
        </section>
      )}

      <div className={styles.grid}>
        {filteredProducts.map(product => (
          <div key={product.id} className={styles.card}>
            <div className={styles.cardContent}>
              <Link href={`/store/${product.id}`} className={styles.cardLink}>
                <Image src={product.url || '/placeholder.png'} alt={`Imagem do produto ${product.name}`} width={200} height={200} className={styles.productImage} />
                <h2 className={styles.name}>{product.name}</h2>
                {product.discount ? (
                  <>
                    <p className={styles.discountPrice}>{formatPrice(product.price)}</p>
                    <p className={styles.originalPrice}>De: {formatPrice(product.originalPrice)}</p>
                  </>
                ) : (
                  <p className={styles.price}>{formatPrice(product.price)}</p>
                )}
                <div>{renderStars(product.rating)}</div>
                <p className={styles.stock}><strong>Estoque:</strong> {product.stock}</p>
                <p className={styles.storeInfo}>
                  <strong>Lojas:</strong> {getStoreAddresses(product.storeIds)}
                </p>
              </Link>
              <button
                onClick={() => addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price ?? 0,
                  quantity: 1,
                  image: product.url || '/placeholder.png',
                })}
                className={styles.addToCartButton}
              >
                🛒 Adicionar ao Carrinho
              </button>
            </div>
          </div>
        ))}
      </div>

      {!filteredProducts.length && (
        <p className={styles.emptyMessage}>Nenhum produto encontrado com os filtros selecionados.</p>
      )}

      <button className={styles.floatingCartButton} onClick={() => setIsCartOpen(!isCartOpen)}>
        🛒
      </button>
    </div>
  );
}
