import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <h1 className="font-playfair text-3xl font-extrabold text-brand-navy">Privacy Policy</h1>
        <div className="h-1 w-12 bg-brand-coral rounded-full"></div>

        <div className="space-y-4 text-gray-600 font-light leading-relaxed text-sm sm:text-base">
          <p>
            Your privacy is highly important to us. We secure your session and customer data using HTTP-only secure cookie tokens and SSL encryption.
          </p>

          <h3 className="font-semibold text-brand-navy pt-4">Data Collection</h3>
          <p>
            We collect basic contact details (name, email, phone number, shipping address) when you register an account or place an order.
          </p>

          <h3 className="font-semibold text-brand-navy pt-4">Cookies & Storage</h3>
          <p>
            We utilize standard localStorage caching to remember your wishlist and shopping cart products when browsing as a guest. Session cookies are strictly used to secure user authorization.
          </p>

          <h3 className="font-semibold text-brand-navy pt-4">Security</h3>
          <p>
            MongoDB connection strings, JWT keys, and third-party image upload API keys are hidden on the backend server environment variables, preventing client-side data leaks.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
