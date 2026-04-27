"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { supabase } from "@/lib/supabase";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  profile_pic?: string | null;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const AuthProvider = ({
  serverUser,
  children,
}: {
  serverUser: User | null;
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(serverUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Immediately resolve if serverUser was passed from server
    if (serverUser) {
      setUser(serverUser);
      setLoading(false);
      return;
    }

    // Fallback: check session client-side
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          profile_pic: session.user.user_metadata?.profile_pic,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            profile_pic: session.user.user_metadata?.profile_pic,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

