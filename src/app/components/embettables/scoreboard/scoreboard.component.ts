import { Component, Input } from '@angular/core';
import { NgStyle } from "@angular/common";
import { ScoreboardPlayer, ScoreboardService } from "../../../services/scoreboard.service";
import gsap from 'gsap';
import { MemoryService } from "../../../services/memory.service";

@Component({
    selector: 'app-scoreboard',
    imports: [
        NgStyle
    ],
    templateUrl: './scoreboard.component.html',
    standalone: true,
    styleUrl: './scoreboard.component.css'
})
export class ScoreboardComponent {
    @Input() final = false;
    players: ScoreboardPlayer[] = [];
    space = 200;
    preSpace: number;
    kill = false;

    /*TODO shift scoreboard to left (firefox)*/

    constructor(private scoreboardService: ScoreboardService, private memory: MemoryService) {
        memory.scoreboardKill.subscribe(() => this.kill = true)
        switch (this.memory.players.length) {
            case 2:
                this.preSpace = 200;
                break;
            case 3:
                this.preSpace = 125;
                break;
            default:
                this.preSpace = 0;
        }
        scoreboardService.playerSubject.subscribe(playersDelayTupel => {
            if (!this.kill) {
                if (this.players.length === 0) {
                    this.players = playersDelayTupel[0];
                    this.initPlace();
                }
                this.onPlayerUpdate(playersDelayTupel[0], [...this.players], playersDelayTupel[1]);
            }
        })

        scoreboardService.sortSubject.subscribe(() => {
            if (!this.kill) this.sort();
        })
        this.sort(true)
    }

    private async initPlace() {
        let initialIndex = 0;
        await new Promise((resolve) => setTimeout(resolve, 100));
        for (const player of this.players) {
            gsap.set('#player-container-' + player.name, {y: this.preSpace + (this.space * initialIndex), rotateY: -5, x: -10})
            gsap.set('#player-square-text-' + player.name, {opacity: 0})
            gsap.set('#player-square-' + player.name, {x: 180, opacity: 1, scale: 0.8});
            initialIndex++;
        }
    }

    private async onPlayerUpdate(newPlayers: ScoreboardPlayer[], oldPlayers: ScoreboardPlayer[], delay: boolean) {
        // console.log(oldPlayers);
        // console.log(newPlayers);
        // console.log("-------");
        await new Promise(resolve => setTimeout(resolve, 100));
        newPlayers = [...newPlayers.sort((a, b) => b.score - a.score)];

        for (const player of newPlayers) {
            if (player.square) {
                if (oldPlayers.find(oldPlayer => oldPlayer.name === player.name)!.square) {
                    const oldSquare = oldPlayers.find(oldPlayer => oldPlayer.name === player.name)!.square;
                    if (player.square.squareBorder !== oldSquare?.squareBorder || player.square.squareBackground !== oldSquare?.squareBackground || player.square.squareText !== oldSquare?.squareText) {
                        gsap.set('#player-square-' + player.name, {rotateX: 0});
                        gsap.to('#player-square-' + player.name, {rotateX: 360, borderColor: player.square.squareBorder, backgroundColor: player.square.squareBackground});
                    }
                } else gsap.to('#player-square-' + player.name, {x: 0, opacity: 1, scale: 1, borderColor: player.square.squareBorder, backgroundColor: player.square.squareBackground});
                if (oldPlayers.find(oldPlayer => oldPlayer.name === player.name)?.square?.squareText !== player.square.squareText) {
                    gsap.set('#player-square-text-' + player.name, {opacity: 0})
                    newPlayers.find(pla => pla.name === player.name)!.square!.squareText = player.square.squareText;
                }
                if (player.square.squareText) gsap.to('#player-square-text-' + player.name, {opacity: 1})
            } else if (oldPlayers.find(oldPlayer => oldPlayer.name === player.name)!.square) {
                gsap.to('#player-square-text-' + player.name, {opacity: 0})
                gsap.to('#player-square-' + player.name, {x: 180, opacity: 1, scale: 0.8, ease: "back.in"});
                gsap.to('#player-information-' + player.name, {x: 50, scale: 1.2});
                await new Promise(resolve => setTimeout(resolve, 100));
                if (player.pointAward) {
                    if (player.pointAward > 0) new Audio('music/gen/bounceinpoints.mp3').play();
                    if (player.pointAward < 0) new Audio('music/gen/bounceinnegative.mp3').play();
                    this.players.find(pla => pla.name === player.name)!.score += player.pointAward
                    player.score += player.pointAward
                    this.memory.players.find(pla => pla.name === player.name)!.gameScore += player.pointAward
                    gsap.to('#player-score-' + player.name, {scale: 1.2, opacity: 0});
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else if (player.playerPercent) {
                    if (player.playerPercent > 0) new Audio('music/gen/bounceinpoints.mp3').play();
                    if (player.playerPercent < 0) new Audio('music/gen/bounceinnegative.mp3').play();
                    this.players.find(pla => pla.name === player.name)!.playerPercent = player.playerPercent
                    this.memory.players.find(pla => pla.name === player.name)!.finalPercentage = player.playerPercent
                    gsap.to('#player-score-' + player.name, {scale: 1.2, opacity: 0});
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else new Audio('music/gen/bouncein.mp3').play()
                gsap.to('#player-information-' + player.name, {x: 0, scale: 1});
                gsap.to('#player-score-' + player.name, {scale: 1, opacity: 1});
            }
            if (player.playerColor) gsap.to('#player-information-' + player.name, {color: player.playerColor});
            if (player.active) gsap.to('#player-information-' + player.name, {borderColor: '#FFF'})
            else gsap.to('#player-information-' + player.name, {borderColor: '#000'})
            if (delay) await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.players = newPlayers
    }

    private async sort(initial = false) {
        this.memory.players = [...this.memory.players.sort((a, b) => b.gameScore - a.gameScore)];
        const old = [...this.players];
        this.players = [...this.players.sort((a, b) => b.score - a.score)];

        let index = 0;
        for (const player of this.players) {
            const selector = `#player-container-${player.name}`;
            if (initial) gsap.set(selector, {y: this.preSpace + (this.space * index)});
            else gsap.to(selector, {y: this.preSpace + (this.space * index), duration: 1, ease: 'back.in'});
            index++;
        }
        let changeHappened = false;
        for (const player of this.players) {
            const oldPlayer = old.find(p => p.name === player.name)!;
            if (this.players.indexOf(player) !== old.indexOf(oldPlayer)) changeHappened = true;
        }
        if (changeHappened && !initial) {
            await new Promise(resolve => setTimeout(resolve, 100));
            const audio = new Audio('/music/buzz/bmq-change_place.mp3')
            audio.volume = 0.2
            audio.play();
        }
    }
}
