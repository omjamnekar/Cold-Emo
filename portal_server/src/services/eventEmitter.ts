import { IEventEmitter } from "../types/index.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("EventEmitter");

/**
 * Type-safe event emitter for domain events
 * Single source of truth for state changes
 * Allows decoupling of services (e.g., logging, notifications, webhooks)
 */
export class EventEmitter implements IEventEmitter {
  private handlers: Map<string, Set<(data: any) => void>> = new Map();

  on(event: string, handler: (data: any) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    logger.debug(`Handler registered for ${event}`);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  once(event: string, handler: (data: any) => void): void {
    const wrappedHandler = (data: any) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    this.on(event, wrappedHandler);
  }

  emit(event: string, data: any): void {
    const handlers = this.handlers.get(event);
    if (!handlers || handlers.size === 0) {
      logger.debug(`No handlers for event: ${event}`);
      return;
    }

    logger.debug(`Emitting event: ${event}`, { dataKeys: Object.keys(data) });
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        logger.error(`Error handling event ${event}`, error as Error);
      }
    });
  }

  clear(): void {
    this.handlers.clear();
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter();
