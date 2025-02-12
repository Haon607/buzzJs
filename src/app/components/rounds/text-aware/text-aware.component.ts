import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { NgStyle } from "@angular/common";
import { TimerComponent } from "../../timer/timer.component";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../services/hue-light.service";
import gsap from "gsap";
import { MusicFader, shuffleArray, Style, styledLogger } from "../../../../utils";
import { inputToColor } from "../../../../models";
import { Musicloader, MusicQuestion } from "../../../../MusicLoader";

@Component({
    selector: 'app-text-aware',
    imports: [
        ScoreboardComponent,
        NgStyle,
        TimerComponent
    ],
    templateUrl: './text-aware.component.html',
    standalone: true,
    styleUrl: './text-aware.component.css'
})
export class TextAwareComponent implements OnDestroy {
    bgc: string;
    round: RoundInterface;
    displayObject = {
        answers: [
            {answer: "", correct: false},
            {answer: "", correct: false},
            {answer: "", correct: false},
            {answer: "", correct: false}
        ],
        lyrics: [
            {text: "", order: 0, trackId: 0}
        ]
    }
    allTracks: MusicQuestion[] = new Array(4).fill(Musicloader.empty);
    spacePressed: boolean = false;
    music: HTMLAudioElement = new Audio();
    timerDone: boolean = false;
    amountOfQuestions = 5;
    maxTime: number = 30;
    private inputs: ButtonState[] = [];
    private excludedIds: number[] = [];
    private acceptInputsVar: boolean = false;
    private acceptColors: boolean = false;
    possiblePoints: number = 0;
    barWidth: number = 50;

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        buzz.onPress(buttonState => this.onPress(buttonState));
        this.setupWithDelay();
        this.allTracks = this.allTracks.concat(Musicloader.loadMusic(memory.category!));
        this.startRound();
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (this.buzz.emulate(event.key)) this.onPress(this.buzz.emulate(event.key)!);

        if (event.key === 'i') this.memory.print();

        if (event.key === 'r') this.setupNextQuestion();

        if (event.key === ' ') this.spacePressed = true;
    }

    ngOnDestroy(): void {
        this.music.pause();
        this.buzz.removeAllListeners();
        this.memory.scoreboardKill.next()
    }

    onTimeExpired() {
        this.timerDone = true
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

        let away = {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"}
        gsap.set('#blue', away)
        gsap.set('#orange', away)
        gsap.set('#green', away)
        gsap.set('#yellow', away)
        gsap.set('#question', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})
        gsap.set('#progress-bar', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})

