const vscode = require("vscode");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const CODE_LABEL = 'Here is the code:';
const COMMENT_LABEL = 'Here is a good unit test:';
const PROMPT = `
A good code review comment describes the intent behind the code without
repeating information that's obvious from the code itself. Good comments
describe "why", explain any "magic" values and non-obvious behaviour.
Below are some examples of good code comments.

${CODE_LABEL}
print(f" \\033[33m {msg}\\033[00m", file=sys.stderr)
${COMMENT_LABEL}
Use terminal codes to print color output to console.

${CODE_LABEL}
to_delete = set(data.keys()) - frozenset(keep)
for key in to_delete:
  del data[key]
${COMMENT_LABEL}
Modifies \`data\` to remove any entry not specified in the \`keep\` list.

${CODE_LABEL}
lines[text_range.start_line - 1:text_range.end_line - 1] = [repl.new_content]
${COMMENT_LABEL}
Replace text from \`lines\` with \`new_content\`, noting that array indices 
are offset 1 from line numbers.

${CODE_LABEL}
api_key = os.getenv("GOOGLE_API_KEY")
${COMMENT_LABEL}
Attempt to load the API key from the environment.`;

async function generateUnitTests() {
    const apiKey = vscode.workspace.getConfiguration().get("docman.gemini.apiKey");
    if (!apiKey) {
        vscode.window.showErrorMessage("API key not configured. Check your settings.");
        return;
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({ model: "models/gemini-1.0-pro-latest" });

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No file window opened!");
        return;
    }

    const code = editor.document.getText();

    const fullPrompt = `${PROMPT}

${CODE_LABEL}
${code}
${COMMENT_LABEL}
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const tests = response.text();
    console.log(tests);
}

module.exports = {
    generateUnitTests
};
