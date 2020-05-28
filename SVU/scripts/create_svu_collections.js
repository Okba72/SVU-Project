var db = db.getSiblingDB('svudb');

db.users.dropIndexes();
db.users.drop();

db.user_messages.dropIndexes();
db.user_messages.drop();

db.user_files.dropIndexes();
db.user_files.drop();

/**********************************************************************
 *
 *
 */
var users = {
	date_last_updated: new Date(),
};
db.users.insert(users);

/**
 * authorization_request expiration index:
 */
// db.authorization_request.createIndex(
// 	{
// 		expire_on: 1,
// 	},
// 	{ expireAfterSeconds: 600 }
// );

db.users.remove({});

/*********************************************************************
 *
 *
 */

/**
 * user messages collection
 */
var users = {
	username: 'okba',
	password: 'some_magic',
	date_last_updated: new Date(),
};

db.users.insert(users);

db.users.createIndex(
	{
		username: 1,
	},
	{ unique: true }
);

var user_messages = {
	fromUser: 'Max',
	toUser: 'Lala',
	message: 'this is a test message',
	date_last_updated: new Date(),
};

db.user_messages.insert(user_messages);

db.user_messages.createIndex({ fromUser: 1, toUser: 1 });

var user_files = {
	fromUser: 'Max',
	toUser: 'Lala',
	file_path: '/files/test1.txt',
	date_last_updated: new Date(),
};

db.user_files.insert(user_files);

db.user_files.createIndex({ fromUser: 1, toUser: 1, file_path: 1 });
