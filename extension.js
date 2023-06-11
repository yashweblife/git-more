const vscode = require('vscode');
const sg = require('simple-git');
const gm = sg.simpleGit();
function activate(context) {
	const not_git_dir = "This is not a git directory";
	const command_fail = "Something went wrong with the command"
	let stager = vscode.commands.registerCommand('git-more.stage', function () {
		if(!gm.checkIsRepo()){
			vscode.window.showErrorMessage(not_git_dir)
			return
		}
		const editor = vscode.window.activeTextEditor;
		if(editor){
			const file = editor.document.uri.fsPath;
			gm.add(file, (err)=>{
				if(err){
					vscode.window.showErrorMessage(command_fail + "\n" + err.message)
				}else{
					vscode.window.showInformationMessage(file + " Was Staged! 👍")
				}
			})
		}
	});
	let committer = vscode.commands.registerCommand("git-more.commit", function(){
		if(!gm.checkIsRepo()){
			vscode.window.showErrorMessage(not_git_dir)
			return
		}
		vscode.window.showInputBox()
		.then((value)=>{
			if(value !== undefined && value !== ""){
				gm.commit(value)
				console.log(value)
				vscode.window.showInformationMessage("Committed with the message: " + value)
			}else{
				vscode.window.showErrorMessage("Canceled")
			}
		})		
	})
	let pusher = vscode.commands.registerCommand("git-more.push", function(){
		if(!gm.checkIsRepo()){
			vscode.window.showErrorMessage(not_git_dir)
			return;
		}
		gm.push();
	})
	let puller = vscode.commands.registerCommand("git-more.pull", function(){
		if(!gm.checkIsRepo()){
			vscode.window.showErrorMessage(not_git_dir)
			return;
		}
		gm.pull();
	})
	context.subscriptions.push(stager, committer, pusher, puller);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
