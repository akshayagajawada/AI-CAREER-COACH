# Full Stack AI Career Coach with Next JS, Neon DB, Tailwind, Prisma, Inngest, Shadcn UI Tutorial 🔥🔥
## https://youtu.be/UbXpRv5ApKA

![sensai](https://github.com/user-attachments/assets/eee79242-4056-4d19-b655-2873788979e1)

### Make sure to create a `.env` file with following variables -

```
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=

# O*NET Web Services API (for Career Recommendations)
ONET_USERNAME=
ONET_PASSWORD=
```

## 🎯 New Feature: Career Recommendations

The app now includes a **Career Recommendations** feature powered by O*NET Web Services API!

### Features:
- **Smart Career Matching**: Analyzes your skills and resume to suggest matching careers
- **Skill Gap Analysis**: Shows which skills you have and which you need to develop
- **Bright Outlook Careers**: Highlights careers with strong growth potential
- **Detailed Career Info**: Education, experience, tasks, technologies, and more
- **O*NET Database**: Access to 1000+ standardized occupational data

### Setup:
1. Get free O*NET API credentials at [services.onetcenter.org](https://services.onetcenter.org/)
2. Add `ONET_USERNAME` and `ONET_PASSWORD` to your `.env` file
3. Run the setup script: `.\scripts\setup-career-recommendations.ps1`
4. Navigate to **Growth Tools → Career Match** in the app

For detailed documentation, see [CAREER_RECOMMENDATIONS.md](CAREER_RECOMMENDATIONS.md)
