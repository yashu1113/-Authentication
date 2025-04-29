import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface UserData {
    name: string;
    email: string;
    profileImage: string | null;
}

interface UserContextType {
    user: UserData | null;
    setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
    fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                return;
            }
            const timestamp = new Date().getTime();
            const response = await fetch(`/api/auth/current-user?t=${timestamp}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store',
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return <UserContext.Provider value={{ user, setUser, fetchUserData }}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