/*        await new Promise(resolve => setTimeout(resolve, 750));
        this.displayAnswers(true)
        this.displayBar(true)
        this.displayScoreboard(true)*/
    }

    private displayScoreboard(tf: boolean) {
        if (tf) {
            gsap.to('#scoreboard', {x: 0, ease: 'back.inOut'})
        } else {
            gsap.to('#scoreboard', {x: 600, ease: 'back.inOut'})
        }
    }

    private displayBar(tf: boolean) {
        if (tf) {
            gsap.to('#progress-bar', {y: 0, rotationX: 0, ease: 'back.inOut'})
        } else {
            gsap.to('#progress-bar', {y: -300, rotationX: -45, ease: "back.inOut"})
        }
    }

    private async displayAnswers(tf: boolean) {
        let time = 100;
        let see = {rotateY: 2, x: 30, ease: "back.inOut"}
        let away = {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"}
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

    private async startRound() {
        // this.music.src = "/music/buzz/BTV-BL_PB.mp3";
        // this.music.loop = true
        // this.music.play()
        await new Promise(resolve => setTimeout(resolve, 500))
        for (let i = 0; i < this.amountOfQuestions; i++) {
            await this.setupNextQuestion()
            this.displayBar(true)
            await this.waitForSpace();
            this.displayScoreboard(false)
            new Audio('music/wwds/frage.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 250));
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
            gsap.to('#progress-bar', {borderColor: '#FFF'})
            gsap.to('#points', {borderColor: '#FFF'})
            this.acceptInputs(true)

            for (let i = 0; i < this.displayObject.lyrics.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 250));

            }

            this.acceptInputs(false)
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
            styledLogger("Richtige Antwort: " + this.displayObject.answers.find(ans => ans.correct)?.answer, Style.information)
            await new Promise(resolve => setTimeout(resolve, 1000))
            this.revealAnswers();
            if (i + 1 === this.amountOfQuestions) {
                new MusicFader().fadeOut(this.music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
            }
            await this.waitForSpace();
            new Audio('music/wwds/richtig.mp3').play();
            this.revealCorrect();
            await new Promise(resolve => setTimeout(resolve, 500));
            this.flipToCorrect()
            await this.waitForSpace();
            this.flipToPoints()
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.collectPoints()
            this.displayBar(false)
            this.displayAnswers(false)
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.scoreboard.sortSubject.next();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await this.waitForSpace()
        gsap.to('#scoreboard', {x: 600})
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
    }

    private onPress(buttonState: ButtonState) {
        if (this.acceptInputsVar && !this.acceptColors && !this.excludedIds.some(id => buttonState.controller === id) && buttonState.button === 0) {
            this.acceptInputs(false);
            this.inputs.push(buttonState);
            new Audio('music/wwds/einloggen.mp3').play();
            gsap.to('#points', {borderColor: inputToColor(0), ease: "bounce.out"})
        }
        if (this.acceptInputsVar && this.acceptColors && !this.excludedIds.some(id => buttonState.controller === id) && buttonState.button !== 0) {
            if (!this.inputs.some(input => input.controller === buttonState.controller)) {
                this.inputs.push(buttonState);
                new Audio('music/wwds/einloggen.mp3').play();
                let states = new Array(4).fill(true);
                for (let input of this.inputs) {
                    states[input.controller] = false;
                }
                this.buzz.setLeds(states);
                this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                    return {
                        name: player.name,
                        score: player.gameScore,
                        pointAward: undefined,
                        square: this.inputs.some(input => input.controller === player.controllerId) ? {
                            squareBackground: '#00000000',
                            squareBorder: '#FFF'
                        } : undefined,
                        active: !this.inputs.some(input => input.controller === player.controllerId)
                    }
                }), false])
            }
        }
    }

    private async waitForSpace() {
        styledLogger("Space zum weitermachen", Style.requiresInput)
        while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
        this.spacePressed = false
    }

    private setupNextQuestion() {
        // this.timer.resetTimer();
        this.inputs = [];
        this.acceptColors = false;
        this.possiblePoints = 100
        this.allTracks = this.allTracks.slice(4, this.allTracks.length);
        let lyrics: {text: string, order: number, trackId: number}[] = [];
        for (let i = 0; i < this.allTracks[0].lyrics.length; i++) {
            lyrics.push({text: this.allTracks[0].lyrics[i], order: i, trackId: this.allTracks[0].id});
        }
        this.displayObject.lyrics = lyrics;
        const order = shuffleArray([0, 1, 2, 3])
        const anyLonger = this.allTracks.slice(0, 4).some(track => track.information.title.length + track.information.interpret.length > 57);
        if (this.allTracks.slice(0, 4).some(track => track.information.title.length > 60)) {
            this.setupNextQuestion()
            return;
        }
        for (let i = 0; i < order.length; i++) {
            this.displayObject.answers[i].answer = this.allTracks[order[i]].information.title;
            if (!anyLonger) {
                this.displayObject.answers[i].answer += " - " + this.allTracks[order[i]].information.interpret
            }
            this.displayObject.answers[i].correct = order[i] === 0;
        }
        this.printQuestion()
    }

    private printQuestion() {
        styledLogger(this.displayObject.lyrics.map(lyrics => lyrics.order + ": " + lyrics.text).join('\n'), Style.highlightInformation)
        styledLogger(this.displayObject.answers[0].answer, this.displayObject.answers[0].correct ? Style.highlightInformation : Style.information)
        styledLogger(this.displayObject.answers[1].answer, this.displayObject.answers[1].correct ? Style.highlightInformation : Style.information)
        styledLogger(this.displayObject.answers[2].answer, this.displayObject.answers[2].correct ? Style.highlightInformation : Style.information)
        styledLogger(this.displayObject.answers[3].answer, this.displayObject.answers[3].correct ? Style.highlightInformation : Style.information)
    }

    private acceptInputs(tf: boolean) {
        this.acceptInputsVar = tf;
        if (tf) {
            let states = new Array(4).fill(false);
            for (let player of this.memory.players) {
                states[player.controllerId] = true;
            }
            this.buzz.setLeds(states);
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: undefined,
                    active: true
                }
            }), false])
        } else {
            this.buzz.setLeds(new Array(4).fill(false))
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: this.inputs.some(input => input.controller === player.controllerId) ? {
                        squareBackground: '#00000000',
                        squareBorder: '#FFF'
                    } : undefined,
                    active: false
                }
            }), false])
        }
    }

    private revealAnswers() {
        let scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            let input = this.inputs.find(input => input.controller === player.controllerId);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: input ? {
                    squareBackground: inputToColor(input.button) + '80',
                    squareBorder: inputToColor(input.button)
                } : undefined,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private revealCorrect() {
        if (this.displayObject.answers[0].correct) gsap.to('#blue', {duration: 0.5, borderWidth: 20})
        else gsap.to('#blue', {duration: 0.5, scale: 0.9});
        if (this.displayObject.answers[1].correct) gsap.to('#orange', {duration: 0.5, borderWidth: 20})
        else gsap.to('#orange', {duration: 0.5, scale: 0.9})
        if (this.displayObject.answers[2].correct) gsap.to('#green', {duration: 0.5, borderWidth: 20})
        else gsap.to('#green', {duration: 0.5, scale: 0.9})
        if (this.displayObject.answers[3].correct) gsap.to('#yellow', {duration: 0.5, borderWidth: 20})
        else gsap.to('#yellow', {duration: 0.5, scale: 0.9})
    }

    private flipToCorrect() {
        /*let scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
          let input = this.inputs.find(input => input.controller === player.controllerId);
          let correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
          scoreboardPlayers.push({
            name: player.name,
            score: player.gameScore,
            pointAward: 25,
            square: input ? {
              squareBackground: inputToColor(input.button),
              squareBorder: input.button - 1 === correctInput ? '#00FF00' : '#FF0000',
            } : undefined,
            active: false
          })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])*/
    }

    private flipToPoints() {
        /*let scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
          let input = this.inputs.find(input => input.controller === player.controllerId);
          let correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
          scoreboardPlayers.push({
            name: player.name,
            score: player.gameScore,
            pointAward: undefined,
            square: input?.button === correctInput + 1 ? {
              squareBackground: '#00000080',
              squareBorder: '#00FF00',
              squareText: "+25"
            } : undefined,
            active: false
          })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])*/
    }

    private async collectPoints() {
        /*let scoreboardPlayers: ScoreboardPlayer[] = [];
        let correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
        this.memory.players.forEach((player) => {
          let input = this.inputs.find(input => input.controller === player.controllerId);
          scoreboardPlayers.push({
            name: player.name,
            score: player.gameScore,
            pointAward: input?.button === correctInput + 1 ? 25 : 0,
            square: undefined,
            active: false
          })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])*/
    }
}
