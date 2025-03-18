# Lead Management System

## Project Overview

The Lead Management System is an advanced web application designed to collect, score, and prioritize potential customer leads. Built for a property sales hackathon, this system demonstrates how companies can efficiently manage their sales pipeline by focusing on the most promising prospects.

![Lead Management System](https://via.placeholder.com/800x400?text=Lead+Management+System)

## Key Features

- **Smart Lead Collection**: Intuitive form to gather essential information from potential customers
- **Advanced Scoring Algorithm**: Sophisticated multi-factor scoring system to prioritize leads (score 1-5)
- **Interactive Dashboard**: Real-time lead management interface with filtering and sorting capabilities
- **Detailed Lead Analysis**: Comprehensive visualization of lead scores with breakdown of contributing factors
- **Business Rules Integration**: Special handling for VIP customers, urgent needs, and seasonal factors

## Technologies Used

### Frontend
- React.js
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Axios for API requests

### Backend
- Node.js
- Express
- MongoDB for data storage
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/lead-management-system.git
cd lead-management-system
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit the .env file with your MongoDB connection string and other settings
```

4. Install frontend dependencies
```bash
cd ../frontend
npm install
```

5. Start the application
```bash
# In the backend directory
npm run dev

# In the frontend directory (in a new terminal)
npm run dev
```

6. Access the application
```
Frontend: http://localhost:5173
Backend API: http://localhost:3000
```

## Usage

### Creating a New Lead

1. Fill out the lead form with customer information
2. Complete optional questions for better lead scoring
3. Submit the form to process the lead

### Managing Leads

1. View all leads in the dashboard
2. Sort by priority, date, or other attributes
3. Click on a lead to see detailed analysis
4. Filter leads based on various criteria

### Analyzing Lead Scores

The system displays:
- Overall priority score (1-5)
- Breakdown of scoring factors
- Visual representation of each factor's contribution
- Business rules applied to the lead

## Advanced Scoring System

The Lead Management System employs a sophisticated scoring algorithm that considers multiple factors:

- **Profit Potential**: Based on property type, budget, and expected commission
- **Urgency**: How soon the customer needs to make a purchase
- **Intent**: Measured through engagement with optional questions
- **Interest Level**: Based on specific property interest
- **Customer Type**: New vs. returning customer

### Key Algorithms Implementation

The system leverages several advanced algorithms to achieve accurate prioritization:

1. **Hierarchical Fuzzy Logic**: Implements membership functions to handle uncertainty in input values
   - Converts continuous values (like budget) into fuzzy sets
   - Applies fuzzy rules to combine criteria
   - Uses defuzzification to produce final scores

2. **Analytic Hierarchy Process (AHP)**: Determines optimal weights for different scoring factors
   - Structured technique for organizing criteria in hierarchical form
   - Uses pairwise comparisons of criteria importance
   - Calculates the principal eigenvector to derive weights

3. **Weighted Sum Model (WSM)**: Combines multiple factors into a single score
   - Multiplies normalized scores by their respective weights
   - Sums the weighted scores to produce a final value
   - Converts the raw score to a 1-5 priority level

4. **Contextual Adjustment Algorithm**: Modifies scores based on market conditions
   - Location-based priority adjustments
   - Property type-specific weight modifications
   - Seasonal factors that influence buying behavior

5. **Tie-Breaking Mechanism**: Ensures consistent ordering when scores are identical
   - Hierarchical comparison of individual factors
   - Deterministic random component for identical inputs

For detailed documentation on the scoring algorithm, see [SCORING_DOCUMENTATION.md](./SCORING_DOCUMENTATION.md).

## Project Structure

```
lead-management-system/
├── backend/              # Node.js Express backend
│   ├── controllers/      # API route controllers
│   ├── models/           # Database models
│   ├── routes/           # API route definitions
│   └── server.js         # Main server file
├── frontend/             # React frontend application
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── App.jsx       # Main application component
│   │   └── main.jsx      # Entry point
│   └── package.json      # Frontend dependencies
└── README.md             # Project documentation
```

## Hackathon Presentation Tips

When presenting this project at a hackathon:

1. **Highlight the Scoring Algorithm**: Explain how the system uses fuzzy logic and multi-criteria decision making for lead prioritization.

2. **Demonstrate Real-world Impact**: Show how the system could save sales teams time by focusing on high-value prospects.

3. **Show the Visualization Components**: Demonstrate how the system makes complex data easily understandable through visual representations.

4. **Emphasize Customizability**: Mention how the scoring system can be adjusted based on different business needs and markets.

5. **Discuss Future Enhancements**: Share ideas for integrating machine learning to further refine the scoring algorithm based on conversion data.

## License

[MIT License](LICENSE)

## Contributors

- Your Name [@yourgithub](https://github.com/yourgithub)
