import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Mail, CheckCircle, Diamond } from 'lucide-react';
import { products as staticProducts, collections, testimonials } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { db } from '../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import founderImg from '../assets/images/founder.jpg';
import heroPerfumeImg from '../assets/images/hero-perfume.png';
import './Home.css';

// =================== HERO ===================
function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        {/* Left */}
        <div className="hero-left">
          <div className="hero-label section-label left-only">
            <span className="label-line"></span>
            <span>LUXURY FRAGRANCES SINCE 2010</span>
          </div>
          <h1 className="hero-heading">
            The Scent of<br />
            <em className="gold-text hero-italic">Pure Elegance</em>
          </h1>
          <p className="hero-body">
            Discover rare and exquisite fragrances from the world's finest perfume houses
            — crafted for those who appreciate true luxury.
          </p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-gold" id="hero-shop-btn">
              SHOP NOW <ArrowRight size={14} />
            </Link>
            <Link to="/collections" className="btn btn-outline" id="hero-collections-btn">
              VIEW COLLECTIONS
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">500+</span>
              <span className="stat-label">FRAGRANCES</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">50K+</span>
              <span className="stat-label">HAPPY CLIENTS</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">12+</span>
              <span className="stat-label">YEARS OF CRAFT</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="hero-right">
          <div className="hero-image-wrapper">
            <img src={heroPerfumeImg} alt="J Perfumewala — Luxury Perfume" className="hero-image" />
            <Link
              to="/shop"
              className="hero-price-badge"
              id="hero-price-badge-link"
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                textDecoration: 'none',
                display: 'block',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--gold-dark)' }}>₹4,200</span>
              <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>Shop Now →</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// =================== COLLECTIONS ===================
