const vscode = require('vscode');
const sg = require('simple-git');
const path = require('path');
const fs = require('fs');
const not_git_dir = "This is not a git directory";
const command_fail = "Something went wrong with the command\n"

/**
 * Check if the workspace is a valid git repo
 * @returns Boolean
 */


class Manager {
	/**
	 * @type {import('simple-git').SimpleGit} gm
	 */
	constructor() {
		const workspaceFolder = vscode.workspace.workspaceFolders;
		if (workspaceFolder && workspaceFolder.length > 0) {
			const projectDir = workspaceFolder[0].uri.fsPath;
			this.gm = sg.simpleGit(projectDir);
		}
	}
	stageCurrentFile() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const file = editor.document.uri.fsPath;
			console.log(`Staging File: ${file}`)
			this.gm.add(file, (err) => {
				if (err) {
					showError(command_fail + "\n" + err.message);
				} else {
					showStatusMessage(file + " Was Staged! 👍");
				}
			})
		} else {
			console.log("This is not a valid editor");
		}
	}
	commitStagedChanges() {
		vscode.window.showInputBox()
			.then((value) => {
				if (value !== undefined && value !== "") {
					this.gm.commit(value);
					console.log(value);
					showStatusMessage("Committed with the message: " + value);
				} else {
					showError("Canceled");
				}
			})
	}
	addToStaging() {
		this.gm.status((err, res)=>{
			if(err){
				return
			}
			console.log(res)
		})
	}
	pushToRemote() {
		showStatusMessage("Pushing Changes...");
		this.gm.branchLocal((error, result) => {
			if (error) {
				console.log(error)
				return;
			}
			const name = result.current;
			// @ts-ignore
			this.gm.push('origin', name, (error, result) => {
				// @ts-ignore
				if (error) {
					showStatusMessage("Push Didnt Work\n" + error.message);
					return;
				}
				showError(result)
			})
		})
	}
	pullChanges() {
		showStatusMessage("Pulling Changes");
		this.gm.pull();
	}
	checkoutBranch() { }
	createBranch() { }
	deleteBranch() { }
	handleMerge() { }
	handleInit() { }
}

async function isValidGitRepo(gm) {
	const check = await gm.checkIsRepo();
	return (check);
}

/**
 * Show status bar message
 * @param {*} message 
 */
function showStatusMessage(message) {
	const duration = 3000;
	const msg = vscode.window.setStatusBarMessage(message, duration);
	setTimeout(() => {
		msg.dispose();
	}, duration);
}

/**
 * Show Error
 * @param {*} message 
 */
function showError(message) {
	vscode.window.showErrorMessage(message);
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
	const file = fs.readFileSync(resPath.fsPath, 'utf-8');
	return file;
}

/**
 * Adds file to stage, dont pass it an argument to use active editor
 * @returns 
 */
async function stageFile(data) {
	const { name, gm } = data;
	const check = await isValidGitRepo(gm);
	if (!check) {
		console.log("This is not a valid git repo");
		return;
	}
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const file = (name !== undefined) ? name : editor.document.uri.fsPath;
		console.log(`Staging File: ${file}`)
		gm.add(file, (err) => {
			if (err) {
				showError(command_fail + "\n" + err.message);
			} else {
				showStatusMessage(file + " Was Staged! 👍");
			}
		})
	} else {
		console.log("This is not a valid editor");
	}
}

async function addToStaging(data) {
	const { gm } = data
	console.log("Add to staging")
	gm.status((err, res)=>{
		if(err){
			return
		}
		let list = res.files.map(f=>f.path)
		if(list.length>0){
			vscode.window.showQuickPick(list, {
				canPickMany: true,
				placeHolder: "Select files to add to staging"	
			}).then((picks)=>{
				if(!picks) return
				picks.forEach(p=>{
					gm.add(p)
				})
			})
		}
	})
}

/**
 * Commit Changes, opens a message box
 */
function commitChanges(gm) {
	if (!isValidGitRepo(gm)) {
		return;
	}
	vscode.window.showInputBox()
		.then((value) => {
			if (value !== undefined && value !== "") {
				gm.commit(value);
				console.log(value);
				showStatusMessage("Committed with the message: " + value);
			} else {
				showError("Canceled");
			}
		})
}

/**
 * Push changes to origin
 * @returns 
 */
