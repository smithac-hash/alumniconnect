import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, KeyRound, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const navigate = useNavigate();

    // Countdown Timer for OTP
    useEffect(() => {
        let timer;
        if (step === 2 && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    const handleRequestOTP = async (e) => {
        e?.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setSuccess(data.message);
            setStep(2);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            return setError('Please enter a valid 6-digit OTP.');
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
            setSuccess(data.message);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            return setError('Password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/reset-password', { email, password });
            setSuccess(data.message);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-4 bg-slate-50">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-card p-8 relative overflow-hidden"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        {step === 1 && <Mail className="w-8 h-8" />}
                        {step === 2 && <KeyRound className="w-8 h-8" />}
                        {step === 3 && <Lock className="w-8 h-8" />}
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {step === 1 && 'Forgot Password'}
                        {step === 2 && 'Verify OTP'}
                        {step === 3 && 'Create New Password'}
                    </h1>
                    <p className="text-slate-500">
                        {step === 1 && "Enter your registered email address to receive an OTP."}
                        {step === 2 && `We've sent a 6-digit code to ${email}`}
                        {step === 3 && "Your new password must be different from previously used passwords."}
                    </p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                        {error}
                    </motion.div>
                )}

                {success && step === 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mb-6 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100">
                        {success} Redirecting to login...
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleRequestOTP} className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field pl-12"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" disabled={loading || !email} className="btn-primary w-full flex items-center justify-center h-12 gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                            </button>

                            <p className="text-center text-sm text-slate-500 mt-6">
                                Remember your password? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
                            </p>
                        </motion.form>
                    )}

                    {/* STEP 2: VERIFY OTP */}
                    {step === 2 && (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleVerifyOTP} className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">6-Digit OTP</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="text"
                                        required
                                        maxLength="6"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allow numbers
                                        className="input-field pl-12 text-center tracking-[0.5em] text-lg font-bold"
                                        placeholder="••••••"
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full flex items-center justify-center h-12 gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                            </button>

                            <div className="flex flex-col items-center gap-2 mt-6">
                                <p className="text-sm text-slate-500">
                                    Didn't receive the code? 
                                    {countdown > 0 ? (
                                        <span className="text-slate-400 ml-1">Resend in {countdown}s</span>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={handleRequestOTP} 
                                            className="text-blue-600 font-bold ml-1 hover:underline disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </p>
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 mt-2">
                                    <ArrowLeft className="w-3 h-3" /> Change Email
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {/* STEP 3: RESET PASSWORD */}
                    {step === 3 && (
                        <motion.form 
                            key="step3"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleResetPassword} className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field pl-12 pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field pl-12"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            
                            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center h-12 gap-2">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
