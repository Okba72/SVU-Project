var db = db.getSiblingDB('svudb');

db.users.dropIndexes();
db.users.drop();

db.messages.dropIndexes();
db.messages.drop();

db.files.dropIndexes();
db.files.drop();

/**********************************************************************
 *
 *
 */

/**
 * authorization_request expiration index:
 */
// db.authorization_request.createIndex(
// 	{
// 		expire_on: 1,
// 	},
// 	{ expireAfterSeconds: 600 }
// );

/*********************************************************************
 *
 *
 */

/**
 * user messages collection
 */
var users = {
	username: 'ouqbah@gmail.com',
	password: 'SomeMagic#123',
	date_last_updated: new Date(),
};

db.users.insert(users);

db.users.createIndex(
	{
		username: 1,
	},
	{ unique: true }
);

var messages = {
	fromUser: 'max@some.com',
	toUser: 'lala@some.com',
	message: 'this is a test message',
	date_last_updated: new Date(),
};

db.messages.insert(messages);

db.messages.createIndex({ fromUser: 1, toUser: 1 });

var files = {
	fromUser: 'max@some.com',
	toUser: 'lala@some.com',
	file_path: '/files/test1.txt',
	date_last_updated: new Date(),
};

db.files.insert(files);

db.files.createIndex({ fromUser: 1, toUser: 1, file_path: 1 });