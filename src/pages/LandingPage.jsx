import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in → skip landing, go to home
  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.65)), url(/royal_oud.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px'
    }}>
      {/* Card */}
      <div style={{
        position: 'relative',
        background: 'white',
        borderRadius: '12px',
        padding: '48px 40px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        borderTop: '3px solid #B8960C'
      }}>
        {/* Logo */}
        <img src="/logo.jpg" alt="Logo"
          style={{ height: 80, marginBottom: 20, objectFit: 'contain' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-block',
          border: '1px solid #B8960C',
          borderRadius: '999px',
          padding: '4px 16px',
          fontSize: 11,
          fontWeight: 600,
          color: '#B8960C',
          marginBottom: 20,
          letterSpacing: '0.1em'
        }}>
          ● WELCOME TO LUXURY
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 28,
          fontWeight: 400,
          color: '#1A1A1A',
          fontFamily: 'Playfair Display, serif',
          marginBottom: 12,
          lineHeight: 1.2
        }}>
          Maison J Perfumewala
        </h1>

        {/* Tagline */}
        <p style={{
          color: '#666',
          fontSize: 14,
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          Sign in to your account or create a new one to explore our premium collections of pure attars and luxury perfumes.
        </p>

        {/* Login Button */}
        <button
          onClick={() => navigate("/login")}
          style={{
            width: '100%',
            padding: '14px',
            background: '#B8960C',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            letterSpacing: '1px',
            transition: 'background 0.3s'
          }}>
          SIGN IN TO ACCOUNT
        </button>

        {/* Register Button */}
        <button
          onClick={() => navigate("/register")}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            color: '#B8960C',
            border: '2px solid #B8960C',
            borderRadius: '4px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            letterSpacing: '1px',
            transition: 'all 0.3s'
          }}>
          CREATE NEW ACCOUNT
        </button>

        {/* Continue as Guest */}
        <p style={{ marginTop: 24, fontSize: 13, color: '#999' }}>
          <span
            onClick={() => {
              sessionStorage.setItem("guestMode", "true");
              navigate("/home");
            }}
            style={{
              color: '#B8960C',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 600
            }}>
            Continue as Guest →
          </span>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
