"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  DollarSign,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  RefreshCw
} from "lucide-react";

export default function CareerRecommendations({ 
  recommendations = [], 
  stats = {},
  onToggleFavorite,
  onDelete,
  onRefresh,
  onViewDetails,
}) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'favorites') return rec.isFavorite;
    if (filter === 'bright-outlook') return rec.brightOutlook;
    if (filter === 'high-match') return rec.matchScore >= 70;
    return true;
  });

  // Sort recommendations
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Recommendations</CardDescription>
            <CardTitle className="text-3xl">{stats.total || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Match (&gt;70%)</CardDescription>
            <CardTitle className="text-3xl">{stats.highMatch || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bright Outlook</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {stats.brightOutlook || 0}
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Favorites</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {stats.favorites || 0}
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Your Career Matches</CardTitle>
              <CardDescription>
                Based on your skills, experience, and resume analysis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Careers</option>
                <option value="high-match">High Match (&gt;70%)</option>
                <option value="bright-outlook">Bright Outlook</option>
                <option value="favorites">Favorites</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="match">Sort by Match</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {sortedRecommendations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No career recommendations found. Try adjusting your filters or generate new recommendations.
            </CardContent>
          </Card>
        ) : (
          sortedRecommendations.map((rec) => (
            <CareerRecommendationCard
              key={rec.id}
              recommendation={rec}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDelete}
              onRefresh={onRefresh}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CareerRecommendationCard({ 
  recommendation, 
  onToggleFavorite,
  onDelete,
  onRefresh,
  onViewDetails,
}) {
  const [expanded, setExpanded] = useState(false);

  const matchColor = 
    recommendation.matchScore >= 80 ? "text-green-600" :
    recommendation.matchScore >= 60 ? "text-yellow-600" :
    "text-orange-600";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{recommendation.title}</CardTitle>
              {recommendation.brightOutlook && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Regulated/High Demand
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {recommendation.escoCode || 'ESCO Occupation'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(recommendation.id)}
            >
              <Star 
                className={`h-5 w-5 ${
                  recommendation.isFavorite 
                    ? 'fill-yellow-500 text-yellow-500' 
                    : 'text-gray-400'
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRefresh(recommendation.id)}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Match Score */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Skill Match</span>
            <span className={`text-2xl font-bold ${matchColor}`}>
              {recommendation.matchScore.toFixed(1)}%
            </span>
          </div>
          <Progress value={recommendation.matchScore} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {recommendation.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {recommendation.education && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Education</p>
                    <p className="text-sm font-medium">{recommendation.education}</p>
                  </div>
                </div>
              )}
              {recommendation.experience && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-medium">{recommendation.experience}</p>
                  </div>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onViewDetails(recommendation)}
            >
              View Full Details
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Matched Skills ({recommendation.matchedSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendation.matchedSkills?.slice(0, 10).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-orange-600" />
                Skills to Develop ({recommendation.requiredSkills?.length - recommendation.matchedSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {recommendation.requiredSkills
                  ?.filter(skill => !recommendation.matchedSkills?.includes(skill))
                  .slice(0, 10)
                  .map((skill, idx) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {recommendation.tasks?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Key Tasks</h4>
                <ul className="space-y-1 text-sm">
                  {recommendation.tasks.slice(0, 5).map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendation.technologies?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.technologies.slice(0, 10).map((tech, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            {recommendation.knowledge?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Knowledge Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.knowledge.slice(0, 8).map((know, idx) => (
                    <Badge key={idx} variant="outline">
                      {know}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {recommendation.abilities?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Required Abilities</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.abilities.slice(0, 8).map((ability, idx) => (
                    <Badge key={idx} variant="outline">
                      {ability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {recommendation.onTheJobTraining && (
              <div>
                <h4 className="text-sm font-semibold mb-2">On-the-Job Training</h4>
                <p className="text-sm text-muted-foreground">
                  {recommendation.onTheJobTraining}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDelete(recommendation.id)}
            className="ml-auto"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
