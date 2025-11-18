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
const config = require("../../../../configuraciones/base.js");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("ver")
    .setDescription("Revisa que cuenta tienes como principal en Vendetta"),
  options: {
    fortnite: true,
  },
  /**
   * Ejecuta el comando para mostrar la cuenta con la que has iniciado sesión.
   * @param {ExtendedClient} client - El cliente extendido de Discord.
   * @param {ChatInputCommandInteraction} interaction - La interacción del comando.
   */
  run: async (client, interaction, loginData) => {
    if (!config.handler?.mongodb?.activado) {
      await interaction.reply({
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

    if (!loginData) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "`⚠️` No tienes ninguna cuenta registrada en Vendetta, usa `/registrar` para empezar."
            )
            .setColor(Colors.Red),
        ],
        components: [],
      });
      return;
    } else {
      /**
       * Crear un botón para mostrar todas las cuentas guardadas
       */
      const mostrarCuentasButton = new ButtonBuilder()
        .setLabel("Mostrar todas las cuentas")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("mostrar_cuentas");

      /**
       * Crear una fila de acción que contenga el botón
       */
      const row = new ActionRowBuilder().addComponents(mostrarCuentasButton);

      /**
       * Enviar el embed "Quién soy" con el botón
       */
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `Tu sesion activa en Vendetta es con **${loginData.displayName}**\n\n> \`💡\` Puedes revisar todas las cuentas registradas en Vendetta dandole a "Mostrar todas las cuentas".`
            )
            .setColor(Colors.DarkBlue),
        ],
        components: [row],
      });
    }
  },
};
