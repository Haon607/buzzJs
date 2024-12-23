import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ButtonState {
  controller: number;
  button: number;
}

@Injectable({
  providedIn: 'root',
})
export class BuzzDeviceService {
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
    return { controller: controller + 1, button: index - controller * 5 };
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
}
