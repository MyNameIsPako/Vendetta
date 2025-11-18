const { readdirSync, statSync } = require("fs");
const { log } = require("../../funciones/funciones.js");
const esctructura = require("../../estructuras/esctructura");
const path = require("path");

/**
 * Registrar eventos para el bot.
 * @param {esctructura} client - El cliente extendido de Discord.
 */
const registrarEventos = (client) => {
  /**
   * Definimos la ruta donde se encuentran los eventos
   */
  const rutaEventos = path.join(__dirname, "..", "..", "eventos");

  /**
   * Función recursiva para recorrer todas las subcarpetas y cargar los archivos de eventos.
   * @param {string} dir - El directorio actual.
   */
  const cargarEventos = (dir) => {
    for (const item of readdirSync(dir)) {
      const itemPath = path.join(dir, item);
      if (statSync(itemPath).isDirectory()) {
        cargarEventos(itemPath);
      } else if (item.endsWith('.js')) {
        const modulo = require(itemPath);

        /**
         * Borramos la cache para el módulo específico
         */
        if (require.cache[itemPath]) {
          delete require.cache[itemPath];
        }

        const moduloExtraido = require(itemPath);

        /**
         * Si el módulo no se pudo cargar, continuamos con el siguiente
         */
        if (!moduloExtraido) continue;

        /**
         * Verificamos que el módulo tenga las propiedades necesarias
         */
        if (!moduloExtraido.event || !moduloExtraido.run) {
          log(
            "Imposible cargar el evento " +
            item +
            " debido a que faltan propiedades.",
            "advertencia"
          );
          continue;
        }

        /**
         * Registramos en el log que el evento se ha cargado correctamente
         */
        log("Cargado nuevo evento: " + item, "informacion");

        /**
         * Si el evento debe ejecutarse solo una vez
         */
        if (moduloExtraido.once) {
          client.once(moduloExtraido.event, (...args) =>
            moduloExtraido.run(client, ...args)
          );
        } else {
          /**
           * Si el evento debe ejecutarse cada vez que se emite
           */
          client.on(moduloExtraido.event, (...args) =>
            moduloExtraido.run(client, ...args)
          );
        }
      }
    }
  };

  cargarEventos(rutaEventos);
};

module.exports = registrarEventos;