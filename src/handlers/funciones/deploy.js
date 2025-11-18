const { REST, Routes } = require("discord.js");
const { log } = require("../../funciones/funciones.js");
const config = require("../../configuraciones/base.js");
const estructura = require("../../estructuras/esctructura");

/**
 * Cargar o recargar comandos de aplicación para el bot.
 * @param {estructura} client - El cliente extendido de Discord.
 * @param {boolean} reload - Si se deben recargar los comandos.
 */
const cargarComandosSlash = async (client, reload = false) => {
  /**
   * Crear una nueva instancia de REST y establecer el token
   */
  const rest = new REST({ version: "10" }).setToken(
    process.env.tokenDiscord || config.client.token
  );

  try {
    /**
     * Obtener el ID del servidor de desarrollo
     */
    const guildId =
      process.env.servidorDesarollo || config.servidorDesarrollo.servidor;

    /**
     * Si se deben recargar los comandos, vaciar el array de comandos
     */
    if (reload) {
      client.applicationComandosArray = [];
    }

    /**
     * Registrar en el log el inicio de la carga o recarga de comandos
     */
    log(
      `Iniciado ${
        reload ? "recarga" : "carga"
      } de comandos de aplicación... (esto puede tardar minutos varios minutos)`,
      "informacion"
    );

    /**
     * Si el modo desarrollo está activado, cargar los comandos en el servidor de desarrollo
     */
    if (config.servidorDesarrollo && config.servidorDesarrollo.activado) {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.clienteId || config.client.id,
          guildId
        ),
        {
          body: client.applicationComandosArray,
        }
      );
      log(
        `Comandos slashCommands ${
          reload ? "recargados" : "cargados"
        } exitosamente en la guild ${guildId}.`,
        "completado"
      );
    } else {
      /**
       * Si el modo desarrollo no está activado, cargar los comandos globalmente
       */
      await rest.put(
        Routes.applicationCommands(process.env.clienteId || config.client.id),
        {
          body: client.applicationComandosArray,
        }
      );
      log(
        `Comandos slashCommands ${
          reload ? "recargados" : "cargados"
        } globalmente en la API de Discord.`,
        "completado"
      );
    }
  } catch (e) {
    /**
     * Registrar en el log si hubo un error al cargar o recargar los comandos
     */
    log(
      `No se pudo ${
        reload ? "recargar" : "cargar"
      } los comandos de aplicación en la API de Discord. \n${e}`,
      "error"
    );
  }
};

module.exports = cargarComandosSlash;
