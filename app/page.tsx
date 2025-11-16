'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, Users, Award, MapPin } from 'lucide-react';
import { getUniqueListings } from '@/lib/utils';
import { NormalizedReview } from '@/lib/types';

export default function HomePage() {
  const [properties, setProperties] = useState<Array<{ listingId: string; listingName: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/reviews/hostaway');
      const result = await response.json();
      
      if (result.success) {
        const listings = getUniqueListings(result.data);
        setProperties(listings);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Flex Living Reviews Dashboard
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Manage and showcase your property reviews with powerful analytics and insights
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="bg-white text-blue-600 px-7 py-3.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                Manager Dashboard
              </Link>
              <a
                href="#properties"
                className="bg-blue-700 text-white px-7 py-3.5 rounded-lg font-semibold hover:bg-blue-800 transition-colors border border-blue-500"
              >
                View Properties
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Powerful Features for Property Managers
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Everything you need to manage reviews, analyze performance, and showcase your properties
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Review Management</h3>
            <p className="text-gray-600 text-sm text-center">
              Approve and manage reviews from multiple channels in one place
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Analytics & Insights</h3>
            <p className="text-gray-600 text-sm text-center">
              Track performance metrics and identify trends across properties
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Multi-Channel</h3>
            <p className="text-gray-600 text-sm text-center">
              Integrate reviews from Airbnb, Booking.com, Vrbo, and more
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Public Display</h3>
            <p className="text-gray-600 text-sm text-center">
              Showcase approved reviews on beautiful property pages
            </p>
          </div>
        </div>
      </div>

      {/* Properties Section */}
      <div id="properties" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Our Properties
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Explore our handpicked selection of premium properties across London
          </p>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No properties available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map(property => (
                <Link
                  key={property.listingId}
                  href={`/property/${property.listingId}`}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {property.listingName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      London, UK
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">£120</span>
                      <span className="text-gray-500 text-sm">/ night</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to manage your reviews?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Access the dashboard to start analyzing and approving reviews
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 px-7 py-3.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 Flex Living. Developer Assessment by Youssef Kounniba</p>
          <p className="text-gray-500 text-sm mt-2">Built with Next.js, TypeScript, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}