import { Component, HostListener, OnDestroy } from '@angular/core';
import { RoundInterface } from "../../../../round";
import { ActivatedRoute, Router } from "@angular/router";
import { MemoryService } from "../../../services/memory.service";
import { BuzzDeviceService } from "../../../services/buzz-device.service";
import { HueLightService } from "../../../services/hue-light.service";
import { ScoreboardService } from "../../../services/scoreboard.service";
import { ColorFader, randomNumber, shuffleArray, Style, styledLogger } from "../../../../utils";
import gsap from "gsap";
import { NgStyle } from "@angular/common";

@Component({
    selector: 'app-final-category',
    imports: [
        NgStyle
    ],
    templateUrl: './final-category.component.html',
    standalone: true,
    styleUrl: './final-category.component.css'
})
export class FinalCategoryComponent implements OnDestroy {
    currentRound: RoundInterface;
    rounds: {
        path: string, name: string, index: number, primary: string, secondary: string, background: string, iconPath: string
    }[] = [];
    music: HTMLAudioElement = new Audio();
    bgc: string;
    hlc = '#FFFFFF';
    stopLights = false;

    constructor(private router: Router, public memory: MemoryService, private buzz: BuzzDeviceService, private route: ActivatedRoute, private hue: HueLightService, private scoreboard: ScoreboardService) {
        this.bgc = '#' + route.snapshot.paramMap.get('bgc')!;
        this.currentRound = memory.rounds[memory.roundNumber];
        this.setUpWithDelay();
        this.memory.category = null;
        for (let i = 0; i < memory.rounds.length; i++) {
            this.rounds.push({
                name: memory.rounds[i].name,
                index: i,
                primary: memory.rounds[i].primary,
                secondary: memory.rounds[i].secondary,
                background: memory.rounds[i].background,
                path: memory.rounds[i].path,
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
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                active: false,
                square: undefined,
                perks: player.perks
            }
        }), false])

        this.buzz.setLeds(new Array(4).fill(false));

        this.introduceRound();
        await new Promise(resolve => setTimeout(resolve, 1725));
        await this.beginn();
        await this.roundIntro();
    }


    private async introduceRound() {
        // gsap.to('.round-container', {y: -250, rotation: 180})
        // gsap.to('#round-text', {x: -2000})

        styledLogger(this.currentRound.name, Style.speak)

        this.music.src = "/music/esc/finalecategory.mp3";
        this.music.play();
        await new Promise(resolve => setTimeout(resolve, 1725));
//start
        let o = 0;
        gsap.set('#round-container-' + o, {x: randomNumber(-600, 600), y: randomNumber(-300, 300), rotation: 270, scale: 1, autoAlpha: 0})
        for (o = 0; o < this.rounds.length - 1; o++) {
            gsap.to('#round-container-' + o, {rotation: 0, scale: 0.6, autoAlpha: 1});

            new ColorFader().fadeColor(this.bgc, this.rounds[o].background, 500, color => this.bgc = color);
            this.hue.setColor(HueLightService.secondary, this.rounds[o].secondary, 500);
            this.hue.setColor(HueLightService.primary, this.rounds[o].primary, 500);

            await new Promise(resolve => setTimeout(resolve, 16200 / (this.rounds.length - 1))); // Adjusted timing

            if (o < this.rounds.length - 2) {
                gsap.to('#round-container-' + (o), {scale: 0.5, autoAlpha: 0.8, filter: 'blur(100px)'});
                gsap.set('#round-container-' + (o + 1), {x: randomNumber(-600, 600), y: randomNumber(-300, 300), rotation: 270, scale: 1, autoAlpha: 0});

                // if (o >= 2) {
                //     gsap.to('#round-container-' + (o - 2), { scale: 0.1, autoAlpha: 0 });
                // }
            }
        }
        // await new Promise(resolve => setTimeout(resolve, 16274));
        //out
        for (let i = 0; i < this.rounds.length - 1; i++) {
            gsap.to('#round-container-' + i, {x: 0, y: 0, duration: 2, autoAlpha: 0, scale: 0.5, filter: 'blur(10000px)'})
        }
        new ColorFader().fadeColor(this.bgc, '#000000', 2000, color => this.bgc = color);
        this.hue.turnOff(HueLightService.primary.concat(HueLightService.secondary), 2000)
        await new Promise(resolve => setTimeout(resolve, 750));
    }

    private async beginn() {
        await new Promise(resolve => setTimeout(resolve, 19298))
        gsap.set('#round-container-' + (this.rounds.length - 1), {scale: 0.2, autoAlpha: 0, borderRadius: '0px', borderColor: '#FFF', borderStyle: 'solid', borderWidth: '10px'})
        //1
        this.startLights();
        gsap.to('#round-container-' + (this.rounds.length - 1), {scale: 1, autoAlpha: 1, borderRadius: 0.1})
        await new Promise(resolve => setTimeout(resolve, 1118));
        gsap.to('#round-container-' + (this.rounds.length - 1), {autoAlpha: 0, duration: 3, filter: 'blur(100px)'})
//2
        await new Promise(resolve => setTimeout(resolve, 3128));
        gsap.set('#round-container-' + (this.rounds.length - 1), {autoAlpha: 0, scale: 0.1, filter: 'blur(0px)'})
//3
        gsap.to('#round-container-' + (this.rounds.length - 1), {autoAlpha: 1, scale: 1, ease: "bounce.out"})
        await new Promise(resolve => setTimeout(resolve, 985));
//4
        gsap.to('#round-container-' + (this.rounds.length - 1), {autoAlpha: 0.5, /*scale: 0.1,*/ duration: 2, filter: 'blur(50px)'})
        await new Promise(resolve => setTimeout(resolve, 2028));
        gsap.to('#round-container-' + (this.rounds.length - 1), {autoAlpha: 1, scale: 1.2, duration: 0.2, filter: 'blur(0px)'})
//5
        await new Promise(resolve => setTimeout(resolve, 700));
        gsap.to('#round-container-' + (this.rounds.length - 1), {rotation: 3600, duration: 3, ease: 'power1.in'})
        gsap.to('#round-text', {rotation: -3600, duration: 3, ease: 'power1.in'})
        await new Promise(resolve => setTimeout(resolve, 400));


        await new Promise(resolve => setTimeout(resolve, 576));
        gsap.to('#round-container-' + (this.rounds.length - 1), {autoAlpha: 0, scale: 0.1, duration: 2, filter: 'blur(100px)'})
//end
        this.stopLights = true;

        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    private async roundIntro() {
        this.music.src = "/music/esc/finaleroundintro.mp3";
        await new Promise(resolve => setTimeout(resolve, 0));
        this.animateText()
//Start
        const all = shuffleArray(HueLightService.primary.concat(HueLightService.secondary))
        for (let i = 0; i < 15; i++) {
            this.hue.setColor([all[i % all.length]], this.rounds[i % this.rounds.length].primary, 100, 254);
            // gsap.to('#headline', {autoAlpha: 0, duration: 0.1})
            await new Promise(resolve => setTimeout(resolve, 100));
            this.hue.turnOff([all[i % all.length]], 100);
            if (i === 1) this.music.play();
        }
//Click
        this.hue.setColor(HueLightService.primary.concat(HueLightService.secondary), '#FFFFFF', 100, 254);
        gsap.set('#headline', {x: 0, y: 0, rotation: 0, autoAlpha: 1, scale: 3})
        await new Promise(resolve => setTimeout(resolve, 1508));
        gsap.to('#headline', {autoAlpha: 1, scale: 1, ease: "power1.out", duration: 0.1})
        this.hue.setColor(HueLightService.primary, this.rounds[this.rounds.length - 1].primary, 100, 254);
        this.hue.setColor(HueLightService.secondary, this.rounds[this.rounds.length - 1].secondary, 100, 254);
        new ColorFader().fadeColor(this.bgc, this.rounds[this.rounds.length - 1].background, 100, color => this.bgc = color);
//Bumm

        await new Promise(resolve => setTimeout(resolve, 500));
        gsap.to('#headline', {autoAlpha: 0, duration: 3, filter: 'blur(100px)'})
        await new Promise(resolve => setTimeout(resolve, 3000));


        this.router.navigateByUrl("/round" + this.rounds[this.rounds.length - 1].path)
    }

    private async animateText() {
        await new Promise(resolve => setTimeout(resolve, 23));
//1
        this.randText(1);
        await new Promise(resolve => setTimeout(resolve, 57));
//2
        this.randText(2);
        await new Promise(resolve => setTimeout(resolve, 58));
//3
        this.randText(3);
        await new Promise(resolve => setTimeout(resolve, 58));
//4
        this.randText(4);
        await new Promise(resolve => setTimeout(resolve, 67));
//5
        this.randText(5);
        await new Promise(resolve => setTimeout(resolve, 64));
//6
        this.randText(6);
        await new Promise(resolve => setTimeout(resolve, 58));
//7
        this.randText(7);
        await new Promise(resolve => setTimeout(resolve, 73));
//8
        this.randText(8);
        await new Promise(resolve => setTimeout(resolve, 77));
//9
        this.randText(9);
        await new Promise(resolve => setTimeout(resolve, 82));
//10
        this.randText(10);
        await new Promise(resolve => setTimeout(resolve, 91));
//11
        this.randText(11);
        await new Promise(resolve => setTimeout(resolve, 110));
//12
        this.randText(12);
        await new Promise(resolve => setTimeout(resolve, 133));
//13
        this.randText(13);
        await new Promise(resolve => setTimeout(resolve, 162));
//14
        this.randText(14);
        await new Promise(resolve => setTimeout(resolve, 196));
//15
        this.randText(15);
        await new Promise(resolve => setTimeout(resolve, 287));
//16
        this.randText(16);
    }

    private randText(i: number) {
        this.hlc = this.rounds[i % this.rounds.length].background;
        if (i === 16) {
            this.hlc = '#FFFFFF';
            return;
        }
        gsap.set('#headline', {x: randomNumber(-500, 500), y: randomNumber(-250, 250), rotation: randomNumber(-15, 15), autoAlpha: 1, scale: 0.3 + (i * 0.05), filter: 'blur(' + (15-i) + 'px)'});
    }

    private async startLights() {
        const lights = shuffleArray(HueLightService.primary.concat(HueLightService.secondary));
        let i = 0;
        while (!this.stopLights) {
            this.bounceLight(lights[i % lights.length])
            await new Promise(resolve => setTimeout(resolve, 250));
            i++;
        }
    }

    private async bounceLight(lightId: number) {
        this.hue.setColor([lightId], '#FFFFFF', 250, 254)
        await new Promise(resolve => setTimeout(resolve, 250));
        this.hue.turnOff([lightId], 1000)
    }
}
