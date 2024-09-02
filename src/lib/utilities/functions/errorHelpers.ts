/* eslint-disable unicorn/new-for-builtins */
import {
	UserError,
	type ChatInputCommandErrorPayload,
	type ContextMenuCommandErrorPayload,
	container,
	Events,
} from '@sapphire/framework';
import type { ChatInputSubcommandErrorPayload } from '@sapphire/plugin-subcommands';
import { codeBlock, type CommandInteraction } from 'discord.js';
import { OWNERS } from '#root/config';

const unknownErrorMessage =
	'An error occurred that I was not able to identify. Please try again. If error persists, please contact Juan.';

export async function handleChatInputOrContextMenuCommandError(
	error: Error,
	{
		command,
		interaction,
	}: ChatInputCommandErrorPayload | ChatInputSubcommandErrorPayload | ContextMenuCommandErrorPayload,
) {
	if (error instanceof UserError) return userError(interaction, error);

	const { client, logger } = container;

	if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
		return alert(interaction, 'I had a small network hiccup. Please try again.');
	}

	logger.fatal(`[COMMAND] ${command.location.full}\n${error.stack ?? error.message}`);
	try {
		await alert(interaction, generateUnexpectedErrorMessage(interaction, error));
	} catch (error) {
		client.emit(Events.Error, error as Error);
	}

	return undefined;
}

function generateUnexpectedErrorMessage(interaction: CommandInteraction, error: Error) {
	if (OWNERS.includes(interaction.user.id)) return codeBlock('js', error.stack!);
	return `I found an unexpected error, please report the steps you have taken to Juan.`;
}

export async function userError(interaction: CommandInteraction, error: UserError) {
	if (Reflect.get(Object(error.context), 'silent')) return;

	return alert(interaction, error.message || unknownErrorMessage);
}

async function alert(interaction: CommandInteraction, content: string) {
	if (interaction.replied || interaction.deferred) {
		return interaction.editReply({ content, allowedMentions: { users: [interaction.user.id], roles: [] } });
	}

	return interaction.reply({
		content,
		allowedMentions: { users: [interaction.user.id], roles: [] },
		ephemeral: true,
	});
}
