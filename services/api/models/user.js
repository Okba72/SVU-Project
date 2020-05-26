export default class User {
    constructor(email, password){
       this.email = email;
       this.password = password
     }
  
     /**
      * 
      */
     getEmail(){
       return this.email;
     }

     static lookupUser(email, password) {
         // lookup and return user using email and password from the database

         return User(email, password);
     }
  }