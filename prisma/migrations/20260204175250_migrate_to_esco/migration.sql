-- CreateTable
CREATE TABLE "CareerGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerMilestone" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "dueDate" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerRecommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "escoUri" TEXT NOT NULL,
    "escoCode" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchedSkills" TEXT[],
    "requiredSkills" TEXT[],
    "brightOutlook" BOOLEAN NOT NULL DEFAULT false,
    "education" TEXT,
    "experience" TEXT,
    "onTheJobTraining" TEXT,
    "medianWage" DOUBLE PRECISION,
    "growthRate" DOUBLE PRECISION,
    "tasks" TEXT[],
    "technologies" TEXT[],
    "knowledge" TEXT[],
    "abilities" TEXT[],
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isViewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareerGoal_userId_idx" ON "CareerGoal"("userId");

-- CreateIndex
CREATE INDEX "CareerMilestone_goalId_idx" ON "CareerMilestone"("goalId");

-- CreateIndex
CREATE INDEX "CareerRecommendation_userId_idx" ON "CareerRecommendation"("userId");

-- CreateIndex
CREATE INDEX "CareerRecommendation_escoUri_idx" ON "CareerRecommendation"("escoUri");

-- CreateIndex
CREATE UNIQUE INDEX "CareerRecommendation_userId_escoUri_key" ON "CareerRecommendation"("userId", "escoUri");

-- AddForeignKey
ALTER TABLE "CareerGoal" ADD CONSTRAINT "CareerGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerMilestone" ADD CONSTRAINT "CareerMilestone_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "CareerGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerRecommendation" ADD CONSTRAINT "CareerRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
