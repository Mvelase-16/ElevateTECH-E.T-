import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ChefHat, Sparkles, AlertCircle, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ onLoginSuccess }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  // Differentiate whether user is signing in as a student or as cafeteria staff
  const [loginRole, setLoginRole] = useState('student'); // 'student' or 'staff'
  const [signUpRole, setSignUpRole] = useState('student'); // 'student', 'staff', 'vendor'

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSignUp) {
      if (!firstName.trim() || !lastName.trim()) {
        setErrorMessage('Please enter both your first name and last name.');
        return;
      }
      if (!email.trim()) {
        setErrorMessage('Please enter your campus email address.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify.');
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await register({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password,
          confirm_password: confirmPassword,
          role: signUpRole,
          phone: phone.trim()
        });
        if (onLoginSuccess) onLoginSuccess(user);
      } catch (err) {
        setErrorMessage(err.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Login
      if (!email.trim() || !password) {
        setErrorMessage('Please enter both your email address and password.');
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await login(email.trim(), password);
        if (onLoginSuccess) onLoginSuccess(user);
      } catch (err) {
        setErrorMessage(err.message || 'Invalid email or password. Please verify credentials.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleQuickDemoStudent = async () => {
    setErrorMessage('');
    setEmail('student@wsu.ac.za');
    setPassword('password123');
    setIsSubmitting(true);
    try {
      const user = await login('student@wsu.ac.za', 'password123');
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoVendor = async () => {
    setErrorMessage('');
    setEmail('kitchen@wsu.ac.za');
    setPassword('Password123!');
    setIsSubmitting(true);
    try {
      const user = await login('kitchen@wsu.ac.za', 'Password123!');
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(err.message);
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
        padding: '34px 24px 28px',
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
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          UB
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
          Uni<span style={{ color: '#FCD34D' }}>BITES</span>
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px', fontWeight: '500' }}>
          Good Food. Good Mood. • Walter Sisulu University
        </p>
      </div>

      {/* Login / Register Card Body */}
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
        
        {/* ================================================================ */}
        {/* ROLE DIFFERENTIATION TABS FOR SIGN IN */}
        {/* ================================================================ */}
        {!isSignUp ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
              Select Portal / Sign-In As:
            </label>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              backgroundColor: '#F3F4F6',
              padding: '5px',
              borderRadius: '14px'
            }}>
              {/* Student Sign In Option */}
              <button
                type="button"
                onClick={() => {
                  setLoginRole('student');
                  setErrorMessage('');
                  if (email === 'kitchen@wsu.ac.za') setEmail('');
                }}
                style={{
                  padding: '11px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '800',
                  backgroundColor: loginRole === 'student' ? '#FFFFFF' : 'transparent',
                  color: loginRole === 'student' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: loginRole === 'student' ? 'var(--shadow-sm)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <span>🎓 Student</span>
              </button>

              {/* Staff / Kitchen Sign In Option */}
              <button
                type="button"
                onClick={() => {
                  setLoginRole('staff');
                  setErrorMessage('');
                  if (email === 'student@wsu.ac.za') setEmail('');
                }}
                style={{
                  padding: '11px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '800',
                  backgroundColor: loginRole === 'staff' ? '#FFFFFF' : 'transparent',
                  color: loginRole === 'staff' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: loginRole === 'staff' ? 'var(--shadow-sm)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <span>👨‍🍳 Staff / Kitchen</span>
              </button>
            </div>

            {/* Role Header Description */}
            <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '12px', backgroundColor: loginRole === 'student' ? 'var(--primary-subtle)' : '#FEF3C7', border: `1px solid ${loginRole === 'student' ? 'var(--primary-light)' : '#FDE68A'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '13px', color: loginRole === 'student' ? 'var(--primary)' : '#92400E', marginBottom: '2px' }}>
                {loginRole === 'student' ? <User size={15} /> : <ChefHat size={15} />}
                <span>{loginRole === 'student' ? 'Student Portal Sign In' : 'Cafeteria Staff Portal Sign In'}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                {loginRole === 'student'
                  ? 'Access the live menu, schedule your pickup times, and view your collection PINs.'
                  : 'Manage incoming kitchen orders, mark dishes ready, and verify collection PINs at Counter 1.'}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
              Create your account
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Sign up to pre-order food, choose pickup slots, and skip cafeteria queues.
            </p>

            {/* Role Selector Tabs (In Sign Up) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '6px',
              backgroundColor: '#F3F4F6',
              padding: '4px',
              borderRadius: '12px',
              marginBottom: '18px'
            }}>
              <button
                type="button"
                onClick={() => setSignUpRole('student')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: signUpRole === 'student' ? '#FFFFFF' : 'transparent',
                  color: signUpRole === 'student' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: signUpRole === 'student' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setSignUpRole('staff')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: signUpRole === 'staff' ? '#FFFFFF' : 'transparent',
                  color: signUpRole === 'staff' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: signUpRole === 'staff' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => setSignUpRole('vendor')}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: signUpRole === 'vendor' ? '#FFFFFF' : 'transparent',
                  color: signUpRole === 'vendor' ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: signUpRole === 'vendor' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Kitchen
              </button>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nikelwa"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sophazi"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              {isSignUp ? 'Campus Email Address' : (loginRole === 'staff' ? 'Staff / Kitchen Email' : 'Student Campus Email')}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder={isSignUp ? (signUpRole === 'vendor' ? 'kitchen@wsu.ac.za' : 'student@wsu.ac.za') : (loginRole === 'staff' ? 'kitchen@wsu.ac.za' : 'student@wsu.ac.za')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          {/* Phone (in Sign Up) */}
          {isSignUp && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Phone Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  placeholder="0812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
          )}

          {/* Password with Forgot Password link */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password (in Sign Up) */}
          {isSignUp && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
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
          )}

          {/* Submit Button */}
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
              boxShadow: 'var(--shadow-md)',
              border: 'none',
              marginTop: '6px'
            }}
          >
            <span>
              {isSubmitting ? 'Please wait...' : (
                isSignUp ? 'Create Account' : (
                  loginRole === 'staff' ? 'Sign In to Kitchen Portal' : 'Sign In as Student'
                )
              )}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Toggle Login vs Sign Up */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage('');
            }}
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--primary)',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '22px 0 16px',
          color: 'var(--text-light)',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
          <span>Quick Demo Logins</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
        </div>

        {/* Quick Demo Logins Tailored to Selected Mode */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleQuickDemoStudent}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: loginRole === 'student' ? 'var(--primary)' : 'var(--border)',
              backgroundColor: loginRole === 'student' ? 'var(--primary-subtle)' : '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: loginRole === 'student' ? 'var(--primary)' : 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} color="#D97706" />
            <span>Demo Student</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleQuickDemoVendor}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: loginRole === 'staff' ? 'var(--primary)' : 'var(--border)',
              backgroundColor: loginRole === 'staff' ? '#FEF3C7' : '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: loginRole === 'staff' ? '#92400E' : 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <ChefHat size={14} color="#7A0C2E" />
            <span>Demo Staff</span>
          </button>
        </div>

      </div>
    </div>
  );
}
