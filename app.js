require('dotenv').config()

const {
      createBot,
      createProvider,
      createFlow,
      addKeyword,
      EVENTS
      } = require('@bot-whatsapp/bot')
const axios = require('axios')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

/**
 * !ChatGPT
 */
const ChatGPTClass = require('./chatgpt.class')
const chatGPT= new ChatGPTClass()

/**
 * !Variables utilizadas durante el flujo
 *  @param {El tiempo en milisegundos que permanezcan inactivo el usuario} tiempoActividad
 */
let usuario=null;
let odt;
let password=null;
let datos;
const soloNumeros = /^\d+$/;
let tiempoActividad = 180000;

/**
 * !Mensaje del flujo por inactividad
 */
const flowMsjExit = addKeyword(EVENTS.ACTION)
.addAnswer(['¡Fue un gusto atenderte! Recuerda que estoy para ayudarte👋',

'Si requieres algo adicional ahora o más adelante, escribe la palabra: Menú'])


const flowOpciones = addKeyword(EVENTS.ACTION)
  .addAnswer(
    ['¿Te puedo ayudar en algo más?', 'Opciones :', '*Orden de Trabajo*'],
    { capture: true },
    async (ctx, { gotoFlow,flowDynamic }) => {
      let idleTimer;

      const startIdleTimer =() => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(async () => {
          // Lógica a ejecutar en caso de inactividad global
          // console.log('Inactividad global detectada');
          const textExit = await chatGPT.handleMsg(`Despidete de manera amable utilizando de 1 a 3 emojis recordando que fue un gusto atenderlo y que si requiere mas informacion puede escribir la palabra Menú`, { temperature: 0.8 });
          await flowDynamic(textExit.text);
          // gotoFlow(flowMsjExit);
        }, tiempoActividad);
      };

      // Reiniciar el temporizador al recibir un mensaje
      startIdleTimer();


      startIdleTimer();
    }
  );


const flowPrincipal = addKeyword(
  [
  'menu',
  'Menú'
  ])
    // .addAnswer('🚛 Hola bienvenido a Bienvenido a Control Terrestre')
    .addAction(async (ctx, { endFlow, flowDynamic, provider, gotoFlow }) => {
  
      /**
       * !ChatGPT Actua
       * Iniciamos activando el Rol
       */
      await chatGPT.handleMsg(`Eres un asistente virtual de la empresa de logistica llamada Control Terrestre eres encargado de ayudara consultar información los usuarios a obtener informacion de sus ordenes de trabajo.`, { temperature: 0.8 });



      // ctx.shouldSkip = true;
  
      const textFromAI = await chatGPT.handleMsg(`Da la bienvenida amable y brevemente utilizando 1 - 3 Emojis siendo el asistente virtual de la empresa de logistica llamada Control Terrestre diciendo que acontinuacion le mostraremos la categorias disponibles`, { temperature: 0.8 });
      await flowDynamic(textFromAI.text);
    })
    .addAnswer(['*Cliente*', '*Proveedor*'],
    { capture: true, idle: tiempoActividad },
    async (ctx, { gotoFlow, inRef,flowDynamic }) => {
      if (ctx?.idleFallBack) {
        const textExitPrincipal = await chatGPT.handleMsg(`Despidete de manera amable utilizando de 1 a 3 emojis recordando que fue un gusto atenderlo y que si requiere mas informacion puede escribir la palabra Menú`, { temperature: 0.8 });
       return await flowDynamic(textExitPrincipal.text);
          // return gotoFlow(flowMsjExit)
      }
  })


const flowClienteStart = addKeyword(['cliente'])
.addAnswer(['Ingrese la *Contraseña*'],{capture:true}, async (ctx)=>{
  password=ctx.body
})
.addAnswer(['Seleccione la Opción :','*Orden de Trabajo*'],{capture:true},(ctx)=>{
  usuario='cliente'
})

const flowProveedorStart = addKeyword(['proveedor'])
.addAnswer(['Ingrese la *Contraseña*'],{capture:true}, async (ctx,{flowDynamic})=>{
  password=ctx.body
})
.addAnswer(['Seleccione la Opción:','*Orden de Trabajo*'],{capture:true},(ctx)=>{
  usuario='proveedor'
})


