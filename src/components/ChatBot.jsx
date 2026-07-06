import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, Sparkles, ShoppingCart, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products as staticProducts } from '../data/products';
import './ChatBot.css';

const BACKEND_URL = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:5000';

// Quick reply sets for each conversation step
const QUICK_SKIN_TYPES = ['Oily Skin', 'Dry Skin', 'Normal Skin', 'Combination Skin'];
const QUICK_GENDER = ['Men', 'Women', 'Unisex'];
const QUICK_FRAGRANCE = ['Fresh', 'Floral', 'Woody', 'Oud', 'Oriental'];
const QUICK_OCCASION = ['Daily Wear', 'Office', 'Evening', 'Special Occasion'];

// Detect what quick replies to show based on bot message
function detectQuickReplies(botMessage) {
  const msg = botMessage.toLowerCase();
  
  // Check occasion first since it's the final question type and highly likely to contain historical context mentions of gender/family
  if (msg.includes('occasion') || msg.includes('daily wear') || msg.includes('office wear') || msg.includes('evening wear') || msg.includes('special occasion') || msg.includes('when do you plan to wear') || msg.includes('wear it') || msg.includes('plan to wear')) {
    return QUICK_OCCASION;
  }
  
  // Check fragrance family preference next
  if (msg.includes('fragrance family') || msg.includes('fresh') || msg.includes('floral') || msg.includes('woody') || msg.includes('oud') || msg.includes('oriental') || msg.includes('what kind of scent') || msg.includes('type of fragrance') || msg.includes('fragrance prefer') || msg.includes('perfume you currently')) {
    return QUICK_FRAGRANCE;
  }
  
  // Check gender preference
  if (msg.includes('gender') || msg.includes('men') || msg.includes('women') || msg.includes('unisex') || msg.includes('whom') || msg.includes('who is it for')) {
    return QUICK_GENDER;
  }
  
  // Check skin type
  if (msg.includes('skin type') || msg.includes('oily') || msg.includes('dry skin') || msg.includes('combination') || msg.includes('normal skin') || msg.includes('skin prefer')) {
    return QUICK_SKIN_TYPES;
  }
  
  return [];
}

