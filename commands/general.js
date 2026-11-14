
import { buildMenu } from "../lib/menu.js";

// ━━━ SAMMI MD BRANDING ━━━

const BOT_NAME = "𝐒𝐀𝐌𝐌𝐈 𝐌𝐃";
const BOT_TITLE = "♛ 𝐒𝐀𝐌𝐌𝐈 𝐌𝐃 𝐁𝐎𝐓 ♛";
const FOOTER = "ϟ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐁𝐄𝐍𝐅𝐄𝐈 𝐓𝐄𝐂𝐇";

// ━━━ MENU DESIGN ━━━

function getMenuStyle(ctx) {
  const menu = ctx.theme?.menu || {};

  return {
    top: String(menu.top || "╭─❖─〔 "),
    titleEnd: String(menu.titleEnd || " 〕─❖─"),
    infoLine: String(menu.infoLine || "│ ◈ "),
    itemLine: String(menu.itemLine || "│ ✦ ➤ "),
    blankLine: String(menu.blankLine || "│"),
    bottom: String(menu.bottom || "╰─❖━━━━━━━━❖─")
  };
}

// ━━━ BRANDED MESSAGE FORMAT ━━━

function formatPanel(ctx, title, rows = []) {
  const style = getMenuStyle(ctx);

  return [
    style.top + title + style.titleEnd,
    ...rows.map(row => style.infoLine + row),
    style.bottom
  ].join("\n");
}

// ━━━ FORMAT UPTIME ━━━

function formatDuration(seconds) {
  let remaining = Math.max(
    0,
    Math.floor(Number(seconds) || 0)
  );

  const days = Math.floor(remaining / 86400);
  remaining %= 86400;

  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const parts = [];

  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");

  if (secs || !parts.length) {
    parts.push(secs + "s");
  }

  return parts.join(" ");
}

// ━━━ MESSAGE RESPONSE TIME ━━━

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;

  const value =
    raw && typeof raw.toNumber === "function"
      ? raw.toNumber()
      : Number(raw);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value > 1000000000000
    ? value
    : value * 1000;
}

// ━━━ OWNER NUMBER ━━━

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers)
    ? config.ownerNumbers
    : [];

  return String(owners[0] || "").replace(/\D/g, "");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ♛ SAMMI MD GENERAL COMMANDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━

