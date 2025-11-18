const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Colors,
} = require("discord.js");
const ExtendedClient = require("../../../../estructuras/esctructura.js");
const axios = require("axios");
const config = require("../../../../configuraciones/base.js");
const userInfo = require("../../../../schemas/usuarioInfo.js");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("registrar")
    .setDescription("Registra tu cuenta de Fortnite en Vendetta."),
  options: {
    fortnite: false,
  },
  /**
   * Ejecuta el comando de registro.
   * @param {ExtendedClient} client - El cliente extendido de Discord.
   * @param {ChatInputCommandInteraction} interaction - La interacción del comando.
   */
  run: async (client, interaction, loginData, mongodb) => {
    const userId = interaction?.user?.id || interaction?.member?.id;

    if (!config.handler?.mongodb?.activado) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "`❌` La base de datos no esta lista o no esta activada por lo que no se puede usar este comando."
            )
            .setColor(Colors.Red),
        ],
      });
      return;
    }

    const db = await mongodb.findOne({ id: userId });

    if (db && db.deviceAuths) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Guardar nueva cuenta")
          .setEmoji("✨")
          .setStyle(ButtonStyle.Success)
          .setCustomId("guardar_cuenta"),
        new ButtonBuilder()
          .setLabel("Cambiar cuenta")
          .setEmoji("🔄")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("cambiar_cuenta")
      );

      const infoCuentas = db.deviceAuths
        .map((account, index) => {
          return `\`${index + 1}.\` **${account.displayName}** *(${
            account.accountId
          })*`;
        })
        .join("\n");

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `Tienes **${db.deviceAuths.length}** cuenta(s) guardada(s) en Vendetta.`
            )
            .addFields({
              name: "Cuentas guardadas:",
              value: `>>> ` + infoCuentas,
            })
            .setColor(Colors.Green),
        ],
      });

      return;
    }

    let url =
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token";
    let payload = "grant_type=client_credentials";
    let headers = {
      Authorization:
        "basic OThmN2U0MmMyZTNhNGY4NmE3NGViNDNmYmI0MWVkMzk6MGEyNDQ5YTItMDAxYS00NTFlLWFmZWMtM2U4MTI5MDFjNGQ3",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const respuesta = await axios.post(url, payload, { headers: headers });

    const deviceAuth = await axios.post(
      "https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/deviceAuthorization",
      { prompt: "login" },
      {
        headers: {
          Authorization: "bearer " + respuesta.data.access_token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const confirmar = new ButtonBuilder()
      .setLabel("Iniciar sesión")
      .setStyle(ButtonStyle.Link)
      .setDisabled(false)
      .setURL(deviceAuth.data.verification_uri_complete);

    const row = new ActionRowBuilder().addComponents(confirmar);

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: "📲 ¡Inicia sesión en tu cuenta de Epic Games!",
            url: deviceAuth.data.verification_uri_complete,
          })
          .setDescription(
            `\`⚠️\` **¡Recomendamos solo iniciar sesión en cuentas que tengas acceso al correo!**\n> \`1.\` Haz clic en el botón de "Iniciar sesión".\n> \`2.\` Dale a "confirmar" en la web.\n> \`3.\` ¡Listo ya estaras registrado!`
          )
          .setColor(Colors.DarkBlue),
      ],
      components: [row],
    });

    let estadoRequest = 0;
    let frenado = false;
    let dataSesion;
    let accid, deviceid, secret;
    const deviceCode = deviceAuth.data.device_code;

    /**
     * Configurar un temporizador para ejecutar el código cada 10 segundos
     */
    const interval = setInterval(async () => {
      try {
        if (frenado) {
          clearInterval(interval);
          console.log("Intervalo limpiado");
          return;
        }

        const response = await axios.post(
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
        dataSesion = response.data;
        if (response.status === 200) {
          console.log(response.data);
          estadoRequest = 1;
          clearInterval(interval);
          frenado = true;

          interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription("`⌛` Guardando tu inicio de sesión...")
                .setColor(Colors.DarkBlue),
            ],
            components: [],
          });

          axios
            .post(
              `https://account-public-service-prod.ol.epicgames.com/account/api/public/account/${response.data.account_id}/deviceAuth`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${response.data.access_token}`,
                },
              }
            )
            .then((deviceauths) => {
              if (!estadoRequest == 1) {
                return;
              }
              accid = deviceauths.data.accountId;
              deviceid = deviceauths.data.deviceId;
              secret = deviceauths.data.secret;
              estadoRequest = 2;

              const saved = new userInfo({
                id: userId,
                deviceAuths: [
                  {
                    displayName: dataSesion.displayName ?? "IDK",
                    accountId: accid,
                    deviceId: deviceid,
                    secret: secret,
                    cuentaMain: true,
                  },
                ],
              });

              saved
                .save()
                .then(() => {
                  interaction.editReply({
                    embeds: [
                      new EmbedBuilder()
                        .setDescription(
                          `**👋 ¡Bienvenid@ ${dataSesion.displayName} a Vendetta!**\n\n> \`✅\` Se guardo tu inicio de sesión correctamente.`
                        )
                        .setColor(Colors.Green),
                    ],
                    components: [],
                  });
                })
                .catch(() => {
                  interaction.editReply({
                    embeds: [
                      new EmbedBuilder().setDescription(
                        `\`❌\` Hubo un error al guardar tu inicio de sesión...`
                      ),
                    ],
                  });
                });
            })
            .catch(() => {
              interaction.editReply({
                embeds: [
                  new EmbedBuilder().setDescription(
                    `\`❌\` Ocurrio un error al obtener la información de tu cuenta.`
                  ),
                ],
              });
            });
        } else if (
          response.data.errorCode == "errors.com.epicgames.not_found"
        ) {
          interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  "`❌` Cancelaste con éxito el inicio de sesión."
                )
                .setColor(Colors.Green),
            ],
            components: [],
          });
          frenado = true;
          return;
        }
      } catch (error) {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setDescription("`⚠️` Ocurrio un error con el comando...")
              .setColor(Colors.Red),
          ],
          components: [],
        });
      }
    }, 10000); // 10000 milisegundos = 10 segundos
  },
};
