import { App, Modal, Notice, Plugin, FuzzySuggestModal, Vault } from 'obsidian';
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
            id: 'check-root',
            name: 'Check Root',
            callback: async () => {
                const v = new Vault();
                console.log(`Vault root is`);
                console.log(v);
            }
        })

        this.addCommand({
            id: 'git-status',
            name: 'Git Status',
            callback: async () => {
                console.log("preparing to get git status...")
                console.log(`Vault root is `)

                const { stdout, stderr } = await execPromise("git status", { cwd: "/Users/kblissett/dev/mleng-knowledge-base" });

                console.log(`Git status stdout: ${stdout}`);
                console.log(`Git status stderr: ${stderr}`);

                new Notice(stdout);
            }
        });

        this.addCommand({
            id: 'git-pull',
            name: "Git Pull",
            callback: async () => {
                console.log("Preparing for a git pull");

                try {
                    const { stdout, stderr } = await execPromise("git fetch && git merge --no-commit", { cwd: "/Users/kblissett/dev/mleng-knowledge-base" });
                    console.log(`Git status stdout: ${stdout}`);
                    console.log(`Git status stderr: ${stderr}`);

                    new Notice(stdout);
                } catch (e) {
                    console.log(e.code);
                    console.log(e.message);
                    new Notice("Could not pull due to merge conflicts");
                    await execPromise("git merge --abort", { cwd: "/Users/kblissett/dev/mleng-knowledge-base" });
                }
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
