/**
 * Configuraciones del bot
 *
 * @typedef {Object} Bot
 * @property {string} tokenDiscord - Token del bot de Discord, lo puedes encontrar en => https://discord.com/developers/applications
 * @property {string} MongoDB - URI de MongoDB
 * @property {string} canalErrores - ID del canal de errores.
 * @type {Bot}
 */
const tokenDiscord = process.env["tokenDiscord"];
const MongoDB = process.env["mongoDB"];
const canalErrores = process.env["canalErrores"];
const servidorDesarollo = process.env["servidorDesarollo"];

/**
 * Configuraciones del cliente
 *
 * @typedef {Object} Cliente
 * @property {string} tokenDiscord - Token del bot de Discord.
 * @property {string} id - ID del cliente.
 * @type {Cliente}
 */
const client = {
  tokenDiscord: tokenDiscord,
  id: "1206312395287564398", // ID del cliente
};

/**
 * Configuraciones del handler del bot
 *
 * @typedef {Object} Handler
 * @property {string} prefijo - Prefijo de comandos.
 * @property {boolean} deploy - Desplegar comandos.
 * @property {Object} comandos - Configuración de comandos.
 * @property {boolean} comandos.prefijo - Comandos con prefijo.
 * @property {boolean} comandos.slash - Comandos de barra.
 * @property {boolean} comandos.usuario - Comandos de usuario.
 * @property {boolean} comandos.mensaje - Comandos de mensaje.
 * @property {Object} mongodb - Configuración de MongoDB.
 * @property {string} mongodb.url - URL de MongoDB la puedes encontrar en => https://www.mongodb.com/es/atlas.
 * @property {boolean} mongodb.activado - Activar/desactivar MongoDB.
 * @property {boolean} modoOficial - Activar/desactivar el modo oficial.
 */

/**
 * @type {Handler}
 */
const handler = {
  prefix: "r",
  deploy: true,
  comandos: {
    prefix: true,
    slash: true,
  },
  mongodb: {
    url: MongoDB,
    activado: true,
  },
  modoOficial: true, // Cambia a true para activar el modo oficial
};

/**
 * Mapeo de IDs de los desarrolladores. Esto sirve para limitar comandos
 * y que solo puedan usarlos los desarrolladores, como comandos de la base de datos, etc.
 *
 * @typedef {Object} Devs
 * @property {string[]} desarrolladores - Lista de IDs de desarrolladores.
 * @type {Devs}
 */
const devs = {
  desarrolladores: [
    "798527554368831528",
    // Añade más IDs aquí siguiendo el mismo formato
  ],
};

/**
 * Configuración del servidor de desarrollo y el modo no producción
 *
 * @typedef {Object} servidorDesarollo
 * @property {boolean} activado - Activa o desactiva el modo desarrollo del bot.
 * @property {string} servidor - ID del servidor de desarrollo.
 * @type {servidorDesarollo}
 */
const servidorDesarrollo = {
  activado: false, // Activa o desactiva el modo desarrollo del bot.
  servidor: "1190629694207430756", // Aquí pon la ID del servidor de desarrollo
};

/**
 * Configuración de los mensajes por defecto para algunos comandos.
 * @typedef {Object} MensajesPersonalizados
 * @property {string} soloDevs - Mensaje solo para desarrolladores.
 * @property {string} mensajeCooldown - Mensaje de cooldown.
 * @property {string} sinPermisos - Mensaje de falta de permisos.
 * @property {string} sinIds - Mensaje de falta de IDs de desarrolladores.
 * @type {MensajesPersonalizados}
 */
const mensajesPersonalizados = {
  // Mensaje solo desarrolladores
  soloDevs:
    "`⚠️` No puedes usar este comando, es únicamente para los desarrolladores",

  // Mensaje del cooldown
  mensajeCooldown:
    "`⌛` ¡Ve más despacio! Espera un poco antes de usar el comando de nuevo.",

  // Mensaje de no permisos
  sinPermisos: "`❌` No tienes permisos para usar este comando.",

  // No hay IDs de desarrolladores
  sinIds:
    "`⚠️` No se puede ejecutar porque faltan IDs en el apartado de devs en el config.json. Revísalo y vuelve a intentarlo.",
};

/**
 * Configuración de los canales del bot.
 * @typedef {Object} Canales
 * @property {string} canalErrores - ID del canal de errores.
 * @type {Canales}
 */
const canales = {
  canalErrores: canalErrores,
  servidorDesarollo: servidorDesarollo,
};

/**
 * Configuración de activación de taxibots.
 * @typedef {Object} TaxiBotsConfig
 * @property {boolean} isActivo - Indica si los taxibots están activos.
 * @type {TaxiBotsConfig}
 */
const taxiBotsConfig = {
  isActivo: false,
};

// Exportar todas las configuraciones
module.exports = {
  client,
  handler,
  devs,
  servidorDesarrollo,
  mensajesPersonalizados,
  canales,
  taxiBotsConfig,
};
