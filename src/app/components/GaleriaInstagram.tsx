import React, { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  id: string;
  media_type: string;
  media_url: string;
}

const GaleriaInstagram: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);

// O token é carregado a partir do arquivo .env
const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("Access token não encontrado. Verifique o arquivo .env.");
    return null;
  }

  
  // Número de posts para carregar inicialmente
  const initialLimit = 6;

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const response = await axios.get(
          `https://graph.instagram.com/me/media?fields=id,media_type,media_url&access_token=${accessToken}&limit=${initialLimit}`
        );
        setPosts(response.data.data);
        if (response.data.paging && response.data.paging.next) {
          setNextPageUrl(response.data.paging.next);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar os posts:", error);
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, [accessToken]);

  const handleLoadMore = async () => {
    if (!nextPageUrl) return; // não há mais posts para carregar

    try {
      const response = await axios.get(nextPageUrl);
      setPosts(prevPosts => [...prevPosts, ...response.data.data]);
      if (response.data.paging && response.data.paging.next) {
        setNextPageUrl(response.data.paging.next);
      } else {
        setNextPageUrl(null);
      }
    } catch (error) {
      console.error("Erro ao carregar mais posts:", error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <section
      id="GaleriaInstagram"
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#f1f1f1",
      }}
    >
      <h2 style={{ color: "#C19228", fontWeight: "bold" }}>Agência ThiFi</h2>
      <a
        href="https://www.instagram.com/thifi.agency/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          textDecoration: "none",
          color: "#000",
        }}
      >
        <img src="Instagram_icon.png" alt="Instagram" width={30} height={30} />
        <span style={{ marginLeft: "8px", fontWeight: "bold" }}>ThiFi</span>
      </a>

      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "20px",
          padding: "20px 0",
          scrollSnapType: "x mandatory",
        }}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            style={{
              minWidth: "320px",
              flex: "0 0 auto",
              position: "relative",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              scrollSnapAlign: "start",
            }}
          >
            {post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM" ? (
              <img
                src={post.media_url}
                alt="Post do Instagram"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "400px",
                  borderRadius: "10px",
                }}
              />
            ) : post.media_type === "VIDEO" ? (
              <video
                controls
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "400px",
                  borderRadius: "10px",
                }}
              >
                <source src={post.media_url} />
              </video>
            ) : null}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        {nextPageUrl && (
          <button
            onClick={handleLoadMore}
            style={{
              padding: "10px 15px",
              marginRight: "10px",
              background: "#000",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Carregar mais
          </button>
        )}
        <a href="https://www.instagram.com/thifi.agency/" target="_blank" rel="noopener noreferrer">
          <button
            style={{
              padding: "10px 15px",
              background: "#0095F6",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Seguir no Instagram
          </button>
        </a>
      </div>
    </section>
  );
};

export default GaleriaInstagram;
