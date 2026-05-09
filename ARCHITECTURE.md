# Career Recommendations - System Architecture

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                                                                   │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │   Dashboard    │  │  Navigation  │  │  Career Match Page  │ │
│  │   Statistics   │  │    Header    │  │   (Main Feature)    │ │
│  └────────────────┘  └──────────────┘  └─────────────────────┘ │
│                                                                   │
│  Components:                                                      │
│  - CareerRecommendations.jsx                                     │
│  - CareerRecommendationCard (sub-component)                      │
│  - Statistics Cards                                              │
│  - Filter/Sort Controls                                          │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Server Actions (career-recommendation.js)       │  │
│  │                                                            │  │
│  │  • generateCareerRecommendations()                        │  │
│  │  • getUserCareerRecommendations(filters)                  │  │
│  │  • toggleFavoriteRecommendation(id)                       │  │
│  │  • getRecommendationStats()                               │  │
│  │  • deleteCareerRecommendation(id)                         │  │
│  │  • refreshCareerRecommendation(id)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        API Routes (/api/career-recommendations)           │  │
│  │                                                            │  │
│  │  • GET  - Fetch recommendations with filters              │  │
│  │  • POST - Generate/update recommendations                 │  │
│  │  • DELETE - Remove recommendations                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              O*NET Service (onet-service.js)              │  │
│  │                                                            │  │
│  │  Authentication & Request Handler                         │  │
│  │  • onetRequest(endpoint, params)                          │  │
│  │                                                            │  │
│  │  Career Data Functions                                    │  │
│  │  • searchCareers(keyword)                                 │  │
│  │  • getCareerDetails(onetCode)                            │  │
│  │  • getCareerSkills(onetCode)                             │  │
│  │  • getCareerKnowledge(onetCode)                          │  │
│  │  • getCareerAbilities(onetCode)                          │  │
│  │  • getCareerTechnologies(onetCode)                       │  │
│  │  • getCareerTasks(onetCode)                              │  │
│  │  • getCareerEducation(onetCode)                          │  │
│  │  • getRelatedCareers(onetCode)                           │  │
│  │                                                            │  │
│  │  Matching Algorithm                                        │  │
│  │  • calculateSkillMatch(userSkills, careerSkills)         │  │
│  │  • getCareerRecommendations(userProfile)                 │  │
│  │  • extractKeywordsFromResume(resumeContent)              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL API LAYER                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         O*NET Web Services API                            │  │
│  │         https://services.onetcenter.org/ws                │  │
│  │                                                            │  │
│  │  Endpoints Used:                                          │  │
│  │  • /online/search?keyword={keyword}                      │  │
│  │  • /online/occupations/{code}                            │  │
│  │  • /online/occupations/{code}/skills                     │  │
│  │  • /online/occupations/{code}/knowledge                  │  │
│  │  • /online/occupations/{code}/abilities                  │  │
│  │  • /online/occupations/{code}/technology                 │  │
│  │  • /online/occupations/{code}/tasks                      │  │
│  │  • /online/occupations/{code}/job_zone                   │  │
│  │  • /online/occupations/{code}/related                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               PostgreSQL (via Prisma ORM)                 │  │
│  │                                                            │  │
│  │  Models:                                                   │  │
│  │  ┌────────────────────────┐                              │  │
│  │  │  CareerRecommendation  │                              │  │
│  │  ├────────────────────────┤                              │  │
│  │  │ • id (Primary Key)     │                              │  │
│  │  │ • userId (Foreign Key) │ ───────────┐                 │  │
│  │  │ • onetCode             │            │                 │  │
│  │  │ • title                │            │                 │  │
│  │  │ • description          │            │                 │  │
│  │  │ • matchScore           │            │                 │  │
│  │  │ • matchedSkills[]      │            │                 │  │
│  │  │ • requiredSkills[]     │            │                 │  │
│  │  │ • brightOutlook        │            │                 │  │
│  │  │ • education            │            │                 │  │
│  │  │ • experience           │            │                 │  │
│  │  │ • tasks[]              │            │                 │  │
│  │  │ • technologies[]       │            │                 │  │
│  │  │ • knowledge[]          │            │                 │  │
│  │  │ • abilities[]          │            │                 │  │
│  │  │ • isFavorite           │            │                 │  │
│  │  │ • isViewed             │            │                 │  │
│  │  └────────────────────────┘            │                 │  │
│  │                                         │                 │  │
│  │  ┌────────────────┐                    │                 │  │
│  │  │      User      │ ◄──────────────────┘                 │  │
│  │  ├────────────────┤                                      │  │
│  │  │ • id           │                                      │  │
│  │  │ • skills[]     │ (Input for matching)                │  │
│  │  │ • experience   │                                      │  │
│  │  │ • resume       │ (Scanned for keywords)              │  │
│  │  └────────────────┘                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Sequence

### 1. Generate Recommendations
```
User clicks "Generate Recommendations"
    ↓
generateCareerRecommendations() action called
    ↓
Fetch User profile (skills, experience, resume)
    ↓
Call getCareerRecommendations(userProfile)
    ↓
For each user skill:
    ├─→ searchCareers(skill) [O*NET API]
    └─→ Aggregate career matches
    ↓
Remove duplicate careers
    ↓
For each career (parallel):
    ├─→ getCareerDetails(code)
    ├─→ getCareerSkills(code)
    ├─→ getCareerKnowledge(code)
    ├─→ getCareerAbilities(code)
    ├─→ getCareerTechnologies(code)
    ├─→ getCareerTasks(code)
    └─→ getCareerEducation(code)
    ↓
calculateSkillMatch(userSkills, careerSkills)
    ↓
Sort by match score (highest first)
    ↓
Save to database (upsert for each career)
    ↓
Return recommendations to UI
    ↓
Display in CareerRecommendations component
```

