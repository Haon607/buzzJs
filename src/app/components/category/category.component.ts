import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MemoryService } from "../../services/memory.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Category, CategoryLoader, QuestionType } from "../../../Loader";
import { ButtonState, BuzzDeviceService } from "../../services/buzz-device.service";
import { NgStyle } from "@angular/common";
import { HueLightService } from "../../services/hue-light.service";
import { ColorFader, MusicFader, randomNumber, shuffleArray, Style, styledLogger } from "../../../utils";
import gsap from 'gsap';
import { ScoreboardPlayer, ScoreboardService } from "../../services/scoreboard.service";
import { ScoreboardComponent } from "../scoreboard/scoreboard.component";
import { inputToColor } from "../../../models";
import { RoundInterface } from "../../services/round";

@Component({
    selector: 'app-category',
    imports: [
        NgStyle,
        ScoreboardComponent
    ],
    templateUrl: './category.component.html',
    standalone: true,
    styleUrl: './category.component.css'
})
export class CategoryComponent implements OnDestroy {
    displayHeadline = "";
    round: RoundInterface;
    rounds: { name: string, index: number, color: string, primary: string, secondary: string }[] = [];
    activateRound = false;
    categories: Category[] = [];
    music: HTMLAudioElement = new Audio("/music/buzz/bqw-choose_category.mp3");
    bgc: string;
    controllingPlayerIndex = NaN;
    selectedCategory: Category = {name: "", questionType: QuestionType.multipleChoice};


    @ViewChild("headline", {static: true}) headline!: ElementRef;
    roundIconPath = "";
    private stopBuzzCycle = false;
    private stopLightCycle = false;

    constructor(private router: Router, public memory: MemoryService, private buzz: BuzzDeviceService, private route: ActivatedRoute, private hue: HueLightService, private scoreboard: ScoreboardService) {
        this.bgc = '#' + route.snapshot.paramMap.get('bgc')!;
        new MusicFader().fadeOut(memory.crossMusic, 1000)
        if (this.bgc !== '#000000') this.memory.roundNumber++;
        if ((this.rounds.length - this.memory.roundNumber) % 5 === 0 && this.memory.roundNumber > 0) {
            // Abort select Category, play Perks ONCE

        }
        this.round = memory.rounds[memory.roundNumber];
        this.roundIconPath = this.round.iconPath;
        for (let i = 0; i < memory.rounds.length; i++) {
            this.rounds.push({
                name: memory.rounds[i].name,
                index: i,
                color: memory.rounds[i].background,
                primary: memory.rounds[i].primary,
                secondary: memory.rounds[i].secondary,
            })
        }
        buzz.onPress(buttonState => this.onPress(buttonState));
        this.setUpWithDelay();
        this.memory.category = null;

        if (this.round.category) {
            this.categories = CategoryLoader.loadCategories(this.round.questionType);
            this.displayHeadline = "Kategoriewahl";
            styledLogger(this.displayHeadline, Style.speak)
            styledLogger("Zur Auswahl:\n" + this.categories.map(cat => cat.name).slice(0, 4).join('\n'), Style.speak)
            styledLogger("Wähle jemanden zum Kategorie auswählen mit 1-4", Style.requiresInput)
            this.animateOnLoad();
            this.fadeToPageColor(2500, this.round.questionType === QuestionType.music ? '#800080' : '#000080');
            this.music.play()
        }
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === "1" || event.key === "2" || event.key === "3" || event.key === "4") this.switchControlTo(Number(event.key) - 1);

        if (this.buzz.emulate(event.key)) this.onPress(this.buzz.emulate(event.key)!);

        if (event.key === 'i') this.memory.print();

