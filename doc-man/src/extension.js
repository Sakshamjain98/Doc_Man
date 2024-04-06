const vscode = require("vscode");

const { generateComment } = require("./comments");
const { generateDocs } = require("./documentation");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("Initiating: DocMan!");
    
    const apiKey = vscode.workspace.getConfiguration().get('docman.gemini.apiKey');
    console.log(apiKey);
    if (!apiKey) {
        vscode.window.showWarningMessage("For this extension to work, please setup your Gemini API key in settings.");
    }

    let d1 = vscode.commands.registerCommand("doc-man.generateComment", generateComment);
    let d2 = vscode.commands.registerCommand("doc-man.generateDocs", generateDocs);

    context.subscriptions.push(d1);
    context.subscriptions.push(d2);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate,
};
