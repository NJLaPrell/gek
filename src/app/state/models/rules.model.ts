


// ###################################
// ## RULE MODEL
// ###################################

export interface Rule {
    id: string;
    name: string;
    type: 'and' | 'or';
    channelMatch: string;
    titleMatch: string;
    descriptionMatch: string;
    playlistId: string;
    edit?: boolean;
}

export interface RulesState {
    rules: Rule[]
}

export const initialRulesState = <RulesState>{
  rules: []
};

// ###################################
// ## API RESPONSE
// ###################################

export interface RulesResponse {
    lastUpdated: number;
    items: []
}

