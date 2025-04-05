export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          color: "#000",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {children}
      </div>
    );
  }
  