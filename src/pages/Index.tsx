import React from 'react';
import Analytics from '../../Analytics';
import { jwtDecode } from 'jwt-decode';

interface User {
    name?: string;
    email?: string;
    [key: string]: any; // allow other properties
}

const Index = () => {
    const token = localStorage.getItem('token');
    let user: User | null = null;

    if (token) {
        try {
            user = jwtDecode<User>(token);
        } catch (error) {
            console.error('Invalid token', error);
        }
    }

    return (
        <div className="p-4">
            {user ? (
                <>
                    <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
                    <p>Email: {user.email}</p>
                    <pre className="bg-gray-100 p-2 rounded mt-4 overflow-auto">{JSON.stringify(user, null, 2)}</pre>
                </>
            ) : (
                <p>Loading user data...</p>
            )}

            <Analytics />
        </div>
    );
};

export default Index;
