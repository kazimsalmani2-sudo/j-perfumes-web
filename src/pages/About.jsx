import React from 'react';
import './About.css';

export default function About() {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-inner">
            <div className="section-label left-only">
              <span className="label-line"></span>
              <span>OUR STORY</span>
            </div>
            <h1 className="about-title">The Heritage of J Perfumewala</h1>
            <p className="about-subtitle">
              Distilling memories, emotions, and pure botanicals into timeless liquid narratives since 2010.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section philosophy-section">
        <div className="container">
          <div className="philosophy-grid">
            <div className="philosophy-image-container">
              <img src="/royal_oud.png" alt="Maison Perfumery" className="philosophy-image" />
            </div>
            <div className="philosophy-content">
              <div className="section-label left-only">
                <span className="label-line"></span>
                <span>PHILOSOPHY</span>
              </div>
              <h2 className="philosophy-title">Fragrance as an Art Form</h2>
              <p className="philosophy-text">
                At J Perfumewala, we believe that perfume is far more than an accessory. It is a silent language, a key to long-forgotten memories, and an expression of one's deepest identity.
              </p>
              <p className="philosophy-text">
                We select our raw ingredients from across the globe — Jasmine from Grasse, Oud from Assam, Sandalwood from Mysore, and Rose from Taif. Each batch is slowly matured and bottled by hand, preserving the delicate subtleties of the natural extracts.
              </p>
              <div className="values-list">
                <div className="value-item">
                  <span className="value-num">01</span>
                  <div>
                    <h4 className="value-title">Sourcing Integrity</h4>
                    <p className="value-desc">We build direct relationships with small-scale, sustainable farms worldwide.</p>
                  </div>
                </div>
                <div className="value-item">
                  <span className="value-num">02</span>
                  <div>
                    <h4 className="value-title">Artisanal Distillation</h4>
                    <p className="value-desc">We honor historical methodologies, combining them with modern precision.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="section founder-section">
        <div className="container">
          <div className="founder-grid">
            <div className="founder-image-wrapper">
              <div className="founder-image-accent" />
              <img
                src="/Screenshot 2026-06-08 144911.png"
                alt="Junaid"
                className="founder-image"
                onError={(e) => {
                  console.error('Founder image failed to load:', e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="founder-content">
              <div className="section-label left-only">
                <span className="label-line"></span>
                <span>THE NOSE BEHIND THE BRAND</span>
              </div>
              <h2 className="founder-name">Junaid</h2>
              <p className="founder-role">Founder & Master Curator, J Perfumewala</p>
              <div className="founder-divider" />
              <p className="founder-text">
                Fragrance is not just a product for Junaid — it is a lifelong obsession. With over a decade of experience curating the world's finest scents, he founded J Perfumewala with one mission: to bring the rarest, most exquisite fragrances directly to those who truly appreciate luxury.
              </p>
              <p className="founder-text">
                Trained in the art of olfaction, Junaid travels from the souks of Dubai to the ateliers of Paris, handpicking each fragrance in the collection. His philosophy is simple — every scent tells a story, and the right fragrance should feel like it was made only for you.
              </p>
              <p className="founder-text">
                "When I smell a fragrance, I don't just smell notes — I see places, feel emotions, and live memories. That is the power of a truly great perfume."
              </p>
              <div className="founder-quote-box">
                <p className="founder-quote">
                  "The right fragrance doesn't just complement you — it defines you."
                </p>
                <span className="founder-quote-author">— Junaid</span>
              </div>
              <div className="founder-stats">
                {[
                  { number: '12+', label: 'Years Experience' },
                  { number: '500+', label: 'Fragrances Curated' },
                  { number: '50K+', label: 'Happy Clients' }
                ].map((stat) => (
                  <div key={stat.label} className="founder-stat">
                    <span className="founder-stat-number">{stat.number}</span>
                    <span className="founder-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="section timeline-section">
        <div className="container">
          <div className="section-center-header">
            <div className="section-label"><span>OUR JOURNEY</span></div>
            <h2 className="section-title text-center">Milestones of Luxury</h2>
          </div>
          
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-year">2010</div>
              <div className="timeline-content-box">
                <h4 className="timeline-title">The First Atelier</h4>
                <p className="timeline-text-item">Opening of our private showroom in Mumbai, catering exclusively to bespoke custom creations.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2015</div>
              <div className="timeline-content-box">
                <h4 className="timeline-title">Royal Oud Launch</h4>
                <p className="timeline-text-item">Expanding our reach globally with our signature Oriental collection, winning praise from master perfumers.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2020</div>
              <div className="timeline-content-box">
                <h4 className="timeline-title">Sustainable Path</h4>
                <p className="timeline-text-item">Transitioning to 100% biodegradable custom card packaging and supporting family-owned sandalwood farms.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-year">2026</div>
              <div className="timeline-content-box">
                <h4 className="timeline-title">Digital Experience</h4>
                <p className="timeline-text-item">Launching our digital flagship online store, bringing high-end luxury directly to scent lovers worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
