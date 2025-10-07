// Gemini AI Service for advanced CRM intelligence
export class GeminiAIService {
  private static readonly GEMINI_API_KEY = 'AIzaSyCyq2H6_TtkP8lIxc095KwuJ8lNr-BHh8M';
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  private static async makeRequest(prompt: string, context?: any) {
    try {
      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Gemini AI request failed:', error);
      throw error;
    }
  }

  // Generate intelligent deal insights
  static async generateDealInsights(deal: any) {
    const prompt = `
As a senior sales AI analyst, analyze this CRM deal and provide actionable insights:

Deal Information:
- Title: ${deal.title}
- Value: $${deal.expected_value}
- Stage: ${deal.stage_name}
- Probability: ${deal.probability}%
- Contact: ${deal.contact?.name}
- Company: ${deal.contact?.company}
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
}