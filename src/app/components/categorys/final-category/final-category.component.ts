import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RoundInterface } from "../../../services/round";
import { Category, QuestionType } from "../../../../Loader";
import { ActivatedRoute, Router } from "@angular/router";
import { MemoryService } from "../../../services/memory.service";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { HueLightService } from "../../../services/hue-light.service";
import { ScoreboardService } from "../../../services/scoreboard.service";
import { ColorFader, randomNumber, shuffleArray, Style, styledLogger } from "../../../../utils";
import { inputToColor } from "../../../../models";
import gsap from "gsap";
import { NgStyle } from "@angular/common";
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";

@Component({
    selector: 'app-final-category',
    imports: [
        NgStyle
    ],
    templateUrl: './final-category.component.html',
    standalone: true,
    styleUrl: './final-category.component.css'
})
export class FinalCategoryComponent {
    currentRound: RoundInterface;
    rounds: { name: string, index: number, primary: string, secondary: string, background: string, iconPath: string }[] = [];
    music: HTMLAudioElement = new Audio();
    bgc: string;
    selectedCategory: Category = {name: "", questionType: QuestionType.multipleChoice};

    roundIconPath = "";
    private stopBuzzCycle = false;
    private stopLightCycle = false;

    constructor(private router: Router, public memory: MemoryService, private buzz: BuzzDeviceService, private route: ActivatedRoute, private hue: HueLightService, private scoreboard: ScoreboardService) {
        this.bgc = '#' + route.snapshot.paramMap.get('bgc')!;
        this.currentRound = memory.rounds[memory.roundNumber];
        this.roundIconPath = this.currentRound.iconPath;
        this.setUpWithDelay();
        this.memory.category = null;
        for (let i = 0; i < memory.rounds.length; i++) {
            this.rounds.push({
                name: memory.rounds[i].name,
                index: i,
                primary: memory.rounds[i].primary,
                secondary: memory.rounds[i].secondary,
                background: memory.rounds[i].background,
                iconPath: memory.rounds[i].iconPath,
            })
        }
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'i') this.memory.print();
    }

    ngOnDestroy(): void {
        this.music.pause();
        this.buzz.removeAllListeners();
        this.memory.scoreboardKill.next();
    }

    private async setUpWithDelay() {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.introduceRound();

        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                active: false,
                square: undefined
            }
        }), false])
        this.buzz.setLeds(new Array(4).fill(false));
    }


    private async introduceRound() {
        // gsap.to('.round-container', {y: -250, rotation: 180})
        // gsap.to('#round-text', {x: -2000})

        styledLogger(this.currentRound.name, Style.speak)

        this.music.src = "/music/esc/finalescoreboard.mp3";
        this.music.play();
        await new Promise(resolve => setTimeout(resolve, 1725));
        this.beginn();
//start
        let o = 0;
        gsap.set('#round-container-' + o, {x: randomNumber(-600,600), y: randomNumber(-300,300), rotation: 270, scale: 1, autoAlpha: 0})
        for (let i = 0; i < 16200; i += (16200 / (this.rounds.length-2))) { /*TODO FIGURE OUT BETTER WAY FOR THIS*/
            gsap.to('#round-container-' + o, {rotation: 0, scale: 0.6, autoAlpha: 1})
            new ColorFader().fadeColor(this.bgc, this.rounds[o].background, 500, color => this.bgc = color);
            this.hue.setColor(HueLightService.secondary, this.rounds[o].secondary, 500)
            this.hue.setColor(HueLightService.primary, this.rounds[o].primary, 500)
            o++;
            await new Promise(resolve => setTimeout(resolve, 16200 / (this.rounds.length-2)));
            if (o < this.rounds.length-2) {
                gsap.to('#round-container-' + (o-1), {scale: 0.5, autoAlpha: 0.8, filter: 'blur(100px)'})
                gsap.set('#round-container-' + o, {x: randomNumber(-600,600), y: randomNumber(-300,300), rotation: 270, scale: 1, autoAlpha: 0})
                if (o >= 3) {
                    // gsap.to('#round-container-' + (o-3), {scale: 0.1, autoAlpha: 0})
                }
            }
        }
        // await new Promise(resolve => setTimeout(resolve, 16274));
        //out
        for (let i = 0; i < this.rounds.length-1; i++) {
            gsap.to('#round-container-' + i, {/*x: 0, y: 0, */duration: 2, autoAlpha: 0, scale: 2, filter: 'blur(10000px)'})
        }
        new ColorFader().fadeColor(this.bgc, '#000000', 2000, color => this.bgc = color);
        this.hue.turnOff(HueLightService.primary.concat(HueLightService.secondary), 2000)
        // gsap.set('#headline', {scale: 0.1})
        await new Promise(resolve => setTimeout(resolve, 750));
        gsap.to('#headline', {duration: 1, autoAlpha: 0.5, scale: 1, ease: "power2.in"})

    }

    private async beginn() {
        await new Promise(resolve => setTimeout(resolve, 19298))
        gsap.set('#round-container-' + (this.rounds.length-1), {scale: 0.2, autoAlpha: 0, borderRadius: '0px', borderColor: '#FFF', borderStyle: 'solid', borderWidth: '10px'})
        //1

        gsap.to('#round-container-' + (this.rounds.length-1), {scale: 1, autoAlpha: 1, borderRadius: 0.1})
        await new Promise(resolve => setTimeout(resolve, 1118));
        gsap.to('#headline', {autoAlpha: 0, duration: 3, filter: 'blur(100px)'})
        gsap.to('#round-container-' + (this.rounds.length-1), {autoAlpha: 0, duration: 3, filter: 'blur(100px)'})
//2
        await new Promise(resolve => setTimeout(resolve, 3128));
        gsap.set('#round-container-' + (this.rounds.length-1), {autoAlpha: 0, scale: 0.1, filter: 'blur(0px)'})
//3
        gsap.to('#round-container-' + (this.rounds.length-1), {autoAlpha: 1, scale: 1, ease: "bounce.out"})
        await new Promise(resolve => setTimeout(resolve, 985));
//4
        gsap.to('#round-container-' + (this.rounds.length-1), {autoAlpha: 0.8, scale: 0.6, duration: 2, filter: 'blur(10px)'})
        await new Promise(resolve => setTimeout(resolve, 2028));
        gsap.to('#round-container-' + (this.rounds.length-1), {autoAlpha: 1, scale: 1.2, duration: 0.2, filter: 'blur(0px)'})
//5
        await new Promise(resolve => setTimeout(resolve, 900));
        gsap.to('#round-container-' + (this.rounds.length-1), {rotation: 3600, duration: 3, ease: 'power1.in'})
        await new Promise(resolve => setTimeout(resolve, 200));
        this.hue.setColor(HueLightService.primary, this.rounds[this.rounds.length-1].primary,1500, 254);
        this.hue.setColor(HueLightService.secondary, this.rounds[this.rounds.length-1].secondary,1500, 254);
        new ColorFader().fadeColor(this.bgc, this.rounds[this.rounds.length-1].background, 1500, color => this.bgc = color);

        await new Promise(resolve => setTimeout(resolve, 576));
        gsap.to('#round-container-' + (this.rounds.length-1), {autoAlpha: 0, scale: 0.1, duration: 2, filter: 'blur(100px)'})
//end

        //TODO ROUTE AWAY
    }

}
