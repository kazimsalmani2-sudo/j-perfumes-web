import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Heart, User, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import './Navbar.css';

export default function Navbar() {
  const { cartCount, wishlistItems } = useCart();
  const { user, logout, loggingOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      setVisible(true); // Always keep it visible
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/collections', label: 'Collections' },
    { to: '/attars', label: 'Attars' },
    { to: '/gift-sets', label: 'Gift Sets' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleSearchResult = (product) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/shop/${product.id}`);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${!visible ? 'navbar-hidden' : ''}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img src="/logo.jpg" alt="J PERFUMEWALA Logo" className="navbar-logo-img" />
          </Link>

          {/* Center Nav Links */}
          <ul className="navbar-links">
            {navLinks.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right Icons */}
          <div className="navbar-icons">
            <div 
              ref={searchContainerRef} 
              className={`navbar-search-inline ${searchOpen || searchQuery ? 'active' : ''}`}
            >
              <button
                id="search-btn"
                className="icon-btn search-icon-btn"
                onClick={() => {
                  if (searchOpen && !searchQuery) {
                    setSearchOpen(false);
                  } else {
                    setSearchOpen(true);
                    setTimeout(() => searchRef.current?.focus(), 100);
                  }
                }}
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              
              <div className="search-input-wrapper">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search fragrances..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  id="search-input"
                />
                {searchQuery && (
                  <button className="search-clear-btn" onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {searchOpen && (searchQuery || searchResults.length > 0) && (
                <div className="search-dropdown animate-fade-in">
                  {searchResults.length > 0 ? (
                    searchResults.map(product => (
                      <button
                        key={product.id}
                        className="search-result-item"
                        onClick={() => handleSearchResult(product)}
                      >
                        <img src={product.image} alt={product.name} />
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div className="search-result-name">{product.name}</div>
                          <div className="search-result-notes">{product.notes}</div>
                        </div>
                        <div className="search-result-price">₹{product.price.toLocaleString()}</div>
                      </button>
                    ))
                  ) : searchQuery ? (
                    <div className="search-no-results">No fragrances found for "{searchQuery}"</div>
                  ) : null}
                </div>
              )}
            </div>

            <Link to="/wishlist" id="wishlist-btn" className="icon-btn" aria-label="Wishlist">
              <Heart size={18} />
              {wishlistItems.length > 0 && (
                <span className="icon-badge">{wishlistItems.length}</span>
              )}
            </Link>

            <div className="navbar-auth-group">
              {user ? (
                <>
                  <Link to="/account" id="account-btn" className="icon-btn" aria-label="Account">
                    <User size={18} />
                  </Link>
                  <button
                    onClick={logout}
                    className="navbar-logout-btn hide-on-mobile"
                    disabled={loggingOut}
                    title="Logout"
                  >
                    {loggingOut ? "..." : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" id="login-icon-btn" className="icon-btn hide-on-desktop" aria-label="Login">
                    <User size={18} />
                  </Link>
                  <button
                    onClick={() => navigate('/login')}
                    className="navbar-login-btn hide-on-mobile"
                    title="Login"
                    style={{
                      border: '1px solid #1A1A1A',
                      padding: '8px 16px',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '12px',
                      borderRadius: '4px'
                    }}
                  >
                    LOGIN
                  </button>
                </>
              )}
            </div>

            <Link to="/cart" id="cart-btn" className="icon-btn cart-icon-btn" aria-label="Cart">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </Link>

            <button
              className="hamburger-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>



      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="overlay active" onClick={() => setMobileOpen(false)} />
          <div className="mobile-menu animate-fade-in">
            <div className="mobile-menu-header">
              <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
                <img src="/logo.jpg" alt="J PERFUMEWALA Logo" className="navbar-logo-img" />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="icon-btn">
                <X size={24} />
              </button>
            </div>
            <ul className="mobile-links">
              {navLinks.map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) => isActive ? 'mobile-link active' : 'mobile-link'}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
             <div className="mobile-contact">
              {user && (
                <div className="mobile-user-info" style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-dark)' }}>Logged in as:</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-grey)' }}>{user.email}</p>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="btn btn-gold btn-full"
                    disabled={loggingOut}
                    style={{ marginTop: '12px', padding: '10px 16px', fontSize: '12px' }}
                  >
                    {loggingOut ? "LOGGING OUT..." : "LOGOUT"}
                  </button>
                </div>
              )}
              <p>📞 +91 82866 79918</p>
              <p>✉ jperfumewala@gmail.com</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
