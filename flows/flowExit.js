const {
    addKeyword, 
    EVENTS
} = require("@bot-whatsapp/bot")

/**
 * !Mensaje del flujo por inactividad
 */
const flowMsjExit = addKeyword(EVENTS.ACTION).addAnswer(['¡Fue un gusto atenderte! Recuerda que estoy para ayudarte👋',

'Si requieres algo adicional ahora o más adelante, escribe la palabra: Hola'])


module.exports = flowMsjExit;
