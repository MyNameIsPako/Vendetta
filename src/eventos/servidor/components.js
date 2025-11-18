const { log } = require("../../funciones/funciones.js");
const esctructura = require("../../estructuras/esctructura");

module.exports = {
  event: "interactionCreate",
  /**
   *
   * @param {esctructura} client
   * @param {import('discord.js').Interaction} interaction
   * @returns
   */
  run: (client, interaction) => {
    /**
     * Si la interacción es un botón, ejecutamos el botón.
     */
    if (interaction.isButton()) {
      const componente = client.collection.componentes.botones.get(
        interaction.customId
      );

      if (!componente) return;

      try {
        componente.run(client, interaction);
      } catch (error) {
        log(error, "error");
      }

      return;
    }

    /**
     * Si la interacción es un selectMenu, ejecutamos el selectMenu.
     */
    if (interaction.isAnySelectMenu()) {
      const componente = client.collection.componentes.menus.get(
        interaction.customId
      );

      if (!componente) return;

      try {
        componente.run(client, interaction);
      } catch (error) {
        log(error, "error");
      }

      return;
    }

    /**
     * Si la interacción es un modalSubmit, ejecutamos el modal
     */
    if (interaction.isModalSubmit()) {
      const componente = client.collection.componentes.modals.get(
        interaction.customId
      );

      if (!componente) return;

      try {
        componente.run(client, interaction);
      } catch (error) {
        log(error, "error");
      }

      return;
    }
  },
};
