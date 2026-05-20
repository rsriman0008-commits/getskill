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
      setToast({ type: 'error', message: 'Failed to load profile' });
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
        setToast({ type: 'success', message: 'Session request sent successfully!' });
        setMessage('');
        setProposedTime('');
        setSelectedCourse(null);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to send request' });
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
        setToast({ type: 'success', message: 'Profile updated successfully!' });
        setIsEditing(false);
        navigate('/profile', { replace: true });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  // Tag editing functions
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

  // Skill Teach add/remove
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

  // Skill Learn add/remove
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-slate-600 text-lg mb-4">Profile not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isEditing && isOwnProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pb-12">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8 animate-slide-in">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Edit Your Profile</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    navigate('/profile', { replace: true });
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-semibold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Jane Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Paris, France"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
                <select
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all text-sm font-medium"
                >
                  {qualifications.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Interested Fields (Tags)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                    placeholder="e.g., Photography"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all text-sm font-medium"
                  />
                  <button
                    onClick={handleAddInterest}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all"
                  >
                    Add
                  </button>
                </div>
                {/* Interest Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.interestedFields.map((field, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                      {field}
                      <button
                        onClick={() => handleRemoveInterest(idx)}
                        className="text-indigo-400 hover:text-indigo-600 font-bold transition-colors"
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
                <label className="block text-sm font-semibold text-slate-700">Short Bio</label>
                <span className="text-xs text-slate-400 font-medium">
                  {formData.bio.length} / 500 characters
                </span>
              </div>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value.slice(0, 500) })}
                placeholder="Tell the community about yourself, your goals, hobbies, or skill interests..."
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 transition-all text-sm font-medium resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skills I Teach Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                🎓 Skills I Can Teach
              </h2>

              {/* Skills List */}
              <div className="flex-1 space-y-3.5 mb-6">
                {formData.skillsTeach.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center">No teaching skills added yet.</p>
                ) : (
                  formData.skillsTeach.map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-bold text-slate-900 text-sm truncate">{skill.title}</p>
                        <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                          {skill.category} • {skill.proficiency}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveSkillTeach(idx)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Skill Form */}
              <div className="bg-indigo-50 bg-opacity-50 p-4 rounded-2xl border border-indigo-100 space-y-3 animate-fade-in">
                <p className="text-xs font-bold text-indigo-800">Add a Teaching Skill</p>
                <input
                  type="text"
                  placeholder="e.g., Python Programming"
                  value={skillInputTeach}
                  onChange={(e) => setSkillInputTeach(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-xs font-semibold"
                />
                <div className="flex gap-2">
                  <select
                    value={skillCategoryTeach}
                    onChange={(e) => setSkillCategoryTeach(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-xs font-semibold"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={skillProficiencyTeach}
                    onChange={(e) => setSkillProficiencyTeach(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-xs font-semibold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <button
                    onClick={handleAddSkillTeach}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Skills I Want to Learn Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                🔍 Skills I Want to Learn
              </h2>

              {/* Skills List */}
              <div className="flex-1 space-y-3.5 mb-6">
                {formData.skillsLearn.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center">No learning skills added yet.</p>
                ) : (
                  formData.skillsLearn.map((skill, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-bold text-slate-900 text-sm truncate">{skill.title}</p>
                        <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                          {skill.category} • Urgency: {skill.urgency}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveSkillLearn(idx)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Skill Form */}
              <div className="bg-indigo-50 bg-opacity-50 p-4 rounded-2xl border border-indigo-100 space-y-3 animate-fade-in">
                <p className="text-xs font-bold text-indigo-800">Add a Learning Skill</p>
                <input
                  type="text"
                  placeholder="e.g., Public Speaking"
                  value={skillInputLearn}
                  onChange={(e) => setSkillInputLearn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-xs font-semibold"
                />
                <div className="flex gap-2">
                  <select
                    value={skillCategoryLearn}
                    onChange={(e) => setSkillCategoryLearn(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-xs font-semibold"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={skillUrgencyLearn}
                    onChange={(e) => setSkillUrgencyLearn(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-xs font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <button
                    onClick={handleAddSkillLearn}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 pb-12">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar & Basic Info */}
            <div className="flex gap-4 flex-1">
              <div className="w-20 h-20 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                <p className="text-slate-600 text-lg">{profile.location || 'Location not specified'}</p>
                <p className="text-sm text-slate-600 mt-1">{profile.qualification || 'Qualification not specified'}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{profile.trustScore || 0}</p>
                <p className="text-xs text-slate-600">Trust Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{profile.skillsTeach?.length || 0}</p>
                <p className="text-xs text-slate-600">Teaching</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-6 text-slate-700 leading-relaxed italic">
            {profile.bio || `Hi, I'm ${profile.name}! I'm excited to share and exchange skills with others in the community.`}
          </p>

          {/* Interested Fields */}
          {profile.interestedFields?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-slate-600 mb-2.5">Interested in:</p>
              <div className="flex flex-wrap gap-2">
                {profile.interestedFields.map((field, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Teaching */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                🎓 Skills I Teach
              </h2>
              {(!profile.skillsTeach || profile.skillsTeach.length === 0) ? (
                <p className="text-slate-500 text-sm py-4 italic text-center">No skills registered to teach yet.</p>
              ) : (
                <div className="space-y-4">
                  {profile.skillsTeach.map((skill, idx) => (
                    <div key={idx} className="border border-slate-150 bg-slate-50 p-4 rounded-xl shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 text-sm">{skill.title}</h3>
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] px-3 py-1 rounded-full font-bold">
                          {skill.proficiency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-550 mb-3">{skill.category}</p>
                      <StarRating rating={skill.rating} size="sm" />
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">({skill.ratingCount || 0} reviews)</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Learning */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                🔍 Skills I Want to Learn
              </h2>
              {(!profile.skillsLearn || profile.skillsLearn.length === 0) ? (
                <p className="text-slate-500 text-sm py-4 italic text-center">No skills registered to learn yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3.5">
                  {profile.skillsLearn.map((skill, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
                      <p className="font-bold text-slate-900 text-sm">{skill.title}</p>
                      <p className="text-[10px] text-slate-600 font-semibold mt-1">
                        {skill.category} • Urgency: <span className={`font-bold ${skill.urgency === 'High' ? 'text-red-500' : skill.urgency === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>{skill.urgency}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Send Request or Edit Profile */}
          <div className="lg:col-span-1">
            {isOwnProfile ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Profile Actions</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all shadow-md mb-3"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/provide-service')}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-bold transition-all border border-slate-200"
                >
                  Register Course
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Send Request</h3>

                {courses.length === 0 ? (
                  <p className="text-slate-600 text-sm italic">No courses available from this instructor</p>
                ) : (
                  <div className="space-y-4">
                    {/* Course Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Select Course
                      </label>
                      <select
                        value={selectedCourse?._id || ''}
                        onChange={(e) => {
                          const selected = courses.find(c => c._id === e.target.value);
                          setSelectedCourse(selected);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Choose a course</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>
                            {course.courseName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Why are you interested in this skill?"
                        rows="3"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none animate-fade-in"
                      />
                    </div>

                    {/* Proposed Time */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Proposed Time
                      </label>
                      <input
                        type="datetime-local"
                        value={proposedTime}
                        onChange={(e) => setProposedTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Mode */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Mode
                      </label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Online">Online</option>
                        <option value="In-person">In-person</option>
                      </select>
                    </div>

                    {/* Send Button */}
                    <button
                      onClick={handleSendRequest}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md"
                    >
                      Send Session Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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

export default ProfilePage;
