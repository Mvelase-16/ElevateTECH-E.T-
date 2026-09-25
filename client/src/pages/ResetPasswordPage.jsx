import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setIsVerifying(false);
        setVerifyError('Reset token is missing.');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/verify-reset-token/${token}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setTokenValid(true);
        } else {
          setVerifyError(data.error || 'This password reset link is invalid or has expired.');
        }
      } catch (err) {
        setVerifyError('Unable to verify token. Please check your internet connection.');
      } finally {
        setIsVerifying(false);
      }
    }

    verify();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword) {
      setErrorMessage('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setResetSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while resetting your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px'
    }}>
      {/* Brand Header Banner */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'var(--primary)',
        color: '#FFFFFF',
        padding: '32px 24px 26px',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          color: 'var(--primary)',
          fontWeight: '900',
          fontSize: '22px',
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          UB
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Uni<span style={{ color: '#FCD34D' }}>BITES</span>
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px', fontWeight: '500' }}>
          Create New Password • Walter Sisulu University
        </p>
      </div>

      {/* Card Body */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        padding: '28px 24px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border)',
        borderTop: 'none'
      }}>
        {isVerifying ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: '600' }}>Verifying reset security link...</p>
          </div>
        ) : !tokenValid ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle size={32} />
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Link Invalid or Expired
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '22px' }}>
              {verifyError || 'This password reset link has expired or has already been used.'}
            </p>

            <button
              onClick={() => navigate('/forgot-password')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700'
              }}
            >
              Request a New Reset Link
            </button>
          </div>
        ) : resetSuccess ? (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={34} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Password Reset Successful!
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '22px' }}>
              Your account password has been updated securely. You can now log in with your new credentials.
            </p>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <span>Sign In with New Password</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
              Choose a new password
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Create a strong password of at least 6 characters.
            </p>

            {errorMessage && (
              <div style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: '#FAFAFA'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: '#FAFAFA'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <span>{isSubmitting ? 'Resetting Password...' : 'Reset Password'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
