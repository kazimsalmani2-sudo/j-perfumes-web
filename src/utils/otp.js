// ============================================================
// OTP utility functions for J Perfumewala
// ============================================================

const API_BASE = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:5000';

/**
 * Request server to generate and send OTP via email.
 * Returns { success, emailSent, message } on success,
 * or { success: false, error } if email delivery failed.
 * The OTP is NEVER returned in the response for security.
 */
export const sendOtpApi = async (phone, email) => {
  try {
    const response = await fetch(`${API_BASE}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, email }),
    });

    if (!response.ok) {
      const err = await response.json();
      return { success: false, error: err.error || 'Failed to send OTP' };
    }

    return await response.json();
  } catch (error) {
    console.warn('OTP backend unreachable — simulating offline error:', error.message);
    return {
      success: false,
      error: 'OTP backend unreachable. Please try again later.',
    };
  }
};

/**
 * Verify OTP code with the server
 * @param {string} phone 
 * @param {string} otp 
 * @returns {Promise<{verified: boolean, message?: string, error?: string}>}
 */
export const verifyOtpApi = async (phone, email, otp) => {
  try {
    const response = await fetch(`${API_BASE}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, email, otp }),
    });

    if (!response.ok) {
      const err = await response.json();
      return { verified: false, error: err.error || 'OTP verification failed' };
    }

    return await response.json();
  } catch (error) {
    console.warn('OTP backend verification offline — simulating offline error:', error.message);
    return { verified: false, error: 'OTP verification backend is offline. Please try again.' };
  }
};
