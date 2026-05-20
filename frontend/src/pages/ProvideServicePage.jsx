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
      whatYouLearn: [...prev.whatYouLearn, learningInput.trim()]
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
      keyFeatures: [...prev.keyFeatures, featureInput.trim()]
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
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-3xl"></div>
      </div>

      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10 animate-fade-in">
        <div className="glass-card p-8 md:p-10 border-white/5 glow-purple">
          {/* Header */}
          <div className="mb-10 text-center md:text-left border-b border-white/5 pb-6">
            <h1 className="text-3xl font-black">
              Register Your <span className="gradient-text">Teaching Course</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Teach others your core strengths in exchange for other skills. Set up your course syllabus below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Course Title *</label>
              <input
                type="text"
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="e.g., Figma UI/UX Workshop"
                className="input-dark"
              />
            </div>

            {/* Category & Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Target Proficiency *</label>
                <select
                  name="targetLevel"
                  value={formData.targetLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
                >
                  <option value="Beginner">📈 Beginner Friendly</option>
                  <option value="Intermediate">📈 Intermediate Level</option>
                  <option value="Advanced">📈 Advanced Level</option>
                </select>
              </div>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Your Credentials / Qualification *</label>
              <textarea
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="Describe your background or practical projects you completed in this field..."
                rows="3"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-sm leading-relaxed"
              />
            </div>

            {/* What Students Learn */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Learning Outcomes * (At least one)</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={learningInput}
                  onChange={(e) => setLearningInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLearning(); } }}
                  placeholder="e.g., Master layout design grids"
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddLearning}
                  className="px-5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm transition-all"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.whatYouLearn.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                    <p className="text-slate-200 text-xs font-medium">{item}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveLearning(idx)}
                      className="text-red-400 hover:text-red-300 font-bold px-2 py-1 text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Key Course Highlights (Max 5)</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                  placeholder="e.g., Weekly live code reviews"
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                  disabled={formData.keyFeatures.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={formData.keyFeatures.length >= 5}
                  className="px-5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.keyFeatures.map((feature, idx) => (
                  <div key={idx} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="font-bold hover:text-white transition-colors ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Detailed Course Description *</label>
              <textarea
                name="overview"
                value={formData.overview}
                onChange={handleChange}
                placeholder="Give a beautiful summary of what the course covers and what is expected of the exchange student..."
                rows="4"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-sm leading-relaxed"
              />
            </div>

            {/* Time Preference */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">Preferred Tutoring Times *</label>
              <div className="flex flex-wrap gap-2">
                {timeOptions.map(time => {
                  const isSelected = formData.timePreference.includes(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimePreference(time)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Teaching Format Mode *</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
              >
                <option value="Online">🌐 Online Tutoring Mode</option>
                <option value="In-person">🏠 In-person Meetups</option>
                <option value="Both">✨ Mixed / Both Formats</option>
              </select>
            </div>

            {/* Exchange Wanted */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">What skill swap are you seeking? (Optional)</label>
              <input
                type="text"
                name="exchangeWanted"
                value={formData.exchangeWanted}
                onChange={handleChange}
                placeholder="e.g., Looking for someone to teach me French"
                className="input-dark"
              />
            </div>

            {/* Submit / Cancel Actions */}
            <div className="flex gap-4 pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3.5 text-sm font-bold relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Registering...</span>
                  </div>
                ) : (
                  'Launch Course 🚀'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ProvideServicePage;
