// Gemini AI Service for advanced CRM intelligence
export class GeminiAIService {
  private static readonly GEMINI_API_KEY = 'AIzaSyAeydv8I8RO9JCWMsEXmCvQ5jn6KFV-nDk';
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  private static async makeRequest(prompt: string, context?: any) {
    try {
      // Validate and clean prompt
      const cleanPrompt = prompt.trim().substring(0, 10000); // Limit to 10k characters
      
      if (!cleanPrompt) {
        throw new Error('Empty prompt provided');
      }

      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: cleanPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error details:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!result) {
        console.warn('Gemini API returned empty result');
        return 'AI analysis unavailable at the moment.';
      }
      
      return result;
    } catch (error) {
      console.error('Gemini AI request failed:', error);
      // Return fallback response instead of throwing
      return 'AI analysis is temporarily unavailable. Please try again later.';
    }
  }

  // Generate intelligent deal insights with advanced AI analysis
  static async generateDealInsights(deal: any) {
    const prompt = `
As a senior sales AI analyst specializing in East African markets, analyze this CRM deal comprehensively:

Deal Information:
- Title: ${deal.title}
- Value: ${deal.expected_value} UGX
- Stage: ${deal.stage_name}
- Probability: ${deal.probability}%
- Contact: ${deal.contact?.name}
- Company: ${deal.contact?.company}
- Temperature: ${deal.deal_temperature}
- Priority: ${deal.priority}
- Source: ${deal.source}
- Last Activity: ${deal.last_activity}
- Last Activity: ${deal.last_activity}
- Temperature: ${deal.deal_temperature}

Please provide:
1. Risk Assessment (1-10 scale with reasoning)
2. Win Probability Analysis (adjusted percentage with factors)
3. Top 3 Recommended Actions
4. Timeline Prediction
5. Key Success Factors

Format as JSON with these exact keys: riskScore, adjustedProbability, recommendedActions, timelinePrediction, successFactors
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to generate deal insights:', error);
      return null;
    }
  }

  // Generate email templates for automation
  static async generateEmailTemplate(context: {
    dealTitle: string;
    contactName: string;
    company: string;
    stage: string;
    emailType: 'welcome' | 'follow_up' | 'proposal' | 'negotiation' | 're_engagement';
  }) {
    const prompt = `
Generate a professional, personalized email for CRM automation:

Context:
- Deal: ${context.dealTitle}
- Contact: ${context.contactName}
- Company: ${context.company}
- Current Stage: ${context.stage}
- Email Type: ${context.emailType}

Requirements:
- Professional but conversational tone
- Personalized to the contact and company
- Clear call-to-action
- Appropriate for the deal stage
- 150-250 words
- Include subject line

Format as JSON with keys: subject, body
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to generate email template:', error);
      return null;
    }
  }

  // Analyze pipeline performance and generate recommendations
  static async analyzePipelinePerformance(pipelineData: {
    totalDeals: number;
    totalValue: number;
    conversionRate: number;
    averageDealsSize: number;
    stageAnalytics: any[];
  }) {
    const prompt = `
As a CRM performance analyst, analyze this sales pipeline data and provide strategic recommendations:

Pipeline Metrics:
- Total Deals: ${pipelineData.totalDeals}
- Total Value: $${pipelineData.totalValue}
- Conversion Rate: ${pipelineData.conversionRate}%
- Average Deal Size: $${pipelineData.averageDealsSize}

Stage Performance:
${pipelineData.stageAnalytics.map(stage => 
  `- ${stage.stage_name}: ${stage.deal_count} deals, ${stage.conversion_rate}% conversion, ${stage.average_time_in_stage} days avg`
).join('\n')}

Provide:
1. Overall Performance Grade (A-F with reasoning)
2. Top 3 Bottlenecks Identified
3. 5 Actionable Improvement Strategies
4. Predicted Impact of Improvements
5. Priority Actions for Next 30 Days

Format as JSON with keys: performanceGrade, bottlenecks, improvementStrategies, predictedImpact, priorityActions
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to analyze pipeline performance:', error);
      return null;
    }
  }

  // Generate smart automation rules based on patterns
  static async generateAutomationRule(pattern: {
    trigger: string;
    dealStage: string;
    dealValue: number;
    successRate: number;
    commonOutcomes: string[];
  }) {
    const prompt = `
As an automation expert, create a smart CRM automation rule based on this pattern:

Pattern Analysis:
- Trigger Event: ${pattern.trigger}
- Deal Stage: ${pattern.dealStage}
- Average Deal Value: $${pattern.dealValue}
- Historical Success Rate: ${pattern.successRate}%
- Common Outcomes: ${pattern.commonOutcomes.join(', ')}

Design an automation rule with:
1. Rule Name (descriptive)
2. Rule Description (clear purpose)
3. Trigger Conditions (specific criteria)
4. Automated Actions (up to 3 actions)
5. Success Metrics (measurable outcomes)
6. Expected ROI Impact

Format as JSON with keys: ruleName, description, triggerConditions, automatedActions, successMetrics, expectedROI
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to generate automation rule:', error);
      return null;
    }
  }

  // Generate personalized sales coaching
  static async generateSalesCoaching(salesPerson: {
    name: string;
    dealsWon: number;
    dealsLost: number;
    averageDealSize: number;
    winRate: number;
    strongPoints: string[];
    challenges: string[];
  }) {
    const prompt = `
Provide personalized sales coaching for this team member:

Sales Performance:
- Name: ${salesPerson.name}
- Deals Won: ${salesPerson.dealsWon}
- Deals Lost: ${salesPerson.dealsLost}
- Average Deal Size: $${salesPerson.averageDealSize}
- Win Rate: ${salesPerson.winRate}%
- Strong Points: ${salesPerson.strongPoints.join(', ')}
- Challenges: ${salesPerson.challenges.join(', ')}

Provide:
1. Performance Summary (positive, constructive)
2. Skill Development Areas (top 3)
3. Specific Training Recommendations
4. Goal Setting for Next Quarter
5. Motivational Message

Format as JSON with keys: performanceSummary, skillDevelopmentAreas, trainingRecommendations, quarterlyGoals, motivationalMessage
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to generate sales coaching:', error);
      return null;
    }
  }

  // Generate market insights and competitive analysis
  static async generateMarketInsights(industry: string, competitors: string[], recentDeals: any[]) {
    const prompt = `
Provide market intelligence and competitive insights for CRM strategy:

Industry: ${industry}
Main Competitors: ${competitors.join(', ')}

Recent Deal Patterns:
${recentDeals.map(deal => `- ${deal.title}: $${deal.value} (${deal.outcome})`).join('\n')}

Analyze and provide:
1. Market Trends Affecting Sales
2. Competitive Positioning Insights
3. Pricing Strategy Recommendations
4. Target Customer Profile Updates
5. Sales Strategy Adjustments

Format as JSON with keys: marketTrends, competitiveInsights, pricingStrategy, targetCustomers, strategyAdjustments
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to generate market insights:', error);
      return null;
    }
  }

  // AI Deal Scoring Engine
  static async calculateAIDealScore(dealData: any, historicalData?: any[]) {
    const prompt = `
As an AI sales expert for East African markets, calculate comprehensive deal scores:

Current Deal:
${JSON.stringify(dealData, null, 2)}

Historical Performance Context:
${historicalData ? JSON.stringify(historicalData.slice(0, 5), null, 2) : 'No historical data available'}

Calculate detailed scores (0-100) for:
1. Overall Deal Health Score
2. Win Probability Score  
3. Value Realization Score
4. Timeline Feasibility Score
5. Contact Engagement Score
6. Competition Risk Score
7. Budget Authority Score
8. Cultural Fit Score (East African context)

Consider: Uganda business culture, payment cycles, decision-making patterns, seasonal trends.

Format as JSON: {
  "overallScore": number,
  "winProbability": number, 
  "valueScore": number,
  "timelineScore": number,
  "engagementScore": number,
  "competitionRisk": number,
  "budgetAuthority": number,
  "culturalFit": number,
  "reasoning": "detailed explanation",
  "recommendations": ["action1", "action2", "action3"]
}
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to calculate AI deal score:', error);
      return null;
    }
  }

  // AI Pipeline Forecasting
  static async generatePipelineForecast(pipelineData: any[], timeframe: string = '3 months') {
    const prompt = `
Analyze this pipeline data and generate accurate forecasts for ${timeframe}:

Pipeline Data:
${JSON.stringify(pipelineData.slice(0, 20), null, 2)}

Generate comprehensive forecast:
1. Revenue Forecast (monthly breakdown)
2. Deal Closure Predictions by stage
3. Pipeline Velocity Analysis
4. Seasonal Impact (Uganda business cycles)
5. Risk-Adjusted Projections
6. Resource Allocation Needs
7. Market Opportunity Gaps
8. Strategic Recommendations

Consider: Ugandan holidays, economic cycles, industry patterns, cultural factors.

Format as JSON: {
  "totalForecast": number,
  "monthlyBreakdown": [{"month": "string", "revenue": number, "deals": number}],
  "stageAnalysis": [{"stage": "string", "probability": number, "timeline": "string"}],
  "risks": ["risk1", "risk2"],
  "opportunities": ["opp1", "opp2"],
  "recommendations": ["rec1", "rec2", "rec3"]
}
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to generate pipeline forecast:', error);
      return null;
    }
  }

  // AI-Powered Lead Qualification
  static async qualifyLead(leadData: any) {
    const prompt = `
Qualify this lead using AI analysis for East African B2B sales:

Lead Data:
${JSON.stringify(leadData, null, 2)}

Analyze using BANT+ framework:
- Budget: Financial capacity assessment
- Authority: Decision-making power
- Need: Problem severity and urgency  
- Timeline: Purchase timeline reality
- Cultural Fit: East African business alignment
- Competition: Competitive landscape position

Rate each factor (1-10) and provide overall qualification score.

Format as JSON: {
  "budget": {"score": number, "notes": "string"},
  "authority": {"score": number, "notes": "string"},
  "need": {"score": number, "notes": "string"},
  "timeline": {"score": number, "notes": "string"},
  "culturalFit": {"score": number, "notes": "string"},
  "competitivePosition": {"score": number, "notes": "string"},
  "overallScore": number,
  "qualification": "Hot|Warm|Cold",
  "nextActions": ["action1", "action2"],
  "concerns": ["concern1", "concern2"]
}
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to qualify lead:', error);
      return null;
    }
  }

  // AI Deal Risk Assessment
  static async assessDealRisk(dealData: any, competitorInfo?: any[]) {
    const prompt = `
Perform comprehensive risk assessment for this deal:

Deal Information:
${JSON.stringify(dealData, null, 2)}

Competitor Intelligence:
${competitorInfo ? JSON.stringify(competitorInfo, null, 2) : 'No competitor data available'}

Assess risks in:
1. Financial/Budget risks
2. Timeline/Urgency risks  
3. Competition threats
4. Stakeholder/Authority risks
5. Technical/Implementation risks
6. Cultural/Market risks (East Africa specific)
7. Economic/External risks

Rate each risk (Low/Medium/High) with mitigation strategies.

Format as JSON: {
  "overallRisk": "Low|Medium|High",
  "riskFactors": [
    {
      "category": "string",
      "level": "Low|Medium|High", 
      "description": "string",
      "impact": "string",
      "mitigation": "string"
    }
  ],
  "criticalActions": ["action1", "action2"],
  "monitoringPoints": ["point1", "point2"]
}
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to assess deal risk:', error);
      return null;
    }
  }

  // AI Communication Optimizer
  static async optimizeCommunication(dealData: any, communicationType: 'email' | 'call' | 'meeting') {
    const prompt = `
Generate optimized communication strategy for this deal:

Deal Context:
${JSON.stringify(dealData, null, 2)}

Communication Type: ${communicationType}

Consider East African business culture:
- Relationship-building importance
- Hierarchy respect
- Religious considerations  
- Local language nuances
- Business etiquette

Provide:
1. Optimal timing recommendations
2. Cultural considerations
3. Key message framework
4. Tone and approach
5. Follow-up strategy
6. Success metrics

Format as JSON: {
  "timing": {
    "bestDays": ["day1", "day2"],
    "bestTimes": "string",
    "culturalConsiderations": "string"
  },
  "messaging": {
    "primaryMessage": "string",
    "keyPoints": ["point1", "point2"],
    "tone": "string",
    "culturalAdaptations": "string"
  },
  "followUp": {
    "timeline": "string", 
    "method": "string",
    "checkpoints": ["check1", "check2"]
  }
}
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to optimize communication:', error);
      return null;
    }
  }

  // AI Competitive Intelligence
  static async analyzeCompetition(dealData: any, competitorData?: any[]) {
    const prompt = `
Analyze competitive landscape for this deal:

Our Deal:
${JSON.stringify(dealData, null, 2)}

Known Competitors:
${competitorData ? JSON.stringify(competitorData, null, 2) : 'No competitor data available'}

Provide competitive analysis:
1. Competitive positioning
2. Our strengths vs competitors
3. Potential threats
4. Differentiation opportunities
5. Pricing strategy recommendations
6. Win themes to emphasize
7. Competitor weaknesses to exploit

Format as JSON: {
  "competitivePosition": "Strong|Moderate|Weak",
  "ourStrengths": ["strength1", "strength2"],
  "threats": ["threat1", "threat2"],
  "opportunities": ["opp1", "opp2"],
  "winThemes": ["theme1", "theme2"],
  "competitorWeaknesses": ["weakness1", "weakness2"],
  "recommendations": ["rec1", "rec2"]
}
    `;

    try {
      const response = await this.makeRequest(prompt);
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Failed to analyze competition:', error);
      return null;
    }
  }
}