import { InteractionHandler, InteractionHandlerTypes, Result } from '@sapphire/framework';
import { DurationFormatter } from '@sapphire/time-utilities';
import {
	ActionRowBuilder,
	EmbedBuilder,
	inlineCode,
	type MessageActionRowComponentBuilder,
	StringSelectMenuBuilder,
	type StringSelectMenuInteraction,
} from 'discord.js';
import { ONE_TO_TEN } from '#lib/utilities/constants';

export class LeaderboardSelectMenuHandler extends InteractionHandler {
	public constructor(context: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
		super(context, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.SelectMenu,
		});
	}

	public override parse(interaction: StringSelectMenuInteraction) {
		const customId = interaction.customId;
		if (customId === 'select-menu:leaderboard') return this.some();
		return this.none();
	}

	public async run(interaction: StringSelectMenuInteraction) {
		const value = interaction.values[0];
		if (value === 'level') return this.handleLevel(interaction);
		if (value === 'vctime') return this.handleVcTime(interaction);
	}

	private async handleLevel(interaction: StringSelectMenuInteraction) {
		await interaction.deferUpdate();
		const result = await Result.fromAsync(async () =>
			this.container.prisma.user.findMany({ take: 10, orderBy: { level: 'desc' } }),
		);
		if (result.isErr()) throw result.unwrapErr();

		const data = result.unwrap();
		const description = [];

		for (const [index, userData] of data.entries()) {
			const user = await this.container.client.users.fetch(userData.id);
			const level = userData.level.toString();
			description.push(`${ONE_TO_TEN.get(index + 1)} ${inlineCode(` ${level} `)} - ${user}`);
		}

		const embed = new EmbedBuilder().setTitle('Level Leaderboard').setDescription(description.join('\n'));
		const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				new StringSelectMenuBuilder().setCustomId(`select-menu:leaderboard`).addOptions([
					{ label: 'Level', value: 'level', default: true },
					{ label: 'VC Time', value: 'vctime' },
				]),
			),
		];

		await interaction.editReply({ embeds: [embed], components });
	}

	private async handleVcTime(interaction: StringSelectMenuInteraction) {
		await interaction.deferUpdate();
		const result = await Result.fromAsync(async () => this.container.prisma.voice.findMany());
		if (result.isErr()) throw result.unwrapErr();

		const data = result.unwrap();
		const users = Array.from(new Set(data.map(entry => entry.userId)))
			.map(userId => ({
				userId,
				duration: data.filter(entry => entry.userId === userId).reduce((acc, curr) => acc + curr.duration, 0),
			}))
			.sort((a, b) => b.duration - a.duration)
			.slice(0, 10);
		const description = [];

		for (const [index, userData] of users.entries()) {
			const user = await this.container.client.users.fetch(userData.userId);
			const vcTime = new DurationFormatter().format(userData.duration);
			description.push(`${ONE_TO_TEN.get(index + 1)} ${inlineCode(` ${vcTime} `)} - ${user}`);
		}

		const embed = new EmbedBuilder().setTitle('VC Time Leaderboard').setDescription(description.join('\n'));
		const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [
			new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				new StringSelectMenuBuilder().setCustomId(`select-menu:leaderboard`).addOptions([
					{ label: 'Level', value: 'level' },
					{ label: 'VC Time', value: 'vctime', default: true },
				]),
			),
		];

		await interaction.editReply({ embeds: [embed], components });
	}
}
