# Flex Living Reviews Dashboard - Documentation

## Developer Assessment Submission

**Candidate:** Youssef Kounniba  
**Date:** November 2025  
**GitHub:** [YoussefKounniba](https://github.com/YoussefKounniba)

---

## 1. Project Overview

This project is a comprehensive Reviews Management Dashboard for Flex Living, built to help property managers analyze, approve, and display guest reviews from multiple booking channels.

### Key Features Implemented

✅ Hostaway API integration (with mock data fallback)  
✅ Review normalization and data processing  
✅ Manager dashboard with advanced filtering  
✅ Property performance analytics  
✅ Public property pages with approved reviews  
✅ Multi-channel review support (Airbnb, Booking.com, Vrbo)  
✅ Review approval system with localStorage persistence

---

## 2. Tech Stack

### Frontend

- **Next.js 14** (App Router) - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Hostaway API** - Review data source (with mock fallback)

### State Management

- **React Hooks** (useState, useEffect) - Component state
- **LocalStorage** - Persistent approval data

### Development Tools

- **ESLint** - Code quality
- **PostCSS** - CSS processing

---

## 3. Architecture & Design Decisions

### API Route Design (`/api/reviews/hostaway`)

**Decision:** Create a single, well-structured API endpoint that handles all review operations

**Rationale:**

- Centralized data normalization logic
- Easy to test and maintain
- Supports filtering via query parameters
- Returns structured JSON with metadata

**Key Features:**

```typescript
GET /api/reviews/hostaway
Query Parameters:
  - listingId: Filter by property
  - channel: Filter by booking channel
  - minRating/maxRating: Rating range filter
  - startDate/endDate: Date range filter
  - sortBy: Sort field (date|rating|listing)
  - sortOrder: Sort direction (asc|desc)

Response Format:
{
  success: boolean,
  data: NormalizedReview[],
  stats: { total, averageRating, byChannel, byListing },
  filters: applied filters,
  timestamp: ISO datetime
}
```

### Data Normalization Strategy

**Challenge:** Hostaway API returns reviews with inconsistent structure

**Solution:** Created a normalization layer that:

1. Standardizes date formats (ISO 8601)
2. Calculates overall ratings from category ratings
3. Extracts listing IDs from names
4. Maps category ratings to consistent object structure
5. Adds computed fields (timestamp, isApproved)

**Example Transformation:**

```typescript
// Raw Hostaway Review
{
  id: 7453,
  reviewCategory: [
    { category: "cleanliness", rating: 10 },
    { category: "communication", rating: 9 }
  ],
  submittedAt: "2024-11-10 14:30:22"
}

// Normalized Review
{
  id: 7453,
  categories: {
    cleanliness: 10,
    communication: 9
  },
  date: "2024-11-10",
  timestamp: 1699627822000,
  isApproved: false
}
```

### Manager Dashboard Design

**Design Philosophy:** Clean, data-dense interface for power users

**Key Decisions:**

1. **Filter Panel:** All filters visible above-the-fold for quick access
2. **Stats Overview:** 4 key metrics prominently displayed
3. **Property-Specific Analytics:** Conditional display when single property selected
4. **Inline Approval:** One-click approval directly in the review list
5. **Visual Feedback:** Color-coded ratings and badges

**UX Considerations:**

- Real-time filtering (no page reload)
- Clear visual hierarchy
- Responsive design (works on tablets)
- Persistent state (localStorage)

### Public Property Page Design

**Inspiration:** Airbnb and Booking.com property pages

**Design Elements:**

1. **Hero Section:** Full-width header with gradient background
2. **Property Details:** Two-column layout (content + booking card)
3. **Review Display:** Grid layout with rating breakdowns
4. **Social Proof:** Star ratings and review counts prominently displayed

**Only Approved Reviews:**

- Reviews must be explicitly approved by managers
- Approval state stored in localStorage
- Seamless sync between dashboard and public page

---

## 4. API Integration Details

### Hostaway API Implementation

**Credentials Used:**

```
Account ID: 61148
API Key: f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
Endpoint: https://api.hostaway.com/v1/reviews
```

**Integration Strategy:**

1. Attempt to fetch from real Hostaway API
2. If API returns no data or errors → fallback to mock data
3. Log API behavior for debugging

**Why Mock Data?**

- Hostaway sandbox is empty (as noted in assessment)
- Ensures functional demo even with API issues
- Allows thorough testing of all features

### Mock Data Design

Created 10 realistic reviews across 3 properties:

- Mix of high and low ratings (6.5 to 10)
- Different booking channels (Airbnb, Booking.com, Vrbo)
- Varied review dates (recent to 2 weeks old)
- Detailed category ratings
- Authentic review text

---

## 5. Google Reviews Integration Research

### Investigation Summary

**Question:** Can Google Reviews be integrated into this dashboard?

**Answer:** Yes, but with limitations

### Technical Approach

**Option 1: Google Places API**

- **Method:** Use Places API to fetch reviews
- **Endpoint:** `https://maps.googleapis.com/maps/api/place/details/json`
- **Requirements:**
  - Google Cloud Platform account
  - Places API enabled
  - API key with Places API permission
  - Know the Place ID of each property

**Example Implementation:**

```typescript
async function fetchGoogleReviews(placeId: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating&key=${API_KEY}`
  );
  const data = await response.json();
  return data.result.reviews;
}
```

**Option 2: Google My Business API**

- More comprehensive but requires business verification
- Better for businesses managing multiple locations
- Requires OAuth 2.0 authentication

### Limitations & Considerations

1. **API Costs:**

   - Places API: $0.017 per request (after free tier)
   - 100,000 requests = $1,700/month

2. **Rate Limits:**

   - 1,000 requests per day (free tier)
   - Need to implement caching

3. **Data Restrictions:**

   - Limited to 5 most recent/relevant reviews
   - Cannot filter by date range
   - No access to review IDs for tracking

4. **Business Verification:**
   - Property must be claimed on Google Business Profile
   - Verification can take days or weeks

### Recommended Implementation

If implementing Google Reviews:

1. **Cache Review Data:**

   ```typescript
   // Cache for 24 hours to minimize API costs
   const cachedReviews = await redis.get(`google-reviews-${placeId}`);
   if (cachedReviews) return cachedReviews;
   ```

2. **Scheduled Background Sync:**

   - Fetch Google Reviews once per day via cron job
   - Store in database
   - Serve from database to users

3. **Normalize Data:**
   ```typescript
   function normalizeGoogleReview(review: GoogleReview): NormalizedReview {
     return {
       id: generateId(review.author_name, review.time),
       rating: review.rating,
       review: review.text,
       guestName: review.author_name,
       date: new Date(review.time * 1000).toISOString(),
       channel: "Google",
       // ... other fields
     };
   }
   ```

### Conclusion

Google Reviews integration is **feasible but not recommended** for this MVP due to:

- Additional API costs
- Complex business verification process
- Limited review data
- Better focus on Hostaway + direct booking platform reviews

---

## 6. Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development

```bash
# Clone repository
git clone <your-repo-url>
cd flexliving-reviews-dashboard

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

