interface BaseResponse {
    title: string;
    pageid: number;
    redirects?: {
        from: string;
        to: string;
    }[];
}
type ParseResponse<T> = {
    parse: BaseResponse & T;
};
export interface SectionResponse {
    toclevel: number;
    level: string;
    line: string;
    number: string;
    index: string;
    fromtitle: string;
    byteoffset: number;
    anchor: string;
}
export interface PageInfo {
    pageid: number;
    ns: number;
    title: string;
    contentmodel: string;
    pagelanguage: string;
    pagelanguagehtmlcode: string;
    pagelanguagedir: string;
    touched: string;
    lastrevid: number;
    length: number;
    fullurl: string;
    editurl: string;
    canonicalurl: string;
}
export interface PageInfoResponse {
    query: {
        redirects?: {
            from: string;
            to: string;
        }[];
        pages?: {
            [key: number]: PageInfo;
        };
    };
}
export type ParsePagetreeResponse = ParseResponse<{
    parsetree: {
        "*": string;
    };
}>;
export type ParseWikitextResponse = ParseResponse<{
    wikitext: {
        "*": string;
    };
}>;
export type ParseTextResponse = ParseResponse<{
    text: {
        "*": string;
    };
}>;
export type ParseSectionsResponse = ParseResponse<{
    sections: SectionResponse[];
}>;
export declare class WikiApi {
    readonly endpoint: string;
    constructor(endpoint: string);
    getPageMetadata(title: string): Promise<PageInfoResponse>;
    parsePage(id: number, prop: "parsetree", params: {
        [key: string]: string;
    }): Promise<ParsePagetreeResponse>;
    parsePage(id: number, prop: "wikitext", params: {
        [key: string]: string;
    }): Promise<ParseWikitextResponse>;
    parsePage(id: number, prop: "text", params: {
        [key: string]: string;
    }): Promise<ParseTextResponse>;
    parsePage(id: number, prop: "sections", params: {
        [key: string]: string;
    }): Promise<ParseSectionsResponse>;
    parsePage(id: number, prop: string, params: {
        [key: string]: string;
    }): Promise<ParseResponse<{}>>;
}
export {};
