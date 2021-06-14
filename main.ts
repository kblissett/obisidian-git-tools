import { App, Modal, Notice, Plugin, FuzzySuggestModal } from 'obsidian';
import { exec } from 'child_process';
import { chdir } from 'process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default class MyPlugin extends Plugin {
    async onload() {
        console.log('loading Git plugin');

        this.addRibbonIcon('sync', 'Git', _ => {
            new GitFuzzySuggestModal(this.app).open();
        })

        this.addCommand({
            id: 'git-status',
            name: 'Git Status',
            callback: async () => {
                console.log("preparing to get git status...")
                chdir("/Users/kblissett/dev/mleng-knowledge-base")

                const { stdout, stderr } = await execPromise("git status");

                console.log(`Git status stdout: ${stdout}`);
                console.log(`Git status stderr: ${stderr}`);

                new SampleModal(this.app, stdout).open();
            }
        });

        this.addCommand({
            id: 'git-pull',
            name: "Git Pull",
            callback: async () => {
                console.log("Preparing for a git pull");
                chdir("/Users/kblissett/dev/mleng-knowledge-base");

                const { stdout, stderr } = await execPromise("git pull");

                console.log(`Git status stdout: ${stdout}`);
                console.log(`Git status stderr: ${stderr}`);

                new Notice(stdout);
            }
        })
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
