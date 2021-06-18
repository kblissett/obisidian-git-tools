import { exec as callbackExec } from 'child_process';
import { promisify } from 'util';



export default class Git {
    constructor(private path: string) { }

    private exec(command: string) {
        return promisify(callbackExec)(command, { cwd: this.path });
    }

    async status(): Promise<string> {
        const { stdout, stderr } = await this.exec("git status");
        const message = `${stdout}\n${stderr}`;
        return message;
    }

    async getBranches(): Promise<string[]> {
        const { stdout: rawBranches } = await this.exec("git for-each-ref --format '%(refname)' refs/heads | xargs -n1 basename");
        return rawBranches.split("\n");
    }

    async checkout(branch: string, create = false): Promise<void> {
        try {
            await this.exec(`git checkout ${create ? "-b" : ""} ${branch}`);
        } catch (e) {
            throw new Error(`checkout failed: error code: ${e.code} message: ${e.message}`);
        }
        return Promise.resolve();
    }

    async push(): Promise<string> {
        const { stdout, stderr } = await this.exec("git push");
        return [stdout, stderr].join("\n");
    }

    private async canPullSafely(): Promise<boolean> {
        try {
            await this.exec("git fetch && git merge --no-commit");
            await this.exec("git merge --abort");
        } catch {
            return false;
        }
        return true;
    }

    async pull(): Promise<string> {
        if (this.canPullSafely()) {
            const { stdout, stderr } = await this.exec("git pull");
            return [stdout, stderr].join("\n");
        } else {
            Promise.reject(new Error("Could not pull safely"));
        }
    }
}