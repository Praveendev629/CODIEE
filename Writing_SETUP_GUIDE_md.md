# Codiee — Complete Setup Guide
### From Zero to Running in Production

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Get the Code](#2-get-the-code)
3. [MongoDB Setup](#3-mongodb-setup)
4. [Groq API Key (AI)](#4-groq-api-key-ai)
5. [GitHub OAuth Setup](#5-github-oauth-setup)
6. [Encryption Key](#6-encryption-key)
7. [Configure Environment Files](#7-configure-environment-files)
8. [Install Dependencies](#8-install-dependencies)
9. [Run in Development](#9-run-in-development)
10. [Run with Docker](#10-run-with-docker)
11. [Deploy Frontend to Vercel](#11-deploy-frontend-to-vercel)
12. [Deploy Backend to Railway](#12-deploy-backend-to-railway)
13. [Build Android APK (Expo EAS)](#13-build-android-apk-expo-eas)
14. [Environment Variable Reference](#14-environment-variable-reference)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Prerequisites

Install these tools on your machine before starting.

### Node.js (v18 or higher)

**Windows:**
1. Go to https://nodejs.org
2. Download the **LTS** version (green button)
3. Run the installer — click Next through all steps
4. Open **Command Prompt** and verify:
```
node --version
npm --version
```
Both should print version numbers.

**Mac:**
```bash
# Install Homebrew first (if you don't have it)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
```

---

### Git

**Windows:** Download from https://git-scm.com/download/win and install.

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

---

### Docker (Optional — for containerized setup)

Download Docker Desktop from https://www.docker.com/products/docker-desktop and install it.

After installing, open a terminal and verify:
```bash
docker --version
docker-compose --version
```

---

## 2. Get the Code

### Option A — From ZIP (recommended if you downloaded the zip)

1. Extract the **codiee.zip** file to a folder, for example `C:\Projects\codiee` or `~/projects/codiee`
2. Open a terminal and navigate to that folder:

```bash
cd ~/projects/codiee
# or on Windows:
cd C:\Projects\codiee
```

### Option B — From Git

```bash
git clone https://github.com/yourname/codiee.git
cd codiee
```

Your folder structure should look like this:
```
codiee/
├── backend/
├── frontend/
├── mobile/
├── docker-compose.yml
└── README.md
```

---

## 3. MongoDB Setup

Codiee needs a MongoDB database. You have two options:

### Option A — MongoDB Atlas (Free Cloud Database — Recommended)

This is the easiest option. No installation needed.

**Step 1:** Go to https://www.mongodb.com/atlas and click **"Try Free"**

**Step 2:** Create an account (you can sign up with Google)

**Step 3:** After logging in, click **"Build a Database"**

**Step 4:** Select **FREE tier (M0)** — make sure it says $0/month

**Step 5:** Choose a cloud provider (any) and a region close to you. Click **"Create"**

**Step 6:** Set up database access:
- You'll be asked to create a **Username** and **Password**
- Use something simple like:
  - Username: `codieeuser`
  - Password: `MyPassword123`
- Click **"Create User"**
- IMPORTANT: Save these credentials — you'll need them

**Step 7:** Set up network access:
- Click **"Add My Current IP Address"** — this allows your machine to connect
- For production, click **"Allow Access from Anywhere"** (0.0.0.0/0)
- Click **"Finish and Close"**

**Step 8:** Get your connection string:
- On the **Database** page, click **"Connect"**
- Click **"Drivers"**
- Select **Node.js** as the driver
- Copy the connection string. It looks like:
```
mongodb+srv://codieeuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
- Replace `<password>` with your actual password:
```
mongodb+srv://codieeuser:MyPassword123@cluster0.xxxxx.mongodb.net/codiee?retryWrites=true&w=majority
```
- Note: we added `/codiee` before the `?` — this is your database name

**This is your `MONGO_URI`.**

---

### Option B — Local MongoDB (for development only)

**Windows:**
1. Go to https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server (MSI installer)
3. Run installer — choose "Complete" setup
4. MongoDB runs as a Windows Service automatically

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Your local connection string will be:
```
mongodb://localhost:27017/codiee
```

---

## 4. Groq API Key (AI)

Groq provides the AI capabilities — it's free and very fast.

**Step 1:** Go to https://console.groq.com

**Step 2:** Click **"Sign Up"** — you can use Google or GitHub to sign up

**Step 3:** After logging in, click your profile icon in the top right, then click **"API Keys"**
- Or go directly to: https://console.groq.com/keys

**Step 4:** Click **"Create API Key"**

**Step 5:** Give it a name like `codiee-dev` and click **"Submit"**

**Step 6:** You'll see your API key — it starts with `gsk_`
```
gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT:** Copy this key immediately. You will not be able to see it again after closing the dialog.

**Step 7:** Save it somewhere safe (like a password manager or text file)

**This is your `GROQ_API_KEY`.**

> Free tier gives you: 14,400 requests/day on llama3-70b-8192 — more than enough for development.

---

## 5. GitHub OAuth Setup

This allows users to log in with GitHub and push code to their repos.

**Step 1:** Log in to https://github.com

**Step 2:** Click your profile picture (top right) → **Settings**

**Step 3:** Scroll down the left sidebar and click **"Developer settings"** (very bottom)

**Step 4:** Click **"OAuth Apps"** in the left sidebar

**Step 5:** Click **"New OAuth App"** (or "Register a new application")

**Step 6:** Fill in the form:

| Field | Value for Development | Value for Production |
|---|---|---|
| Application name | `Codiee Dev` | `Codiee` |
| Homepage URL | `http://localhost:3000` | `https://yourapp.vercel.app` |
| Authorization callback URL | `http://localhost:5000/api/auth/github/callback` | `https://your-backend.railway.app/api/auth/github/callback` |

**Step 7:** Click **"Register application"**

**Step 8:** On the next page you will see:
- **Client ID** — copy this (looks like: `Ov23liXXXXXXXXXXXXXX`)
- Click **"Generate a new client secret"**
- **Client Secret** — copy this immediately (looks like: `abc123def456...` — 40 characters)

**These are your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.**

> For production you should create a SEPARATE OAuth app with your production URLs.

---

## 6. Encryption Key

The encryption key is used to securely store GitHub access tokens in the database using AES-256 encryption.

**You need to generate a random 32-character string.**

**Option A — Use Node.js (easiest):**
Open a terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0,32))"
```
Output example:
```
a8f3d2c1e9b74f6a2d8c3e1f4b7a9e2d
```

**Option B — Use an online generator:**
Go to https://www.random.org/passwords/?num=1&len=32&format=html&rnd=new
Copy the generated password.

**Option C — Make one up:**
Any 32-character string works. Example:
```
Codiee@SuperSecret!Key#2024$Safe
```

**This is your `ENCRYPTION_KEY`.**

> Keep this secret. If you change it after users have connected GitHub, their tokens will become unreadable and they'll need to reconnect.

---

## 7. Configure Environment Files

Now that you have all the credentials, set up the configuration files.

### Backend (.env)

Navigate to the backend folder:
```bash
cd codiee/backend
```

Copy the example file:
```bash
# Mac/Linux
cp .env.example .env

# Windows Command Prompt
copy .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` in any text editor (Notepad, VS Code, etc.) and fill in your values:

```env
# ── Server ────────────────────────────────────────────────────
PORT=5000

# ── MongoDB ───────────────────────────────────────────────────
# Paste your MongoDB Atlas connection string here
# Example: mongodb+srv://codieeuser:MyPassword123@cluster0.abc.mongodb.net/codiee?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.XXXXX.mongodb.net/codiee?retryWrites=true&w=majority

# ── JWT Authentication ─────────────────────────────────────────
# Any long random string — used to sign login tokens
# Generate one: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=paste_a_very_long_random_string_here_at_least_64_characters
JWT_EXPIRES_IN=7d

# ── Groq AI ───────────────────────────────────────────────────
# Your Groq API key from https://console.groq.com/keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── GitHub OAuth ───────────────────────────────────────────────
# From your GitHub OAuth App settings
GITHUB_CLIENT_ID=Ov23liXXXXXXXXXXXXXX
GITHUB_CLIENT_SECRET=your_40_character_github_client_secret_here

# ── Encryption ────────────────────────────────────────────────
# Exactly 32 characters — used to encrypt stored GitHub tokens
ENCRYPTION_KEY=a8f3d2c1e9b74f6a2d8c3e1f4b7a9e2d

# ── CORS ──────────────────────────────────────────────────────
# The URL of your frontend (no trailing slash)
FRONTEND_URL=http://localhost:3000

# ── Environment ───────────────────────────────────────────────
NODE_ENV=development
```

**Save the file.**

---

### Frontend (.env)

Navigate to the frontend folder:
```bash
cd ../frontend
# or from project root:
cd codiee/frontend
```

Copy the example file:
```bash
# Mac/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Open `.env` and fill in:
```env
# URL of your backend API (no trailing slash)
REACT_APP_API_URL=http://localhost:5000/api

# URL of your backend for Socket.io (no /api)
REACT_APP_SOCKET_URL=http://localhost:5000

# Your GitHub OAuth App Client ID (same as backend)
REACT_APP_GITHUB_CLIENT_ID=Ov23liXXXXXXXXXXXXXX
```

**Save the file.**

---

### Mobile (.env) — Optional

Navigate to the mobile folder:
```bash
cd ../mobile
```

Create a `.env` file:
```bash
# Mac/Linux
echo "EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api" > .env

# Windows
echo EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api > .env
```

> For mobile, use your computer's local IP address (not localhost), because your phone needs to reach your computer on the network.

**Find your local IP:**
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

Example: if your IP is `192.168.1.100`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
```

---

## 8. Install Dependencies

Run these commands from the project root:

### Backend
```bash
cd codiee/backend
npm install
```
Wait for it to finish. You should see a `node_modules` folder appear.

### Frontend
```bash
cd codiee/frontend
npm install
```
This may take 2-3 minutes as it installs Monaco Editor and React.

### Mobile (optional)
```bash
cd codiee/mobile
npm install
```

---

## 9. Run in Development

You need **two terminal windows** open simultaneously.

### Terminal 1 — Start the Backend

```bash
cd codiee/backend
npm run dev
```

You should see:
```
[Server] Running on port 5000
[DB] MongoDB connected
```

If you see a MongoDB error, double-check your `MONGO_URI` in `backend/.env`.

---

### Terminal 2 — Start the Frontend

```bash
cd codiee/frontend
npm start
```

After a minute, your browser should automatically open to:
```
http://localhost:3000
```

If it doesn't open automatically, open your browser and go to `http://localhost:3000`.

---

### Terminal 3 — Start Mobile (optional)

```bash
cd codiee/mobile
npx expo start
```

- Press **A** in the terminal to open on Android emulator
- Press **I** to open on iOS simulator (Mac only)
- Scan the **QR code** with the Expo Go app on your phone
  - Download **Expo Go** from the Play Store / App Store

---

## 10. Run with Docker

If you have Docker installed, this starts everything with one command:

```bash
cd codiee

# Build and start all services (MongoDB + Backend + Frontend)
docker-compose up --build
```

Wait for all three services to start. Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health

**To stop:**
```bash
docker-compose down
```

**To stop and delete database data:**
```bash
docker-compose down -v
```

> Note: When using Docker, you still need to set the environment variables in `backend/.env` before running `docker-compose up`.

---

## 11. Deploy Frontend to Vercel

Vercel is free and deploys React apps automatically.

**Step 1:** Go to https://vercel.com and click **"Sign Up"**
- Sign up with GitHub (recommended — it gives Vercel access to your repos)

**Step 2:** Click **"Add New Project"**

**Step 3:** Import your repository, OR use the Vercel CLI:
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd codiee/frontend

# Deploy
vercel
```
Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? `codiee-frontend` (or any name)
- In which directory is your code? `./` (press Enter)
- Want to override settings? **N**

**Step 4:** Set environment variables on Vercel:
- Go to your project on vercel.com
- Click **Settings** → **Environment Variables**
- Add these three variables:

| Name | Value |
|---|---|
| `REACT_APP_API_URL` | `https://your-backend.railway.app/api` |
| `REACT_APP_SOCKET_URL` | `https://your-backend.railway.app` |
| `REACT_APP_GITHUB_CLIENT_ID` | Your GitHub OAuth Client ID |

**Step 5:** Redeploy to apply the environment variables:
```bash
vercel --prod
```

Your frontend will be live at something like:
```
https://codiee-frontend.vercel.app
```

---

## 12. Deploy Backend to Railway

Railway is the easiest platform to deploy a Node.js + MongoDB backend. It has a free tier.

**Step 1:** Go to https://railway.app and click **"Login"**
- Log in with GitHub

**Step 2:** Click **"New Project"** → **"Deploy from GitHub repo"**
- Select your codiee repository
- Select the `backend` folder as the root

**Step 3:** Railway will try to deploy automatically. Let it fail first — we need to add environment variables.

**Step 4:** Click on your service → **Variables** tab
- Add ALL the variables from your `backend/.env` file:

```
PORT                  = 5000
MONGO_URI             = mongodb+srv://...
JWT_SECRET            = your_jwt_secret
JWT_EXPIRES_IN        = 7d
GROQ_API_KEY          = gsk_xxx...
GITHUB_CLIENT_ID      = Ov23li...
GITHUB_CLIENT_SECRET  = your_secret...
ENCRYPTION_KEY        = your_32_char_key
FRONTEND_URL          = https://your-app.vercel.app
NODE_ENV              = production
```

**Step 5:** Railway will automatically redeploy. After it completes, click **Settings** → **Domains** → **Generate Domain**

You'll get a URL like:
```
https://codiee-production.up.railway.app
```

**Step 6:** Update your GitHub OAuth App callback URL:
- Go to GitHub → Settings → Developer Settings → OAuth Apps → Your Codiee App
- Update **Authorization callback URL** to:
```
https://codiee-production.up.railway.app/api/auth/github/callback
```

**Step 7:** Update your Vercel frontend environment variables to point to the new backend URL.

---

## 13. Build Android APK (Expo EAS)

### Step 1 — Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2 — Create an Expo Account
Go to https://expo.dev and click **"Sign Up"**. It's free.

### Step 3 — Log in to EAS
```bash
eas login
# Enter your Expo username and password
```

### Step 4 — Navigate to the mobile folder
```bash
cd codiee/mobile
```

### Step 5 — Configure your project on Expo
```bash
eas init
```
- This creates a project on your Expo account and updates `app.json` with a project ID
- When asked "Would you like to create a new EAS project?", press **Y**

### Step 6 — Set your API URL for production
Edit `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### Step 7 — Build the APK
```bash
eas build --platform android --profile preview
```

When asked:
- "Generate a new Android Keystore?" → **Y** (first time only)

The build will be queued on Expo's servers. It takes about 5-10 minutes.

### Step 8 — Download your APK
When the build finishes, you'll see a link in the terminal:
```
Build finished.
APK: https://expo.dev/artifacts/eas/xxxx.apk
```

Or go to https://expo.dev → Your project → Builds → Click the build → **Download**

### Step 9 — Install on your Android phone
1. Enable **"Install from Unknown Sources"** on your phone:
   - Settings → Security → Unknown Sources → Enable
   - (on newer Android: Settings → Apps → Special App Access → Install Unknown Apps)
2. Transfer the APK to your phone via USB, email, or Google Drive
3. Open the APK file and tap **Install**

---

## 14. Environment Variable Reference

### Backend — `backend/.env`

| Variable | Required | Description | How to Get |
|---|---|---|---|
| `PORT` | Yes | Port the server listens on | Set to `5000` |
| `MONGO_URI` | Yes | MongoDB connection string | See [Section 3](#3-mongodb-setup) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Yes | How long tokens last | Use `7d` |
| `GROQ_API_KEY` | Yes | Groq AI API key | See [Section 4](#4-groq-api-key-ai) |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth client ID | See [Section 5](#5-github-oauth-setup) |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth client secret | See [Section 5](#5-github-oauth-setup) |
| `ENCRYPTION_KEY` | Yes | 32-char AES key for token storage | See [Section 6](#6-encryption-key) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS | `http://localhost:3000` (dev) or Vercel URL (prod) |
| `NODE_ENV` | Yes | Environment | `development` or `production` |

### Frontend — `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | Yes | Backend REST API URL (`http://localhost:5000/api`) |
| `REACT_APP_SOCKET_URL` | Yes | Backend Socket.io URL (`http://localhost:5000`) |
| `REACT_APP_GITHUB_CLIENT_ID` | Yes | GitHub OAuth Client ID |

### Mobile — `mobile/.env`

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Yes | Backend API URL (use local IP for dev) |

---

## 15. Troubleshooting

### "Cannot connect to MongoDB"
- Check your `MONGO_URI` in `backend/.env`
- Make sure your IP is whitelisted in MongoDB Atlas Network Access
- Try adding `0.0.0.0/0` in Atlas Network Access to allow all IPs temporarily

### "Invalid token" errors on frontend
- Clear your browser localStorage: open DevTools (F12) → Application → Local Storage → Clear
- Make sure `JWT_SECRET` in backend `.env` hasn't changed

### "GitHub OAuth redirect mismatch"
- The callback URL in your GitHub OAuth App must exactly match your backend URL
- Development: `http://localhost:5000/api/auth/github/callback`
- Production: `https://your-backend.railway.app/api/auth/github/callback`
- Double-check there are no trailing slashes

### "Groq API error"
- Verify your `GROQ_API_KEY` starts with `gsk_`
- Check your usage at https://console.groq.com — you may have hit the rate limit
- The free tier allows 14,400 requests/day

### Frontend shows blank page after login
- Check the browser console for errors (F12)
- Verify `REACT_APP_API_URL` is set correctly in `frontend/.env`
- Make sure the backend is running and accessible

### Mobile can't connect to backend
- Make sure your phone and computer are on the same WiFi network
- Use your computer's local IP (e.g., `192.168.1.100`), not `localhost`
- Check that your firewall isn't blocking port 5000

### "CORS error" in browser console
- Make sure `FRONTEND_URL` in `backend/.env` exactly matches your frontend URL
- For development: `http://localhost:3000`
- No trailing slash!

### Port 5000 already in use
```bash
# Mac/Linux — find and kill the process using port 5000
lsof -ti:5000 | xargs kill

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Docker: "Cannot connect to Docker daemon"
- Make sure Docker Desktop is running (check the system tray icon)
- On Linux: `sudo systemctl start docker`

---

## Quick Reference — All Steps Summary

```
1. Install Node.js (nodejs.org) + Git
2. Extract/clone the project
3. Create MongoDB Atlas account → get MONGO_URI
4. Create Groq account → get GROQ_API_KEY
5. Create GitHub OAuth App → get CLIENT_ID + CLIENT_SECRET
6. Generate ENCRYPTION_KEY (32 chars)
7. cp backend/.env.example backend/.env  →  fill in all values
8. cp frontend/.env.example frontend/.env  →  fill in 3 values
9. cd backend && npm install
10. cd frontend && npm install
11. Terminal 1: cd backend && npm run dev
12. Terminal 2: cd frontend && npm start
13. Open http://localhost:3000
```

---

## Getting Help

- Check the [Troubleshooting](#15-troubleshooting) section above
- Groq docs: https://console.groq.com/docs
- MongoDB Atlas docs: https://www.mongodb.com/docs/atlas
- GitHub OAuth docs: https://docs.github.com/en/apps/oauth-apps
- Expo EAS docs: https://docs.expo.dev/build/introduction
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs

---

*Codiee — Built for developers, by developers.*
