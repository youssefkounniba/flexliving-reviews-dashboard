# Flex Living Reviews Dashboard

A comprehensive reviews management system for property managers to analyze, approve, and display guest reviews from multiple booking channels.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

## 🎯 Features

- ✅ **Hostaway Integration** - Fetch and normalize reviews from Hostaway API
- 📊 **Analytics Dashboard** - Comprehensive property performance metrics
- 🔍 **Advanced Filtering** - Filter by property, channel, rating, date, and keywords
- ✓ **Review Approval System** - Select which reviews to display publicly
- 🏠 **Public Property Pages** - Beautiful property pages with approved reviews
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Clean, intuitive interface built with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd flexliving-reviews-dashboard

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
flexliving-reviews-dashboard/
├── app/
│   ├── api/
│   │   └── reviews/
│   │       └── hostaway/
│   │           └── route.ts          # Main API endpoint ⭐
│   ├── dashboard/
│   │   └── page.tsx                  # Manager dashboard
│   ├── property/
│   │   └── [id]/
│   │       └── page.tsx              # Public property page
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx                      # Home page
├── lib/
│   ├── mockData.ts                   # Mock review data
│   ├── types.ts                      # TypeScript interfaces
│   └── utils.ts                      # Helper functions
├── DOCUMENTATION.md
└── README.md
```

## 🔌 API Documentation

### GET `/api/reviews/hostaway`

Fetches and normalizes reviews from Hostaway API with optional filtering.

#### Query Parameters

| Parameter   | Type   | Description                                |
| ----------- | ------ | ------------------------------------------ |
| `listingId` | string | Filter by property ID                      |
| `channel`   | string | Filter by booking channel                  |
| `minRating` | number | Minimum rating threshold                   |
| `sortBy`    | string | Sort field: `date`, `rating`, or `listing` |
| `sortOrder` | string | Sort direction: `asc` or `desc`            |

#### Example Requests

```bash
# Get all reviews
curl http://localhost:3000/api/reviews/hostaway

# Filter by property and rating
curl "http://localhost:3000/api/reviews/hostaway?listingId=SH-29-2B&minRating=8"
```

#### Response Format

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
      "review": "Absolutely wonderful stay!",
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
    "averageRating": 8.5,
    "byChannel": { "Airbnb": 5, "Booking.com": 4, "Vrbo": 1 },
    "byListing": { "2B N1 A - 29 Shoreditch Heights": 4 }
  }
}
```

## 🎬 Usage

### For Property Managers

1. Navigate to `/dashboard`
2. View all reviews with comprehensive filters
3. Click "Approve" to make reviews public
4. View property-specific analytics

### For Guests

1. Browse properties on home page
2. Click any property to view details
3. Read approved guest reviews

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React
- **API:** Next.js API Routes
- **Data Source:** Hostaway API (with mock fallback)

## 📖 Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed information including:

- Architecture decisions
- Google Reviews integration research
- Design rationale
- Future enhancements

## 👤 Developer

**Youssef Kounniba**

- 📧 Email: youssef.kounniba@aiac.ma
- 📱 Phone: 0691817675
- 💼 LinkedIn: [Youssef Kounniba](https://linkedin.com/in/youssef-kounniba)
- 💻 GitHub: [YoussefKounniba](https://github.com/YoussefKounniba)

**Education:** Génie Informatique, Académie Internationale de l'Aviation Civile (2022-2025)

## 📄 License

This project was created as part of the Flex Living Developer Assessment.

---

**Built with ❤️ by Youssef Kounniba for Flex Living**
