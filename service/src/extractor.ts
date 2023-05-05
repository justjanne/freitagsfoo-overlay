import { XMLParser } from 'fast-xml-parser';
import sanitizeHtml, { IFrame } from 'sanitize-html';
import { parseDocument } from 'htmlparser2';
import { findAll, getAttributeValue, textContent } from 'domutils';

import { PageInfo, SectionResponse, WikiApi } from './wikiApi.js';

export interface TalkMetadata {
  id: string;
  number: string;
  title: string;
  presenters: string[],
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

type XMLElement = string | XMLElement[] | { [key: string]: XMLElement }

export class EventExtractor {
  private api: WikiApi
  private parser: XMLParser

  constructor(endpoint: string) {
    this.api = new WikiApi(endpoint);
    this.parser = new XMLParser();
  }

  private async extractPageMetadata(title: string): Promise<PageInfo> {
    const response = await this.api.getPageMetadata(title);
    const pages = Object.values(response.query.pages ?? {});
    if (pages.length > 1) {
      console.debug("Found multiple pages with the same title", title, JSON.stringify(pages, null, 2));
      throw new Error(`Found multiple pages with the same title: "${title}"`);
    }
    if (pages.length < 1 || !pages[0]) {
      console.debug("Found no pages with the given title", title, JSON.stringify(pages, null, 2));
      throw new Error(`Found no pages with the given title: "${title}"`);
    }

    return pages[0];
  }

  private async extractEventMetadata(id: number): Promise<{ [key: string]: string }> {
    const response = await this.api.parsePage(id, "parsetree", {});
    try {
      const content = response.parse.parsetree["*"];
      const ast = this.parser.parse(content);
      const parameters = ast.root.template.find((it: any) => it.title === "Event");
      return Object.fromEntries(parameters.part.map((it: any) => [it.name, it.value]));
    } catch (e) {
      console.debug("Error extracting event metadata", id, JSON.stringify(response, null, 2));
      throw new Error(`Could not extract event metadata: ${e}`);
    }
  }

  private extractPresenters(description: string): string[] {
    const tree = parseDocument(description);
    const nodes = findAll((el) => {
      if (el.tagName !== "a") {
        return false;
      }
      const href = getAttributeValue(el, "href");
      if (!href) {
        return false;
      }
      return href.startsWith("/User:");
    }, tree.children);
    return nodes.map(el => textContent(el));
  }

  private async extractTalkMetadata(id: number, section: SectionResponse): Promise<TalkMetadata> {
    const response = await this.api.parsePage(id, "text", { section: section.index });
    try {
      const html = response.parse.text["*"];
      const content = sanitizeHtml(html, {
        exclusiveFilter: (el: IFrame) => ["h1", "h2"].includes(el.tag),
      });
      const presenters = this.extractPresenters(html);

      return {
        id: section.anchor,
        number: section.index,
        title: section.line,
        presenters,
        content,
      }
    } catch (e) {
        console.debug("Error extracting talk metadata", id, section.index, JSON.stringify(response, null, 2));
      throw new Error(`Could not extract talk ${section.index} ${section.anchor}: ${e}`);
    }
  }

  private async extractTalks(id: number): Promise<TalkMetadata[]> {
    const response = await this.api.parsePage(id, "sections", {});
    console.log(response);
    try {
      const sections = response.parse.sections;
      return await Promise.all(sections.map(section => this.extractTalkMetadata(id, section)));
    } catch (e) {
      console.debug("Error extracting talks", id, JSON.stringify(response, null, 2));
      throw new Error(`Could not extract talks: ${e}`);
    }
  }

  private parseHosts(host: string): string[] {
    return host?.split(",")
      ?.map(it => it.trim().toLowerCase())
      ?.filter(it => it !== "fixme")
      ?.filter(it => it !== "")
      ?? [];
  }

  async extractEvent(title: string): Promise<Metadata | null> {
    try {
      const info = await this.extractPageMetadata(title);
      if (!info.pageid) {
        return null;
      }

      const [metadata, sections] = await Promise.all([
        this.extractEventMetadata(info.pageid),
        this.extractTalks(info.pageid),
      ]);

      return {
        event: {
          href: info.canonicalurl,
          title: metadata.Title.trim(),
          date: metadata.Date.trim(),
          start: metadata.Start.trim(),
          hosts: this.parseHosts(metadata.Host),
        },
        talks: sections,
      };
    } catch (e) {
      throw new Error(`Could not extract ${title}: ${e}`);
    }
  }
}
