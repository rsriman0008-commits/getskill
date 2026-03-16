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
      title: skillInput,
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
      title: skillInput,
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
        setToast({ type: 'success', message: 'Onboarding completed! Redirecting to home...' });
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Onboarding failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                />
                <p className="text-xs font-semibold text-center mt-2 text-slate-600">
                  {step === 1 ? 'Personal Info' : step === 2 ? 'Skills to Teach' : 'Skills to Learn'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Tell us about yourself</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-slate-100 border border-slate-300 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Qualification</label>
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-sm font-semibold text-slate-900 mb-2">Location (City)</label>
                <input
                  type="text"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Short Bio</label>
                <textarea
                  placeholder="Tell others about yourself, your interests..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills to Teach */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What skills can you teach?</h2>

            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Skill name (e.g., Python, Guitar, Spanish)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkillTeach()}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={skillProficiency}
                  onChange={(e) => setSkillProficiency(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>

                <button
                  onClick={handleAddSkillTeach}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Display Added Skills */}
            <div className="space-y-2">
              {formData.skillsTeach.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{skill.title}</p>
                    <p className="text-xs text-slate-600">{skill.category} • {skill.proficiency}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkillTeach(idx)}
                    className="text-red-600 hover:text-red-700 font-bold"
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
          <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What do you want to learn?</h2>

            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Skill name (e.g., JavaScript, Photography, French)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkillLearn()}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={skillUrgency}
                  onChange={(e) => setSkillUrgency(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <button
                  onClick={handleAddSkillLearn}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Display Added Skills */}
            <div className="space-y-2">
              {formData.skillsLearn.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{skill.title}</p>
                    <p className="text-xs text-slate-600">{skill.category} • Urgency: {skill.urgency}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkillLearn(idx)}
                    className="text-red-600 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold py-3 rounded-lg transition-colors"
            >
              Back
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Completing...' : 'Complete Onboarding'}
            </button>
          )}
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

export default OnboardingPage;
