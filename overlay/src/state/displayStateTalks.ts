import {EventMetadata} from "../api/eventMetadata";
import {TalkMetadata} from "../api/talkMetadata";

export interface DisplayStateTalks {
  kind: "list";
  event: EventMetadata;
  talks: TalkMetadata[];
}