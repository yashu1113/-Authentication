import React from 'react';

interface ErrorProps {
    message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
    return (
        <div style={{ color: 'red', textAlign: 'center' }}>
            <h1>Error</h1>
            <p>{message}</p>
        </div>
    );
};

export default Error;
