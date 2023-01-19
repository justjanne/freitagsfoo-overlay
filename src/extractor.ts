import { XMLParser } from 'fast-xml-parser';
import sanitizeHtml from 'sanitize-html';
import { IFrame } from "sanitize-html";
import { parseDocument } from "htmlparser2";
import { findAll, getAttributeValue, textContent } from "domutils";

import { SectionResponse, WikiApi } from "./wikiApi.js";

export interface TalkMetadata {
  id: string;
  number: string;
  title: string;
  presenters: string[],
  content: string;
}

export interface EventMetadata {
  title: string,
  date: string,
  start: string,
  host: string,
  talks: TalkMetadata[],
}

type XMLElement = string | XMLElement[] | { [key: string]: XMLElement }

export class EventExtractor {
  private api: WikiApi
  private parser: XMLParser

  constructor(endpoint: string) {
    this.api = new WikiApi(endpoint);
    this.parser = new XMLParser();
  }

  private async extractEventMetadata(id: string): Promise<{ [key: string]: string }> {
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

  private async extractTalkMetadata(id: string, section: SectionResponse): Promise<TalkMetadata> {
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

  private async extractTalks(id: string): Promise<TalkMetadata[]> {
    const response = await this.api.parsePage(id, "sections", {});
    try {
      const sections = response.parse.sections;
      return await Promise.all(sections.map(section => this.extractTalkMetadata(id, section)));
    } catch (e) {
      console.debug("Error extracting talks", id, JSON.stringify(response, null, 2));
      throw new Error(`Could not extract talks: ${e}`);
    }
  }

  async extractEvent(id: string): Promise<EventMetadata> {
    try {
      const [metadata, sections] = await Promise.all([
        this.extractEventMetadata(id),
        this.extractTalks(id)
      ])

      return {
        title: metadata.Title,
        date: metadata.Date,
        start: metadata.Start,
        host: metadata.Host,
        talks: sections,
      };
    } catch (e) {
      throw new Error(`Could not extract ${id}: ${e}`);
    }
  }
}
