const path = require('path');
const detectLang = require('lang-detector');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'web', 'dist')));


// Mock function to simulate a successful API request
const mockSuccessRequest = async () => {
  return { status: 'success', data: 'Mock data' };
};

// Mock function to simulate a failed API request
const mockFailedRequest = async () => {
  throw new Error('Mock error');
};

// Utility functions
function preprocessCode(inputCode, sourceLang) {
  const importantComments = inputCode.match(/\/\/.*TODO:.*|\/\/.*FIXME:.*|\/\/.*NOTE:.*|\/\*.*TODO:.*\*\/|\/\*.*FIXME:.*\*\/|\/\*.*NOTE:.*\*\/|#+.*TODO:.*|#+.*FIXME:.*|#+.*NOTE:.*/g);
  let preservedComments = "";
  if (importantComments) {
    preservedComments = importantComments.join('\n') + '\n';
  }

  let cleanedCode = removeComments(inputCode, sourceLang);
  return preservedComments + cleanedCode.trim();
}

function removeComments(code, language) {
  switch (language.toLowerCase()) {
    case 'python':
      code = code.replace(/#.*$/gm, '');
      break;
    case 'java':
    case 'javascript':
      code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      break;
  }
  return code;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: true });

app.post('/translate-code', async (req, res) => {
  const { inputCode, sourceLang, targetLang } = req.body;

  // Input validation
  if (!inputCode || !sourceLang || !targetLang) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  if (!['python', 'java', 'javascript'].includes(sourceLang.toLowerCase()) || !['python', 'java', 'javascript'].includes(targetLang.toLowerCase())) {
    return res.status(400).json({ success: false, error: "Unsupported source or target language." });
  }

  const MAX_LINES_ALLOWED = 1500;
  const lineCount = (inputCode.match(/\n/g) || []).length + 1;
  if (lineCount > MAX_LINES_ALLOWED) {
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded due to large input size. Please try again; max limit is 1500 lines."
    });
  }

  const detectedLanguage = detectLang(inputCode).toLowerCase();
  if (!['python', 'java', 'javascript'].includes(detectedLanguage)) {
    return res.status(400).json({ success: false, error: "Unsupported source language detected. Please choose between Python, Java, and JavaScript." });
  }

  const preprocessedCode = preprocessCode(inputCode, sourceLang);
  const prompt = `Translate the following code from ${sourceLang} to ${targetLang}:\n\n${preprocessedCode}`;

  try {
    const MAX_TOKENS_BASE = 2048;
    const additionalTokens = Math.min(Math.floor(preprocessedCode.length / 100), 1000);
    const max_tokens = MAX_TOKENS_BASE + additionalTokens;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `You are a knowledgeable assistant skilled in translating code from ${sourceLang} to ${targetLang}.`
      }, {
        role: "user",
        content: prompt
      }],
      max_tokens: max_tokens
    });

    const translatedCode = response.choices[0].message.content.trim();
    res.json({ success: true, translatedCode });
  } catch (error) {
    console.error('Error translating code:', error);
    let errorMessage = "An unexpected error occurred.";
    if (error.response) {
      errorMessage = error.response.data && error.response.data.error ? error.response.data.error.message : "Invalid request. Please check the input.";
      res.status(error.response.status).json({ success: false, error: errorMessage });
    } else {
      res.status(500).json({ success: false, error: "Failed to reach the OpenAI service. Please try again." });
    }
  }
});

// Catch-all route to serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, preprocessCode, mockSuccessRequest, mockFailedRequest };

