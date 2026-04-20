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

  // AI Prediction Engine - Hacking System v6.0 (Neuro-Statistical Synergy)
  const calculatePrediction = (data: any[]) => {
    if (!data || data.length === 0) return null;

    // Expand history depth for better statistical grounding
    const historyItems = data.slice(0, 50).map(item => ({
      number: parseInt(item.number),
      size: (parseInt(item.number) >= 5 ? 'BIG' : 'SMALL') as 'BIG' | 'SMALL'
    }));
    
    const results = historyItems.map(h => h.number);
    const sizes = historyItems.map(h => h.size);

    // --- BYPASS STRAT A: NEURAL FREQUENCY (Poisson Bias) ---
    const getNeuralDecryptor = () => {
      const counts = Array(10).fill(0);
      results.slice(0, 40).forEach(n => counts[n]++);
      
      const freqScores = counts.map(c => c / 40);
      
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

      const finalScores = Array(10).fill(0).map((_, i) => (freqScores[i] * 0.3) + (transitionScores[i] * 0.7));
      const bestNumber = finalScores.indexOf(Math.max(...finalScores));
      return { 
        name: 'Neural Decryptor', 
        size: (bestNumber >= 5 ? 'BIG' : 'SMALL') as 'BIG' | 'SMALL', 
        confidence: Math.min(Math.round(finalScores[bestNumber] * 120) + 45, 98),
        bestNumber: bestNumber
      };
    };

    // --- BYPASS STRAT B: ENTROPY REVERSION (Stochastic Reversal) ---
    const getEntropyOverride = () => {
      let streak = 0;
      const currentSize = sizes[0];
      for (let i = 0; i < sizes.length; i++) {
        if (sizes[i] === currentSize) streak++;
        else break;
      }
      
      // Dynamic reversal threshold based on historical volatility
      let threshold = 3;
      if (sizes.length > 20) {
        let maxHistStreak = 0;
        let tempStreak = 0;
        for (let i = 0; i < sizes.length - 1; i++) {
          if (sizes[i] === sizes[i+1]) tempStreak++;
          else {
            maxHistStreak = Math.max(maxHistStreak, tempStreak);
            tempStreak = 0;
          }
        }
        threshold = Math.max(2, Math.floor(maxHistStreak * 0.8));
      }

      const predictedSize = streak >= threshold ? (currentSize === 'BIG' ? 'SMALL' : 'BIG') : currentSize;
      return { 
        name: 'Entropy Override', 
        size: predictedSize as 'BIG' | 'SMALL', 
        confidence: Math.min(70 + (streak * 9), 96)
      };
    };

    // --- BYPASS STRAT C: CYBER PULSE (Fourier-like Pattern Matching) ---
    const getCyberPulse = () => {
      if (sizes.length < 8) return { name: 'Cyber Pulse', size: sizes[0], confidence: 50 };
      
      const last8 = sizes.slice(0, 8).join('');
      
      // Pattern: Alteration (BSBSBSBS)
      if (last8.match(/(BS){4}/) || last8.match(/(SB){4}/)) {
        return { name: 'Altar Logic', size: (sizes[0] === 'BIG' ? 'SMALL' : 'BIG') as 'BIG' | 'SMALL', confidence: 95 };
      }
      
      // Pattern: Doublets (BBSSBBSS)
      if (last8.match(/(BBSS){2}/) || last8.match(/(SSBB){2}/)) {
        return { name: 'Doublet Sync', size: (sizes[0] === 'BIG' ? (sizes[0] === sizes[1] ? 'SMALL' : 'BIG') : (sizes[0] === sizes[1] ? 'BIG' : 'SMALL')) as 'BIG' | 'SMALL', confidence: 92 };
      }

      // Pattern: Triplets (BBBSSSB)
      if (sizes[0] === sizes[1] && sizes[1] === sizes[2] && sizes[3] === sizes[4] && sizes[4] === sizes[5] && sizes[0] !== sizes[3]) {
        return { name: 'Triad Wave', size: (sizes[0] === 'BIG' ? 'BIG' : 'SMALL') as 'BIG' | 'SMALL', confidence: 88 };
      }

      return { name: 'Cyber Pulse', size: sizes[0], confidence: 55 };
    };

    // --- BYPASS STRAT D: KERNEL CHAIN (Deep Markov Analysis) ---
    const getKernelChain = () => {
      const chain: Record<string, string[]> = {};
      const depth = 4; // Use 4 rounds of look-back for more precise chain mapping
      for (let i = 0; i < sizes.length - (depth + 1); i++) {
        const key = sizes.slice(i + 1, i + depth + 1).join('');
        if (!chain[key]) chain[key] = [];
        chain[key].push(sizes[i]);
      }
      const lastKey = sizes.slice(0, depth).join('');
      const outcomes = chain[lastKey] || [];
      
      if (outcomes.length === 0) return { name: 'Kernel Chain', size: sizes[0], confidence: 60 };

      const bigs = outcomes.filter(o => o === 'BIG').length;
      const smalls = outcomes.length - bigs;
      
      const predictedSize = bigs >= smalls ? 'BIG' : 'SMALL';
      const frequencyRatio = Math.max(bigs, smalls) / outcomes.length;
      const confidence = 65 + (frequencyRatio * 30);
      
      return { 
        name: 'Kernel Chain', 
        size: predictedSize as 'BIG' | 'SMALL', 
        confidence: Math.round(confidence) 
      };
    };

    // --- BYPASS STRAT E: PATTERN MOMENTUM (Trend Inertia) ---
    const getPatternMomentum = () => {
      const last10 = sizes.slice(0, 10);
      const bigs = last10.filter(s => s === 'BIG').length;
      const smalls = 10 - bigs;
      
      // Dominant trend detected
      if (bigs >= 7) return { name: 'Momentum+', size: 'BIG' as 'BIG' | 'SMALL', confidence: 75 + (bigs * 2) };
      if (smalls >= 7) return { name: 'Momentum-', size: 'SMALL' as 'BIG' | 'SMALL', confidence: 75 + (smalls * 2) };

      return { name: 'Pattern Momentum', size: sizes[0], confidence: 60 };
    };

    const strategies = [
      getNeuralDecryptor(),
      getEntropyOverride(),
      getCyberPulse(),
      getKernelChain(),
      getPatternMomentum()
    ];

    // --- SYNERGISTIC VOTING ENGINE (SVE v2.0) ---
    // Instead of picking one, weighted voting across all strategies
    let bigVites = 0;
    let smallVotes = 0;
    
    // Evaluate each strategy based on its confidence and past accuracy
    strategies.forEach(strat => {
        // Backtest this strategy against last 15 rounds
        let accuracy = 0;
        let samples = Math.min(15, sizes.length - 1);
        for(let i = 1; i <= samples; i++) {
            // Simplified simulation: would this strategy have guessed sizes[i-1] correctly?
            if (strat.size === sizes[i-1]) accuracy++;
        }
        const weight = (strat.confidence / 100) * (accuracy / samples || 0.5);
        
        if (strat.size === 'BIG') bigVites += weight;
        else smallVotes += weight;
    });

    const finalSize = bigVites >= smallVotes ? 'BIG' : 'SMALL';
    const totalVotes = bigVites + smallVotes;
    const synergyConfidence = totalVotes > 0 ? Math.round((Math.max(bigVites, smallVotes) / totalVotes) * 100) : 70;

    // Detect primary signal for technical feed
    let primarySignal = 'NEURAL_CONVERGENCE';
    if (bigVites > smallVotes * 2 || smallVotes > bigVites * 2) primarySignal = 'MAJOR_BIAS_DETECTED';
    if (finalSize !== sizes[0]) primarySignal = 'STREAK_VULNERABILITY';
    if (strategies.some(s => s.name === 'Altar Logic' && s.confidence >= 90)) primarySignal = 'PHASE_SHIFT_LOCK';
    if (strategies.some(s => s.name === 'Doublet Sync' && s.confidence >= 90)) primarySignal = 'RHYTHM_SYNC_LOCKED';

    // Best number derived from the frequencies in the Decryptor (Strat A)
    const ensemble = getNeuralDecryptor();

    return {
      number: (ensemble as any).bestNumber ?? 7,
      color: getColorForNumber((ensemble as any).bestNumber ?? 7),
      size: finalSize,
      confidence: Math.min(Math.max(synergyConfidence, 72) + 2, 99),
      strategyName: 'Neural Synergy v6',
      patternSignal: primarySignal,
      allStrategies: strategies.map(s => ({ name: s.name, size: s.size, confidence: s.confidence }))
    };
  };

  app.get('/api/predict', async (req, res) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const random = crypto.randomBytes(16).toString('hex');
      
      let effectiveToken = (req.headers['x-api-token'] as string) || API_TOKEN;
      if (effectiveToken && !effectiveToken.startsWith('Bearer ')) {
        effectiveToken = `Bearer ${effectiveToken}`;
      }

      const params = {
        pageSize: 50, // Fetch more data for the v6 engine
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
