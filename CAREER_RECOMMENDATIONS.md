# Career Recommendations Feature - O*NET Integration

## Overview
The Career Recommendations feature provides personalized career guidance by analyzing user skills and resume content through the O*NET Web Services API. This feature matches users with suitable careers based on their profile and shows skill gaps for professional development.

## Features

### 🎯 Smart Career Matching
- **Skill-Based Matching**: Analyzes user skills against O*NET career requirements
- **Resume Scanning**: Extracts keywords and skills from resume content
- **Match Score Calculation**: Provides percentage match for each career recommendation
- **Bright Outlook Careers**: Highlights careers with strong growth potential

### 📊 Comprehensive Career Data
- Job titles and descriptions from O*NET database
- Required skills, knowledge areas, and abilities
- Education and experience requirements
- On-the-job training information
- Key tasks and responsibilities
- Technologies used in each career
- Related career suggestions

### 💼 User-Friendly Interface
- Filterable recommendations (All, High Match, Bright Outlook, Favorites)
- Sortable by match score or title
- Tabbed views for different information categories
- Favorite careers for quick access
- Detailed statistics dashboard

## Setup Instructions

### 1. O*NET API Credentials
1. Visit [O*NET Web Services](https://services.onetcenter.org/)
2. Create a free account
3. Obtain your username and password
4. Add credentials to your `.env` file:
   ```bash
   ONET_USERNAME=your_username
   ONET_PASSWORD=your_password
   ```

### 2. Database Migration
Run the Prisma migration to add the new CareerRecommendation model:

```bash
npx prisma migrate dev --name add_career_recommendations
```

Or generate the Prisma client if migrations already exist:

```bash
npx prisma generate
```

### 3. Verify Installation
The feature includes:
- Database schema updates (`prisma/schema.prisma`)
- O*NET service utility (`lib/onet-service.js`)
- Server actions (`actions/career-recommendation.js`)
- API routes (`app/api/career-recommendations/route.js`)
- UI components (`components/career-recommendations.jsx`)
- Feature page (`app/(main)/career-recommendations/page.jsx`)

## Usage

### Accessing the Feature
1. Navigate to **Growth Tools** menu in the header
2. Click **Career Match**
3. Click **Generate Recommendations** button

### Generating Recommendations
The system will:
1. Analyze your profile skills
2. Extract keywords from your resume
3. Query O*NET database for matching careers
4. Calculate match scores based on skill alignment
5. Save recommendations to your profile

### Viewing Recommendations
Each recommendation card displays:
- **Overview Tab**: Career description, education, and experience requirements
- **Skills Tab**: Matched skills vs. skills to develop
- **Details Tab**: Key tasks and technologies used
- **Requirements Tab**: Knowledge areas, abilities, and training info

### Managing Recommendations
- **⭐ Favorite**: Mark careers of interest
- **🔄 Refresh**: Update career data from O*NET
- **🗑️ Remove**: Delete unwanted recommendations
- **📊 Filter**: View by match score, bright outlook, or favorites
- **🔍 Sort**: Order by match percentage or career title

## API Endpoints

### GET `/api/career-recommendations`
Fetch user's career recommendations

**Query Parameters:**
- `action`: `stats`, `detail`, or `related`
- `id`: Recommendation ID (for detail)
- `onetCode`: O*NET code (for related careers)
- `minMatchScore`: Minimum match percentage filter
- `brightOutlookOnly`: Filter for bright outlook careers
- `limit`: Maximum results to return

**Example:**
```javascript
// Get all recommendations
fetch('/api/career-recommendations')

// Get high match recommendations
fetch('/api/career-recommendations?minMatchScore=70&limit=10')

// Get statistics
fetch('/api/career-recommendations?action=stats')
```

### POST `/api/career-recommendations`
Generate or update recommendations

**Request Body:**
```json
{
  "action": "generate" | "toggle-favorite" | "refresh",
  "id": "recommendation_id" // for toggle-favorite and refresh
}
```

### DELETE `/api/career-recommendations?id={id}`
Remove a recommendation

## Database Schema

### CareerRecommendation Model
```prisma
model CareerRecommendation {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  
  // O*NET Data
  onetCode          String    // O*NET SOC code
  title             String    // Job title
  description       String    // Career description
  
  // Matching details
  matchScore        Float     // Match percentage
  matchedSkills     String[]  // User skills that match
  requiredSkills    String[]  // All required skills
  
  // Additional information
  brightOutlook     Boolean
  education         String?
  experience        String?
  onTheJobTraining  String?
  tasks             String[]
  technologies      String[]
  knowledge         String[]
  abilities         String[]
  
  // Status
  isFavorite        Boolean
  isViewed          Boolean
  
  createdAt         DateTime
  updatedAt         DateTime
}
```

## Server Actions

### `generateCareerRecommendations()`
Generates new recommendations based on user profile

### `getUserCareerRecommendations(filters)`
Retrieves saved recommendations with optional filters

### `getCareerRecommendationById(id)`
Fetches a specific recommendation with full details

### `toggleFavoriteRecommendation(id)`
Marks/unmarks a career as favorite

### `deleteCareerRecommendation(id)`
Removes a recommendation from user's list

### `getRecommendationStats()`
Returns statistics about user's recommendations

### `refreshCareerRecommendation(id)`
Updates a recommendation with latest O*NET data

### `getRelatedCareerRecommendations(onetCode)`
Finds similar careers based on O*NET code

## O*NET Service Functions

The `lib/onet-service.js` provides functions to interact with O*NET API:

- `searchCareers(keyword)` - Search by keyword
- `getCareerDetails(onetCode)` - Get full career information
- `getCareerSkills(onetCode)` - Fetch required skills
- `getCareerKnowledge(onetCode)` - Get knowledge areas
- `getCareerAbilities(onetCode)` - Fetch required abilities
- `getCareerTechnologies(onetCode)` - Get technologies used
- `getCareerTasks(onetCode)` - Fetch key tasks
- `getCareerEducation(onetCode)` - Get education requirements
- `getRelatedCareers(onetCode)` - Find similar careers
- `getCareerRecommendations(userProfile)` - Generate matches

## Match Score Algorithm

The system calculates match scores based on:

1. **Skill Overlap**: Percentage of required skills user possesses
2. **Resume Keywords**: Additional matching from resume content
3. **Normalized Comparison**: Case-insensitive partial matching

```javascript
matchScore = (matchedSkills.length / requiredSkills.length) * 100
```

## Best Practices

### For Better Recommendations
1. **Complete Your Profile**: Add comprehensive skills list
2. **Update Your Resume**: Include detailed experience and technologies
3. **Regular Updates**: Regenerate recommendations as you gain new skills
4. **Review Skill Gaps**: Use missing skills to guide learning path

### Performance Optimization
- API calls are batched where possible
- Recommendations are cached in database
- Limited to top 20 initial matches to reduce API usage
- Graceful error handling for API failures

## Troubleshooting

### No Recommendations Generated
- **Issue**: User has no skills or resume
- **Solution**: Add skills to profile and complete resume

### API Authentication Errors
- **Issue**: Invalid O*NET credentials
- **Solution**: Verify `ONET_USERNAME` and `ONET_PASSWORD` in `.env`

### Low Match Scores
- **Issue**: User skills don't align with searched careers
- **Solution**: Add more specific technical skills to profile

### Database Errors
- **Issue**: Migration not applied
- **Solution**: Run `npx prisma migrate dev`

## Future Enhancements

Potential improvements:
- Integration with job boards for live opportunities
- Salary data visualization from O*NET wage information
- Career path recommendations (progression planning)
- Skills gap analysis with learning resource suggestions
- Export recommendations as PDF report
- Email notifications for new bright outlook careers
- Machine learning for improved matching algorithm

## Support

For issues or questions:
1. Check O*NET API documentation: https://services.onetcenter.org/reference/
2. Verify environment variables are set correctly
3. Check browser console for client-side errors
4. Review server logs for API failures

## License
This feature integrates with O*NET Web Services, which is sponsored by the U.S. Department of Labor. Please review O*NET's terms of service.
