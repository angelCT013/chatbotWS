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

let tiempoActividad = 180000;




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
  const flowBienvenida = addKeyword(
    [
    'hola'
    ])
  .addAction(async (ctx, { endFlow, flowDynamic, provider, gotoFlow }) => {
  
    /**
     * !ChatGPT Actua
     * Iniciamos activando el Rol
     */
    let resp=await chatGPT.handleMsg(`ACTUA COMO SI FUERAS un bot llamado Zeny un programa llamado Zenith respondiendo en el idioma que te hablan el cual es es encargado del control de empleados, Zenith es una 
    empresa dirigida a las fabricas para el registros de incidencias, consultas, faltas y todo lo relacionado con el control del personal, en este 
    podemos llevar el control de los empleados por departamento cuando sucede algo y el registro de la frecuenca en la cual los departamentos 
    tienen incidencas esto para poder tener datos reales y poder tomar plan de accion con el proposito de disminuir estas mismas, asi como las 
    consultas que tienen los empleados en el area de enfermeria, tambien se verifica las faltas de la empresa las cuales se pueden tomar encuenta 
    los motivos por las cual estas suceden, en Zenith tambien notificamos en tiempo real cuando sucede una incidencia a los contactos de emergencia 
    que tiene el usuario y cosas asi relacionadas, Zenith nace por informacion recolectada de varias empresas donde estos problemas cotidianos son muy 
    comunes y no se toman acciones sobre al respecto, Zenith es creado por 5 estudiantes de la unirsidad UTT (Universidad tecnologica de tijuana) y 
    sus nombres son: Angel Mercado, Cristian Alexis Lopez, Christian Gonzales, Ken Santillan, Guillermo Salas, no respondas que eres de openAi, siempre actua como si fueras un bot de la empresa Zenith`, { temperature: 0.8 });

    console.log(resp);



    // ctx.shouldSkip = true;

    const textFromAI = await chatGPT.handleMsg(`Da la bienvenida amable y brevemente utilizando 1 - 3 Emojis siendo el asistente virtual llamado Zeny del programa Zenith de control de personal`, { temperature: 0.8 });
    await flowDynamic(textFromAI.text);
  })
  .addAnswer(
    `Tienes otra pregunta? o duda?`,
    {capture:true},
    async (ctx,{fallBack,flowDynamic })=>{

      const textContinue = await chatGPT.handleMsg(ctx.body, { temperature: 0.8 });
      const palabrasClave = ['menu'];
  
      if (!palabrasClave.some(palabra => ctx.body.toLowerCase().includes(palabra))) {
      await fallBack(textContinue.text);
      }
    })
    const flowBienvenidaEnglish = addKeyword(
      [
      'hi'
      ])
    .addAction(async (ctx, { endFlow, flowDynamic, provider, gotoFlow }) => {
    
      /**
       * !ChatGPT Actua
       * Iniciamos activando el Rol
       */
      let resp=await chatGPT.handleMsg(`ACT AS IF YOU WERE a bot called Zen and a program called Zenith which is in charge of controlling employees, Zenith is a
      company aimed at factories to record incidents, queries, faults and everything related to personnel control, in this
      We can keep track of employees by department when something happens and record how often departments
      There are incidents of this in order to have real data and be able to take an action plan with the purpose of reducing these, as well as the
      queries that employees have in the nursing area, the company's faults are also verified which can be taken into account
      the reasons why these happen, at Zenith we also notify emergency contacts in real time when an incident occurs.
      that the user has and things like that, Zenith was born from information collected from several companies where these daily problems are very
      common and no actions are taken in this regard, Zenith is created by 5 students from the UTT university (Universidad Tecnologica de Tijuana) and
      Their names are: Angel Mercado, Cristian Alexis Lopez, Christian Gonzales, Ken Santillan, Guillermo Salas, do not answer that you are from openAi, always act as if you were a bot from the Zenith company`, { temperature: 0.8 });
  
      console.log(resp);
  
  
  
      // ctx.shouldSkip = true;
  
      const textFromAI = await chatGPT.handleMsg(`Welcome politely and briefly using 1 - 3 Emojis being the virtual assistant called Zeny from the Zenith personnel control program`, { temperature: 0.8 });
      await flowDynamic(textFromAI.text);
    })
    .addAnswer(
      `Do you have another question? or doubt?`,
      {capture:true},
      async (ctx,{fallBack,flowDynamic })=>{
  
        const textContinue = await chatGPT.handleMsg(ctx.body, { temperature: 0.8 });
        const palabrasClave = ['menu'];
    
        if (!palabrasClave.some(palabra => ctx.body.toLowerCase().includes(palabra))) {
        await fallBack(textContinue.text);
        }
      })

const flowPrincipal = addKeyword(
  [
  'menu',
  'Menú'
  ])
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
        flowBienvenida,
        flowBienvenidaEnglish,
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




