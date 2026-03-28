# 📝 How to Update Your Website

## Quick Guide: Making Updates

### Step 1: Make Your Changes
Edit any files in your project:
```powershell
cd D:\Users\Jason\Downloads\LRT\lrt-web-app
# Edit files using your preferred editor (VS Code, Notepad++, etc.)
```

### Step 2: Test Locally (Optional but Recommended)
```powershell
# Start development server
npm run dev

# Visit http://localhost:5173 to test your changes
# Press Ctrl+C to stop the server when done
```

### Step 3: Commit Your Changes
```powershell
# Check what files changed
git status

# Add all changes
git add .

# Or add specific files
git add src/pages/Home.jsx

# Commit with a message
git commit -m "Update: Description of what you changed"
```

### Step 4: Push to GitHub
```powershell
# Push to GitHub (triggers automatic deployment)
git push

# Or if using gh shell with full PATH:
# $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
# git push
```

### Step 5: Wait for Deployment
- GitHub Actions will automatically build and deploy
- Takes ~30 seconds to 1 minute
- Check progress: https://github.com/jasonchongcnh/lrt-web-app/actions

---

## 🔧 Manual Deployment Trigger

If you want to manually trigger deployment without making changes:

```powershell
cd D:\Users\Jason\Downloads\LRT\lrt-web-app

# Refresh PATH to use gh command
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Trigger deployment
gh workflow run deploy.yml

# Watch deployment progress
gh run list --limit 5
```

---

## 📊 Check Deployment Status

### Using GitHub CLI:
```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# List recent workflow runs
gh run list --limit 5

# Watch a specific run (use the ID from list)
gh run watch <RUN_ID>

# View failed logs (if something went wrong)
gh run view <RUN_ID> --log-failed
```

### Using Web Browser:
- Visit: https://github.com/jasonchongcnh/lrt-web-app/actions
- See all deployment runs and their status

---

## 🎨 Common Update Scenarios

### Update Text or Content:
1. Edit files in `src/pages/` or `src/components/`
2. Test with `npm run dev`
3. Commit and push

### Update Styling:
1. Edit `src/index.css` or component styles
2. Test with `npm run dev`
3. Commit and push

### Update App Title or Metadata:
1. Edit `index.html` for page title
2. Edit `package.json` for app metadata
3. Commit and push

### Add New Dependencies:
```powershell
# Install package
npm install package-name

# This updates package.json and package-lock.json
# Commit and push both files
git add package.json package-lock.json
git commit -m "Add package-name dependency"
git push
```

---

## 🚨 Troubleshooting

### If deployment fails:
1. Check the Actions tab on GitHub
2. View the error logs
3. Fix the issue locally
4. Test with `npm run build` (not just `npm run dev`)
5. Commit and push the fix

### If changes don't appear on website:
1. Wait 1-2 minutes for deployment to complete
2. Hard refresh browser (Ctrl + F5)
3. Check Actions tab to ensure deployment succeeded
4. Clear browser cache if needed

### If git push fails:
```powershell
# Pull latest changes first
git pull

# Resolve any conflicts if needed
# Then push again
git push
```

---

## 💡 Pro Tips

1. **Always test locally first** with `npm run dev`
2. **Use clear commit messages** describing your changes
3. **Check Actions tab** after pushing to ensure deployment succeeds
4. **Wait for deployment** before checking the live site (~30 seconds)
5. **Hard refresh** (Ctrl + F5) if you don't see changes immediately

---

## 📚 Quick Reference

**Project Location**: `D:\Users\Jason\Downloads\LRT\lrt-web-app`  
**Live Website**: https://jasonchongcnh.github.io/lrt-web-app/  
**Repository**: https://github.com/jasonchongcnh/lrt-web-app  
**Actions/Deployments**: https://github.com/jasonchongcnh/lrt-web-app/actions  

**Local Dev Server**: `npm run dev` → http://localhost:5173  
**Build for Production**: `npm run build`  
**Preview Production**: `npm run preview`
