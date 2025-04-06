import { Component } from '@angular/core';
import { NgStyle } from "@angular/common";
import { MemoryService } from "../services/memory.service";
import { ActivatedRoute, Router } from "@angular/router";
import { BuzzDeviceService } from "../services/buzz-device.service";
import { HueLightService } from "../services/hue-light.service";
import { ColorFader, countWithDelay, randomNumber } from "../../utils";
import { inputToColor } from "../../models";
import gsap from "gsap";

@Component({
    selector: 'app-final-scoreboard',
    imports: [
        NgStyle
    ],
    templateUrl: './final-scoreboard.component.html',
    standalone: true,
    styleUrl: './final-scoreboard.component.css'
})
export class FinalScoreboardComponent {
    bgc: string;
    disPlayers: {
        done: boolean;
        name: string;
        totalGameScore: number;
        totalPercentage: number;
        controllerId: number;
        countingScore: number;
        countingPercentage: number;
    }[];

    constructor(private memory: MemoryService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.bgc = '#' + this.route.snapshot.paramMap.get("bgc")!;
        this.disPlayers = this.memory.players.map(player => {
            return {
                name: player.name,
                totalGameScore: player.gameScore,
                totalPercentage: player.finalPercentage,
                controllerId: player.controllerId,
                countingScore: 0,
                countingPercentage: 0,
                done: false
            }
        })
        new ColorFader().fadeColor(this.bgc, '#000000', 2000, value => this.bgc = value);
        this.setupWithDelay();
    }

    private async setupWithDelay() {
        await new Promise(resolve => setTimeout(resolve, 100))
        await this.showPanes();
        await new Promise(resolve => setTimeout(resolve, 2000))
        await this.fillEmUp();
    }

    private async showPanes() {
        let i = 0;

        function getRotationOfPane(thisElement: number, NumberOfAllElements: number): number {
            const middleIndex = Math.floor(NumberOfAllElements / 2);

            if (NumberOfAllElements % 2 === 0) {
                // Even number of elements: middle is between two items
                if (thisElement < middleIndex) {
                    return middleIndex - thisElement;
                } else {
                    return middleIndex - thisElement - 1;
                }
            } else {
                // Odd number of elements: one clear middle
                return middleIndex - thisElement;
            }
        }

        for (let player of this.disPlayers) {
            gsap.set('#player-container-' + player.controllerId, {y: 1200, opacity: 1, rotationY: getRotationOfPane(i, this.disPlayers.length)})
            gsap.set('#player-score-bar-' + player.controllerId, {height: "0%"})
            await new Promise(resolve => setTimeout(resolve, 100))
            gsap.to('#player-container-' + player.controllerId, {y: 0, ease: "back.out"})
            i++;
        }
    }

    getPlayerColorBackground(controllerId: number, done: boolean) {
        return ColorFader.adjustBrightness(inputToColor(controllerId+1)!, done ? -50 : -25)
    }

    private async fillEmUp() {
        const max = Math.max(...this.disPlayers.map(player => player.totalGameScore));
        let i = 0;
        while (this.disPlayers.some(player => !player.done)) {
            for (let player of this.disPlayers.filter(player => !player.done)) {
                if (player.countingPercentage+1 <= player.totalPercentage) {
                    player.countingPercentage++;
                    player.countingScore = Math.round(player.totalGameScore * (player.countingPercentage / 100));
                    gsap.to('#player-score-bar-' + player.controllerId, {height: (player.countingScore / max * 100) + "%", duration: 0.1, ease: "none"});
                } else {
                    player.done = true;
                }
                // await new Promise(resolve => setTimeout(resolve, 50));
            }
            new Audio('music/div/spin' + (i%4) + '.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 500 / Math.max(1, i / 10)));
            i++;
        }
    }
}
