/**
 * 
 */
"use strict";

/**
 * @swagger
 *
 * definitions:
 *   User:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 */
class User {
  constructor(email, password) {
    this.email = email;
    this.password = password
  }

  /**
   * 
   */
  getEmail() {
    return this.email;
  }

  static lookupUser(email, password) {
    // lookup and return user using email and password from the database

    return User(email, password);
  }
}

export default User;