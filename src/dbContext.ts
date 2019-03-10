import { createConnection } from "typeorm";
import "reflect-metadata";
import { Score } from "./entity/score";

export function createMasterDbContext() {

    return createConnection({
        type: "mssql",
        host: "tomserver",
        port: 1433,
        username: "sa",
        password: "Password1*",
        database: "master",
        entities: [],
        synchronize: true,
        logging: false
    });
}

export function createDbContext() {

    return createConnection({
        type: "mssql",
        host: "tomserver",
        port: 1433,
        username: "sa",
        password: "Password1*",
        database: "Polytris",
        entities: [
            Score
        ],
        synchronize: true,
        logging: false
    });
}
