import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgStyle } from "@angular/common";
import { MusicFader } from "../../../../utils";

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
    @Input() duration = 100; // Default duration in seconds
    @Input() size = 200; // Default size in pixels
    @Input() showTime = false;
    @Input() makeSound = true;
    @Output() timerExpired = new EventEmitter<void>();

    remainingTime = NaN;
    progress = NaN;
    radius = NaN;
    circumference = NaN;

    music: HTMLAudioElement = new Audio('music/buzz/BTV-BL_ATA_Clock.mp3')
    private interval = NaN;

    ngOnInit(): void {
        this.radius = this.size / 2 - 10; // Padding for the stroke width
        this.circumference = 2 * Math.PI * this.radius;
        this.resetTimer();
    }

    startTimer(roundMusic: HTMLAudioElement | null = null): void {
        const totalProgress = this.circumference;
        const intervalTime = 100; // Interval in milliseconds
        const decrement = totalProgress / (this.duration * (1000 / intervalTime));
        if (this.remainingTime < 12 && this.makeSound) {
            this.music.currentTime--;
            this.music.play()
            if (roundMusic) roundMusic.volume = 0.3;
        }
        this.interval = setInterval(() => {
            this.remainingTime -= intervalTime / 1000;
            this.progress += decrement;
            if (this.makeSound && this.remainingTime.toFixed(1) === "12.0") {
                this.music.play()
                if (roundMusic) roundMusic.volume = 0.7;
            }
            if (this.remainingTime <= 0) {
                clearInterval(this.interval);
                this.progress = totalProgress;
                this.remainingTime = 0;
                this.timerExpired.emit();
            }
        }, intervalTime);
    }

    stopTimer(roundMusic: HTMLAudioElement | null = null): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = NaN;
            new MusicFader().fadeOut(this.music, 1000)
            if (roundMusic) roundMusic.volume = 1;
        }
    }

    resetTimer(): void {
        this.stopTimer();
        this.music.currentTime = 0;
        this.remainingTime = this.duration;
        this.progress = 0;
    }

    ngOnDestroy(): void {
        this.stopTimer();
    }
}