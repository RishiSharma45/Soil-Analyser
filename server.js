const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(express.static('public'));

// Replace with your actual API key for Cohere or other AI
const COHERE_API_KEY = 'OK3NBiIMLCoDPa5OUuCYSoDRS13tgy5eIEj5uDxf';

// Example route to interact with AI and process pH & moisture
app.post('/ask', async (req, res) => {
  const userInput = req.body.query;

  // Simple pattern match for pH and moisture
  const pHMatch = userInput.match(/pH\s*=?\s*(\d+(\.\d+)?)/i);
  const moistureMatch = userInput.match(/moisture\s*=?\s*(\d+(\.\d+)?)/i);

  if (pHMatch || moistureMatch) {
    const pH = pHMatch ? parseFloat(pHMatch[1]) : null;
    const moisture = moistureMatch ? parseFloat(moistureMatch[1]) : null;

    let reply = "**Soil Health Report:**\n";

    // Check pH range and give feedback
    if (pH !== null) {
      if (pH < 5.5) reply += `- pH ${pH}: Too acidic. Consider liming.\n`;
      else if (pH >= 5.5 && pH <= 7) reply += `- pH ${pH}: Good range for most crops.\n`;
      else reply += `- pH ${pH}: Alkaline. Might affect nutrient uptake.\n`;
    }

    // Check moisture range and give feedback
    if (moisture !== null) {
      if (moisture < 3) reply += `- Moisture ${moisture}: Too dry.\n`;
      else if (moisture <= 7) reply += `- Moisture ${moisture}: Ideal moisture.\n`;
      else reply += `- Moisture ${moisture}: Too wet. Risk of root rot.\n`;
    }

    reply += "✅ Based on these factors, your soil appears reasonably healthy.";
    return res.json({ answer: reply });
  }

  // Otherwise, use AI API (e.g., Cohere or Gemini)
  try {
    const aiRes = await axios.post('https://api.cohere.ai/v1/generate', {
      model: 'command-light',
      prompt: userInput,
      max_tokens: 100,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = aiRes.data.generations[0].text.trim();
    res.json({ answer: reply });

  } catch (err) {
    console.error('AI Error:', err.response?.data || err.message);
    res.status(500).json({ answer: "AI failed to respond." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
