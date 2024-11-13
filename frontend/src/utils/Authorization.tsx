import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextProps {
    isAuthenticated: boolean;
    accessToken: string | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const Authorization: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem("spotifyAccessToken");
        const expiryTime = sessionStorage.getItem("spotifyTokenExpiry");

        if (token && expiryTime) {
            const now = new Date().getTime();
            if (parseInt(expiryTime, 10) > now) {
                setAccessToken(token);
            } else {
                sessionStorage.removeItem("spotifyAccessToken");
                sessionStorage.removeItem("spotifyTokenExpiry");
                setAccessToken(null);
            }
        }
    }, []);

    const logout = () => {
        sessionStorage.removeItem("spotifyAccessToken");
        sessionStorage.removeItem("spotifyTokenExpiry");
        setAccessToken(null);

        window.location.href = "/";
    };

    const isAuthenticated = !!accessToken;

    return (
        <AuthContext.Provider value={{ isAuthenticated, accessToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
