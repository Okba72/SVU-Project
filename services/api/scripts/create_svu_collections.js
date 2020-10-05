var db = db.getSiblingDB('svudb');

db.users.dropIndexes();
db.users.drop();

db.messages.dropIndexes();
db.messages.drop();

db.conversations.dropIndexes();
db.conversations.drop();

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
// var users = {
// 	user_id: 'ali@gaaiat.com',
// 	password: 'string12345566668888',
// 	active: false,
// 	jwt_id: '',
// 	date_last_updated: new Date(),
// };
// db.users.insert(users);

db.users.createIndex(
	{
		user_id: 1,
	},
	{ unique: true }
);

// var messages = {
// 	fromUser: 'max@some.com',
// 	toUser: 'lala@some.com',
// 	message: 'this is a test message',
// 	date_last_updated: new Date(),
// };
// db.messages.insert(messages);

db.conversations.createIndex({ user_list: 1, date_last_updated: -1 });


// var files = {
// 	fromUser: 'max@some.com',
// 	toUser: 'lala@some.com',
// 	file_path: '/files/test1.txt',
// 	date_last_updated: new Date(),
// };
// db.files.insert(files);

db.files.createIndex({ fromUser: 1, toUser: 1, file_path: 1 });
