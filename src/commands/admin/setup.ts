/* eslint-disable @typescript-eslint/no-base-to-string */
import { Subcommand } from '@sapphire/plugin-subcommands';
import { PermissionFlagsBits } from 'discord.js';

export class SetupCommand extends Subcommand {
	public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			...options,
			description: 'Set Up',
			preconditions: ['GuildOnly'],
			subcommands: [{ name: 'voicechannel', chatInputRun: 'chatInputVoice' }],
		});
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
				.addSubcommand(command =>
					command
						.setName('voicechannel')
						.setDescription('Setup the voice chat channel.')
						.addChannelOption(option =>
							option
								.setName('channel')
								.setDescription('The channel to log VC info into.')
								.setRequired(true),
						),
				),
		);
	}

	public async chatInputVoice(interaction: Subcommand.ChatInputCommandInteraction) {
		const channel = interaction.options.getChannel('channel', true);
		await interaction.deferReply({ ephemeral: true });

		await this.container.prisma.guild.upsert({
			where: { id: interaction.guild!.id },
			update: { voiceChannelId: channel.id },
			create: { id: interaction.guild!.id, voiceChannelId: channel.id },
		});

		await interaction.editReply({ content: `Set ${channel} as new voice channel` });
	}
}
