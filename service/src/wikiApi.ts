import fetch from 'node-fetch';

interface BaseResponse {
  title: string,
  pageid: number,
  redirects?: {
    from: string,
    to: string,
  }[],
}

type ParseResponse<T> = {
  parse: BaseResponse & T,
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
  }
}

export type ParsePagetreeResponse = ParseResponse<{ parsetree: { "*": string } }>;
export type ParseWikitextResponse = ParseResponse<{ wikitext: { "*": string } }>;
export type ParseTextResponse = ParseResponse<{ text: { "*": string } }>;
export type ParseSectionsResponse = ParseResponse<{ sections: SectionResponse[] }>;

export class WikiApi {
  constructor(readonly endpoint: string) {}

  async getPageMetadata(title: string): Promise<PageInfoResponse> {
    const url = new URL(this.endpoint);
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("prop", "info");
    url.searchParams.set("inprop", "url");
    url.searchParams.set("redirects", "1");
    url.searchParams.set("titles", title);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`could not retrieve article: ${response.status} ${response.statusText}`);
    }
    return await response.json() as PageInfoResponse;
  }

  async parsePage(id: number, prop: "parsetree", params: { [key: string]: string }): Promise<ParsePagetreeResponse>;
  async parsePage(id: number, prop: "wikitext", params: { [key: string]: string }): Promise<ParseWikitextResponse>;
  async parsePage(id: number, prop: "text", params: { [key: string]: string }): Promise<ParseTextResponse>;
  async parsePage(id: number, prop: "sections", params: { [key: string]: string }): Promise<ParseSectionsResponse>;
  async parsePage(id: number, prop: string, params: { [key: string]: string }): Promise<ParseResponse<{}>>;
  async parsePage(id: number, prop: string, params: { [key: string]: string }): Promise<ParseResponse<{}>> {
    const url = new URL(this.endpoint);
    url.searchParams.set("action", "parse");
    url.searchParams.set("format", "json");
    url.searchParams.set("prop", prop);
    url.searchParams.set("redirects", "1");
    url.searchParams.set("pageid", id?.toString());
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`could not retrieve article: ${response.status} ${response.statusText}`);
    }
    return await response.json() as ParseResponse<{}>;
  }
}
