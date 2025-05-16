import gsap from 'gsap';
import { Component, HostListener, OnDestroy, ViewChild } from "@angular/core";
import { ScoreboardComponent } from "../../../embettables/scoreboard/scoreboard.component";
import { NgClass, NgStyle } from "@angular/common";
import { TimerComponent } from "../../../embettables/timer/timer.component";
import { MemoryService } from "../../../../services/memory.service";
import { Question, QuestionLoader } from "../../../../../Loader";
import { ButtonState, BuzzDeviceService } from "../../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../../services/hue-light.service";
import { MusicFader, shuffleArray, Style, styledLogger } from "../../../../../utils";
import { RoundInterface } from "../../../../../round";

@Component({
    selector: 'app-whatisthequestion.round',
    imports: [
        ScoreboardComponent,
        NgStyle,
        TimerComponent,
        NgClass
    ],
    templateUrl: '../open-ended.html',
    standalone: true,
    styleUrl: '../open-ended.css'
})
export class WhatisthequestionRoundComponent implements OnDestroy {
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
    gotCorrect = false;
    amountOfQuestions = 5;
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    maxTime = 30;
    timerSound = true;
    monospaceQuestion = true;
    private latestInput: ButtonState | null = null;
    private excludeIds: number[] = [];
    private acceptInputsVar = false;
    private stoppBuzzFlash = false

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
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

