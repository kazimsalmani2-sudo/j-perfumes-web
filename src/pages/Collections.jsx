import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter } from 'lucide-react';
import { collections } from '../data/products';
import './Collections.css';

const filters = ['ALL', 'POUR HOMME', 'POUR FEMME', 'OUD', 'ATTARS', 'GIFT SETS', 'MINIATURES'];

const filterMap = {
  'ALL': null,
  'POUR HOMME': 'pour-homme',
  'POUR FEMME': 'pour-femme',
  'OUD': 'royal-oud',
  'ATTARS': 'attars',
  'GIFT SETS': 'gift-sets',
  'MINIATURES': 'miniatures',
};

export default function Collections() {
  const [active, setActive] = useState('ALL');

  const filtered = filterMap[active]
    ? collections.filter(c => c.id === filterMap[active])
    : collections;

  const getBadgeClass = (type) => {
    switch(type) {
      case 'gold': return 'badge badge-gold';
      case 'dark': return 'badge badge-dark';
      default: return 'badge badge-gold';
    }
  };

  return (
    <main className="collections-page">
      {/* Header */}
      <section className="page-hero">
        <div className="container">
          <div className="section-label line-left">
            <span>EXPLORE</span>
          </div>
          <h1 className="page-hero-title">Our Collections</h1>
          <p className="page-hero-subtitle">
            Each collection tells a unique olfactory story — discover the one that speaks to you.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="container">
          <div className="filter-bar-inner">
            <Filter size={14} />
            {filters.map(f => (
              <button
                key={f}
                className={`filter-btn ${active === f ? 'active' : ''}`}
                onClick={() => setActive(f)}
                id={`filter-${f.toLowerCase().replace(/\s/g, '-')}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="section">
        <div className="container">
          <div className="collections-full-grid">
            {filtered.map((col, idx) => (
              <Link
                key={col.id}
                to={`/shop?collection=${col.id}`}
                className="collection-card-full"
                id={col.id}
              >
                <div className="collection-full-image">
                  {col.badge && (
                    <span className={getBadgeClass(col.badgeType)}>{col.badge}</span>
                  )}
                  <img src={col.image} alt={col.name} loading="lazy" />
                  <div className="collection-hover-overlay">
                    <span>EXPLORE {col.name.toUpperCase()} <ArrowRight size={14} /></span>
                  </div>
                </div>
                <div className="collection-full-body">
                  <div>
                    <div className="collection-subtitle">{col.subtitle.toUpperCase()}</div>
                    <h2 className="collection-name-large">{col.name}</h2>
                    <p className="collection-description">{col.description}</p>
                  </div>
                  <div className="collection-arrow">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
