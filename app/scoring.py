import math
import json

def calculate_lead_score(data):
    """
    Advanced lead scoring algorithm combining fuzzy logic and AHP (Analytic Hierarchy Process)
    with tie-breaking mechanisms for simulation purposes.
    """
    # 1. Define criteria weights using AHP (pre-calculated)
    base_weights = {
        "final_profit": 0.35,
        "urgency": 0.25,
        "intent": 0.20,
        "interest_level": 0.15,
        "customer_type": 0.05
    }
    
    # Apply contextual weighting if context data is available
    weights = adjust_weights_by_context(base_weights, data)
    
    # 2. Calculate fuzzy membership values for each criterion
    fuzzy_values = calculate_fuzzy_memberships(data)
    
    # 3. Apply business rules to adjust fuzzy values
    fuzzy_values = apply_business_rules(fuzzy_values, data)
    
    # 4. Calculate the weighted sum for both dimensions
    likelihood_score = calculate_likelihood_score(fuzzy_values, weights)
    business_value_score = calculate_business_value_score(fuzzy_values, weights)
    
    # 5. Combine dimensions with 60/40 weighting (likelihood/value)
    combined_score = (likelihood_score * 0.6) + (business_value_score * 0.4)
    
    # 6. Apply tie-breaking mechanism
    final_score = apply_tie_breaking(combined_score, data)
    
    # 7. Convert to category (1-5)
    category = convert_to_category(final_score)
    
    # 8. Store metadata for demonstration (in a real system, we would store this)
    metadata = {
        "fuzzy_values": fuzzy_values,
        "weights": weights,
        "likelihood_score": likelihood_score,
        "business_value_score": business_value_score,
        "combined_score": combined_score,
        "tie_breaker": final_score - combined_score,
        "final_score": final_score,
        "category": category
    }
    
    # Print metadata for demonstration purposes
    print(f"Lead scoring metadata: {json.dumps(metadata, indent=2)}")
    
    return category

def calculate_fuzzy_memberships(data):
    """Calculate fuzzy membership values for each criterion"""
    fuzzy_values = {}
    
    # Profit fuzzy membership
    profit = data.final_profit
    if profit <= 10000:
        fuzzy_values["profit_low"] = 1.0
        fuzzy_values["profit_medium"] = 0.0
        fuzzy_values["profit_high"] = 0.0
    elif profit <= 50000:
        fuzzy_values["profit_low"] = max(0, (50000 - profit) / 40000)
        fuzzy_values["profit_medium"] = max(0, (profit - 10000) / 40000)
        fuzzy_values["profit_high"] = 0.0
    elif profit <= 200000:
        fuzzy_values["profit_low"] = 0.0
        fuzzy_values["profit_medium"] = max(0, (200000 - profit) / 150000)
        fuzzy_values["profit_high"] = max(0, (profit - 50000) / 150000)
    else:
        fuzzy_values["profit_low"] = 0.0
        fuzzy_values["profit_medium"] = 0.0
        fuzzy_values["profit_high"] = 1.0
    
    # Urgency fuzzy membership
    urgency = data.urgency
    fuzzy_values["urgency_low"] = max(0, (3 - urgency) / 2) if urgency <= 3 else 0
    fuzzy_values["urgency_medium"] = max(0, 1 - abs(urgency - 3) / 2)
    fuzzy_values["urgency_high"] = max(0, (urgency - 3) / 2) if urgency >= 3 else 0
    
    # Intent fuzzy membership - use enhanced data if available
    intent = data.intent
    if hasattr(data, 'intent_data') and data.intent_data:
        # Use the enhanced intent score if available
        intent = data.intent_data.score
    
    fuzzy_values["intent_low"] = max(0, (3 - intent) / 2) if intent <= 3 else 0
    fuzzy_values["intent_medium"] = max(0, 1 - abs(intent - 3) / 2)
    fuzzy_values["intent_high"] = max(0, (intent - 3) / 2) if intent >= 3 else 0
    
    # Interest level fuzzy membership
    interest = data.interest_level
    fuzzy_values["interest_low"] = max(0, (3 - interest) / 2) if interest <= 3 else 0
    fuzzy_values["interest_medium"] = max(0, 1 - abs(interest - 3) / 2)
    fuzzy_values["interest_high"] = max(0, (interest - 3) / 2) if interest >= 3 else 0
    
    # Customer type (binary: new=1, returning=2)
    fuzzy_values["customer_new"] = 1.0 if data.customer_type == 1 else 0.0
    fuzzy_values["customer_returning"] = 1.0 if data.customer_type == 2 else 0.0
    
    # Sentiment fuzzy membership - if available
    if hasattr(data, 'sentiment_data') and data.sentiment_data:
        sentiment = data.sentiment_data.practical_emotional
        fuzzy_values["sentiment_practical"] = max(0, (3 - sentiment) / 2) if sentiment <= 3 else 0
        fuzzy_values["sentiment_balanced"] = max(0, 1 - abs(sentiment - 3) / 2)
        fuzzy_values["sentiment_emotional"] = max(0, (sentiment - 3) / 2) if sentiment >= 3 else 0
    else:
        # Default values if sentiment data not available
        fuzzy_values["sentiment_practical"] = 0.33
        fuzzy_values["sentiment_balanced"] = 0.34
        fuzzy_values["sentiment_emotional"] = 0.33
    
    return fuzzy_values

