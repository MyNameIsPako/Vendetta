const { log } = require("../../funciones/funciones.js");
const config = require("../../configuraciones/base.js");
const { Client: taxi } = require("fnbr");
let queue = [];

/**
 * Vamos a hacer que si no estan activos no se carguen
 */
if (!config.taxiBotsConfig.isActivo) return;

/**
 * Auth de la cuenta, esto lo podeis obtener con muchos bots pero logicamente te recomiendo el mio, te registras con la cuenta que quieras añadir aqui usando /registrar en Mia la puedes usar en discord.gg/miabot y una vez registrado te enviara por DM estas credenciales que tienes que poner aqui, si por algun motivo no te llega el mensaje usa /cuenta info y las veras.
 * @type {string}
 */
const device = {
  accountId: "",
  deviceId: "",
  secret: "",
};

/**
 * Datos de los taxis
 * @type {Object}
 */
const datosTaxis = {
  ausente: ".gg/miabot 💖",
  ocupado: "Ocupado 🌿",
  tiempo_para_irme: 2,
  mensajeUnion:
    "👋 Hola! tienes 2 minutos para empezar una partida | discord.gg/miabot",
  mensajeAdios:
    "Gracias por usar los TaxiBots nos vemos! ✨ | discord.gg/miabot",
};

/**
 * IDS autorizadas
 * @type {string[]}
 */
const IDS = [
  "32digitos", // Aqui poneis las ids de las cuentas.
];

/**
 * Indica si el bot es privado o público
 * @type {boolean}
 */
const isPrivado = false;

/**
 * Funcion principal para cargar y gestionar los taxibots.
 * @param {estructura} client - El cliente extendido de Discord.
 */
