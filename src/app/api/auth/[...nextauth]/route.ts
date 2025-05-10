import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"; // ou o provedor que você quiser

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Aqui você faria a lógica para validar o usuário
        if (credentials?.email === "admin@email.com" && credentials.password === "1234") {
          return { id: "1", name: "Admin", email: "admin@email.com" };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/login', // opcional: para redirecionar a tela de login
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
