import { Listener, type ContextMenuCommandErrorPayload, Events } from '@sapphire/framework';
import { handleChatInputOrContextMenuCommandError } from '#utilities/functions/errorHelpers';

export class ContextMenuCommandErrorListener extends Listener<typeof Events.ContextMenuCommandError> {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: Events.ContextMenuCommandError,
		});
	}

	public async run(error: Error, payload: ContextMenuCommandErrorPayload) {
		return handleChatInputOrContextMenuCommandError(error, payload);
	}
}
