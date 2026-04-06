"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  profile_pic?: string | null;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const AuthProvider = ({
  serverUser,
  children,
}: {
  serverUser: User | null;
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(serverUser);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
