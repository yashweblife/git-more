const vscode = require('vscode');
const sg = require('simple-git');
const gm = sg.simpleGit();

const not_git_dir = "This is not a git directory";
const command_fail = "Something went wrong with the command"

function isValidGirRepo(){
	if (!gm.checkIsRepo()) {
		vscode.window.showErrorMessage(not_git_dir)
		return false
	}
}


function activate(context) {
	// TODO: Curate more messages
	/**
	 * Stages changes
	 */
	let stager = vscode.commands.registerCommand('git-more.stage', function () {
		// TODO: make this a functions
		if(!isValidGirRepo()){
			return
		}
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const file = editor.document.uri.fsPath;
			gm.add(file, (err) => {
				if (err) {
					vscode.window.showErrorMessage(command_fail + "\n" + err.message)
				} else {
					vscode.window.showInformationMessage(file + " Was Staged! 👍")
				}
			})
		}
	});
	/**
	 * Commits staged changes with message
	 */
	let committer = vscode.commands.registerCommand("git-more.commit", function () {
		if (!gm.checkIsRepo()) {
			vscode.window.showErrorMessage(not_git_dir)
			return
		}
		vscode.window.showInputBox()
			.then((value) => {
				if (value !== undefined && value !== "") {
					gm.commit(value)
					console.log(value)
					vscode.window.showInformationMessage("Committed with the message: " + value)
				} else {
					vscode.window.showErrorMessage("Canceled")
				}
			})
	})
	/**
	 * Pushes the changes to origin
	 */
	let pusher = vscode.commands.registerCommand("git-more.push", function () {
		if (!gm.checkIsRepo()) {
			vscode.window.showErrorMessage(not_git_dir)
			return;
		}
		vscode.window.showInformationMessage("Pushing Changes...")
		gm.push();
	})
	/**
	 * Pulls latest version
	 */
	let puller = vscode.commands.registerCommand("git-more.pull", function () {
		if (!gm.checkIsRepo()) {
			vscode.window.showErrorMessage(not_git_dir)
			return;
		}
		vscode.window.showInformationMessage("Pulling Changes")
		gm.pull();
	})
	context.subscriptions.push(stager, committer, pusher, puller);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
