import React, { useState } from 'react';
import { 
  X, User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2, 
  AlertCircle, ArrowRight, ShieldCheck, UserCheck, KeyRound
} from 'lucide-react';
import { signUpUser, logInUser } from '../data/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, personas = {}, defaultMode = 'signup' }) {
  const [isLoginMode, setIsLoginMode] = useState(defaultMode === 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    personaId: 'techie'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Compute password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score, label: 'Medium', color: '#f59e0b' };
    return { score, label: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLoginMode) {
        // Handle Login
        const res = await logInUser({
          email: formData.email,
          password: formData.password
        });

        if (res && res.success) {
          setSuccessMessage(`Welcome back, ${res.user.name}!`);
          setTimeout(() => {
            onAuthSuccess(res.user);
            onClose();
          }, 800);
        } else {
          setErrorMessage(res?.error || 'Invalid email or password.');
        }
      } else {
        // Handle Signup
        if (!formData.name.trim()) {
          setErrorMessage('Full name is required.');
          setLoading(false);
          return;
        }

        const res = await signUpUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          personaId: formData.personaId
        });

        if (res && res.success) {
          setSuccessMessage('Account created successfully! Connecting your persona...');
          setTimeout(() => {
            onAuthSuccess(res.user);
            onClose();
          }, 900);
        } else {
          setErrorMessage(res?.error || 'Signup failed. Please try again.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPersona = personas[formData.personaId] || { name: 'Tech Enthusiast', color: '#3b82f6' };

  return (
    <div className="auth-modal-overlay fade-in" onClick={onClose}>
      <div className="auth-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-logo-badge">
            <Sparkles size={24} className="text-blue" />
          </div>
          <h2 className="auth-title">
            {isLoginMode ? 'Welcome Back to Discovery Engine' : 'Create Your Engine AI Account'}
          </h2>
          <p className="auth-subtitle">
            {isLoginMode 
              ? 'Log in to sync your multi-intent recommendations & persona profile' 
              : 'Sign up to personalize search vectors, save cart bundles & train AI models'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-mode-toggle">
          <button 
            type="button"
            className={`mode-btn ${!isLoginMode ? 'active' : ''}`}
            onClick={() => { setIsLoginMode(false); setErrorMessage(''); setSuccessMessage(''); }}
          >
            <UserCheck size={16} /> Sign Up
          </button>
          <button 
            type="button"
            className={`mode-btn ${isLoginMode ? 'active' : ''}`}
            onClick={() => { setIsLoginMode(true); setErrorMessage(''); setSuccessMessage(''); }}
          >
            <KeyRound size={16} /> Log In
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="auth-alert error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success-alert">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  className="auth-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                placeholder="alex.rivera@example.com"
                className="auth-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={isLoginMode ? 'Enter your password' : 'At least 6 characters'}
                className="auth-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button 
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Meter for Signup */}
            {!isLoginMode && formData.password.length > 0 && (
              <div className="password-strength-bar">
                <div className="strength-track">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(strength.score / 5) * 100}%`,
                      backgroundColor: strength.color 
                    }}
                  ></div>
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label} Password
                </span>
              </div>
            )}
          </div>

          {/* Persona Selection Dropdown (Only on Signup) */}
          {!isLoginMode && (
            <div className="form-group">
              <label className="form-label">
                Select Primary AI Shopping Persona
              </label>
              <div className="persona-select-card" style={{ borderLeft: `4px solid ${selectedPersona.color}` }}>
                <select
                  className="auth-persona-select"
                  value={formData.personaId}
                  onChange={(e) => setFormData({ ...formData, personaId: e.target.value })}
                >
                  {Object.keys(personas).map((key) => (
                    <option key={key} value={key}>
                      {personas[key].name} ({personas[key].avgSpend})
                    </option>
                  ))}
                </select>
                <p className="persona-hint">{selectedPersona.description}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <div className="spinner-sm"></div>
            ) : (
              <>
                <span>{isLoginMode ? 'Log In to Account' : 'Complete Registration'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="auth-modal-footer">
          <ShieldCheck size={14} className="text-green" />
          <span>DPDP Privacy Compliant • Passwords hashed with 1000-round SHA-512 PBKDF2</span>
        </div>
      </div>
    </div>
  );
}
