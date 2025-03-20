from pydantic import BaseModel
from typing import Dict, Optional

class IntentData(BaseModel):
    question_engagement: float  # Percentage of optional questions answered (0.0-1.0)
    score: int  # Calculated intent score (1-5)

class SentimentData(BaseModel):
    practical_emotional: float  # 1=Highly practical, 5=Highly emotional
    score: int  # Calculated sentiment score (1-5)

class ContextData(BaseModel):
    property_type: str  # e.g., "villa", "apartment"
    location: str  # e.g., "delhi"
    price_range: str  # e.g., "high", "medium", "low"
    season: Optional[str] = "regular"  # e.g., "peak", "off-peak", "regular"

class LeadData(BaseModel):
    user_id: int
    final_profit: float  # Budget-based profit potential
    urgency: int  # 1-5 scale (1 = Not urgent, 5 = Immediate)
    intent: int  # 1-5 scale (1 = Just exploring, 5 = Ready to buy)
    interest_level: int  # 1-5 scale (1 = Browsing, 5 = Specific property)
    customer_type: int  # 1 = New, 2 = Returning
    
    # Optional enhanced fields - if not provided, the algorithm will use the basic fields
    intent_data: Optional[IntentData] = None
    sentiment_data: Optional[SentimentData] = None
    context_data: Optional[ContextData] = None
