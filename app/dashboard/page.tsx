'use client';

import { useState, useEffect } from 'react';
import { NormalizedReview } from '@/lib/types';
import {
  getUniqueListings,
  getUniqueChannels,
  calculatePropertyStats,
  getRatingBadgeColor,
  formatDate,
  getRelativeTime,
} from '@/lib/utils';

export default function DashboardPage() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [selectedListing, setSelectedListing] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [minRating, setMinRating] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Approved reviews (stored in localStorage)
  const [approvedReviews, setApprovedReviews] = useState<Set<number>>(new Set());

  // Load approved reviews from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('approvedReviews');
    if (stored) {
      setApprovedReviews(new Set(JSON.parse(stored)));
    }
  }, []);

  // Fetch reviews from API
  useEffect(() => {
    fetchReviews();
  }, []);

  // Apply filters whenever dependencies change
  useEffect(() => {
    applyFilters();
  }, [reviews, selectedListing, selectedChannel, minRating, sortBy, sortOrder, searchQuery]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/hostaway');
      const result = await response.json();
      
      if (result.success) {
        setReviews(result.data);
        setFilteredReviews(result.data);
      } else {
        setError(result.error || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Filter by listing
    if (selectedListing !== 'all') {
      filtered = filtered.filter(r => r.listingId === selectedListing);
    }

    // Filter by channel
    if (selectedChannel !== 'all') {
      filtered = filtered.filter(r => r.channel === selectedChannel);
    }

    // Filter by minimum rating
    if (minRating) {
      filtered = filtered.filter(r => r.rating >= parseFloat(minRating));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.review.toLowerCase().includes(query) ||
        r.guestName.toLowerCase().includes(query) ||
        r.listingName.toLowerCase().includes(query)
      );
    }

    // Sort
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

    setFilteredReviews(filtered);
  };

  const toggleApproval = (reviewId: number) => {
    const newApproved = new Set(approvedReviews);
    
    if (newApproved.has(reviewId)) {
      newApproved.delete(reviewId);
    } else {
      newApproved.add(reviewId);
    }
    
    setApprovedReviews(newApproved);
    localStorage.setItem('approvedReviews', JSON.stringify(Array.from(newApproved)));
  };

  const clearFilters = () => {
    setSelectedListing('all');
    setSelectedChannel('all');
    setMinRating('');
    setSearchQuery('');
    setSortBy('date');
    setSortOrder('desc');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error Loading Reviews</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const listings = getUniqueListings(reviews);
  const channels = getUniqueChannels(reviews);
  const stats = selectedListing !== 'all' 
    ? calculatePropertyStats(reviews, selectedListing)
    : null;

  const overallAvg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reviews Dashboard</h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage and analyze property reviews</p>
            </div>
            <a 
              href="/" 
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Reviews</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{reviews.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Average Rating</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{overallAvg.toFixed(1)}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Properties</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{listings.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Approved</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{approvedReviews.size}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <select
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Properties</option>
                {listings.map(listing => (
                  <option key={listing.listingId} value={listing.listingId}>
                    {listing.listingName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Channels</option>
                {channels.map(channel => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="e.g., 7.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                  <option value="listing">Property</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Reviews
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest name, review text, or property..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Property Stats (if single property selected) */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{stats.listingName} - Performance</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-500">Cleanliness</div>
                <div className="text-2xl font-bold text-gray-900">{stats.categoryAverages.cleanliness.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Communication</div>
                <div className="text-2xl font-bold text-gray-900">{stats.categoryAverages.communication.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="text-2xl font-bold text-gray-900">{stats.categoryAverages.location.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Value</div>
                <div className="text-2xl font-bold text-gray-900">{stats.categoryAverages.value.toFixed(1)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-600 font-medium">Excellent (9-10)</div>
                <div className="text-lg font-bold text-green-900">{stats.ratingDistribution.excellent}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-medium">Good (7-8.9)</div>
                <div className="text-lg font-bold text-blue-900">{stats.ratingDistribution.good}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-xs text-yellow-600 font-medium">Average (5-6.9)</div>
                <div className="text-lg font-bold text-yellow-900">{stats.ratingDistribution.average}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-xs text-red-600 font-medium">Poor (&lt;5)</div>
                <div className="text-lg font-bold text-red-900">{stats.ratingDistribution.poor}</div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Reviews ({filteredReviews.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredReviews.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No reviews match your filters
              </div>
            ) : (
              filteredReviews.map(review => (
                <div key={review.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${getRatingBadgeColor(review.rating)}`}>
                          {review.rating.toFixed(1)}
                        </span>
                        <span className="font-semibold text-gray-900">{review.guestName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{getRelativeTime(review.date)}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{review.listingName}</span>
                        <span className="text-gray-400 mx-2">via</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{review.channel}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{review.review}</p>
                      
                      {Object.keys(review.categories).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(review.categories).map(([category, rating]) => (
                            rating !== undefined && (
                              <span key={category} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {category.charAt(0).toUpperCase() + category.slice(1)}: {rating.toFixed(1)}
                              </span>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => toggleApproval(review.id)}
                      className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                        approvedReviews.has(review.id)
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {approvedReviews.has(review.id) ? '✓ Approved' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}