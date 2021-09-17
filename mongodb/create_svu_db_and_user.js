db = db.getSiblingDB('svudb');

db.runCommand({dropAllUsersFromDatabase: 1, writeConcern: {w: "majority"}});

db.dropDatabase();

db.createUser(
    {
        user: "svu_db_user",
        pwd: "svu_db_pwd",
        roles: [{role: "readWrite", db: "svudb"}]
    }
);
