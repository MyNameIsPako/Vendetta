const {
  Client,
  Partials,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const config = require("../configuraciones/base.js");
const comandos = require("../handlers/funciones/comandos.js");
const eventos = require("../handlers/funciones/eventos.js");
const deploy = require("../handlers/funciones/deploy.js");
const taxis = require("../handlers/TaxiBots/taxis.js");
const db = require("../handlers/db/mongo");
const componentes = require("../handlers/funciones/componentes.js");

/**
 * Clase extendida del cliente de Discord.
 */
module.exports = class extends Client {
  /**
   * Colecciones para almacenar comandos y componentes.
   */
  collection = {
    interactionComandos: new Collection(),
    prefixComandos: new Collection(),
    alias: new Collection(),
    componentes: {
      botones: new Collection(),
      menus: new Collection(),
      modals: new Collection(),
    },
  };

  /**
   * Array para almacenar los comandos de aplicación.
   */
  applicationComandosArray = [];

  /**
   * Constructor de la clase.
   */
  constructor() {
    super({
      intents: [Object.keys(GatewayIntentBits)],
      partials: [Object.keys(Partials)],
    });
  }

  /**
   * Método para iniciar el cliente de Discord.
   */
  iniciar = async () => {
    /**
     * Registrar comandos
     */
    comandos(this);
    /**
     * Registrar eventos
     */
    eventos(this);
    /**
     * Registrar componentes
     */
    componentes(this);

    /**
     * Conectar a la base de datos si está activado en la configuración
     */
    if (config.handler.mongodb.activado) db();

    /**
     * Iniciar sesión en Discord
     */
    await this.login(process.env.tokenDiscord || config.client.token);

    /**
     * Registrar los taxis
     */
    if (config.taxiBotsConfig.isActivo) taxis(this);

    /**
     * Desplegar comandos si está activado en la configuración
     */
    if (config.handler.deploy) deploy(this, false);
  };
};
