const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
require('dotenv').config()
const axios = require('axios')
const { readFileSync } = require("fs");
const { join } = require("path");
const delay = (ms) => new Promise((res => setTimeout(res, ms)))
const variablesGlobal = require('../variablesGlobal');
/**
 * Recuperamos el prompt "PROVEEDOR"
 */

const getPrompt = async () => {
    const pathPromp = join(process.cwd(), "promps");
    const text = readFileSync(join(pathPromp, "02_PROVEEDOR.txt"), "utf-8");
    return text;
};



/**
 * !Exportacion
 * @param {*} chatgptClass
 * @returns
 */


module.exports = {
    flowProveedor: (chatgptClass) =>{
      return addKeyword("Proveedor")
      .addAction(async (ctx, { endFlow, flowDynamic, provider, gotoFlow }) => {
        const data = await getPrompt();
    
        /**
         * !ChatGPT Actua
         * Iniciamos activando el Rol
         */
        await chatgptClass.handleMsg(data, `ACTIVAR ROL`);
        // ctx.shouldSkip = true;
    
        const textFromAI = await chatgptClass.handleMsg(data);
        await flowDynamic(textFromAI.text);
      })
      .addAnswer('🔐 Ingresar Contraseña: ', { capture: true }, async (ctx, { flowDynamic, fallBack,state }) => {
        password=ctx.body;
        variablesGlobal.password = password;
        await state.update({ password: ctx.body })
        tipoUsuario="proveedor";
        const textFromAI2 = await chatgptClass.handleMsg(`contrasenia=${password}`);
        await flowDynamic(textFromAI2.text);
        //Falta agregar api para validacion de usuario
      })
      // .addAnswer('🔢 Orden de Trabajo: ',{capture:true},async (ctx, {flowDynamic, fallBack})=>{
      //   odt=ctx.body;

      //   const datos= await getOdtProveedores(odt,password);

      //   if(datos!=undefined){
      //     var datosString = JSON.stringify(datos.data);
      //     console.log(datosString);

      //     const respDataOdt = await chatgptClass.handleMsg(`list=${datosString}`);
      //     await flowDynamic(respDataOdt.text);
      //   }

      // })
    

}
   
} // Fin Exports



 /**
 * !Apartado de las apis
 * !Obtenemos los datos solicitados con el Password
 * @param {Odt} odt
 * @param {Contraseña Proveedor} pass
 * @returns
 */
const getOdtProveedores = async(odt, pass)=>{

      let url= `${process.env.PUBLIC_API_URL}chatbot/v1/proveedores/infoOdt`;
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
    
  