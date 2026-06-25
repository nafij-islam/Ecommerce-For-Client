'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Your message has been sent!', 'success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        showToast(data.error || 'Failed to send message', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h1 className="font-playfair text-4xl font-extrabold text-brand-navy text-center mb-4">Contact Us</h1>
        <div className="h-1 w-12 bg-brand-coral mx-auto rounded-full mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Info Details */}
          <div className="space-y-6">
            <h3 className="font-playfair text-2xl font-bold text-brand-navy">Get in Touch</h3>
            <p className="text-gray-500 font-light leading-relaxed">
              Have questions about sizing, customization, or shipping? Feel free to contact our customer care team.
            </p>

            <ul className="space-y-6 text-sm text-gray-600 font-light">
              <li className="flex items-center gap-4">
                <div className="bg-brand-pink p-3 rounded-xl text-brand-coral">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="bg-brand-pink p-3 rounded-xl text-brand-coral">
                  <Phone className="w-5 h-5" />
                </div>
                <span>+8801700000000</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="bg-brand-pink p-3 rounded-xl text-brand-coral">
                  <Mail className="w-5 h-5" />
                </div>
                <span>contact@antigravity-fashion.com</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-[32px] border border-gray-100 shadow-xs space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-coral bg-gray-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-brand-navy hover:bg-brand-coral text-white px-8 py-3 rounded-full text-xs font-semibold shadow-xs flex items-center gap-2 transition-all uppercase tracking-wider disabled:bg-gray-300"
            >
              <span>{submitting ? 'Sending...' : 'Send Message'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      </main>
      <Footer />
    </div>
  );
}
