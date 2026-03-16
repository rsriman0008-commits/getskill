import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, sessionAPI, courseAPI } from '../utils/api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import Toast from '../components/Toast';

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = !id || id === user?._id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [toast, setToast] = useState(null);
  const [message, setMessage] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [mode, setMode] = useState('Online');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar & Basic Info */}
            <div className="flex gap-4 flex-1">
              <div className="w-20 h-20 rounded-full primary-gradient flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                <p className="text-slate-600 text-lg">{profile.location}</p>
                <p className="text-sm text-slate-600 mt-1">{profile.qualification}</p>
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
          <p className="mt-6 text-slate-700">{profile.bio}</p>

          {/* Interested Fields */}
          {profile.interestedFields?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-600 mb-2">Interested in:</p>
              <div className="flex flex-wrap gap-2">
                {profile.interestedFields.map((field, idx) => (
                  <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
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
            {(profile.skillsTeach?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Skills I Teach</h2>
                <div className="space-y-4">
                  {profile.skillsTeach.map((skill, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900">{skill.title}</h3>
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold">
                          {skill.proficiency}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{skill.category}</p>
                      <StarRating rating={skill.rating} size="sm" />
                      <p className="text-xs text-slate-500 mt-2">({skill.ratingCount || 0} reviews)</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Learning */}
            {(profile.skillsLearn?.length ?? 0) > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Skills I Want to Learn</h2>
                <div className="flex flex-wrap gap-3">
                  {profile.skillsLearn.map((skill, idx) => (
                    <div key={idx} className="bg-slate-100 px-4 py-2 rounded-lg">
                      <p className="font-semibold text-slate-900 text-sm">{skill.title}</p>
                      <p className="text-xs text-slate-600">{skill.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Send Request or Edit Profile */}
          <div className="lg:col-span-1">
            {isOwnProfile ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Profile Actions</h3>
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors mb-3"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/provide-service')}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 py-3 rounded-lg font-semibold transition-colors"
                >
                  Register Course
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Send Request</h3>

                {courses.length === 0 ? (
                  <p className="text-slate-600 text-sm">No courses available from this instructor</p>
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
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
