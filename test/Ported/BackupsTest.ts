import { IDocumentStore, PeriodicBackupConfiguration } from "../../src";
import { disposeTestDocumentStore, sleep, TemporaryDirContext, testContext } from "../Utils/TestUtil";
import * as path from "path";
import * as fs from "fs";
import { UpdatePeriodicBackupOperation } from "../../src/Documents/Operations/Backups/UpdatePeriodicBackupOperation";
import { StartBackupOperation } from "../../src/Documents/Operations/Backups/StartBackupOperation";
import { GetPeriodicBackupStatusOperation } from "../../src/Documents/Operations/Backups/GetPeriodicBackupStatusOperation";
import { assertThat } from "../Utils/AssertExtensions";
import * as rimraf from "rimraf";
import { Stopwatch } from "../../src/Utility/Stopwatch";
import { throwError } from "../../src/Exceptions";

describe("BackupsTest", function () {

    let store: IDocumentStore;
    let temporaryDirContext: TemporaryDirContext;

    beforeEach(async function () {
        store = await testContext.getDocumentStore();
        temporaryDirContext = new TemporaryDirContext();
    });

    afterEach(async () => {
        await disposeTestDocumentStore(store);
        temporaryDirContext.dispose();
    });

    it("canBackupDatabase", async () => {
        const backupDir = path.join(temporaryDirContext.tempDir, "backup");
        fs.mkdirSync(backupDir);

        try {
            const backupConfiguration: PeriodicBackupConfiguration = {
                name: "myBackup",
                backupType: "Snapshot",
                fullBackupFrequency: "20 * * * *",
                localSettings: {
                    folderPath: path.resolve(backupDir)
                }
            };

            const operation = new UpdatePeriodicBackupOperation(backupConfiguration);
            const backupOperationResult = await store.maintenance.send(operation);

            const startBackupOperation = new StartBackupOperation(true, backupOperationResult.taskId);
            await store.maintenance.send(startBackupOperation);

            await waitForBackup(backupDir);

            await waitForBackupStatus(store, backupOperationResult.taskId);

            const backupStatus = await store.maintenance.send(
                new GetPeriodicBackupStatusOperation(backupOperationResult.taskId));

            assertThat(backupStatus)
                .isNotNull();
            assertThat(backupStatus.status)
                .isNotNull();
            assertThat(backupStatus.status.lastFullBackup instanceof Date)
                .isTrue();
            assertThat(backupStatus.status.localBackup.lastFullBackup instanceof Date)
                .isTrue();
        } finally {
            rimraf.sync(backupDir);
        }
    });
});

async function waitForBackup(backup: string) {
    const sw = Stopwatch.createStarted();

    while (sw.elapsed < 10_000) {
        const files = fs.readdirSync(backup);
        if (files.length) {
            // make sure backup was finished
            return;
        }
        await sleep(200);
    }
}

async function waitForBackupStatus(store: IDocumentStore, taskId: number) {
    const sw = Stopwatch.createStarted();

    while (sw.elapsed < 10_000) {
        const backupStatus = await store.maintenance.send(new GetPeriodicBackupStatusOperation(taskId));
        if (backupStatus && backupStatus.status && backupStatus.status.lastFullBackup) {
            return;
        }

        await sleep(200);
    }

    throwError("TimeoutException", "Unable to get expected backup status");
}
