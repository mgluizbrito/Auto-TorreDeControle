import ConversationState from "./ConversationState.js";

type ActiveConversation = {
    state: ConversationState;
    selectedOption: string;
    plate?: string;
    tripData?: any;     
};

export type {ActiveConversation};