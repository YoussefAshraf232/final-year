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
import { GUEST_TOKEN } from "@/constants/auth";
import { tokenStorage } from "@/lib/tokenStorage";

// Define what the context provides
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    loginAsGuest: () => void;
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
                const storedToken = tokenStorage.getToken();
                const storedUser = tokenStorage.getUser<User>();

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(storedUser);
                }
            } catch {
                tokenStorage.clear();
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

            tokenStorage.setToken(newToken);
            tokenStorage.setUser(newUser);
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

    const loginAsGuest = useCallback(() => {
        if (process.env.NEXT_PUBLIC_ENABLE_GUEST_MODE !== "true") {
            return;
        }

        const guestUser: User = {
            id: 0,
            username: "Guest",
            email: "guest@demo.local",
            role: "EMPLOYEE",
            joinedAt: new Date().toISOString(),
            leftAt: null,
        };

        tokenStorage.setToken(GUEST_TOKEN);
        tokenStorage.setUser(guestUser);
        setToken(GUEST_TOKEN);
        setUser(guestUser);
        router.push("/dashboard");
    }, [router]);

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
                loginAsGuest,
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
