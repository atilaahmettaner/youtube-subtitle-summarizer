import express from "express";
import bodyParser from "body-parser";
import scraper from "youtube-captions-scraper";
import dotenv from "dotenv"
import fetch from "node-fetch";
import analytics from "express-google-analytics"
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
import {Configuration, OpenAIApi} from "openai";


const configuration = new Configuration({
    apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);
app.use(analytics(process.env.GOOGLE_ANALYTICS_TRACKING_ID));
function removeStartingSentences(paragraph) {
    let sentences = paragraph.split(". ");
    let startIndex = 0;
    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].charAt(0) === sentences[i].charAt(0).toUpperCase()) {
            startIndex = i;
            break;
        }
    }
    return sentences.slice(startIndex).join(". ");
}

async function getAiResponse(topic) {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: topic,
            max_tokens: 2024,
            n: 1,
            stop: null,
            temperature: 0.7
        });
        return removeStartingSentences(completion.data.choices[0].text)


    } catch (e) {
        console.error(e)
    }

}


let result = ""
let longResult = ""
let summ = ""
let aiSummary = ""
let aiSummarys = ""
let title = ""

app.use(bodyParser.urlencoded({extended: true}), express.static("public"));

app.get("/", (req, res) => {
    res.render("index", {input: null});
});
let myData = []
let secondstoMin = []
app.post("/", async (req, res) => {
    try {
        let algo = {}
        let myData = []
        let errorMessage;
        const link = req.body.input;
        const lang = req.body["selectedLanguage"];
        const input = getYouTubeId(link)
        let newData = []
        if (input === "error") {
            console.log("err")
        } else {


            /*https://yt.lemnoslife.com/noKey/videos?part=snippet&id=XqVC-lBeG2U*/
            fetch(`https://yt.lemnoslife.com/videos?part=mostReplayed&id=${input}`)
                .then(response => response.json())
                .then(async data => {

                    newData = data

                    if (!data.items || data.items.length === 0) {
                        const errorMessage = 'Hatalı bir YouTube bağlantısı girdiniz!';
                        algo.errorMessage = errorMessage;
                        return res.render('index', {algo});
                    }

                    function millisToMinutesAndSeconds(millis) {
                        var minutes = Math.floor(millis / 60000);
                        var seconds = ((millis % 60000) / 1000).toFixed(0);
                        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
                    }

                    const heatMarkers = newData.items[0];

                    if (!heatMarkers['mostReplayed'] || !heatMarkers['mostReplayed']['heatMarkers'] || heatMarkers['mostReplayed']['heatMarkers'].length === undefined) {
                        myData.push('0:00')
                    } else {
                        for (let i = 0; i < heatMarkers['mostReplayed']['heatMarkers'].length; i++) {
                            if (heatMarkers['mostReplayed']['heatMarkers'][i]['heatMarkerRenderer']['heatMarkerIntensityScoreNormalized'] > 0.8) {
                                myData.push(millisToMinutesAndSeconds(heatMarkers['mostReplayed']['heatMarkers'][i]['heatMarkerRenderer']['timeRangeStartMillis']))
                            }
                        }
                    }
                    const secondsData = convertToSeconds(myData)
                    console.log(secondsData)
                    secondstoMin = secondsData.map(Number)
                    summ = await subConv(`${input}`, secondsData, `${lang}`)
                    title = await getTitle(input)
                    console.log(title)
                    const text = summ.longResult;
                    aiSummarys = await langDet(lang, summ.result)
                    console.log(aiSummary)
                    algo = {
                        aiSummary: aiSummarys,
                        title: title,
                        summ: summ.result,
                        longSub: text,
                        input: input,
                        myData: myData,
                        secondsData: secondsData,
                        secondstoMin: secondstoMin
                    };
                    res.render("index", {algo: algo});
                })
        }
    } catch (error) {
        console.log('error:', error.message);
        const errorMessage = 'error';
        return res.render('index', {message: errorMessage});
    }
});

function convertToSeconds(array) {
    let result = [];
    for (let item of array) {
        let parts = item.split(':').map(Number);
        let minutes = parts [0];
        let seconds = parts [1];
        let totalSeconds = minutes * 60 + seconds;
        result.push(totalSeconds.toFixed(3));
    }
    return result;
}

app.listen(port, () => {
    console.log(`app is running http://localhost:${port} `);
});
const subConv = async (id, myData, lang) => {
    try {
        return await scraper.getSubtitles({
            videoID: id,
            lang: lang
        }).then(function (captions) {
            const filteredCaptions = captions.filter(caption => {
                const start = parseFloat(caption.start);
                return myData.some(time => time >= start - 15 && time <= start + 15);
            });
            const mostReplayed = filteredCaptions.map(caption => caption.text);
            const allCaption = captions.map(caption => caption.text);
            result = mostReplayed.join(" ");
            longResult = allCaption.join(" ");
            return {result, longResult};
        })
    } catch (error) {
        console.error(error);
        return {result: `${lang} subtitle not found`, longResult: `${lang} subtitle not found`};
    }
};
function getYouTubeId(link) {
    let id;
    if (link.includes("youtube.com/watch")) {
        id = link.split("v=")[1];
        const ampersandPosition = id.indexOf("&");
        if (ampersandPosition !== -1) {
            id = id.substring(0, ampersandPosition);
        }
    } else if (link.includes("youtu.be/")) {
        id = link.split("youtu.be/")[1];
        const slashPosition = id.indexOf("/");
        if (slashPosition !== -1) {
            id = id.substring(0, slashPosition);
        }
    } else {
        id = "error"
    }
    return id;
}

async function langDet(lang, res) {
    if (lang === "tr") {
        aiSummary = await getAiResponse(`Bu video transkripsiyonunu özetleyebilir misin:${res}.`)

    } else if (lang === "en") {
        aiSummary = await getAiResponse(`summarize the transcription of this video?:${res}.`)

    }
    return aiSummary
}

async function getTitle(id) {
    const response = await fetch(`https://yt.lemnoslife.com/noKey/videos?part=snippet&id=${id}`);
    const data = await response.json();
    const title = data.items[0].snippet.title;
    return title;
}