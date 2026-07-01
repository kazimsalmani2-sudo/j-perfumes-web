import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import './Contact.css';

const API_BASE = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:5000';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Could not reach server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-page">
      {/* Header */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-inner">
            <div className="section-label left-only">
              <span className="label-line"></span>
              <span>GET IN TOUCH</span>
            </div>
            <h1 className="contact-title">Contact Us</h1>
            <p className="contact-subtitle">
              Have a question about our scents, order status, or corporate gifting? We are here to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Details */}
            <div className="contact-details">
              <h3 className="details-title">Customer Concierge</h3>
              <p className="details-intro">
                Our support team is available Monday to Saturday, 9:00 AM – 6:00 PM IST.
              </p>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon"><Phone size={18} /></div>
                  <div>
                    <h5 className="info-label">Call or WhatsApp</h5>
                    <p className="info-value">+91 82866 79918</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon"><Mail size={18} /></div>
                  <div>
                    <h5 className="info-label">Email</h5>
                    <p className="info-value">jperfumewala@gmail.com</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon"><MapPin size={18} /></div>
                  <div>
                    <h5 className="info-label">Flagship Showroom</h5>
                    <p className="info-value">123 Luxury Galleria, Link Road, Mumbai, India</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon"><MessageSquare size={18} /></div>
                  <div>
                    <h5 className="info-label">Bespoke Consultations</h5>
                    <a href="https://wa.me/918286679918" target="_blank" rel="noopener noreferrer" className="info-link-btn">
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <h3 className="form-title">Send a Message</h3>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    type="email"
                    id="contact-email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <input
                    type="text"
                    id="contact-subject"
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="Order inquiry, feedback, etc."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    rows="5"
                    required
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Write your message here..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-gold btn-full" id="contact-submit-btn" disabled={loading}>
                  {loading ? 'SENDING...' : <><span>SEND MESSAGE</span> <Send size={14} /></>}
                </button>

                {submitted && (
                  <div className="alert alert-success mt-4">
                    ✅ Thank you! Your message has been sent to our team. We will reply shortly.
                  </div>
                )}
                {error && (
                  <div className="alert alert-error mt-4" style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
                    ❌ {error}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="map-section section">
        <div className="container">
          <div className="section-center-header">
            <h2 className="section-title text-center">Find Us</h2>
            <p className="section-subtitle text-center">Visit our flagship showroom in Mumbai</p>
          </div>
          <div className="map-wrapper">
            <iframe
              title="JPerfumewala Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d829.5!2d72.8235015!3d18.9815443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf5499d6534d%3A0x14801a20021fac0c!2sJPerfumewala!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '4px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="map-directions">
            <a
              href="https://www.google.com/maps/place/JPerfumewala/@18.9815443,72.8235015"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-gold"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section section">
        <div className="container">
          <div className="section-center-header">
            <h2 className="section-title text-center">Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4 className="faq-q">Do you offer international shipping?</h4>
              <p className="faq-a">Yes! We ship to over 50 countries. Shipping fees and custom duty charges are calculated at checkout based on destination.</p>
            </div>
            <div className="faq-item">
              <h4 className="faq-q">Are your fragrances suitable for sensitive skin?</h4>
              <p className="faq-a">Our fragrances are made from organic ingredients and are hypoallergenic. For extra sensitive skin, we recommend our alcohol-free Attar collection.</p>
            </div>
            <div className="faq-item">
              <h4 className="faq-q">What is your return policy?</h4>
              <p className="faq-a">Due to the hygiene nature of perfumery, we accept returns only for damaged or unopened items within 14 days of delivery.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
