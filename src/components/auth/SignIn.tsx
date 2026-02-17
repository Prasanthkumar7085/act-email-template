import { useRouter } from '@tanstack/react-router';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

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

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Email format is invalid';
        }
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
            await new Promise(resolve => setTimeout(resolve, 800));
            router.navigate({
                to: '/templates'
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
        const baseClasses = "w-full pl-11 pr-4 py-3 bg-white border rounded-lg text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 transition-all duration-200 text-sm";
        const errorClasses = errors[fieldName]
            ? "border-rose-400 focus:ring-rose-500/25 focus:border-rose-500 bg-rose-50/30"
            : "border-surface-200 focus:ring-brand-500/30 focus:border-brand-500 hover:border-surface-300";
        const disabledClasses = isSubmitting ? "opacity-50 cursor-not-allowed" : "";

        return `${baseClasses} ${errorClasses} ${disabledClasses}`;
    };

    return (
        <div className="min-h-screen bg-surface-50 flex">
            {/* Left side — branding panel */}
            <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-brand-950 relative overflow-hidden flex-shrink-0">
                {/* Decorative shapes */}
                <div className="absolute inset-0">
                    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-800/20 blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-brand-700/10 blur-3xl" />
                    <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-brand-600/10 blur-2xl" />
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/25">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold text-lg tracking-tight">Email Builder</span>
                    </div>

                    {/* Hero text */}
                    <div className="flex-1 flex flex-col justify-center py-12">
                        <h2 className="text-3xl xl:text-4xl font-bold text-white leading-[1.15] mb-5 tracking-tight">
                            Build beautiful emails,<br />effortlessly.
                        </h2>
                        <p className="text-brand-300/90 text-base leading-relaxed max-w-sm">
                            Design responsive email templates with our intuitive drag-and-drop builder. No coding required.
                        </p>

                        {/* Stats row */}
                        <div className="mt-12 flex items-center gap-8">
                            <div className="flex flex-col gap-1">
                                <div className="text-2xl font-bold text-white">50+</div>
                                <div className="text-brand-400 text-xs font-medium uppercase tracking-wider">Templates</div>
                            </div>
                            <div className="w-px h-10 bg-brand-800" />
                            <div className="flex flex-col gap-1">
                                <div className="text-2xl font-bold text-white">Drag & Drop</div>
                                <div className="text-brand-400 text-xs font-medium uppercase tracking-wider">Builder</div>
                            </div>
                            <div className="w-px h-10 bg-brand-800" />
                            <div className="flex flex-col gap-1">
                                <div className="text-2xl font-bold text-white">HTML</div>
                                <div className="text-brand-400 text-xs font-medium uppercase tracking-wider">Export</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer text */}
                    <p className="text-brand-600 text-xs">
                        Trusted by teams building better email experiences
                    </p>
                </div>
            </div>

            {/* Right side — sign in form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative overflow-hidden">
                {/* Subtle background layering */}
                <div className="absolute inset-0 bg-gradient-to-br from-surface-50 via-white to-surface-100/50" />
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.8) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />

                <div className="relative z-10 w-full max-w-[420px]">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-10 lg:hidden">
                        <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Mail className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-surface-900 font-semibold text-lg tracking-tight">Email Builder</span>
                    </div>

                    {/* Form card */}
                    <div className="bg-white rounded-2xl border border-surface-200/80 shadow-xl shadow-surface-900/5 p-8 sm:p-10">
                        <div className="mb-8">
                            <h1 className="text-2xl font-extrabold text-surface-900 mb-2 tracking-tight">
                                Welcome back
                            </h1>
                            <p className="text-surface-600 text-sm leading-relaxed">
                                Sign in to your account to continue building templates
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-surface-700 mb-2"
                                >
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={getInputClassName('email')}
                                        placeholder="you@example.com"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-rose-600 flex items-center gap-2 font-medium">
                                        <span className="w-1 h-1 bg-rose-500 rounded-full flex-shrink-0" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-surface-700"
                                    >
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 rounded"
                                        onClick={handleForgotPassword}
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`${getInputClassName('password')} !pr-11`}
                                        placeholder="Enter your password"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                                        onClick={togglePasswordVisibility}
                                        disabled={isSubmitting}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-rose-600 flex items-center gap-2 font-medium">
                                        <span className="w-1 h-1 bg-rose-500 rounded-full flex-shrink-0" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                                    w-full py-3.5 px-4 rounded-lg font-semibold text-sm
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                                    transition-all duration-200 flex items-center justify-center gap-2
                                    ${isSubmitting
                                        ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                                        : 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 active:translate-y-0'
                                    }
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            {errors.submit && (
                                <div className="rounded-lg bg-rose-50 p-4 border border-rose-200">
                                    <p className="text-sm text-rose-700 flex items-center gap-2 font-medium">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0" />
                                        {errors.submit}
                                    </p>
                                </div>
                            )}
                        </form>

                        <div className="mt-8 pt-6 border-t border-surface-100 text-center">
                            <p className="text-surface-600 text-sm">
                                Don't have an account?{' '}
                                <button
                                    className="text-brand-600 hover:text-brand-700 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 rounded"
                                    onClick={handleSignUp}
                                >
                                    Sign up
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-xs text-surface-400">
                        Protected by industry-standard encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;