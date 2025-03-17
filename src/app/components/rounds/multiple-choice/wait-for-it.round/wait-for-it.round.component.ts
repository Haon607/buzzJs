import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ScoreboardComponent } from "../../../scoreboard/scoreboard.component";
import { MemoryService } from "../../../../services/memory.service";
import { NgStyle } from "@angular/common";
import { ScoreboardService } from "../../../../services/scoreboard.service";
import gsap from 'gsap';
import { Question, QuestionLoader } from "../../../../../Loader";
import { TimerComponent } from "../../../timer/timer.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonState, BuzzDeviceService } from "../../../../services/buzz-device.service";
import { MusicFader, shuffleArray, Style, styledLogger } from "../../../../../utils";
import { inputToColor, Player } from "../../../../../models";
import { HueLightService } from "../../../../services/hue-light.service";
import { RoundInterface } from "../../../../services/round";

@Component({
    selector: 'app-wait-for-it.round',
    imports: [
        ScoreboardComponent,
        NgStyle,
        TimerComponent
    ],
    templateUrl: '../multiple-choice.html',
    standalone: true,
    styleUrl: '../multiple-choice.css'
})
export class WaitForItRoundComponent implements OnDestroy {
    bgc: string;
    round: RoundInterface;
    currentQuestion: Question = {
        question: "", answers: [
            {answer: "", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false},
        ], shuffle: false
    };
    questions: Question[] = [this.currentQuestion];
    spacePressed = false;
    music: HTMLAudioElement = new Audio();
    timerDone = false;
    amountOfQuestions = 5;
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    maxTime = 1;
    timerSound = false;
    showTime = false;
    questionFullWidth = false;
    private input?: ButtonState = undefined;
    private acceptInputsVar = false;
    private loans: { controller: number, amount: number }[] = [];
    private questionNumber = 0;

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

