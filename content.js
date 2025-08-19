import { maximizeSvg, fullMinimizeIcon, minimizeSvg } from "./images/svg";
import { marked } from 'marked';
import hljs from 'highlight.js';

const chatContainer = document.createElement('div');
chatContainer.id = 'ai-chat-overlay';
chatContainer.innerHTML = `
    <div id="chat-heading">AI Chat Overlay</div>
    <div id="chat-body"></div>
    <div id="chat-footer">
        <div contentEditable id="ai-chat-input" data-text="Ask me anything..."></div>
        <button type="button" id="chat-submit">Send</button>
    </div>
`;

document.body.appendChild(chatContainer);

let isMaximized = false, isFullMinimize = false;

const header = document.getElementById('chat-heading');

const headingButtons = document.createElement('div');
headingButtons.id = 'chat-heading-buttons';

const maxMiniIconEl = document.createElement('div');
maxMiniIconEl.id = "max-mini-btn-div";

const img = document.createElement('div');
img.innerHTML += maximizeSvg;
img.id = 'chat-maximize';

const imgMin = document.createElement('div');
imgMin.innerHTML += minimizeSvg;
imgMin.id = 'chat-minimize';

const fullMinimize = document.createElement('div');
fullMinimize.innerHTML = fullMinimizeIcon;
fullMinimize.id = 'fullMinimize';

const chatBody = document.getElementById('chat-body');
const chatFooter = document.getElementById('chat-footer');

fullMinimize.addEventListener('click', () => {
    console.log(isFullMinimize, 'isFullMin1');

    isFullMinimize = !isFullMinimize;

    console.log(isFullMinimize, 'isFullMin2');


    if (isFullMinimize) {
        // Minimize the chat completely
        chatContainer.style.height = '50px';
        chatContainer.style.minHeight = '50px';
        chatBody.style.height = 0;
        chatBody.style.display = 'none';
        chatFooter.style.display = 'none';
    } else {
        // Restore default minimized state
        isMaximized = false; // Reset maximize state
        chatContainer.style.minHeight = '310px';
        chatContainer.style.height = 0; // Clear height override
        chatBody.style.height = '200px';
        chatBody.style.display = 'block';
        chatFooter.style.display = 'flex';
    }
});

maxMiniIconEl.addEventListener('click', () => {
    // If currently full-minimized, restore first
    if (isFullMinimize) {
        isFullMinimize = false; // Exit full-minimize state
        chatBody.style.display = 'block';
        chatFooter.style.display = 'flex';
    }

    isMaximized = !isMaximized;

    if (isMaximized) {
        // Maximize the chat
        chatContainer.style.height = '96vh';
        chatContainer.style.width = 'min-content';
        chatBody.style.height = '80%';
        chatFooter.style.width = "initial";
        maxMiniIconEl.replaceChild(imgMin, img);
        headingButtons.appendChild(maxMiniIconEl);
        header.appendChild(headingButtons);
    } else {
        // Return to minimized default state
        chatContainer.style.minHeight = '310px';
        chatContainer.style.width = '300px';
        chatContainer.style.height = ''; // Reset height
        chatBody.style.height = '200px';
        maxMiniIconEl.replaceChild(img, imgMin);
        headingButtons.appendChild(maxMiniIconEl);
        header.appendChild(headingButtons);
    }
});
function escapeHTML(input) {
    return input
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to format the string and convert markdown-style code blocks
function formatStringForHTML(input) {
    let formatted = escapeHTML(input); // Escape HTML special characters
    formatted = formatted.replace(/```javascript\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>'); // Handle code blocks
    formatted = formatted.replace(/\n/g, "<br>"); // Convert newlines to <br>
    return formatted;
}

headingButtons.appendChild(fullMinimize);
maxMiniIconEl.appendChild(img);
headingButtons.appendChild(maxMiniIconEl);
header.appendChild(headingButtons);


document.getElementById('ai-chat-input').addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        if (!event.shiftKey) {
            // Call the function when Enter is pressed without Shift
            event.preventDefault(); // Prevent default line break behavior
            handleSubmit();
        }
    } else {
        console.log(chatFooter.offsetHeight, chatBody.offsetHeight);
        const newHeight = `calc(100vh - ${chatFooter.offsetHeight} - 20px)`;

        // Apply the new height to chatBody
        chatBody.style.height = `${newHeight}px`;
    }
});

marked.setOptions({
    highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value; // fallback
    }
});

const handleSubmit = async () => {
    const input = document.getElementById('ai-chat-input');
    const message = input.innerHTML;

    if (message) {
        addBody('User', message, false);
        input.innerHTML = '';

        addBody("ChatGPT", "Loading...", true);
        const response = await fetchFromChatGPT(message);
        const html = marked.parse(response);
        addBody('ChatGPT', html, false);

        document.querySelectorAll("#chat-body pre code").forEach((block) => {
            hljs.highlightElement(block);
        })
    }
};

document.getElementById('chat-submit').addEventListener('click', handleSubmit);

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

let UUID = '';

const addBody = (sender, text, loading) => {
    const chatBody = document.getElementById('chat-body');
    const message = !loading && sender === 'ChatGPT' ? document.getElementById(`div-${UUID}`) : document.createElement('div');

    console.log(text, 'textt');

    if (loading) {
        const uuid = uuidv4();
        message.id = `div-${uuid}`;
        UUID = uuid;
        message.classList.add('ai-prompt-container');
        message.innerHTML = `<strong>${sender}</strong>: <p id="loader"></p>`;
    } else if (sender === 'User') {
        message.classList.add('user-prompt-container');
        const userPromptContent = document.createElement('p');
        userPromptContent.innerHTML = text;
        userPromptContent.id = "user-prompt"
        message.appendChild(userPromptContent);
    } else {
        message.innerHTML = `<strong>${sender}</strong>: <p>${text}</p>`;
        UUID = '';
    }

    chatBody.appendChild(message);
    chatBody.scrollTop = chatBody.scrollHeight;
}

const MESSAGE_STORE = [
    {
        "role": "system",
        "content": "You are gpt-oss-20b (free), a large language model from openai.\n\nFormatting Rules:\n- Use Markdown **only when semantically appropriate**. Examples: `inline code`, ```code fences```, tables, and lists.\n- In assistant responses, format file names, directory paths, function names, and class names with backticks (`).\n- For math: use \\( and \\) for inline expressions, and \\[ and \\] for display (block) math."
    }
];

async function fetchFromChatGPT(message) {
    try {

        let newUserMessage = {
            "role": "user",
            "content": message
        };

        MESSAGE_STORE.push(newUserMessage);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.API_KEY}`, // Replace with your key
                "X-Title": "AI Chat Overlay"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b:free", // Free-tier model, you can change
                messages: MESSAGE_STORE
            })
        });


        const data = await response.json();
        console.log(data, 'chat message data');
        let newSystemMessage = {
            "role": "assistant",
            "content": data.choices[0]?.message?.content,
            "annotations": []
        }

        MESSAGE_STORE.push(newSystemMessage);

        return data.choices[0]?.message?.content;
    } catch (error) {
        console.group(error);
        return "Error: No response from AI."
    }
}