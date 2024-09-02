import { type Events, Listener, type ContextMenuCommandSuccessPayload } from '@sapphire/framework';
import { handleChatInputOrContextMenuCommandSuccess } from '#utilities/functions/successHelper';

export class ContextMenuCommandSuccess extends Listener<typeof Events.ContextMenuCommandSuccess> {
	public override run(payload: ContextMenuCommandSuccessPayload) {
		return handleChatInputOrContextMenuCommandSuccess(payload);
	}
}
