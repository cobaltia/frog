import { Subcommand } from '@sapphire/plugin-subcommands';
import { Result } from '@sapphire/result';
import { getUser } from '#lib/database';
import { handleExperience } from '#lib/utilities/experience';

export class ExperienceCommand extends Subcommand {
	public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
		super(context, {
			...options,
			description: 'Manage the experience of someone.',
			subcommands: [{ name: 'add', chatInputRun: 'chatInputAdd' }],
		});
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(command =>
					command
						.setName('add')
						.setDescription('Add experience to someone.')
						.addUserOption(option =>
							option
								.setName('user')
								.setDescription('The user to add the experience too.')
								.setRequired(true),
						)
						.addIntegerOption(option =>
							option
								.setName('amount')
								.setDescription('The amount of experience to add.')
								.setRequired(true),
						),
				),
		);
	}

	public async chatInputAdd(interaction: Subcommand.ChatInputCommandInteraction) {
		await interaction.deferReply();

		const user = interaction.options.getUser('user', true);
		const amount = interaction.options.getInteger('amount', true);
		const channel = interaction.channel!;

		const result = await Result.fromAsync(async () => getUser(user.id));
		if (result.isErr()) {
			throw result.unwrapErr();
		}

		const data = result.unwrap();

		const experienceResult = await handleExperience(amount, data);

		await experienceResult.match({
			ok: async data => {
				if (data === false) return;
				await channel.send(`Congratulations ${user}, you have leveled up to level ${data.level}!`);
			},
			err: async error => this.container.logger.error(error),
		});
	}
}
