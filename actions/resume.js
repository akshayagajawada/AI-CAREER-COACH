"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = process.env.GEMINI_MODEL || "gpt-4o-mini";
let model = null;
try {
  model = genAI.getGenerativeModel({ model: modelName });
} catch (err) {
  console.warn("Generative model not initialized or unavailable:", err?.message || err);
}

export async function saveResume(payload) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  // Support old string payloads and newer { translations } payload
  let translations = null;
  if (typeof payload === 'string') {
    translations = { en: payload };
  } else if (payload && payload.translations) {
    translations = payload.translations;
  } else {
    throw new Error('Invalid payload for saveResume');
  }

  try {
    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content: translations.en || translations[Object.keys(translations)[0]] || '',
        translations,
      },
      create: {
        userId: user.id,
        content: translations.en || translations[Object.keys(translations)[0]] || '',
        translations,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    if (!model) throw new Error("Generative model not available");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    // Fall back to returning the original content if AI is unavailable
    return current;
  }
}

// Translate markdown content from sourceLang to targetLang while preserving markdown structure
export async function translateResume({ content, sourceLang = 'en', targetLang }) {
  if (!content) throw new Error('No content provided');
  if (!targetLang) throw new Error('No target language provided');

  const prompt = `You are a professional translator. Translate the following markdown resume from ${sourceLang} to ${targetLang}. Preserve all markdown formatting, headings, lists, links, and special characters. Do NOT translate names, URLs, email addresses, or code blocks. Keep the structure identical and only return the translated markdown content without any extra commentary.`;

  try {
    if (!model) throw new Error('Generative model not available');
    const result = await model.generateContent(`${prompt}\n\nResume:\n\n"""\n${content}\n"""\n\nReturn only the translated markdown.`);
    const response = result.response;
    const translated = response.text().trim();
    return translated;
  } catch (error) {
    console.error('Error translating content:', error);
    throw new Error('Failed to translate content');
  }
}
