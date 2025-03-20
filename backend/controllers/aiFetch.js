const { default: axios } = require("axios")
const prisma = require("../config/db");

exports.getAPI = async (req, res) => {
    const frontendData = req.body;
    console.log(frontendData);
    
    try {
        // Generate a random user ID between 1000 and 9999999
        const randomUserId = Math.floor(1000 + Math.random() * 9000000);
        
        // Transform frontend data to match FastAPI's expected format
        const transformedData = {
            user_id: randomUserId, // Random user ID for each submission
            final_profit: calculateProfit(frontendData.budget),
            urgency: parseInt(frontendData.urgency),
            intent: calculateIntent(frontendData.specificProperty),
            interest_level: calculateInterestLevel(frontendData.specificProperty),
            customer_type: 1, // Default to new customer
            
            // Add enhanced data if available
            intent_data: calculateIntentData(frontendData),
            sentiment_data: calculateSentimentData(frontendData),
            context_data: {
                property_type: frontendData.propertyType || "apartment",
                location: frontendData.location || "unknown",
                price_range: calculatePriceRange(frontendData.budget),
                season: getCurrentSeason()
            }
        };
        
        console.log("Transformed data for FastAPI:", transformedData);
        
        // Call the FastAPI scoring service
        const response = await axios.post('http://127.0.0.1:8000/score_lead/', transformedData);
        
        // Combine the score with the original data for frontend
        const resultData = {
            ...frontendData,
            lead_score: response.data.lead_score,
            user_id: randomUserId // Include the generated user ID in the response
        };
        
        // Store lead in database
        try {
            // First create or find the user
            const user = await prisma.user.upsert({
                where: { 
                    email: frontendData.email || `user-${randomUserId}@example.com` 
                },
                update: { 
                    name: frontendData.name,
                    location: frontendData.location
                },
                create: {
                    email: frontendData.email || `user-${randomUserId}@example.com`,
                    name: frontendData.name,
                    location: frontendData.location
                }
            });
            
            // Find any employee to handle the lead (first one for simplicity)
            let employee = await prisma.employee.findFirst();
            
            // If no employee exists, create a default one
            if (!employee) {
                employee = await prisma.employee.create({
                    data: {
                        name: "Default Handler",
                        email: "handler@example.com"
                    }
                });
            }
            
            // Now create the lead
            await prisma.leads.create({
                data: {
                    context: JSON.stringify(resultData),
                    rating: response.data.lead_score,
                    createdBy: user.id,
                    handledBy: employee.id
                }
            });
            
            console.log("Lead saved to database successfully");
        } catch (dbError) {
            console.error("Database error:", dbError);
            // Don't fail the API call if DB storage fails
        }
        
        res.status(200).json(resultData);
    } catch (error) {
        console.error("Error in API call:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        res.status(500).json({ error: error.message });
    }
};

// Helper functions to transform data
function calculateProfit(budget) {
    // Convert budget to number and calculate estimated profit
    const budgetNum = parseFloat(budget.replace(/,/g, "")) || 0;
    return budgetNum * 0.8; // 80% of budget as profit for example
}

function calculateIntent(specificProperty) {
    // Convert specificProperty to intent score (1-5)
    return specificProperty === "Yes" ? 4 : 2;
}

function calculateInterestLevel(specificProperty) {
    // Convert specificProperty to interest level (1-5)
    return specificProperty === "Yes" ? 4 : 2;
}

// New helper functions for enhanced data
function calculateIntentData(frontendData) {
    if (frontendData.intentQuestions) {
        // Calculate engagement score based on optional questions
        let questionEngagement = 0.5; // Default value
        
        // Calculate based on timeframe - closer timeframes indicate higher engagement
        if (frontendData.intentQuestions.timeframe === "0-3 months") {
            questionEngagement += 0.3;
        } else if (frontendData.intentQuestions.timeframe === "3-6 months") {
            questionEngagement += 0.2;
        } else if (frontendData.intentQuestions.timeframe === "6-12 months") {
            questionEngagement += 0.1;
        }
        
        // Calculate based on financing status
        if (frontendData.intentQuestions.financing === "Pre-approved" || 
            frontendData.intentQuestions.financing === "Cash Buyer") {
            questionEngagement += 0.3;
        } else if (frontendData.intentQuestions.financing === "Started Process") {
            questionEngagement += 0.15;
        }
        
        // Calculate based on properties viewed
        if (frontendData.intentQuestions.viewedProperties === "11-20" || 
            frontendData.intentQuestions.viewedProperties === "20+") {
            questionEngagement += 0.2;
        } else if (frontendData.intentQuestions.viewedProperties === "6-10") {
            questionEngagement += 0.1;
        }
        
        // Ensure the engagement score is between 0 and 1
        questionEngagement = Math.min(1, Math.max(0, questionEngagement));
        
        // Calculate score based on engagement (1-5 scale)
        const score = Math.min(5, Math.max(1, Math.round(questionEngagement * 5)));
        
        return {
            question_engagement: questionEngagement,
            score: score
        };
    } else {
        // In a real application, this would be based on optional questions answered
        // For simulation, we'll use a random value between 0.3 and 1.0
        const questionEngagement = 0.3 + (Math.random() * 0.7);
        
        // Calculate score based on engagement (1-5 scale)
        const score = Math.min(5, Math.max(1, Math.round(questionEngagement * 5)));
        
        return {
            question_engagement: questionEngagement,
            score: score
        };
    }
}

function calculateSentimentData(frontendData) {
    if (frontendData.sentimentQuestions) {
        // Calculate practical_emotional score (1-5 scale)
        // 1 = highly practical, 5 = highly emotional
        let practical_emotional = 3; // Default balanced
        
        if (frontendData.sentimentQuestions.motivationFactor === "practical") {
            practical_emotional -= 1.5;
        } else if (frontendData.sentimentQuestions.motivationFactor === "emotional") {
            practical_emotional += 1.5;
        }
        
        if (frontendData.sentimentQuestions.decisionStyle === "logical") {
            practical_emotional -= 0.5;
        } else if (frontendData.sentimentQuestions.decisionStyle === "intuitive") {
            practical_emotional += 0.5;
        }
        
        // Ensure the score is between 1 and 5
        practical_emotional = Math.min(5, Math.max(1, practical_emotional));
        
        // Calculate score (1-5) - higher scores for both extremes (very practical or very emotional)
        // Middle values (balanced) get lower scores
        const score = Math.round(Math.abs(practical_emotional - 3) * 2) + 1;
        
        return {
            practical_emotional: practical_emotional,
            score: Math.min(5, score)
        };
    } else {
        // In a real application, this would be based on psychological questions
        // For simulation, we'll use a value that tends toward practical for higher budgets
        // and emotional for lower budgets (just as an example pattern)
        
        const budgetNum = parseFloat(frontendData.budget.replace(/,/g, "")) || 0;
        
        // Scale from 1 (highly practical) to 5 (highly emotional)
        // Higher budgets tend to be more practical (lower score)
        let practical_emotional = 5 - (budgetNum / 500000) * 4;
        
        // Ensure within 1-5 range and add some randomness
        practical_emotional = Math.min(5, Math.max(1, practical_emotional + (Math.random() * 2 - 1)));
        
        // Calculate score (1-5) - higher scores for both extremes (very practical or very emotional)
        // Middle values (balanced) get lower scores
        const score = Math.round(Math.abs(practical_emotional - 3) * 2) + 1;
        
        return {
            practical_emotional: practical_emotional,
            score: Math.min(5, score)
        };
    }
}

function calculatePriceRange(budget) {
    // Determine price range based on budget
    const budgetNum = parseFloat(budget.replace(/,/g, "")) || 0;
    
    if (budgetNum <= 30000) {
        return "low";
    } else if (budgetNum <= 100000) {
        return "medium";
    } else {
        return "high";
    }
}

function getCurrentSeason() {
    // Determine current season based on month
    const month = new Date().getMonth();
    
    if (month >= 2 && month <= 4) {
        return "spring";
    } else if (month >= 5 && month <= 7) {
        return "summer";
    } else if (month >= 8 && month <= 10) {
        return "fall";
    } else {
        return "winter";
    }
}