### Project Structure

```
flexliving-reviews-dashboard/
├── app/
│   ├── api/
│   │   └── reviews/
│   │       └── hostaway/
│   │           └── route.ts          # Main API endpoint ⭐
│   ├── dashboard/
│   │   └── page.tsx                  # Manager dashboard ⭐
│   ├── property/
│   │   └── [id]/
│   │       └── page.tsx              # Public property page ⭐
│   ├── layout.tsx
│   └── page.tsx                      # Home page
├── lib/
│   ├── mockData.ts                   # Mock review data
│   ├── types.ts                      # TypeScript interfaces
│   └── utils.ts                      # Helper functions
├── public/
├── DOCUMENTATION.md                  # This file
├── README.md
└── package.json
```

---

## 7. Usage Guide

### For Managers

1. **Access Dashboard:** Navigate to `/dashboard`
2. **View All Reviews:** See complete list of reviews across all properties
3. **Filter Reviews:**
   - Select specific property
   - Choose booking channel
   - Set minimum rating threshold
   - Search by keywords
4. **Analyze Performance:**
   - Check average ratings per category
   - View rating distribution
   - Compare channel performance
5. **Approve Reviews:**
   - Click "Approve" button on any review
   - Approved reviews appear on public property pages
   - Approvals persist across sessions

