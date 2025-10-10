/**
 * Gemini AI Service
 * Real AI-powered insights using Google's Gemini 2.0 Flash
 * API: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
 */

const GEMINI_API_KEY = 'AIzaSyCXWTToQeXV_TQ7q5JtwaSSvPyJVX7Hg7c';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
}

export class GeminiAIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.apiUrl = GEMINI_API_URL;
  }

  /**
   * Generate AI insights from contact data
   */
  async generateInsights(contacts: any[], analyticsData?: any): Promise<string> {
    const prompt = this.buildInsightsPrompt(contacts, analyticsData);
    return await this.callGemini(prompt);
  }

  /**
   * Generate predictive analytics
   */
  async generatePredictions(contacts: any[], historicalData?: any): Promise<any> {
    const prompt = `
Analyze this Ugandan CRM data and provide AI-powered predictions in JSON format:

Contact Data Summary:
- Total Contacts: ${contacts.length}
- Verified Mobile Money: ${contacts.filter((c: any) => c.mobile_money_verified).length}
- Average Trust Level: ${(contacts.reduce((sum: number, c: any) => sum + (c.trust_level || 0), 0) / contacts.length).toFixed(1)}
- High Trust (8+): ${contacts.filter((c: any) => c.trust_level >= 8).length}
- Low Trust (≤3): ${contacts.filter((c: any) => c.trust_level <= 3).length}
- WhatsApp Users: ${contacts.filter((c: any) => c.preferred_channel === 'whatsapp').length}
- Community Members: ${contacts.filter((c: any) => c.community_group_role).length}

Uganda Market Context:
- Currency: UGX (Ugandan Shillings)
- Mobile Money Providers: MTN, Airtel, Africell
- Average Transaction: UGX 50,000 - 200,000
- Customer Lifetime Value: UGX 500,000 - 2,000,000

Provide predictions for:
1. Next month growth rate (%)
2. Quarterly revenue projection (UGX)
3. Churn risk percentage
4. Opportunity score (0-100)
5. Top 3 actionable recommendations
6. Revenue potential by segment (UGX)

Return ONLY a valid JSON object with these keys: growthRate, quarterlyRevenue, churnRisk, opportunityScore, recommendations (array), segmentRevenue (object).
`;

    const response = await this.callGemini(prompt, { temperature: 0.3 });
    return this.parseJSONResponse(response);
  }

  /**
   * Generate smart recommendations
   */
  async generateRecommendations(contacts: any[], analytics: any): Promise<any[]> {
    const prompt = `
You are a CRM strategy expert for the Ugandan market. Analyze this data and generate 5-8 high-impact, actionable recommendations.

Contact Metrics:
- Total: ${contacts.length}
- Mobile Money Verified: ${contacts.filter((c: any) => c.mobile_money_verified).length} (${((contacts.filter((c: any) => c.mobile_money_verified).length / contacts.length) * 100).toFixed(1)}%)
- Trust Distribution: High(${contacts.filter((c: any) => c.trust_level >= 8).length}), Medium(${contacts.filter((c: any) => c.trust_level >= 5 && c.trust_level < 8).length}), Low(${contacts.filter((c: any) => c.trust_level < 5).length})
- WhatsApp Preference: ${((contacts.filter((c: any) => c.preferred_channel === 'whatsapp').length / contacts.length) * 100).toFixed(1)}%
- Community Groups: ${contacts.filter((c: any) => c.community_group_role).length}

Uganda Market Insights:
- Mobile Money penetration: 60%+ nationally
- WhatsApp usage: 80%+ for business communication
- Community/SACCO culture: Strong
- Average CLV: UGX 1,500,000

Generate recommendations as a JSON array with this structure for each:
{
  "id": "unique-id",
  "title": "Action title with emoji",
  "description": "Detailed description (Uganda-specific)",
  "impact": "high|medium|low",
  "effort": "high|medium|low",
  "category": "revenue|engagement|efficiency|growth|retention",
  "estimatedValue": "UGX amount or metric",
  "timeframe": "e.g., 1-2 weeks",
  "priority": 1-10,
  "actionItems": ["step 1", "step 2", "step 3", "step 4"]
}

Return ONLY a valid JSON array of 5-8 recommendations, prioritized by ROI for Ugandan market.
`;

    const response = await this.callGemini(prompt, { temperature: 0.7 });
    return this.parseJSONResponse(response);
  }

  /**
   * Generate customer segmentation analysis
   */
  async generateSegmentation(contacts: any[]): Promise<any> {
    const prompt = `
Perform AI-powered customer segmentation analysis for Ugandan market using RFM principles and local behavioral patterns.

Data:
${JSON.stringify(contacts.slice(0, 50).map((c: any) => ({
  trust_level: c.trust_level,
  mobile_money_verified: c.mobile_money_verified,
  preferred_channel: c.preferred_channel,
  community_group_role: c.community_group_role,
  district: c.district
})), null, 2)}

Total contacts: ${contacts.length}

Create segments based on:
1. Trust & Engagement (Champions, Loyals, Potential, At-Risk, Needs Attention)
2. Behavioral Clusters (Mobile-First, Community Leaders, Price Sensitive, Early Adopters, Passive)
3. Regional patterns (Kampala vs Regions)
4. Mobile Money adoption stages

Return JSON with:
{
  "rfmSegments": [{"segment": "name", "count": number, "avgValue": UGX, "characteristics": [...]}],
  "behaviorClusters": [{"name": "...", "count": number, "traits": [...], "recommendations": [...]}],
  "insights": ["key finding 1", "key finding 2", ...]
}
`;

    const response = await this.callGemini(prompt, { temperature: 0.5 });
    return this.parseJSONResponse(response);
  }

  /**
   * Generate natural language insights summary
   */
  async generateNLInsights(contacts: any[], analytics: any): Promise<any> {
    const prompt = `
You are a business intelligence analyst for a Ugandan CRM. Generate comprehensive, human-readable insights in plain English.

Current State:
- Total Contacts: ${contacts.length}
- Verified: ${contacts.filter((c: any) => c.mobile_money_verified).length}
- Champions (trust 8+): ${contacts.filter((c: any) => c.trust_level >= 8).length}
- At Risk (trust ≤3): ${contacts.filter((c: any) => c.trust_level <= 3).length}
- WhatsApp Users: ${contacts.filter((c: any) => c.preferred_channel === 'whatsapp').length}
- Avg Trust: ${(contacts.reduce((sum: number, c: any) => sum + (c.trust_level || 0), 0) / contacts.length).toFixed(1)}/10

Generate:
1. Executive summary (2-3 sentences)
2. What's working great (3-4 bullet points)
3. Growth opportunities (3-4 bullet points)
4. Warnings/risks (2-3 bullet points)
5. Predictive intelligence (3-4 future-focused insights)
6. Action priorities (3 categories: Do First, Do Next, Plan For)

Return JSON with structure:
{
  "executiveSummary": "...",
  "healthScore": 0-100,
  "healthStatus": "Excellent|Good|Fair|Needs Improvement",
  "successes": ["..."],
  "opportunities": ["..."],
  "warnings": ["..."],
  "predictions": ["..."],
  "priorities": {
    "doFirst": ["..."],
    "doNext": ["..."],
    "planFor": ["..."]
  }
}

Use Ugandan context (UGX, local mobile money providers, community culture).
`;

    const response = await this.callGemini(prompt, { temperature: 0.6 });
    return this.parseJSONResponse(response);
  }

  /**
   * Detect anomalies in CRM data
   */
  async detectAnomalies(contacts: any[], historicalMetrics?: any): Promise<any[]> {
    const prompt = `
Analyze this Ugandan CRM data for anomalies, unusual patterns, or opportunities.

Current Metrics:
- Total Contacts: ${contacts.length}
- Verification Rate: ${((contacts.filter((c: any) => c.mobile_money_verified).length / contacts.length) * 100).toFixed(1)}%
- Low Trust %: ${((contacts.filter((c: any) => c.trust_level <= 3).length / contacts.length) * 100).toFixed(1)}%
- WhatsApp Adoption: ${((contacts.filter((c: any) => c.preferred_channel === 'whatsapp').length / contacts.length) * 100).toFixed(1)}%

Detect:
1. Unusual concentration/distribution patterns
2. Risk indicators (high churn signals)
3. Untapped opportunities
4. Performance anomalies vs Uganda market benchmarks

Return JSON array of anomalies:
[{
  "title": "Anomaly title with emoji",
  "description": "Detailed explanation",
  "severity": "high|medium|low",
  "recommendation": "Specific action to take",
  "impact": "Potential UGX impact or metric",
  "type": "risk|opportunity|warning"
}]

Benchmark against:
- Mobile Money verification: 65% is healthy
- Trust score: 6.5+ is good
- WhatsApp usage: 70%+ is optimal
- Churn risk: <10% is healthy
`;

    const response = await this.callGemini(prompt, { temperature: 0.4 });
    return this.parseJSONResponse(response);
  }

  /**
   * Build insights prompt
   */
  private buildInsightsPrompt(contacts: any[], analytics?: any): string {
    return `
Analyze this Ugandan CRM data and provide actionable business insights:

Contact Summary:
- Total: ${contacts.length}
- Mobile Money Verified: ${contacts.filter((c: any) => c.mobile_money_verified).length}
- Average Trust Level: ${(contacts.reduce((sum: number, c: any) => sum + (c.trust_level || 0), 0) / contacts.length).toFixed(1)}
- WhatsApp Preferred: ${contacts.filter((c: any) => c.preferred_channel === 'whatsapp').length}
- Community Members: ${contacts.filter((c: any) => c.community_group_role).length}

Provide:
1. Top 3 strengths
2. Top 3 opportunities
3. Top 2 risks
4. 3 immediate action items

Focus on Ugandan market context (mobile money, WhatsApp, community groups, UGX currency).
`;
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string, config?: any): Promise<string> {
    try {
      const requestBody: GeminiRequest = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: config?.temperature || 0.7,
          topK: config?.topK || 40,
          topP: config?.topP || 0.95,
          maxOutputTokens: config?.maxOutputTokens || 8192,
        }
      };

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Parse JSON response from AI
   */
  private parseJSONResponse(response: string): any {
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', response);
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Failed to extract JSON from response');
        }
      }
      throw new Error('Failed to parse AI response');
    }
  }
}

// Singleton instance
export const geminiAI = new GeminiAIService();
