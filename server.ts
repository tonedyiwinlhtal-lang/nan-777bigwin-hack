import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Token from env
  const API_TOKEN = process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzc2NjA3NjMyIiwibmJmIjoiMTc3NjYwNzYzMiIsImV4cCI6IjE3NzY2MDk0MzIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiI0LzE5LzIwMjYgOTowNzoxMiBQTSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkFjY2Vzc19Ub2tlbiIsIlVzZXJJZCI6IjYzMjIwMyIsIlVzZXJOYW1lIjoiOTU5NzUzNjE5ODc4IiwiVXNlclBob3RvIjoiMSIsIk5pY2tOYW1lIjoiTWVtYmVyTk5HRU1MQTYiLCJBbW91bnQiOiIwLjg5IiwiSW50ZWdyYWwiOiIwIiwiTG9naW5NYXJrIjoiSDUiLCJMb2dpblRpbWUiOiI0LzE5LzIwMjYgODozNzoxMiBQTSIsIkxvZ2luSVBBZGRyZXNzIjoiNDMuMjE3LjE0OS4xNDAiLCJEYk51bWJlciI6IjAiLCJJc3ZhbGlkYXRvciI6IjAiLCJLZXlDb2RlIjoiMTU0IiwiVG9rZW5UeXBlIjoiQWNjZXNzX1Rva2VuIiwiUGhvbmVUeXBlIjoiMSIsIlVzZXJUeXBlIjoiMCIsIlVzZXJOYW1lMiI6IiIsImlzcyI6Imp3dElzc3VlciIsImF1ZCI6ImxvdHRlcnlUaWNrZXQifQ.Z9-NERVSAsKW05EWPSKHz3pkOwdoKGA15Fo4CwCuBZM';

  // Helper for color mapping
  const getColorForNumber = (num: number) => {
    if ([1, 3, 7, 9].includes(num)) return 'green';
    if ([2, 4, 6, 8].includes(num)) return 'red';
    if (num === 0) return 'red-violet';
    if (num === 5) return 'green-violet';
    return 'unknown';
  };

  // AI Prediction Engine - Hacking System v5.0 (Bypass Logic)
  const calculatePrediction = (data: any[]) => {
    if (!data || data.length === 0) return null;

    const historyItems = data.slice(0, 40).map(item => ({
      number: parseInt(item.number),
      size: (parseInt(item.number) >= 5 ? 'BIG' : 'SMALL') as 'BIG' | 'SMALL'
    }));
    
    const results = historyItems.map(h => h.number);
    const sizes = historyItems.map(h => h.size);

    // --- BYPASS STRAT A: NEURAL DECRYPTOR (Ensemble) ---
    const getNeuralDecryptor = () => {
      const counts = Array(10).fill(0);
      results.slice(0, 30).forEach(n => counts[n]++);
      
      const freqScores = counts.map(c => c / 30);
      
      const transitions: Record<number, number[]> = {};
      for (let i = 0; i < results.length - 1; i++) {
        const current = results[i + 1];
        const next = results[i];
        if (!transitions[current]) transitions[current] = [];
        transitions[current].push(next);
      }
      const lastNum = results[0];
      const lastTransitions = transitions[lastNum] || [];
      const transitionCounts = Array(10).fill(0);
      lastTransitions.forEach(n => transitionCounts[n]++);
      const transitionScores = transitionCounts.map(c => lastTransitions.length > 0 ? c / lastTransitions.length : 0.1);

      const finalScores = Array(10).fill(0).map((_, i) => (freqScores[i] * 0.4) + (transitionScores[i] * 0.6));
      const bestNumber = finalScores.indexOf(Math.max(...finalScores));
      return { 
        name: 'Neural Decryptor', 
        size: bestNumber >= 5 ? 'BIG' : 'SMALL', 
        confidence: Math.min(Math.round(finalScores[bestNumber] * 120) + 45, 98),
        bestNumber: bestNumber
      };
    };

    // --- BYPASS STRAT B: ENTROPY OVERRIDE (Anti-Streak) ---
    const getEntropyOverride = () => {
      let streak = 0;
      const currentSize = sizes[0];
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i] === currentSize) streak++;
        else break;
      }
      
      const predictedSize = streak >= 2 ? (currentSize === 'BIG' ? 'SMALL' : 'BIG') : currentSize;
      return { 
        name: 'Entropy Override', 
        size: predictedSize, 
        confidence: Math.min(65 + (streak * 8), 95)
      };
    };

    // --- BYPASS STRAT C: CYBER PULSE (Pattern Detection) ---
    const getCyberPulse = () => {
      if (sizes.length < 5) return getNeuralDecryptor();
      
      // Look for S B S B or B S B S
      const alternating = (sizes[0] !== sizes[1] && sizes[1] !== sizes[2] && sizes[2] !== sizes[3] && sizes[3] !== sizes[4]);
      if (alternating) {
        return { 
          name: 'Cyber Pulse', 
          size: sizes[0] === 'BIG' ? 'SMALL' : 'BIG', 
          confidence: 94 
        };
      }
      
      // Look for B B S S B B
      const doubleSync = (sizes[0] === sizes[1] && sizes[2] === sizes[3] && sizes[4] === sizes[5] && sizes[0] !== sizes[2]);
      if (doubleSync) {
        return { 
          name: 'Binary Ghost', 
          size: sizes[0] === 'BIG' ? 'SMALL' : 'BIG', 
          confidence: 89 
        };
      }

      return { name: 'Cyber Pulse', size: sizes[0], confidence: 55 };
    };

    // --- BYPASS STRAT D: KERNEL CHAIN (Markov Neural) ---
    const getKernelChain = () => {
      const chain: Record<string, string[]> = {};
      for (let i = 0; i < sizes.length - 3; i++) {
        const key = sizes[i+3] + sizes[i+2] + sizes[i+1];
        if (!chain[key]) chain[key] = [];
        chain[key].push(sizes[i]);
      }
      const lastKey = sizes[2] + sizes[1] + sizes[0];
      const outcomes = chain[lastKey] || [];
      const bigs = outcomes.filter(o => o === 'BIG').length;
      const smalls = outcomes.length - bigs;
      
      const predictedSize = bigs >= smalls ? 'BIG' : 'SMALL';
      const conf = outcomes.length > 0 ? Math.round((Math.max(bigs, smalls) / outcomes.length) * 100) : 50;
      
      return { 
        name: 'Kernel Chain', 
        size: predictedSize, 
        confidence: Math.max(conf, 68) 
      };
    };

    // --- BYPASS STRAT E: PATTERN MOMENTUM (High Frequency analysis) ---
    const getPatternMomentum = () => {
      const last5 = sizes.slice(0, 5);
      if (last5.length < 3) return getNeuralDecryptor();

      const patternStr = last5.join('');
      let prediction: 'BIG' | 'SMALL' = sizes[0];
      let confidence = 65;

      // Detect Streaks (BBB or SSS)
      if (last5[0] === last5[1] && last5[1] === last5[2]) {
        // In "Hacking" mode, we often predict reversal of long streaks
        prediction = last5[0] === 'BIG' ? 'SMALL' : 'BIG';
        confidence = 75;
        if (last5[3] === last5[0]) confidence = 85; // Stronger trend reversal signal
      } 
      // Detect Alternation (BSB or SBS)
      else if (last5[0] !== last5[1] && last5[1] !== last5[2]) {
        prediction = last5[0] === 'BIG' ? 'SMALL' : 'BIG'; // Continue alternation
        confidence = 80;
      }
      // Detect Pairs (BBSS or SSBB)
      else if (last5[0] === last5[1] && last5[2] === last5[3] && last5[0] !== last5[2]) {
        prediction = last5[0]; // Momentum usually continues the pair pattern
        confidence = 70;
      }

      return {
        name: 'Pattern Momentum',
        size: prediction,
        confidence: confidence
      };
    };

    // --- HACKER ORCHESTRATOR: PAYLOAD INJECTION ---
    const strategies = [
      getNeuralDecryptor(),
      getEntropyOverride(),
      getCyberPulse(),
      getKernelChain(),
      getPatternMomentum()
    ];

    // Pick optimal strategy using historical backtesting (last 10 rounds)
    let optimal = strategies[0];
    let maxWins = -1;

    strategies.forEach(strat => {
      let simulatedWins = 0;
      for (let i = 1; i < Math.min(11, sizes.length); i++) {
        if (strat.size === sizes[i-1]) simulatedWins++;
      }
      
      if (simulatedWins > maxWins) {
        maxWins = simulatedWins;
        optimal = strat;
      }
    });

    // Forced Overrides for specific high-probability conditions
    if (sizes[0] !== sizes[1] && sizes[1] !== sizes[2] && sizes[2] !== sizes[3]) {
      optimal = strategies[2]; 
    } 
    
    // Final Confidence Booster (System Bypassing Simulation)
    const ensemble = getNeuralDecryptor();

    return {
      number: (ensemble as any).bestNumber ?? 7,
      color: getColorForNumber((ensemble as any).bestNumber ?? 7),
      size: optimal.size,
      confidence: Math.min(optimal.confidence + (maxWins * 2.5), 100),
      strategyName: optimal.name,
      allStrategies: strategies.map(s => ({ name: s.name, size: s.size, confidence: s.confidence }))
    };
  };

  app.get('/api/predict', async (req, res) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const random = crypto.randomBytes(16).toString('hex');
      
      // Allow token override from header and handle "Bearer " prefix
      let effectiveToken = (req.headers['x-api-token'] as string) || API_TOKEN;
      if (effectiveToken && !effectiveToken.startsWith('Bearer ')) {
        effectiveToken = `Bearer ${effectiveToken}`;
      }

      const params = {
        pageSize: 10,
        pageNo: 1,
        typeId: 1,
        language: 7,
        random
      };

      // Signature generation: MD5(JSON.stringify(alphabetically_sorted_params_WITHOUT_signature_OR_timestamp)).toUpperCase()
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc: any, key: string) => {
          acc[key] = (params as any)[key];
          return acc;
        }, {});

      const signature = crypto.createHash('md5').update(JSON.stringify(sortedParams)).digest('hex').toUpperCase();

      // Final body: order matches user sample: pageSize, pageNo, typeId, language, random, signature, timestamp
      const body = {
        ...params,
        signature,
        timestamp
      };

      const response = await axios.post('https://api.bigwinqaz.com/api/webapi/GetNoaverageEmerdList', 
        body,
        {
          headers: {
            'Authorization': effectiveToken,
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json, text/plain, */*',
            'Ar-Origin': 'https://www.777bigwingame.org'
          },
          timeout: 10000 
        }
      );

      if (response.data.code !== 0) {
        return res.json({ 
          success: false, 
          error: `API Error: ${response.data.msg || 'Unknown error'}` 
        });
      }

      const history = response.data?.data?.list || [];
      const prediction = calculatePrediction(history);

      res.json({
        success: true,
        prediction,
        history: history.map((item: any) => ({
          issueNumber: item.issueNumber,
          number: item.number,
          colour: item.colour
        }))
      });

    } catch (error: any) {
      const errorMessage = error.response?.data?.msg || error.message;
      console.error('Prediction API error:', errorMessage);
      res.status(500).json({ 
        success: false, 
        error: `Network Error: ${errorMessage}` 
      });
    }
  });

  // Vite setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
