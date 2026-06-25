import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <h1 className="font-playfair text-4xl font-extrabold text-brand-navy text-center">About Our Brand</h1>
        <div className="h-1 w-12 bg-brand-coral mx-auto rounded-full"></div>
        
        <div className="space-y-6 text-gray-650 font-light leading-relaxed text-sm sm:text-base">
          <p>
            Welcome to Antigravity Fashion, where modern silhouettes meet luxury comfort. Founded with the mission of providing girls and women with elegant, premium-quality dresses, outfits, and accessories, we specialize in curated collections featuring pastel coral, peach, and soft off-white color directions.
          </p>
          <p>
            Every single dress in our catalog is crafted with premium fabrics designed to celebrate you. From flowing summer dresses to structured evening gowns, our design process focuses on rounded layouts, elegant typography, and product-focused visuals that feel premium and look state-of-the-art.
          </p>
          <p>
            We believe that shopping should be a seamless, responsive experience. With our secure checkout, fast nationwide shipping, and dedicated support, you can discover your signature look with complete peace of mind.
          </p>
        </div>

        <div className="text-center pt-8">
          <Link href="/shop" className="bg-brand-coral hover:bg-brand-coral-hover text-white px-8 py-3.5 rounded-full font-semibold shadow-md transition-all duration-300">
            Explore Collection
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