### 2. View Recommendations
```
User navigates to /career-recommendations
    ↓
Page loads getUserCareerRecommendations()
    ↓
Query database with filters:
    • minMatchScore
    • brightOutlookOnly
    • limit
    ↓
Order by matchScore DESC
    ↓
Return recommendations array
    ↓
Render in UI with tabs, filters, and cards
```

### 3. Toggle Favorite
```
User clicks star icon
    ↓
toggleFavoriteRecommendation(id)
    ↓
Find recommendation by ID and userId
    ↓
Update isFavorite = !isFavorite
    ↓
Save to database
    ↓
Update UI state optimistically
```

## 🎯 Skill Matching Algorithm

```
Input:
  userSkills = ["JavaScript", "React", "Node.js", "Python"]
  careerSkills = ["JavaScript", "TypeScript", "React", "Angular", "Node.js"]

Process:
  1. Normalize both arrays to lowercase
  2. Find matches using partial string matching:
     - "javascript" matches "javascript" ✓
     - "react" matches "react" ✓
     - "node.js" matches "node.js" ✓
     - "python" doesn't match anything ✗
  
  3. Calculate match score:
     matchedCount = 3
     requiredCount = 5
     matchScore = (3 / 5) * 100 = 60%

Output:
  {
    matchScore: 60.0,
    matchedSkills: ["JavaScript", "React", "Node.js"],
    missingSkills: ["TypeScript", "Angular"]
  }
```

## 🗂️ Component Hierarchy

```
app/(main)/career-recommendations/page.jsx
├── Statistics Cards
│   ├── Total Recommendations Card
│   ├── High Match Card
│   ├── Bright Outlook Card
│   └── Favorites Card
│
├── Top Match Highlight Card (conditional)
│   └── Shows best career match with score
│
└── CareerRecommendations Component
    ├── Filters & Sorting
    │   ├── Filter Dropdown (all/high-match/bright/favorites)
    │   └── Sort Dropdown (match/title)
    │
    └── CareerRecommendationCard[] (for each career)
        ├── Header
        │   ├── Title & O*NET Code
        │   ├── Bright Outlook Badge (conditional)
        │   ├── Favorite Button
        │   └── Refresh Button
        │
        ├── Match Score Progress Bar
        │
        └── Tabs
            ├── Overview Tab
            │   ├── Description
            │   ├── Education requirement
            │   ├── Experience requirement
            │   └── View Details Button
            │
            ├── Skills Tab
            │   ├── Matched Skills (green badges)
            │   └── Skills to Develop (outline badges)
            │
            ├── Details Tab
            │   ├── Key Tasks (bullet list)
            │   └── Technologies (badges)
            │
            └── Requirements Tab
                ├── Knowledge Areas (badges)
                ├── Required Abilities (badges)
                └── On-the-Job Training (text)
```

## 🔐 Authentication & Authorization

```
All API Routes & Server Actions:
    ↓
Check Clerk authentication
    ↓
const { userId } = await auth()
    ↓
if (!userId) → throw Error("Unauthorized")
    ↓
Find User in database by clerkUserId
    ↓
if (!user) → throw Error("User not found")
    ↓
Proceed with authorized operation
```

## 📊 Database Relationships

```
User (existing model)
  ├── id: String (Primary Key)
  ├── skills: String[] (Used for matching)
  ├── experience: Int (Used for filtering)
  └── resume: Resume relation
          └── content: String (Scanned for keywords)

CareerRecommendation (new model)
  ├── id: String (Primary Key)
  ├── userId: String (Foreign Key → User.id)
  ├── onetCode: String
  ├── [24 total fields...]
  └── Unique constraint on (userId, onetCode)
      └── Prevents duplicate recommendations per user
```

## 🚀 Performance Optimizations

### API Call Batching
```
Instead of: (Serial - Slow)
  searchCareers("skill1") → wait
  searchCareers("skill2") → wait
  searchCareers("skill3") → wait

We do: (Parallel - Fast)
  Promise.all([
    searchCareers("skill1"),
    searchCareers("skill2"),
    searchCareers("skill3")
  ])
```

### Database Caching
```
Generate once → Store in database → Reuse
  • Reduces API calls
  • Faster page loads
  • Enables offline-first experience
  • Can refresh individually on demand
```

### Smart Limiting
```
• Limit initial search to top 5 skills
• Limit career details to top 20 matches
• Prevents excessive O*NET API usage
• Focuses on most relevant results
```

## 📈 Scalability Considerations

```
Current Architecture:
  ✓ Single user per request
  ✓ Database-backed caching
  ✓ Parallel API calls
  ✓ Error handling with fallbacks

Future Scaling Options:
  • Add Redis cache for O*NET responses
  • Implement job queue for background generation
  • Add rate limiting for API calls
  • Batch user requests for admin operations
  • Add CDN caching for common careers
```

---

## 🎨 UI/UX Flow

```
Landing → Generate → Loading → Results → Details

1. Landing State
   [Generate Recommendations Button]
   [Info about the feature]

2. Loading State
   [Spinner Animation]
   "Analyzing your skills..."
   
3. Results State
   [Statistics Cards] ← Overview
   [Filter/Sort Controls] ← Navigation
   [Career Cards Grid] ← Main content
   
4. Details View
   [Expanded Card with Tabs]
   [Interactive elements]
   [Action buttons]
```

This architecture ensures:
- ✅ Separation of concerns
- ✅ Scalable structure
- ✅ Maintainable code
- ✅ Secure data flow
- ✅ Optimal performance
- ✅ Great user experience
