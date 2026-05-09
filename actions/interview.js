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

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  if (!user.industry) {
    throw new Error("Please complete your onboarding first to generate personalized questions");
  }

  const skillsString = user.skills?.length 
    ? ` with expertise in ${Array.isArray(user.skills) ? user.skills.join(", ") : user.skills}`
    : "";

  const prompt = `
    Generate 10 technical interview questions for a ${user.industry} professional${skillsString}.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
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
    const quiz = JSON.parse(cleanedText);

    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error("Invalid quiz format: questions not found or not an array");
    }

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    
    // Fallback: Return sample questions based on industry
    console.warn(`Using fallback quiz for ${user.industry}`);
    return [
      {
        question: "What is your approach to solving complex technical problems in a ${user.industry} environment?",
        options: [
          "Break it down, analyze dependencies, test incrementally",
          "Start coding immediately without planning",
          "Copy existing solutions from similar projects",
          "Ask for help without attempting first"
        ],
        correctAnswer: "Break it down, analyze dependencies, test incrementally",
        explanation: "A systematic approach to problem-solving is essential in technical roles."
      },
      {
        question: "How do you stay updated with the latest technologies in ${user.industry}?",
        options: [
          "Read documentation, attend conferences, contribute to open source",
          "Wait for technologies to become mainstream before learning",
          "Only learn when required for current project",
          "Rely on colleagues' knowledge"
        ],
        correctAnswer: "Read documentation, attend conferences, contribute to open source",
        explanation: "Continuous learning is critical for career growth in tech."
      },
      {
        question: "Describe your experience with team collaboration and code reviews.",
        options: [
          "View them as opportunities for improvement and knowledge sharing",
          "See them as criticism of my work",
          "Only participate when required",
          "Prefer working in isolation"
        ],
        correctAnswer: "View them as opportunities for improvement and knowledge sharing",
        explanation: "Positive collaboration strengthens team dynamics and code quality."
      },
      {
        question: "How do you handle tight deadlines and competing priorities?",
        options: [
          "Prioritize tasks, communicate clearly, manage expectations, ask for help if needed",
          "Work recklessly to meet all deadlines regardless of quality",
          "Miss deadlines rather than compromise quality",
          "Avoid taking on challenging projects"
        ],
        correctAnswer: "Prioritize tasks, communicate clearly, manage expectations, ask for help if needed",
        explanation: "Professional time management and communication are essential skills."
      },
      {
        question: "What's your approach to learning new tools or frameworks?",
        options: [
          "Hands-on practice with tutorials, build small projects, read documentation",
          "Only read about it without trying",
          "Wait for a mandatory training session",
          "Assume you don't need to learn anything new"
        ],
        correctAnswer: "Hands-on practice with tutorials, build small projects, read documentation",
        explanation: "Active learning through practice is the most effective method."
      },
      {
        question: "How do you ensure code quality and maintainability?",
        options: [
          "Write clean code, add comments, follow standards, test thoroughly, review peers' code",
          "Write code quickly regardless of quality",
          "Only test when bugs are reported",
          "Documentation is someone else's job"
        ],
        correctAnswer: "Write clean code, add comments, follow standards, test thoroughly, review peers' code",
        explanation: "Quality and maintainability are cornerstones of professional software development."
      },
      {
        question: "Describe a challenging project you've worked on and how you overcame obstacles.",
        options: [
          "Analyzed the problem, broke it into manageable parts, sought advice when needed",
          "Gave up when faced with difficulties",
          "Tried only one approach and accepted failure",
          "Waited for someone else to solve it"
        ],
        correctAnswer: "Analyzed the problem, broke it into manageable parts, sought advice when needed",
        explanation: "Resilience and problem-solving skills are valuable in any role."
      },
      {
        question: "How would you handle a situation where you discovered a major flaw in your code after deployment?",
        options: [
          "Acknowledge it, create a hotfix, communicate with stakeholders, implement prevention measures",
          "Blame external factors",
          "Hide the issue hoping no one notices",
          "Resign from the position"
        ],
        correctAnswer: "Acknowledge it, create a hotfix, communicate with stakeholders, implement prevention measures",
        explanation: "Accountability and swift problem resolution are marks of a professional."
      },
      {
        question: "What attracts you to a role in ${user.industry}?",
        options: [
          "Passion for the domain, interest in solving real-world problems, growth opportunities",
          "Only the salary",
          "It was the only job available",
          "Friends work there"
        ],
        correctAnswer: "Passion for the domain, interest in solving real-world problems, growth opportunities",
        explanation: "Intrinsic motivation leads to better performance and job satisfaction."
      },
      {
        question: "How do you plan to grow professionally in the next 5 years?",
        options: [
          "Develop expertise in emerging technologies, take on leadership roles, contribute to industry",
          "Stay exactly where you are without growth",
          "Change jobs frequently without a career plan",
          "Avoid any responsibilities or learning"
        ],
        correctAnswer: "Develop expertise in emerging technologies, take on leadership roles, contribute to industry",
        explanation: "A clear career trajectory demonstrates ambition and professionalism."
      }
    ];
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
