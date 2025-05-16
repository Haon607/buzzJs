import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ScoreboardComponent } from "../../../embettables/scoreboard/scoreboard.component";
import { MemoryService } from "../../../../../../../q1/src/app/services/memory.service";
import { NgStyle } from "@angular/common";
import { ScoreboardPlayer, ScoreboardService, ScoreboardSquare } from "../../../../../../../q1/src/app/services/scoreboard.service";
import gsap from 'gsap';
import { Question, QuestionLoader } from "../../../../../Loader";
import { TimerComponent } from "../../../embettables/timer/timer.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonState, BuzzDeviceService } from "../../../../../../../q1/src/app/services/buzz-device.service";
import { MusicFader, shuffleArray, Style, styledLogger } from "../../../../../utils";
import { inputToColor } from "../../../../../models";
import { HueLightService } from "../../../../../../../q1/src/app/services/hue-light.service";
import { RoundInterface } from "../../../../../round";

@Component({
    selector: 'app-stoptheclock.round',
    imports: [
        ScoreboardComponent,
        NgStyle,
        TimerComponent
    ],
    templateUrl: '../multiple-choice.html',
    standalone: true,
    styleUrl: '../multiple-choice.css'
})
export class StopTheClockRoundComponent implements OnDestroy {
    bgc: string;
    round: RoundInterface;
    currentQuestion: Question = {
        question: "", answers: [
            {answer: "", correct: true, drawAble: false}, {answer: "", correct: false, drawAble: false}, {answer: "", correct: false, drawAble: false}, {answer: "", correct: false, drawAble: false},
        ], shuffle: false
    };
    questions: Question[] = [this.currentQuestion];
    spacePressed = false;
    music: HTMLAudioElement = new Audio();
    timerDone = false;
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    maxTime = 0;
    timerSound = true;
    showTime = false;
    questionFullWidth = true;
    private inputs: ButtonState[] = [];
    private clocks: { timeLeft: number, controller: number }[] = [];
    private acceptInputsVar = false;

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        this.clocks = memory.players.map(player => {
            return {timeLeft: 20, controller: player.controllerId}
        })
        buzz.onPress(buttonState => this.onPress(buttonState));
        this.setupWithDelay();
        this.questions = this.questions.concat(QuestionLoader.loadQuestion(memory.category!));
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

    onTimeExpired() {}

    private async setupWithDelay() {
        await new Promise(resolve => setTimeout(resolve, 100));
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

        gsap.set('#scoreboard', {x: 600})

        const away = {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"}
        gsap.set('#blue', away)
        gsap.set('#orange', away)
        gsap.set('#green', away)
        gsap.set('#yellow', away)
        gsap.set('#question', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})
        gsap.set('#timer', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})

