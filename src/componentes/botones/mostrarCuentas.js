const { ButtonInteraction, EmbedBuilder, Colors } = require("discord.js");
const ExtendedClient = require("../../estructuras/esctructura");
const dbUsuarios = require("../../schemas/usuarioInfo");

module.exports = {
  customId: "mostrar_cuentas",
  /**
   * Ejecuta la acción de mostrar cuentas guardadas.
   * @param {ExtendedClient} client - El cliente extendido de Discord.
   * @param {ButtonInteraction} interaction - La interacción del botón.
   */
  run: async (client, interaction) => {
    /**
     * Obtiene todas las cuentas guardadas de la base de datos.
     */
    const cuentasGuardadas = await dbUsuarios.findOne({
      id: interaction?.user?.id || interaction?.member?.id,
    });

    if (
      cuentasGuardadas &&
      cuentasGuardadas.deviceAuths &&
      cuentasGuardadas.deviceAuths.length > 0
    ) {
      const accountList = cuentasGuardadas.deviceAuths
        .map((account) => `- ${account.displayName}`)
        .join("\n");

      /**
       * Envía un nuevo embed con la lista de cuentas guardadas.
       */
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `Cuentas guardadas en Vendetta:\n>>> ${accountList}`
            )
            .setColor(Colors.DarkBlue),
        ],
        ephemeral: true,
        components: [],
      });
    } else {
      /**
       * No se encontraron cuentas guardadas.
       */
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("No Saved Accounts")
            .setDescription("You don't have any saved accounts.")
            .setColor(Colors.DarkBlue),
        ],
        components: [],
      });
    }
  },
};