        if (event.key === '+') this.correct();
        if (event.key === '-') this.incorrect();

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
                perks: player.perks,
                square: undefined
            }
        }), false])

        gsap.set('#scoreboard', {x: 600})

        gsap.set('#answer', {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"})
        gsap.set('#question', {y: -600, rotationX: -45, opacity: 1, ease: "back.inOut"})
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
            gsap.to('#question', {y: -600, rotationX: -45, ease: "back.inOut"})
        }
    }

    private async displayAnswers(tf: boolean) {
        if (tf) {
            gsap.to('#answer', {rotateY: 2, x: 30, ease: "back.inOut"})
        } else {
            gsap.to('#answer', {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"})
        }
    }

    private async startRound() {
        this.music.src = "/music/buzz/BTV-BL_PF.mp3";
        this.music.loop = true
        this.music.play()
        for (let i = 0; i < this.amountOfQuestions; i++) {
            this.setupNextQuestion()
            await this.waitForSpace();
            new Audio('music/wwds/frage.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 250));
            const question = this.currentQuestion.question;
            this.currentQuestion.question = "";
            this.displayQuestion(true)
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
            await new Promise(resolve => setTimeout(resolve, 100));
            this.displayTimer(true)
            await new Promise(resolve => setTimeout(resolve, 400));
            await this.startTimer(question);
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
            styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (i + 1 === this.amountOfQuestions) {
                new MusicFader().fadeOut(this.music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                // this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
            }
            new Audio('music/wwds/richtig.mp3').play();
            this.displayAnswers(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.waitForSpace();
            this.flipToPoints()
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.collectPoints()
            this.displayTimer(false)
            this.displayQuestion(false)
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

    private async onPress(buttonState: ButtonState) {
        if (this.acceptInputsVar && buttonState.button === 0) {
            if (!this.latestInput && !this.excludeIds.includes(buttonState.controller)) {
                this.latestInput = buttonState;
                this.timer.stopTimer(this.music)
                new Audio('music/wwds/einloggen.mp3').play();
                this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                    return {
                        name: player.name,
                        score: player.gameScore,
                        pointAward: undefined,
                        square: this.latestInput?.controller === player.controllerId ? {
                            squareBackground: '#FF000088',
                            squareBorder: '#FFF'
                        } : undefined,
                        perks: player.perks,
                        active: this.latestInput?.controller === player.controllerId
                    }
                }), false])

                const states = new Array(4).fill(false);
                while (!this.stoppBuzzFlash) {
                    states[buttonState.controller] = !states[buttonState.controller];
                    this.buzz.setLeds(states);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                this.stoppBuzzFlash = false;
            }
        }
    }

    private async waitForSpace() {
        styledLogger("Space zum weitermachen", Style.requiresInput)
        while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
        this.spacePressed = false
    }

    private setupNextQuestion() {
        this.timer.resetTimer();
        this.latestInput = null;
        this.excludeIds = []
        this.gotCorrect = false
        this.questions = this.questions.slice(1, this.questions.length);
        this.currentQuestion = this.questions[0];
        if (this.currentQuestion.shuffle) this.currentQuestion.answers = shuffleArray(this.currentQuestion.answers);
        this.printQuestion()
    }

    private printQuestion() {
        styledLogger(this.currentQuestion.question, Style.information)
        styledLogger(this.currentQuestion.answers[0].answer, Style.information)
    }

    private async startTimer(question: string) {
        this.timerDone = false;
        this.timer.startTimer(this.music);
        this.acceptInputs(true);

        // Initialize the currentQuestion with underscores for letters/numbers and keep other characters as is
        this.currentQuestion.question = question
            .split('')
            .map(char => /[a-zA-Z0-9]/.test(char) ? '_' : char)
            .join('');

        // Extract indexes of letters and numbers only for revealing
        const revealableIndexes = question
            .split('')
            .map((char, index) => /[a-zA-Z0-9]/.test(char) ? index : null)
            .filter(index => index !== null) as number[];

        // Calculate the interval duration for revealing letters/numbers
        const revealInterval = 25000 / revealableIndexes.length;

        // Shuffle the indexes for random order
        for (let i = revealableIndexes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [revealableIndexes[i], revealableIndexes[j]] = [revealableIndexes[j], revealableIndexes[i]];
        }

        // Initial reveal of some characters (1/3.5 of the total revealable characters)
        let lettersRevealed = 0;
        const initialReveals = Math.floor(revealableIndexes.length / 3.5);
        while (lettersRevealed < initialReveals) {
            const index = revealableIndexes[lettersRevealed];
            this.currentQuestion.question = this.currentQuestion.question
                .split('')
                .map((char, i) => (i === index ? question[i] : char))
                .join('');
            lettersRevealed++;
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Progressive reveal loop
        while (!this.timerDone && !this.gotCorrect && this.excludeIds.length < this.memory.players.length) {
            if (!this.latestInput) {
                if (lettersRevealed < revealableIndexes.length) {
                    const index = revealableIndexes[lettersRevealed];
                    this.currentQuestion.question = this.currentQuestion.question
                        .split('')
                        .map((char, i) => (i === index ? question[i] : char))
                        .join('');
                    lettersRevealed++;
                }
            }
            // Wait for the next reveal interval
            await new Promise(resolve => setTimeout(resolve, revealInterval));
        }

        // Final reveal of remaining characters if needed
        while (lettersRevealed < revealableIndexes.length) {
            const index = revealableIndexes[lettersRevealed];
            this.currentQuestion.question = this.currentQuestion.question
                .split('')
                .map((char, i) => (i === index ? question[i] : char))
                .join('');
            lettersRevealed++;
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        this.timer.stopTimer(this.music);
        this.acceptInputs(false);
        this.gotCorrect = false;
    }

    private acceptInputs(tf: boolean) {
        this.acceptInputsVar = tf;
        if (tf) {
            const states = new Array(4).fill(false);
            for (const player of this.memory.players) {
                states[player.controllerId] = true;
            }
            this.buzz.setLeds(states);
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: undefined,
                    perks: player.perks,
                    active: true
                }
            }), false])
        } else {
            this.buzz.setLeds(new Array(4).fill(false))
            if (!this.gotCorrect) {
                this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                    return {
                        name: player.name,
                        score: player.gameScore,
                        pointAward: undefined,
                        square: undefined,
                        perks: player.perks,
                        active: false
                    }
                }), false])
            }
        }
    }

    private flipToPoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: this.latestInput?.controller === player.controllerId ? {
                    squareBackground: '#00000080',
                    squareBorder: '#00FF00',
                    squareText: "+" + (Math.floor(this.timer.remainingTime) + 21)
                } : undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private async collectPoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: this.latestInput?.controller === player.controllerId ? Math.floor(this.timer.remainingTime) + 21 : undefined,
                square: undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private correct() {
        this.stoppBuzzFlash = true;
        this.gotCorrect = true;

        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: this.latestInput?.controller === player.controllerId ? {
                    squareBackground: '#00000080',
                    squareBorder: '#00FF00',
                } : undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, false])
    }

    private async incorrect() {
        this.excludeIds.push(this.latestInput!.controller)
        this.stoppBuzzFlash = true;

        let scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: this.latestInput?.controller === player.controllerId ? {
                    squareBackground: '#00000080',
                    squareBorder: '#FF0000',
                } : undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, false])

        await new Promise(resolve => setTimeout(resolve, 1000))
        this.latestInput = null;

        this.timer.startTimer(this.music);
        const states = new Array(4).fill(true);
        for (const id of this.excludeIds) {
            states[id] = false;
        }
        this.buzz.setLeds(states);

        scoreboardPlayers = [];
        this.memory.players.forEach((player) => {
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: undefined,
                perks: player.perks,
                active: !this.excludeIds.includes(player.controllerId)
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }
}
