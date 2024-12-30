import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MemoryService, RoundInterface } from "../../services/memory.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Category, CategoryLoader } from "../../../Loader";
import { ButtonState, BuzzDeviceService } from "../../services/buzz-device.service";
import { NgStyle } from "@angular/common";
import { HueLightService } from "../../services/hue-light.service";
import { ColorFader } from "../../../utils";
import gsap from 'gsap';

@Component({
    selector: 'app-category',
    imports: [
        NgStyle
    ],
    templateUrl: './category.component.html',
    standalone: true,
    styleUrl: './category.component.css'
})
export class CategoryComponent implements OnDestroy {
    displayHeadline: string = "";
    round: RoundInterface;
    categories: Category[] = [];
    music: HTMLAudioElement = new Audio("/music/buzz/bqw-choose_category.mp3");
    bgc: string;
    pageColor: string = '#000080'
    controllingPlayerIndex: number = NaN;

    @ViewChild("headline", {static: true}) headline!: ElementRef;

    constructor(private router: Router, private memory: MemoryService, private buzz: BuzzDeviceService, private route: ActivatedRoute, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = "#" + route.snapshot.paramMap.get('bgc')!;
        buzz.onPress(buttonState => this.onPress(buttonState))

        if (this.round.category) {
            this.categories = CategoryLoader.loadCategories(this.round.questionType);
            this.displayHeadline = "Kategoriewahl";

            this.animateOnLoad();
            this.fadeToPageColor(2500);
            this.music.play()
        }
    }

    private async onPress(input: ButtonState) {
        if (input.controller === this.controllingPlayerIndex) {
            //TODO
        }
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === "1" || event.key === "2" || event.key === "3" || event.key === "4") this.switchControlTo(Number(event.key)-1);

        if (event.key === '!') this.onPress({controller: 0, button: 0})
        if (event.key === '"') this.onPress({controller: 0, button: 1})
        if (event.key === '§') this.onPress({controller: 0, button: 2})
        if (event.key === '$') this.onPress({controller: 0, button: 3})
        if (event.key === '%') this.onPress({controller: 0, button: 4})

        if (event.key === 'Q') this.onPress({controller: 1, button: 0})
        if (event.key === 'W') this.onPress({controller: 1, button: 1})
        if (event.key === 'E') this.onPress({controller: 1, button: 2})
        if (event.key === 'R') this.onPress({controller: 1, button: 3})
        if (event.key === 'T') this.onPress({controller: 1, button: 4})

        if (event.key === 'A') this.onPress({controller: 2, button: 0})
        if (event.key === 'S') this.onPress({controller: 2, button: 1})
        if (event.key === 'D') this.onPress({controller: 2, button: 2})
        if (event.key === 'F') this.onPress({controller: 2, button: 3})
        if (event.key === 'G') this.onPress({controller: 2, button: 4})

        if (event.key === 'Y') this.onPress({controller: 3, button: 0})
        if (event.key === 'X') this.onPress({controller: 3, button: 1})
        if (event.key === 'C') this.onPress({controller: 3, button: 2})
        if (event.key === 'V') this.onPress({controller: 3, button: 3})
        if (event.key === 'B') this.onPress({controller: 3, button: 4})

        if (event.key === 'i') this.memory.print();
    }

    ngOnDestroy(): void {
        this.music.pause()
    }

    private fadeToPageColor(time: number) {
        new ColorFader().fadeColor(this.bgc, this.pageColor, time, color => this.bgc = color);
        this.hue.setColor(1, ColorFader.hexToRgba(this.pageColor)[0], ColorFader.hexToRgba(this.pageColor)[1], ColorFader.hexToRgba(this.pageColor)[2], time).subscribe(() => {
        })
    }

    private async animateOnLoad() {
        await new Promise(resolve => setTimeout(resolve, 500));
        gsap.to(this.headline.nativeElement, {y: -100, duration: 0})
        gsap.to('#blue', {duration: 0, x: -100, y: -50, scale: 0.8})
        gsap.to('#orange', {duration: 0, x: 100, y: -50, scale: 0.8})
        gsap.to('#green', {duration: 0, x: -100, y: 50, scale: 0.8})
        gsap.to('#yellow', {duration: 0, x: 100, y: 50, scale: 0.8})

        gsap.to(this.headline.nativeElement, {y: 250, opacity: 1, duration: 1.5, ease: "power2"})
        await new Promise((resolve) => setTimeout(resolve, 1500));
        gsap.to(this.headline.nativeElement, {y: 0, scale: 0.8, duration: 2, ease: "power2"})
        await new Promise((resolve) => setTimeout(resolve, 100));
        gsap.to('#blue', {opacity: 1, x: 0, ease: "power1", y: 0, duration: 1.2, scale: 1})
        await new Promise((resolve) => setTimeout(resolve, 100));
        gsap.to('#orange', {opacity: 1, x: 0, ease: "power1", y: 0, duration: 1.2, scale: 1})
        await new Promise((resolve) => setTimeout(resolve, 100));
        gsap.to('#green', {opacity: 1, x: 0, ease: "power1", y: 0, duration: 1.2, scale: 1})
        await new Promise((resolve) => setTimeout(resolve, 100));
        gsap.to('#yellow', {opacity: 1, x: 0, ease: "power1", y: 0, duration: 1.2, scale: 1})
    }

    private switchControlTo(playerIndex: number) {
        let states: boolean[] = new Array(4).fill(false);
        states[playerIndex] = true;
        this.buzz.setLeds(states);
        this.controllingPlayerIndex = playerIndex;
    }
}
