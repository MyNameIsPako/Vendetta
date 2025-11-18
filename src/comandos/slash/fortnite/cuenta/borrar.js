const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const ExtendedClient = require("../../../../estructuras/esctructura.js");
const config = require("../../../../configuraciones/base.js");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("borrar")
    .setDescription("Borra la cuenta principal o todas de Vendetta.")
    .addStringOption((option) =>
      option
        .setName("opcion")
        .setDescription(
          "Elige si deseas cerrar la sesión de la cuenta actual o de todas las cuentas."
        )
        .setRequired(true)
        .addChoices(
          { name: "Cuenta actual", value: "actual" },
          { name: "Todas las cuentas", value: "todas" }
        )
    ),
  options: {
    fortnite: false,
  },
  /**
   * Ejecuta el comando de cierre de sesión.
   * @param {ExtendedClient} client - El cliente extendido de Discord.
   * @param {ChatInputCommandInteraction} interaction - La interacción del comando.
   */
  run: async (client, interaction, loginData, mongodb) => {
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

    const userId = interaction?.user?.id || interaction?.member?.id;
    const opcion = interaction.options.getString("opcion");

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
    }

    /**
     * Buscar el documento existente para el usuario
     */
    const existingDocument = await mongodb.findOne({ id: userId });

    if (existingDocument && existingDocument.deviceAuths) {
      if (opcion === "actual") {
        /**
         * Encontrar la cuenta seleccionada actualmente
         */
        const selectedDeviceAuth = existingDocument.deviceAuths.find(
          (deviceAuth) => deviceAuth.cuentaMain
        );

        if (selectedDeviceAuth) {
          const accountIdToDelete = selectedDeviceAuth.accountId;

          /**
           * Actualizar el documento para eliminar la cuenta seleccionada
           */
          const result = await mongodb.updateOne(
            { id: userId },
            { $pull: { deviceAuths: { accountId: accountIdToDelete } } }
          );

          if (result.modifiedCount > 0) {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `\`✅\` La cuenta ${selectedDeviceAuth.displayName} a sido borrada de Vendetta.`
                  )
                  .setColor(Colors.Green),
              ],
              components: [],
            });

            /**
             * Verificar el número restante de cuentas
             */
            const remainingAccounts = existingDocument.deviceAuths.length - 1;

            if (remainingAccounts === 0) {
              /**
               * Si no quedan cuentas, eliminar todos los datos del usuario
               */
              await mongodb.deleteOne({ id: userId });
            }
          } else {
            interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    "`⚠️` No tienes ninguna cuenta reistrada en Vendetta usa `/registrar` para empezar."
                  )
                  .setColor(Colors.Red),
              ],
              components: [],
            });
          }
        } else {
          interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription(
                  "`⚠️` Por alguna razon no tienes ninguna cuenta como principal en Vendetta, usa /cambiar o /registrar para añadir una."
                )
                .setColor(Colors.Red),
            ],
            components: [],
          });
        }
      } else if (opcion === "todas") {
        /**
         * Eliminar todos los datos del usuario
         */
        await mongodb.deleteOne({ id: userId });
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                "`✅` Todas las cuentas han sido borradas de Vendetta."
              )
              .setColor(Colors.Green),
          ],
          components: [],
        });
      }
    } else {
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
    }
  },
};
