@echo off
echo 🚀 Setting up Git repository for Arryona Marketplace...
echo.

cd /d "c:\Users\okose\new arryona"

echo 📁 Initializing Git repository...
git init

echo 📝 Creating .gitignore...
echo # Dependencies
echo node_modules/
echo .next/
echo out/
echo.
echo # Environment variables
echo .env
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo # Logs
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo.
echo # Runtime data
echo pids
echo *.pid
echo *.seed
echo *.pid.lock
echo.
echo # Coverage directory used by tools like istanbul
echo coverage/
echo.
echo # nyc test coverage
echo .nyc_output
echo.
echo # Dependency directories
echo node_modules/
echo jspm_packages/
echo.
echo # Optional npm cache directory
echo .npm
echo.
echo # Optional REPL history
echo .node_repl_history
echo.
echo # Output of 'npm pack'
echo *.tgz
echo.
echo # Yarn Integrity file
echo .yarn-integrity
echo.
echo # dotenv environment variables file
echo .env
echo.
echo # IDE files
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # OS generated files
echo .DS_Store
echo .DS_Store?
echo ._*
echo .Spotlight-V100
echo .Trashes
echo ehthumbs.db
echo Thumbs.db > .gitignore

echo ➕ Adding all files to Git...
git add .

echo 💾 Making initial commit...
git commit -m "Initial commit: Arryona marketplace with live chat"

echo ✅ Git repository created successfully!
echo.
echo 🌐 Next steps:
echo 1. Create a repository on GitHub.com
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git push -u origin main
echo 5. Connect the GitHub repo to Netlify for auto-deployment
echo.
pause