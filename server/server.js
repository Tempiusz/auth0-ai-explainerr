import express from "express";
import axios from "axios";
import cors from "cors";
import OpenAI from "openai";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// konfiguracja OpenAI z kluczem w .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/explain", async (req, res) => {
  const { repo, githubToken } = req.body;

  try {
    // pobranie README z GitHub
    const readmeRes = await axios.get(
      `https://api.github.com/repos/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3.raw"
        }
      }
    );

    const readme = readmeRes.data;

    // wywołanie modelu OpenAI do podsumowania
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that explains GitHub repos in simple terms."
        },
        {
          role: "user",
          content: `Explain this GitHub project simply:\n\n${readme}`
        }
      ],
    });

    const summary = completion.choices[0].message.content;

    res.json({ summary });

  } catch (err) {
    console.error("Error in /explain:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("API running on port 3000"));