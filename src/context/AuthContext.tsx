"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User, LoginRequest, RegisterRequest } from "@/types/user.types";
import { authService } from "@/services/auth.service";

// Define what the context provides
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const storedToken = localStorage.getItem("token");
                const storedUser = localStorage.getItem("user");

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    // Login
    const login = useCallback(
        async (data: LoginRequest) => {
            const response = await authService.login(data);
            const { token: newToken, user: newUser } = response.data.data;

            localStorage.setItem("token", newToken);
            localStorage.setItem("user", JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
            router.push("/dashboard");
        },
        [router]
    );

    // Register
    const register = useCallback(
        async (data: RegisterRequest) => {
            await authService.register(data);
            router.push("/login");
        },
        [router]
    );

    // Logout
    const logout = useCallback(() => {
        authService.logout();
        setToken(null);
        setUser(null);
        router.push("/login");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}