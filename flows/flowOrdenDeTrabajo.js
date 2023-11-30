const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
require('dotenv').config()
const axios = require('axios')
const { readFileSync } = require("fs");
const { join } = require("path");
const delay = (ms) => new Promise((res => setTimeout(res, ms)))
const variablesGlobal = require('../variablesGlobal');

/**
 * Recuperamos los prompt"
 */
const pathPromp = join(process.cwd(), "promps");

const getPromptOdt = async () => {
    const textOdt = readFileSync(join(pathPromp, "03_ORDENDETRABAJO.txt"), "utf-8");
    return textOdt;
};

/**
 * !Exportacion
 * @param {*} chatgptClass
 * @returns
 */
const soloNumeros = /^\d+$/;
module.exports = {
  flowOrdenDeTrabajo: (chatgptClass) =>{
      return addKeyword(['odt', 'orden de trabajo', 'orden trabajo'])
      .addAction({capture:true},async (ctx, {flowDynamic,fallBack,endFlow,gotoFlow})=>{
      const dataPrompOdt = await getPromptOdt();
      await chatgptClass.handleMsg(dataPrompOdt, `ACTIVAR ROL`);
      var password =variablesGlobal.password;

      if (password === null || password =='') {
         ctx.shouldSkip = true;

          const textFromAI = await chatgptClass.handleMsg(dataPrompOdt, `SIN PASSWORD`);
          await flowDynamic(textFromAI.text);

          return endFlow();
        }
    
    }).addAnswer(['Ingrese la *Orden de Trabajo*'],{capture:true},async (ctx, {flowDynamic,fallBack,endFlow,gotoFlow})=>{ 
      if (ctx.body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 'menu') {
    
        /**
         * !Reiniciamos Variables
         * */
        tipoUsuario=null;
        password=null;
        // return await flowDynamic(flowPrincipal);
      }
      if (!soloNumeros.test(ctx.body)){
        const dataPrompOdt = await getPromptOdt();
        const textFromAI = await chatgptClass.handleMsg(dataPrompOdt, `odt=${ctx.body}`);

        await flowDynamic(['La orden de trabajo solo debe contener números'].join('\n\n'));
        return fallBack();
      }
    
      odt=ctx.body
      const data = await dataOdt(odt, password)
      // console.log(data); //Eliminar al terminar
      if(data.success==false){
        await flowDynamic([data.message,'Escribir Ménu para regresar al navegador principal'].join('\n\n'));
        return fallBack();
      }
      datos=data.data
      // datos.Etapa=
      await flowDynamic([
        '🔢 *Odt:* ' + datos.Odt,
        datos.Folio ? '📜 *Folio:* ' + datos.Folio : '',
        datos.Estatus ? '📝 *Etapa:* ' + datos.Etapa +', '+datos.Estatus : '📝 *Etapa:* ' + datos.Etapa,
        '🏠 *Origen:* ' + datos.Origen,
        '📍 *Destino:* ' + datos.Destino,
        datos.Economico ? '🚚 *Economico:* ' + datos.Economico : '',
        datos.Remolque ? '🚛 *Remolque:* ' + datos.Remolque : '',
        datos.NombreOperador ? '👤 *Nombre del Operador:* ' + datos.NombreOperador : '',
        '📅 *Cita de Carga:* ' + datos.CitaCargaSitio,
        '📅 *Cita de Descarga:* ' + datos.CitaDescargaSitio,
        datos.SalidaCarga ? '📅 *Salida de Carga:* ' + datos.SalidaCarga : '',
        datos.SalidaDescarga ? '📅 *Salida de Descarga:* ' + datos.SalidaDescarga : '',
        '🔄 *Última Actualización:* ' + datos.UltimaActualizacion,
        '📄 *Carta Porte:* ' + datos.CartaPorte,
    
      ].filter(linea => linea.trim() !== '').join('\n\n'));
    })

}
   
} // Fin Exports



 /**
 * !Apartado de las apis
 * !Obtenemos los datos solicitados con el Password
 * @param {Odt} odt
 * @param {Contraseña Proveedor} pass
 * @returns
 */
const dataOdt = async(odt, pass)=>{

  let url;
  switch (tipoUsuario) {

    case 'proveedor':
        url = `${process.env.PUBLIC_API_URL}chatbot/v1/proveedores/infoOdt`;

      break;
    case 'cliente':
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
    
  