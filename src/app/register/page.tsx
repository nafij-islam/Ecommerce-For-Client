'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, User, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    // Password strength check
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < 6 || !hasUpper || !hasLower || !hasNumber) {
      showToast('Password must be at least 6 characters and contain uppercase, lowercase, and numbers.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const success = await register(name, email, password);
      if (success) {
        router.push(redirectPath);
      }
    } catch {
      showToast('Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#333333] font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF9F5]">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-[32px] border border-gray-150 shadow-sm text-center">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#2C3E50]">Create Account</h2>
            <p className="text-gray-500 font-light text-xs sm:text-sm">
              Register to save addresses, track orders, and write product reviews.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#4A148C] focus:border-[#4A148C] bg-white text-[#333333]"
                />
                <User className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#4A148C] focus:border-[#4A148C] bg-white text-[#333333]"
                />
                <Mail className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters, A-Z, a-z, 0-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#4A148C] focus:border-[#4A148C] bg-white text-[#333333]"
                />
                <Lock className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Password Criteria Notice */}
            <div className="flex items-start gap-2 bg-purple-50 p-3.5 rounded-xl text-[11px] text-gray-500 font-light border border-[#4A148C]/10">
              <ShieldCheck className="w-4.5 h-4.5 text-[#4A148C] flex-shrink-0" />
              <p>Password must be at least 6 characters, and contain at least one uppercase, one lowercase letter, and one number.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#4A148C] hover:bg-[#5C2C7A] text-white py-3 rounded-full font-semibold shadow-xs flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-gray-300"
            >
              <span>{submitting ? 'Registering Account...' : 'Register'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Login Link */}
          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500 font-light">
            Already have an account?{' '}
            <Link href={`/login?redirect=${redirectPath}`} className="text-[#4A148C] font-semibold hover:underline">
              Login here
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Registration Form...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
