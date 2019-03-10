# Polytris

This project implements a version of Tetris where tetriminoes can be made with n number of smaller blocks.

It can be played at https://richteaman.github.io/Polytris/.

## Database

```
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=yourStrong(!)Password' -p 1433:1433 -d microsoft/mssql-server-linux:2017-latest
```

## Migrations

### Windows
```
ts-node node_modules/typeorm/cli.js migration:generate -n Initial
```

## Licences

Polytris is under the MIT licence.

This project uses the [Press Start 2P](http://www.fontspace.com/codeman38/press-start-2p) font.