def adjust_weights_by_context(base_weights, data):
    """Adjust weights based on context if available"""
    weights = base_weights.copy()
    
    if hasattr(data, 'context_data') and data.context_data:
        context = data.context_data
        
        # Adjust weights based on property type
        if context.property_type.lower() == "villa":
            # For luxury properties, profit and sentiment matter more
            weights["final_profit"] *= 1.2
            weights["intent"] *= 0.9
        elif context.property_type.lower() == "apartment":
            # For apartments, urgency matters more
            weights["urgency"] *= 1.2
            weights["final_profit"] *= 0.9
        
        # Adjust weights based on price range
        if context.price_range.lower() == "high":
            # For high-price properties, intent matters more
            weights["intent"] *= 1.2
            weights["urgency"] *= 0.9
        elif context.price_range.lower() == "low":
            # For low-price properties, urgency matters more
            weights["urgency"] *= 1.2
            weights["intent"] *= 0.9
        
        # Adjust weights based on season
        if context.season.lower() == "peak":
            # During peak season, prioritize profit
            weights["final_profit"] *= 1.1
        elif context.season.lower() == "off-peak":
            # During off-peak, prioritize any interest
            weights["interest_level"] *= 1.2
    
    # Normalize weights to sum to 1
    total = sum(weights.values())
    for key in weights:
        weights[key] /= total
    
    return weights

def apply_business_rules(fuzzy_values, data):
    """Apply business rules to adjust fuzzy values"""
    adjusted_values = fuzzy_values.copy()
    
    # Rule 1: VIP Rule - High profit and high urgency leads get boosted
    if data.final_profit > 200000 and data.urgency >= 4:
        adjusted_values["profit_high"] = 1.0
        adjusted_values["urgency_high"] = 1.0
    
    # Rule 2: Fast-Track Rule - Extremely urgent leads (5) get priority
    if data.urgency == 5:
        adjusted_values["urgency_high"] = 1.0
    
    # Rule 3: Returning customers with high intent get loyalty boost
    if data.customer_type == 2 and data.intent >= 4:
        adjusted_values["intent_high"] = 1.0
    
    # Rule 4: If sentiment is highly emotional and profit is high, boost intent
    if (hasattr(data, 'sentiment_data') and data.sentiment_data and 
            data.sentiment_data.practical_emotional >= 4 and data.final_profit > 100000):
        adjusted_values["intent_high"] = max(adjusted_values["intent_high"], 0.8)
    
    return adjusted_values

