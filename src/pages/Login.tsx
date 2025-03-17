import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Mic, User, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

// Initialize Supabase client (replace with your Supabase URL and anon key)
const supabase = createClient(
  'https://usrcnpbhbwtwnssprdfq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcmNucGJoYnd0d25zc3ByZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjg5ODQsImV4cCI6MjA1NzgwNDk4NH0.IT7ubjHU9Rqq23-LEvVxhbEuWsj5YWugxbGWtj6-rC4'    
);

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetMessage, setResetMessage] = useState(null);

  // Form state for login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form state for signup
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const navigate = useNavigate();

  // Simple email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Handle login with Supabase
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (!isValidEmail(loginEmail)) {
      setAuthError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    if (loginPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setAuthError(error.message || 'Login failed. Please try again.');
      setIsLoading(false);
      return;
    }

    console.log('Logged in user:', data.user);
    navigate('/');
    setIsLoading(false);
  };

  // Handle signup with Supabase
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (signupName.length < 2) {
      setAuthError('Name must be at least 2 characters');
      setIsLoading(false);
      return;
    }
    if (!isValidEmail(signupEmail)) {
      setAuthError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    if (signupPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setAuthError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: { full_name: signupName }, // Store full name in user metadata
      },
    });

    if (error) {
      setAuthError(error.message || 'Signup failed. Please try again.');
      setIsLoading(false);
      return;
    }

    console.log('Signed up user:', data.user);
    setAuthError('Check your email to confirm your account!');
    setIsLoading(false);
  };

  // Handle forgot password with Supabase
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setResetMessage(null);

    if (!isValidEmail(forgotEmail)) {
      setAuthError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
    //   redirectTo: 'http://localhost:3000/reset-password', // Adjust this URL to your reset password page
    // });

    // if (error) {
    //   setAuthError(error.message || 'Failed to send reset email. Please try again.');
    //   setIsLoading(false);
    //   return;
    // }

    setResetMessage('Password reset email sent! Check your inbox.');
    setIsLoading(false);
  };

  // Toggle between login/signup/forgot password
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    setAuthError(null);
    setResetMessage(null);
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setForgotEmail('');
  };

  const showForgotPasswordForm = () => {
    setShowForgotPassword(true);
    setAuthError(null);
    setResetMessage(null);
    setForgotEmail('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '16px', backgroundColor: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <Mic style={{ width: '40px', height: '40px', color: '#007bff' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Sagan Command Center</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>Your mission control for productivity</p>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #eee' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {showForgotPassword ? 'Reset Password' : isLogin ? 'Login' : 'Create Account'}
            </h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
              {showForgotPassword
                ? 'Enter your email to reset your password'
                : isLogin
                ? 'Enter your credentials to access your account'
                : 'Fill in your details to get started'}
            </p>
          </div>

          <div style={{ padding: '24px' }}>
            {authError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                {authError}
              </div>
            )}
            {resetMessage && (
              <div style={{ backgroundColor: '#d1fae5', color: '#16a34a', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                {resetMessage}
              </div>
            )}

            {showForgotPassword ? (
              <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
                  <Mail style={{ position: 'absolute', left: '12px', top: '36px', width: '16px', height: '16px', color: '#666' }} />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 8px 8px 36px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'} <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </form>
            ) : isLogin ? (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
                  <Mail style={{ position: 'absolute', left: '12px', top: '36px', width: '16px', height: '16px', color: '#666' }} />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 8px 8px 36px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password</label>
                  <Lock style={{ position: 'absolute', left: '12px', top: '36px', width: '16px', height: '16px', color: '#666' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 40px 8px 36px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '8px', top: '32px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? 'Logging in...' : 'Login'} <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Full Name</label>
                  <User style={{ position: 'absolute', left: '12px', top: '36px', width: '16px', height: '16px', color: '#666' }} />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    style={{ width: '100%', padding: '8px 8px 8px 36px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Email</label>
                  <Mail style={{ position: 'absolute', left: '12px', top: '36px', width: '16px', height: '16px', color: '#666' }} />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 8px 8px 36px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Password</label>
                  <Lock style={{ position: 'absolute', left: '12px', top: '36px', width: '16px', height: '16px', color: '#666' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 40px 8px 36px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '8px', top: '32px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Confirm Password</label>
                  <Lock style={{ position: 'absolute', left: '12px', top: '36px', width: '16px', height: '16px', color: '#666' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 8px 8px 36px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'} <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </form>
            )}
          </div>

          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
            {!showForgotPassword && isLogin && (
              <button
                onClick={showForgotPasswordForm}
                style={{ background: 'none', border: 'none', color: '#666', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Forgot Password?
              </button>
            )}
            <button
              onClick={toggleAuthMode}
              style={{ background: 'none', border: 'none', color: '#666', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {showForgotPassword
                ? 'Back to Login'
                : isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </button>
            <p style={{ color: '#666', fontSize: '12px' }}>
              By continuing, you agree to Sagan's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;