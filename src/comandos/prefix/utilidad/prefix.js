const { Message } = require("discord.js");
const ExtendedClient = require("../../../estructuras/esctructura");
const config = require("../../../configuraciones/base.js");
const servidores = require("../../../schemas/servidores");

module.exports = {
  structure: {
    name: "prefix",
    description:
      "Cambia el prefix del bot en este servidor. (**<añadir/resetear>**)",
    alias: ["p"],
    permissions: "Administrator",
  },
  /**
   * @param {ExtendedClient} client
   * @param {Message<true>} message
   * @param {string[]} args
   */
  run: async (client, message, args) => {
    if (!config.handler?.mongodb?.toggle) {
      await message.reply({
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

    const type = args[0];

    switch (type) {
      case "añadir": {
        let db = await servidores.findOne({ guild: message.guildId });

        if (!db) {
          db = new servidores({
            guild: message.guildId,
          });
        }

        const antiguoPrefix = db.prefix || config.handler.prefix;

        if (!args[1]) {
          await message.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription("`⚠️` No has proporcionado un nuevo prefix.")
                .addField("Uso:", ">>>> prefix añadir <nuevo prefix>")
                .setColor(Colors.Red),
            ],
          });

          return;
        }

        db.prefix = args[1];

        await db.save();

        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `\`✅\` Prefix cambiado de \`${antiguoPrefix}\` a \`${args[1]}\`.`
              )
              .setColor(Colors.Green),
          ],
        });

        break;
      }

      case "resetear": {
        let db = await servidores.findOne({ guild: message.guildId });

        if (db) {
          await servidores.deleteOne({ guild: message.guildId });
        }

        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                `\`✅\` Prefix reseteado a \`${config.handler.prefix}\`.`
              )
              .setColor(Colors.Green),
          ],
        });

        break;
      }

      default: {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("`⚠️` Parametro no valido o no proporcionado.")
              .addField("Uso:", ">>>> prefix <añadir/resetear> <nuevo prefix>")
              .setColor(Colors.Red),
          ],
        });

        break;
      }
    }
  },
};
