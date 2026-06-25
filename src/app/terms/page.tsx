import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <h1 className="font-playfair text-3xl font-extrabold text-brand-navy">Terms & Conditions</h1>
        <div className="h-1 w-12 bg-brand-coral rounded-full"></div>

        <div className="space-y-4 text-gray-600 font-light leading-relaxed text-sm sm:text-base">
          <p>
            Welcome to Antigravity Fashion. By browsing or purchasing from our platform, you agree to comply with these terms.
          </p>

          <h3 className="font-semibold text-brand-navy pt-4">User Accounts</h3>
          <p>
            You are responsible for safeguarding your login credentials. Blocked accounts will be restricted from purchasing or accessing active orders.
          </p>

          <h3 className="font-semibold text-brand-navy pt-4">Pricing & Inventory</h3>
          <p>
            Dresses and variant sizes are subject to real-time stock checks. If an item runs out of stock before payment processing completes, the order will be updated accordingly.
          </p>

          <h3 className="font-semibold text-brand-navy pt-4">Intellectual Property</h3>
          <p>
            Brand names, design patterns, models, logos, and custom graphics are owned by Antigravity Fashion.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
