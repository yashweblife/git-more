import { SimpleGit, simpleGit } from "simple-git";
import { workspace } from "vscode";
export class GitMore{
    public gm:(SimpleGit|any)
    public currentWorkspace:string="";
    constructor(){
        const workspaceFolder = workspace.workspaceFolders;
        if(workspaceFolder && workspaceFolder.length>0){
            this.currentWorkspace = workspaceFolder[0].uri.fsPath;
            this.gm = simpleGit(this.currentWorkspace); 
        }
    }
}