function TypingIndicator() {
  return (
    <div className="chat-bubble-wrapper bot-wrapper">
      <div className="bot-avatar-sm">JF</div>
      <div className="typing-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

function ProductCard({ productId, products, onAddToCart }) {
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  return (
    <div className="chat-product-card">
      <img src={product.image} alt={product.name} className="chat-product-img" />
      <div className="chat-product-info">
        <div className="chat-product-header">
          <div className="chat-product-badge">{product.fragranceFamily}</div>
          <h4 className="chat-product-name">{product.name}</h4>
          <p className="chat-product-notes">{product.notes}</p>
        </div>
        <div className="chat-product-footer">
          <span className="chat-product-price">₹{product.price.toLocaleString()}</span>
          <div className="chat-product-actions">
            <button
              className="chat-add-btn"
              onClick={() => onAddToCart(product)}
              id={`chat-add-${product.id}`}
            >
              <ShoppingCart size={12} /> Add
            </button>
            <Link
              to={`/shop/${product.id}`}
              className="chat-view-btn"
              id={`chat-view-${product.id}`}
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickReply({ options, onSelect }) {
  return (
    <div className="quick-replies">
      {options.map(opt => (
        <button
          key={opt}
          className="quick-reply-btn"
          onClick={() => onSelect(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ChatBot() {
  const [products, setProducts] = useState(staticProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // {role, content, type, products}
  const [input, setInput] = useState('');

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    fetch(`${apiBase}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => console.error("Error fetching products in ChatBot:", err));
  }, []);
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [addedToCart, setAddedToCart] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addToCart } = useCart();

  // API messages history (role: user/assistant)
  const [apiMessages, setApiMessages] = useState([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && !hasStarted) {
      startConversation();
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const startConversation = async () => {
    setHasStarted(true);
    setLoading(true);

    const initMsg = [{ role: 'user', content: 'Hello, I want help choosing a perfume.' }];
    const fallbackGreeting = "Hello! I'm J-Fragrance AI, your personal luxury scent advisor ✨ What's your skin type? (Oily / Dry / Normal / Combination)";

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: initMsg }),
      });

      if (!res.ok) throw new Error(`Backend error ${res.status}`);

      const data = await res.json();
      const botMsg = data.message || fallbackGreeting;

      setMessages([{ role: 'assistant', content: botMsg, type: 'message' }]);
      setApiMessages([...initMsg, { role: 'assistant', content: botMsg }]);
      
      // Determine quick replies based on backend nextStep or fallback
      if (data.nextStep === 'gender') {
        setQuickReplies(QUICK_GENDER);
      } else if (data.nextStep === 'fragrance') {
        setQuickReplies(QUICK_FRAGRANCE);
      } else if (data.nextStep === 'occasion') {
        setQuickReplies(QUICK_OCCASION);
      } else if (data.nextStep === 'skin') {
        setQuickReplies(QUICK_SKIN_TYPES);
      } else {
        const detected = detectQuickReplies(botMsg);
        setQuickReplies(detected.length > 0 ? detected : QUICK_SKIN_TYPES);
      }
    } catch (err) {
      console.error('[ChatBot] Backend unreachable:', err.message);
      // Even on failure, set apiMessages so follow-up messages work when backend comes up
      const fallbackAssistant = { role: 'assistant', content: fallbackGreeting };
      setApiMessages([...initMsg, fallbackAssistant]);
      setMessages([{ role: 'assistant', content: fallbackGreeting, type: 'message' }]);
      setQuickReplies(QUICK_SKIN_TYPES);
    }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setQuickReplies([]);

    // Add user message to UI
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);

    // Add to API history
    const newApiMessages = [...apiMessages, { role: 'user', content: userText }];
    setApiMessages(newApiMessages);

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newApiMessages }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Rate limit reached (Groq API Limit). Please wait a few seconds before sending another message. ⏳');
        }
        throw new Error(`API error (Status ${res.status})`);
      }

      const data = await res.json();

      if (data.type === 'recommendations' && data.products?.length > 0) {
        // Show product recommendations
        const botReply = {
          role: 'assistant',
          content: data.message,
          type: 'recommendations',
          productIds: data.products,
        };
        setMessages(prev => [...prev, botReply]);
        setApiMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

        // Show restart option
        setQuickReplies(['Start Over 🔄']);
      } else {
        const botText = data.message || 'Let me help you find the perfect fragrance!';
        setMessages(prev => [...prev, { role: 'assistant', content: botText, type: 'message' }]);
        setApiMessages(prev => [...prev, { role: 'assistant', content: botText }]);
        
        // Use nextStep returned from API, or fallback to detectQuickReplies
        if (data.nextStep === 'skin') {
          setQuickReplies(QUICK_SKIN_TYPES);
        } else if (data.nextStep === 'gender') {
          setQuickReplies(QUICK_GENDER);
        } else if (data.nextStep === 'fragrance') {
          setQuickReplies(QUICK_FRAGRANCE);
        } else if (data.nextStep === 'occasion') {
          setQuickReplies(QUICK_OCCASION);
        } else if (data.nextStep === 'recommendations' || data.nextStep === 'done') {
          setQuickReplies(['Start Over 🔄']);
        } else {
          // Fallback to keyword matching if nextStep is not provided
          setQuickReplies(detectQuickReplies(botText));
        }
      }
    } catch (err) {
      console.error('[ChatBot] sendMessage error:', err.message);
      let errMsg = '⚠️ Backend se connect nahi ho pa raha. Kripya backend terminal check karein (port 5000).';
      if (err.message.includes('Rate limit')) {
        errMsg = `⚠️ ${err.message}`;
      } else if (err.message.includes('Status') || err.message.includes('API error')) {
        errMsg = `⚠️ Server returned an error (${err.message}). Please try again later.`;
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errMsg,
        type: 'message',
      }]);
    }

    setLoading(false);
  };

  const handleQuickReply = (opt) => {
    if (opt === 'Start Over 🔄') {
      resetChat();
    } else {
      sendMessage(opt);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setApiMessages([]);
    setQuickReplies([]);
    setHasStarted(false);
    setLoading(false);
    startConversation();
  };

  const handleAddToCart = (product) => {
    addToCart({ ...product, selectedSize: product.sizes[0] });
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [product.id]: false })), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`chatbot-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        id="chatbot-fab"
        aria-label="Open fragrance advisor"
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
        {!isOpen && <span className="fab-label">Ask J-Fragrance AI</span>}
      </button>

      {/* Chat Panel */}
      <div className={`chatbot-panel ${isOpen ? 'visible' : ''}`} id="chatbot-panel">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">JF</div>
            <div>
              <div className="chatbot-name">J-Fragrance AI</div>
              <div className="chatbot-status">
                <span className="status-dot" />
                AI Fragrance Advisor
              </div>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button
              className="chatbot-reset-btn"
              onClick={resetChat}
              title="Start over"
              id="chatbot-reset"
            >
              <RotateCcw size={14} />
            </button>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              id="chatbot-close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" id="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx}>
              {msg.role === 'assistant' ? (
                <>
                  <div className="chat-bubble-wrapper bot-wrapper">
                    <div className="bot-avatar-sm">JF</div>
                    <div className="chat-bubble bot">
                      <p>{msg.content}</p>
                    </div>
                  </div>
                  {msg.type === 'recommendations' && msg.productIds?.length > 0 && (
                    <div className="chat-products-list">
                      {msg.productIds.map(id => (
                        <ProductCard
                          key={id}
                          productId={id}
                          products={products}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="chat-bubble-wrapper user-wrapper">
                  <div className="chat-bubble user">
                    <p>{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && <TypingIndicator />}

          {/* Quick Replies */}
          {!loading && quickReplies.length > 0 && (
            <QuickReply options={quickReplies} onSelect={handleQuickReply} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chatbot-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            id="chatbot-input"
          />
          <button
            className="chatbot-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            id="chatbot-send"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="chatbot-footer-note">
          Powered by Grok AI · J Perfumewala
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && <div className="chatbot-backdrop" onClick={() => setIsOpen(false)} />}
    </>
  );
}
