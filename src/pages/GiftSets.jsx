import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './GiftSets.css';

const giftSetProducts = products.filter(p => p.collection === 'gift-sets' || p.category === 'gift-sets');

export default function GiftSets() {
  return (
    <main className="gift-sets-page">
      {/* Luxury Hero */}
      <section className="gift-sets-hero">
        <div className="container">
          <div className="gift-sets-hero-inner">
            <div className="gift-sets-hero-content">
              <div className="section-label left-only" style={{color:'var(--gold)'}}>
                <span className="label-line" style={{background:'var(--gold)'}}></span>
                <span>CURATED LUXURY</span>
              </div>
              <h1 className="gift-sets-hero-title">
                Art of Gifting
              </h1>
              <p className="gift-sets-hero-body">
                Express your feelings with the ultimate statement of refinement. Our meticulously designed gift boxes house our finest fragrances, accompanied by artisanal accessories and elegant presentation.
              </p>
            </div>
            <div className="gift-sets-hero-features">
              <div className="feature-item">
                <span className="feature-icon">🎁</span>
                <div>
                  <div className="feature-title">Premium Packaging</div>
                  <div className="feature-desc">Wrapped in textured gold-foiled paper boxes with silk linings.</div>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✉️</span>
                <div>
                  <div className="feature-title">Personalized Note</div>
                  <div className="feature-desc">Include a handwritten message on our signature heavy cardstock.</div>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚚</span>
                <div>
                  <div className="feature-title">Insured Delivery</div>
                  <div className="feature-desc">Fragile-safe courier shipping to ensure flawless arrival.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Sets Products */}
      <section className="section">
        <div className="container">
          <div className="section-center-header">
            <div className="section-label"><span>OUR GIFT SETS</span></div>
            <h2 className="section-title text-center">Exclusive Gift Sets</h2>
            <p className="section-subtitle text-center">
              Carefully matched fragrance pairings and miniature collections designed to delight.
            </p>
          </div>
          <div className="gift-sets-grid">
            {(giftSetProducts.length > 0 ? giftSetProducts : products.slice(2, 5)).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Gifting */}
      <section className="corporate-gifting">
        <div className="container">
          <div className="corporate-box">
            <h2 className="corporate-title">Corporate & Bespoke Gifting</h2>
            <p className="corporate-body">
              Make a lasting impression on your clients, partners, and employees. We offer bespoke customization, including custom branding, tailored fragrance combinations, and volume shipping options.
            </p>
            <Link to="/contact" className="btn btn-dark" id="corporate-contact-btn">
              INQUIRE NOW <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
