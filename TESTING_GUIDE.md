# 🧪 KaiTech Voice of Time - Authentication Testing Guide

This guide will help you test all the authentication and profile features.

## 🚀 Start the Server

```bash
node server-auth.js
```

You should see:
- ✅ Server running on http://localhost:8080
- ✅ Database tables initialized
- ✅ Authentication endpoints listed

## 📋 Test Checklist

### 1. 🔐 **Authentication Flow Testing**

#### **A. User Registration**
1. Go to: http://localhost:8080/register
2. Test invalid inputs:
   - Weak password (should show strength indicator)
   - Invalid email format
   - Username too short
   - Passwords that don't match
3. Register a valid user:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Password123`
   - Display Name: `Test User`

**Expected Results:**
- ✅ Form validation works in real-time
- ✅ Successful registration redirects to dashboard
- ✅ User is automatically logged in

#### **B. User Login**
1. Go to: http://localhost:8080/login
2. Test invalid credentials:
   - Wrong email: should show error
   - Wrong password: should show error
3. Login with valid credentials:
   - Email: `test@example.com`
   - Password: `Password123`

**Expected Results:**
- ✅ Invalid login shows error message
- ✅ Valid login redirects to dashboard
- ✅ User session is maintained

### 2. 👤 **User Dashboard Testing**

After logging in, test the dashboard at: http://localhost:8080/dashboard

#### **Features to Test:**
- ✅ User info displays correctly (name, email, avatar initial)
- ✅ Statistics cards show numbers
- ✅ Personalized news feed loads
- ✅ News preferences can be updated
- ✅ Articles can be saved
- ✅ Quick actions work (refresh news, etc.)

#### **Test News Preferences:**
1. Select different news categories
2. Click "Update Preferences"
3. Refresh the page - preferences should be saved
4. News feed should update to show relevant articles

### 3. 💾 **Save Articles Testing**

1. From the dashboard, click "💾 Save" on any article
2. Check that you get a success message
3. Statistics should update (saved articles count)

### 4. 🚪 **Logout Testing**

1. Click "Logout" in the dashboard
2. Should redirect to home page
3. Try accessing `/dashboard` - should redirect to login

### 5. 🔒 **Security Testing**

#### **A. Route Protection**
Test these URLs when NOT logged in:
- http://localhost:8080/dashboard → Should redirect to login
- http://localhost:8080/profile → Should redirect to login

#### **B. API Protection**
Test API endpoints without authentication:
```bash
curl http://localhost:8080/api/news/personalized
```
Should return 401 Unauthorized

#### **C. Rate Limiting**
Try logging in with wrong credentials 4+ times rapidly:
- Should show rate limiting message after 3 attempts

## 🧪 API Testing with cURL

### **1. Health Check**
```bash
curl http://localhost:8080/api/health
```

### **2. Server Info**
```bash
curl http://localhost:8080/api/server-info
```

### **3. Register a User**
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"apitest\",
    \"email\": \"apitest@example.com\",
    \"password\": \"ApiTest123\",
    \"display_name\": \"API Test User\"
  }"
```

### **4. Login**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"apitest@example.com\",
    \"password\": \"ApiTest123\"
  }" \
  -c cookies.txt
```

### **5. Check Auth Status**
```bash
curl http://localhost:8080/auth/status -b cookies.txt
```

### **6. Get Personalized News**
```bash
curl http://localhost:8080/api/news/personalized -b cookies.txt
```

### **7. Save an Article**
```bash
curl -X POST http://localhost:8080/auth/saved-articles \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"article_id\": \"test_article_1\",
    \"article_title\": \"Test Article\",
    \"article_url\": \"https://example.com/test\",
    \"article_source\": \"Test Source\"
  }"
```

### **8. Get Saved Articles**
```bash
curl http://localhost:8080/auth/saved-articles -b cookies.txt
```

### **9. Update Preferences**
```bash
curl -X PUT http://localhost:8080/auth/preferences \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"news_categories\": [\"technology\", \"business\"],
    \"items_per_page\": 25
  }"
```

### **10. Get User Profile**
```bash
curl http://localhost:8080/auth/profile -b cookies.txt
```

## 🗄️ Database Testing

Check if data is being saved correctly:

### **View Database Files**
The SQLite database is created at: `database/kaitech_users.db`

### **Check Tables** (if you have SQLite tools)
```sql
-- View users
SELECT * FROM users;

-- View user preferences
SELECT * FROM user_preferences;

-- View saved articles
SELECT * FROM saved_articles;

-- View user interactions
SELECT * FROM user_interactions;
```

## 🐛 Common Issues & Troubleshooting

### **Issue: Server won't start**
- Check if port 8080 is already in use
- Ensure all npm packages are installed: `npm install`

### **Issue: Database errors**
- Delete `database/kaitech_users.db` and restart
- Tables will be recreated automatically

### **Issue: Authentication not working**
- Clear browser cookies and localStorage
- Try incognito/private browsing mode

### **Issue: OAuth errors (when enabled)**
- Check that CLIENT_ID and CLIENT_SECRET are set in .env
- Verify callback URLs are correct

## 📱 Mobile Testing

Test on mobile devices:
1. Find your computer's IP: Look at server startup logs
2. Visit: `http://YOUR_IP:8080` on mobile
3. All features should work on mobile browsers

## ⚡ Performance Testing

### **Load Testing Registration**
```bash
# Test multiple registrations (change email each time)
for i in {1..5}; do
  curl -X POST http://localhost:8080/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"user$i\",\"email\":\"user$i@test.com\",\"password\":\"Test123$i\"}"
done
```

### **Load Testing News API**
```bash
# Test personalized news endpoint
curl http://localhost:8080/api/news/personalized -b cookies.txt
```

## ✅ Success Criteria

Your authentication system is working correctly if:

- ✅ Users can register and login
- ✅ Sessions persist across page reloads  
- ✅ Protected routes require authentication
- ✅ News preferences are saved and applied
- ✅ Articles can be saved and retrieved
- ✅ Rate limiting prevents abuse
- ✅ All API endpoints return correct responses
- ✅ Database stores user data correctly
- ✅ Security headers are present
- ✅ Mobile interface works properly

## 🔧 Next Steps

Once basic testing passes:

1. **Add OAuth** - Configure Google/GitHub OAuth
2. **Email Verification** - Add email confirmation
3. **Password Reset** - Implement forgot password
4. **Admin Panel** - Add user management
5. **Advanced Features** - Push notifications, advanced analytics

---

💡 **Tip**: Use browser developer tools (F12) to monitor network requests and check for any errors in the console.
