/**
 * ESCO (European Skills, Competences, Qualifications and Occupations) API Integration
 * Documentation: https://esco.ec.europa.eu/en/use-esco/download
 * API Docs: https://ec.europa.eu/esco/api
 */

const ESCO_API_BASE = 'https://ec.europa.eu/esco/api';

/**
 * Helper function to make requests to ESCO API (no authentication needed)
 */
async function escoRequest(endpoint, params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const url = `${ESCO_API_BASE}${endpoint}${queryParams ? '?' + queryParams : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`ESCO API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ESCO API request failed:', error);
    throw error;
  }
}

/**
 * Search for careers based on keywords using ESCO
 */
export async function searchCareers(keyword) {
  try {
    const data = await escoRequest('/search', {
      text: keyword,
      type: 'occupation',
      language: 'en',
      limit: 20,
    });
    return data._embedded?.results || [];
  } catch (error) {
    console.warn(`Search failed for keyword: ${keyword}`, error);
    return [];
  }
}

/**
 * Get career details by ESCO URI
 */
export async function getCareerDetails(escoUri) {
  try {
    const data = await escoRequest('/resource/occupation', {
      uri: escoUri,
      language: 'en',
    });
    return data;
  } catch (error) {
    console.warn(`Failed to get details for ${escoUri}:`, error);
    return null;
  }
}

/**
 * Get skills for a specific career
 */
export async function getCareerSkills(escoUri) {
  try {
    const occupation = await getCareerDetails(escoUri);
    const skills = [];
    
    // Essential skills from _links
    if (occupation?._links?.hasEssentialSkill) {
      skills.push(...occupation._links.hasEssentialSkill.map(s => ({
        name: s.title,
        level: 'essential',
        uri: s.uri,
      })));
    }
    
    // Optional skills from _links
    if (occupation?._links?.hasOptionalSkill) {
      skills.push(...occupation._links.hasOptionalSkill.map(s => ({
        name: s.title,
        level: 'optional',
        uri: s.uri,
      })));
    }
    
    return skills;
  } catch (error) {
    console.warn(`Failed to get skills for ${escoUri}:`, error);
    return [];
  }
}

/**
 * Get knowledge areas for a specific career
 */
export async function getCareerKnowledge(escoUri) {
  try {
    const occupation = await getCareerDetails(escoUri);
    const knowledge = [];
    
    if (occupation?._links?.hasEssentialKnowledge) {
      knowledge.push(...occupation._links.hasEssentialKnowledge.map(k => k.title));
    }
    
    if (occupation?._links?.hasOptionalKnowledge) {
      knowledge.push(...occupation._links.hasOptionalKnowledge.map(k => k.title));
    }
    
    return knowledge;
  } catch (error) {
    console.warn(`Failed to get knowledge for ${escoUri}:`, error);
    return [];
  }
}

/**
 * Get abilities for a specific career (ESCO uses competences)
 */
export async function getCareerAbilities(escoUri) {
  try {
    const occupation = await getCareerDetails(escoUri);
    const abilities = [];
    
    if (occupation?._links?.hasEssentialCompetence) {
      abilities.push(...occupation._links.hasEssentialCompetence.map(c => c.title));
    }
    
    return abilities;
  } catch (error) {
    console.warn(`Failed to get abilities for ${escoUri}:`, error);
    return [];
  }
}

/**
 * Get technologies used in a career (extracted from skills)
 */
export async function getCareerTechnologies(escoUri) {
  try {
    const skills = await getCareerSkills(escoUri);
    // Filter technical/technology-related skills
    const techSkills = skills
      .filter(s => {
        const name = s.name.toLowerCase();
        return name.includes('software') || name.includes('technology') || 
               name.includes('programming') || name.includes('system') ||
               name.includes('application') || name.includes('digital');
      })
      .map(s => s.name);
    
    return techSkills;
  } catch (error) {
    console.warn(`Failed to get technologies for ${escoUri}:`, error);
    return [];
  }
}

/**
 * Get tasks for a specific career
 */
export async function getCareerTasks(escoUri) {
  try {
    const occupation = await getCareerDetails(escoUri);
    const tasks = [];
    
    // ESCO provides scope notes which can serve as task descriptions
    if (occupation?.scopeNote?.en?.literal) {
      tasks.push(occupation.scopeNote.en.literal);
    }
    
    // Alternative descriptions - multilingual object
    if (occupation?.description) {
      const desc = occupation.description['en']?.literal || 
                   occupation.description['en-us']?.literal ||
                   Object.values(occupation.description)[0]?.literal;
      if (desc) tasks.push(desc);
    }
    
    return tasks;
  } catch (error) {
    console.warn(`Failed to get tasks for ${escoUri}:`, error);
    return [];
  }
}

/**
 * Get education, training, and experience information
 */
