const { logs } = require("../../funciones/funciones.js");

/**
 * AntiCrash para hacer que el bot no pete, creado y mejorado por @mynameispako.
 */
const antiCrash = (client) => {
  // Primero removemos los listeners para evitar que se dupliquen
  process.removeAllListeners();

  /**
   * Empezamos a capturar los errores posibles de discord.
   */
  process.on("unhandledRejection", (reason, promise) => {
    logs(`Unhandled Rejection at: ${promise} reason: ${reason}`, "antiCrash");
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Aquí puedes añadir más cosas, por ejemplo, enviar el error a un canal de Discord
  });

  process.on("uncaughtException", (error) => {
    logs(`Uncaught Exception thrown: ${error}`, "antiCrash");
    console.error('Uncaught Exception thrown:', error);
    // Aquí puedes añadir más cosas, por ejemplo, enviar el error a un canal de Discord
    process.exit(1); // Salir del proceso para evitar un estado inconsistente
  });

  process.on("rejectionHandled", (promise) => {
    logs(`Promise rejection was handled asynchronously: ${promise}`, "antiCrash");
    console.warn('Promise rejection was handled asynchronously:', promise);
    // Aquí puedes añadir más cosas, por ejemplo, enviar el error a un canal de Discord
  });

  process.on("warning", (warning) => {
    logs(`Warning: ${warning}`, "antiCrash");
    console.warn('Warning:', warning);
    // Aquí puedes añadir más cosas, por ejemplo, enviar el error a un canal de Discord
  });

  /**
   * Ahora aquí usaremos algunos eventos más, estos no son importantes pero yo los uso.
   */
  process.on("multipleResolves", (type, promise, reason) => {
    logs(`Multiple resolves detected: ${type} ${promise} ${reason}`, "antiCrash");
    console.warn('Multiple resolves detected:', type, promise, reason);
    // Aquí puedes añadir más cosas, por ejemplo, enviar el error a un canal de Discord
  });

  process.on("SIGINT", () => {
    logs('Process interrupted (SIGINT)', "antiCrash");
    console.log('Process interrupted (SIGINT)');
    process.exit();
  });

  process.on("SIGUSR1", () => {
    logs('Process interrupted (SIGUSR1)', "antiCrash");
    console.log('Process interrupted (SIGUSR1)');
    process.exit();
  });

  process.on("SIGUSR2", () => {
    logs('Process interrupted (SIGUSR2)', "antiCrash");
    console.log('Process interrupted (SIGUSR2)');
    process.exit();
  });
};

module.exports = antiCrash;