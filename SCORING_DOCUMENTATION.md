# Lead Scoring System Documentation

## Overview

The Lead Management System employs a sophisticated scoring algorithm designed to prioritize potential customers based on their likelihood to convert and their value to the business. This document explains the detailed mechanics of how leads are scored on a scale of 1-5, where 5 represents the highest priority.

## Scoring Scale Explained

| Score | Priority Level | Description | Action Required |
|-------|---------------|-------------|----------------|
| 5 | Urgent Priority | High-value lead with immediate needs | Immediate follow-up within 1 hour |
| 4 | High Priority | Valuable lead with strong intent | Follow-up within 4 hours |
| 3 | Medium Priority | Good potential with moderate intent | Follow-up within 24 hours |
| 2 | Low Priority | Some potential but not urgent | Follow-up within 3 days |
| 1 | Very Low Priority | Minimal potential or early stage | Add to nurturing campaign |

## Scoring Factors and Their Weights

The scoring algorithm considers multiple factors, each weighted differently:

| Factor | Weight Range | Description | Example |
|--------|-------------|-------------|---------|
| Profit Potential | 35-45% | Estimated profit based on property interest and budget | ₹100K+ budget (5/5 score) |
| Urgency | 20-25% | How soon the lead needs to make a purchase | "Within 1 month" (5/5 score) |
| Intent | 15-20% | Measured through engagement with optional questions | Answered all intent questions (4/5 score) |
| Interest Level | 10-15% | Based on specific property interest and browsing behavior | Looking at specific properties (4/5 score) |
| Customer Type | 5-10% | New vs. returning customer | Returning customer with past purchases (5/5 score) |
| Sentiment | 5-10% | Whether decision-making is practical or emotional | Emotionally driven buyer for luxury property (5/5 score) |

## Core Algorithms Explained

The scoring system utilizes several advanced algorithms to achieve accurate and consistent lead prioritization:

### 1. Hierarchical Fuzzy Logic System

**What it is**: Fuzzy logic extends traditional boolean logic to handle partial truths. Unlike conventional logic where variables are either 0 or 1, fuzzy logic allows variables to be any value between 0 and 1, representing degrees of truth.

**How we use it**: Our system employs a hierarchical fuzzy inference system with three main components:

1. **Fuzzification**: Converting crisp input values into fuzzy membership degrees
   ```
   Example: Budget of ₹75,000
   - Low Budget (0-50K): μ(75K) = 0.0
   - Medium Budget (40K-100K): μ(75K) = 0.6
   - High Budget (90K+): μ(75K) = 0.2
   ```

2. **Rule Evaluation**: Applying fuzzy rules using IF-THEN statements
   ```
   Example Rules:
   - IF Budget is High AND Urgency is High THEN Priority is Very High
   - IF Budget is Medium AND Urgency is Medium THEN Priority is Medium
   - IF Budget is Low AND Urgency is Low THEN Priority is Low
   ```

3. **Defuzzification**: Converting fuzzy output back to a crisp value using the centroid method
   ```
   Final Score = ∑(μ(rule_i) × score_i) / ∑μ(rule_i)
   Where μ(rule_i) is the membership degree of rule i
   ```

**Where it's applied**: Used for all continuous input variables like budget, timeframe, and sentiment scoring.

### 2. Analytic Hierarchy Process (AHP)

**What it is**: AHP is a structured multi-criteria decision-making technique that organizes factors into a hierarchical structure and evaluates their relative importance.

**How we use it**: We employ AHP to determine the optimal weights for different factors:

1. **Pairwise Comparison**: Comparing the relative importance of each criterion
   ```
   Scale: 1 (equal) to 9 (extremely more important)
   Example comparison matrix:
   
   | Criteria  | Profit | Urgency | Intent | Interest |
   |-----------|--------|---------|--------|----------|
   | Profit    | 1      | 2       | 3      | 4        |
   | Urgency   | 1/2    | 1       | 2      | 3        |
   | Intent    | 1/3    | 1/2     | 1      | 2        |
   | Interest  | 1/4    | 1/3     | 1/2    | 1        |
   ```

