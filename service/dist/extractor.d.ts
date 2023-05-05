export interface TalkMetadata {
    id: string;
    number: string;
    title: string;
    presenters: string[];
    content: string;
}
export interface EventMetadata {
    href: string;
    title: string;
    date: string;
    start: string;
    hosts: string[];
}
export interface Metadata {
    event: EventMetadata;
    talks: TalkMetadata[];
}
export declare class EventExtractor {
    private api;
    private parser;
    constructor(endpoint: string);
    private extractPageMetadata;
    private extractEventMetadata;
    private extractPresenters;
    private extractTalkMetadata;
    private extractTalks;
    private parseHosts;
    extractEvent(title: string): Promise<Metadata | null>;
}
