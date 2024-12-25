const express = require("express");
const app = express();
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const path = require("path");
const SummarizerManager = require("node-summarizer").SummarizerManager;
const { getTranscript} = require("youtube-transcript-api");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// 🔍 Extract YouTube Video ID
// const url = "https://www.youtube.com/watch?v=G5oIQEYQyEc";

function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null; // Returns the video ID if found, else null
}

// const videoId = extractVideoId(url);
// console.log("🔗 Extracted Video ID:", videoId);

// 🔍 Get YouTube Video Transcript
async function getVideoTranscript(videoId) {
    try {
        const transcript = await getTranscript(videoId);
        const fullTranscript = transcript.map(item => item.text).join(' ');
        // console.log('📄 Full transcript:', fullTranscript);
        return fullTranscript;
    } catch (error) {
        console.error('❌ Error fetching transcript:', error);
        return null;
    }
}


async function summarizeText(text) {
    const summarizer = new SummarizerManager(text, 3); // 3 = number of sentences
    const summary = await summarizer.getSummaryByFrequency(); // Summarize using frequency
    // console.log('Summary:', summary.summary);
    return summary.summary;
  }
  
//   const text = `BERT is a machine learning model developed by Google for NLP. 
//   It stands for Bidirectional Encoder Representations from Transformers. 
//   It helps computers understand the context of words in a sentence. 
//   BERT is pre-trained on large datasets and fine-tuned for specific tasks like sentiment analysis, 
//   named entity recognition, and question answering.`;
  
//   summarizeText(text);


// **Root Route**
app.get("/", (req, res) => {
    res.send("root route");
});

app.get("/home", (req, res) => {
    res.render("index.ejs");
});

app.get("/home/profile", (req, res)=>{
    res.render("profile.ejs");
});

app.get("/home/login", (req, res)=>{
    res.render("login.ejs");
});

app.get("/home/signup", (req, res)=>{
    res.render("signup.ejs");
});
// app.get("/show",(req, res)=>{
//     res.render("show.ejs");
// })

app.post("/home/show", async(req, res)=>{
    const url = req.body.url;
    const videoId = extractVideoId(url);
    const transcript = await getVideoTranscript(videoId);
    const result = await summarizeText(transcript);
    res.render("show.ejs", {result});
});


app.listen(3000, () => {
    console.log("🚀 Server is running on port 3000");
});
