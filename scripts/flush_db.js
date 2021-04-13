const DB_NAME = "<database name goes here>"

db = db.getSiblingDB(DB_NAME);

db.dropDatabase();
print(`${DB_NAME} database dropped`);
