import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IRootState } from '../store';
import { useSelector } from 'react-redux';

interface ProtectedRouteProps {
    children?: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch('/api/auth/validate', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                const data = await response.json();

                if (response.ok && data.valid === true) {
                    setIsValid(true);
                } else {
                    throw new Error(data.message || 'Invalid token');
                }
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                setIsValid(false);
            }
        };

        // Immediately validate if token exists
        if (token) {
            validateToken();
        } else {
            // No token - immediately invalid
            setIsValid(false);
        }
    }, [token, window.location.pathname]); // Re-run when route changes

    // Immediately redirect if no token exists
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Show loading state while validating
    if (isValid === null) {
        return <div>Loading...</div>;
    }

    // Redirect if validation failed
    if (!isValid) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
