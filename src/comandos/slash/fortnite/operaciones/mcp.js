const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  AttachmentBuilder,
  Colors,
} = require("discord.js");
const ExtendedClient = require("../../../../estructuras/esctructura.js");
const { mcpRequest } = require("../../../../funciones/funciones.js");
const config = require("../../../../configuraciones/base.js");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("mcp")
    .setDescription("Realiza una operacion con la API de Fortnite.")
    .addStringOption((option) =>
      option
        .setName("operacion")
        .setDescription("Dime la operacion que deseas realizar.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("perfil")
        .setDescription("Dime el tipo de perfil que deseas.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("ruta")
        .setDescription("Dime la ruta de la operacion.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("payload")
        .setDescription("¿Añadiremos algun payload?")
        .setRequired(false)
    ),
  options: {
    developers: true,
  },
  /**
   * Ejecuta el comando MCP.
   * @param {ExtendedClient} client - El cliente extendido de Discord.
   * @param {ChatInputCommandInteraction<true>} interaction - La interacción del comando.
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
        ephemeral: true,
      });
      return;
    }

    try {
      /**
       * Para obtener todos los datos de las operaciones los tienes aqui => https://github.com/LeleDerGrasshalmi/FortniteEndpointsDocumentation/tree/main/EpicGames/WexService/Game/Profile/operations
       */
      const operacion = interaction.options.getString("operacion");
      const perfil = interaction.options.getString("perfil");
      const ruta = interaction.options.getString("ruta");
      let payload = interaction.options?.getString("payload");
      if (!payload) {
        payload = {};
      }
      await interaction.deferReply();
      const contenido = mcpRequest(operacion, ruta, perfil, payload, loginData);
      const bufferArchivo = Buffer.from(contenido, "utf-8");

      await interaction.editReply({
        content: `> \`✅\` Operacion realizada con exito.`,
        files: [
          new AttachmentBuilder(bufferArchivo, {
            name: `mcp_Vendetta_operacion.json`,
          }),
        ],
      });
    } catch (err) {
      await interaction.editReply({
        content: `> \`⚠️\` Ocurrio un error al ejecutar la operacion...`,
        files: [
          new AttachmentBuilder(Buffer.from(`${err}`, "utf-8"), {
            name: "mcp_Vendetta_error.txt",
          }),
        ],
      });
    }
  },
};
