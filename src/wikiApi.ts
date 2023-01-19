import fetch from "node-fetch";

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

export type ParsePagetreeResponse = ParseResponse<{ parsetree: { "*": string } }>;
export type ParseWikitextResponse = ParseResponse<{ wikitext: { "*": string } }>;
export type ParseTextResponse = ParseResponse<{ text: { "*": string } }>;
export type ParseSectionsResponse = ParseResponse<{ sections: SectionResponse[] }>;

export class WikiApi {
  constructor(readonly endpoint: string) {}
  async parsePage(id: string, prop: "parsetree", params: { [key: string]: string }): Promise<ParsePagetreeResponse>;
  async parsePage(id: string, prop: "wikitext", params: { [key: string]: string }): Promise<ParseWikitextResponse>;
  async parsePage(id: string, prop: "text", params: { [key: string]: string }): Promise<ParseTextResponse>;
  async parsePage(id: string, prop: "sections", params: { [key: string]: string }): Promise<ParseSectionsResponse>;
  async parsePage(id: string, prop: string, params: { [key: string]: string }): Promise<ParseResponse<{}>>;
  async parsePage(id: string, prop: string, params: { [key: string]: string }): Promise<ParseResponse<{}>> {
    const url = new URL(this.endpoint);
    url.searchParams.set("action", "parse");
    url.searchParams.set("format", "json");
    url.searchParams.set("prop", prop);
    url.searchParams.set("redirects", "1");
    url.searchParams.set("page", id);
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
