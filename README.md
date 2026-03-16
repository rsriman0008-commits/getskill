# 🎓 GetSkills - Local Skill Exchange Platform

A modern web application that enables users to exchange skills locally without monetary transactions. Users can teach skills they know and learn skills they want from others in their community.

## 🌟 Features

- **Skill Matching**: Intelligent algorithm that matches users based on complementary skills
- **Course Registration**: Teachers can create and manage courses they want to teach
- **Session Requests**: Learners can request sessions with teachers for specific courses
- **Real-time Chat**: Socket.io powered real-time messaging and notifications
- **Trust Score System**: Build reputation through successful skill exchanges
- **Advanced Search**: Find teachers by skill, category, rating, and more
- **Responsive Design**: Mobile-friendly interface with beautiful UI

## 📦 Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** + **bcrypt** - Authentication and security
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time updates
- **Tailwind CSS** - Styling (via CDN)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd skillswap/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillswap
   JWT_SECRET=your_super_secret_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```
   
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend folder**
   ```bash
   cd skillswap/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env.local** (optional, for custom API URL)
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   App runs on `http://localhost:5173`

## 📁 Project Structure

```
skillswap/
├── backend/
│   ├── server.js                 # Main server entry point
│   ├── package.json
│   ├── .env.example
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Course.js            # Course schema
│   │   └── Session.js           # Session schema
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── users.js             # User management
│   │   ├── courses.js           # Course management
│   │   ├── sessions.js          # Session requests
│   │   └── search.js            # Search functionality
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   └── utils/
│       └── matchingAlgorithm.js # Skill matching logic
│
└── frontend/
    ├── index.html               # HTML with Tailwind CDN
    ├── package.json
    ├── vite.config.js           # Vite configuration
    ├── src/
    │   ├── App.jsx              # Routing logic
    │   ├── main.jsx             # React entry point
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state management
    │   ├── utils/
    │   │   └── api.js           # API client
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ChatBox.jsx      # Real-time chat
    │   │   ├── SkillCard.jsx
    │   │   ├── MatchCard.jsx
    │   │   ├── StarRating.jsx
    │   │   └── Toast.jsx
    │   └── pages/
    │       ├── AuthPage.jsx     # Login/Register
    │       ├── OnboardingPage.jsx
    │       ├── HomePage.jsx
    │       ├── ProfilePage.jsx
    │       ├── ProvideServicePage.jsx
    │       └── SearchPage.jsx
```

## 🔑 Key Features Implementation

### Authentication Flow
1. User registers with email/password
2. Password hashed with bcrypt (10 rounds)
3. JWT token issued on successful login/register
4. Token stored in localStorage
5. Automatic redirect to onboarding for new users

### Skill Matching Algorithm
- Calculates score based on complementary skills
- Category matching: +30 points
- Exact title matching: +50 points (bonus)
- Classification: Perfect (80+), Good (40+), Partial (1+)

### Session Lifecycle
1. Learner sends request with message and proposed time
2. Teacher receives notification (Socket.io)
3. Teacher accepts/declines
4. Upon completion, both parties rate
5. Ratings update teacher's skill ratings

### Real-time Features
- Instant notifications for session requests
- Live chat between matched users
- Online/offline status tracking
- Message delivery confirmation

## 📊 Database Schema

### User
- name, email, passwordHash
- bio, location, qualification
- skillsTeach (array of skills with ratings)
- skillsLearn (array of desired skills)
- trustScore, isOnboarded
- joinedAt

### Course
- teacher (User reference)
- courseName, category, targetLevel
- qualification, overview
- whatYouLearn (array)
- keyFeatures (array)
- timePreference (array)
- mode (Online/In-person/Both)
- exchangeWanted (optional)
- averageRating, ratingCount

### Session
- requester, recipient (User references)
- course (Course reference)
- message, proposedTime, mode
- status (pending/accepted/declined/completed)
- ratings and reviews from both parties

## 🔐 Security Features

✅ Password hashing with bcrypt (10 rounds)
✅ JWT-based authentication
✅ CORS configured
✅ Input validation on backend
✅ Protected routes with auth middleware
✅ Secure token storage in localStorage
✅ Self-exchange prevention
✅ Duplicate request prevention

## 🎨 Design System

**Color Theme:**
- Primary: Indigo (#6366F1)
- Accent: Blue/Green for actions
- Background: White with slate-50 cards
- Text: Slate-900 primary, slate-600 muted

**Components:**
- Cards: 12px border radius
- Buttons: 8px border radius, hover states
- Animations: Smooth transitions on all interactions
- Toast notifications: Auto-dismiss after 3 seconds

## 📱 Responsive Breakpoints

- Mobile: 320px - 640px (single column)
- Tablet: 641px - 1024px (2 columns)
- Desktop: 1025px+ (3-4 columns)

## 🧪 Testing the Platform

### Demo Workflow

1. **Register New User**
   - Go to Auth page
   - Register with email and password
   - Complete onboarding (add skills)

2. **Register a Course**
   - From home, click "Register New Course"
   - Fill course details
   - Select skills and preferences

3. **Search for Teachers**
   - Go to Search page
   - Filter by category/level/rating
   - View teacher profiles

4. **Send Session Request**
   - View teacher profile
   - Select a course
   - Propose time and message
   - Send request

5. **Accept/Decline Requests**
   - Check chat box for notifications
   - Accept or decline incoming requests
   - Rate after session completion

## 🚀 Deployment

### Backend (Heroku/Railway/Render)
```bash
cd backend
npm install
npm start
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
npm run preview
```

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - Get user profile
- `POST /api/users/onboarding` - Complete onboarding
- `GET /api/users/matches` - Get matching users

### Courses
- `POST /api/courses` - Create course
- `GET /api/courses` - Get all courses
- `GET /api/courses/my` - Get user's courses
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Sessions
- `POST /api/sessions` - Send request
- `GET /api/sessions/my` - Get user's sessions
- `PUT /api/sessions/:id/accept` - Accept request
- `PUT /api/sessions/:id/decline` - Decline request
- `PUT /api/sessions/:id/complete` - Complete & rate

### Search
- `GET /api/search?q=query` - Search courses
- `GET /api/search/suggestions` - Get suggestions
- `GET /api/search/trending` - Get trending skills

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🙌 Acknowledgments

Built as a complete skill-sharing platform to promote community learning and peer-to-peer education.

---

**Made with ❤️ for local skill sharing communities**
