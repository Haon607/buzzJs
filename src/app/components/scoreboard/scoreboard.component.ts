import { Component } from '@angular/core';
import { NgStyle } from "@angular/common";
import { ScoreboardPlayer, ScoreboardService } from "../../services/scoreboard.service";
import gsap from 'gsap';

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
    players: ScoreboardPlayer[] = [];
    space: number = 200;

    constructor(private scoreboardService: ScoreboardService) {
        scoreboardService.playerSubject.subscribe(playersDelayTupel => {
            if (this.players.length === 0) {
                this.players = playersDelayTupel[0];
                this.initPlace();
            }
            this.onPlayerUpdate(playersDelayTupel[0], [...this.players], playersDelayTupel[1]);
        })
        scoreboardService.sortSubject.subscribe(() => {
            this.sort();
        })

    }

    private async initPlace() {
        let initialIndex = 0;
        await new Promise((resolve) => setTimeout(resolve, 100));
        for (const player of this.players) {
            gsap.set('#player-container-' + player.name, {y: this.space * initialIndex})
            gsap.set('#player-square-text-' + player.name, {opacity: 0})
            gsap.set('#player-square-' + player.name, {x: 180, opacity: 1, scale: 0.8});
            initialIndex++;
        }
    }

    private async onPlayerUpdate(newPlayers: ScoreboardPlayer[], oldPlayers: ScoreboardPlayer[], delay: boolean) {
        await new Promise(resolve => setTimeout(resolve, 100));
        newPlayers = [...newPlayers.sort((a, b) => b.score - a.score)];

        for (const player of newPlayers) {
            if (player.square) {
                if (oldPlayers.find(oldPlayer => oldPlayer.name === player.name)!.square) {
                    gsap.set('#player-square-' + player.name, {rotation: 0});
                    gsap.to('#player-square-' + player.name, {rotation: 360, borderColor: player.square.squareBorder, backgroundColor: player.square.squareBackground});
                } else gsap.to('#player-square-' + player.name, {x: 0, opacity: 1, scale: 1, borderColor: player.square.squareBorder, backgroundColor: player.square.squareBackground});
                if (oldPlayers.find(oldPlayer => oldPlayer.name === player.name)?.square?.squareText !== player.square.squareText) {
                    gsap.set('#player-square-text-' + player.name, {opacity: 0})
                    this.players.find(pla => pla.name === player.name)!.square!.squareText = player.square.squareText;
                }
                if (player.square.squareText) gsap.to('#player-square-text-' + player.name, {opacity: 1})
            } else if (oldPlayers.find(oldPlayer => oldPlayer.name === player.name)!.square) {
                gsap.to('#player-square-text-' + player.name, {opacity: 0})
                gsap.to('#player-square-' + player.name, {x: 180, opacity: 1, scale: 0.8});
                gsap.to('#player-information-' + player.name, {x: 50, scale: 1.2});
                await new Promise(resolve => setTimeout(resolve, 100));
                if (player.pointAward) {
                    this.players.find(pla => pla.name === player.name)!.score += player.pointAward
                    player.score += player.pointAward
                    gsap.to('#player-score-' + player.name, {scale: 1.2, opacity: 0});
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                gsap.to('#player-information-' + player.name, {x: 0, scale: 1});
                gsap.to('#player-score-' + player.name, {scale: 1, opacity: 1});
            }
            if (player.active) gsap.to('#player-information-' + player.name, {borderColor: '#FFF'})
            else gsap.to('#player-information-' + player.name, {borderColor: '#000'})
            if (delay) await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.players = newPlayers
    }

    private async sort() {
        this.players = [...this.players.sort((a, b) => b.score - a.score)];

        let index = 0;
        for (const player of this.players) {
            const selector = `#player-container-${player.name}`;
            gsap.to(selector, {y: this.space * index, duration: 2, ease: 'back.inOut'});
            index++;
        }
    }

}