        this.hue.setColor(HueLightService.primary, this.round.primary, 2000, 1)
        this.hue.setColor(HueLightService.secondary, this.round.secondary, 2000, 100)

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
        this.music.src = '/music/mp/smpj-dc2.mp3'
        this.music.play()
        for (let i = 0; i < this.amountOfQuestions; i++) {
            this.questionNumber = i + 1
            const minPointsNeeded = Math.max(this.memory.roundNumber * 25, 10);
            if (this.memory.players.some(player => player.gameScore < minPointsNeeded)) {
                if (i === 0) await new Promise(resolve => setTimeout(resolve, 2000));
                styledLogger("Adjusting Scores", Style.information);

                // Find the player with the smallest score
                const minScore = Math.min(...this.memory.players.map(player => player.gameScore));

                // Calculate the adjustment amount needed to bring the lowest score to 100
                const adjustmentAmount = minPointsNeeded - minScore;

                if (adjustmentAmount > 0) {
                    for (const player of this.memory.players) {
                        this.loans.push({controller: player.controllerId, amount: adjustmentAmount})
                    }
                    // Update the scoreboard to reflect the changes
                    this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                        return {
                            name: player.name,
                            score: player.gameScore,
                            pointAward: undefined,
                            square: {
                                squareBorder: '#FFFFFF',
                                squareBackground: '#FFFFFF88',
                                squareText: `Kredit +${adjustmentAmount}`,
                            },
                            perks: player.perks,
                            active: false
                        };
                    }), false]);

                    await this.waitForSpace()

                    // Clear highlights from the scoreboard
                    this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                        return {
                            name: player.name,
                            score: player.gameScore,
                            pointAward: adjustmentAmount,
                            square: undefined,
                            perks: player.perks,
                            active: false
                        };
                    }), false]);
                }
            }

            this.setupNextQuestion()
            styledLogger("Next: Start Question", Style.information)
            await this.waitForSpace();
            await new MusicFader().fadeOut(this.music, 500)
            new Audio('music/wwds/frage.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 250));
            this.displayQuestion(true)
            this.music.src = "/music/ydkj/QuestionBedPre" + (i + 1) + ".mp3";
            this.music.play()
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 10)
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.waitForSpace()
            this.displayAnswers(true)
            this.music.src = "/music/ydkj/QuestionBedAction" + (i + 1) + ".mp3";
            this.music.load()
            await new Promise(resolve => setTimeout(resolve, 100));
            this.timer.remainingTime = Number(this.music.duration.toFixed(1)) - 1;
            this.music.play()
            this.displayTimer(true)
            await this.startTimer();
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 100)
            styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
            gsap.set('#timer', {rotateZ: 0})
            await this.waitForSpace();
            this.revealAnswers();
            gsap.to('#timer', {rotateZ: 360, duration: 0.5})
            this.showTime = true;
            if (i + 1 === this.amountOfQuestions) {
                new MusicFader().fadeOut(this.music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                // this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
            }
            await this.waitForSpace();
            new Audio('music/wwds/richtig.mp3').play();
            this.revealCorrect();
            await new Promise(resolve => setTimeout(resolve, 500));
            this.flipToCorrect()
            await this.waitForSpace();
            this.collectPoints()
            this.hue.setColor(HueLightService.primary, this.round.primary, 1000, 1)
            this.displayTimer(false)
            this.displayQuestion(false)
            this.displayAnswers(false)
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.scoreboard.sortSubject.next();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        if (this.loans.length > 0) {
            styledLogger("Kredite zurückzahlen", Style.information)
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: this.loans.some(loan => loan.controller === player.controllerId) ? {
                        squareBorder: '#000000',
                        squareBackground: '#00000088',
                        squareText: "Kredit: " + (this.loans.filter(loan => loan.controller === player.controllerId).map(loan => loan.amount).reduce((a, b) => a + b) * -1),
                    } : undefined,
                    perks: player.perks,
                    active: false
                }
            }), false])
            await this.waitForSpace()
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: this.loans.some(loan => loan.controller === player.controllerId) ? this.loans.filter(loan => loan.controller === player.controllerId).map(loan => loan.amount).reduce((a, b) => a + b) * -1 : undefined,
                    square: undefined,
                    perks: player.perks,
                    active: false
                }
            }), false])

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
        if (this.acceptInputsVar && buttonState.button !== 0) {
            if (!this.input) {
                this.input = buttonState
                new Audio('music/div/buzzer.mp3').play();
                const states = new Array(4).fill(false);
                states[buttonState.controller] = false;
                this.buzz.setLeds(states);
                this.updatePoints(this.timer.remainingTime, 'buzzed')
            }
        }
    }

    private async waitForSpace() {
        this.spacePressed = false
        styledLogger("Space zum weitermachen", Style.requiresInput)
        while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
        this.spacePressed = false
    }

    private setupNextQuestion() {
        this.timer.resetTimer();
        this.showTime = false
        this.input = undefined;
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
        this.timerDone = false;
        const startTime = this.timer.remainingTime;
        this.timer.startTimer(this.music)
        this.acceptInputs(true);
        while (!this.timerDone && !this.input) {
            if (Number(this.timer.remainingTime.toFixed(1)) % 1 === 0) {
                this.hue.setColor(HueLightService.primary, this.round.primary, 250, Math.floor((startTime - Math.floor(this.timer.remainingTime)) * Math.floor(254 / Math.floor(startTime))))
                // if (Number(this.timer.remainingTime.toFixed(1)) % 5 === 0) {
                this.updatePoints(Math.floor(this.timer.remainingTime));
                // }
            }
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        new MusicFader().fadeOut(this.music, 1000)
        this.timer.stopTimer(this.music)
        this.acceptInputs(false)
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
            if (!this.input) this.updatePoints(0, 'timeout')
        }
    }

    private revealAnswers() {
        if (this.input) {
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: player.controllerId === this.input!.controller ? {
                        squareBorder: inputToColor(this.input!.button),
                        squareBackground: inputToColor(this.input!.button) + '88',
                        squareText: "±" + this.calculatePoints(player, this.timer.remainingTime)
                    } : undefined,
                    perks: player.perks,
                    active: false
                }
            }), true])
        } else {
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: undefined,
                    perks: player.perks,
                    active: false
                }
            }), true])
        }
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
        if (this.input) {
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: player.controllerId === this.input!.controller ? {
                        squareBorder: this.input!.button === this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(answer => answer.correct)!) + 1 ? '#00FF00' : '#FF0000',
                        squareBackground: inputToColor(this.input!.button) + '88',
                        squareText: (this.input!.button === this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(answer => answer.correct)!) + 1 ? '+' : '-') + this.calculatePoints(player, this.timer.remainingTime)
                    } : undefined,
                    perks: player.perks,
                    active: false
                }
            }), false])
        }
    }

    private async collectPoints() {
        if (this.input) {
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: (this.input!.button === this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(answer => answer.correct)!) + 1 ? this.calculatePoints(player, this.timer.remainingTime) : this.calculatePoints(player, this.timer.remainingTime) * -1),
                    square: undefined,
                    perks: player.perks,
                    active: false
                }
            }), false])
        }
    }

    private calculatePoints(player: Player, remainingTime: number): number {
        const playerList = this.memory.players.slice().sort((a, b) => a.gameScore - b.gameScore)
        const index = playerList.findIndex((pla: Player) => pla.controllerId === player.controllerId)
        const reverseList = playerList.slice().reverse();
        return Math.floor(reverseList[index].gameScore * (((35 + (Math.pow(2, this.questionNumber))) - Math.floor(remainingTime)) / 100))
    }

    private updatePoints(remainingTime: number, reason: 'timer' | 'buzzed' | 'timeout' = 'timer') {
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: {
                    squareBorder: reason === 'timer' ? '#FFFFFF' : (player.controllerId === this.input?.controller ? '#FF0000' : '#666666'),
                    squareBackground: this.round.secondary + '88',
                    squareText: "±" + this.calculatePoints(player, remainingTime)
                },
                perks: player.perks,
                active: reason === 'timer'
            }
        }), false])
    }
}
