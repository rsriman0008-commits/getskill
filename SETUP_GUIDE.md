# GetSkills Platform - Complete Setup Guide

## ✅ Pre-Installation Checklist

Before you start, ensure you have:

- [ ] Node.js v14+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] MongoDB account (https://www.mongodb.com/cloud/atlas)
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command prompt
- [ ] Git (optional)

## 📋 Step-by-Step Installation

### Part 1: MongoDB Setup

1. **Create MongoDB Atlas Account**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up for free tier
   - Create a new cluster
   - Set username and password
   - Add your IP to whitelist (Allow Access from Anywhere for development)

2. **Get Connection String**
   - Go to Clusters → Connect
   - Choose "Drivers" → Node.js
   - Copy the connection string
   - Replace `<username>` and `<password>` with your credentials
   - Replace `myFirstDatabase` with `skillswap`

### Part 2: Backend Setup

1. **Navigate and Install**
   ```bash
   cd skillswap/backend
   npm install
   ```

2. **Create .env File**
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

3. **Edit .env File**
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/skillswap?retryWrites=true&w=majority
   JWT_SECRET=your_random_secure_key_min_32_chars_long_123456789
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   SOCKET_IO_CORS_ORIGIN=http://localhost:5173
   SOCKET_IO_CORS_CREDENTIALS=true
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   ```
   
   ✅ You should see:
   ```
   ✅ MongoDB connected successfully
   🚀 GetSkills API Server Started
   Port: 5000
   ```

5. **Test Backend**
   ```bash
   curl http://localhost:5000/api/health
   ```
   
   Expected response:
   ```json
   {"success": true, "message": "Server is running"}
   ```

### Part 3: Frontend Setup

1. **Open New Terminal Tab and Navigate**
   ```bash
   cd skillswap/frontend
   npm install
   ```

2. **Create .env.local (Optional)**
   ```bash
   # Windows
   echo VITE_API_URL=http://localhost:5000/api > .env.local
   
   # Mac/Linux
   echo "VITE_API_URL=http://localhost:5000/api" > .env.local
   ```

3. **Start Frontend Server**
   ```bash
   npm run dev
   ```
   
   ✅ You should see:
   ```
   VITE v4.3.9  ready in 234 ms
   ➜  Local:   http://localhost:5173/
   ```

4. **Open in Browser**
   - Navigate to http://localhost:5173
   - You should see the GetSkills login page

## 🧪 Testing the Application

### Test Account Registration

1. Click on "Register" tab
2. Fill in:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm: password123
3. Click "Register"
4. You'll be redirected to onboarding

### Complete Onboarding

**Step 1: Personal Info**
- Name: (auto-filled)
- Qualification: B.Tech
- Location: San Francisco
- Bio: I love teaching Python and learning music

**Step 2: Skills to Teach**
- Add Python (Technology, Expert)
- Add JavaScript (Technology, Intermediate)

**Step 3: Skills to Learn**
- Add Guitar (Music, High)
- Add Spanish (Language, Medium)

Click "Complete Onboarding"

### Test Features

1. **Home Page**
   - See matching profiles
   - View trending skills
   - See registered courses

2. **Register Course**
   - Click "Teach" → "Register New Course"
   - Fill in course details
   - Submit

3. **Search**
   - Use search bar to find skills
   - Filter by category/level/rating
   - View teacher profiles

4. **Profile**
   - View your profile
   - Edit information
   - View teaching/learning history

5. **Chat & Requests**
   - Send session request to another user
   - Accept/decline requests
   - Send messages in real-time

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Solution:**
- Check MongoDB URI in .env
- Verify IP whitelist in MongoDB Atlas
- Check username/password in connection string

### CORS Error in Browser Console
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Ensure frontend FRONTEND_URL in backend .env matches your frontend port
- Backend must be running with correct CORS settings

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux - Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Socket.io Connection Issues
- Ensure both servers are running
- Check browser console for connection errors
- Clear browser cache and refresh
- Check frontend can reach backend API

### Module Not Found Error
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Common Tasks

### Creating Another Test User

1. Open private/incognito browser window
2. Go to http://localhost:5173
3. Go to Register tab
4. Create new account with different email
5. Complete onboarding with different skills

### Resetting Database

1. Go to MongoDB Atlas
2. Go to your cluster
3. Collections → Drop Collection
4. Confirm deletion

### Debugging

**Backend debugging:**
- Check logs in terminal
- Add `console.log()` statements
- Use Postman to test API endpoints
- Check MongoDB documents in Atlas

**Frontend debugging:**
- Use browser DevTools (F12)
- Check Network tab for API calls
- Check Console for errors
- Use React DevTools extension

## 🚀 Production Deployment

### Backend Deployment (Heroku)

1. Create Heroku account
2. Install Heroku CLI
3. ```bash
   cd backend
   heroku login
   heroku create app-name
   git push heroku main
   ```

### Frontend Deployment (Vercel)

1. Push to GitHub
2. Go to vercel.com
3. Import GitHub repository
4. Set environment variables
5. Deploy

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Check MongoDB and Node.js versions
3. Restart all servers
4. Clear browser cache
5. Check terminal/console for error messages

## ✨ You're All Set!

You now have a fully functional GetSkills platform running locally!

**Next steps:**
- Explore the app
- Register multiple accounts
- Test skill matching
- Send session requests
- Test real-time chat
- Enjoy the platform!

---

**Happy Learning! 🎓**
