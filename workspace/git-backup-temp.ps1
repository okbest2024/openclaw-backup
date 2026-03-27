cd C:\Users\Administrator\.openclaw\workspace
git add .
git commit -m "Auto backup push" 2>nul || echo No changes
git push origin main