        if (this.memory.category && event.key === " ") this.introduceRound()
    }

    ngOnDestroy(): void {
        this.music.pause();
        this.buzz.removeAllListeners();
        this.memory.scoreboardKill.next();
    }

    private async onPress(input: ButtonState) {
        if (input.controller === this.controllingPlayerIndex && !this.selectedCategory.name) {
            this.buzz.setLeds(new Array(4).fill(false));
            if (input.button === 0) input.button = randomNumber(1, 4);
            this.selectedCategory = this.categories[input.button - 1];
            styledLogger("Kategorie gewählt: " + this.selectedCategory.name, Style.speak)
            this.music.src = "/music/buzz/BTV-ChooseEnd.mp3";
            this.music.play();
            this.hue.setColor(HueLightService.primary, '#505050', 1000);
            const color = inputToColor(input.button)!
            await new Promise(resolve => setTimeout(resolve, 1150));
            if (input.button === 1) gsap.to('#blue', {scale: 2, y: 100, x: 480}); else gsap.to('#blue', {opacity: 0.5, scale: 0.2, x: -400});
            if (input.button === 2) gsap.to('#orange', {scale: 2, y: 100, x: -480}); else gsap.to('#orange', {opacity: 0.5, scale: 0.2, x: 400});
            if (input.button === 3) gsap.to('#green', {scale: 2, y: -100, x: 480}); else gsap.to('#green', {opacity: 0.5, scale: 0.2, x: -400});
            if (input.button === 4) gsap.to('#yellow', {scale: 2, y: -100, x: -480}); else gsap.to('#yellow', {opacity: 0.5, scale: 0.2, x: 400});
            this.hue.setColor(HueLightService.secondary, color, 0, 254)
            this.memory.category = this.selectedCategory;
            styledLogger("Nächste Runde: " + this.round.name + "\n" + (this.memory.roundNumber + 1) + "/" + this.rounds.length, Style.information)
            styledLogger("Space zum starten der Runden einleitung", Style.requiresInput)
        }
    }

    private fadeToPageColor(time: number, pageColor: string) {
        new ColorFader().fadeColor(this.bgc, pageColor, time, color => this.bgc = color);
        this.hue.setColor(HueLightService.primary, pageColor, time, 254)
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
        await new Promise(resolve => setTimeout(resolve, 1250));
        gsap.to('#scoreboard', {x: 75, ease: 'bounce'})
    }

    private switchControlTo(playerIndex: number) {
        styledLogger("Kontrolle wurde gewechselt zu: " + this.memory.players.find(player => player.controllerId === playerIndex)?.name, Style.information)
        const states: boolean[] = new Array(4).fill(false);
        states[playerIndex] = true;
        this.buzz.setLeds(states);
        this.controllingPlayerIndex = playerIndex;
        this.hue.setColor(HueLightService.secondary, '#FFFFFF')
        this.hue.turnOff(HueLightService.secondary, 2000)

        const sbP: ScoreboardPlayer[] = [];
        for (const player of this.memory.players) {
            sbP.push(
                {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: undefined,
                    perks: player.perks,
                    active: player.controllerId === playerIndex,
                }
            )
        }
        this.scoreboard.playerSubject.next([sbP, false])
    }

    private async setUpWithDelay() {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!this.round.category) {
            this.introduceRound();
            return
        }
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                active: false,
                perks: player.perks,
                square: undefined
            }
        }), false])
        this.hue.turnOff(HueLightService.secondary, 1000);
        this.buzz.setLeds(new Array(4).fill(false));
        gsap.set('#scoreboard', {x: 600, y: -100, scale: 0.7})
    }

    private async introduceRound() {
        gsap.to(this.headline.nativeElement, {y: -250, opacity: 0})
        gsap.to('#blue', {y: 250, opacity: 0});
        gsap.to('#orange', {y: 250, opacity: 0})
        gsap.to('#green', {y: 250, opacity: 0})
        gsap.to('#yellow', {y: 250, opacity: 0})
        gsap.to('#scoreboard', {x: 600, opacity: 0})

        gsap.to('#round-numbers-container', {y: 100})
        gsap.to('#round-container', {y: -250, rotation: 180})
        gsap.to('#round-text', {x: -2000})
        gsap.to('#selected-category-container', {x: 250})

        styledLogger(this.round.name + " | " + this.selectedCategory.name, Style.speak)

        await new Promise(resolve => setTimeout(resolve, 1000));
        gsap.to('#round-text', {opacity: 1})
        gsap.to('#round-numbers-container', {y: 0, opacity: 1})
        this.music.src = "/music/buzz/bqw-next_game_is.mp3";
        this.music.play();
        await new Promise(resolve => setTimeout(resolve, 686));
//1
        this.hue.setColor(HueLightService.primary, '#FFFFFF', 0);
        this.hue.setColor(HueLightService.secondary, '#FFFFFF', 0);
        this.activateRound = true
        this.startBuzzCycle();
        this.startLightCycle();
        await new Promise(resolve => setTimeout(resolve, 902));
        gsap.to('#round-container', {y: 0, opacity: 1, rotation: 0})
        new ColorFader().fadeColor(this.bgc, this.round.background, 1500, color => this.bgc = color);
//2
        await new Promise(resolve => setTimeout(resolve, 1701));
        gsap.to('#round-text', {x: 0, ease: "bounce.out"})

//3
        await new Promise(resolve => setTimeout(resolve, 907));
        if (this.round.category) {
            gsap.to('#round-numbers-container', {y: 100, opacity: 0});
            gsap.to('#round-container', {y: -100, x: -150, rotation: -370})
            gsap.to('#selected-category-container', {x: 0, opacity: 1, ease: "bounce.out"})
        } else {
            gsap.to('#round-container', {rotation: 360, y: -100})
        }
//4
        await new Promise(resolve => setTimeout(resolve, 1735));
        this.stopLightCycle = true;
        gsap.to('#round-text', {x: -2000, opacity: 0, rotation: -180})
//5
        await new Promise(resolve => setTimeout(resolve, 324));
        gsap.to('#selected-category-container', {x: 2000, opacity: 0, rotation: -180})
        if (!this.round.category) gsap.to('#round-numbers-container', {y: 500, ease: 'back.out'});

//6
        await new Promise(resolve => setTimeout(resolve, 337));
        gsap.to('#round-container', {y: -2500, opacity: 0, rotation: -180});

        this.stopBuzzCycle = true;
//7
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.router.navigateByUrl("/round" + this.round.path)
    }

    private async startBuzzCycle() {
        const states = new Array(4).fill(false);
        for (let i = 0; i < 8; i++) {
            states[i % 4] = i - 4 >= 0;
            this.buzz.setLeds(states);
            await new Promise((resolve) => setTimeout(resolve, 100));
            if (this.stopBuzzCycle) break;
            if (i === 7) i = -1;
        }
        this.buzz.setLeds(new Array(4).fill(false));
    }

    private async startLightCycle() {
        const lights: number[] = shuffleArray(HueLightService.primary.concat(HueLightService.secondary));
        for (let i = 0; i < lights.length * 2 && !this.stopLightCycle; i++) {
            const color = (i - lights.length >= 0) ? this.round.primary : this.round.secondary;
            this.hue.setColor([lights[i % lights.length]], color, 250)
            await new Promise((resolve) => setTimeout(resolve, 400 / lights.length));
            if (this.stopLightCycle) break;
            if (i === (lights.length * 2) - 1) i = -1;
        }
        await new Promise(resolve => setTimeout(resolve, 500))
        this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254);
        this.hue.setColor(HueLightService.primary, this.round.primary, 1000, 254);
    }
}
