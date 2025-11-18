/**
 * [ CREDITOS Y USO ]
 * Este bot esta creado por @mynameispako puedes unirte al servidor de soporte en discord.gg/pakosarmy.
 * Si quieres usar este codigo es de uso libre unicamente puedes usarlo bajo licencia MIT y no olvides dar creditos.
 * Puedes añadir, reportar o sugerir usando los issues de github.
 *
 * [ IMPORTANTE ]
 * El bot se mantiene a dia de hoy y se actualizara a medida que tenga tiempo pensar que esto es un hobby y no un trabajo
 * podeis mantener vosotros mismos vuestro bot actualizado implementando las nuevas funciones que se añada.
 * Esto lo hago para que muchos puedas aprender y aun que copies el codigo revisalo para saber como funciona.
 *
 * [ COMO USARLO ]
 * Primero teneis que añadir varias cosas en el archivo .env que se encuentra en la raiz del proyecto.
 * Ahi podeis personalizar varias cosas ya que yo uso parametros fijos.
 * Se recomienda usar mongoDB y nunca useis una db tipo json o que no sea vuestra ya que el bot guarda datos sensibles.
 */

/**
 * Aqui añadimos dotenv para cargar las variables de entorno que son privadas.
 */
require("dotenv").config();

/**
 * Aqui añadimos el cliente extendido que hemos creado para añadirle mas funciones.
 */
const estructura = require("./estructuras/esctructura.js");
const Vendetta = new estructura();

/**
 * Iniciamos el cliente de discord.
 */
Vendetta.iniciar();