        await new Promise(resolve => setTimeout(resolve, 750));
        gsap.to('#scoreboard', {x: 0, ease: 'bounce'})

    }

    private displayTimer(tf: boolean) {
        if (tf) {
            gsap.to('#timer', {y: 0, rotationX: 0, ease: 'back.inOut'})
        } else {
            gsap.to('#timer', {y: -300, rotationX: -45, ease: "back.inOut"})
        }
    }

    private displayQuestion(tf: boolean) {
        if (tf) {
            gsap.to('#question', {y: 0, rotationX: 0, ease: 'back.inOut'})
        } else {
            gsap.to('#question', {y: -300, rotationX: -45, ease: "back.inOut"})
        }
    }

    private async displayAnswers(tf: boolean) {
        const time = 100;
        const see = {rotateY: 2, x: 30, ease: "back.inOut"}
        const away = {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"}
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
        this.music.src = "/music/buzz/BBotW-stop_the_clock.mp3";
        this.music.loop = true
        this.music.play()
        for (let i = 0; this.clocks.some(clock => clock.timeLeft > 0); i++) {
            this.setupNextQuestion()
            await this.waitForSpace();
            this.displayQuestion(true)
            new Audio('music/wwds/frage.mp3').play();
            this.updateDisplayedTime()
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.waitForSpace()
            this.displayAnswers(true)
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.startTimer();
            styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
            await new Promise(resolve => setTimeout(resolve, 1000))
            this.revealAnswers();
            if (!this.clocks.some(clock => clock.timeLeft > 0)) {
                new MusicFader().fadeOut(this.music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                // this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
            }
            await this.waitForSpace();
            this.revealCorrect();
            new Audio('music/wwds/richtig.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 500));
            this.flipToCorrect()
            await this.waitForSpace();
            this.flipToPoints()
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.displayTimer(false)
            this.displayQuestion(false)
            this.displayAnswers(false)
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.collectPoints()
            if (!this.music.paused && !this.clocks.some(clock => clock.timeLeft > 0)) {
                new MusicFader().fadeOut(this.music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                // this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
            }
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.scoreboard.sortSubject.next();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        await this.waitForSpace()
        gsap.to('#scoreboard', {x: 600})
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
    }

    private onPress(buttonState: ButtonState) {
        if (this.acceptInputsVar && buttonState.button !== 0) {
            if (this.clocks.some(clock => clock.timeLeft > 0 && clock.controller === buttonState.controller)) {
                if (!this.inputs.some(input => input.controller === buttonState.controller)) {
                    this.inputs.push(buttonState);
                    new Audio('music/wwds/einloggen.mp3').play();
                    const states = new Array(4).fill(true);
                    for (const clock of this.clocks) {
                        states[clock.controller] = clock.timeLeft > 0;
                    }
                    for (const input of this.inputs) {
                        states[input.controller] = false;
                    }
                    this.buzz.setLeds(states);
                }
            }
        }
    }

    private async waitForSpace() {
        styledLogger("Space zum weitermachen", Style.requiresInput)
        while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
        this.spacePressed = false
    }

    private setupNextQuestion() {
        this.inputs = [];
        this.questions = this.questions.slice(1, this.questions.length);
        this.currentQuestion = this.questions[0];
        if (this.currentQuestion.shuffle) this.currentQuestion.answers = shuffleArray(this.currentQuestion.answers);
        this.printQuestion()
    }

    private printQuestion() {
        styledLogger(this.currentQuestion.question, Style.speak)
        styledLogger(this.currentQuestion.answers[0].answer, Style.speak)
        styledLogger(this.currentQuestion.answers[1].answer, Style.speak)
        styledLogger(this.currentQuestion.answers[2].answer, Style.speak)
        styledLogger(this.currentQuestion.answers[3].answer, Style.speak)
    }

    private async startTimer() {
        this.acceptInputs(true);
        let iteration = 0;
        while (this.clocks.filter(clock => clock.timeLeft <= 0).length + this.inputs.length < this.memory.players.length) {
            if (iteration % 5 === 0) {
                this.hue.setColor(HueLightService.secondary, iteration % 10 === 0 ? this.round.primary : this.round.background, 100, 254);
            }
            await new Promise(resolve => setTimeout(resolve, 100))
            const states: boolean[] = new Array(4);
            for (const clock of this.clocks) {
                if (!this.inputs.find(input => input.controller === clock.controller)) clock.timeLeft = Number((clock.timeLeft - 0.1).toFixed(1))
                states[clock.controller] = clock.timeLeft > 0;
            }
            for (const input of this.inputs) {
                states[input.controller] = false;
            }
            this.buzz.setLeds(states);
            iteration++;
            this.updateDisplayedTime()
        }
        this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254);
        this.acceptInputs(false)
    }

    private acceptInputs(tf: boolean) {
        this.acceptInputsVar = tf;
        if (tf) {
            const states = new Array(4).fill(false);
            for (const player of this.memory.players) {
                states[player.controllerId] = this.clocks.find(clock => clock.controller === player.controllerId)!.timeLeft > 0;
            }
            this.buzz.setLeds(states);
        } else {
            this.buzz.setLeds(new Array(4).fill(false))
        }
    }

    private revealAnswers() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: input ? {
                    squareBackground: inputToColor(input.button) + '80',
                    squareBorder: inputToColor(input.button)
                } : undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private revealCorrect() {
        if (this.currentQuestion.answers[0].correct) gsap.to('#blue', {duration: 0.5, borderWidth: 20})
        else gsap.to('#blue', {duration: 0.5, scale: 0.9});
        if (this.currentQuestion.answers[1].correct) gsap.to('#orange', {duration: 0.5, borderWidth: 20})
        else gsap.to('#orange', {duration: 0.5, scale: 0.9})
        if (this.currentQuestion.answers[2].correct) gsap.to('#green', {duration: 0.5, borderWidth: 20})
        else gsap.to('#green', {duration: 0.5, scale: 0.9})
        if (this.currentQuestion.answers[3].correct) gsap.to('#yellow', {duration: 0.5, borderWidth: 20})
        else gsap.to('#yellow', {duration: 0.5, scale: 0.9})
    }

    private flipToCorrect() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            const correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: input ? {
                    squareBackground: inputToColor(input.button),
                    squareBorder: input.button - 1 === correctInput ? '#00FF00' : '#FF0000',
                } : undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private flipToPoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const clock = this.clocks.find(clock => clock.controller === player.controllerId);
            const input = this.inputs.find(input => input.controller === player.controllerId);
            const correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: input?.button === correctInput + 1 ? {
                    squareBackground: '#00000080',
                    squareBorder: '#00FF00',
                    squareText: "+" + (Math.floor(clock!.timeLeft) + 10)
                } : (input ? {
                    squareBackground: '#00000080',
                    squareBorder: '#FF0000',
                    squareText: "-3s"
                } : undefined),
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private async collectPoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        const correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            const clock = this.clocks.find(clock => clock.controller === player.controllerId);
            if (clock && input && input.button !== correctInput+1) clock.timeLeft -= 3;
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: input?.button === correctInput + 1 ? (Math.floor(clock!.timeLeft) + 10) : 0,
                square: undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private async updateDisplayedTime() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const timeLeft = this.clocks.find(clock => clock.controller === player.controllerId)!.timeLeft
            const playerInput = this.inputs.find(input => input.controller === player.controllerId);
            const square: ScoreboardSquare = playerInput ? {
                squareBorder: '#FFFFFF',
                squareBackground: '#00000080',
                squareText: "" + Math.floor(timeLeft)
            } : {
                squareBorder: '#000000',
                squareBackground: '#00000080',
                squareText: "Zeit: " + Math.floor(timeLeft)
            }
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: timeLeft > 0 ? square : undefined,
                perks: player.perks,
                active: this.acceptInputsVar && timeLeft > 0 && !playerInput
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, false])
    }
}
