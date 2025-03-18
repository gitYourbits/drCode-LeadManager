def calculate_lead_score(data):
    """Calculate lead score based on normalized values and weighted sum approach"""

    # Expected Ranges for Normalization
    max_values = {
        "final_profit": 1000000.0,  # Assuming 1M as the max profit cap
        "urgency": 5,  # 1 to 5 scale
        "intent": 5,  # 1 to 5 scale
    }

    # Predefined Weights
    weights = {
        "final_profit": 0.30,
        "urgency": 0.25,
        "intent": 0.20,
        "interest_level": 0.15,
        "customer_type": 0.10
    }

    # Normalize only numerical fields
    normalized_values = {
        "final_profit": data.final_profit / max_values["final_profit"],
        "urgency": data.urgency / max_values["urgency"],
        "intent": data.intent / max_values["intent"],
    }

    # Convert customer_type & interest_level to binary (New = 0, Returning = 1)
    normalized_values["customer_type"] = 0 if data.customer_type == 1 else 1
    normalized_values["interest_level"] = 0 if data.interest_level <= 2 else 1  # Interest level 1-2 as 'No', 3-5 as 'Yes'

    # Compute weighted sum
    lead_score = sum(normalized_values[key] * weights[key] for key in weights) * 100

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
