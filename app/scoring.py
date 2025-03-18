def calculate_lead_score(data):
    """Calculate lead score based on weighted sum approach"""
    
    # Predefined Weights
    weights = {
        "final_profit": 0.30,
        "urgency": 0.25,
        "intent": 0.20,
        "interest_level": 0.15,
        "customer_type": 0.10
    }
    
    # Normalize customer_type (New = 1 → 0, Returning = 2 → 1)
    normalized_customer_type = data.customer_type - 1
    
    # Compute weighted sum
    lead_score = (
        (data.final_profit * weights["final_profit"]) +
        (data.urgency * 20 * weights["urgency"]) +
        (data.intent * 20 * weights["intent"]) +
        (data.interest_level * 20 * weights["interest_level"]) +
        (normalized_customer_type * 100 * weights["customer_type"])
    )
    
    # Classification into 5 categories
    if lead_score <= 20:
        category = 1
    elif lead_score <= 40:
        category = 2
    elif lead_score <= 60:
        category = 3
    elif lead_score <= 80:
        category = 4
    else:
        category = 5

    return category