2. **Eigenvector Calculation**: Calculating the principal eigenvector to determine weights
   ```
   Resulting weights:
   - Profit: 0.42 (42%)
   - Urgency: 0.26 (26%)
   - Intent: 0.17 (17%)
   - Interest: 0.10 (10%)
   ```

3. **Consistency Ratio**: Validating the consistency of judgments
   ```
   CR = CI / RI
   Where CI is Consistency Index and RI is Random Index
   Acceptable if CR < 0.1
   ```

**Where it's applied**: Used to determine the optimal weight distribution across all scoring factors, with contextual adjustment based on property type and market conditions.

### 3. Weighted Sum Model (WSM)

**What it is**: A simple but effective multi-criteria decision analysis method that multiplies normalized scores by their weights and sums them.

**How we use it**: Once factors are scored and weighted, WSM combines them into a final score:

```
Final Score = ∑(Weight_i × Score_i) for all i factors
```

**Example calculation**:
```
Lead evaluation:
- Profit (weight 0.40): Score 4 → 0.40 × 4 = 1.60
- Urgency (weight 0.25): Score 5 → 0.25 × 5 = 1.25
- Intent (weight 0.15): Score 3 → 0.15 × 3 = 0.45
- Interest (weight 0.10): Score 4 → 0.10 × 4 = 0.40
- Customer Type (weight 0.05): Score 2 → 0.05 × 2 = 0.10
- Sentiment (weight 0.05): Score 3 → 0.05 × 3 = 0.15

Raw Score: 1.60 + 1.25 + 0.45 + 0.40 + 0.10 + 0.15 = 3.95
Final Score: 4 (rounded to nearest integer)
```

**Where it's applied**: Used for the final aggregation of all weighted scores.

### 4. Contextual Adjustment Algorithm

**What it is**: A rule-based system that modifies weights or scores based on contextual information.

**How we use it**: Our system applies contextual adjustments based on location, property type, and market conditions:

1. **Location Adjustment**: Premium locations receive priority boosts
   ```
   If Location in ["Delhi", "Mumbai", "Bangalore"]:
       Final Score += 1
   Elif Location in ["Hyderabad", "Pune", "Chennai"]:
       Final Score += 0.5
   ```

2. **Property Type Weight Shifting**: Different property types shift weight distributions
   ```
   If PropertyType == "Villa":
       Profit_Weight += 0.05  # Increase profit importance
       Interest_Weight -= 0.05  # Decrease interest importance
   ```

3. **Market Condition Adjustments**: Seasonal factors affect scoring
   ```
   If CurrentMonth in ["October", "November"]:  # Festival season
       Final Score += 0.5  # Higher buying activity
   ```

**Where it's applied**: Applied as the final step after the base score is calculated, directly modifying the final score.

### 5. Tie-Breaking Algorithm

**What it is**: A deterministic method to ensure unique prioritization when multiple leads have identical scores.

**How we use it**: Our system uses hierarchical comparison to break ties:

1. **Primary Factor Comparison**: Compare the highest weighted factor first
   ```
   If Lead1.Profit > Lead2.Profit:
       Lead1 has higher priority
   Elif Lead1.Profit < Lead2.Profit:
       Lead2 has higher priority
   Else:
       Move to next factor
   ```

2. **Secondary Factor Cascade**: Continue comparing factors in weight order
   ```
   If Lead1.Urgency > Lead2.Urgency:
       Lead1 has higher priority
   # Continue with remaining factors
   ```

3. **Deterministic Random**: If all factors are identical, use a hash-based approach
   ```
   Lead.PriorityAdjustment = hash(Lead.ID) % 100 / 1000  # Small adjustment between 0 and 0.099
   ```

**Where it's applied**: Used when sorting leads in the dashboard to ensure consistent ordering.

## How the Algorithm Works

### 1. Fuzzy Logic System

Rather than using crisp boundaries, our system employs fuzzy logic to handle the natural uncertainty in lead evaluation. Here's how it works:

```
Example: Budget Evaluation
- Input: ₹75,000
- Fuzzy membership:
  * Low Budget (0-50K): 0% membership
  * Medium Budget (40K-100K): 60% membership
  * High Budget (90K+): 20% membership
- Result: This budget is primarily "Medium" with some "High" characteristics
```

