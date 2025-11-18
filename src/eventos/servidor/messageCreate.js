const { ChannelType, Message, EmbedBuilder, Colors } = require("discord.js");
const config = require("../../configuraciones/base.js");
const { log } = require("../../funciones/funciones.js");
const servidores = require("../../schemas/servidores");
const esctructura = require("../../estructuras/esctructura");

const cooldown = new Map();

module.exports = {
  event: "messageCreate",
  /**
   *
   * @param {esctructura} client
   * @param {Message<true>} message
   * @returns
   */
  run: async (client, message) => {
    if (message.author.bot || message.channel.type === ChannelType.DM) return;
    if (!config.handler.comandos.prefix) return;

    if (
      config.handler.modoOficial &&
      message.content !== `${config.handler.prefix}ayuda`
    ) {
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

      await message.reply({
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

    let prefix = config.handler.prefix;

    if (config.handler?.mongodb?.activado) {
      try {
        const datosServidor = await servidores.findOne({
          guild: message.guildId,
        });

        if (datosServidor && datosServidor?.prefix)
          prefix = datosServidor.prefix;
      } catch {
        prefix = config.handler.prefix;
      }
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const imputDatos = args.shift().toLowerCase();

    if (!imputDatos.length) return;

    let comando =
      client.collection.prefixComandos.get(imputDatos) ||
      client.collection.prefixComandos.get(
        client.collection.alias.get(imputDatos)
      );

    if (comando) {
      try {
        if (
          comando.structure?.permissions &&
          !message.member.permissions.has(comando.structure?.permissions)
        ) {
          await message.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  "`❌` No tienes permisos para usar este comando"
                )
                .setColor(Colors.Red),
            ],
          });

          return;
        }

        if (comando.structure?.dev) {
          if (!config.devs.desarrolladores.includes(message.author.id)) {
            setTimeout(async () => {
              await message.reply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      "`⚠️` Este comando es solo para desarrolladores."
                    )
                    .setColor(Colors.Red),
                ],
              });
            }, 5 * 1000);
          }

          return;
        }

        if (comando.structure?.cooldown) {
          const cooldownFunction = () => {
            let data = cooldown.get(message.author.id);

            data.push(imputDatos);

            cooldown.set(message.author.id, data);

            setTimeout(() => {
              let data = cooldown.get(message.author.id);

              data = data.filter((v) => v !== imputDatos);

              if (data.length <= 0) {
                cooldown.delete(message.author.id);
              } else {
                cooldown.set(message.author.id, data);
              }
            }, comando.structure?.cooldown);
          };

          if (cooldown.has(message.author.id)) {
            let data = cooldown.get(message.author.id);

            if (data.some((v) => v === imputDatos)) {
              await message.reply({
                embeds: [
                  new EmbedBuilder()
                    .setDescription(
                      "`🕐` Espera un poco antes de volver a usar el comando"
                    )
                    .setColor(Colors.Red),
                ],
              });

              return;
            } else {
              cooldownFunction();
            }
          } else {
            cooldown.set(message.author.id, [imputDatos]);

            cooldownFunction();
          }
        }
        comando.run(client, message, args);
      } catch (error) {
        log(error, "err");
      }
    }
  },
};
