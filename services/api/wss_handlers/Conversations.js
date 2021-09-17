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
        // console.log("handling this message: ", inputMessage);
        let reply = {
            replyTo: inputMessage.conversation.userList,
            conversationId: inputMessage.conversation.conversationId,
            titleText: inputMessage.conversation.titleText
        }
        return reply;
    }

    /**
     * 
     */
    getHandledMessageType() {
        return "conversation";
    }
}



module.exports = new WSSHandler();