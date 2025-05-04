import { Component, OnInit } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { Subject } from "rxjs";

@Component({
    selector: 'app-canvas-mirror',
    templateUrl: './canvas-mirror.component.html',
    styleUrl: './canvas-mirror.component.css',
    imports: [
        NgOptimizedImage
    ],
    standalone: true
})
export class CanvasMirrorComponent implements OnInit {
    imageSrc = '';
    input: Subject<string> = new Subject<string>();
    done: Subject<void> = new Subject<void>();
    private ws!: WebSocket;
    lastUpdate: number | null = null;

    ngOnInit(): void {
        this.ws = new WebSocket('ws://192.168.0.6:3000');

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if ((data.event === 'drawingUpdate' || data.event === 'drawingDone') && data.data) {
                this.lastUpdate = Date.now();
                this.imageSrc = data.data;
                if (data.event === 'drawingDone') {
                    this.done.next();
                }
            }
            if (data.event === 'optionSelected' && data.data) {
                this.input.next(data.data);
            }
        };
    }

    sendOptions(options: string[]) {
        this.ws.send(JSON.stringify({"event": "showOptions", "data": options}));
    }

    sendMessage(text: string) {
        this.ws.send(JSON.stringify({"event": "displayDrawingText", "data": text}));
    }

    setColor(color: string) {
        this.ws.send(JSON.stringify({"event": "changeCanvasBorderColor", "data": color}));
    }

    sendClear() {
        this.ws.send(JSON.stringify({"event": "clearCanvas"}));
    }

    static baseBoarderColor = '#2CADFA'
}
