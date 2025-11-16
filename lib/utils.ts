// lib/utils.ts
import { NormalizedReview, PropertyStats } from './types';

/**
 * Calculate comprehensive statistics for a property
 */
export function calculatePropertyStats(
  reviews: NormalizedReview[],
  listingId: string
): PropertyStats | null {
  const propertyReviews = reviews.filter(r => r.listingId === listingId);
  
  if (propertyReviews.length === 0) return null;

  const listingName = propertyReviews[0].listingName;

  // Calculate average rating
  const totalRating = propertyReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / propertyReviews.length;

  // Calculate category averages
  const categoryTotals = {
    cleanliness: 0,
    communication: 0,
    location: 0,
    value: 0,
  };
  const categoryCounts = {
    cleanliness: 0,
    communication: 0,
    location: 0,
    value: 0,
  };

  propertyReviews.forEach(review => {
    Object.entries(review.categories).forEach(([category, rating]) => {
      if (category in categoryTotals && rating !== undefined) {
        categoryTotals[category as keyof typeof categoryTotals] += rating;
        categoryCounts[category as keyof typeof categoryCounts]++;
      }
    });
  });

  const categoryAverages = {
    cleanliness: categoryCounts.cleanliness > 0 
      ? categoryTotals.cleanliness / categoryCounts.cleanliness : 0,
    communication: categoryCounts.communication > 0 
      ? categoryTotals.communication / categoryCounts.communication : 0,
    location: categoryCounts.location > 0 
      ? categoryTotals.location / categoryCounts.location : 0,
    value: categoryCounts.value > 0 
      ? categoryTotals.value / categoryCounts.value : 0,
  };

  // Channel breakdown
  const channelMap = new Map<string, number>();
  propertyReviews.forEach(review => {
    channelMap.set(review.channel, (channelMap.get(review.channel) || 0) + 1);
  });
  
  const channelBreakdown = Array.from(channelMap.entries()).map(([channel, count]) => ({
    channel,
    count,
  }));

  // Rating distribution
  const ratingDistribution = {
    excellent: propertyReviews.filter(r => r.rating >= 9).length,
    good: propertyReviews.filter(r => r.rating >= 7 && r.rating < 9).length,
    average: propertyReviews.filter(r => r.rating >= 5 && r.rating < 7).length,
    poor: propertyReviews.filter(r => r.rating < 5).length,
  };

  return {
    listingId,
    listingName,
    averageRating,
    totalReviews: propertyReviews.length,
    categoryAverages,
    channelBreakdown,
    ratingDistribution,
  };
}

/**
 * Get unique listings from reviews
 */
export function getUniqueListings(reviews: NormalizedReview[]): Array<{
  listingId: string;
  listingName: string;
}> {
  const listingMap = new Map<string, string>();
  
  reviews.forEach(review => {
    if (!listingMap.has(review.listingId)) {
      listingMap.set(review.listingId, review.listingName);
    }
  });

  return Array.from(listingMap.entries()).map(([listingId, listingName]) => ({
    listingId,
    listingName,
  }));
}

/**
 * Get unique channels from reviews
 */
export function getUniqueChannels(reviews: NormalizedReview[]): string[] {
  const channels = new Set<string>();
  reviews.forEach(review => channels.add(review.channel));
  return Array.from(channels).sort();
}

/**
 * Format rating with color coding
 */
export function getRatingColor(rating: number): string {
  if (rating >= 9) return 'text-green-600';
  if (rating >= 7) return 'text-blue-600';
  if (rating >= 5) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Format rating badge color
 */
export function getRatingBadgeColor(rating: number): string {
  if (rating >= 9) return 'bg-green-100 text-green-800';
  if (rating >= 7) return 'bg-blue-100 text-blue-800';
  if (rating >= 5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Calculate trend (comparing recent vs older reviews)
 */
export function calculateTrend(reviews: NormalizedReview[]): {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
} {
  if (reviews.length < 2) {
    return { direction: 'stable', percentage: 0 };
  }

  const sortedReviews = [...reviews].sort((a, b) => b.timestamp - a.timestamp);
  const midpoint = Math.floor(sortedReviews.length / 2);
  
  const recentReviews = sortedReviews.slice(0, midpoint);
  const olderReviews = sortedReviews.slice(midpoint);

  const recentAvg = recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length;
  const olderAvg = olderReviews.reduce((sum, r) => sum + r.rating, 0) / olderReviews.length;

  const difference = recentAvg - olderAvg;
  const percentage = Math.abs((difference / olderAvg) * 100);

  if (Math.abs(difference) < 0.5) {
    return { direction: 'stable', percentage: 0 };
  }

  return {
    direction: difference > 0 ? 'up' : 'down',
    percentage: Math.round(percentage * 10) / 10,
  };
}