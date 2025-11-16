// lib/types.ts

export interface ReviewCategory {
  category: string;
  rating: number;
}

export interface HostawayReview {
  id: number;
  type: string;
  status: string;
  rating: number | null;
  publicReview: string;
  reviewCategory: ReviewCategory[];
  submittedAt: string;
  guestName: string;
  listingName: string;
  listingId?: string;
  channel?: string;
}

export interface NormalizedReview {
  id: number;
  listingId: string;
  listingName: string;
  guestName: string;
  rating: number;
  review: string;
  categories: {
    cleanliness?: number;
    communication?: number;
    location?: number;
    value?: number;
    respect_house_rules?: number;
  };
  channel: string;
  date: string;
  timestamp: number;
  status: string;
  isApproved: boolean; // For manager to select for public display
}

export interface PropertyStats {
  listingId: string;
  listingName: string;
  averageRating: number;
  totalReviews: number;
  categoryAverages: {
    cleanliness: number;
    communication: number;
    location: number;
    value: number;
  };
  channelBreakdown: {
    channel: string;
    count: number;
  }[];
  ratingDistribution: {
    excellent: number; // 9-10
    good: number; // 7-8.9
    average: number; // 5-6.9
    poor: number; // <5
  };
}

export interface FilterOptions {
  listingId?: string;
  channel?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'rating' | 'listing';
  sortOrder?: 'asc' | 'desc';
}