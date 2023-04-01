const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const { promisify } = require('util');
const bodyParser = require('body-parser');
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Configuration, OpenAIApi } = require('openai');

const app = express();

require('dotenv').config();


const configuration = new Configuration({
  organization: process.env.REACT_APP_ORGANIZATION,
  apiKey: process.env.REACT_APP_API_KEY
});

const openai = new OpenAIApi(configuration);


const speechClient = new speech.SpeechClient();
const textToSpeechClient = new textToSpeech.TextToSpeechClient();

// Set up multer for handling file uploads
// Configure multer middleware to handle audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10000000, // 10 MB limit
  }
}).single('audio');

// Middleware to handle errors
app.use(express.json());
app.use(cors()); // Use cors middleware
app.use(bodyParser.json());

// Route to transcribe audio file
app.post('/transcribe', upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // Get audio content from the uploaded file
    const audioContent = req.file.buffer.toString('base64');

    // Configure the request
    const request = {
      audio: {
        content: audioContent,
      },
      config: {
        enableAutomaticPunctuation: true,
        sampleRateHertz: 48000,
        encoding: 'MP3',
        languageCode: 'en-US',
        model: 'default',
      },
    };

    // Perform transcription using the Speech-to-Text API
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    res.json({ transcription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Route to chat with OpenAI
app.post('/chat', async (req, res) => {
  try {
    if (!req.body.message) {
      return res.status(400).json({ error: 'No message provided' });
    }

    // Send the message to OpenAI
    const openaiResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${req.body.message}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });
    
    

    // Extract the generated text from the OpenAI response
    const answer = openaiResponse.data.choices[0].text;
    console.log(answer);

    // Send the answer back to the frontend
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Route to convert text to speech
app.post('/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    const request = {
      input: { text },
      voice: {
        languageCode: "hi-IN",
        name: "hi-IN-Neural2-D"
      },
      audioConfig: { audioEncoding: 'MP3' },
    };
    const [response] = await textToSpeechClient.synthesizeSpeech(request);
    const audioContent = response.audioContent;
    res.send(audioContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong!' });
  }
});

    

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
