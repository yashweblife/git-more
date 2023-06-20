import { SimpleGit, simpleGit } from "simple-git";
import { InputBoxOptions, window as w, workspace } from "vscode";
export class GitMore{
    public gm:(SimpleGit|null)=null;
    public currentWorkspace:string="";
    constructor(){
        const workspaceFolder = workspace.workspaceFolders;
        if(workspaceFolder && workspaceFolder.length>0){
            this.currentWorkspace = workspaceFolder[0].uri.fsPath;
            this.gm = simpleGit(this.currentWorkspace); 
        }
    }
    public stageCurrentFile(){
        if(!this.gm) return;
        const editor = w.activeTextEditor;
        if(!editor) return;
        const file = editor.document.uri.fsPath;
        this.gm.add(file,(err)=>{
            if(err){
                console.log(err)
            }
        })
    }
    public commitCurrentChanges(){
        if(!this.gm) return;
        const inputOptions:InputBoxOptions = {
            title:"Enter a Message"
        } 
        w.showInputBox(inputOptions).then((data:(string|undefined))=>{
            if(!data) return;
            if(data === undefined || data == "") return;
            this.gm?.commit(data);
        })
    }
}