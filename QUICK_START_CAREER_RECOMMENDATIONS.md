# Career Recommendations - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get O*NET Credentials (2 min)
1. Go to https://services.onetcenter.org/
2. Click "Request Access" or "Register"
3. Fill out the simple form (Name, Email, Organization)
4. You'll receive credentials via email immediately (usually instant)

### Step 2: Configure Your App (1 min)
Add these lines to your `.env` file:
```bash
ONET_USERNAME=your_username_from_email
ONET_PASSWORD=your_password_from_email
```

### Step 3: Run Database Migration (1 min)
```bash
# Option 1: Use the setup script (Windows)
.\scripts\setup-career-recommendations.ps1

# Option 2: Run migration manually
npx prisma migrate dev --name add_career_recommendations
npx prisma generate
```

### Step 4: Start Using! (1 min)
```bash
npm run dev
```
Navigate to **Growth Tools → Career Match** in the app header.

---

## 💡 How It Works

### Generate Recommendations
1. Click **"Generate Recommendations"** button
2. The system analyzes:
   - Your skills from profile
   - Keywords from your resume
   - Your industry and experience level
3. Get personalized career matches in seconds!

### View Your Matches
Each career shows:
- **Match Score**: How well your skills align (0-100%)
- **Matched Skills**: Skills you already have ✓
- **Skills to Develop**: What you need to learn
- **Career Details**: Tasks, technologies, education needs
- **Bright Outlook**: Fast-growing careers ⭐

### Manage Recommendations
- **⭐ Favorite**: Star careers you're interested in
- **🔄 Refresh**: Update with latest O*NET data
- **🗑️ Remove**: Delete careers you're not interested in
- **🔍 Filter**: View by match score, bright outlook, or favorites

---

## 📊 Understanding Match Scores

| Score | Meaning | Action |
|-------|---------|--------|
| 80-100% | **Excellent Match** | You're ready! Start applying |
| 60-79% | **Good Match** | Learn 1-2 missing skills |
| 40-59% | **Moderate Match** | Consider skill development |
| 0-39% | **Low Match** | Major skill gap, plan long-term |

---

## 🎯 Tips for Better Recommendations

### ✅ DO:
- Add specific technical skills to your profile
- Complete your resume with detailed experience
- Include technologies, tools, and frameworks you know
- Update your profile as you learn new skills
- Regenerate recommendations periodically

### ❌ DON'T:
- Leave skills list empty
- Use vague terms like "good communicator"
- Skip the resume section
- Expect perfect matches without a complete profile

---

## 🔧 Troubleshooting

### "No recommendations found"
**Problem**: Empty or incomplete profile  
**Solution**: Add at least 3-5 specific skills and complete your resume

### "API Authentication Failed"
**Problem**: Invalid O*NET credentials  
**Solution**: Double-check your `.env` file for typos in username/password

### "Database error"
**Problem**: Migration not run  
**Solution**: Run `npx prisma migrate dev` and restart server

### Low match scores for all careers
**Problem**: Skills are too general or don't match O*NET database  
**Solution**: Add technical/specific skills (e.g., "Python", "Project Management", "SQL")

---

## 📱 Feature Access

### From Navigation:
Header → **Growth Tools** dropdown → **Career Match**

### Direct URL:
`http://localhost:3000/career-recommendations`

---

## 🎓 Example Use Cases

### Recent Graduate
1. Add skills learned in school
2. Generate recommendations
3. See what careers match your education
4. Identify skills to learn for better matches

### Career Changer
1. Input transferable skills
2. Filter for "Bright Outlook" careers
3. Review skill gaps for target careers
4. Plan your skill development path

### Professional Growth
1. Add all current skills and experience
2. Find higher-level roles in your field
3. See what skills advance your career
4. Track progress as you learn new skills

---

## 📚 Resources

- **O*NET Database**: https://www.onetonline.org/
- **Career Exploration**: Browse careers before generating recommendations
- **Skills Lookup**: Find standard skill names in O*NET
- **Industry Trends**: Check bright outlook careers for growth opportunities

---

## 🆘 Need Help?

1. Check [CAREER_RECOMMENDATIONS.md](CAREER_RECOMMENDATIONS.md) for detailed docs
2. Review O*NET API docs: https://services.onetcenter.org/reference/
3. Verify environment variables are set correctly
4. Check browser console and server logs for errors

---

## 🎉 You're All Set!

Start by:
1. Completing your profile with skills
2. Adding your resume
3. Generating your first recommendations
4. Exploring your career matches!

Happy career planning! 🚀
