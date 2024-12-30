import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MemoryService, RoundInterface } from "../../services/memory.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Category, CategoryLoader } from "../../../Loader";
import { ButtonState, BuzzDeviceService } from "../../services/buzz-device.service";
import { NgStyle } from "@angular/common";
import { HueLightService } from "../../services/hue-light.service";
import { ColorFader, randomNumber, shuffleArray } from "../../../utils";
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
    controllingPlayerIndex: number = NaN;
    selectedCategory: Category | undefined = undefined;

    @ViewChild("headline", {static: true}) headline!: ElementRef;
    private stopBuzzCycle: boolean = false;
    private stopLightCycle: boolean = false;

    constructor(private router: Router, private memory: MemoryService, private buzz: BuzzDeviceService, private route: ActivatedRoute, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = "#" + route.snapshot.paramMap.get('bgc')!;
        buzz.onPress(buttonState => this.onPress(buttonState));
        this.setUpWithDelay();

        if (this.round.category) {
            this.categories = CategoryLoader.loadCategories(this.round.questionType);
            this.displayHeadline = "Kategoriewahl";

            this.animateOnLoad();
            this.fadeToPageColor(2500);
            this.music.play()
        }
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === "1" || event.key === "2" || event.key === "3" || event.key === "4") this.switchControlTo(Number(event.key) - 1);

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

        if (this.selectedCategory && event.key === " ") this.introduceRound()
    }

    ngOnDestroy(): void {
        this.music.pause()
    }

    private async onPress(input: ButtonState) {
        if (input.controller === this.controllingPlayerIndex && !this.selectedCategory) {
            this.buzz.setLeds(new Array(4).fill(false));
            if (input.button === 0) input.button = randomNumber(1, 4);
            this.selectedCategory = this.categories[input.button - 1];
            let color: string = "";
            this.music.src = "/music/buzz/BTV-ChooseEnd.mp3";
            this.music.play();
            this.hue.setColor(HueLightService.primary, '#505050', 1000);
            switch (input.button) {
                case 1:
                    color = '#2CADFA';
                    break;
                case 2:
                    color = '#F86613';
                    break;
                case 3:
                    color = '#11BC20';
                    break;
                case 4:
                    color = '#FFFF00';
                    break;
            }
            await new Promise(resolve => setTimeout(resolve, 1150));
            if (input.button === 1) gsap.to('#blue', {scale: 2, y: 100, x: 480}); else gsap.to('#blue', {opacity: 0.5, scale: 0.2, x: -400});
            if (input.button === 2) gsap.to('#orange', {scale: 2, y: 100, x: -480}); else gsap.to('#orange', {opacity: 0.5, scale: 0.2, x: 400});
            if (input.button === 3) gsap.to('#green', {scale: 2, y: -100, x: 480}); else gsap.to('#green', {opacity: 0.5, scale: 0.2, x: -400});
            if (input.button === 4) gsap.to('#yellow', {scale: 2, y: -100, x: -480}); else gsap.to('#yellow', {opacity: 0.5, scale: 0.2, x: 400});
            this.hue.setColor(HueLightService.secondary, color, 0, 254)
        }
    }

    private fadeToPageColor(time: number) {
        new ColorFader().fadeColor(this.bgc, '#000080', time, color => this.bgc = color);
        this.hue.setColor(HueLightService.primary, "#000080", time, 254)
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
        this.hue.setColor(HueLightService.secondary, '#FFFFFF')
        this.hue.turnOff(HueLightService.secondary, 2000)
    }

    private async setUpWithDelay() {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.hue.turnOff(HueLightService.secondary);
        this.buzz.setLeds(new Array(4).fill(false));
    }

    private async introduceRound() {
        gsap.to(this.headline.nativeElement, {y: -250, opacity: 0})
        gsap.to('#blue', {y: 250, opacity: 0});
        gsap.to('#orange', {y: 250, opacity: 0})
        gsap.to('#green', {y: 250, opacity: 0})
        gsap.to('#yellow', {y: 250, opacity: 0})
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.music.src = "/music/buzz/bqw-next_game_is.mp3";
        this.music.play();
        await new Promise(resolve => setTimeout(resolve, 686));
//1
        this.hue.setColor(HueLightService.primary, '#FFFFFF', 0);
        this.hue.setColor(HueLightService.secondary, '#FFFFFF', 0);
        this.startBuzzCycle();
        this.startLightCycle();
        await new Promise(resolve => setTimeout(resolve, 902));
//2
        await new Promise(resolve => setTimeout(resolve, 1701));
//3
        await new Promise(resolve => setTimeout(resolve, 907));
//4
        await new Promise(resolve => setTimeout(resolve, 1735));
        this.stopLightCycle = true;
        this.hue.setColor(HueLightService.primary.concat(HueLightService.secondary), '#FFFFFF', 250);
//5
        await new Promise(resolve => setTimeout(resolve, 324));
        this.hue.setColor(HueLightService.secondary, this.round.secondary, 0);
//6
        await new Promise(resolve => setTimeout(resolve, 337));
        this.hue.setColor(HueLightService.primary, this.round.primary, 0);

        this.stopBuzzCycle = true;
//7
    }

    private async startBuzzCycle() {
        let states = new Array(4).fill(false);
        for (let i = 0; i < 8; i++) {
            states[i % 4] = i - 4 >= 0;
            this.buzz.setLeds(states);
            await new Promise((resolve) => setTimeout(resolve, 50));
            if (this.stopBuzzCycle) break;
            if (i === 7) i = -1;
        }
        this.buzz.setLeds(new Array(4).fill(false));
    }

    private async startLightCycle() {
        let lights: number[] = shuffleArray(HueLightService.primary.concat(HueLightService.secondary));
        for (let i = 0; i < lights.length * 2; i++) {
            let color = (i - lights.length >= 0) ? '#FFFFFF' : (randomNumber(1, 2) === 1 ? this.round.primary : this.round.secondary);

            this.hue.setColor([lights[i % 4]], color, 250)
            await new Promise((resolve) => setTimeout(resolve, 100));
            if (this.stopLightCycle) break;
            if (i === 7) i = -1;
        }
        this.buzz.setLeds(new Array(4).fill(false));
    }
}