### 2. Profit Calculation

Profit potential is calculated based on the property type and budget:

| Property Type | Budget Range | Profit Formula | Example |
|--------------|--------------|----------------|---------|
| Apartment | < ₹50K | Budget × 0.08 | Budget: ₹40K → Profit: ₹3.2K |
| Apartment | ₹50K-100K | Budget × 0.10 | Budget: ₹75K → Profit: ₹7.5K |
| Apartment | > ₹100K | Budget × 0.12 | Budget: ₹150K → Profit: ₹18K |
| Villa | < ₹100K | Budget × 0.15 | Budget: ₹80K → Profit: ₹12K |
| Villa | > ₹100K | Budget × 0.18 | Budget: ₹200K → Profit: ₹36K |
| Plot | Any | Budget × 0.20 | Budget: ₹100K → Profit: ₹20K |

### 3. Urgency Scoring

Urgency is scored based on the timeframe provided by the lead:

| Timeframe | Urgency Score | Reasoning |
|-----------|--------------|-----------|
| Immediate/Within 1 month | 5 | Requires immediate attention, high conversion potential |
| 1-3 months | 4 | Active shopping phase, needs prompt follow-up |
| 3-6 months | 3 | Planning phase, moderate urgency |
| 6-12 months | 2 | Early research phase, low urgency |
| 12+ months | 1 | Very early planning, minimal urgency |

### 4. Intent Scoring Through Optional Questions

The system evaluates intent through engagement with optional questions:

| Questions Answered | Additional Information Provided | Intent Score | Example |
|-------------------|--------------------------------|-------------|---------|
| 0 | None | 1 | Lead provided only basic information |
| 1-2 | Limited | 2 | Lead answered timeframe question only |
| 2-3 | Moderate | 3 | Lead provided timeframe and financing status |
| 3-4 | Substantial | 4 | Lead completed most optional questions |
| All | Comprehensive | 5 | Lead provided all requested information |

### 5. Location-Based Priority Adjustments

Location significantly impacts lead priority:

| Location | Market Value | Priority Adjustment | Reasoning |
|----------|-------------|---------------------|-----------|
| Delhi | High | +1 to final score | High-value market with strong demand |
| Mumbai | High | +1 to final score | Premium property values and high transaction volume |
| Bangalore | High | +1 to final score | Tech-hub with steady property appreciation |
| Hyderabad | Medium-High | +0.5 to final score | Growing market with good potential |
| Other Tier 1 | Medium | +0.3 to final score | Good markets with stable demand |
| Tier 2/3 Cities | Low-Medium | No adjustment | Standard priority based on other factors |

### 6. Score Combination Logic

The final score is calculated through a weighted formula and then rounded to the nearest integer:

```
Final Score = (Profit Score × Profit Weight) +
              (Urgency Score × Urgency Weight) +
              (Intent Score × Intent Weight) +
              (Interest Score × Interest Weight) +
              (Customer Type Score × Customer Type Weight) +
              (Sentiment Score × Sentiment Weight) +
              Location Adjustment
```

### 7. Real-World Scoring Examples

#### Example 1: High-Priority Lead

```
Input:
- Name: Raj Patel
- Budget: ₹200,000
- Property Type: Villa
- Timeframe: Within 1 month
- Location: Mumbai
- Optional Questions: All answered
- Specific Property Interest: Yes

Calculation:
- Profit: ₹200K × 0.18 = ₹36K → Score 5 (Weight: 40%)
- Urgency: "Within 1 month" → Score 5 (Weight: 25%)
- Intent: All questions answered → Score 5 (Weight: 15%)
- Interest: Specific property → Score 4 (Weight: 10%)
- Customer Type: New → Score 2 (Weight: 5%)
- Sentiment: Emotional buyer → Score 4 (Weight: 5%)
- Location Adjustment: Mumbai → +1

Raw Score: (5×0.4) + (5×0.25) + (5×0.15) + (4×0.1) + (2×0.05) + (4×0.05) + 1 = 5.3
Final Score: 5 (Rounded to nearest integer)
```

#### Example 2: Medium-Priority Lead