### For Guests (Public Pages)

1. **Browse Properties:** View all properties on home page
2. **View Property Details:** Click any property to see details
3. **Read Reviews:** Scroll to reviews section
4. **See Ratings:** View overall rating and category breakdowns

---

## 8. Testing the API Route

The assessment specifically mentions testing the `/api/reviews/hostaway` route.

### Test Commands

```bash
# Fetch all reviews
curl http://localhost:3000/api/reviews/hostaway

# Filter by property
curl "http://localhost:3000/api/reviews/hostaway?listingId=SH-29-2B"

# Filter by rating
curl "http://localhost:3000/api/reviews/hostaway?minRating=8.0"

# Filter by channel
curl "http://localhost:3000/api/reviews/hostaway?channel=Airbnb"

# Combined filters with sorting
curl "http://localhost:3000/api/reviews/hostaway?minRating=7&sortBy=rating&sortOrder=desc"
```

### Expected Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 7453,
      "listingId": "SH-29-2B",
      "listingName": "2B N1 A - 29 Shoreditch Heights",
      "guestName": "Sarah Mitchell",
      "rating": 9.5,
      "review": "Absolutely wonderful stay!...",
      "categories": {
        "cleanliness": 10,
        "communication": 10,
        "location": 9,
        "value": 9
      },
      "channel": "Airbnb",
      "date": "2024-11-10",
      "timestamp": 1699627822000,
      "status": "published",
      "isApproved": false
    }
  ],
  "stats": {
    "total": 10,
    "averageRating": 8.48,
    "byChannel": { "Airbnb": 5, "Booking.com": 4, "Vrbo": 1 },
    "byListing": { "2B N1 A - 29 Shoreditch Heights": 4, ... }
  },
  "filters": { ... },
  "timestamp": "2024-11-15T10:30:00.000Z"
}
```

---

## 9. Future Enhancements

If given more time, I would implement:

1. **Database Integration:**

   - PostgreSQL or MongoDB for persistent storage
   - Proper user authentication
   - Review editing history

2. **Advanced Analytics:**

   - Trend charts using Chart.js or Recharts
   - Sentiment analysis on review text
   - Predictive analytics for property performance

3. **Automated Insights:**

   - AI-powered review summaries
   - Anomaly detection (sudden rating drops)
   - Competitive benchmarking

4. **Email Notifications:**

   - Alert managers about low ratings
   - Weekly performance reports
   - New review notifications

5. **Mobile App:**

   - React Native version for on-the-go management
   - Push notifications
   - Offline support

6. **Multi-language Support:**
   - i18n for international properties
   - Auto-translation of reviews

---

## 10. Development Notes

### Challenges Faced

1. **Hostaway API Sandbox:** Empty responses required robust fallback strategy
2. **Data Normalization:** Handled inconsistent category naming and missing fields
3. **State Persistence:** Used localStorage as quick solution (would use DB in production)
4. **Responsive Design:** Ensured dashboard works on various screen sizes

### Key Learnings

- Importance of data normalization in multi-source integrations
- Value of mock data for uninterrupted development
- Balance between feature richness and code simplicity
- Need for clear visual hierarchy in data-heavy interfaces

---

## 11. Contact

**Youssef Kounniba**  
📧 youssef.kounniba@aiac.ma  
📱 0691817675  
💼 [LinkedIn](https://linkedin.com/in/youssef-kounniba)  
💻 [GitHub](https://github.com/YoussefKounniba)

---

**Thank you for reviewing this assessment!** 🚀
