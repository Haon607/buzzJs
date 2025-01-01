import { Component } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { NgStyle } from "@angular/common";
import { ScoreboardService } from "../../../services/scoreboard.service";
import gsap from 'gsap';
import { Question } from "../../../../Loader";
import { randomNumber } from "../../../../utils";

@Component({
    selector: 'app-punktesammler.round',
    imports: [
        ScoreboardComponent,
        NgStyle
    ],
    templateUrl: '../multiple-choice.html',
    standalone: true,
    styleUrl: '../multiple-choice.css'
})
export class PunktesammlerRoundComponent {
    bgc: string;
    round: RoundInterface;
    currentQuestion: Question = {
        question: "ashjdbasfkjdasb djkas das dasnbdansmb fdasjd ada asdknasdbasjd absjdhjasbdhlajhk akjsjhdasjhxda", answers: [
            {answer: 'adnkaskdfaksnd ada asdknasdbasjd absjdhjasbdhlajhk akjsjhdasjhxda', correct: true}, {answer: 'gchrsghdhgfd ada asdknasdbasjd absjdhjasbdhlajhk akjsjhdasjhxda', correct: false}, {answer: '<yx<yx<yx<x> ada asdknasdbasjd absjdhjasbdhlajhk akjsjhdasjhxda', correct: false}, {answer: 'dsfydvvdv ada asdknasdbasjd absjdhjasbdhlajhk akjsjhdasjhxda', correct: false},
        ], shuffle: false
    };

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background
        this.setupWithDelay();
    }

    private async setupWithDelay() {
        await new Promise(resolve => setTimeout(resolve, 100));
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                active: false,
                square: undefined
            }
        }), false])
        gsap.set('#scoreboard', {x: 600})
        gsap.set('#blue', {rotateY: 2, x: 30})
        gsap.set('#orange', {rotateY: 2, x: 30})
        gsap.set('#green', {rotateY: 2, x: 30})
        gsap.set('#yellow', {rotateY: 2, x: 30})
        await new Promise(resolve => setTimeout(resolve, 750));
        gsap.to('#scoreboard', {x: 0, ease: 'bounce'})
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                active: true,
                square: {
                    squareBackground: '#000',
                    squareBorder: '#FFF'
                }
            }
        }), true])
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                active: true,
                square: {
                    squareBackground: '#11BC2088',
                    squareBorder: '#11BC20'
                }
            }
        }), false])
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: randomNumber(0, 100),
                active: false,
                square: undefined
            }
        }), true])
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.scoreboard.sortSubject.next()
    }
}
