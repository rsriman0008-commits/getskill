import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, sessionAPI, courseAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import Toast from '../components/Toast';

const ProfilePage = ({ isEditMode = false }) => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOwnProfile = !id || id === user?._id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [toast, setToast] = useState(null);
  
  // For viewing/requesting session
  const [message, setMessage] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [mode, setMode] = useState('Online');
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(isEditMode || searchParams.get('edit') === 'true');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    qualification: 'Other',
    bio: '',
    interestedFields: [],
    skillsTeach: [],
    skillsLearn: []
  });

  // State for skill adding inputs
  const [interestInput, setInterestInput] = useState('');
  const [skillInputTeach, setSkillInputTeach] = useState('');
  const [skillCategoryTeach, setSkillCategoryTeach] = useState('Technology');
  const [skillProficiencyTeach, setSkillProficiencyTeach] = useState('Beginner');
  
  const [skillInputLearn, setSkillInputLearn] = useState('');
  const [skillCategoryLearn, setSkillCategoryLearn] = useState('Technology');
  const [skillUrgencyLearn, setSkillUrgencyLearn] = useState('Medium');

  const categories = ['Technology', 'Music', 'Language', 'Art', 'Cooking', 'Fitness', 'Business', 'Other'];
  const qualifications = ['B.Tech', 'MBA', 'Self-taught', 'High School', 'Diploma', 'Other'];

  useEffect(() => {
    loadProfile();
  }, [id]);

  useEffect(() => {
    const isEditParam = searchParams.get('edit') === 'true';
    if (isEditParam || isEditMode) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [searchParams, isEditMode]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        location: profile.location || '',
        qualification: profile.qualification || 'Other',
        bio: profile.bio || '',
        interestedFields: profile.interestedFields || [],
        skillsTeach: profile.skillsTeach || [],
        skillsLearn: profile.skillsLearn || []
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (isOwnProfile) {
        if (!user) {
          navigate('/auth');
          return;
        }
        const res = await userAPI.getMe();
        if (res.data.success) {
          setProfile(res.data.user);
        }
      } else {
        const res = await userAPI.getUser(id);
        if (res.data.success) {
          setProfile(res.data.user);
          // Load their courses
          const coursesRes = await courseAPI.getAllCourses({ teacher: id });
          if (coursesRes.data.success) {
            setCourses(coursesRes.data.courses);
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setToast({ type: 'error', message: 'Failed to load profile details' });
      if (error.response?.status === 401) {
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedCourse || !proposedTime) {
      setToast({ type: 'error', message: 'Please select a course and propose a time' });
      return;
    }

    try {
      const response = await sessionAPI.createSession({
        recipientId: profile._id,
        courseId: selectedCourse._id,
        message,
        proposedTime: new Date(proposedTime),
        mode
      });

      if (response.data.success) {
        setToast({ type: 'success', message: 'Session swap request sent successfully!' });
        setMessage('');
        setProposedTime('');
        setSelectedCourse(null);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to request session' });
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      setToast({ type: 'error', message: 'Name is required' });
      return;
    }
    if (formData.name.trim().length < 3) {
      setToast({ type: 'error', message: 'Name must be at least 3 characters' });
      return;
    }

    try {
      setSaving(true);
      const res = await userAPI.updateProfile(formData);
      if (res.data.success) {
        setProfile(res.data.user);
        updateUser(res.data.user);
        setToast({ type: 'success', message: 'Profile details saved successfully!' });
        setIsEditing(false);
        navigate('/profile', { replace: true });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to save profile changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterest = () => {
    const val = interestInput.trim();
    if (!val) return;
    if (formData.interestedFields.includes(val)) {
      setToast({ type: 'error', message: 'Interest already exists' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      interestedFields: [...prev.interestedFields, val]
    }));
    setInterestInput('');
  };

  const handleRemoveInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interestedFields: prev.interestedFields.filter((_, i) => i !== index)
    }));
  };

  const handleAddSkillTeach = () => {
    const title = skillInputTeach.trim();
    if (!title) return;
    const newSkill = {
      title,
      category: skillCategoryTeach,
      proficiency: skillProficiencyTeach
    };
    setFormData(prev => ({
      ...prev,
      skillsTeach: [...prev.skillsTeach, newSkill]
    }));
    setSkillInputTeach('');
  };

  const handleRemoveSkillTeach = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsTeach: prev.skillsTeach.filter((_, i) => i !== index)
    }));
  };

  const handleAddSkillLearn = () => {
    const title = skillInputLearn.trim();
    if (!title) return;
    const newSkill = {
      title,
      category: skillCategoryLearn,
      urgency: skillUrgencyLearn
    };
    setFormData(prev => ({
      ...prev,
      skillsLearn: [...prev.skillsLearn, newSkill]
    }));
    setSkillInputLearn('');
  };

  const handleRemoveSkillLearn = (index) => {
    setFormData(prev => ({
      ...prev,
      skillsLearn: prev.skillsLearn.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-[500px]">
          <div className="w-12 h-12 border-4 border-white/5 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[500px] text-center px-4">
          <div className="text-5xl mb-4">👤</div>
          <p className="text-slate-400 text-lg mb-6">Profile details could not be found.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary py-3 px-6"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isEditing && isOwnProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl"></div>
        </div>

        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10 animate-fade-in">
          {/* Header Card */}
          <div className="glass-card p-8 mb-8 border-white/5 glow-purple">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-white/5 pb-5">
              <div>
                <h1 className="text-2xl font-black">Edit Your <span className="gradient-text">Profile</span></h1>
                <p className="text-xs text-slate-400 mt-1">Configure your personal information and exchange catalogs.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    navigate('/profile', { replace: true });
                  }}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-5 py-2.5 btn-primary text-xs font-bold"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="input-dark text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  className="input-dark text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Qualification</label>
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm cursor-pointer"
                >
                  {qualifications.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Interested Fields (Tags)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                    placeholder="e.g., Machine Learning"
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-xs"
                  />
                  <button
                    onClick={handleAddInterest}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interestedFields.map((field, idx) => (
                    <span key={idx} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      {field}
                      <button
                        onClick={() => handleRemoveInterest(idx)}
                        className="text-purple-400 hover:text-white font-bold transition-colors ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Biography</label>
                <span className="text-[10px] text-slate-500 font-bold">
                  {formData.bio.length} / 500 characters
                </span>
              </div>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 500) })}
                placeholder="Give a brief biography about your skills, past projects and targets..."
                rows="4"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-sm leading-relaxed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skills I Teach Edit */}
            <div className="glass-card p-6 border-white/5 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  🎓 Skills I Can Teach
                </h2>
                <div className="space-y-2 mb-6">
                  {formData.skillsTeach.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center">No teaching skills added yet.</p>
                  ) : (
                    formData.skillsTeach.map((skill, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                        <div>
                          <p className="font-extrabold text-white text-xs">{skill.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {skill.category} • {skill.proficiency}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveSkillTeach(idx)}
                          className="text-red-400 hover:text-red-300 font-bold px-2 py-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add form */}
              <div className="bg-slate-900 border border-white/10 p-4 rounded-xl space-y-3">
                <p className="text-xs font-bold text-purple-400">Add a Teaching Skill</p>
                <input
                  type="text"
                  placeholder="e.g., Python, Piano"
                  value={skillInputTeach}
                  onChange={(e) => setSkillInputTeach(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white"
                />
                <div className="flex gap-2">
                  <select
                    value={skillCategoryTeach}
                    onChange={(e) => setSkillCategoryTeach(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-[10px] text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={skillProficiencyTeach}
                    onChange={(e) => setSkillProficiencyTeach(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-[10px] text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    onClick={handleAddSkillTeach}
                    className="px-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Skills I Learn Edit */}
            <div className="glass-card p-6 border-white/5 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  🔍 Skills I Want to Learn
                </h2>
                <div className="space-y-2 mb-6">
                  {formData.skillsLearn.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center">No learning skills added yet.</p>
                  ) : (
                    formData.skillsLearn.map((skill, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
                        <div>
                          <p className="font-extrabold text-white text-xs">{skill.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {skill.category} • Urgency: {skill.urgency}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveSkillLearn(idx)}
                          className="text-red-400 hover:text-red-300 font-bold px-2 py-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add form */}
              <div className="bg-slate-900 border border-white/10 p-4 rounded-xl space-y-3">
                <p className="text-xs font-bold text-cyan-400">Add a Learning Goal</p>
                <input
                  type="text"
                  placeholder="e.g., Graphic Design, French"
                  value={skillInputLearn}
                  onChange={(e) => setSkillInputLearn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white"
                />
                <div className="flex gap-2">
                  <select
                    value={skillCategoryLearn}
                    onChange={(e) => setSkillCategoryLearn(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-[10px] text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={skillUrgencyLearn}
                    onChange={(e) => setSkillUrgencyLearn(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-[10px] text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <button
                    onClick={handleAddSkillLearn}
                    className="px-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Viewing profile
  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl"></div>
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 animate-fade-in">
        {/* Header Profile Dashboard */}
        <div className="glass-card p-8 border-white/5 glow-purple mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            {/* Avatar block */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-black text-4xl flex-shrink-0 shadow-xl shadow-purple-500/25 animate-glow">
              {profile.name?.[0]?.toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black">{profile.name}</h1>
                  <p className="text-slate-400 text-sm mt-1.5 flex items-center justify-center md:justify-start gap-1">
                    <span>📍</span> {profile.location || 'Location Not Listed'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    🎓 Qualification: <span className="text-purple-300">{profile.qualification || 'Self-taught'}</span>
                  </p>
                </div>
                
                {/* Score stats */}
                <div className="flex gap-4 justify-center">
                  <div className="bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl text-center min-w-[80px]">
                    <p className="text-xl font-black text-cyan-400">{profile.trustScore || 0}%</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Trust</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl text-center min-w-[80px]">
                    <p className="text-xl font-black text-purple-400">{profile.skillsTeach?.length || 0}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Teach</p>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <p className="mt-5 text-slate-300 text-sm leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/5 max-w-3xl mx-auto md:mx-0">
                "{profile.bio || `Hi, I'm ${profile.name}! I'm passionate about exchanging values and skills with people locally.`}"
              </p>

              {/* Interested Fields Tags */}
              {profile.interestedFields?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.interestedFields.map((field, idx) => (
                    <span key={idx} className="bg-purple-500/20 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold">
                      {field}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main profile listings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills I Teach */}
            <div className="glass-card p-6 border-white/5">
              <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                🎓 Skills Registered to Teach
              </h2>
              {(!profile.skillsTeach || profile.skillsTeach.length === 0) ? (
                <p className="text-slate-500 text-xs italic py-6 text-center">This member has not listed teaching credentials yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skillsTeach.map((skill, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-extrabold text-white text-sm leading-snug">{skill.title}</h3>
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {skill.proficiency}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-3">{skill.category}</p>
                      
                      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                        <StarRating rating={skill.rating} size="sm" />
                        <span className="text-[10px] text-slate-400 font-semibold">({skill.ratingCount || 0} reviews)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills I Learn */}
            <div className="glass-card p-6 border-white/5">
              <h2 className="text-lg font-black text-white mb-5 flex items-center gap-2">
                🔍 Learning Aspirations / Urgencies
              </h2>
              {(!profile.skillsLearn || profile.skillsLearn.length === 0) ? (
                <p className="text-slate-500 text-xs italic py-6 text-center">This member has not listed learning aspirations yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {profile.skillsLearn.map((skill, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 px-4 py-3 rounded-xl shadow-sm">
                      <p className="font-extrabold text-white text-sm">{skill.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-1.5">
                        <span>{skill.category}</span> • Urgency: 
                        <span className={`font-bold uppercase tracking-wider ${
                          skill.urgency === 'High' 
                            ? 'text-rose-400' 
                            : skill.urgency === 'Medium' 
                            ? 'text-amber-400' 
                            : 'text-emerald-400'
                        }`}>
                          {skill.urgency}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Request Schedule Sidebar */}
          <div className="lg:col-span-1">
            {isOwnProfile ? (
              <div className="glass-card p-6 border-white/5 glow-purple sticky top-24">
                <h3 className="text-lg font-black text-white mb-4">Profile Actions</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full btn-primary py-3 text-xs mb-3 font-bold"
                >
                  ⚙️ Edit Settings
                </button>
                <button
                  onClick={() => navigate('/provide-service')}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all text-xs"
                >
                  🏫 Register Course
                </button>
              </div>
            ) : (
              <div className="glass-card p-6 border-white/5 glow-cyan sticky top-24">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <span>📅</span> Request Class Swap
                </h3>

                {courses.length === 0 ? (
                  <p className="text-slate-400 text-xs italic py-4 text-center">This teacher has not registered active classes yet.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Course select */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Course</label>
                      <select
                        value={selectedCourse?._id || ''}
                        onChange={(e) => {
                          const selected = courses.find(c => c._id === e.target.value);
                          setSelectedCourse(selected);
                        }}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-xs cursor-pointer"
                      >
                        <option value="">Choose a course</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>
                            {course.courseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Proposal message */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Proposal Note</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Briefly mention why you'd like to swap this skill and what you can offer in return..."
                        rows="3"
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-xs leading-relaxed"
                      />
                    </div>

                    {/* Propose Date */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Proposed Time</label>
                      <input
                        type="datetime-local"
                        value={proposedTime}
                        onChange={(e) => setProposedTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-xs cursor-pointer"
                      />
                    </div>

                    {/* Form mode */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Swap Mode</label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-xs cursor-pointer"
                      >
                        <option value="Online">🌐 Online Exchange</option>
                        <option value="In-person">🏠 In-person Swap</option>
                      </select>
                    </div>

                    {/* Propose action button */}
                    <button
                      onClick={handleSendRequest}
                      className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3.5 rounded-xl text-xs shadow-md shadow-purple-900/25 transition-all"
                    >
                      Propose Class Swap 🗓️
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ProfilePage;
