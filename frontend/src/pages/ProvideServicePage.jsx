import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const ProvideServicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    courseName: '',
    category: 'Technology',
    qualification: '',
    targetLevel: 'Beginner',
    whatYouLearn: [],
    keyFeatures: [],
    overview: '',
    timePreference: [],
    mode: 'Online',
    exchangeWanted: ''
  });
  const [learningInput, setLearningInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  const categories = ['Technology', 'Music', 'Language', 'Art', 'Cooking', 'Fitness', 'Business', 'Other'];
  const timeOptions = ['Morning', 'Afternoon', 'Evening', 'Weekends', 'Flexible'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLearning = () => {
    if (!learningInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      whatYouLearn: [...prev.whatYouLearn, learningInput]
    }));
    setLearningInput('');
  };

  const handleRemoveLearning = (index) => {
    setFormData(prev => ({
      ...prev,
      whatYouLearn: prev.whatYouLearn.filter((_, i) => i !== index)
    }));
  };

  const handleAddFeature = () => {
    if (!featureInput.trim() || formData.keyFeatures.length >= 5) return;
    setFormData(prev => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, featureInput]
    }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index)
    }));
  };

  const handleTimePreference = (time) => {
    setFormData(prev => {
      const updated = [...prev.timePreference];
      if (updated.includes(time)) {
        return { ...prev, timePreference: updated.filter(t => t !== time) };
      } else {
        updated.push(time);
        return { ...prev, timePreference: updated };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.courseName.trim()) {
      setToast({ type: 'error', message: 'Course name is required' });
      return;
    }
    if (!formData.qualification.trim()) {
      setToast({ type: 'error', message: 'Your qualification is required' });
      return;
    }
    if (formData.whatYouLearn.length === 0) {
      setToast({ type: 'error', message: 'Add at least one learning outcome' });
      return;
    }
    if (!formData.overview.trim()) {
      setToast({ type: 'error', message: 'Course overview is required' });
      return;
    }
    if (formData.timePreference.length === 0) {
      setToast({ type: 'error', message: 'Select at least one time preference' });
      return;
    }

    setLoading(true);

    try {
      const response = await courseAPI.createCourse(formData);

      if (response.data.success) {
        setToast({ type: 'success', message: 'Course registered successfully!' });
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to register course' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Register Your Course</h1>
            <p className="text-slate-600">Share your expertise and help others learn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Course Name *</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="e.g., Learn Python Basics"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category & Level */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Target Level *</label>
                <select
                  name="targetLevel"
                  value={formData.targetLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Your Qualification for This Skill *</label>
              <textarea
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="Describe your experience, certifications, achievements..."
                rows="3"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* What Students Learn */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">What Students Will Learn *</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={learningInput}
                  onChange={(e) => setLearningInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddLearning()}
                  placeholder="Add learning outcome..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddLearning}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.whatYouLearn.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg">
                    <p className="text-slate-900">{item}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveLearning(idx)}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Key Features (max 5)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  placeholder="e.g., Interactive exercises, Live sessions..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={formData.keyFeatures.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={formData.keyFeatures.length >= 5}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keyFeatures.map((feature, idx) => (
                  <div key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="font-bold hover:text-blue-900"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Course Overview / Description *</label>
              <textarea
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                placeholder="Provide a detailed description of your course..."
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Time Preference */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Time Preference *</label>
              <div className="flex flex-wrap gap-3">
                {timeOptions.map(time => (
                  <label key={time} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.timePreference.includes(time)}
                      onChange={() => handleTimePreference(time)}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-slate-700">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Mode *</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Online">Online</option>
                <option value="In-person">In-person</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {/* Exchange Wanted */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">What Do You Want in Exchange? (Optional)</label>
              <input
                type="text"
                name="exchangeWanted"
                value={formData.exchangeWanted}
                onChange={handleChange}
                placeholder="Leave blank if open to any exchange. e.g., 'Looking for Python tutoring'"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {loading ? 'Registering...' : 'Register Course'}
              </button>
            </div>
          </form>
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

export default ProvideServicePage;
