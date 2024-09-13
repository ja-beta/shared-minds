const replicateProxy = "https://replicate-api-proxy.glitch.me";
const maxLength = 16;

const tones = ["none", "cryptic", "direct", "metaphorical", "enigmatic"];
const themes = ["none", "love", "hate", "fear", "hope", "despair", "loneliness", "friendship", "betrayal", "forgiveness", "revenge", "peace", "war", "life", "death", "growth", "decay", "light", "darkness", "good", "evil", "chaos", "order", "freedom"];
const moods = ["none", "ominous", "hopeful", "neutral", "foreboding", "inspiring", "encouraging", "depressing", "playful", "calm", "gloomy"];
const contexts = ["none", "a battlefield", "a temple", "a sea", "the underworld", "a garden", "a modern city", "a bridge", "a house", "a village"];
const temporalities = ["none", "past", "present", "immediate future", "future", "eternal"];

const dropdownsContainer = document.getElementById("dropdowns-wrapper");
const txtPrompt = document.getElementById("prompt_text");
const imgPrompt = document.getElementById("image_container");
const textDiv = document.getElementById("resulting_text");
const sumbmitBtn = document.getElementById("submit_button");

const paramArrays = {
    tone: tones,
    theme: themes,
    mood: moods,
    context: contexts,
    temporality: temporalities
};

const image_container = document.getElementById("image_container");



document.addEventListener("DOMContentLoaded", () => {

    function createDropdown(name, values) {
        const container = document.createElement("div");
        container.className = "dropdown-container";
        const label = document.createElement("label");
        label.textContent = `${name.charAt(0).toUpperCase() + name.slice(1)}:`;
        label.setAttribute("for", `${name}-dropdown`);
        container.appendChild(label);
    
        const dropdown = document.createElement("select");
        dropdown.id = `${name}-dropdown`;
        values.forEach((value, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = value;
            dropdown.appendChild(option);
        });
        container.appendChild(dropdown);
    
        dropdownsContainer.appendChild(container);
    
        dropdown.addEventListener("change", updateProphecy);
    }
    
    function updateProphecy() {
        const tone = tones[document.getElementById("tone-dropdown").value];
        const theme = themes[document.getElementById("theme-dropdown").value];
        const mood = moods[document.getElementById("mood-dropdown").value];
        const context = contexts[document.getElementById("context-dropdown").value];
        const temporality = temporalities[document.getElementById("temporality-dropdown").value];
    
        const parts = {
            tone: tone !== "none" ? tone : null,
            theme: theme !== "none" ? theme : null,
            mood: mood !== "none" ? mood : null,
            context: context !== "none" ? context : null,
            temporality: temporality !== "none" ? temporality : null
        };
    
        const sentenceParts = [];
        if (parts.tone) sentenceParts.push(` in a ${parts.tone} tone`);
        if (parts.mood) sentenceParts.push(`with a ${parts.mood} mood`);
        if (parts.theme) sentenceParts.push(`using a theme of ${parts.theme}`);
        if (parts.context) sentenceParts.push(`set in the context of ${parts.context}`);
        if (parts.temporality) sentenceParts.push(`and refer to events in the ${parts.temporality}`);
    
        txtPrompt.textContent = `Compose a short greek-style prophecy ${sentenceParts.join(", ")}. You must limit your answer to a maximum of ${maxLength} words.`;
    }
    
    Object.keys(paramArrays).forEach((param) => createDropdown(param, paramArrays[param]));
    updateProphecy();
    
    sumbmitBtn.addEventListener("click", () => {
        askForWords(txtPrompt.textContent);
        askForPicture();
    });
    
    async function askForWords(p_prompt) {
        document.body.style.cursor = "progress";
        textDiv.innerHTML = "Waiting for reply from Replicate...";
        const data = {
            "version": "35042c9a33ac8fd5e29e27fb3197f33aa483f72c2ce3b0b9d201155c7fd2a287",
            input: {
                prompt: p_prompt,
            },
        };
        console.log("Asking for Words From Replicate via Proxy", data);
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: 'application/json',
            },
            body: JSON.stringify(data),
        };
        const url = replicateProxy + "/create_n_get/";
        console.log("words url", url, "words options", options);
        const words_response = await fetch(url, options);
        console.log("words_response", words_response);
        const proxy_said = await words_response.json();
        if (proxy_said.output.length == 0) {
            textDiv.innerHTML = "Something went wrong, try it again";
        } else {
            textDiv.innerHTML = proxy_said.output.join("");
            console.log("proxy_said", proxy_said.output.join(""));
        }
    }

    async function askForPicture(p_prompt) {
        const imageDiv = document.getElementById("resulting_image");
        imageDiv.innerHTML = "Waiting for reply from Replicate's Stable Diffusion API...";
        let data = {
            "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
            input: {
                "prompt": p_prompt,
                "width": 512,
                "height": 512,
            },
        };
        console.log("Asking for Picture Info From Replicate via Proxy", data);
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        };
        const url = replicateProxy + "/create_n_get/";
        console.log("url", url, "options", options);
        const picture_info = await fetch(url, options);
        //console.log("picture_response", picture_info);
        const proxy_said = await picture_info.json();
    
        if (proxy_said.output.length == 0) {
            imageDiv.innerHTML = "Something went wrong, try it again";
        } else {
            imageDiv.innerHTML = "";
            let img = document.createElement("img");
            img.src = proxy_said.output[0];
            imageDiv.appendChild(img);
        }
    }

    const checkbox = document.getElementById("checkbox");

    function togglePromptText() {
        if (checkbox.checked) {
            txtPrompt.style.display = "block";
        } else {
            txtPrompt.style.display = "none";
        }
    }

    togglePromptText();
    checkbox.addEventListener("change", togglePromptText);
});