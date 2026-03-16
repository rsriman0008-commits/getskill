import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password);
        if (result.success) {
          setToast({ type: 'success', message: 'Login successful!' });
          setTimeout(() => {
            navigate(result.isOnboarded ? '/' : '/onboarding');
          }, 1500);
        } else {
          setToast({ type: 'error', message: result.error });
        }
      } else {
        result = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.confirmPassword
        );
        if (result.success) {
          setToast({ type: 'success', message: 'Registration successful! Redirecting...' });
          setTimeout(() => {
            navigate('/onboarding');
          }, 1500);
        } else {
          setToast({ type: 'error', message: result.error });
        }
      }
    } catch (error) {
      setToast({ type: 'error', message: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen primary-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full primary-gradient flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            GS
          </div>
          <h1 className="text-3xl font-bold text-slate-900">GetSkills</h1>
          <p className="text-slate-600 text-sm mt-2">Exchange skills locally, learn together</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {/* Toggle Between Login/Register */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className="ml-2 text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AuthPage;
