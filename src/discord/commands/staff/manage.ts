import { createCommand } from "#base";
import { menus } from "#menus";
import { ApplicationCommandOptionType } from "discord.js";

createCommand({
  name: "gerenciar",
  description: "...",
  defaultMemberPermissions: ["Administrator"],
  options: [
    {
      name: "produtos",
      description: "Gerenciar os produtos da loja.",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  async run(interaction) {
    const { options } = interaction;
    const subCmd = options.getSubcommand();

    switch (subCmd) {
      case "produtos": {
        await interaction.reply(menus.product.manage());
        return;
      }
    }
  },
});
