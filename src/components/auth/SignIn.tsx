import { useRouter } from '@tanstack/react-router';
import React, { useState, ChangeEvent, FormEvent } from 'react';

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    submit?: string;
}

const SignIn: React.FC = () => {
    const router = useRouter()
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Email format is invalid';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.navigate({
                to: '/builder'
            })
        } catch (error) {
            console.error('Sign in error:', error);
            setErrors({ submit: 'Failed to sign in. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = (): void => {
        setShowPassword(!showPassword);
    };

    const handleForgotPassword = (): void => {
        alert('Password reset feature coming soon!');
    };

    const handleSignUp = (): void => {
        alert('Sign up feature coming soon!');
    };

    const getInputClassName = (fieldName: keyof FormErrors): string => {
        const baseClasses = "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200";
        const errorClasses = errors[fieldName]
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:ring-blue-200 focus:border-blue-500";
        const disabledClasses = isSubmitting ? "bg-gray-100 cursor-not-allowed" : "";

        return `${baseClasses} ${errorClasses} ${disabledClasses}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl text-white">✉️</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 ml-3">
                                Email Template
                            </h1>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-gray-600">
                            Sign in to your account to continue building amazing email templates
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={getInputClassName('email')}
                                placeholder="your@email.com"
                                disabled={isSubmitting}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                                    onClick={handleForgotPassword}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`${getInputClassName('password')} pr-12`}
                                    placeholder="Enter your password"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                                    onClick={togglePasswordVisibility}
                                    disabled={isSubmitting}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                w-full py-3 px-4 rounded-lg font-semibold text-white 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                transition-all duration-200
                ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 focus:ring-purple-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                }
              `}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {errors.submit && (
                            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                                <p className="text-sm text-red-600 flex items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                                    {errors.submit}
                                </p>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <button
                                className="text-blue-600 hover:text-blue-500 font-semibold transition-colors duration-200 focus:outline-none focus:underline"
                                onClick={handleSignUp}
                            >
                                Sign up here
                            </button>
                        </p>
                    </div>

                    {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Demo Credentials:
                        </h4>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>Email: demo@emailtemplate.pro</p>
                            <p>Password: demo1234</p>
                        </div>
                    </div> */}
                </div>

                {/* Additional Info */}
                <div className="text-center mt-6">
                    <p className="text-white text-sm opacity-80">
                        Build beautiful email templates with our drag-and-drop editor
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;