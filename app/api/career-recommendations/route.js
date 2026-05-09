import { NextResponse } from "next/server";
import { 
  generateCareerRecommendations, 
  getUserCareerRecommendations,
  getCareerRecommendationById,
  toggleFavoriteRecommendation,
  deleteCareerRecommendation,
  getRecommendationStats,
  refreshCareerRecommendation,
  getRelatedCareerRecommendations
} from "@/actions/career-recommendation";

/**
 * GET /api/career-recommendations
 * Fetch career recommendations with optional filters
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const onetCode = searchParams.get('onetCode');

    // Handle different GET actions
    switch (action) {
      case 'stats':
        const stats = await getRecommendationStats();
        return NextResponse.json(stats);

      case 'detail':
        if (!id) {
          return NextResponse.json(
            { error: "Recommendation ID is required" },
            { status: 400 }
          );
        }
        const recommendation = await getCareerRecommendationById(id);
        return NextResponse.json(recommendation);

      case 'related':
        if (!onetCode) {
          return NextResponse.json(
            { error: "ESCO URI is required" },
            { status: 400 }
          );
        }
        const related = await getRelatedCareerRecommendations(onetCode);
        return NextResponse.json(related);

      default:
        // Get all recommendations with filters
        const minMatchScore = parseFloat(searchParams.get('minMatchScore')) || 0;
        const brightOutlookOnly = searchParams.get('brightOutlookOnly') === 'true';
        const limit = parseInt(searchParams.get('limit')) || 50;

        const recommendations = await getUserCareerRecommendations({
          minMatchScore,
          brightOutlookOnly,
          limit,
        });

        return NextResponse.json(recommendations);
    }
  } catch (error) {
    console.error("Error fetching career recommendations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch career recommendations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/career-recommendations
 * Generate new career recommendations or perform actions
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, onetCode } = body;

    switch (action) {
      case 'generate':
        const result = await generateCareerRecommendations();
        return NextResponse.json(result);

      case 'toggle-favorite':
        if (!id) {
          return NextResponse.json(
            { error: "Recommendation ID is required" },
            { status: 400 }
          );
        }
        const updated = await toggleFavoriteRecommendation(id);
        return NextResponse.json(updated);

      case 'refresh':
        if (!id) {
          return NextResponse.json(
            { error: "Recommendation ID is required" },
            { status: 400 }
          );
        }
        const refreshed = await refreshCareerRecommendation(id);
        return NextResponse.json(refreshed);

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing career recommendation request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/career-recommendations
 * Delete a career recommendation
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Recommendation ID is required" },
        { status: 400 }
      );
    }

    await deleteCareerRecommendation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting career recommendation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete recommendation" },
      { status: 500 }
    );
  }
}
