import { Listener } from '@sapphire/framework';
import { SubcommandPluginEvents, type ChatInputSubcommandErrorPayload } from '@sapphire/plugin-subcommands';
import { handleChatInputOrContextMenuCommandError } from '#utilities/functions/errorHelpers';

export class ChatInputSubcommandErrorListener extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandError> {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: SubcommandPluginEvents.ChatInputSubcommandError,
		});
	}

	public async run(error: Error, payload: ChatInputSubcommandErrorPayload) {
		return handleChatInputOrContextMenuCommandError(error, payload);
	}
}