const flowOdt = addKeyword(['odt', 'orden de trabajo', 'orden trabajo'])
  .addAnswer(['Ingrese la *Orden de Trabajo*'],{capture:true},async (ctx, {flowDynamic,fallBack,endFlow,gotoFlow})=>{
  // console.log(ctx);
    if (password === undefined || password === null) {
      const textPassNull = await chatGPT.handleMsg(`De manera amable utilizando de 1 a 3 emojis le recordamos al usuario que la contraseña no esta definida invitandolo a navegar utilizando la palabra Menú para que conozca nuestras opciones y servicios`, { temperature: 0.8 });
     await flowDynamic(textPassNull.text);

      return await endFlow();
    }

  if (ctx.body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'menu') {

    /**
     * !Reiniciamos Variables
     * */
    usuario=null;
    password=null;
    return await flowDynamic(flowPrincipal);
  }
  if (!soloNumeros.test(ctx.body)){
    const textPassNull = await chatGPT.handleMsg(`De manera amable utilizando de 1 a 3 emojis le recordamos al usuario que la orden de trabajo solo acepta números`, { temperature: 0.8 });
    await flowDynamic(textPassNull.text);
    // await flowDynamic(['La orden de trabajo solo debe contener números'].join('\n\n'));

    return fallBack();
  }

  odt=ctx.body
  const data = await dataOdt(odt, password)
  // console.log(data); //Eliminar al terminar
  if(data.success==false){
    let mensajeError = data.message;
    // await flowDynamic([data.message,'Escribir Ménu para regresar al navegador principal'].join('\n\n'));
    const textMsjError = await chatGPT.handleMsg(`Eres un asistente virtual de la empresa de logistica llamada Control Terrestre de manera amable utilizando de 1 a 3 emojis le menscionamos lo indicado por este mensaje ${mensajeError} y que para regresar al navegador principal escriba Menú
    IMPORTANTE: NO ESCRIBAS Lo siento, como modelo de lenguaje basado en texto, no puedo mostrar emojis directamente. Sin embargo, puedo describirlos para ti, NI NADA MENCIONADO A QUE ERES UN MODELO DE LENGUAJE`, { temperature: 0.8 });
    await flowDynamic(textMsjError.text);
    return fallBack();
  }
  datos=data.data
  var datosString = JSON.stringify(datos);
  // console.log(datosString);
  const textDatosOdt = await chatGPT.handleMsg(` Al recibir una lista ${datosString} de la informacion de la odt que se te mandara en un objeto donde cada dato de la lista significa lo siguiente:
  Odt = es el numero de identificacion de la orden de trabajo,
  Folio = es el numero de folio de la orden de trabajo,
  Etapa = es la etapa que se encuentra nuestra orden de trabajo, en caso de que Estatus no venga vacio se concatena a la etapa separandolos con una coma ",",
  Origen = es el lugar de origen del cual sale la carga de nuestra orden de trabajo,
  Destino = es el lugar a donde se dirige la carga de nuestra orden de trabajo,
  Economico = es el numero economico de nuestro transporte que esta asignado a la orden de trabajo,
  Remolque = es el numero de remolque de nuestro transporte que esta asignado a la orden de trabajo,
  NombreOperador = es el operador o chofer quien maneja el transporte asignado a la orden de trabajo,
  CitaCargaSitio = es la fecha y hora establecida para la carga del camion ,
  CitaDescargaSitio = es la fecha y hora establecida para descargar el camion,
  SalidaCarga = es la fecha y hora en la que el camion salio del lugar de carga,
  SalidaDescarga = es la fecha y hora en la que el camion salio del lugar de descarga,
  UltimaActualizacion = es la fecha y hora de la ultima actualizacion de informacion que tuvo nuestra orden de trabajo,
  CartaPorte = es el mensaje que determina si nuetra orden de trabajo tiene una carta porte o no,
  dada esta informacion de los posibles datos recibidos siempre se mostraran los datos que no se te den vacios del objeto que recibes mostrando los datos con un titulo y un icono, este es un ejemplo de los titulos dependiendo el dato y los iconos que puedes utilizar para cada informacion, recuerda que a veces te pueden solicitar nada mas una informacion especifica de estos datos y son solo los que devolveras.
  NO MENCIONES LOS CAMPOS QUE VIENEN VACIOS
  ejemplo de titulos:
  '🔢 *Odt:*  Odt',
  '📜 *Folio:* Folio',
  '📝 *Etapa:* Etapa'  y si Estatus existe agregarlo con etapa separandolo con una coma ","
  '🏠 *Origen:* Origen' 
  '📍 *Destino:* Destino'
  '🚚 *Economico:* Economico' 
  '🚛 *Remolque:* Remolque' 
  '👤 *Nombre del Operador:* NombreOperador' 
  '📅 *Cita de Carga:* CitaCargaSitio'
  '📅 *Cita de Descarga:* CitaDescargaSitio' 
  '📅 *Salida de Carga:* SalidaCarga'
  '📅 *Salida de Descarga:* SalidaDescarga'
  '🔄 *Última Actualización:* UltimaActualizacion' 
  '📄 *Carta Porte:* CartaPorte'`, { temperature: 0.8 });
  await flowDynamic(textDatosOdt.text);
  // return fallBack();

  // datos.Etapa=
  // await flowDynamic([
  //   '🔢 *Odt:* ' + datos.Odt,
  //   datos.Folio ? '📜 *Folio:* ' + datos.Folio : '',
  //   datos.Estatus ? '📝 *Etapa:* ' + datos.Etapa +', '+datos.Estatus : '📝 *Etapa:* ' + datos.Etapa,
  //   '🏠 *Origen:* ' + datos.Origen,
  //   '📍 *Destino:* ' + datos.Destino,
  //   datos.Economico ? '🚚 *Economico:* ' + datos.Economico : '',
  //   datos.Remolque ? '🚛 *Remolque:* ' + datos.Remolque : '',
  //   datos.NombreOperador ? '👤 *Nombre del Operador:* ' + datos.NombreOperador : '',
  //   '📅 *Cita de Carga:* ' + datos.CitaCargaSitio,
  //   '📅 *Cita de Descarga:* ' + datos.CitaDescargaSitio,
  //   datos.SalidaCarga ? '📅 *Salida de Carga:* ' + datos.SalidaCarga : '',
  //   datos.SalidaDescarga ? '📅 *Salida de Descarga:* ' + datos.SalidaDescarga : '',
  //   '🔄 *Última Actualización:* ' + datos.UltimaActualizacion,
  //   '📄 *Carta Porte:* ' + datos.CartaPorte,

  // ].filter(linea => linea.trim() !== '').join('\n\n'));
  // return gotoFlow(flowOpciones)

})
.addAnswer(
  `Tienes otra pregunta? o duda?`,
  {capture:true},
  async (ctx,{fallBack})=>{
    const textContinue = await chatGPT.handleMsg(ctx.body, { temperature: 0.8 });
    const palabrasClave = ['menu', 'odt', 'orden de trabajo', 'orden trabajo', 'proveedor', 'cliente'];

    if (!palabrasClave.some(palabra => ctx.body.toLowerCase().includes(palabra))) {
    await fallBack(textContinue.text);
    }
  })


