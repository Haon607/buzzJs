import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ButtonState {
  controller: number;
  button: number;
}

@Injectable({
  providedIn: 'root',
})
export class BuzzDeviceService implements OnDestroy {
  private readonly EVENTS = {
    PRESS: 'press',
    RELEASE: 'release',
    ERROR: 'error',
    CHANGE: 'change',
  };

  private previousStates: boolean[] = new Array(20).fill(false);
  private listeners: { [key: string]: Array<(payload: any) => void> } = {
    press: [],
    release: [],
    change: [],
    error: [],
  };

  private ws: WebSocket;
  private statesSubject = new BehaviorSubject<boolean[]>(this.previousStates);

  constructor() {
    this.ws = new WebSocket('ws://localhost:3000');

    this.connectToWebSocket();
  }

  private connectToWebSocket(): void {
    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.event === 'buttonChange') {
        this.handleDeviceData(message.states);
      } else if (message.event === 'error') {
        this.handleDeviceError(message.error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.triggerEvent(this.EVENTS.ERROR, 'WebSocket error');
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  private handleDeviceData(states: boolean[]): void {
    states.forEach((state, index) => {
      const previousState = this.previousStates[index];
      if (state !== previousState) {
        const eventType = state ? this.EVENTS.PRESS : this.EVENTS.RELEASE;
        this.triggerEvent(eventType, this.indexToObject(index));
      }
    });

    this.triggerEvent(this.EVENTS.CHANGE, states);
    this.previousStates = states;
    this.statesSubject.next(states);
  }

  private handleDeviceError(error: any): void {
    this.triggerEvent(this.EVENTS.ERROR, error);
  }

  private triggerEvent(eventType: string, payload: any): void {
    this.listeners[eventType]?.forEach(listener => listener(payload));
  }

  private indexToObject(index: number): ButtonState {
    const controller = Math.floor(index / 5);
    return { controller: controller, button: index - controller * 5 };
  }

  public setLeds(states: boolean[]): void {
    try {
      // Send the LED control message to the WebSocket server
      this.ws.send(JSON.stringify({ event: 'setLeds', states }));
    } catch (e) {
      this.triggerEvent(this.EVENTS.ERROR, 'Error sending LED control message');
    }
  }

  public onPress(callback: (payload: ButtonState) => void): void {
    this.listeners[this.EVENTS.PRESS].push(callback);
  }

  public onRelease(callback: (payload: ButtonState) => void): void {
    this.listeners[this.EVENTS.RELEASE].push(callback);
  }

  public onChange(callback: (states: boolean[]) => void): void {
    this.listeners[this.EVENTS.CHANGE].push(callback);
  }

  public onError(callback: (error: any) => void): void {
    this.listeners[this.EVENTS.ERROR].push(callback);
  }

  public getStates() {
    return this.statesSubject.asObservable();
  }

  public removeAllListeners(eventType?: string): void {
    if (eventType) {
      // Remove all listeners for the specific event type
      this.listeners[eventType] = [];
    } else {
      // Remove all listeners for all event types
      for (const event in this.listeners) {
        this.listeners[event] = [];
      }
    }
  }

  public emulate(key: string): ButtonState | undefined {
    if (key === '!') return {controller: 0, button: 0}
    if (key === '"') return {controller: 0, button: 1}
    if (key === '§') return {controller: 0, button: 2}
    if (key === '$') return {controller: 0, button: 3}
    if (key === '%') return {controller: 0, button: 4}

    if (key === 'Q') return {controller: 1, button: 0}
    if (key === 'W') return {controller: 1, button: 1}
    if (key === 'E') return {controller: 1, button: 2}
    if (key === 'R') return {controller: 1, button: 3}
    if (key === 'T') return {controller: 1, button: 4}

    if (key === 'A') return {controller: 2, button: 0}
    if (key === 'S') return {controller: 2, button: 1}
    if (key === 'D') return {controller: 2, button: 2}
    if (key === 'F') return {controller: 2, button: 3}
    if (key === 'G') return {controller: 2, button: 4}

    if (key === 'Y') return {controller: 3, button: 0}
    if (key === 'X') return {controller: 3, button: 1}
    if (key === 'C') return {controller: 3, button: 2}
    if (key === 'V') return {controller: 3, button: 3}
    if (key === 'B') return {controller: 3, button: 4}
  }

  ngOnDestroy(): void {
    this.ws.close()
  }
}
