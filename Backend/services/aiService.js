/**
 * AI Service Module
 * Handles free-text classification, urgency detection, and provider matching.
 * Currently implemented as a rules-based mock per the Master Build Prompt instructions.
 * Can be easily swapped with the Gemini/OpenAI API later.
 */

// Mock logic for categorization
const categorizeRequest = async (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('pipe') || lowerText.includes('leak') || lowerText.includes('plumb')) {
    return { category: 'Plumbing', subCategory: 'Repair' };
  }
  if (lowerText.includes('wire') || lowerText.includes('light') || lowerText.includes('electric')) {
    return { category: 'Electrical', subCategory: 'Installation/Repair' };
  }
  if (lowerText.includes('clean') || lowerText.includes('dust') || lowerText.includes('mop')) {
    return { category: 'Cleaning', subCategory: 'General Cleaning' };
  }
  if (lowerText.includes('ac') || lowerText.includes('heater') || lowerText.includes('hvac')) {
    return { category: 'HVAC', subCategory: 'Maintenance' };
  }
  if (lowerText.includes('pest') || lowerText.includes('termite') || lowerText.includes('rodent') || lowerText.includes('cockroach') || lowerText.includes('insect')) {
    return { category: 'Pest Control', subCategory: 'Extermination' };
  }
  
  return { category: 'General Maintenance', subCategory: 'Handyman' };
};

// Mock logic for urgency detection
const detectUrgency = async (text) => {
  const lowerText = text.toLowerCase();
  const emergencyKeywords = ['gas', 'leak', 'fire', 'spark', 'flood', 'urgent', 'immediately', 'broken pipe'];
  
  for (const word of emergencyKeywords) {
    if (lowerText.includes(word)) {
      return { isEmergency: true, reason: `Detected critical keyword: "${word}"` };
    }
  }
  
  return { isEmergency: false, reason: 'No critical keywords detected' };
};

// Mock logic for quote estimation
const estimateQuote = async (category, urgency) => {
  const baseRates = {
    'Plumbing': [150, 300],
    'Electrical': [200, 450],
    'Cleaning': [80, 150],
    'HVAC': [200, 500],
    'General Maintenance': [100, 250]
  };
  
  let [min, max] = baseRates[category] || [100, 300];
  
  // Surge pricing for emergencies
  if (urgency.isEmergency) {
    min = Math.floor(min * 1.5);
    max = Math.floor(max * 1.5);
  }
  
  return { min, max, currency: 'INR' };
};

// Main exposed function
exports.analyzeServiceRequest = async (freeText) => {
  const categoryInfo = await categorizeRequest(freeText);
  const urgencyInfo = await detectUrgency(freeText);
  const quoteEstimate = await estimateQuote(categoryInfo.category, urgencyInfo);
  
  return {
    ...categoryInfo,
    ...urgencyInfo,
    estimatedQuote: quoteEstimate,
    confidenceScore: 0.85 // Mock confidence
  };
};
