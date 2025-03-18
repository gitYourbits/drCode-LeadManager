from pydantic import BaseModel

class LeadData(BaseModel):
    user_id: int
    final_profit: float  # Budget-based profit potential
    urgency: int  # 1-5 scale (1 = Not urgent, 5 = Immediate)
    intent: int  # 1-5 scale (1 = Just exploring, 5 = Ready to buy)
    interest_level: int  # 1-5 scale (1 = Browsing, 5 = Specific property)
    customer_type: int  # 1 = New, 2 = Returning
