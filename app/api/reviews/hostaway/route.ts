// app/api/reviews/hostaway/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockHostawayReviews } from '@/lib/mockData';
import { HostawayReview, NormalizedReview } from '@/lib/types';

// Hostaway API credentials (from assessment)
const HOSTAWAY_API_KEY = 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152';
const HOSTAWAY_ACCOUNT_ID = '61148';
const HOSTAWAY_API_URL = 'https://api.hostaway.com/v1/reviews';

/**
 * Normalizes a Hostaway review into our standard format
 */
function normalizeReview(review: HostawayReview): NormalizedReview {
  // Extract category ratings into an object
  const categories: NormalizedReview['categories'] = {};
  review.reviewCategory?.forEach(cat => {
    const categoryName = cat.category.toLowerCase().replace(/_/g, '');
    categories[categoryName as keyof NormalizedReview['categories']] = cat.rating;
  });

  // Calculate overall rating if not provided
  let overallRating = review.rating;
  if (!overallRating && review.reviewCategory?.length > 0) {
    const sum = review.reviewCategory.reduce((acc, cat) => acc + cat.rating, 0);
    overallRating = sum / review.reviewCategory.length;
  }

  // Parse date and create timestamp
  const dateObj = new Date(review.submittedAt);
  const timestamp = dateObj.getTime();

  // Extract listing ID from listing name or use provided one
  const listingId = review.listingId || 
    review.listingName.split(' - ')[0].replace(/\s+/g, '-') || 
    `listing-${review.id}`;

  return {
    id: review.id,
    listingId,
    listingName: review.listingName,
    guestName: review.guestName,
    rating: overallRating || 0,
    review: review.publicReview,
    categories,
    channel: review.channel || 'Unknown',
    date: dateObj.toISOString().split('T')[0],
    timestamp,
    status: review.status,
    isApproved: false, // Default to not approved
  };
}

/**
 * Fetches reviews from Hostaway API (or mock data)
 */
async function fetchHostawayReviews(): Promise<HostawayReview[]> {
  try {
    // Try to fetch from real API
    const response = await fetch(HOSTAWAY_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HOSTAWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      // If API returns no reviews, use mock data
      if (!data.result || data.result.length === 0) {
        console.log('Hostaway API returned no reviews, using mock data');
        return mockHostawayReviews.result;
      }
      
      return data.result;
    }
  } catch (error) {
    console.error('Failed to fetch from Hostaway API:', error);
  }

  // Fallback to mock data
  console.log('Using mock review data');
  return mockHostawayReviews.result;
}

/**
 * Applies filters to normalized reviews
 */
function applyFilters(
  reviews: NormalizedReview[],
  filters: {
    listingId?: string;
    channel?: string;
    minRating?: number;
    maxRating?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }
): NormalizedReview[] {
  let filtered = [...reviews];

  // Filter by listing
  if (filters.listingId) {
    filtered = filtered.filter(r => r.listingId === filters.listingId);
  }

  // Filter by channel
  if (filters.channel) {
    filtered = filtered.filter(r => r.channel === filters.channel);
  }

  // Filter by rating range
  if (filters.minRating !== undefined) {
    filtered = filtered.filter(r => r.rating >= filters.minRating!);
  }
  if (filters.maxRating !== undefined) {
    filtered = filtered.filter(r => r.rating <= filters.maxRating!);
  }

  // Filter by date range
  if (filters.startDate) {
    const startTime = new Date(filters.startDate).getTime();
    filtered = filtered.filter(r => r.timestamp >= startTime);
  }
  if (filters.endDate) {
    const endTime = new Date(filters.endDate).getTime();
    filtered = filtered.filter(r => r.timestamp <= endTime);
  }

  // Sort results
  const sortBy = filters.sortBy || 'date';
  const sortOrder = filters.sortOrder || 'desc';
  
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'listing':
        comparison = a.listingName.localeCompare(b.listingName);
        break;
      case 'date':
      default:
        comparison = a.timestamp - b.timestamp;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return filtered;
}

/**
 * GET /api/reviews/hostaway
 * Fetches and normalizes Hostaway reviews
 * Supports filtering via query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filter parameters
    const filters = {
      listingId: searchParams.get('listingId') || undefined,
      channel: searchParams.get('channel') || undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      maxRating: searchParams.get('maxRating') ? parseFloat(searchParams.get('maxRating')!) : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'date',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // Fetch raw reviews from Hostaway
    const rawReviews = await fetchHostawayReviews();

    // Normalize all reviews
    const normalizedReviews = rawReviews.map(normalizeReview);

    // Apply filters
    const filteredReviews = applyFilters(normalizedReviews, filters);

    // Calculate summary statistics
    const stats = {
      total: filteredReviews.length,
      averageRating: filteredReviews.length > 0
        ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length
        : 0,
      byChannel: filteredReviews.reduce((acc, r) => {
        acc[r.channel] = (acc[r.channel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byListing: filteredReviews.reduce((acc, r) => {
        acc[r.listingName] = (acc[r.listingName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      data: filteredReviews,
      stats,
      filters: filters,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in /api/reviews/hostaway:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch and normalize reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}