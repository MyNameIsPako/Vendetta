const chalk = require("chalk");
const axios = require("axios");
const mongodb = require("../schemas/usuarioInfo");
const ExtendedClient = require("../estructuras/esctructura");
const { EmbedBuilder } = require("discord.js");
const { canales } = require("../configuraciones/base.js");

/**
 * Registros de consola personalizados.
 *
 * @param {string} mensaje - El mensaje del log.
 * @param {'informacion' | 'error' | 'advertencia' | 'completado' | 'antiCrash' | undefined} estiloLog - El estilo del log.
 */
const log = (mensaje, estiloLog = "informacion") => {
  const estilos = {
    informacion: { llamada: chalk.blue("[INFO] :: "), funcionLog: console.log },
    error: { llamada: chalk.red("[ERROR] :: "), funcionLog: console.error },
    advertencia: {
      llamada: chalk.yellow("[ADVERTENCIA] :: "),
      funcionLog: console.warn,
    },
    completado: {
      llamada: chalk.green("[COMPLETADO] :: "),
      funcionLog: console.log,
    },
    antiCrash: {
      llamada: chalk.cyan("[ANTICRASH] :: "),
      funcionLog: console.log,
    },
  };

  const estiloSelecionado = estilos[estiloLog] || estilos.informacion;
  estiloSelecionado.funcionLog(`${estiloSelecionado.llamada}${mensaje}`);
};

/**
 * Formatear timestamp usando <t:timestamp:style> que puedes encontrar en => https://hammertime.cyou/es
 *
 * @param {number} ms - El timestamp en milisegundos.
 * @param {import('discord.js').TimestampStylesString} estilo - El estilo del timestamp.
 * @returns {string} - El timestamp formateado.
 */
const tiempo = (ms, estilo) => {
  return `<t:${Math.floor(ms / 1000)}${estilo ? `:${estilo}` : ""}>`;
};

/**
 * Genera un accessToken usando el deviceAuth.
 *
 * @param {string} accountId - La ID de la cuenta de Fortnite.
 * @param {string} deviceId - El ID del dispositivo.
 * @param {string} secret - El secreto.
 * @returns {Promise<string>} - El token de acceso.
 */
const obtenerAccesToken = async (accountId, deviceId, secret) => {
  const respuesta = await axios.post(
    "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
    {
      grant_type: "device_auth",
      account_id: accountId,
      device_id: deviceId,
      secret: secret,
      token_type: "eg1",
    },
    {
      headers: {
        Authorization:
          "Basic OThmN2U0MmMyZTNhNGY4NmE3NGViNDNmYmI0MWVkMzk6MGEyNDQ5YTItMDAxYS00NTFlLWFmZWMtM2U4MTI5MDFjNGQ3",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return respuesta.data.access_token;
};

/**
 * Enviar una petición MCP a la API de Fortnite.
 *
 * @param {string} operacion - La operación a realizar.
 * @param {string} ruta - La ruta de la API.
 * @param {string} perfil - El perfil de la operacion.
 * @param {Object} payload - Los datos a enviar en la petición.
 * @param {Object} datosCuenta - Los datos de la cuenta.
 * @returns {Promise<JSON>} - La respuesta de la API.
 */
const mcp = async (operacion, ruta, perfil, payload, datosCuenta) => {
  let cuenta = datosCuenta;
  let IdCuenta = cuenta.accountId;
  let deviceId = cuenta.deviceId;
  let secret = cuenta.secret;
  let accesstoken = await obtenerAccesToken(IdCuenta, deviceId, secret);

  let respuesta = await axios.post(
    `https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/profile/${IdCuenta}/${ruta}/${operacion}?profileId=${perfil}`,
    payload,
    { headers: { Authorization: `Bearer ${accesstoken}` } }
  );
  return respuesta.data;
};

/**
 * Obten un codigo de EnchangeCode desde el accestToken de la cuenta.
 *
 * @param {accestToken} string - El accestToken.
 * @param {datosCuenta} JSON - los datos de la cuenta.
 * @returns {JSON} - El timestamp formateado.
 */
const obtenerEchangeCode = async (accestToken, datosCuenta) => {
  try {
    headers = {
      Authorization: `Bearer ${accestToken}`,
    };
    const respuesta = await axios.get(
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/exchange",
      { headers }
    );
    return { status: 200, code: respuesta.data.code };
  } catch (error) {
    return { status: 401, error: error.message };
  }
};

/**
 * Busca el Auth de la cuenta por la ID de la cuenta.
 *
 * @param {string} accountId - La ID de la cuenta.
 * @returns {Promise<Object|null>} - El auth si lo encuentra o null si no lo encuentra.
 */
async function buscarAuth(accountId) {
  try {
    const auth = await mongodb.findOne({
      "deviceAuths.accountId": accountId,
    });

    if (auth && auth.deviceAuths) {
      const deviceAuth = auth.deviceAuths.find(
        (account) => account.accountId === accountId
      );
      return deviceAuth;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Añade una playlist de fortnite como favorita.
 *
 * @param {string} playlistId - La ID de la playlist.
 * @param {Object} datos - Los datos de la cuenta.
 * @param {string} datos.idCuenta - La ID de la cuenta de Fortnite.
 * @param {string} datos.deviceId - El ID del dispositivo.
 * @param {string} datos.secret - El secreto.
 * @returns {Promise<Object>} - Un objeto que indica si hubo un error y los datos de la respuesta.
 */
async function playlistFavotito(playlistId, datos) {
  try {
    const accessToken = await obtenerAccesToken(
      datos.AccountId,
      datos.deviceId,
      datos.secret
    );
    const respuesta = await axios.post(
      `https://fn-service-discovery-live-public.ogs.live.on.epicgames.com/api/v1/links/favorites/${datos.idCuenta}/${playlistId}`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return { error: false, mensajeError: null, respuestaDatos: respuesta.data };
  } catch (e) {
    return { error: true, mensajeError: e.message, respuestaDatos: null };
  }
}

/**
 * Envía un log de error a un canal específico de Discord.
 *
 * @param {ExtendedClient} client - El cliente extendido de Discord.
 * @param {string} title - El título del mensaje de error.
 * @param {string} error - La descripción del error.
 * @returns {Promise<{sent: boolean, error: Error|null}>} - Un objeto que indica si el mensaje fue enviado y cualquier error que haya ocurrido.
 */
async function enviarError(title, error, client) {
  try {
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(error)
      .setColor("Red")
      .setTimestamp();
    let channel = await client.channels.cache.get(canales.canalErrores);
    await channel.send({ embeds: [embed] });
    return { sent: true, error: null };
  } catch (e) {
    return { sent: false, error: e };
  }
}

module.exports = {
  log,
  tiempo,
  obtenerAccesToken,
  mcp,
  obtenerEchangeCode,
  buscarAuth,
  playlistFavotito,
  enviarError,
};
