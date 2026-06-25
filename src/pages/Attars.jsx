import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Attars.css';

const attarProducts = products.filter(p => p.fragranceFamily === 'Oriental' || p.collection === 'attars');

export default function Attars() {
  return (
    <main className="attars-page">
      {/* Dark Gold Hero */}
      <section className="attars-hero">
        <div className="container">
          <div className="attars-hero-inner">
            <div className="attars-hero-content">
              <div className="section-label left-only" style={{color:'var(--gold-light)'}}>
                <span className="label-line" style={{background:'var(--gold-light)'}}></span>
                <span>PURE & NATURAL</span>
              </div>
              <h1 className="attars-hero-title">
                The Art of<br />
                <em className="attars-gold">Attar</em>
              </h1>
              <p className="attars-hero-body">
                Attars are pure, alcohol-free fragrances distilled through ancient methods perfected over centuries.
                Each drop is a concentrated essence of flowers, spices, and woods — preserved in precious sandalwood oil.
              </p>
            </div>
            <div className="attars-hero-facts">
              <div className="attar-fact">
                <span className="attar-fact-icon">🌹</span>
                <div>
                  <div className="attar-fact-title">Pure Botanical</div>
                  <div className="attar-fact-desc">No alcohol, no synthetics — only nature's finest ingredients.</div>
                </div>
              </div>
              <div className="attar-fact">
                <span className="attar-fact-icon">⚗️</span>
                <div>
                  <div className="attar-fact-title">Ancient Distillation</div>
                  <div className="attar-fact-desc">Deg-bhapka method used by master artisans for 400+ years.</div>
                </div>
              </div>
              <div className="attar-fact">
                <span className="attar-fact-icon">🕌</span>
                <div>
                  <div className="attar-fact-title">Long-lasting</div>
                  <div className="attar-fact-desc">Just 1-2 drops last all day on pulse points.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section">
        <div className="container">
          <div className="section-center-header">
            <div className="section-label"><span>OUR ATTARS</span></div>
            <h2 className="section-title" style={{textAlign:'center'}}>Pure Attar Collection</h2>
            <p className="section-subtitle">
              Each attar is sourced from the finest botanical sources and distilled with care.
            </p>
          </div>
          <div className="attars-grid">
            {(attarProducts.length > 0 ? attarProducts : products.slice(0, 4)).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="attars-cta">
        <div className="container">
          <h2 className="attars-cta-title">Not sure which attar is right for you?</h2>
          <p className="attars-cta-body">
            Chat with our fragrance consultants on WhatsApp for personalised recommendations.
          </p>
          <a
            href="https://wa.me/918286679918?text=I'd like to know more about your attars"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold"
            id="attar-consult-btn"
          >
            CHAT WITH AN EXPERT <ArrowRight size={14} />
          </a>
        </div>
      </section>
    </main>
  );
}
