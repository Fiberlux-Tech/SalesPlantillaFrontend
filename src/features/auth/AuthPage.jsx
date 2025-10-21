import React, { useState } from 'react';
import { AuthForm } from './components/AuthForm'; // Import the new component

// This component remains "smart." It handles all state and logic.
export default function AuthPage({ onLogin, onRegister }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            if (isLogin) {
                await onLogin(username, password);
            } else {
                await onRegister(username, email, password);
            }
        } catch (err) {
            setError(err.message);
        }
        setIsLoading(false);
    };

    // The render is now just a wrapper that passes props
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            {/* We pass all state and handlers down to the form component.
              This is a standard and very clean React pattern.
            */}
            <AuthForm
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                email={email}
                setEmail={setEmail}
                error={error}
                isLoading={isLoading}
                handleSubmit={handleSubmit}
            />
        </div>
    );
}