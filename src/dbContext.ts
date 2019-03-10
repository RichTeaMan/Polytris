import { createConnection } from "typeorm";
import { Score } from "./entity/score";


export function createDbContext() {
    return createConnection({
        type: "mssql",
        host: "localhost",
        port: 1433,
        username: "sa",
        password: "Password1*",
        database: "polytris",
        entities: [
            Score
        ],
        synchronize: true,
        logging: false
    });
}
