const vscode = require('vscode');
const sg = require('simple-git');
const path = require('path');
const fs = require('fs');
const gm = sg.simpleGit();

const not_git_dir = "This is not a git directory";
const command_fail = "Something went wrong with the command"


/**
 * Check if the workspace is a valid git repo
 * @returns Boolean
 */
function isValidGitRepo() {
	if (!gm.checkIsRepo()) {
		vscode.window.showErrorMessage(not_git_dir)
		return false
	}
	return (true);
}
function getWebViewContent(p) {
	const resPath = vscode.Uri.file(
		path.join(__dirname, p)
	)
	const file = fs.readFileSync(resPath.fsPath, 'utf-8')
	return file;
}
function activate(context) {
	// TODO: Curate more messages
	/**
	 * Stages changes
	 */
	let stager = vscode.commands.registerCommand('git-more.stage', function () {
		// TODO: make this a functions
		if (!isValidGitRepo()) {
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
		if (!isValidGitRepo()) {
			return;
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
		if (!isValidGitRepo()) {
			return;
		}
		vscode.window.showInformationMessage("Pushing Changes...")
		gm.branchLocal((error, result) => {
			if (error) {
				console.log(error)
				return;
			}
			const name = result.current
			// @ts-ignore
			gm.push('origin', name, (error, result) => {
				// @ts-ignore
				if (error) {
					vscode.window.showErrorMessage("Push Didnt Work\n" + error.message)
					return;
				}
				vscode.window.showErrorMessage(result)
			})
		})
	})
	/**
	 * Pulls latest version
	 */
	let puller = vscode.commands.registerCommand("git-more.pull", function () {
		if (!isValidGitRepo()) {
			return;
		}
		vscode.window.showInformationMessage("Pulling Changes")
		gm.pull();
	})
	/**
	 * View the app page
	 */
	let viewer = vscode.commands.registerCommand("git-more.view", function () {
		const panel = vscode.window.createWebviewPanel("git-more-view", "Git More View", vscode.ViewColumn.One, {})
		panel.webview.html = getWebViewContent("./app/index.html")

	})

	context.subscriptions.push(stager, committer, pusher, puller, viewer);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
