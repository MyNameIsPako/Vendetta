# Vendetta

Vendetta is a bot focused on the Fortnite API, designed for educational purposes so anyone can learn and create their first bot. Since there isn't much documentation in Spanish on this topic, this bot aims to fill that gap and provide a practical guide. With Vendetta, we hope users can learn and launch their own bot effectively.

---

## 🔗 Links

- [Support and help server](https://discord.gg/SnH6fVk8hJ)

---

## ✨ Features

- **Fortnite API**: Full integration with the Fortnite API.
- **Database**: Data management with MongoDB to improve user privacy.
- **Slash and Prefix Commands**: Support for both slash commands and prefix commands.
- **Account Management**: Support for registration, switching between accounts, and accessToken auto-refresh.

---

## 🔧 Configuration

First you need to create a file named `.env`:

```js
// Discord bot token
tokenDiscord = "";

// Discord client ID
clienteId = "";

// Development server ID (optional, for server-specific commands)
servidorDesarollo = "";

// MongoDB connection URI
mongoDB = "";

// Bot error channel
canalErrores = "";
```

---

## 🚀 Installation and setup

1. Install [Node.js v20.x](https://nodejs.org) and [npm](https://www.npmjs.com/).
2. Clone the repo or download the .zip.
3. Install dependencies:
   ```bash
   npm i
   ```
4. Configure the bot:
   - Replace any values in `/configuraciones/Vendetta.js` with your own data.
   - Enable all **Privileged Intents** in the Discord developer portal.
5. Start the bot:
   ```bash
   npm .
   ```

---

## 📋 Commands

- **Account management**: `registrar`, `cambiar`, `ver`, `borrar`
- **Devs**: `recargar`, `*prefix`, `*ping`
- **Info**: `*ayuda`

> 💡 Commands marked with \* support prefix usage

---

## 📄 Suggestions / To-do

- [x] TaxiBots system
- [x] BlackList
- ... (more things?)

> ℹ️ If you want more features added, just join the Mia Lounge server and leave a suggestion.

---

## 📜 License

This project is licensed under the **CC-BY-NC-SA-4.0 License**. See the [LICENSE](LICENSE) file for details.

---

Enjoy this project created for all of you! 💖
