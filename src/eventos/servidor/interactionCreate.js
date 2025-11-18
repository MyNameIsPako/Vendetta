const config = require("../../configuraciones/base.js");
const {
  EmbedBuilder,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { logs } = require("../../funciones/funciones.js");
const esctructura = require("../../estructuras/esctructura");
const mongodb = require("../../schemas/usuarioInfo");
const datosUsuario = require("../../schemas/usuarios");
require("../../funciones/funciones.js");
const cooldown = new Map();

module.exports = {
  event: "interactionCreate",
  /**
   * Maneja la creación de interacciones.
   * @param {esctructura} client - El cliente extendido de Discord.
   * @param {import('discord.js').Interaction} interaction - La interacción del comando.
   * @returns
   */
  run: async (client, interaction) => {
    if (!interaction.isCommand()) return;

    if (config.handler.modoOficial && interaction.commandName !== "ayuda") {
      const botonRepo = new ButtonBuilder()
        .setLabel("GitHub")
        .setEmoji("📂")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/MyNameIsPako/Vendetta");

      const botonSoporte = new ButtonBuilder()
        .setLabel("Servidor de Soporte")
        .setEmoji("🆘")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/miabot");

      const actionRow = new ActionRowBuilder().addComponents(
        botonSoporte,
        botonRepo
      );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "Este bot es de código abierto, por lo que no puedes usar ningún comando en modo oficial. Puedes clonar el repositorio y utilizarlo en tu propio servidor de Discord.\n\n> 🥰 Estamos muy contentos de poder proporcionar un bot de código abierto para la comunidad hispana y poder enseñaros cómo funciona todo este sistema, ya que no hay documentación en español sobre ello."
            )
            .setColor(Colors.DarkBlue),
        ],
        components: [actionRow],
        ephemeral: true,
      });
      return;
    }

    const user = interaction?.user?.id || interaction?.member?.id;

    if (
      config.handler.comandos.slash === false &&
      interaction.isChatInputCommand()
    )
      return;

    if (
      config.handler.comandos.usuario === false &&
      interaction.isUserContextMenuCommand()
    )
      return;

    if (
      config.handler.comandos.mensaje === false &&
      interaction.isMessageContextMenuCommand()
    )
      return;

    const command = client.collection.interactionComandos.get(
      interaction.commandName
    );

    if (!command) return;

    try {
      if (command.options?.developers) {
        if (
          config.devs?.desarrolladores?.length > 0 &&
          !config.devs?.desarrolladores?.includes(interaction.user.id)
        ) {
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("⚠️ Comando desarrolladores")
                .setDescription(
                  "Este comando es únicamente para los desarrolladores."
                )
                .setColor(Colors.Red),
            ],
          });

          return;
        } else if (config.devs?.desarrolladores?.length <= 0) {
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("⚠️ Comando desarrolladores")
                .setDescription(
                  "Este comando es únicamente para los desarrolladores."
                )
                .setColor(Colors.Red),
            ],
          });

          return;
        }
      }

      if (command.options?.cooldown) {
        const cooldownFunction = async () => {
          let data = cooldown.get(interaction.user.id);

          data.push(interaction.commandName);

          cooldown.set(interaction.user.id, data);

          setTimeout(() => {
            let data = cooldown.get(interaction.user.id);

            data = data.filter((v) => v !== interaction.commandName);

            if (data.length <= 0) {
              cooldown.delete(interaction.user.id);
            } else {
              cooldown.set(interaction.user.id, data);
            }
          }, command.options?.cooldown);
        };

        if (cooldown.has(interaction.user.id)) {
          let data = cooldown.get(interaction.user.id);

          if (data.some((v) => v === interaction.commandName)) {
            await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("⌛ Cooldown")
                  .setDescription(
                    "¡Ve más despacio!, espera unos segundos antes de volver a usar este comando."
                  )
                  .setColor(Colors.Red),
              ],
            });

            return;
          } else {
            cooldownFunction();
          }
        } else {
          cooldown.set(interaction.user.id, [interaction.commandName]);

          cooldownFunction();
        }
      }

      let datosUsuarios = await datosUsuario.findOne({
        id: interaction?.user?.id || interaction?.member?.id,
      });
      if (!datosUsuarios) {
        const guardado = new datosUsuario({
          id: interaction?.user?.id || interaction?.member?.id,
        });

        await guardado.save();
      }
      datosUsuarios = await datosUsuario.findOne({
        id: interaction?.user?.id || interaction?.member?.id,
      });

      if (datosUsuarios.blacklisted == true) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "`⛔` Estás en la blacklist de Vendetta, no puedes usar los comandos."
              )
              .setColor(Colors.Red),
          ],
        });
        return;
      }

      let sinDatos = await mongodb.findOne({
        id: interaction?.user?.id || interaction?.member?.id,
      });
      if (command.options?.fortnite == false) {
        command.run(client, interaction, sinDatos, mongodb, datosUsuarios);
        return;
      }

      let datos = await mongodb.findOne({
        id: interaction?.user?.id || interaction?.member?.id,
      });

      if (!datos || !datos.deviceAuths || datos.deviceAuths.length === 0) {
        datos = null;
      } else {
        try {
          const auth = datos.deviceAuths.find(
            (deviceAuth) => deviceAuth.cuentaMain
          );
          if (auth) {
            datos = auth;
          } else {
            const sinCuentaMain = datos.deviceAuths.every(
              (account) => !account.cuentaMain
            );

            if (sinCuentaMain && datos.deviceAuths.length > 0) {
              const ultimaCuenta =
                datos.deviceAuths[datos.deviceAuths.length - 1];
              ultimaCuenta.cuentaMain = true;
              await datos.save();

              datos = ultimaCuenta;
            }
          }
        } catch (err) {
          if (
            err.response.data.errorCode.includes(
              "errors.com.epicgames.account.invalid_account_credentials"
            )
          ) {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    "`🌿` Tu sesión expiró, tienes que iniciar sesión de nuevo."
                  )
                  .setColor(Colors.Red)
                  .setFooter({ text: err.response.data.errorCode }),
              ],
            });
            await mongodb.findOneAndDelete({
              id: interaction?.user?.id || interaction?.member?.id,
            });
            return;
          } else if (
            err.response.data.errorCode.includes(
              "errors.com.epicgames.common.missing_action"
            )
          ) {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    "`⚠️` Tu cuenta está baneada de Fortnite, ha sido borrada de Vendetta."
                  )
                  .setColor(Colors.Red)
                  .setFooter({ text: err.response.data.errorCode }),
              ],
            });
            const buscarAuth = datos.deviceAuths.find(
              (deviceAuth) => deviceAuth.cuentaMain
            );
            const idCuentaBorrar = buscarAuth.accountId;
            mongodb
              .updateOne(
                { "deviceAuths.accountId": idCuentaBorrar },
                { $pull: { deviceAuths: { accountId: idCuentaBorrar } } }
              )
              .then(async (resultado) => {
                if (resultado.modifiedCount > 0) {
                  return;
                } else {
                  logs(
                    `Ups, no encontré nada en la db para ${idCuentaBorrar}}`,
                    "error"
                  );
                }
              })
              .catch((error) => {
                logs(error, "error");
              });
          } else {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription("`⚠️` Ocurrió un error")
                  .addFields({
                    name: "Código de error:",
                    value: `>>> ` + err.response.data.errorCode,
                  })
                  .setColor(Colors.Red)
                  .setFooter({ text: err.response.data.errorCode }),
              ],
            });
            return;
          }
        }
      }

      command.run(client, interaction, datos, mongodb, datosUsuarios);
    } catch (error) {
      logs(error, "err");
    }
  },
};
