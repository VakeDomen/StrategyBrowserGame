import { update } from "../db/database.handler";
import { Event } from "../models/events/core/event";
import { Game } from "../models/game_models/game.game";
import { BinaryHeap } from "./binary.heap";

export class EventHandler {
    private static TICK = 500; // ms
    private heap: BinaryHeap<Event>;
    private game: Game;
    private stopLoop: boolean;

    constructor(game: Game) {
        this.game = game;
        this.heap = new BinaryHeap((event: Event) => event.trigger_time);
        this.stopLoop = false;
    }
    
    stop() {
        this.stopLoop = true;
    }

    async start(): Promise<void> {
        console.log(`[Game: ${this.game.id}] Starting event handler!`);
        while(!this.stopLoop) {
            const start = new Date().getTime();
            if (this.heap.size() > 0) {
                const minValue = this.heap.minValue();
                if (minValue && minValue < start) {
                    const event = this.heap.pop();
                    console.log(`[Game: ${this.game.id}] Triggering event ${event.event_type} [${event.id}]`)
                    const chainEvent = await event.trigger();
                    if (chainEvent) {
                        this.heap.push(chainEvent);
                    }
                }
            }
            const deltaTime = (new Date().getTime() - start) / 1000;
            await this.delay(Math.max(deltaTime, EventHandler.TICK - deltaTime));
        }
    }

    private async delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    push(event: Event): void {
        console.log(`[Game: ${this.game.id}] Got new event ${event.event_type} (${event.id})!`)
        this.heap.push(event);
    }
}