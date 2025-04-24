import { jwtDecode } from 'jwt-decode';

export const getUserRole = (): string | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decoded = jwtDecode<{ role: string }>(token);
        return decoded.role;
    } catch (error) {
        console.error('Invalid token', error);
        return null;
    }
};
