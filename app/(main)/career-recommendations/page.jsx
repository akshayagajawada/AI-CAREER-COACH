"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CareerRecommendations from "@/components/career-recommendations";
import { 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  Target
} from "lucide-react";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { 
  generateCareerRecommendations,
  getUserCareerRecommendations,
  toggleFavoriteRecommendation,
  deleteCareerRecommendation,
  refreshCareerRecommendation,
  getRecommendationStats
} from "@/actions/career-recommendation";

export default function CareerRecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch recommendations
  const {
    loading: loadingRecommendations,
    data: recommendationsData,
    fn: fetchRecommendations,
  } = useFetch(getUserCareerRecommendations);

  // Fetch stats
  const {
    loading: loadingStats,
    data: statsData,
    fn: fetchStats,
  } = useFetch(getRecommendationStats);

  useEffect(() => {
    fetchRecommendations();
    fetchStats();
  }, []);

  useEffect(() => {
    if (recommendationsData) {
      setRecommendations(recommendationsData);
    }
  }, [recommendationsData]);

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData]);

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCareerRecommendations();
      toast.success(`Generated ${result.count} career recommendations!`);
      await fetchRecommendations();
      await fetchStats();
    } catch (error) {
      toast.error(error.message || "Failed to generate recommendations");
      console.error("Error generating recommendations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavoriteRecommendation(id);
      // Update local state
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === id ? { ...rec, isFavorite: !rec.isFavorite } : rec
        )
      );
      await fetchStats();
      toast.success("Favorite status updated");
    } catch (error) {
      toast.error("Failed to update favorite status");
      console.error("Error toggling favorite:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCareerRecommendation(id);
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
      await fetchStats();
      toast.success("Recommendation removed");
    } catch (error) {
      toast.error("Failed to remove recommendation");
      console.error("Error deleting recommendation:", error);
    }
  };

  const handleRefresh = async (id) => {
    try {
      await refreshCareerRecommendation(id);
      await fetchRecommendations();
      toast.success("Recommendation refreshed");
    } catch (error) {
      toast.error("Failed to refresh recommendation");
      console.error("Error refreshing recommendation:", error);
    }
  };

  const handleViewDetails = (recommendation) => {
    // You can implement a modal or navigate to a detail page
    toast.info(`Viewing details for ${recommendation.title}`);
  };

  const isLoading = loadingRecommendations || loadingStats;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Career Recommendations
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover career paths matched to your skills using ESCO (European Skills, Competences, Qualifications and Occupations)
          </p>
        </div>
        <Button
          onClick={handleGenerateRecommendations}
          disabled={isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {recommendations.length > 0 ? 'Regenerate' : 'Generate'} Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Info Card */}
      {recommendations.length === 0 && !isLoading && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Get Started with Career Recommendations
            </CardTitle>
            <CardDescription className="text-base">
              Generate personalized career recommendations based on your profile:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>We analyze your skills, experience, and resume content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Match you with careers from the ESCO database (European standard)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Show you skill gaps and growth opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Highlight regulated professions and high-demand careers</span>
              </li>
            </ul>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Add more skills to your profile and complete your resume for better recommendations!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && recommendations.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading your career recommendations...</p>
          </div>
        </div>
      )}

      {/* Top Match Highlight */}
      {stats.topMatch && recommendations.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="h-5 w-5" />
              Top Career Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{stats.topMatch.title}</p>
                <p className="text-sm text-muted-foreground">
                  Your highest match based on current skills
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">
                  {stats.topMatch.matchScore.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Match Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations List */}
      {recommendations.length > 0 && (
        <CareerRecommendations
          recommendations={recommendations}
          stats={stats}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
