const vscode = require('vscode');
const sg = require('simple-git');
const path = require('path');
const fs = require('fs');
const gm = sg.simpleGit();

const not_git_dir = "This is not a git directory";
const command_fail = "Something went wrong with the command\n"

/**
 * Check if the workspace is a valid git repo
 * @returns Boolean
 */
async function isValidGitRepo() {
	vscode.window.showInformationMessage(__dirname)
	const check = await gm.checkIsRepo()
	return(check)
		
}

/**
 * Show status bar message
 * @param {*} message 
 */
function showStatusMessage(message) {
	const duration = 3000;
	const msg = vscode.window.setStatusBarMessage(message, duration)
	setTimeout(() => {
		msg.dispose()
	}, duration);
}

/**
 * Show Error
 * @param {*} message 
 */
function showError(message) {
	vscode.window.showErrorMessage(message)
}

/**
 * Get file content
 * @param {string} p 
 * @returns 
 */
function getWebViewContent(p) {
	const resPath = vscode.Uri.file(
		path.join(__dirname, p)
	)
	const file = fs.readFileSync(resPath.fsPath, 'utf-8')
	return file;
}

/**
 * Adds file to stage, dont pass it an argument to use active editor
 * @param {string} name 
 * @returns 
 */
async function stageFile(name = undefined) {
	const check = await isValidGitRepo() 
	if (!check) {
		return
	}
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const file = (name !== undefined) ? name : editor.document.uri.fsPath;
		gm.add(file, (err) => {
			if (err) {
				showError(command_fail + "\n" + err.message)
			} else {
				showStatusMessage(file + " Was Staged! 👍")
			}
		})
	}
}

/**
 * Commit Changes, opens a message box
 */
function commitChanges() {
	if (!isValidGitRepo()) {
		return;
	}
	vscode.window.showInputBox()
		.then((value) => {
			if (value !== undefined && value !== "") {
				gm.commit(value)
				console.log(value)
				showStatusMessage("Committed with the message: " + value)
			} else {
				showError("Canceled")
			}
		})
}

/**
 * Push changes to origin
 * @returns 
 */
function pushChanges() {
	if (!isValidGitRepo()) {
		return;
	}
	showStatusMessage("Pushing Changes...")
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
				showStatusMessage("Push Didnt Work\n" + error.message)
				return;
			}
			showError(result)
		})
	})
}

/**
 * Pull changes from the origin
 * @returns 
 */
function pullChanges() {
	if (!isValidGitRepo()) {
		return;
	}
	showStatusMessage("Pulling Changes")
	gm.pull();
}

/**
 * Manage the web-view system
 * @param {any} context 
 */
function handleViewer(context) {
	showStatusMessage("Viewer")
	const panel = vscode.window.createWebviewPanel("git-more-view", "Git More View", vscode.ViewColumn.One,
		{
			enableScripts: true,
			// localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath,'webview'))],
		})
	panel.webview.html = getWebViewContent("./app/index.html")
	gm.status((error, result) => {
		panel.webview.postMessage({
			message: "Hello World",
			stats: result
		})
	})
	panel.webview.onDidReceiveMessage((message) => {
		switch (message.command) {
			case 'add-to-stage':
				stageFile(message.name);
				showStatusMessage("Added: " + message.name)
				return;
		}
	}, undefined, context.subscriptions);
}

/**
 * Checkout user to specified branch
 */
function handleCheckout() {
	showStatusMessage("Checkout")
	gm.branch().then((val) => {
		vscode.window.showQuickPick(val.all).then((val) => {
			if (val) {
				gm.checkout(val, (error) => {
					if (error) {
						showError(error.message)
					} else {
						showStatusMessage("Checked Out To: " + val)
					}
				})
			}
		})
	})
}

function activate(context) {
	/**
	 * Stages changes
	 */
	
	let stager = vscode.commands.registerCommand('git-more.stage', function () {
		stageFile();
	});

	/**
	 * Commits staged changes with message
	*/
	let committer = vscode.commands.registerCommand("git-more.commit", function () {
		commitChanges()
	})
	
	/**
	 * Pushes the changes to origin
	 */
	let pusher = vscode.commands.registerCommand("git-more.push", function () {
		pushChanges()
	})
	
	/**
	 * Pulls latest version
	 */
	let puller = vscode.commands.registerCommand("git-more.pull", function () {
		pullChanges()
	})
	
	/**
	 * View the app page
	 */
	let viewer = vscode.commands.registerCommand("git-more.view", function () {
		handleViewer(context)
	})
	
	let checkouter = vscode.commands.registerCommand("git-more.checkout", function () {
		handleCheckout()
	})
	
	let merger = vscode.commands.registerCommand("git-more.merge", function(){

	})
	let newBranch = vscode.commands.registerCommand("git-more.newbranch", function(){})
	
	let fetcher = vscode.commands.registerCommand("git-more.fetcher", function(){})
	
	let syncer = vscode.commands.registerCommand("git-more.syncer", function(){})

	context.subscriptions.push(stager, committer, pusher, puller, viewer, checkouter, merger, newBranch, fetcher, syncer);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}