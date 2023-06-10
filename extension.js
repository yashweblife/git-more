const vscode = require('vscode');
const sg = require('simple-git')
const gm = sg.simpleGit();
function activate(context) {

	console.log('Congratulations, your extension "git-more" is now active!');

	let stasher = vscode.commands.registerCommand('git-more.stage', function () {
		if(!gm.checkIsRepo()){
			vscode.window.showErrorMessage("The current directory is not a git")
			return
		}
		const editor = vscode.window.activeTextEditor;
		if(editor){
			const file = editor.document.uri.fsPath;
			gm.add(file, (err)=>{
				if(err){
					vscode.window.showErrorMessage("Something went wrong with the command\n" + err.message)
				}else{
					vscode.window.showInformationMessage(file + " Was Staged! 👍")
				}
			})
		}
	});
	let committer = vscode.commands.registerCommand("git-more.commit", function(){
		if(!gm.checkIsRepo()){
			vscode.window.showErrorMessage("The current directory is not a git")
			return
		}
		vscode.window.showInputBox().then((value)=>{
			if(value !== undefined && value !== ""){
				gm.commit(value)
				console.log(value)
				vscode.window.showInformationMessage("Committed with the message: " + value)
			}else{
				vscode.window.showErrorMessage("Canceled")
			}
		})
		
	})
	context.subscriptions.push(stasher, committer);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
