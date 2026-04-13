@echo off
echo 🚀 Deploying Arryona Marketplace to Netlify...
echo.

cd /d "c:\Users\okose\new arryona"

echo 📦 Installing dependencies...
call npm install

echo 🏗️  Building application...
call npm run build

echo ✅ Build complete!
echo.
echo 🌐 To deploy to Netlify:
echo 1. Go to https://netlify.com
echo 2. Sign up or login
echo 3. Drag and drop the .next folder to the deploy area
echo 4. Or connect your Git repository for automatic deployments
echo.
echo Your netlify.toml is already configured!
echo.
pause