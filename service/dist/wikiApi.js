import fetch from 'node-fetch';
export class WikiApi {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    async getPageMetadata(title) {
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
        return await response.json();
    }
    async parsePage(id, prop, params) {
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
        return await response.json();
    }
}
//# sourceMappingURL=wikiApi.js.map