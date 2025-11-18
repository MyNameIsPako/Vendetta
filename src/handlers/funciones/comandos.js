const { readdirSync, statSync } = require("fs");
const { log } = require("../../funciones/funciones.js");
const estructura = require("../../estructuras/esctructura");
const path = require("path");

/**
 * Registramos los comandos en el bot.
 * @param {estructura} client - El cliente extendido de Discord.
 */
const registrarComandos = (client) => {
  /**
   * Primero borramos la cache.
   */
  const ruta = path.join(__dirname, "..", "..", "comandos");
  if (require.cache[ruta]) {
    delete require.cache[ruta];
  }

  const comandosPath = path.join(__dirname, "..", "..", 'comandos');

  /**
   * Función recursiva para recorrer todas las subcarpetas y cargar los archivos de comandos.
   * @param {string} dir - El directorio actual.
   */
  const cargarComandos = (dir) => {
    for (const item of readdirSync(dir)) {
      const itemPath = path.join(dir, item);
      if (statSync(itemPath).isDirectory()) {
        cargarComandos(itemPath);
      } else if (item.endsWith('.js')) {
        const modulo = require(itemPath);

        /**
         * Si el módulo no se pudo cargar, continuamos con el siguiente
         */
        if (!modulo) continue;

        if (dir.includes('prefix')) {
          /**
           * Verificamos que el módulo tenga las propiedades necesarias
           */
          if (!modulo.structure?.name || !modulo.run) {
            log(
              'Imposible cargar el comando de la ruta ' +
              item +
              ' debido a que faltan propiedades en el comando.',
              'advertencia'
            );
            continue;
          }

          /**
           * Añadimos el comando a la colección de comandos con prefijo
           */
          client.collection.prefixComandos.set(
            modulo.structure.name,
            modulo
          );

          /**
           * Añadimos los alias del comando a la colección de alias
           */
          if (
            modulo.structure.alias &&
            Array.isArray(modulo.structure.alias)
          ) {
            modulo.structure.alias.forEach((alias) => {
              client.collection.alias.set(
                alias,
                modulo.structure.name
              );
            });
          }
        } else {
          /**
           * Verificamos que el módulo tenga las propiedades necesarias
           */
          if (!modulo.structure?.name || !modulo.run) {
            log(
              'Imposible cargar el comando de la ruta ' +
              item +
              ' debido a que faltan propiedades en el comando.',
              'advertencia'
            );
            continue;
          }

          /**
           * Añadimos el comando a la colección de comandos de interacción
           */
          client.collection.interactionComandos.set(
            modulo.structure.name,
            modulo
          );
          client.applicationComandosArray.push(modulo.structure);
        }

        /**
         * Registramos en el log que el comando se ha cargado correctamente
         */
        log('Cargado/Refrescado comando: ' + item, 'info');
      }
    }
  };

  // Recorremos cada tipo de comando (prefix, slash, etc.)
  for (const tipo of readdirSync(comandosPath)) {
    const tipoPath = path.join(comandosPath, tipo);
    cargarComandos(tipoPath);
  }
};

module.exports = registrarComandos;