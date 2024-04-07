const vscode = require('vscode');
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const CODE_LABEL = 'Here is the code:';
const COMMENT_LABEL = 'Here is a good documentation:';
const PROMPT = `
A good documentation describes the intent behind the code by providing a short description of he function along with its signature. Good documentation describes any possible errors to be encountered, explain any "magic" values and non-obvious behaviour.
Below are some examples of good code documentation.

${CODE_LABEL}
function add(a, b) {
    return a + b;
}
${COMMENT_LABEL}
## Add
**Description:** Adds the two input values and returns the result
**Input:** a (Number), b (Number)
**Output:** Number

${CODE_LABEL}
async function getUserRepos(username) {
    const res = await fetch("https://github.com/users/Nemesis-AS/repos;
    if (res.status !== 200)
        return;
    const json = await res.json();
    return json;
}
${COMMENT_LABEL}
## GetUserRepos
**Description:** This asynchronous function fetches a list of public repositories for a given username from the GitHub API.

**Input:**

username (String): The username of the GitHub account to retrieve repositories for.
Output:

Promise (Object):
Resolves to an array of objects containing repository data if the request is successful (status code 200).
Rejects with an error if the request fails (non-200 status code or other network issues).
Possible Errors:

Network errors: Any network issues during the fetch operation can cause the promise to reject.
Invalid username: The GitHub API may return a non-200 status code if the username is invalid or the user doesn't exist. The function itself doesn't perform validation on the username.
Rate limiting: If the API rate limits are exceeded, the request may fail.
Non-obvious Behavior:

The function only fetches public repositories. Private repositories won't be included in the results.
Note:

This function uses the \`fetch API\` and async/await syntax. Make sure your environment supports these features.`;

async function generateDocs() {
    
    const apiKey = vscode.workspace.getConfiguration().get('docman.gemini.apiKey');
    if (!apiKey) {
        vscode.window.showErrorMessage('API key not configured. Check your settings.');
        return;
    }
    
    vscode.window.showInformationMessage('Generating documentation...');
    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({model: "models/gemini-1.0-pro-latest"});

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No file window opened!");
        return;
    }

    const basename = path.basename(editor.document.fileName);
    const arr = basename.split(".");
    arr.pop();
    const title = arr.join(".");
    const code = editor.document.getText();

    const fullPrompt = `${PROMPT}

${CODE_LABEL}
${code}
${COMMENT_LABEL}
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const docs = response.text();

    vscode.window.showInformationMessage("Generated docs!");

    const wsedit = new vscode.WorkspaceEdit();
    const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = vscode.Uri.file(wsPath + `/docs/${title}.md`);
    wsedit.createFile(filePath, { ignoreIfExists: false, contents: new TextEncoder().encode(docs) });
    vscode.workspace.applyEdit(wsedit);
    vscode.window.showInformationMessage(`Created docs at: docs/${title}.md`);
}

module.exports = {
    generateDocs
};
