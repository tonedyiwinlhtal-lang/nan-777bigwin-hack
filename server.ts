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

  // AI Prediction Engine
  const calculatePrediction = (data: any[]) => {
    if (!data || data.length === 0) return null;

    // Last 10-20 results
    const results = data.slice(0, 20).map(item => parseInt(item.number));
    const counts = Array(10).fill(0);
    results.forEach(n => counts[n]++);

    // 1. Frequency Analysis (0.4)
    const freqScores = counts.map(c => c / results.length);

    // 2. Transition Pattern (Markov-style) (0.3)
    const transitions: Record<number, number[]> = {};
    for (let i = 0; i < results.length - 1; i++) {
      const current = results[i + 1]; // Older
      const next = results[i]; // Newer
      if (!transitions[current]) transitions[current] = [];
      transitions[current].push(next);
    }
    
    const lastNum = results[0];
    const lastTransitions = transitions[lastNum] || [];
    const transitionCounts = Array(10).fill(0);
    lastTransitions.forEach(n => transitionCounts[n]++);
    const transitionScores = transitionCounts.map(c => lastTransitions.length > 0 ? c / lastTransitions.length : 0.1);

    // 3. Streak Detection (Anti-Streak) (0.2)
    // Reduce probability if the number has appeared recently
    const streakScores = Array(10).fill(1);
    results.slice(0, 5).forEach((n, idx) => {
      streakScores[n] *= (0.2 * (idx + 1)); // Lower score for recent numbers
    });

    // 4. Color Bias (0.1)
    const colors = results.map(getColorForNumber);
    const colorCounts = { green: 0, red: 0, violet: 0 };
    colors.forEach(c => {
      if (c.includes('green')) colorCounts.green++;
      if (c.includes('red')) colorCounts.red++;
      if (c.includes('violet')) colorCounts.violet++;
    });
    
    const colorScores = Array(10).fill(0);
    for (let i = 0; i < 10; i++) {
        const c = getColorForNumber(i);
        if (c.includes('green')) colorScores[i] += (colorCounts.green / results.length);
        if (c.includes('red')) colorScores[i] += (colorCounts.red / results.length);
        if (c.includes('violet')) colorScores[i] += (colorCounts.violet / results.length);
    }

    // Weighted Scoring
    const finalScores = Array(10).fill(0).map((_, i) => {
      return (freqScores[i] * 0.4) + 
             (transitionScores[i] * 0.3) + 
             (streakScores[i] * 0.2) + 
             (colorScores[i] * 0.1);
    });

    const bestNumber = finalScores.indexOf(Math.max(...finalScores));
    const confidence = Math.min(Math.round(finalScores[bestNumber] * 100), 98); // Cap at 98% for realism
    const predictedColor = getColorForNumber(bestNumber);
    const predictedSize = bestNumber >= 5 ? 'BIG' : 'SMALL';

    return {
      number: bestNumber,
      color: predictedColor,
      size: predictedSize,
      confidence: confidence
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
