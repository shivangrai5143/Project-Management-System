import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        const result = await signup(name, email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Decorative */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
                    {/* Decorative elements */}
                    <div className="absolute top-40 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-40 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold text-white mb-4">
                                Start Your Journey<br />Today
                            </h2>
                            <p className="text-xl text-white/80 max-w-md mx-auto">
                                Join thousands of teams who trust ProManager to deliver their projects successfully.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            ProManager
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
                    <p className="text-slate-400 mb-8">Get started with your free account</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            type="text"
                            icon={User}
                            placeholder="Shivang Rai"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            icon={Mail}
                            placeholder="shivang123@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            icon={Lock}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            icon={Lock}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            loading={isLoading}
                            icon={ArrowRight}
                            iconPosition="right"
                        >
                            Create Account
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
