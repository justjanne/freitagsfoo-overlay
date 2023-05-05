import {EventMetadata} from "../api/eventMetadata";

export interface DisplayStateIntro {
  kind: "intro";
  event: EventMetadata;
}