import { Command, Result } from '@sapphire/framework';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	PermissionFlagsBits,
	type MessageActionRowComponentBuilder,
} from 'discord.js';
import { getGuild } from '#lib/database';

export class SettingsCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			description: 'Guild settings.',
			preconditions: ['GuildOnly'],
		});
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
		);
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const { guild } = interaction;
		const result = await Result.fromAsync(async () => getGuild(guild!.id));
		if (result.isErr()) throw result.unwrapErr();
		const { voiceChannelId } = result.unwrap();

		const voiceChannel = voiceChannelId ? await guild?.channels.fetch(voiceChannelId) : null;
		const description = [`Voice Channel: ${voiceChannel ?? 'Disabled'}`];

		const embed = new EmbedBuilder()
			.setTitle(`${interaction.guild?.name}'s Settings`)
			.setDescription(description.join('\n'))
			.setFooter({ text: 'To reenable run the setup command again' });

		const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				new ButtonBuilder()
					.setStyle(voiceChannel ? ButtonStyle.Danger : ButtonStyle.Secondary)
					.setLabel(voiceChannel ? 'Disable Voice Message' : 'Voice Message disabled')
					.setCustomId(`button:settings:voice-${voiceChannel ? 'disable' : 'enable'}`)
					.setDisabled(!voiceChannel),
			),
		];

		await interaction.editReply({ embeds: [embed], components });
	}
}
