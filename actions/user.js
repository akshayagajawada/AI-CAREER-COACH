"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { checkUser } from "@/lib/checkUser";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Validate input data
    if (!data.industry) {
      throw new Error("Industry is required");
    }

    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with insights
        if (!industryInsight) {
          try {
            const insights = await generateAIInsights(data.industry);

            industryInsight = await tx.industryInsight.create({
              data: {
                industry: data.industry,
                ...insights,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          } catch (insightError) {
            console.error("Error generating insights, using defaults:", insightError.message);
            // Create with fallback values
            industryInsight = await tx.industryInsight.create({
              data: {
                industry: data.industry,
                salaryRanges: [
                  { role: "Junior", min: 40, max: 60, median: 50, location: "USA" },
                  { role: "Mid-level", min: 60, max: 90, median: 75, location: "USA" },
                  { role: "Senior", min: 90, max: 150, median: 120, location: "USA" },
                ],
                growthRate: 5,
                demandLevel: "Medium",
                topSkills: ["Leadership", "Communication", "Problem Solving"],
                marketOutlook: "Positive",
                keyTrends: ["Digital Transformation", "Remote Work", "Automation"],
                recommendedSkills: ["Cloud Technologies", "Data Analysis", "Project Management"],
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000
      }
    );

    revalidatePath("/");
    return result.updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Ensure DB user exists for this Clerk user (creates if missing)
  const user = await checkUser();
  if (!user) {
    console.warn("getUserOnboardingStatus: no DB user available; returning not-onboarded");
    return { isOnboarded: false };
  }

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    return { isOnboarded: !!dbUser?.industry };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return { isOnboarded: false };
  }
}

export async function getUserSettings() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await checkUser();
  if (!user) {
    return { autoTranslate: true };
  }

  try {
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { 
        id: true,
        autoTranslate: true 
      },
    });

    return {
      autoTranslate: dbUser?.autoTranslate ?? true,
    };
  } catch (error) {
    console.error("Error getting user settings:", error);
    return { autoTranslate: true };
  }
}

export async function setAutoTranslate({ enabled }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    await db.user.update({
      where: { id: user.id },
      data: { autoTranslate: enabled },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating auto-translate setting:", error);
    throw new Error("Failed to update setting");
  }
}
