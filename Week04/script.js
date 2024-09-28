import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onChildAdded, update } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { firebaseConfig, apiUrl } from './config.js';

let db;

initFirebaseDB();
subscribeToData();

function initFirebaseDB() {
    const app = initializeApp(firebaseConfig);
    db = getDatabase();
}

function subscribeToData() {
    const folder = "items";
    const thisRef = ref(db, folder);

    onChildAdded(thisRef, (snapshot) => {
        const latestEntry = snapshot.val();
        console.log("Latest entry:", latestEntry);

        if (latestEntry && latestEntry.line) {
            const prompt = `Please perform sentiment analysis on the following text: ${latestEntry.line} and provide a score between 0 and 1, 0 being negative and 1 being positive. Your response should be the score number only.`;
            askValue(latestEntry.line, snapshot.key);
        }
    });
}

async function askValue(prompt, key) {
    document.body.style.cursor = "progress";
    const data = {
        modelURL: "https://api.replicate.com/v1/models/curt-park/sentiment-analysis",
        input: {
            prompt: prompt,
        },
    };
    console.log("Making a Request", data);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: 'application/json',
        },
        body: JSON.stringify(data),
    };

    try {
        const response = await fetchWithTimeout(apiUrl, options, 300000); // 5 minutes timeout
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        console.log("Full response from API:", result);

        if (!result.label || !result.score) {
            console.log("Something went wrong, try it again");
        } else {
            console.log("Returned from API", result);
            const score = result.score; 
            updateScoreInFirebase(key, score);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        document.body.style.cursor = "auto";
    }
}

function updateScoreInFirebase(key, score) {
    const folder = "items"; 
    const dbRef = ref(db, `${folder}/${key}`);
    update(dbRef, { score: score })
        .then(() => {
            console.log("Score updated successfully");
        })
        .catch((error) => {
            console.error("Error updating score:", error);
        });
}

async function fetchWithTimeout(resource, options, timeout = 30000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}