/**
 * !Flujo palabras no registradas en el flujo
 */
const flowEvents = addKeyword(EVENTS.WELCOME)
    .addAnswer([
    'Soy tu Control Terrestre - Bot  🤖  con gusto buscaré la mejor manera de apoyarte o brindarte la información que buscas.',
    // 'Te invitamos a navegar en el menú para que conozcas todas las opciones validas y servicios que te brindamos. Puedes hacerlo ahora colocando la palabra: Menú'
  ].join('\n\n')
  )

/**
 * !Estructura principal para el chat bot
 * @param {manejador de flujos} adapterFlow
 */
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow(
      [
        flowPrincipal,
        flowClienteStart,
        flowProveedorStart,
        flowOdt,
        // flowEvents
      ])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    // createBotGTP({
    //   provider: adapterProvider,
    //   database: adapterDB,
    // })

    QRPortalWeb()
}
/**
 *
 * @param {Odt} odt
 * @param {Contraseña Proveedor/Cliente} pass
 * @returns
 */
const dataOdt = async(odt, pass)=>{
  let url;
  switch (usuario) {

    case 'proveedor':
        // url= `${process.env.PUBLIC_API_URL}chatbot/v1/proveedores/infoOdt`;
        url = `${process.env.PUBLIC_API_URL}chatbot/v1/proveedores/infoOdt`;

      break;
    case 'cliente':
        // url= `${process.env.PUBLIC_API_URL}chatbot/v1/clientes/infoOdt`;
        url = `${process.env.PUBLIC_API_URL}chatbot/v1/clientes/infoOdt`;

      break;

  }
  const objData = {
    Password: pass,
    Odt: odt
  };
  let resp = await PostData(url,objData)
   return resp.data;
}

 const PostData = async (url, data) => {

  return axios
    .post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
    .then(response => response)
    .catch(response => response)
}

main()