function pushChanges(gm) {
	if (!isValidGitRepo(gm)) {
		return;
	}
	showStatusMessage("Pushing Changes...");
	gm.branchLocal((error, result) => {
		if (error) {
			console.log(error)
			return;
		}
		const name = result.current;
		// @ts-ignore
		gm.push('origin', name, (error, result) => {
			// @ts-ignore
			if (error) {
				showStatusMessage("Push Didnt Work\n" + error.message);
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
function pullChanges(gm) {
	if (!isValidGitRepo(gm)) {
		return;
	}
	showStatusMessage("Pulling Changes");
	gm.pull();
}

/**
 * Manage the web-view system
 * @param {any} data 
 */
function handleViewer(data) {
	const { context, gm } = data;
	showStatusMessage("Viewer");
	const panel = vscode.window.createWebviewPanel("git-more-view", "Git More View", vscode.ViewColumn.One,
		{
			enableScripts: true,
			// localResourceRoots:[vscode.Uri.file(path.join(context.extensionPath,'webview'))],
		})
	panel.webview.html = getWebViewContent("./app/index.html");
	gm.status((error, result) => {
		panel.webview.postMessage({
			message: "Hello World",
			stats: result
		});
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
function handleCheckout(gm) {
	showStatusMessage("Checkout");
	gm.branch().then((val) => {
		vscode.window.showQuickPick(val.all).then((val) => {
			if (val) {
				gm.checkout(val, (error) => {
					if (error) {
						showError(error.message);
					} else {
						showStatusMessage("Checked Out To: " + val);
					}
				})
			}
		})
	})
}
/**
 * Create a new branch
 * @param {import('simple-git').SimpleGit} gm 
 */
function createNewBranch(gm) {
	vscode.window.showInputBox({}).then((val) => {
		gm.status((error, result) => {
			if (error) { return }
			if (result) {
				gm.checkoutBranch(val, result.current);
			}
		})

	})
}
/**
 * Merge a branch into the current branch
 * @param {import('simple-git').SimpleGit} gm 
 */
function handleMergeBranch(gm) {
	gm.branch().then((val) => {
		vscode.window.showQuickPick(val.all).then((val) => {
			gm.merge([val]);
		})
	})
}

/**
 * Fetch origin changes
 * @param {import('simple-git').SimpleGit} gm 
 */
function handleFetch(gm) {
	gm.fetch();
}
/**
 * Fetch origin changes
 * @param {import('simple-git').SimpleGit} gm 
 */
function handleInit(gm) {
	gm.init();
}
function activate(context) {
	/**
	 * Stages changes
	 */
	let gm = undefined;
	const workspaceFolder = vscode.workspace.workspaceFolders;
	if (workspaceFolder && workspaceFolder.length > 0) {
		const projectDir = workspaceFolder[0].uri.fsPath;
		gm = sg.simpleGit(projectDir);
	} else {
		vscode.window.showErrorMessage("Not a valid project folder");
		return;
	}


	let stager = vscode.commands.registerCommand('git-more.stage', function () {
		stageFile({ gm: gm, name: undefined });
	});

	/**
	 * Commits staged changes with message
	*/
	let committer = vscode.commands.registerCommand("git-more.commit", function () {
		commitChanges(gm);
	})

	/**
	 * Pushes the changes to origin
	 */
	let pusher = vscode.commands.registerCommand("git-more.push", function () {
		pushChanges(gm);
	})

	/**
	 * Pulls latest version
	 */
	let puller = vscode.commands.registerCommand("git-more.pull", function () {
		pullChanges(gm);
	})

	/**
	 * View the app page
	 */
	let viewer = vscode.commands.registerCommand("git-more.view", function () {
		handleViewer({ context: context, gm: gm });
	})

	/**
	 * CheckOut to another branch
	 */
	let checkouter = vscode.commands.registerCommand("git-more.checkout", function () {
		handleCheckout(gm);
	})
	/**
	 * Merge a branch into the current branch
	 */
	let merger = vscode.commands.registerCommand("git-more.merge", function () {
		handleMergeBranch(gm);
	})
	/**
	 * Create a new branch
	 */
	let newBranch = vscode.commands.registerCommand("git-more.newbranch", function () {
		createNewBranch(gm);
	})
	/**
	 * fetch origin changes
	 */
	let fetcher = vscode.commands.registerCommand("git-more.fetcher", function () {
		handleFetch(gm);
	})
	let stageSelector = vscode.commands.registerCommand("git-more.stageSelector", function () {
		addToStaging({ gm: gm });
	})
	let initializer = vscode.commands.registerCommand("git-more.init", function () {
		handleInit(gm)
	})

	context.subscriptions.push(stager, committer, pusher, puller, viewer, checkouter, merger, newBranch, fetcher, stageSelector);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}