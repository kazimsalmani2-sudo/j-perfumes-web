import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const Instagram = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const Facebook = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const Twitter = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
const Youtube = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;

import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-grid">
          {/* Left Section: Brand & Social */}
          <div className="footer-col footer-brand">
            <div className="footer-logo">
              <img src="/logo.jpg" alt="J PERFUMEWALA Logo" className="footer-logo-img" />
            </div>
            <p className="footer-tagline">
              Discover the world's finest luxury fragrances.
            </p>
            <div className="footer-socials">
              <a href="https://www.instagram.com/jperfumewala_/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/JPerfumewala" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://x.com/jperfumewala" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X (Twitter)">
                <Twitter size={18} />
              </a>
              <a href="https://www.youtube.com/@Jperfumewala" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Center Section: Links */}
          <div className="footer-col footer-links-wrapper">
            <div className="footer-links-col">
              <h4 className="footer-heading">QUICK LINKS</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/collections">Collections</Link></li>
                <li><Link to="/shop?filter=new">New Arrivals</Link></li>
                <li><Link to="/shop?filter=bestseller">Best Sellers</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-heading">ABOUT</h4>
              <ul className="footer-links">
                <li><Link to="/about#story">Our Story</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/about#careers">Careers</Link></li>
              </ul>
            </div>
          </div>

          {/* Right Section: Contact & Newsletter */}
          <div className="footer-col footer-contact-newsletter">
            <h4 className="footer-heading">CONTACT INFORMATION</h4>
            <div className="footer-contact-info">
              <div className="contact-row">
                <Phone size={14} />
                <span>+91 82866 79918</span>
              </div>
              <div className="contact-row">
                <Mail size={14} />
                <span>jperfumewala@gmail.com</span>
              </div>
              <div className="contact-row">
                <MapPin size={14} />
                <span>Mumbai, India</span>
              </div>
            </div>

            <div className="footer-newsletter">
              <h4 className="footer-heading">NEWSLETTER</h4>
              <p className="newsletter-text">Subscribe for exclusive offers and updates.</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Email Address" required />
                <button type="submit" aria-label="Subscribe"><ArrowRight size={18} /></button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p>© 2026 J Perfumewala. All Rights Reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms & Conditions</Link>
              <Link to="/refund">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
