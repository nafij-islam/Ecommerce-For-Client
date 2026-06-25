'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ArrowRight, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setSubmitting(true);
      const success = await login(email, password);
      if (success) {
        router.push(redirectPath);
      }
    } catch {
      showToast('Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleMockLogin = async () => {
    try {
      // Firebase Mock Google payload
      const mockGooglePayload = {
        name: 'Feminine Fashionista',
        email: 'fashionista@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        firebaseUid: `google-uid-${Date.now()}`
      };

      const success = await loginWithGoogle(mockGooglePayload);
      if (success) {
        router.push(redirectPath);
      }
    } catch {
      showToast('Google sign-in error', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-[32px] border border-gray-100 shadow-sm text-center">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-playfair text-3xl font-bold text-brand-navy">Welcome Back</h2>
            <p className="text-gray-500 font-light text-xs sm:text-sm">
              Log in to access your dashboard, addresses, and wishlist.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                />
                <Mail className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                <Link href="#" className="text-xs font-semibold text-brand-coral hover:underline" onClick={() => showToast('Password reset link simulated.', 'info')}>
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
                />
                <Lock className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white py-3 rounded-full font-semibold shadow-xs flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-gray-300"
            >
              <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Google Mock login */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleGoogleMockLogin}
              className="w-full border border-gray-200 hover:bg-gray-50 text-brand-navy py-3 rounded-full text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
            >
              <User className="w-4 h-4 text-brand-coral" />
              <span>Login with Google (Firebase)</span>
            </button>

            <p className="text-sm text-gray-500 font-light">
              Don&apos;t have an account?{' '}
              <Link href={`/register?redirect=${redirectPath}`} className="text-brand-coral font-semibold hover:underline">
                Register Here
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Login Details...</div>}>
      <LoginContent />
    </Suspense>
  );
}
