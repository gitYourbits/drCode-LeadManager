from fastapi import APIRouter
from app.models import LeadData
from app.scoring import calculate_lead_score

router = APIRouter()

@router.post("/score_lead/")
async def score_lead(lead: LeadData):
    """Receives lead data, calculates score, and returns the classified category"""
    lead_score = calculate_lead_score(lead)
    print({"user_id": lead.user_id, "lead_score": lead_score})
    return {"user_id": lead.user_id, "lead_score": lead_score}
