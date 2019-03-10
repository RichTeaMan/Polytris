import { createDbContext } from "./src/dbContext";

async function updateDatabase() {

    try {
        const connection = await createDbContext();

        try {
            console.log("Running migrations.");
            await connection.runMigrations();
            console.log("Running migrations complete.");
        }
        catch (e) {
            console.log(e);
        }
        finally {
            await connection.close();
        }
    }
    catch (reason) {
        console.log("Failed to update database:");
        console.log(reason);
    }
}

updateDatabase();
