const { model, Schema } = require("mongoose");

/**
 * Esquema de Mongoose para guardar la información de los usuarios.
 * Este esquema es importante porque aquí se guardan los estados de premium y blacklist de los usuarios.
 * 
 * @typedef {Object} Usuario
 * @property {String} id - El ID del usuario.
 * @property {Boolean} premium - Indica si el usuario es premium.
 * @property {Boolean} blacklisted - Indica si el usuario está en la lista negra.
 */

const usuarioSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  premium: {
    type: Boolean,
    required: true,
    default: false,
  },
  blacklisted: {
    type: Boolean,
    required: true,
    default: false,
  },
});

/**
 * Modelo de Mongoose para la información del usuario.
 * @type {Model<Usuario>}
 */
module.exports = model("usuarios", usuarioSchema);