from fastapi import APIRouter, HTTPException
from app.models import LeadData
from app.scoring import calculate_lead_score
from typing import List, Optional
import logging
import uuid
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for leads since we don't have a database
leads_db = []

@router.post("/api/leads")
async def create_lead(lead: LeadData):
    """Endpoint to create a new lead with score calculation"""
    try:
        # Generate a unique ID if not provided
        if not lead.user_id:
            lead.user_id = str(uuid.uuid4())
            
        # Calculate the lead score using our enhanced algorithm
        lead_score = calculate_lead_score(lead)
        
        # Create lead object with timestamp
        lead_obj = lead.dict()
        lead_obj["lead_score"] = lead_score
        lead_obj["created_at"] = datetime.now().isoformat()
        
        # Store in our in-memory database
        leads_db.append(lead_obj)
        
        logger.info(f"Created lead with ID: {lead.user_id}, score: {lead_score}")
        
        # Return the created lead with its score
        return lead_obj
        
    except Exception as e:
        logger.error(f"Error creating lead: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating lead: {str(e)}")

@router.get("/api/leads")
async def get_leads():
    """Endpoint to retrieve all leads"""
    try:
        # Sort leads by score (highest first) then by creation date (newest first)
        sorted_leads = sorted(
            leads_db,
            key=lambda x: (-(x.get("lead_score") or 0), x.get("created_at", "")),
            reverse=True
        )
        
        logger.info(f"Retrieved {len(sorted_leads)} leads")
        return sorted_leads
        
    except Exception as e:
        logger.error(f"Error retrieving leads: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving leads: {str(e)}")

@router.get("/api/leads/{lead_id}")
async def get_lead(lead_id: str):
    """Endpoint to retrieve a specific lead by ID"""
    try:
        for lead in leads_db:
            if lead.get("user_id") == lead_id:
                return lead
                
        # If lead not found
        raise HTTPException(status_code=404, detail=f"Lead with ID {lead_id} not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving lead {lead_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving lead: {str(e)}")

@router.post("/score_lead/")
async def score_lead(lead: LeadData):
    """Legacy endpoint - receives lead data, calculates score, and returns the classified category"""
    try:
        # Log the incoming lead data
        logger.info(f"Received lead data: {lead}")
        
        # Calculate the lead score using our enhanced algorithm
        lead_score = calculate_lead_score(lead)
        
        # Return the result
        return {"user_id": lead.user_id, "lead_score": lead_score}
    except Exception as e:
        # Log any errors that occur
        logger.error(f"Error processing lead: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing lead: {str(e)}")
