# Vendetta

Vendetta es un bot enfocado en la API de Fortnite, diseñado con fines educativos para que cualquier persona pueda aprender y crear su primer bot. Dado que no existe mucha documentación en español sobre este tema, este bot busca llenar ese vacío y proporcionar una guía práctica. Con Vendetta, esperamos que los usuarios puedan aprender y lanzar su propio bot de manera efectiva.

---

## 🔗 Links

- [Servidor de soporte y ayuda](https://discord.gg/SnH6fVk8hJ)

---

## ✨ Características

- **API de Fortnite**: Integración completa con la API de Fortnite.
- **Base de datos**: Gestión de datos con MongoDB para mejorar la privacidad de los usuarios.
- **Comandos Slash y Prefijo**: Soporte tanto para comandos slash como para comandos con prefijo.
- **Gestión de Cuentas**: Soporte para registro, cambio entre cuentas y auto-refresco del accessToken.

---

## 🔧 Configuración

Primero tienes que crear un archivo llamado `.env`:

```js
# Token del bot de Discord
tokenDiscord = ""

# ID del cliente de Discord
clienteId = ""

# ID del servidor de desarrollo (opcional, para comandos específicos del servidor)
servidorDesarollo = ""

# URI de conexión a MongoDB
mongoDB = ""

# Canal de errores de el bot
canalErrores = ""
```

---

## 🚀 Instalación y configuración

1. Instala [Node.js v20.x](https://nodejs.org) y [npm](https://www.npmjs.com/).
2. Clona el repo o descarga el .zip
3. Instala las dependencias:
   ```bash
   npm i
   ```
4. Configura el bot:
   - Remplaza lo que quieras de `/configuraciones/Vendetta.js` con los datos tuyos.
   - Activa todos los **Intentos privilegiados** en el portal de desarolladores de discord.
5. Inicia el bot:
   ```bash
   npm .
   ```

---

## 📋 Comandos

- **Gestiona de la cuenta**: `registrar`, `cambiar`, `ver`, `borrar`
- **Devs**: `recargar`, `*prefix`, `*ping`
- **Info**: `*ayuda`

> 💡 Los comandos con \* tienen soporte para prefix

---

## 📄 Listado de sugerencias o nuevas cosas

- [x] Sistema de TaxiBots
- [x] BlackList
- ... (mas cosas?)

> ℹ️ SI quereis que se añadan mas cosas simplemente unete al servidor de Mia Lounge y dejanos la sugerencia.

---

## 📜 Licencia

Este proyecto está licenciado bajo la **Licencia CC-BY-NC-SA-4.0**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

disfruta de este projecto creado para todos vosotros! 💖