def calculate_likelihood_score(fuzzy_values, weights):
    """Calculate likelihood to convert score"""
    # Apply fuzzy rules to determine conversion likelihood
    rule_outputs = []
    
    # Rule 1: If urgency is high AND intent is high THEN likelihood is very high
    rule1 = min(fuzzy_values["urgency_high"], fuzzy_values["intent_high"])
    rule_outputs.append((rule1, 0.9))  # 0.9 = very high likelihood
    
    # Rule 2: If urgency is high AND intent is medium THEN likelihood is high
    rule2 = min(fuzzy_values["urgency_high"], fuzzy_values["intent_medium"])
    rule_outputs.append((rule2, 0.7))  # 0.7 = high likelihood
    
    # Rule 3: If urgency is medium AND intent is high THEN likelihood is high
    rule3 = min(fuzzy_values["urgency_medium"], fuzzy_values["intent_high"])
    rule_outputs.append((rule3, 0.7))  # 0.7 = high likelihood
    
    # Rule 4: If interest is high THEN likelihood is medium-high
    rule4 = fuzzy_values["interest_high"]
    rule_outputs.append((rule4, 0.6))  # 0.6 = medium-high likelihood
    
    # Rule 5: If customer is returning AND intent is medium THEN likelihood is medium-high
    rule5 = min(fuzzy_values["customer_returning"], fuzzy_values["intent_medium"])
    rule_outputs.append((rule5, 0.6))  # 0.6 = medium-high likelihood
    
    # Rule 6: If urgency is low AND intent is low THEN likelihood is low
    rule6 = min(fuzzy_values["urgency_low"], fuzzy_values["intent_low"])
    rule_outputs.append((rule6, 0.2))  # 0.2 = low likelihood
    
    # Rule 7: If sentiment is emotional THEN likelihood is increased
    if "sentiment_emotional" in fuzzy_values:
        rule7 = fuzzy_values["sentiment_emotional"]
        rule_outputs.append((rule7, 0.65))  # 0.65 = increased likelihood
    
    # Rule 8: If sentiment is practical AND profit is high THEN likelihood is medium
    if "sentiment_practical" in fuzzy_values:
        rule8 = min(fuzzy_values["sentiment_practical"], fuzzy_values["profit_high"])
        rule_outputs.append((rule8, 0.5))  # 0.5 = medium likelihood
    
    # Defuzzify using weighted average
    if sum(rule[0] for rule in rule_outputs) > 0:
        likelihood = sum(rule[0] * rule[1] for rule in rule_outputs) / sum(rule[0] for rule in rule_outputs)
    else:
        likelihood = 0.5  # Default to medium if no rules fire
    
    return likelihood

def calculate_business_value_score(fuzzy_values, weights):
    """Calculate business value score"""
    # Apply fuzzy rules to determine business value
    rule_outputs = []
    
    # Rule 1: If profit is high THEN value is very high
    rule1 = fuzzy_values["profit_high"]
    rule_outputs.append((rule1, 0.9))  # 0.9 = very high value
    
    # Rule 2: If profit is medium AND urgency is high THEN value is high
    rule2 = min(fuzzy_values["profit_medium"], fuzzy_values["urgency_high"])
    rule_outputs.append((rule2, 0.7))  # 0.7 = high value
    
    # Rule 3: If profit is medium AND intent is high THEN value is high
    rule3 = min(fuzzy_values["profit_medium"], fuzzy_values["intent_high"])
    rule_outputs.append((rule3, 0.7))  # 0.7 = high value
    
    # Rule 4: If profit is low AND urgency is high THEN value is medium
    rule4 = min(fuzzy_values["profit_low"], fuzzy_values["urgency_high"])
    rule_outputs.append((rule4, 0.5))  # 0.5 = medium value
    
    # Rule 5: If profit is low AND intent is low THEN value is low
    rule5 = min(fuzzy_values["profit_low"], fuzzy_values["intent_low"])
    rule_outputs.append((rule5, 0.2))  # 0.2 = low value
    
    # Rule 6: If customer is returning THEN value is increased
    rule6 = fuzzy_values["customer_returning"]
    rule_outputs.append((rule6, 0.6))  # 0.6 = increased value
    
    # Defuzzify using weighted average
    if sum(rule[0] for rule in rule_outputs) > 0:
        value = sum(rule[0] * rule[1] for rule in rule_outputs) / sum(rule[0] for rule in rule_outputs)
    else:
        value = 0.5  # Default to medium if no rules fire
    
    return value

def apply_tie_breaking(score, data):
    """Apply tie-breaking mechanism to ensure unique scores"""
    # Primary tie-breaker: Small random noise based on user ID
    tie_breaker = 0.01 * (hash(str(data.user_id)) % 100) / 100.0
    
    # Secondary tie-breaker: Recency factor (simulated with user_id)
    recency_factor = 0.005 * (data.user_id % 1000) / 1000.0
    
    # Apply tie-breakers
    final_score = score + tie_breaker + recency_factor
    
    # Ensure score is between 0 and 1
    final_score = max(0, min(1, final_score))
    
    return final_score

def convert_to_category(score):
    """Convert normalized score to category (1-5)"""
    if score <= 0.2:
        return 1
    elif score <= 0.4:
        return 2
    elif score <= 0.6:
        return 3
    elif score <= 0.8:
        return 4
    else:
        return 5
