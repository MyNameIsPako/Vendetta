const { connect, Schema } = require("mongoose");
const config = require("../../configuraciones/base.js");
const { log } = require("../../funciones/funciones.js");

/**
 * Conectar a la base de datos MongoDB.
 */
module.exports = async () => {
  /**
   * Registrar en el log el inicio de la conexión a MongoDB
   */
  log("Iniciando conexión a MongoDB...", "advertencia");

  try {
    /**
     * Intentar conectar a MongoDB usando la URL de conexión del archivo de configuración o la variable de entorno
     */
    await connect(process.env.mongoDB || config.handler.mongodb.url);
    /**
     * Registrar en el log que la conexión fue exitosa
     */
    log("MongoDB está conectado!", "completado");
  } catch (error) {
    /**
     * Registrar en el log si hubo un error al conectar a MongoDB
     */
    log(`Error al conectar a MongoDB: ${error.message}`, "error");
  }
};
