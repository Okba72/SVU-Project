/**
 * This handler 
 */

const inputMessageSchema = {

}

 class WSSHandler {
     
    
    /**
     * 
     * @param {*} inputMessage 
     */
    async handleRequset(inputMessage) {
        console.log("handling this message: ", inputMessage);
        let reply = {
            replyTo: ["ouqbah@gaaiat.com"],
            messgaeId: 1233334,
        }
        return reply;
    }

    /**
     * 
     */
    getHandledMessageType() {
        return "message";
    }
 }



module.exports = new WSSHandler();