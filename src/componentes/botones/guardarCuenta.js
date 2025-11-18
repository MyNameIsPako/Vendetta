const mongodb = require("../../schemas/usuarioInfo");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonInteraction,
} = require("discord.js");
const esctructura = require("../../estructuras/esctructura");
const axios = require("axios");

module.exports = {
  customId: "guardar_cuenta",
  /**
   *
   * @param {esctructura} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    /**
     * Inicio de sesión del usuario
     */
    const url =
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token";
    const payload = "grant_type=client_credentials";
    const headers = {
      Authorization:
        "basic OThmN2U0MmMyZTNhNGY4NmE3NGViNDNmYmI0MWVkMzk6MGEyNDQ5YTItMDAxYS00NTFlLWFmZWMtM2U4MTI5MDFjNGQ3",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    /**
     * Realizamos una solicitud POST para obtener el token de acceso
     */
    const respuesta = await axios.post(url, payload, { headers });

    /**
     * Realizamos una solicitud POST para obtener la autorización del dispositivo
     */
    const deviceAuth = await axios.post(
      "https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/deviceAuthorization",
      { prompt: "login" },
      {
        headers: {
          Authorization: `bearer ${respuesta.data.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    /**
     * Creamos un botón para que el usuario pueda iniciar sesión
     */
    const confirmar = new ButtonBuilder()
      .setLabel("Envia el código e inicia sesión...")
      .setStyle(ButtonStyle.Link)
      .setDisabled(false)
      .setURL(deviceAuth.data.verification_uri_complete);

    /**
     * Creamos una fila de acción y añadimos el botón
     */
    const actionRow = new ActionRowBuilder().addComponents(confirmar);

    /**
     * Enviamos un mensaje de respuesta al usuario con el botón de inicio de sesión
     */
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📲 Inicie sesión en su cuenta de Epic Games")
          .setDescription(
            `⚠️ **¡Recomendamos iniciar sesión únicamente en cuentas a las que tenga acceso a correo electrónico!**\n1. Visite el enlace de arriba para obtener su código de inicio de sesión.\n2. Copia el texto completo. Será válido por 30 segundos, recarga para obtener un nuevo código.\n3. Regrese a Discord y haga clic en el botón a continuación.\n4. Pegue el texto completo en el campo de texto "Código" y haga clic en Enviar.`
          )
          .setColor("Blue"),
      ],
      components: [actionRow],
      ephemeral: true,
    });

    /**
     * Variables que usaremos para varias cosas
     */
    let respuestaStatus = 0;
    let frenado = false;
    let registroDatos;
    let accId, deviceId, secret;
    const deviceCode = deviceAuth.data.device_code;
    let cuentaDuplicada = false;

    /**
     * Intervalo para verificar el código de inicio de sesión
     */
    const intervalo = setInterval(async () => {
      try {
        if (frenado) {
          clearInterval(intervalo);
          return;
        }

        /**
         * Realizamos una solicitud POST para verificar el código del dispositivo
         */
        const respuesta = await axios.post(
          "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
          {
            grant_type: "device_code",
            device_code: deviceCode,
            token_type: "eg1",
          },
          {
            headers: {
              Authorization:
                "Basic OThmN2U0MmMyZTNhNGY4NmE3NGViNDNmYmI0MWVkMzk6MGEyNDQ5YTItMDAxYS00NTFlLWFmZWMtM2U4MTI5MDFjNGQ3",
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        registroDatos = respuesta.data;

        /**
         * Si la respuesta es 200, entonces la cuenta es válida
         */
        if (respuesta.status === 200) {
          const userId = interaction?.user?.id || interaction?.member?.id;
          const existeCuenta = await mongodb.findOne({ id: userId });
          const noExiste = existeCuenta?.deviceAuths.some(
            (account) => account.accountId === registroDatos.account_id
          );

          /**
           * Añadimos un filtro para que no puedan añadir cuentas duplicadas en el bot
           */
          if (noExiste) {
            cuentaDuplicada = true;
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`⚠️ Cuenta duplicada`)
                  .setDescription(
                    `Esta cuenta ya está registrada en el bot, por favor intenta con otra cuenta.`
                  )
                  .setColor("Red"),
              ],
              components: [],
            });
            frenado = true;
            return;
          }
          respuestaStatus = 1;
          clearInterval(intervalo);
          frenado = true;

          /**
           * Si no existe la cuenta en la DB pues la añadimos e iniciamos sesión en ella
           */
          if (!noExiste) {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`👋 Bienvenid@, ${registroDatos.displayName}`)
                  .setDescription(
                    `Tu cuenta ha sido guardada. Usa /logout para eliminar tu cuenta.`
                  )
                  .setColor("Blue"),
              ],
              components: [],
              ephemeral: true,
            });
          } else {
            /**
             * Verificamos de nuevo por si acaso
             */
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`⚠️ Cuenta duplicada`)
                  .setDescription(
                    `Esta cuenta ya está registrada en el bot, por favor intenta con otra cuenta.`
                  )
                  .setColor("Red"),
              ],
              components: [],
            });
            frenado = true;
            return;
          }

          /**
           * Realizamos una solicitud POST para obtener las autorizaciones del dispositivo
           */
          const deviceauths = await axios.post(
            `https://account-public-service-prod.ol.epicgames.com/account/api/public/account/${respuesta.data.account_id}/deviceAuth`,
            {},
            {
              headers: {
                Authorization: `Bearer ${respuesta.data.access_token}`,
              },
            }
          );

          if (respuestaStatus !== 1) {
            return;
          }

          /**
           * Guardamos todos los datos necesarios para iniciar sesión en la cuenta
           * y añadimos la cuenta a la DB
           */
          accId = deviceauths.data.accountId;
          deviceId = deviceauths.data.deviceId;
          secret = deviceauths.data.secret;
          respuestaStatus = 2;

          if (existeCuenta && existeCuenta.deviceAuths) {
            existeCuenta.deviceAuths.forEach((account) => {
              account.cuentaMain = false;
            });

            await existeCuenta.save();
          }

          const nuevaCuenta = {
            displayName: registroDatos.displayName ?? "¿?",
            accountId: accId,
            deviceId: deviceId,
            secret: secret,
            cuentaMain: true,
          };

          let updatedDocument;

          if (existeCuenta) {
            updatedDocument = await mongodb.findOneAndUpdate(
              { id: userId },
              { $push: { deviceAuths: nuevaCuenta } },
              { new: true }
            );
          } else {
            updatedDocument = await new mongodb({
              id: userId,
              deviceAuths: [nuevaCuenta],
            }).save();
          }

          /**
           * Realizamos una solicitud POST para aceptar los términos y condiciones de Epic Games
           */
          const rqE = await axios.post(
            `https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/grant_access/${accId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${respuesta.data.access_token}`,
              },
            }
          );
        } else if (
          respuesta.data.errorCode === "errors.com.epicgames.not_found"
        ) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`⚠️ Cancelado`)
                .setDescription(
                  `EL inicio de sesion en tu cuenta a sido cancelado.`
                )
                .setColor("Red"),
            ],
            components: [],
          });
          frenado = true;
          return;
        }
      } catch (error) {
        console.log("Error ejecutando el código");
      }
    }, 10000); // 10000 milisegundos = 10 segundos

    /**
     * Configurar un temporizador para detener el intervalo después de 2 minutos
     */
    setTimeout(async () => {
      if (frenado) {
        return;
      }
      clearInterval(intervalo);
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`⌛ Tiempo de espera agotado`)
            .setDescription(
              `El tiempo de espera ha expirado, por favor intenta de nuevo.`
            )
            .setColor("Red"),
        ],
        components: [],
      });

      return;
    }, 120000); // 120000 milisegundos = 2 minutos
  },
};
