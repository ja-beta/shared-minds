const url = "https://replicate-api-proxy.glitch.me/create_n_get/";
const permanentImageUrl = "https://replicate.delivery/pbxt/IqLXryIoF3aK3loaAUERG2lxnZX8x0yTZ9Nas9JtMxqcgotD/astronaut.png";

init();

function init() {
    console.log("Initializing interface...");
    initInterface();
}

async function askModel(textInput) {
    console.log("askModel called with:", textInput);
    document.body.style.cursor = "progress";

    try {
        const data = {
            version: "0383f62e173dc821ec52663ed22a076d9c970549c209666ac3db181618b7a304",
            input: {
                "input": permanentImageUrl,
                "text_input": textInput,
                "modality": "vision",
            },
        };
        console.log("Making a Fetch Request", data);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: 'application/json',
            },
            body: JSON.stringify(data),
        };

        const raw_response = await fetch(url, options);
        const json_response = await raw_response.json();
        document.body.style.cursor = "auto";
        console.log("Response received:", json_response);

        if (json_response.output) {
        
            const newImage = json_response.output[0]; 
            displayResult(newImage);
        } else {
            console.error("Unexpected response structure:", json_response);
            alert("Unexpected response from the server. Please try again.");
        }
    } catch (error) {
        console.error("Error during fetch:", error);
        document.body.style.cursor = "auto";
        alert("An error occurred while processing your request. Please try again.");
    }
}

function handleSubmit() {
    const wordInput = document.getElementById('wordInput').value;

    if (!wordInput) {
        alert("Please enter a word");
        return;
    }

    askModel(wordInput);
}

function displayResult(newImage) {
    console.log("Displaying result:", newImage);

    const resultImage = new Image();
    resultImage.src = newImage; 
    resultImage.id = "resultImage";
    document.body.appendChild(resultImage);
}

function initInterface() {
    console.log("Setting up interface elements...");
    const submitButton = document.getElementById('submitButton');
    submitButton.addEventListener('click', handleSubmit);
}