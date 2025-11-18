const { readdirSync, statSync } = require("fs");
const { log } = require("../../funciones/funciones.js");
const estructura = require("../../estructuras/esctructura.js");
const path = require("path");

/**
 * Aquí cargamos los comandos de la carpeta componentes.
 * @param {estructura} client - El cliente extendido de Discord.
 */
module.exports = (client) => {
  const rutaComponentes = path.join(__dirname, "..", "..", "componentes");

  /**
   * Función recursiva para recorrer todas las subcarpetas y cargar los archivos de componentes.
   * @param {string} dir - El directorio actual.
   */
  const cargarComponentes = (dir) => {
    for (const item of readdirSync(dir)) {
      const itemPath = path.join(dir, item);
      if (statSync(itemPath).isDirectory()) {
        cargarComponentes(itemPath);
      } else if (item.endsWith('.js')) {
        const modulo = require(itemPath);

        if (require.cache[itemPath]) {
          delete require.cache[itemPath];
        }

        const moduloExtraido = require(itemPath);

        if (!moduloExtraido) continue;

        if (dir.includes('botones')) {
          if (!moduloExtraido.customId || !moduloExtraido.run) {
            log(
              'Imposible cargar el componente ' +
              item +
              ' debido a que faltan propiedades.',
              'advertencia'
            );
            continue;
          }

          client.collection.componentes.botones.set(
            moduloExtraido.customId,
            moduloExtraido
          );
        } else if (dir.includes('menus')) {
          if (!moduloExtraido.customId || !moduloExtraido.run) {
            log(
              'Imposible cargar el selectMenu ' +
              item +
              ' debido a que faltan propiedades.',
              'advertencia'
            );
            continue;
          }

          client.collection.componentes.menus.set(
            moduloExtraido.customId,
            moduloExtraido
          );
        } else if (dir.includes('modals')) {
          if (!moduloExtraido.customId || !moduloExtraido.run) {
            log(
              'Imposible cargar el modal ' +
              item +
              ' debido a que faltan propiedades.',
              'advertencia'
            );
            continue;
          }

          client.collection.componentes.modals.set(
            moduloExtraido.customId,
            moduloExtraido
          );
        } else {
          log('Tipo de componente inválido: ' + item, 'advertencia');
          continue;
        }

        log('Cargado nuevo componente: ' + item, 'informacion');
      }
    }
  };

  cargarComponentes(rutaComponentes);
};