export async function getCareerEducation(escoUri) {
  try {
    const occupation = await getCareerDetails(escoUri);
    
    // ESCO provides regulation information
    const education = {
      isRegulatedProfession: occupation?.isRegulatedProfession || false,
      regulationNote: occupation?.regulationNote?.en || null,
      code: occupation?.code || null,
    };
    
    return education;
  } catch (error) {
    console.warn(`Failed to get education info for ${escoUri}:`, error);
    return null;
  }
}

/**
 * Calculate skill match score between user skills and career requirements
 */
function calculateSkillMatch(userSkills, careerSkills) {
  if (!userSkills || userSkills.length === 0) {
    return { matchScore: 0, matchedSkills: [], missingSkills: careerSkills || [] };
  }
  
  if (!careerSkills || careerSkills.length === 0) {
    return { matchScore: 50, matchedSkills: [], missingSkills: [] }; // Give benefit of doubt
  }

  const normalizedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const normalizedCareerSkills = careerSkills.map(s => s.toLowerCase().trim());
  
  // Skill mapping for better matching (technical skills to career skill terms)
  const skillSynonyms = {
    'javascript': ['programming', 'software', 'web', 'code', 'script'],
    'python': ['programming', 'software', 'code', 'script', 'data'],
    'java': ['programming', 'software', 'code'],
    'react': ['web', 'frontend', 'user interface', 'software'],
    'node.js': ['backend', 'server', 'software', 'web'],
    'sql': ['database', 'data', 'query'],
    'html': ['web', 'frontend', 'markup'],
    'css': ['web', 'frontend', 'design', 'style'],
    'aws': ['cloud', 'infrastructure', 'server'],
    'azure': ['cloud', 'infrastructure', 'server'],
    'docker': ['deployment', 'container', 'devops'],
    'kubernetes': ['deployment', 'orchestration', 'devops'],
    'git': ['version control', 'software'],
    'nursing': ['care', 'health', 'medical', 'patient'],
    'teaching': ['education', 'instruction', 'learning'],
    'accounting': ['finance', 'financial', 'bookkeeping']
  };
  
  // Expand user skills with synonyms
  const expandedUserSkills = new Set(normalizedUserSkills);
  normalizedUserSkills.forEach(skill => {
    if (skillSynonyms[skill]) {
      skillSynonyms[skill].forEach(syn => expandedUserSkills.add(syn));
    }
  });
  
  const matchedSkills = Array.from(expandedUserSkills).filter(userSkill => 
    normalizedCareerSkills.some(careerSkill => 
      careerSkill.includes(userSkill) || 
      userSkill.includes(careerSkill) ||
      // Fuzzy matching for technical terms
      (userSkill.length > 4 && careerSkill.includes(userSkill.substring(0, userSkill.length - 2)))
    )
  );

  // Calculate score - be more generous for technical roles
  const baseScore = (matchedSkills.length / Math.max(normalizedCareerSkills.length, 10)) * 100;
  const bonusScore = Math.min(matchedSkills.length * 5, 30); // Bonus for each match
  const matchScore = Math.min(baseScore + bonusScore, 100);
  
  const missingSkills = careerSkills.filter(careerSkill => 
    !matchedSkills.some(matched => 
      careerSkill.toLowerCase().includes(matched.toLowerCase()) || 
      matched.toLowerCase().includes(careerSkill.toLowerCase())
    )
  );

  return {
    matchScore: Math.round(matchScore * 10) / 10,
    matchedSkills: matchedSkills.slice(0, 10), // Limit to avoid bloat
    missingSkills
  };
}

/**
 * Get comprehensive career recommendations based on user profile
 */
