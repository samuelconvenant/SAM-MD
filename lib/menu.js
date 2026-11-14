
export function getSectionCommands(section, commands = []) {
  const visible = commands.filter(command => !command.hidden);

  if (Array.isArray(section.commandNames)) {
    const selected = new Set(
      section.commandNames.map(value => String(value).toLowerCase())
    );

    return visible.filter(command =>
      selected.has(String(command.name).toLowerCase())
    );
  }

  const categories = Array.isArray(section.categories) && section.categories.length
    ? section.categories
    : [section.key];

  const excluded = new Set(section.excludeNames || []);

  return visible.filter(command =>
    categories.includes(command.category) && !excluded.has(command.name)
  );
}

export function buildMenu({ commands = [], config = {}, theme = {} } = {}) {
  const menu = theme.menu || {};
  const sections = Array.isArray(theme.sections) ? theme.sections : [];
  const prefix = String(config.prefix || ".");

  // ━━━ SAMMI MD BOT TITLE ━━━
  const safeName = Array.from(
    String(theme.botTitle || "♛ 𝐒𝐀𝐌𝐌𝐈 𝐌𝐃 𝐁𝐎𝐓 ♛")
      .replace(/[\r\n]/g, " ")
  ).slice(0, 40).join("");

  // ━━━ UNICODE MENU DESIGN ━━━
  const top = String(menu.top || "╭─❖─〔 ");
  const titleEnd = String(menu.titleEnd || " 〕─❖─");
  const infoLine = String(menu.infoLine || "│ ◈ ");
  const itemLine = String(menu.itemLine || "│ ✦ ➤ ");
  const blankLine = String(menu.blankLine || "│");
  const bottom = String(menu.bottom || "╰─❖━━━━━━━━❖─");

  // ━━━ MAIN MENU HEADER ━━━
  const lines = [
    top + safeName + titleEnd,
    infoLine + "Version: " + String(config.version || "1.0.0"),
    infoLine + "Prefix: " + prefix,
    infoLine + "Commands loaded: " + commands.filter(command => !command.hidden).length,
    blankLine
  ];

  // ━━━ EMPTY COMMAND STATE ━━━
  if (!commands.length) {
    lines.push(
      infoLine + "Command modules are being prepared."
    );
    lines.push(bottom);

  } else {
    const assigned = new Set();

    // ━━━ COMMAND SECTIONS ━━━
    for (const section of sections) {
      const members = getSectionCommands(section, commands)
        .filter(command => !assigned.has(command.name));

      lines.push(
        top + String(section.title || section.key) + titleEnd
      );

      if (!members.length) {
        lines.push(
          itemLine + "◇ 𝐍𝐎 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 𝐘𝐄𝐓"
        );
      } else {
        for (const command of members) {
          assigned.add(command.name);

          lines.push(
            itemLine + prefix + command.name +
            (command.description ? " — " + command.description : "")
          );
        }
      }

      lines.push(bottom, "");
    }

    // ━━━ OTHER COMMANDS ━━━
    const ungrouped = commands.filter(
      command => !command.hidden && !assigned.has(command.name)
    );

    if (ungrouped.length) {
      lines.push(
        top + "✧ 𝐎𝐓𝐇𝐄𝐑 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒" + titleEnd
      );

      for (const command of ungrouped) {
        lines.push(
          itemLine + prefix + command.name
        );
      }

      lines.push(bottom, "");
    }
  }

  // ━━━ SAMMI MD FOOTER ━━━
  lines.push("ϟ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐁𝐄𝐍𝐅𝐄𝐈 𝐓𝐄𝐂𝐇");

  return lines.join("\n");
}
