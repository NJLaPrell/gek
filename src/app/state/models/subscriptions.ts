// ###################################
// ## HELPER CLASS
// ###################################
export class SubscriptionsHelper {
    lastUpdated: number | false;
    subscriptions: Subscription[];

    constructor(res: SubscriptionsResponse) {
        this.lastUpdated = res.lastUpdated;
        this.subscriptions = res.items.map(s => ({
            id: s.snippet.resourceId.channelId,
            title: s.snippet.title,
            description: s.snippet.description,
            thumbnail: s.snippet.thumbnails.standard?.url || s.snippet.thumbnails.default?.url || 'https://i.ytimg.com/img/no_thumbnail.jpg' 
        }));
    }

    get = (): SubscriptionsState => (<SubscriptionsState>{
        lastUpdated: this.lastUpdated,
        subscriptions: this.subscriptions.sort((a, b) => a.title.localeCompare(b.title))
    });

}


// ###################################
// ## SUBSCRIPTIONS MODEL
// ###################################

export interface Subscription {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
}

export interface SubscriptionsState {
    lastUpdated: number;
    subscriptions: Subscription[]
}

export const initialSubscriptionState = <SubscriptionsState>{
    lastUpdated: 0,
    subscriptions: []
};

// ###################################
// ## API RESPONSE
// ###################################

export interface SubscriptionsResponse {
    lastUpdated: number,
    items: {
        kind: string;
        etag: string;
        id: string;
        snippet: {
            publishedAt: string;
            title: string;
            description: string;
            resourceId: {
                kind: string;
                channelId: string;
            }
            channelId: string;
            thumbnails: {
                default: { url: string; },
                standard: { url: string; },
                medium: { url: string; },
                high: { url: string; }
            }
        }
    }[]
}