export async function getCareerRecommendations(userProfile) {
  const { skills = [], experience, industry, resumeContent } = userProfile;

  try {
    // Map technical skills to broader career search terms
    const skillToCareerMap = {
      javascript: 'software developer',
      react: 'web developer',
      'node.js': 'software developer',
      python: 'software developer',
      java: 'software developer',
      sql: 'database',
      aws: 'cloud',
      azure: 'cloud',
      'data science': 'data scientist',
      'machine learning': 'data scientist',
      nursing: 'nurse',
      teaching: 'teacher',
      accounting: 'accountant',
      marketing: 'marketing',
      sales: 'sales'
    };

    // Build search keywords from skills and experience
    const keywords = new Set();
    
    // Map skills to career terms
    skills.forEach(skill => {
      const normalizedSkill = skill.toLowerCase().trim();
      if (skillToCareerMap[normalizedSkill]) {
        keywords.add(skillToCareerMap[normalizedSkill]);
      } else {
        // Add the skill itself if it's a general term
        if (skill.length > 3 && !skill.includes('.')) {
          keywords.add(normalizedSkill);
        }
      }
    });

    // Add experience as keyword
    if (experience) {
      keywords.add(experience.toLowerCase());
    }

    // Extract additional keywords from resume if available
    if (resumeContent) {
      const resumeKeywords = extractKeywordsFromResume(resumeContent);
      resumeKeywords.forEach(kw => keywords.add(kw));
    }

    // Add industry as a keyword if available
    if (industry) {
      keywords.add(industry.split('-')[0]); // Extract main industry
    }

    // Fallback: if we have tech skills but no keywords, add generic tech searches
    const techSkills = skills.filter(s => 
      ['javascript', 'react', 'python', 'java', 'node', 'sql', 'code', 'programming'].some(tech =>
        s.toLowerCase().includes(tech)
      )
    );
    if (techSkills.length > 0 && keywords.size === 0) {
      keywords.add('software');
      keywords.add('developer');
      keywords.add('programmer');
    }

    // If still no keywords, use default searches
    if (keywords.size === 0) {
      keywords.add('professional');
      keywords.add('specialist');
    }

    // Search for careers based on keywords (limit to top 8 keywords)
    const searchResults = [];
    const searchPromises = Array.from(keywords).slice(0, 8).map(keyword =>
      searchCareers(keyword).catch(error => {
        console.warn(`Failed to search for keyword: ${keyword}`, error);
        return [];
      })
    );

    const results = await Promise.all(searchPromises);
    results.forEach(result => searchResults.push(...result));

    // Remove duplicates based on ESCO URI
    const uniqueCareers = Array.from(
      new Map(searchResults.map(career => [career.uri, career])).values()
    );

    // Get detailed information for each career and calculate match scores
    const recommendations = await Promise.all(
      uniqueCareers.slice(0, 20).map(async (career) => {
        try {
          const [details, careerSkills, knowledge, abilities, technologies, tasks, education] = 
            await Promise.all([
              getCareerDetails(career.uri),
              getCareerSkills(career.uri).catch(() => []),
              getCareerKnowledge(career.uri).catch(() => []),
              getCareerAbilities(career.uri).catch(() => []),
              getCareerTechnologies(career.uri).catch(() => []),
              getCareerTasks(career.uri).catch(() => []),
              getCareerEducation(career.uri).catch(() => null),
            ]);

          if (!details) return null;

          // Extract description from multilingual object
          let description = '';
          if (details.description) {
            description = details.description['en']?.literal || 
                         details.description['en-us']?.literal ||
                         Object.values(details.description)[0]?.literal || '';
          }

          // Extract skill names from career skills
          const requiredSkills = careerSkills.map(s => s.name || s);
          
          // Calculate match score
          const { matchScore, matchedSkills, missingSkills} = calculateSkillMatch(skills, requiredSkills);

          return {
            escoUri: career.uri,
            escoCode: details.code || career.code,
            title: details.title || career.title,
            description,
            matchScore,
            matchedSkills,
            requiredSkills,
            missingSkills,
            brightOutlook: details.isRegulatedProfession || false, // Use regulated profession as indicator
            education: education?.regulationNote || null,
            experience: null, // ESCO doesn't provide explicit experience levels
            onTheJobTraining: null,
            tasks: tasks.slice(0, 10),
            technologies: technologies.slice(0, 15),
            knowledge: knowledge.slice(0, 10),
            abilities: abilities.slice(0, 10),
          };
        } catch (error) {
          console.warn(`Failed to get details for career ${career.uri}:`, error);
          return null;
        }
      })
    );

    // Filter out null results, require minimum 10% match, and sort by match score
    return recommendations
      .filter(r => r !== null && r.matchScore >= 10)
      .sort((a, b) => b.matchScore - a.matchScore);
      
  } catch (error) {
    console.error('Error getting career recommendations:', error);
    throw error;
  }
}

/**
 * Extract keywords from resume content
 */
function extractKeywordsFromResume(resumeContent) {
  if (!resumeContent) return [];

  // Remove markdown formatting
  const cleanContent = resumeContent
    .replace(/[#*_`\[\]()]/g, ' ')
    .toLowerCase();

  // Common tech and professional keywords
  const keywordPatterns = [
    /\b(javascript|python|java|react|node|sql|aws|azure|cloud|api|database|design|management|leadership|analytics|marketing|sales|engineering|development|testing|agile|scrum)\b/gi
  ];

  const keywords = new Set();
  keywordPatterns.forEach(pattern => {
    const matches = cleanContent.match(pattern);
    if (matches) {
      matches.forEach(match => keywords.add(match.toLowerCase()));
    }
  });

  return Array.from(keywords);
}

/**
 * Get related careers based on a specific ESCO URI
 */
export async function getRelatedCareers(escoUri) {
  try {
    const occupation = await getCareerDetails(escoUri);
    const related = [];
    
    // ESCO provides broader/narrower relations in _links
    if (occupation?._links?.broaderOccupation) {
      related.push(...occupation._links.broaderOccupation);
    }
    
    if (occupation?._links?.narrowerOccupation) {
      related.push(...occupation._links.narrowerOccupation);
    }
    
    return related.slice(0, 10).map(r => ({
      uri: r.uri,
      title: r.title,
      code: r.code,
    }));
  } catch (error) {
    console.warn(`Failed to get related careers for ${escoUri}:`, error);
    return [];
  }
}
