// src/features/auth/components/AuthForm.tsx
import React from 'react';

// 1. Define the props interface
interface AuthFormProps {
    isLogin: boolean;
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    error: string | null;
    isLoading: boolean;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

// 2. Apply the props interface
export function AuthForm({
    isLogin,
    setIsLogin,
    username,
    setUsername,
    password,
    setPassword,
    email,
    setEmail,
    error,
    isLoading,
    handleSubmit
}: AuthFormProps) {
    return (
        <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="username">
                        Usuario
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        // 3. Type the event handler inline
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                    />
                </div>
                
                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
                >
                    {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>
            </form>
            <div className="text-center mt-6">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-gray-600 hover:text-black"
                >
                    {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
}