```
Input:
- Name: Anita Sharma
- Budget: ₹60,000
- Property Type: Apartment
- Timeframe: 3-6 months
- Location: Indore
- Optional Questions: 2 answered
- Specific Property Interest: No

Calculation:
- Profit: ₹60K × 0.1 = ₹6K → Score 2 (Weight: 40%)
- Urgency: "3-6 months" → Score 3 (Weight: 25%)
- Intent: 2 questions answered → Score 3 (Weight: 15%)
- Interest: No specific property → Score 2 (Weight: 10%)
- Customer Type: New → Score 2 (Weight: 5%)
- Sentiment: Balanced → Score 3 (Weight: 5%)
- Location Adjustment: Tier 2 city → +0

Raw Score: (2×0.4) + (3×0.25) + (3×0.15) + (2×0.1) + (2×0.05) + (3×0.05) = 2.5
Final Score: 3 (Rounded to nearest integer)
```

#### Example 3: Low-Priority Lead

```
Input:
- Name: Vikram Singh
- Budget: ₹30,000
- Property Type: Apartment
- Timeframe: 12+ months
- Location: Small town
- Optional Questions: None answered
- Specific Property Interest: No

Calculation:
- Profit: ₹30K × 0.08 = ₹2.4K → Score 1 (Weight: 40%)
- Urgency: "12+ months" → Score 1 (Weight: 25%)
- Intent: No questions answered → Score 1 (Weight: 15%)
- Interest: No specific property → Score 1 (Weight: 10%)
- Customer Type: New → Score 2 (Weight: 5%)
- Sentiment: Unknown → Score 3 (Weight: 5%)
- Location Adjustment: Tier 3 city → +0

Raw Score: (1×0.4) + (1×0.25) + (1×0.15) + (1×0.1) + (2×0.05) + (3×0.05) = 1.25
Final Score: 1 (Rounded to nearest integer)
```

## Business Rules Layer

The core algorithm is enhanced with business rules that can override or adjust scores in specific scenarios:

### VIP Rules

| Condition | Effect | Example |
|-----------|--------|---------|
| Budget > ₹200K | Minimum score of 4 | A lead with a calculated score of 3 but a budget of ₹250K gets upgraded to 4 |
| Returning customer | +1 to final score | A previous customer with a calculated score of 3 gets upgraded to 4 |
| Reference from existing customer | +1 to final score | A referral lead gets priority regardless of other factors |

### Fast-Track Rules

| Condition | Effect | Example |
|-----------|--------|---------|
| Immediate need + Specific property | Minimum score of 5 | A lead needing to move within 2 weeks and interested in a specific available property |
| Pre-approved financing | +1 to final score | A lead with verified financing documentation gets priority |

### Seasonal Adjustments

| Season | Effect | Reasoning |
|--------|--------|-----------|
| Festival season (Oct-Nov) | +0.5 to all scores | Increased buying activity during auspicious periods |
| End of financial year (Jan-Mar) | +0.5 to scores for investment properties | Tax planning drives investment property purchases |
| Monsoon (Jun-Aug) | -0.5 to scores for under-construction properties | Reduced site visits during rainy season |

## Interface Design for Score Visualization

The visualization component displays:

1. **Score Badge**: Color-coded indicator of priority (Red=5, Orange=4, Yellow=3, Blue=2, Green=1)
2. **Factor Bars**: Visual representation of each factor's contribution
3. **Intent Analysis**: Breakdown of optional question responses
4. **Sentiment Analysis**: Practical vs. emotional decision-making indicators
5. **Business Rules**: Which special rules were applied to this lead

## Technical Implementation

The scoring algorithm is implemented through:

1. Frontend data collection (React.js components)
2. API service for data transmission (RESTful endpoints)
3. Backend scoring logic (Node.js with Express)
4. Real-time score calculation and visualization

## Conclusion

This lead scoring system provides a data-driven approach to prioritizing sales efforts. By combining multiple factors through fuzzy logic and multi-criteria decision making, it ensures that high-potential leads receive prompt attention while still maintaining a structured approach to all potential customers.

The system is designed to be transparent, allowing sales teams to understand exactly why a particular lead received its score, while also being sophisticated enough to handle the complex, multi-dimensional nature of lead qualification.
