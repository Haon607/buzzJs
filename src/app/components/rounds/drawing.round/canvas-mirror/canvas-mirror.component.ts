import { Component, OnInit } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";

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
  imageSrc: string = '';
  private ws!: WebSocket;

  ngOnInit(): void {
    this.ws = new WebSocket('ws://192.168.0.6:3000');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'drawingUpdate' && data.data) {
        this.imageSrc = data.data;
      }
    };
  }
}
