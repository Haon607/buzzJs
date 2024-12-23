import { Component, OnInit } from '@angular/core';
import { BuzzDeviceService } from './buzz-device.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private buzzDeviceService: BuzzDeviceService) {}

  ngOnInit(): void {
    this.buzzDeviceService.onPress(({ controller, button }) => {
      console.log(`Controller ${controller}, Button ${button} pressed.`);
    });

    this.buzzDeviceService.onRelease(({ controller, button }) => {
      console.log(`Controller ${controller}, Button ${button} released.`);
    });

    this.buzzDeviceService.onError(error => {
      console.error('Device error:', error);
    });

    this.buzzDeviceService.onChange(states => {
      console.log('Button states changed:', states);
    });
  }

  // Method to control the LEDs
  setLeds(states: boolean[]): void {
    this.buzzDeviceService.setLeds(states);
  }
}
