import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import Toast from '../components/Toast';

const OnboardingPage = () => {
  const { user, completeOnboarding, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    qualification: 'Other',
    location: '',
    bio: '',
    interestedFields: [],
    skillsTeach: [],
    skillsLearn: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [skillCategory, setSkillCategory] = useState('Technology');
  const [skillProficiency, setSkillProficiency] = useState('Beginner');
  const [skillUrgency, setSkillUrgency] = useState('Medium');

  const categories = ['Technology', 'Music', 'Language', 'Art', 'Cooking', 'Fitness', 'Business', 'Other'];

  const handleAddSkillTeach = () => {
    if (!skillInput.trim()) return;

    const newSkill = {
      title: skillInput.trim(),
      category: skillCategory,
      proficiency: skillProficiency
    };

    setFormData(prev => ({
      ...prev,
      skillsTeach: [...prev.skillsTeach, newSkill]
    }));

    setSkillInput('');
    setSkillProficiency('Beginner');
  };

  const handleAddSkillLearn = () => {
    if (!skillInput.trim()) return;

    const newSkill = {
      title: skillInput.trim(),
      category: skillCategory,
      urgency: skillUrgency
    };

    setFormData(prev => ({
      ...prev,
      skillsLearn: [...prev.skillsLearn, newSkill]
    }));

    setSkillInput('');
    setSkillUrgency('Medium');
  };

  const handleRemoveSkillTeach = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsTeach: prev.skillsTeach.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveSkillLearn = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsLearn: prev.skillsLearn.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.location.trim()) {
        setToast({ type: 'error', message: 'Please enter your location' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formData.skillsTeach.length === 0) {
        setToast({ type: 'error', message: 'Please add at least one skill you can teach' });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (formData.skillsLearn.length === 0) {
      setToast({ type: 'error', message: 'Please add at least one skill you want to learn' });
      return;
    }

    setLoading(true);

    try {
      const response = await userAPI.completeOnboarding(formData);

      if (response.data.success) {
        updateUser(response.data.user);
        completeOnboarding();
        setToast({ type: 'success', message: 'Onboarding completed! Redirecting home...' });
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Onboarding failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Background ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl animate-fade-in py-8">
        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map(step => {
              const isActive = step === currentStep;
              const isCompleted = step < currentStep;
              return (
                <div key={step} className="flex-1 relative px-2">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 shadow-md shadow-purple-500/25' 
                        : isCompleted 
                        ? 'bg-purple-600' 
                        : 'bg-white/10'
                    }`}
                  />
                  <p className={`text-[10px] font-bold text-center mt-3 uppercase tracking-wider ${
                    isActive ? 'text-purple-300' : 'text-slate-500'
                  }`}>
                    {step === 1 ? 'Personal Info' : step === 2 ? 'Skills to Teach' : 'Skills to Learn'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="glass-card p-8 border-white/5 glow-purple animate-scale-in">
            <h2 className="text-2xl font-black mb-1">Tell us about <span className="gradient-text">yourself</span></h2>
            <p className="text-xs text-slate-400 mb-6">Let's complete your profile so you can get matched correctly.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 cursor-not-allowed text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Qualification</label>
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="Self-taught">Self-taught</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Location (City)</label>
                <input
                  type="text"
                  placeholder="e.g., London, UK"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Bio / Intro</label>
                <textarea
                  placeholder="Tell others what you do, what you are passionate about, and your exchange goals..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills to Teach */}
        {currentStep === 2 && (
          <div className="glass-card p-8 border-white/5 glow-purple animate-scale-in">
            <h2 className="text-2xl font-black mb-1">What skills can you <span className="gradient-text">teach?</span></h2>
            <p className="text-xs text-slate-400 mb-6">List matching talents you can share with the community.</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Skill Title</label>
                <input
                  type="text"
                  placeholder="Skill name (e.g., Python, Guitar, Spanish)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillTeach(); } }}
                  className="input-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Proficiency Level</label>
                  <select
                    value={skillProficiency}
                    onChange={(e) => setSkillProficiency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
                  >
                    <option value="Beginner">📈 Beginner</option>
                    <option value="Intermediate">📈 Intermediate</option>
                    <option value="Expert">📈 Expert</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSkillTeach}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all text-sm"
              >
                + Add Teaching Skill
              </button>
            </div>

            {/* Display Added Skills */}
            <div className="space-y-3.5">
              {formData.skillsTeach.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div>
                    <p className="font-extrabold text-white text-sm">{skill.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Category: <span className="text-purple-300">{skill.category}</span> • Level: <span className="text-cyan-300">{skill.proficiency}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkillTeach(idx)}
                    className="text-red-400 hover:text-red-300 font-bold px-2 py-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Skills to Learn */}
        {currentStep === 3 && (
          <div className="glass-card p-8 border-white/5 glow-purple animate-scale-in">
            <h2 className="text-2xl font-black mb-1">What do you want to <span className="gradient-text">learn?</span></h2>
            <p className="text-xs text-slate-400 mb-6">List subjects and fields you hope to receive coaching in.</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Skill Name</label>
                <input
                  type="text"
                  placeholder="Skill name (e.g., JavaScript, French, Photography)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkillLearn(); } }}
                  className="input-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={skillCategory}
                    onChange={(e) => setSkillCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Learning Urgency</label>
                  <select
                    value={skillUrgency}
                    onChange={(e) => setSkillUrgency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSkillLearn}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all text-sm"
              >
                + Add Learning Goal
              </button>
            </div>

            {/* Display Added Skills */}
            <div className="space-y-3.5">
              {formData.skillsLearn.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div>
                    <p className="font-extrabold text-white text-sm">{skill.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Category: <span className="text-purple-300">{skill.category}</span> • Urgency: <span className="text-pink-300">{skill.urgency}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkillLearn(idx)}
                    className="text-red-400 hover:text-red-300 font-bold px-2 py-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl text-sm transition-all"
            >
              Back
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 btn-primary py-3.5 text-sm"
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-900/20"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving Profile...</span>
                </div>
              ) : (
                'Complete Setup 🚀'
              )}
            </button>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default OnboardingPage;
