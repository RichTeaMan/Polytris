import { createMasterDbContext } from "./src/dbContext";

async function createDatabase() {
    try {
        const masterConnection = await createMasterDbContext();

        try {
            console.log("Creating database.");
            await masterConnection.query("CREATE DATABASE [Polytris]");
            console.log("Creating database complete.");
        }
        catch (e) {
            console.log(e);
        }
        finally {
            await masterConnection.close();
        }
    }
    catch (reason) {
        console.log("Failed to create database:");
        console.log(reason);
    }
}

createDatabase();
