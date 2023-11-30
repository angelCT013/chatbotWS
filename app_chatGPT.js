require('dotenv').config()

const {
      createBot,
      createProvider,
      createFlow
      } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

/**
 * !Variables Generales
 */
let password;



/**
 * !ChatGPT
 */
const ChatGPTClass = require('./chatgpt.class')
const chatGPT= new ChatGPTClass()

/**
 * !Flows
 */
const flowMenuPrincipal = require("./flows/flowMenuPrincipal");
const { flowProveedor } = require("./flows/flowProveedor");
const { flowOrdenDeTrabajo } = require("./flows/flowOrdenDeTrabajo");
// const { flowCliente } = require("./flows/flowCliente");


/**
 * !Funcion Principal 
 * Funcionamiento del chatbot General
 */
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow(
      [
        flowMenuPrincipal,
        // flowCliente(chatGPT),
        flowProveedor(chatGPT),
        flowOrdenDeTrabajo(chatGPT),
      ])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
}

main()




