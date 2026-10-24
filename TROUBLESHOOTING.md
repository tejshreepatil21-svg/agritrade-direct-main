# 🔧 Troubleshooting Guide

## Common Errors and Solutions

### Backend Errors

#### ❌ "MongoDB connection error"

**Symptoms:**
- Backend crashes on startup
- Error message: "MongoDB connection error" or "MongooseServerSelectionError"

**Solutions:**
1. **Check MongoDB Atlas Connection:**
   - Verify internet connection
   - Check if MongoDB Atlas cluster is running
   - Ensure IP whitelist includes `0.0.0.0/0` (allow all IPs)
   - Verify connection string in `backend/.env`

2. **For Local MongoDB:**
   - Start MongoDB service:
     ```bash
     # Windows
     net start MongoDB
     
     # Or run mongod.exe
     ```
   - Update `backend/.env`:
     ```env
     MONGODB_URI=mongodb://localhost:27017/agritrade
     ```

3. **Test Connection:**
   ```bash
   # Try connecting with mongosh
   mongosh "mongodb+srv://worktrack:keshav123@cluster0.b2xtzoa.mongodb.net/"
   ```

#### ❌ "Port 5000 already in use"

**Symptoms:**
- Error: "EADDRINUSE: address already in use :::5000"

**Solutions:**
1. **Kill process on port 5000:**
   ```powershell
   # Find process
   netstat -ano | findstr :5000
   
   # Kill process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

2. **Or change port in `backend/.env`:**
   ```env
   PORT=5001
   ```
   Then update frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:5001/api
   ```

#### ❌ "Cannot find module"

**Symptoms:**
- Error: "Cannot find module 'express'" or similar

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "ValidationError: User validation failed"

**Symptoms:**
- Registration fails with validation error

**Solutions:**
- **For Farmers:** Ensure farm size is provided and is a positive number
- **Email:** Must be valid format (name@domain.com)
- **Password:** Must be at least 6 characters
- **Phone:** Should be 10-15 digits (optional but must be valid if provided)

### Frontend Errors

#### ❌ "Failed to fetch" or "Network Error"

**Symptoms:**
- Login/Registration shows "Network Error"
- API calls fail in browser console

**Solutions:**
1. **Verify backend is running:**
   - Check backend terminal is still running
   - Visit http://localhost:5000/api/health
   - Should see: `{"status":"ok","message":"AgriTrade API is running"}`

2. **Check CORS:**
   - Backend should have CORS enabled (already configured)
   - Check browser console for CORS errors

3. **Verify API URL:**
   - Check `.env` in root directory:
     ```env
     VITE_API_URL=http://localhost:5000/api
     ```
   - Restart frontend after changing .env

#### ❌ "Vite Error: Failed to resolve import"

**Symptoms:**
- Import errors with @ paths
- Module not found errors

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "Module not found: Can't resolve '@/components/...'"

**Symptoms:**
- Import errors for UI components

**Solution:**
- Verify `vite.config.js` or `vite.config.ts` has path alias:
  ```javascript
  resolve: {
    alias: {
      '@': '/src',
    },
  }
  ```

### Registration Errors

#### ❌ "Farm size is required for farmers"

**Solution:**
- Farmers must enter a farm size (e.g., 5, 10.5)
- Enter a valid positive number

#### ❌ "Email already exists"

**Solutions:**
1. Use a different email
2. Login with existing credentials
3. Or delete user from database:
   ```javascript
   // In MongoDB shell or Atlas
   db.users.deleteOne({ email: "test@example.com" })
   ```

#### ❌ "Passwords do not match"

**Solution:**
- Ensure password and confirm password fields match exactly
- Check for extra spaces

### Login Errors

#### ❌ "Invalid email or password"

**Solutions:**
1. Verify credentials are correct
2. Check caps lock is off
3. Ensure you registered with that email
4. Try password reset (if implemented)

#### ❌ "Invalid role. This account is registered as X"

**Solution:**
- Select the correct role when logging in
- If registered as Farmer, select "Farmer" role button
- If registered as Buyer, select "Buyer" role button
- Admins select "Admin" role button

#### ❌ "Account has been deactivated"

**Solution:**
- Contact admin to reactivate account
- Or as admin, use API to activate:
  ```bash
  curl -X PATCH http://localhost:5000/api/users/{userId}/status \
    -H "Authorization: Bearer {admin-token}" \
    -H "Content-Type: application/json" \
    -d '{"isActive": true}'
  ```

### Database Errors

#### ❌ "Duplicate key error"

**Symptoms:**
- Error mentions "duplicate key" or "E11000"

**Solution:**
- Email must be unique
- Use a different email address
- Or delete duplicate from database

#### ❌ "Document failed validation"

**Solutions:**
- Check all required fields are provided
- Verify data types (numbers for farmSize, valid email format)
- Check field length constraints

### Installation Issues

#### ❌ "npm install fails"

**Solutions:**
1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete package-lock.json:**
   ```bash
   rm package-lock.json
   npm install
   ```

3. **Use legacy peer deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Check Node version:**
   ```bash
   node --version  # Should be v16 or higher
   ```

#### ❌ "Python errors during install"

**Solution:**
- Some packages need build tools
- Install Windows Build Tools:
  ```bash
  npm install --global windows-build-tools
  ```

### Runtime Errors

#### ❌ "Token expired"

**Solution:**
- Login again (tokens expire after 7 days)
- Clear localStorage and login:
  ```javascript
  localStorage.clear()
  ```

#### ❌ "Cannot read property of undefined"

**Solutions:**
1. Check user is logged in
2. Verify API response structure
3. Add null checks in code
4. Check browser console for detailed error

### Browser Issues

#### ❌ "Blank page / White screen"

**Solutions:**
1. Check browser console (F12) for errors
2. Clear browser cache
3. Try incognito/private mode
4. Check frontend terminal for build errors

#### ❌ "Styles not loading"

**Solutions:**
1. Verify Tailwind is configured
2. Check `index.css` is imported
3. Restart frontend dev server

## Debugging Tips

### Backend Debugging

1. **Enable detailed logs:**
   ```javascript
   // Add in server.js
   app.use((req, res, next) => {
     console.log(`${req.method} ${req.path}`, req.body);
     next();
   });
   ```

2. **Test API with curl:**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Register
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","password":"test123","role":"farmer","farmSize":10}'
   ```

3. **Check MongoDB:**
   ```javascript
   // View users in MongoDB shell
   db.users.find().pretty()
   ```

### Frontend Debugging

1. **Check Network tab:**
   - Open DevTools (F12) → Network
   - Look for failed API calls
   - Check request/response details

2. **Console logging:**
   ```javascript
   console.log('User:', user);
   console.log('API Response:', response);
   ```

3. **React DevTools:**
   - Install React DevTools extension
   - Inspect component state and props

## Prevention Tips

✅ Always check backend is running before testing frontend  
✅ Use correct role when logging in  
✅ Keep terminal windows open to see errors  
✅ Check browser console for frontend errors  
✅ Verify .env files are correctly configured  
✅ Use valid email formats  
✅ Provide all required fields  

## Still Having Issues?

1. **Check all .env files are present and correct**
2. **Restart both backend and frontend**
3. **Clear browser cache and localStorage**
4. **Check MongoDB is accessible**
5. **Verify all dependencies are installed**
6. **Review terminal logs carefully**

## Quick Reset

If everything is broken:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install

# Clear MongoDB (optional - deletes all data)
# In MongoDB shell:
db.dropDatabase()

# Restart everything
# Run START.bat
```

---

**Need more help?** Check [QUICK_START.md](QUICK_START.md) for setup instructions.
