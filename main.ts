import { App, Modal, Notice, Plugin, Vault, FuzzySuggestModal } from 'obsidian';
import { exec } from 'child_process';
import { cwd, chdir } from 'process';
import { readdir } from 'fs/promises';
import { promisify } from 'util';


export default class MyPlugin extends Plugin {
    async onload() {
        console.log('loading Git plugin');

        this.addRibbonIcon('sync', 'Git', (event) => {
            new GitFuzzySuggestModal(this.app).open();
        })

        this.addCommand({
            id: 'git-status',
            name: 'Git Status',
            callback: async () => {
                console.log("preparing to get git status...")
                const vault = new Vault();
                const path = vault.getRoot().path;

                const execPromise = promisify(exec)

                chdir("/Users/kblissett/dev/mleng-knowledge-base")
                console.log(`Root is ${path}`);
                console.log(`cwd is: ${cwd()}`);

                const files = await readdir(cwd());
                for (const file of files)
                    console.log(`Found file: ${file}`);

                const { stdout, stderr } = await execPromise("git status");

                console.log(`Git status stdout: ${stdout}`);
                console.log(`Git status stderr: ${stderr}`);

                new SampleModal(this.app, stdout).open();

            }
        });
    }
}

class SampleModal extends Modal {
    text: string

    constructor(app: App, text: string) {
        super(app);
        this.text = text;
    }

    onOpen() {
        let { contentEl } = this;
        contentEl.setText(`# My Modal\n${this.text}`);
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

export class GitFuzzySuggestModal extends FuzzySuggestModal<string> {
    getItems(): string[] {
        return ["status"];
    }
    getItemText(item: string): string {
        return item;
    }
    onChooseItem(item: string, _: MouseEvent | KeyboardEvent): void {
        console.log(`You chose ${item}`);

        const actions = {
            "status": async () => {
                console.log("preparing to get git status...")
                const execPromise = promisify(exec)

                chdir("/Users/kblissett/dev/mleng-knowledge-base")

                const { stdout, stderr } = await execPromise("git status");

                console.log(`Git status stdout: ${stdout}`);
                console.log(`Git status stderr: ${stderr}`);

                new SampleModal(this.app, stdout).open();
            }
        }

        actions[item]().then(console.log(`done with ${item}`));
    }

}
