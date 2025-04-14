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

  const accessToken = "IGAAQf77IXublBZAE1PSjBwalFzZA3FiczlIbFAxVmpOeUVyRi1CMHZADb3JkSjJ2VExsbXpQVmZA6TTF6enYyTHFydGxtZAkd4dFF6NVZANSjNrclpZAMzFPQjlkN0kxQXgxcFpWV01CUDlwOE14Q09zcFlUMjJxQ3NnN3pDY2RTa3ZAsYwZDZD"; // Substitua pelo seu token

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const response = await axios.get(
          `https://graph.instagram.com/me/media?fields=id,media_type,media_url&access_token=${accessToken}`
        );
        setPosts(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar os posts:", error);
        setLoading(false);
      }
    };

    fetchInstagramPosts();
  }, [accessToken]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <section
      id="GaleriaInstagram"
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#f1f1f1"
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {posts.map((post) => (
          <div key={post.id} style={{ position: "relative", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
            {post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM" ? (
              <img
                src={post.media_url}
                alt="Post do Instagram"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "auto",
                  maxHeight: "400px",
                }}
              />
            ) : post.media_type === "VIDEO" ? (
              <video
                controls
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "auto",
                  maxHeight: "400px",
                }}
              >
                <source src={post.media_url} />
              </video>
            ) : null}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
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
