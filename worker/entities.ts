import { IndexedEntity } from "./core-utils";
import type { Ticket, Expert } from "@shared/types";
import { MOCK_TICKETS, MOCK_EXPERTS } from "@shared/mock-data";
// EXPERT ENTITY
export class ExpertEntity extends IndexedEntity<Expert> {
  static readonly entityName = "expert";
  static readonly indexName = "experts";
  static readonly initialState: Expert = { id: "", name: "", avatarUrl: "" };
  static seedData = MOCK_EXPERTS;
}
// TICKET ENTITY
export class TicketEntity extends IndexedEntity<Ticket> {
  static readonly entityName = "ticket";
  static readonly indexName = "tickets";
  static readonly initialState: Ticket = {
    id: "",
    viberQuery: "",
    platform: "",
    issueType: "",
    status: "Open" as any, // Cast because enum isn't available here directly
    expertId: "",
    createdAt: "",
    satisfactionScore: 0,
  };
  static seedData = MOCK_TICKETS;
}