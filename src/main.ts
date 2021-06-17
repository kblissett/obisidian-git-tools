import { App, FileSystemAdapter, Modal, Notice, Plugin } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default class MyPlugin extends Plugin {
    vaultRoot: string = (this.app.vault.adapter as FileSystemAdapter).getBasePath()
    async onload(): Promise<void> {
        console.log('loading Git plugin');

        this.addCommand({
            id: 'git-status',
            name: 'Git Status',
            callback: async () => {
                console.log("preparing to get git status...");
                const { stdout, stderr } = await execPromise("git status", { cwd: this.vaultRoot });

                console.log(`Git status stdout: ${stdout}`);
                console.log(`Git status stderr: ${stderr}`);

                new Notice(stdout);
            }
        });

        this.addCommand({
            id: 'git-commit',
            name: "Commit",
            callback: async () => {
                new CommitModal(this.app).open();
            }
        });

        this.addCommand({
            id: 'git-pull',
            name: "Pull",
            callback: async () => {
                console.log("Preparing for a git pull");

                try {
                    const { stdout, stderr } = await execPromise("git fetch && git merge --no-commit", { cwd: this.vaultRoot });
                    console.log(`Git status stdout: ${stdout}`);
                    console.log(`Git status stderr: ${stderr}`);

                    new Notice(stdout);
                } catch (e) {
                    console.log(e.code);
                    console.log(e.message);
                    new Notice("Could not pull due to merge conflicts");
                    await execPromise("git merge --abort", { cwd: this.vaultRoot });
                }
            }
        });

        this.addCommand({
            id: 'git-push',
            name: "Push",
            callback: async () => {
                console.log("Preparing for a git push");

                try {
                    const { stdout, stderr } = await execPromise("git push", { cwd: this.vaultRoot });

                    console.log(`Git status stdout: ${stdout}`);
                    console.log(`Git status stderr: ${stderr}`);
                    if (!stdout) {
                        new Notice(stderr);
                    } else {
                        new Notice(stdout);
                    }

                } catch (e) {
                    console.log(e.code);
                    console.log(e.message);
                    new Notice("Could not push");
                }
            }
        });
    }
}



class CommitModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    async gitCommit(message: string) {
        try {
            const { stdout, stderr } = await execPromise(`git commit -am '${message}'`, { cwd: (this.app.vault.adapter as FileSystemAdapter).getBasePath() });
            new Notice(stdout);
            console.log(stderr);
        } catch (e) {
            console.log(e.code);
            console.log(e.message);
            new Notice(`Could not commit: ${e.message}`);
        }
    }

    onOpen() {
        this.contentEl.innerHTML = `
<div>
    <h1>Commit</h1>
    <label for="commitMessageField">Commit Message<br></label>
    <input type="text" class="commitInput" style="width: 100%;" name="commitMessageField">
</div>
`;
        const modalInput: HTMLInputElement = document.querySelector('.commitInput');
        modalInput.onkeydown = async (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                const message = (e.target as HTMLInputElement).value;
                await this.gitCommit(message);
                this.close();
            }
        };
        modalInput.focus();
    }

    onClose() {
        this.contentEl.empty();
    }
}
