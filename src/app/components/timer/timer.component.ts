import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgStyle } from "@angular/common";

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    standalone: true,
    imports: [
        NgStyle
    ],
    styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit, OnDestroy {
    @Input() duration: number = 100; // Default duration in seconds
    @Input() size: number = 200; // Default size in pixels
    @Input() showTime: boolean = true;
    @Output() timerExpired = new EventEmitter<void>();

    remainingTime: number = NaN;
    progress: number = NaN;
    radius: number = NaN;
    circumference: number = NaN;

    private interval: any;

    ngOnInit(): void {
        this.radius = this.size / 2 - 10; // Padding for the stroke width
        this.circumference = 2 * Math.PI * this.radius;
        this.resetTimer();
    }

    startTimer(): void {
        const totalProgress = this.circumference;
        const intervalTime = 100; // Interval in milliseconds
        const decrement = totalProgress / (this.duration * (1000 / intervalTime));

        this.interval = setInterval(() => {
            this.remainingTime -= intervalTime / 1000;
            this.progress += decrement;
            if (this.remainingTime <= 0) {
                clearInterval(this.interval);
                this.remainingTime = 0;
                this.timerExpired.emit();
            }
        }, intervalTime);
    }

    stopTimer(): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    resetTimer(): void {
        this.stopTimer();
        this.remainingTime = this.duration;
        this.progress = 0;
    }

    ngOnDestroy(): void {
        this.stopTimer();
    }
}