function Collections() {
  const navigate = useNavigate();

  const getBadgeClass = (type) => {
    switch (type) {
      case 'gold': return 'badge badge-gold';
      case 'dark': return 'badge badge-dark';
      default: return 'badge badge-gold';
    }
  };

  return (
    <section className="section collections-section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-label line-left">
              <span>CRAFTED FOR YOU</span>
            </div>
            <h2 className="section-title">Our Collections</h2>
          </div>
          <Link to="/collections" className="explore-link" id="explore-all-link">
            Explore All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="collections-grid">
          {collections.map((col, idx) => (
            <Link
              key={col.id}
              to={`/shop?collection=${col.id}`}
              className={`collection-card ${idx === 1 ? 'highlighted' : ''}`}
              id={`collection-${col.id}`}
            >
              <div className="collection-image">
                {col.badge && (
                  <span className={getBadgeClass(col.badgeType)}>{col.badge}</span>
                )}
                <img src={col.image} alt={col.name} loading="lazy" />
              </div>
              <div className="collection-body">
                <div>
                  <div className="collection-subtitle">{col.subtitle.toUpperCase()}</div>
                  <h3 className="collection-name">{col.name}</h3>
                </div>
                {/* Arrow button → Checkout (Delivery) page */}
                <button
                  className="collection-arrow"
                  id={`collection-arrow-${col.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/checkout');
                  }}
                  aria-label={`Go to delivery for ${col.name}`}
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== BEST SELLERS ===================
function BestSellers({ products }) {
  const navigate = useNavigate();
  const bestsellers = products.filter(p => p.isBestseller).slice(0, 4);

  const getBadgeClass = (type) => {
    switch (type) {
      case 'gold': return 'badge badge-gold';
      case 'dark': return 'badge badge-dark';
      default: return 'badge badge-gold';
    }
  };

  return (
    <section className="section bestsellers-section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-label line-left">
              <span>SIGNATURE SCENTS</span>
            </div>
            <h2 className="section-title">Best Sellers</h2>
          </div>
          <Link to="/shop" className="explore-link" id="view-all-fragrances-btn">
            VIEW ALL <ArrowRight size={14} />
          </Link>
        </div>

        <div className="collections-grid bestsellers-grid">
          {bestsellers.map((product, idx) => (
            <Link
              key={product.id}
              to={`/shop?product=${product.slug}`}
              className={`collection-card ${idx === 1 ? 'highlighted' : ''}`}
              id={`bestseller-${product.id}`}
            >
              <div className="collection-image">
                {product.badge && (
                  <span className={getBadgeClass(product.badgeType)}>{product.badge}</span>
                )}
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <div className="collection-body">
                <div>
                  <div className="collection-subtitle">{product.notes}</div>
                  <h3 className="collection-name">{product.name}</h3>
                  <div className="bestseller-price">₹{product.price.toLocaleString()}</div>
                </div>
                <button
                  className="collection-arrow"
                  id={`bestseller-arrow-${product.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/product/${product.slug}`);
                  }}
                  aria-label={`View ${product.name}`}
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== NEW ARRIVALS (DARK) ===================
function NewArrivals({ products }) {
  const { addToCart } = useCart();
  const newProducts = products.filter(p => p.isNew);

  const [addedIds, setAddedIds] = useState([]);

  const handleAdd = (product) => {
    addToCart(product);
    setAddedIds(prev => [...prev, product.id]);
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 1500);
  };

  return (
    <section className="new-arrivals-section">
      <div className="container new-arrivals-inner">
        {/* Left Text */}
        <div className="new-arrivals-left">
          <div className="section-label left-only">
            <span className="label-line-dark"></span>
            <span style={{ color: 'var(--gold-dark)' }}>JUST ARRIVED</span>
          </div>
          <h2 className="new-arrivals-heading">
            <span className="white-text">New</span><br />
            <em className="gold-text">Arrivals</em>
          </h2>
          <p className="new-arrivals-body">
            Fresh from the world's most prestigious fragrance houses. Be the first
            to experience the newest luxury scents.
          </p>
          <Link to="/shop?filter=new" className="btn btn-outline-gold" id="new-arrivals-btn">
            SEE ALL NEW ARRIVALS <ArrowRight size={14} />
          </Link>
        </div>

        {/* Right: Product Cards */}
        <div className="new-arrivals-cards">
          {newProducts.map(product => (
            <div key={product.id} className="new-arrival-card" id={`new-${product.id}`}>
              <div className="new-arrival-image">
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <div className="new-arrival-body">
                <div className="product-notes" style={{ color: 'rgba(255,255,255,0.4)' }}>{product.notes}</div>
                <h3 className="new-arrival-name">{product.name}</h3>
                <div className="new-arrival-footer">
                  <span className="new-arrival-price">₹{product.price.toLocaleString()}</span>
                  <button
                    className={`add-to-cart-btn ${addedIds.includes(product.id) ? 'added' : ''}`}
                    onClick={() => handleAdd(product)}
                    id={`new-add-${product.id}`}
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5 6M7 13L5.4 5M7 13l-1.35 2.7A1 1 0 007 17h10m0 0a2 2 0 100 4 2 2 0 000-4zm-10 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {addedIds.includes(product.id) ? 'ADDED' : 'ADD'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== OUR STORY ===================
function OurStory() {
  const features = [
    { icon: '✦', text: '100% Authentic' },
    { icon: '✦', text: 'Ethically Sourced' },
    { icon: '✦', text: 'Award Winning' },
    { icon: '✦', text: 'Free Shipping' },
  ];

  return (
    <section className="section story-section">
      <div className="container story-inner">
        {/* Left: Image */}
        <div className="story-image-col">
          <div className="story-image-wrapper">
            <img src="/royal_oud.png" alt="Our master perfumer crafting luxury fragrances" className="story-image" />
            <div className="story-badge">
              <span className="story-badge-num">12+</span>
              <span className="story-badge-label">YEARS OF EXCELLENCE</span>
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="story-content">
          <div className="section-label line-left">
            <span>OUR STORY</span>
          </div>
          <h2 className="story-heading">
            Crafted With Passion,<br />
            <em className="gold-text">Worn With Pride</em>
          </h2>
          <div className="story-divider" />
          <p className="story-body">
            J Perfumewala was born from a lifelong love affair with fragrance. We travel the world to
            find the rarest, most exquisite scents — from the souks of Dubai to the ateliers of Paris
            — and bring them to you.
          </p>
          <p className="story-body">
            Each bottle in our collection is a testament to artisanship and excellence. We believe the
            right fragrance doesn't just complement you — it defines you.
          </p>
          <div className="story-features">
            {features.map((f, i) => (
              <div key={i} className="story-feature">
                <span className="feature-icon">{f.icon}</span>
                <span className="feature-text">{f.text}</span>
              </div>
            ))}
          </div>
          <Link to="/about" className="btn btn-gold" id="read-story-btn">
            READ OUR STORY <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// =================== TESTIMONIALS ===================
function Testimonials() {
  return (
    <section className="section testimonials-section" style={{ background: 'var(--off-white)' }}>
      <div className="container">
        <div className="section-center-header">
          <div className="section-label">
            <span>CLIENT LOVE</span>
          </div>
          <h2 className="section-title">What Our Patrons Say</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.id} className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-stars">
                {Array.from({ length: t.rating }, (_, i) => (
                  <span key={i} style={{ color: 'var(--gold-dark)' }}>★</span>
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.initials}</div>
                <div className="author-info">
                  <div className="author-name">{t.name}</div>
                  <div className="author-location">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================== NEWSLETTER ===================
function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email.toLowerCase().trim(),
        subscribedAt: serverTimestamp(),
        status: 'active'
      });
      setEmail('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section newsletter-section" style={{ background: 'var(--off-white)' }}>
      <div className="container">
        <div className="newsletter-inner">
          <div className="section-label">
            <span>STAY INFORMED</span>
          </div>
          <h2 className="newsletter-heading">
            Join the Inner Circle<br />
            <em className="gold-text">of Fragrance</em>
          </h2>
          <p className="newsletter-body">
            Get exclusive access to new arrivals, private sales, and curated fragrance
            guides — before anyone else.
          </p>

          {!submitted ? (
            <>
              <form className="newsletter-form" onSubmit={handleSubmit} id="newsletter-form">
                <div className="newsletter-input-wrapper">
                  <Mail size={18} className="newsletter-icon" />
                  <input
                    type="email"
                    placeholder="Your email address..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    id="newsletter-email"
                  />
                </div>
                <button type="submit" className="btn btn-gold" id="newsletter-submit" disabled={loading}>
                  {loading ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                </button>
              </form>
              {error && <p style={{ color: 'var(--error-red)', fontSize: '12px', marginTop: '8px' }}>{error}</p>}
              <p className="newsletter-disclaimer">
                No spam. Unsubscribe at any time. We respect your privacy.
              </p>
            </>
          ) : (
            <div className="newsletter-success">
              <CheckCircle size={24} color="var(--gold-dark)" />
              <p>Welcome to the Inner Circle! Watch your inbox for exclusive offers.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// =================== HOME PAGE ===================
export default function Home() {
  const [products, setProducts] = useState(staticProducts);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    fetch(`${apiBase}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  return (
    <main>
      <Hero />
      <Collections />
      <BestSellers products={products} />
      <NewArrivals products={products} />
      <OurStory />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
