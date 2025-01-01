import { Component, ElementRef, ViewChild } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { NgStyle } from "@angular/common";
import { ScoreboardService } from "../../../services/scoreboard.service";
import gsap from 'gsap';
import { Question } from "../../../../Loader";
import { randomNumber } from "../../../../utils";
import { TimerComponent } from "../../timer/timer.component";

@Component({
    selector: 'app-punktesammler.round',
    imports: [
        ScoreboardComponent,
        NgStyle,
        TimerComponent
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

    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
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

        let away = {rotateY: 88, x: -1150, ease: "sine.inOut"}
        gsap.set('#blue', away)
        gsap.set('#orange', away)
        gsap.set('#green', away)
        gsap.set('#yellow', away)
        await new Promise(resolve => setTimeout(resolve, 750));
        gsap.to('#scoreboard', {x: 0, ease: 'bounce'})
    }

    async displayAnswers(tf: boolean) {
        let time = 100;
        let see = {rotateY: 2, x: 30, ease: "sine.inOut"}
        let away = {rotateY: 88, x: -1150, ease: "sine.inOut"}
        if (tf) {
            gsap.to('#blue', see)
            await new Promise(resolve => setTimeout(resolve, time));
            gsap.to('#orange', see)
            await new Promise(resolve => setTimeout(resolve, time));
            gsap.to('#green', see)
            await new Promise(resolve => setTimeout(resolve, time));
            gsap.to('#yellow', see)
        } else {
            gsap.to('#blue', away)
            await new Promise(resolve => setTimeout(resolve, time));
            gsap.to('#orange', away)
            await new Promise(resolve => setTimeout(resolve, time));
            gsap.to('#green', away)
            await new Promise(resolve => setTimeout(resolve, time));
            gsap.to('#yellow', away)
        }
    }
}
