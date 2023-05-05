import {EventMetadata} from "../api/eventMetadata";
import {TalkMetadata} from "../api/talkMetadata";

export interface DisplayStateTalk {
  kind: "talk";
  event: EventMetadata;
  talk: TalkMetadata;
}