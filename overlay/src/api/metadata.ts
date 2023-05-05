import { TalkMetadata } from "./talkMetadata";
import { EventMetadata } from "./eventMetadata";

export interface Metadata {
  event: EventMetadata;
  talks: TalkMetadata[];
}