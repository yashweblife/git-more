import * as vscode from 'vscode';
import { GitMore } from './GitMore';
export function activate(context: vscode.ExtensionContext) {

	const gm = new GitMore()
	console.log('Congratulations, your extension "git-more" is now active!');

	let disposable = vscode.commands.registerCommand('git-more.stage', () => {
		gm.stageCurrentFile()
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
