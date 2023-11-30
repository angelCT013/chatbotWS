require('dotenv').config()

class ChatGPTClass {
  queue = [];
  optionsGPT ={ model:"gpt-4-1106-preview"};
  openai = undefined;

  constructor(){
    this.init().then();
  }
  /**
   * !Funcion que inicializa el chatGPT
   */
  init = async () => {
    const { ChatGPTAPI } = await import("chatgpt");
    this.openai = new ChatGPTAPI({
      apiKey: process.env.API_KEY_CHATGPT ,
    })
  }

  /**
   * !Manejador de los mensajes
   * @param {*} ctx 
   */

  handleMsg = async (body) => {
    const interaccionChatGPT = await this.openai.sendMessage(body, {
      conversationId: !this.queue.length
      ? undefined
      : this.queue[this.queue.length - 1].conversationId,
      parentMessageId: !this.queue.length
      ? undefined
      : this.queue[this.queue.length - 1].id,
    })

    this.queue.push(interaccionChatGPT);

    return interaccionChatGPT;

  }; //Fin handleMsg

}
module.exports=ChatGPTClass;
