/**
 * React Hook for Gemini AI Integration
 */

import { useState, useEffect, useCallback } from 'react';
import { geminiAI } from '../lib/geminiAI';

interface UseGeminiAIOptions {
  autoRun?: boolean;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
}

interface AIState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for generating AI predictions
 */
export function useAIPredictions(
  contacts: any[],
  options: UseGeminiAIOptions = {}
): AIState<any> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPredictions = useCallback(async () => {
    if (!contacts || contacts.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const predictions = await geminiAI.generatePredictions(contacts);
      setData(predictions);
      
      // Cache if key provided
      if (options.cacheKey) {
        const cacheData = {
          data: predictions,
          timestamp: Date.now(),
        };
        localStorage.setItem(options.cacheKey, JSON.stringify(cacheData));
      }
    } catch (err) {
      setError(err as Error);
      console.error('AI Predictions Error:', err);
    } finally {
      setLoading(false);
    }
  }, [contacts, options.cacheKey]);

  useEffect(() => {
    // Check cache first
    if (options.cacheKey) {
      const cached = localStorage.getItem(options.cacheKey);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const duration = options.cacheDuration || 3600000; // 1 hour default
          
          if (Date.now() - timestamp < duration) {
            setData(cachedData);
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }
    }

    if (options.autoRun !== false) {
      fetchPredictions();
    }
  }, [fetchPredictions, options.autoRun, options.cacheKey, options.cacheDuration]);

  return { data, loading, error, refetch: fetchPredictions };
}

/**
 * Hook for generating AI recommendations
 */
export function useAIRecommendations(
  contacts: any[],
  analytics: any,
  options: UseGeminiAIOptions = {}
): AIState<any[]> {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!contacts || contacts.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const recommendations = await geminiAI.generateRecommendations(contacts, analytics);
      setData(recommendations);
      
      if (options.cacheKey) {
        const cacheData = {
          data: recommendations,
          timestamp: Date.now(),
        };
        localStorage.setItem(options.cacheKey, JSON.stringify(cacheData));
      }
    } catch (err) {
      setError(err as Error);
      console.error('AI Recommendations Error:', err);
    } finally {
      setLoading(false);
    }
  }, [contacts, analytics, options.cacheKey]);

  useEffect(() => {
    if (options.cacheKey) {
      const cached = localStorage.getItem(options.cacheKey);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const duration = options.cacheDuration || 3600000;
          
          if (Date.now() - timestamp < duration) {
            setData(cachedData);
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }
    }

    if (options.autoRun !== false) {
      fetchRecommendations();
    }
  }, [fetchRecommendations, options.autoRun, options.cacheKey, options.cacheDuration]);

  return { data, loading, error, refetch: fetchRecommendations };
}

/**
 * Hook for generating AI segmentation
 */
export function useAISegmentation(
  contacts: any[],
  options: UseGeminiAIOptions = {}
): AIState<any> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSegmentation = useCallback(async () => {
    if (!contacts || contacts.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const segmentation = await geminiAI.generateSegmentation(contacts);
      setData(segmentation);
      
      if (options.cacheKey) {
        const cacheData = {
          data: segmentation,
          timestamp: Date.now(),
        };
        localStorage.setItem(options.cacheKey, JSON.stringify(cacheData));
      }
    } catch (err) {
      setError(err as Error);
      console.error('AI Segmentation Error:', err);
    } finally {
      setLoading(false);
    }
  }, [contacts, options.cacheKey]);

  useEffect(() => {
    if (options.cacheKey) {
      const cached = localStorage.getItem(options.cacheKey);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const duration = options.cacheDuration || 3600000;
          
          if (Date.now() - timestamp < duration) {
            setData(cachedData);
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }
    }

    if (options.autoRun !== false) {
      fetchSegmentation();
    }
  }, [fetchSegmentation, options.autoRun, options.cacheKey, options.cacheDuration]);

  return { data, loading, error, refetch: fetchSegmentation };
}

/**
 * Hook for generating natural language insights
 */
export function useNLInsights(
  contacts: any[],
  analytics: any,
  options: UseGeminiAIOptions = {}
): AIState<any> {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!contacts || contacts.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const insights = await geminiAI.generateNLInsights(contacts, analytics);
      setData(insights);
      
      if (options.cacheKey) {
        const cacheData = {
          data: insights,
          timestamp: Date.now(),
        };
        localStorage.setItem(options.cacheKey, JSON.stringify(cacheData));
      }
    } catch (err) {
      setError(err as Error);
      console.error('NL Insights Error:', err);
    } finally {
      setLoading(false);
    }
  }, [contacts, analytics, options.cacheKey]);

  useEffect(() => {
    if (options.cacheKey) {
      const cached = localStorage.getItem(options.cacheKey);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const duration = options.cacheDuration || 1800000; // 30 minutes for NL insights
          
          if (Date.now() - timestamp < duration) {
            setData(cachedData);
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }
    }

    if (options.autoRun !== false) {
      fetchInsights();
    }
  }, [fetchInsights, options.autoRun, options.cacheKey, options.cacheDuration]);

  return { data, loading, error, refetch: fetchInsights };
}

/**
 * Hook for detecting anomalies
 */
export function useAIAnomalies(
  contacts: any[],
  options: UseGeminiAIOptions = {}
): AIState<any[]> {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnomalies = useCallback(async () => {
    if (!contacts || contacts.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const anomalies = await geminiAI.detectAnomalies(contacts);
      setData(anomalies);
      
      if (options.cacheKey) {
        const cacheData = {
          data: anomalies,
          timestamp: Date.now(),
        };
        localStorage.setItem(options.cacheKey, JSON.stringify(cacheData));
      }
    } catch (err) {
      setError(err as Error);
      console.error('AI Anomalies Error:', err);
    } finally {
      setLoading(false);
    }
  }, [contacts, options.cacheKey]);

  useEffect(() => {
    if (options.cacheKey) {
      const cached = localStorage.getItem(options.cacheKey);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const duration = options.cacheDuration || 1800000; // 30 minutes
          
          if (Date.now() - timestamp < duration) {
            setData(cachedData);
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }
    }

    if (options.autoRun !== false) {
      fetchAnomalies();
    }
  }, [fetchAnomalies, options.autoRun, options.cacheKey, options.cacheDuration]);

  return { data, loading, error, refetch: fetchAnomalies };
}
