"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = process.env.GEMINI_MODEL || "gpt-4o-mini";
let model;
try {
  model = genAI.getGenerativeModel({ model: modelName });
} catch (err) {
  console.warn("Could not initialize generative model:", err);
  model = null;
}

export const generateAIInsights = async (industry) => {
  if (!industry) {
    throw new Error("Industry is required to generate insights");
  }

  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    if (!model) {
      throw new Error("Generative model not initialized or unavailable");
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const insights = JSON.parse(cleanedText);

    // Validate the response structure
    if (!insights.salaryRanges || !Array.isArray(insights.salaryRanges)) {
      throw new Error("Invalid response: salaryRanges not found");
    }

    return insights;
  } catch (error) {
    console.error(`Error generating AI insights for ${industry}:`, error);
    
    // Return fallback insights if API fails
    console.warn(`Using fallback insights for ${industry}`);
    return {
      salaryRanges: [
        { role: "Junior", min: 40, max: 60, median: 50, location: "USA" },
        { role: "Mid-level", min: 60, max: 90, median: 75, location: "USA" },
        { role: "Senior", min: 90, max: 150, median: 120, location: "USA" },
      ],
      growthRate: 5,
      demandLevel: "Medium",
      topSkills: ["Leadership", "Communication", "Problem Solving", "Technical Skills", "Adaptability"],
      marketOutlook: "Positive",
      keyTrends: ["Digital Transformation", "Remote Work", "Automation", "AI Integration", "Sustainability"],
      recommendedSkills: ["Cloud Technologies", "Data Analysis", "Project Management", "Soft Skills", "Continuous Learning"],
    };
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
