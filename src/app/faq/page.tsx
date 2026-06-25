import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <h1 className="font-playfair text-3xl font-extrabold text-brand-navy">Frequently Asked Questions</h1>
        <div className="h-1 w-12 bg-brand-coral rounded-full"></div>

        <div className="space-y-6 text-gray-650 font-light text-sm sm:text-base">
          <div>
            <h3 className="font-semibold text-brand-navy mb-1.5">How do I choose the correct size?</h3>
            <p>Please check the size guide on each product details page. Our sizes (S, M, L, XL, XXL) are tailored according to standard fitting measurements.</p>
          </div>
          <div>
            <h3 className="font-semibold text-brand-navy mb-1.5">What is the delivery time?</h3>
            <p>Orders are delivered in 2-4 working days inside Dhaka, and 3-7 working days outside Dhaka.</p>
          </div>
          <div>
            <h3 className="font-semibold text-brand-navy mb-1.5">How do I apply a coupon?</h3>
            <p>Enter the code on your Shopping Cart page in the Discount Coupon form and click Apply before proceeding to checkout.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
