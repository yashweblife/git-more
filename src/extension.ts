import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "git-more" is now active!');

	let disposable = vscode.commands.registerCommand('git-more.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from !');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