const commands = [

  // ━━━ MENU COMMAND ━━━

  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Show the branded SAMMI MD menu and available command sections.",

    run: async ctx => {
      const menu = buildMenu({
        commands: ctx.commands,
        config: ctx.config,
        theme: ctx.theme
      });

      if (ctx.config.imageUrl) {
        try {
          const caption = [
            "╭─❖─〔 " + BOT_TITLE + " 〕─❖─",
            "│ ◈ 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐁𝐎𝐓",
            "│ ◈ 𝐁𝐘 𝐁𝐄𝐍𝐅𝐄𝐈 𝐓𝐄𝐂𝐇",
            "│",
            "│ ✦ 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋 𝐏𝐀𝐈𝐑𝐈𝐍𝐆 𝐏𝐎𝐑𝐓𝐀𝐋",
            "│ ➤ " + (ctx.config.botUrl || "Not configured"),
            "╰─❖━━━━━━━━❖─",
            "",
            FOOTER
          ].join("\n");

          await ctx.send({
            image: {
              url: ctx.config.imageUrl
            },
            caption
          });

        } catch (error) {
          console.warn(
            "SAMMI MD menu artwork could not be sent; using the text menu:",
            error?.message || error
          );
        }
      }

      await ctx.reply(menu);
    }
  },

  // ━━━ HELP COMMAND ━━━

  {
    name: "help",
    category: "General",
    description: "List registered commands and their descriptions.",

    run: async ctx => {
      const style = getMenuStyle(ctx);
      const prefix = String(ctx.config.prefix || ".");

      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command =>
          prefix +
          command.name +
          (command.description
            ? " — " + command.description
            : "")
        );

      const createHeader = (continued = false) => [
        style.top +
          "✧ 𝐒𝐀𝐌𝐌𝐈 𝐌𝐃 𝐇𝐄𝐋𝐏" +
          (continued ? " (𝐂𝐎𝐍𝐓.)" : "") +
          style.titleEnd,
        style.infoLine + "Registered commands: " + rows.length,
        style.blankLine
      ].join("\n") + "\n";

      const chunks = [];
      let current = createHeader();

      for (const row of rows) {
        const formattedRow = style.itemLine + row + "\n";

        if (
          current.length +
          formattedRow.length +
          style.bottom.length > 3300
        ) {
          chunks.push(current.trimEnd() + "\n" + style.bottom);
          current = createHeader(true);
        }

        current += formattedRow;
      }

      if (current.trim()) {
        chunks.push(
          current.trimEnd() + "\n" + style.bottom
        );
      }

      for (const chunk of chunks) {
        await ctx.reply(chunk);
      }
    }
  },

  // ━━━ PING COMMAND ━━━

  {
    name: "ping",
    category: "General",
    description: "Check bot responsiveness and estimated message response time.",

    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);

      const responseMs = timestamp === null
        ? null
        : Math.max(0, Date.now() - timestamp);

      await ctx.reply(
        formatPanel(ctx, "🏓 𝐒𝐀𝐌𝐌𝐈 𝐌𝐃 𝐏𝐎𝐍𝐆", [
          "𝐒𝐓𝐀𝐓𝐔𝐒: " +
            (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),

          "𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄: " +
            (responseMs === null
              ? "Unavailable"
              : responseMs + " ms"),

          "𝐔𝐏𝐓𝐈𝐌𝐄: " + formatDuration(process.uptime()),

          "𝐕𝐄𝐑𝐒𝐈𝐎𝐍: " +
            String(ctx.config.version || "1.0.0")
        ])
      );
    }
  },

  // ━━━ ALIVE COMMAND ━━━

  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Show bot status, mode and uptime.",

    run: async ctx => {
      await ctx.reply(
        formatPanel(ctx, "♛ 𝐒𝐀𝐌𝐌𝐈 𝐌𝐃 𝐀𝐋𝐈𝐕𝐄", [
          "𝐁𝐎𝐓: " + BOT_NAME,

          "𝐒𝐓𝐀𝐓𝐔𝐒: " +
            (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),

          "𝐌𝐎𝐃𝐄: " +
            String(ctx.mode || "public").toUpperCase(),

          "𝐔𝐏𝐓𝐈𝐌𝐄: " +
            formatDuration(process.uptime()),

          "𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘: " +
            String(ctx.config.ownerName || "Benfei Tech")
        ])
      );
    }
  },

  // ━━━ OWNER COMMAND ━━━

  {
    name: "owner",
    category: "General",
    description: "Show Benfei Tech owner details.",

    run: async ctx => {
      const number = ownerNumber(ctx.config);

      const rows = [
        "𝐁𝐎𝐓: " + BOT_NAME,

        "𝐎𝐖𝐍𝐄𝐑: " +
          String(ctx.config.ownerName || "Benfei Tech")
      ];

      if (number) {
        rows.push("𝐍𝐔𝐌𝐁𝐄𝐑: +" + number);
      }

      await ctx.reply(
        formatPanel(ctx, "♛ 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎", rows)
      );
    }
  },

  // ━━━ SUPPORT COMMAND ━━━

  {
    name: "support",
    category: "General",
    description: "Show support guidance for SAMMI MD.",

    run: async ctx => {
      await ctx.reply(
        formatPanel(ctx, "✧ 𝐒𝐀𝐌𝐌𝐈 𝐌𝐃 𝐒𝐔𝐏𝐏𝐎𝐑𝐓", [
          "𝐁𝐎𝐓: " + BOT_NAME,

          "𝐎𝐖𝐍𝐄𝐑: " +
            String(ctx.config.ownerName || "Benfei Tech"),

          "𝐇𝐄𝐋𝐏: Setup support and bug reports",

          "𝐆𝐈𝐓𝐇𝐔𝐁:",
          "https://github.com/Benfeitech/FEI-XMD"
        ])
      );
    }
  },

  // ━━━ TIME COMMAND ━━━

  {
    name: "time",
    category: "General",
    description: "Show the current server time in Nigeria.",

    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());

      await ctx.reply(
        formatPanel(ctx, "◈ 𝐍𝐈𝐆𝐄𝐑𝐈𝐀 𝐓𝐈𝐌𝐄", [
          "𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍: Nigeria 🇳🇬",
          "𝐓𝐈𝐌𝐄: " + value,
          "𝐓𝐈𝐌𝐄𝐙𝐎𝐍𝐄: WAT (UTC+1)"
        ])
      );
    }
  },

  // ━━━ DATE COMMAND ━━━

  {
    name: "date",
    category: "General",
    description: "Show the current date in Nigeria.",

    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());

      await ctx.reply(
        formatPanel(ctx, "◇ 𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐃𝐀𝐓𝐄", [
          "𝐋𝐎𝐂𝐀𝐓𝐈𝐎𝐍: Nigeria 🇳🇬",
          "𝐃𝐀𝐓𝐄: " + value
        ])
      );
    }
  },

  // ━━━ VERSION COMMAND ━━━

  {
    name: "version",
    category: "General",
    description: "Show SAMMI MD version and connection status.",

    run: async ctx => {
      await ctx.reply(
        formatPanel(ctx, "✧ 𝐒𝐀𝐌𝐌𝐈 𝐌𝐃 𝐕𝐄𝐑𝐒𝐈𝐎𝐍", [
          "𝐁𝐎𝐓: " + BOT_NAME,

          "𝐕𝐄𝐑𝐒𝐈𝐎𝐍: " +
            String(ctx.config.version || "1.0.0"),

          "𝐒𝐓𝐀𝐓𝐔𝐒: " +
            (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),

          "𝐌𝐎𝐃𝐄: " +
            String(ctx.mode || "public").toUpperCase(),

          "𝐋𝐈𝐁𝐑𝐀𝐑𝐘: WhiskeySockets Baileys"
        ])
      );
    }
  },

  // ━━━ JID COMMAND ━━━

  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Show the current chat and message sender IDs.",

    run: async ctx => {
      await ctx.reply(
        formatPanel(ctx, "◈ 𝐂𝐇𝐀𝐓 𝐈𝐍𝐅𝐎", [
          "𝐂𝐇𝐀𝐓 𝐈𝐃: " +
            String(ctx.jid || "Unavailable"),

          "𝐒𝐄𝐍𝐃𝐄𝐑 𝐈𝐃: " +
            String(ctx.senderJid || "Unavailable")
        ])
      );
    }
  },

  // ━━━ WHOAMI COMMAND ━━━

  {
    name: "whoami",
    category: "General",
    description: "Show your WhatsApp sender information.",

    run: async ctx => {
      await ctx.reply(
        formatPanel(ctx, "♙ 𝐔𝐒𝐄𝐑 𝐈𝐍𝐅𝐎", [
          "𝐍𝐀𝐌𝐄: " +
            String(ctx.msg?.pushName || "Unknown"),

          "𝐔𝐒𝐄𝐑 𝐈𝐃: " +
            String(ctx.senderJid || "Unavailable"),

          "𝐎𝐖𝐍𝐄𝐑: " +
            (ctx.owner ? "Yes ♛" : "No")
        ])
      );
    }
  }

];

// ━━━ EXPORT SAMMI MD COMMANDS ━━━

export default commands;
