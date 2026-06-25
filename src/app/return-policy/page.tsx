import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <h1 className="font-playfair text-3xl font-extrabold text-brand-navy">Return & Exchange Policy</h1>
        <div className="h-1 w-12 bg-brand-coral rounded-full"></div>

        <div className="space-y-4 text-gray-600 font-light leading-relaxed text-sm sm:text-base">
          <p>
            At Antigravity Fashion, we want you to love your dresses! If a garment doesn&apos;t fit perfectly, you can request an exchange or return within <strong>7 days</strong> of delivery.
          </p>

          <h3 className="font-semibold text-brand-navy pt-4">Garment Return Conditions</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Dresses must be unwashed, unworn, and unaltered.</li>
            <li>All original designer labels, tags, and price tags must be intact.</li>
            <li>Receipt or order number proof is required.</li>
          </ul>

          <h3 className="font-semibold text-brand-navy pt-4">Return Shipping</h3>
          <p>
            To initiate a return, contact our customer service team. Once approved, you can send the parcel back to our Dhaka warehouse or request our courier service to collect it (shipping fee applies).
          </p>

          <h3 className="font-semibold text-brand-navy pt-4">Refund Process</h3>
          <p>
            Once we inspect and confirm the return conditions, your refund will be processed within 7 working days. Refunds are made to your preferred mobile financial wallet (bKash/Nagad) or bank account.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
