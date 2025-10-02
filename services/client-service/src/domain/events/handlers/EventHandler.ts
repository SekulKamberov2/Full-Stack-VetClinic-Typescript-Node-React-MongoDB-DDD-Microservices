export interface EventHandler {
  handle(event: any): Promise<void>;
  getEventType(): string;
}