const url = "https://replicate-api-proxy.glitch.me/create_n_get/";

init();

function init() {
    console.log("Initializing interface...");
    initInterface();
}

async function askEmbeddingModel(textInput) {
    console.log("askEmbeddingModel called with:", textInput);
    document.body.style.cursor = "progress";

    try {
        const data = {
            version: "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
            input: {
                inputs: textInput,
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

        const raw = await fetch(url, options);
        const proxy_said = await raw.json();
        let output = proxy_said.output;
        console.log("Output from Embedding Model:", output);

        return output;
    } catch (error) {
        console.error("Error in askEmbeddingModel:", error);
    } finally {
        document.body.style.cursor = "default";
    }
}

async function askLLM(textInput1, textInput2) {
    console.log("askLLM called with:", textInput1, textInput2);
    document.body.style.cursor = "progress";

    const prompt = "one word that is a blend of " + textInput1 + " and " + textInput2 + " that creates a portmanteau. Do not include any extra words or punctuation.";

    try {
        const data = {
            modelURL: "https://api.replicate.com/v1/models/meta/meta-llama-3-70b-instruct/predictions",
            input: {
                prompt: prompt,
                max_tokens: 100,
                max_length: 100,
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

        const raw = await fetch(url, options);
        const proxy_said = await raw.json();
        let output = proxy_said.output;

        // Extract the blended word correctly
        const blendedWord = output.join('').trim();
        console.log("Output from LLM:", output);
        return blendedWord;
    } catch (error) {
        console.error("Error in askLLM:", error);
    } finally {
        document.body.style.cursor = "default";
    }
}

function initInterface() {
    const inputField1 = document.createElement('input');
    inputField1.id = 'inputField1';
    inputField1.placeholder = 'Enter first word';
    document.body.appendChild(inputField1);

    const inputField2 = document.createElement('input');
    inputField2.id = 'inputField2';
    inputField2.placeholder = 'Enter second word';
    document.body.appendChild(inputField2);

    const submitButton = document.createElement('button');
    submitButton.id = 'submitButton';
    submitButton.innerText = 'Blend';
    document.body.appendChild(submitButton);

    submitButton.addEventListener('click', handleSubmit);
}

async function handleSubmit() {
    const inputField1 = document.getElementById('inputField1').value;
    const inputField2 = document.getElementById('inputField2').value;

    const blendedWord = await askLLM(inputField1, inputField2);
    console.log("Blended Word:", blendedWord);

    const words = [inputField1, inputField2, blendedWord];
    const embeddings = await askEmbeddingModel(words.join("\n"));

    drawWords(embeddings);
}

function drawWords(embeddings) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const positions = embeddings.map(e => e.embedding);
    const projectedPositions = projectTo2D(positions);

    const normalizedPositions = normalizeCoordinates(projectedPositions, canvas.width, canvas.height);

    normalizedPositions.forEach((pos, index) => {
        ctx.fillText(embeddings[index].input, pos[0], pos[1]);
    });
}

function projectTo2D(embeddings) {
    // Ensure embeddings are in matrix format
    const matrixEmbeddings = embeddings.map(e => Object.values(e));
    const vectors = PCA.getEigenVectors(matrixEmbeddings);
    const reduced = PCA.computeAdjustedData(matrixEmbeddings, vectors, 2);
    return reduced.adjustedData;
}

function normalizeCoordinates(positions, width, height) {
    const minX = Math.min(...positions.map(pos => pos[0]));
    const maxX = Math.max(...positions.map(pos => pos[0]));
    const minY = Math.min(...positions.map(pos => pos[1]));
    const maxY = Math.max(...positions.map(pos => pos[1]));

    return positions.map(pos => [
        ((pos[0] - minX) / (maxX - minX)) * width,
        ((pos[1] - minY) / (maxY - minY)) * height,
    ]);
}