const TaxiBots = async (client) => {
  /**
   * vamos a añadir un sistema para desactivar esto
   */
  const isActivado = config.taxiBotsConfig.isActivado;

  /**
   * Si esto esta activado no se inician
   */
  if (isActivado) return;

  const taxiClient = new taxi({
    defaultStatus: "Iniciando bot...",
    killOtherTokens: false,
    auth: { deviceAuth: device },
    xmppDebug: false,
    platform: "AND",
    restartOnInvalidRefresh: true,
    partyConfig: {
      privacy: {
        partyType: "Private",
        acceptingMembers: false,
        invitePermission: "AnyMember",
        inviteRestriction: "AnyMember",
        onlyLeaderFriendsCanJoin: false,
        presencePermission: "Leader",
      },
      maxSize: 4,
      joinability: "INVITE_AND_FORMER",
      discoverability: "INVITED_ONLY",
    },
  });

  await taxiClient.login();
  log(`El taxi ${taxiClient.user.self.displayName} esta activo!`, "completado");
  taxiClient.setStatus(datosTaxis.ausente);

  /**
   * Añade la skin al bot
   */
  await taxiClient.party.me.setOutfit("CID_757_Athena_Commando_F_WildCat");
  await taxiClient.party.me.setBanner("OT9Banner");

  let warnsTiempo, byeTiempo;

  /**
   * Procesa la cola de espera
   */
  async function procesamientoCola() {
    taxiClient.setStatus(datosTaxis.ocupado);

    byeTiempo = setTimeout(async () => {
      if (queue.length > 0) {
        try {
          await taxiClient.joinParty(queue[0]);
          queue.shift();
          procesamientoCola();
        } catch (error) {
          log(error, "error");
          queue.shift();
          clearTimeout(warnsTiempo);
          clearTimeout(byeTiempo);
        }
      } else {
        taxiClient.leaveParty();
        taxiClient.setStatus(datosTaxis.ausente);
      }
    }, datosTaxis.tiempo_para_irme * 60000 + 1000);
  }

  /**
   * Maneja las solicitudes de amistad
   * @param {Object} friend - El objeto de la solicitud de amistad
   */
  taxiClient.on("friend:request", async (friend) => {
    log(
      `Recibido solicitud de amistad de ${friend.displayName}`,
      "informacion"
    );

    if (isPrivado && !IDS.includes(friend.id)) {
      log(
        `Solicitud de amistad rechazada de ${friend.displayName} (ID no autorizada)`,
        "informacion"
      );
      await friend.decline();
      return;
    }

    try {
      await friend.accept();
      log(
        `Acepte la invitacion de amistad de ${friend.displayName}`,
        "informacion"
      );
    } catch (e) {
      log(
        `Error al procesar la invitacion de amistad de ${friend.displayName}: ${e}`,
        "error"
      );
    }
  });

  /**
   * Maneja las invitaciones a partidas
   * @param {Object} request - El objeto de la invitación a la partida
   */
  taxiClient.on("party:invite", async (request) => {
    const userId = request.sender.id;
    const displayName = request.sender.displayName;

    try {
      log(`Invitacion a partida recibida de ${displayName}`, "informacion");

      if (isPrivado && !IDS.includes(userId)) {
        log(
          `Invitacion rechazada de ${displayName} (ID no autorizada)`,
          "informacion"
        );
        await request.decline();
        return;
      }

      if (queue.includes(request.party.id)) {
        log(`${displayName} esta ya en la cola`, "informacion");
        await request.decline();
        return;
      }

      if (queue.length === 0) {
        await aceptarInvitacion(request);
      } else {
        queue.push(request.party.id);
        log(`Añadido el usuario ${displayName} a la cola`, "informacion");
      }
    } catch (error) {
      log(`Error en el handler de (party:invite): ${error}`, "error");
    }
  });

  /**
   * Acepta la invitación a la partida y envía el patch para aumentar el poder.
   * @param {Object} request - El objeto de la invitación a la partida
   */
  async function aceptarInvitacion(request) {
    await request.accept();
    log(
      `Se unio a la partida de ${request.party.leader.displayName}`,
      "informacion"
    );

    setTimeout(async () => {
      const statsJSON =
        '{"FORTStats":{"fortitude":5797,"offense":5797,"resistance":5797,"tech":5797,"teamFortitude":5797,"teamOffense":0,"teamResistance":0,"teamTech":0,"fortitude_Phoenix":5797,"offense_Phoenix":5797,"resistance_Phoenix":5797,"tech_Phoenix":5797,"teamFortitude_Phoenix":0,"teamOffense_Phoenix":0,"teamResistance_Phoenix":0,"teamTech_Phoenix":0}}';

      try {
        await taxiClient.party?.me?.sendPatch({
          "Default:FORTStats_j": statsJSON,
        });
      } catch (error) {
        log(`Error al enviar Stats JSON error: ${error}`, "error");
      }
    }, 3000);

    procesamientoCola();
  }

  /**
   * Maneja la expulsión de miembros de la partida
   * @param {Object} party - El objeto de la partida
   */
  taxiClient.on("party:member:kicked", async (party) => {
    log(`Expulsado de la partida de ${party.displayName}`, "informacion");
    try {
      if (party.id === taxiClient.user.id && queue.length > 0) {
        clearTimeout(warnsTiempo);
        clearTimeout(byeTiempo);
        try {
          await taxiClient.joinParty(queue[0]);
          queue.shift();
          procesamientoCola();
        } catch (error) {
          log(error, "error");
          queue.shift();
          clearTimeout(warnsTiempo);
          clearTimeout(byeTiempo);
        }
      } else if (party.id === taxiClient.user.id) {
        taxiClient.setStatus(datosTaxis.ausente);
        clearTimeout(warnsTiempo);
        clearTimeout(byeTiempo);
      }
    } catch (error) {
      log(`Error en el handler de (party:member:kicked): ${error}`, "error");
    }
  });

  /**
   * Maneja la salida de miembros de la partida
   * @param {Object} party - El objeto de la partida
   */
  taxiClient.on("party:member:left", async (party) => {
    try {
      if (party.party.leader.id === taxiClient.user.id && queue.length > 0) {
        clearTimeout(warnsTiempo);
        clearTimeout(byeTiempo);
        try {
          await taxiClient.joinParty(queue[0]);
          queue.shift();
          procesamientoCola();
        } catch (error) {
          log(error, "error");
          queue.shift();
          clearTimeout(warnsTiempo);
          clearTimeout(byeTiempo);
        }
      } else if (
        party.party.leader.id === taxiClient.user.id &&
        queue.length === 0
      ) {
        taxiClient.setStatus(datosTaxis.ausente);
        clearTimeout(warnsTiempo);
        clearTimeout(byeTiempo);
        await taxiClient.leaveParty();
      } else {
        const index = queue.indexOf(party.party.id);
        if (index !== -1) {
          queue.splice(index, 1);
        }
      }
    } catch (error) {
      log(`Error en el handler de (party:member:left): ${error}`, "error");
    }
  });
};

module.exports = TaxiBots;
