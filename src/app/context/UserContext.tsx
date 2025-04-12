"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../app/config/firebase";
import { doc, getDoc } from "firebase/firestore";

type Role = "admin" | "cliente" | null;

interface UserContextType {
  user: any;
  role: Role;
  loading: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  loading: true,
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const uid = firebaseUser.uid;

        const adminDoc = await getDoc(doc(db, "usuariosAdm", uid));
        if (adminDoc.exists()) {
          console.log("🔑 ADMIN identificado");
          setRole("admin");
        } else {
          console.log("👤 CLIENTE identificado");
          setRole("cliente");
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, role, loading }}>
      {children}
    </UserContext.Provider>
  );
}
