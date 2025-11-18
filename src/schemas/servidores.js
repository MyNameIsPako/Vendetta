const { model, Schema } = require("mongoose");

/**
 * Esquema de Mongoose para guardar datos de los servidores.
 * En este caso, solo guardamos el prefix.
 * 
 * @typedef {Object} Servidor
 * @property {String} guild - El ID del servidor.
 * @property {String} prefix - El prefijo del servidor.
 */

const servidorSchema = new Schema({
  guild: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
  },
});

/**
 * Modelo de Mongoose para la información del servidor.
 * @type {Model<Servidor>}
 */
module.exports = model("servidores", servidorSchema);