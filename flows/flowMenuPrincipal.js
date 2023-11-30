const {
    addKeyword, 
    EVENTS
} = require("@bot-whatsapp/bot")
let password;
const flowMsjExit = addKeyword(EVENTS.ACTION).addAnswer(['¡Fue un gusto atenderte! Recuerda que estoy para ayudarte👋',

'Si requieres algo adicional ahora o más adelante, escribe la palabra: Menú'])
let tiempoActividad = 90000;
const flowMenuPrincipal = addKeyword(
    [
    'menu',
    'Menú'
    ])
      .addAnswer('🚛 Hola bienvenido a Bienvenido a Control Terrestre')
      .addAnswer(['Categorías disponibles:','*Cliente*', '*Proveedor*'],
      { capture: true, idle: tiempoActividad },
      async (ctx, { gotoFlow, inRef }) => {
        if (ctx?.idleFallBack) {
            return gotoFlow(flowMsjExit)
        }
    })

    module.exports = flowMenuPrincipal;
  
