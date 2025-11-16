'use client';

import { useState, useEffect } from 'react';
import { NormalizedReview } from '@/lib/types';
import { getRatingBadgeColor, formatDate, calculatePropertyStats } from '@/lib/utils';
import { Star, MapPin, Users, Wifi, Bed, Bath } from 'lucide-react';

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const [propertyId, setPropertyId] = useState<string>('');
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);

  // Unwrap params Promise
  useEffect(() => {
    params.then(resolvedParams => {
      setPropertyId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyAndReviews();
    }
  }, [propertyId]);

  const fetchPropertyAndReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch all reviews
      const response = await fetch('/api/reviews/hostaway');
      const result = await response.json();
      
      if (result.success) {
        // Filter reviews for this property
        const propertyReviews = result.data.filter(
          (r: NormalizedReview) => r.listingId === propertyId
        );
        setReviews(propertyReviews);

        // Get approved reviews from localStorage
        const storedApproved = localStorage.getItem('approvedReviews');
        const approvedIds = storedApproved ? new Set(JSON.parse(storedApproved)) : new Set();
        
        const approved = propertyReviews.filter((r: NormalizedReview) => 
          approvedIds.has(r.id)
        );
        setApprovedReviews(approved);

        // Set property info from first review
        if (propertyReviews.length > 0) {
          setProperty({
            id: propertyId,
            name: propertyReviews[0].listingName,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching property reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const stats = propertyId ? calculatePropertyStats(reviews, propertyId) : null;
  const avgRating = stats?.averageRating || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              Flex Living
            </a>
            <a 
              href="/dashboard" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              Manager Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-72 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{property.name}</h1>
            <div className="flex items-center gap-3 text-sm md:text-base flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span>{reviews.length} reviews</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" />
                <span>London, UK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
            <p className="text-gray-700 mb-6">
              Experience modern living in the heart of London. This beautifully designed apartment 
              offers contemporary amenities and stylish decor, perfect for both short and extended stays. 
              Enjoy easy access to local attractions, restaurants, and public transportation.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Bed className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-500">Bedrooms</div>
                  <div className="font-semibold text-gray-900">2</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Bath className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-500">Bathrooms</div>
                  <div className="font-semibold text-gray-900">1</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Users className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-500">Guests</div>
                  <div className="font-semibold text-gray-900">4</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Wifi className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-500">WiFi</div>
                  <div className="font-semibold text-gray-900">Free</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {['WiFi', 'Kitchen', 'Washing machine', 'Free parking', 'Air conditioning', 'TV', 'Workspace', 'Coffee maker'].map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 sticky top-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                £120 <span className="text-lg text-gray-500 font-normal">/ night</span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500">({reviews.length} reviews)</span>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3">
                Check Availability
              </button>
              <p className="text-sm text-gray-500 text-center">You won't be charged yet</p>

              {stats && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Rating Breakdown</h4>
                  {Object.entries(stats.categoryAverages).map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 capitalize">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600"
                            style={{ width: `${(rating / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8">{rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guest Reviews Section */}
        <div className="border-t pt-12">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            <h2 className="text-3xl font-bold text-gray-900">
              {avgRating.toFixed(1)} · {approvedReviews.length} {approvedReviews.length === 1 ? 'review' : 'reviews'}
            </h2>
          </div>

          {approvedReviews.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No reviews yet for this property</p>
              <p className="text-gray-500 mt-2">Be the first to leave a review!</p>
            </div>
          ) : (
            <>
              {/* Rating Categories Grid */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  {Object.entries(stats.categoryAverages).map(([category, rating]) => (
                    <div key={category}>
                      <div className="text-sm text-gray-600 capitalize mb-1">{category}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-900"
                            style={{ width: `${(rating / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {approvedReviews.map(review => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{review.guestName}</div>
                        <div className="text-sm text-gray-500">{formatDate(review.date)}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${getRatingBadgeColor(review.rating)}`}>
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.review}</p>
                    
                    {review.channel && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-xs text-gray-500">
                          Review from <span className="font-medium">{review.channel}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 Flex Living. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}