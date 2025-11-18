const { model, Schema } = require("mongoose");

/**
 * Esquema de Mongoose para guardar la información de los usuarios.
 * Este esquema es importante porque aquí se guardan las cuentas registradas y demás.
 * 
 * @typedef {Object} DeviceAuth
 * @property {String} accountId - El ID de la cuenta.
 * @property {String} deviceId - El ID del dispositivo.
 * @property {String} secret - El secreto del dispositivo.
 * @property {String} displayName - El nombre para mostrar de la cuenta.
 * @property {Boolean} cuentaMain - Indica si es la cuenta principal.
 * 
 * @typedef {Object} UserInfo
 * @property {String} id - El ID del usuario.
 * @property {DeviceAuth[]} deviceAuths - Lista de autorizaciones de dispositivos.
 */

const userInfoSchema = new Schema({
  id: {
    type: String,
    required: true,
  },
  deviceAuths: [
    {
      accountId: {
        type: String,
        required: true,
      },
      deviceId: {
        type: String,
        required: true,
      },
      secret: {
        type: String,
        required: true,
      },
      displayName: {
        type: String,
        required: true,
      },
      cuentaMain: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
  ],
});

/**
 * Modelo de Mongoose para la información del usuario.
 * @type {Model<UserInfo>}
 */
module.exports = model("infoUsuario", userInfoSchema);