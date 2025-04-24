import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

// Helper function to decode JWT token payload without external library
function decodeJwt(token: string): any {
    try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodedPayload);
    } catch (e) {
        console.error('Failed to decode token', e);
        return null;
    }
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsValid(false);
                return;
            }

            try {
                const response = await fetch('/api/auth/validate', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (response.ok && data.valid === true) {
                    const decoded: any = decodeJwt(token);
                    if (decoded === null) {
                        setIsValid(false);
                        return;
                    }
                    if (allowedRoles && allowedRoles.some((role) => role.toLowerCase() === decoded.role.toLowerCase())) {
                        setIsValid(true);
                    } else if (!allowedRoles) {
                        setIsValid(true);
                    } else {
                        setIsValid(false);
                    }
                } else {
                    setIsValid(false);
                }
            } catch (err) {
                console.error('Validation error:', err);
                setIsValid(false);
            }
        };

        validateToken();
    }, [token, allowedRoles]);

    if (isValid === null) {
        return <div>Loading...</div>;
    }

    if (!isValid) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
