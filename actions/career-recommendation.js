"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getCareerRecommendations as getEscoRecommendations, getCareerDetails, getRelatedCareers } from "@/lib/onet-service";

/**
 * Generate and save career recommendations for the current user
 */
export async function generateCareerRecommendations() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      resume: true,
    },
  });

  if (!user) throw new Error("User not found");

  try {
    // Prepare user profile for ESCO API
    const userProfile = {
      skills: user.skills || [],
      experience: user.experience,
      industry: user.industry,
      resumeContent: user.resume?.content || null,
    };

    // Get recommendations from ESCO
    const recommendations = await getEscoRecommendations(userProfile);

    if (!recommendations || recommendations.length === 0) {
      throw new Error("No career recommendations found. Please add more skills to your profile or update your resume.");
    }

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          return await db.careerRecommendation.upsert({
            where: {
              userId_escoUri: {
                userId: user.id,
                escoUri: rec.escoUri,
              },
            },
            update: {
              escoCode: rec.escoCode,
              title: rec.title,
              description: rec.description,
              matchScore: rec.matchScore,
              matchedSkills: rec.matchedSkills,
              requiredSkills: rec.requiredSkills,
              brightOutlook: rec.brightOutlook,
              education: rec.education,
              experience: rec.experience,
              onTheJobTraining: rec.onTheJobTraining,
              tasks: rec.tasks,
              technologies: rec.technologies,
              knowledge: rec.knowledge,
              abilities: rec.abilities,
              updatedAt: new Date(),
            },
            create: {
              userId: user.id,
              escoUri: rec.escoUri,
              escoCode: rec.escoCode,
              title: rec.title,
              description: rec.description,
              matchScore: rec.matchScore,
              matchedSkills: rec.matchedSkills,
              requiredSkills: rec.requiredSkills,
              brightOutlook: rec.brightOutlook,
              education: rec.education,
              experience: rec.experience,
              onTheJobTraining: rec.onTheJobTraining,
              tasks: rec.tasks,
              technologies: rec.technologies,
              knowledge: rec.knowledge,
              abilities: rec.abilities,
            },
          });
        } catch (error) {
          console.error(`Failed to save recommendation for ${rec.escoUri}:`, error);
          return null;
        }
      })
    );

    const validRecommendations = savedRecommendations.filter(r => r !== null);

    revalidatePath("/career-recommendations");
    return {
      success: true,
      count: validRecommendations.length,
      recommendations: validRecommendations,
    };
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    throw new Error(`Failed to generate recommendations: ${error.message}`);
  }
}

/**
 * Get all career recommendations for the current user
 */
export async function getUserCareerRecommendations(filters = {}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const { minMatchScore = 0, brightOutlookOnly = false, limit = 50 } = filters;

  const where = {
    userId: user.id,
    ...(minMatchScore > 0 && { matchScore: { gte: minMatchScore } }),
    ...(brightOutlookOnly && { brightOutlook: true }),
  };

  const recommendations = await db.careerRecommendation.findMany({
    where,
    orderBy: [
      { matchScore: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  });

  return recommendations;
}

/**
 * Get a single career recommendation by ID
 */
export async function getCareerRecommendationById(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const recommendation = await db.careerRecommendation.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!recommendation) throw new Error("Recommendation not found");

  // Mark as viewed
  if (!recommendation.isViewed) {
    await db.careerRecommendation.update({
      where: { id },
      data: { isViewed: true },
    });
  }

  return recommendation;
}

/**
 * Toggle favorite status for a career recommendation
 */
export async function toggleFavoriteRecommendation(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const recommendation = await db.careerRecommendation.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!recommendation) throw new Error("Recommendation not found");

  const updated = await db.careerRecommendation.update({
    where: { id },
    data: {
      isFavorite: !recommendation.isFavorite,
    },
  });

  revalidatePath("/career-recommendations");
  return updated;
}

/**
 * Delete a career recommendation
 */
export async function deleteCareerRecommendation(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  await db.careerRecommendation.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/career-recommendations");
  return { success: true };
}

/**
 * Get statistics about user's career recommendations
 */
export async function getRecommendationStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const [total, brightOutlook, favorites, highMatch] = await Promise.all([
    db.careerRecommendation.count({
      where: { userId: user.id },
    }),
    db.careerRecommendation.count({
      where: { userId: user.id, brightOutlook: true },
    }),
    db.careerRecommendation.count({
      where: { userId: user.id, isFavorite: true },
    }),
    db.careerRecommendation.count({
      where: { userId: user.id, matchScore: { gte: 70 } },
    }),
  ]);

  const topRecommendation = await db.careerRecommendation.findFirst({
    where: { userId: user.id },
    orderBy: { matchScore: 'desc' },
  });

  return {
    total,
    brightOutlook,
    favorites,
    highMatch,
    topMatch: topRecommendation ? {
      title: topRecommendation.title,
      matchScore: topRecommendation.matchScore,
    } : null,
  };
}

/**
 * Refresh a specific recommendation with latest O*NET data
 */
export async function refreshCareerRecommendation(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const recommendation = await db.careerRecommendation.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!recommendation) throw new Error("Recommendation not found");

  try {
    // Get fresh data from ESCO
    const details = await getCareerDetails(recommendation.escoUri);
    
    // Update the recommendation with fresh data
    const updated = await db.careerRecommendation.update({
      where: { id },
      data: {
        title: details?.preferredLabel?.en || recommendation.title,
        description: details?.description?.en || recommendation.description,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/career-recommendations");
    return updated;
  } catch (error) {
    console.error(`Failed to refresh recommendation ${id}:`, error);
    throw new Error("Failed to refresh recommendation data");
  }
}

/**
 * Get related careers for a specific recommendation
 */
export async function getRelatedCareerRecommendations(escoUri) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const relatedCareers = await getRelatedCareers(escoUri);
    return relatedCareers.slice(0, 10); // Return top 10 related careers
  } catch (error) {
    console.error(`Failed to get related careers for ${escoUri}:`, error);
    return [];
  }
}
