import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { TimerComponent } from "../../timer/timer.component";
import { MemoryService } from "../../../services/memory.service";
import { Category, CategoryLoader, Question, QuestionLoader, QuestionType } from "../../../../Loader";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../services/hue-light.service";
import gsap from "gsap";
import { ColorFader, MusicFader, shuffleArray, Style, styledLogger } from "../../../../utils";
import { NgStyle } from "@angular/common";
import { RoundInterface } from "../../../../round";
import { CanvasMirrorComponent } from "./canvas-mirror/canvas-mirror.component";
import { Animate } from "../../../../Animate";
import { Player } from "../../../../models";

@Component({
    selector: 'app-drawing.round',
    imports: [
        ScoreboardComponent,
        TimerComponent,
        NgStyle,
        CanvasMirrorComponent
    ],
    templateUrl: './drawing.round.component.html',
    standalone: true,
    styleUrl: './drawing.round.component.css'
})
export class DrawingRoundComponent implements OnDestroy {
    bgc: string;
    round: RoundInterface;
    categories: Category[] = [];
    spacePressed = false;
    music: HTMLAudioElement = new Audio();
    drawingMusic: HTMLAudioElement = new Audio('music/jackbox/drawfuldraw.mp3  ');
    timerDone = false;
    gotCorrect = false;
    amountOfQuestions = 5;
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    @ViewChild(CanvasMirrorComponent) canvas: CanvasMirrorComponent = new CanvasMirrorComponent();
    maxTime = 180;
    private drawingPlayer: Player;
    private latestInput: ButtonState | null = null;
    private excludeIds: number[] = [];
    private acceptInputsVar = false;
    private stoppBuzzFlash = false
    displayObject: { options: string[], answer: string } = {options: [], answer: ""};
    currentCategory: Category | null = null;
    private promts: string[] = [];

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        this.categories = CategoryLoader.loadCategories(this.round.questionType!)
        buzz.onPress(buttonState => this.onPress(buttonState));
        this.drawingPlayer = this.memory.players.slice().sort((a, b) => a.gameScore - b.gameScore)[0];
        this.setupWithDelay();
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
                active: player.controllerId === this.drawingPlayer.controllerId,
                perks: player.perks,
                square: undefined,
            }
        }), false])

        gsap.set('#scoreboard', {x: 600})
        gsap.set('#canvas', {x: 0, scale: 1})
        /*TODO THIS ROUND IS PROBABLY MORE LIKE Textaware*/
        /*TODO top line no question just category? and answers? let users pick category every so often*/
        /*TODO custom timer from the music progression, makes more sense here*/
        gsap.set('.option', {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"})
        // gsap.set('#answer', {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"})
        gsap.set('#timer', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})

        await new Promise(resolve => setTimeout(resolve, 750));

        this.canvas.input.subscribe(input => this.selectCategory(input));

        gsap.to('#scoreboard', {x: 0, ease: 'bounce'})
    }

    private displayTimer(tf: boolean) {
        if (tf) {
            gsap.to('#timer', {y: 0, rotationX: 0, ease: 'back.inOut'})
        } else {
            gsap.to('#timer', {y: -300, rotationX: -45, ease: "back.inOut"})
        }
    }

    private async displayAnswers(tf: boolean) {
        if (tf) {
            gsap.to('#options-container .option', {rotateY: 2, x: 30, ease: "back.inOut"})
        } else {
            gsap.to('#options-container .option', {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"})
        }
    }

    private async displayAnswer(tf: boolean) {
        if (tf) {
            gsap.to('#answer', {rotateY: 2, x: 30, ease: "back.inOut"})
        } else {
            gsap.to('#answer', {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"})
        }
    }

    private async startRound() {
        await this.waitForSpace();
        new ColorFader().fadeColor(this.bgc, ColorFader.adjustBrightness(this.bgc,-50), 300, color => this.bgc = color);
        await new Animate(this.hue, this.buzz).gameOn(this.round.primary, '#404040', this.round.secondary, this.round.primary);
        new ColorFader().fadeColor(this.bgc, this.round.background, 300, color => this.bgc = color);
        this.displayTimer(true)
        await new Promise(resolve => setTimeout(resolve, 500));
        // await this.waitForSpace();
        await this.chooseCategory()
        this.drawingMusic.play()
        this.timer.startTimer()
        for (let i = 0; true; i++) {
            this.setupNextQuestion()
            await this.waitForSpace();
            new Audio('music/wwds/frage.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 250));
            // const question = this.currentQuestion.question;
            // this.currentQuestion.question = "";
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
            await new Promise(resolve => setTimeout(resolve, 100));
            this.displayTimer(true)
            await new Promise(resolve => setTimeout(resolve, 400));
            // await this.startTimer(question);
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
            // styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
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
        this.spacePressed = false
        while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
        this.spacePressed = false
    }

    private setupNextQuestion() {
        this.latestInput = null;
        this.excludeIds = []
        this.gotCorrect = false
        // this.questions = this.questions.slice(1, this.questions.length);
        // this.currentQuestion = this.questions[0];
        // if (this.currentQuestion.shuffle) this.currentQuestion.answers = shuffleArray(this.currentQuestion.answers);
        this.printQuestion()
    }

    private printQuestion() {
        // styledLogger(this.currentQuestion.question, Style.information)
        // styledLogger(this.currentQuestion.answers[0].answer, Style.information)
    }

    private async startTimer(question: string) {

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

    private async chooseCategory() {
        this.currentCategory = null;
        this.music.src = "/music/jackbox/drawfuldecoy.mp3";
        this.music.play();
        this.displayObject.options = this.categories.slice(0, 4).map((category) => category.name);
        this.canvas.sendOptions(this.displayObject.options)
        this.categories = this.categories.slice(4)
        this.displayAnswers(true);
        while (!this.currentCategory) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        this.promts = shuffleArray(QuestionLoader.loadQuestion(this.currentCategory)
            .flatMap((question) => question.answers)
            .filter(answer => answer.drawAble)
            .map(answer => answer.answer));
        new MusicFader().fadeOut(this.music, 1000);
        await this.waitForSpace();
        this.displayAnswers(false);
    }

    private async selectCategory(input: string) {
        new Audio('music/div/spinresult.mp3').play();
        if (this.displayObject.options[0] === input) gsap.to('#blue', {x: 100, borderWidth: 20, ease: "back.inOut"})
        if (this.displayObject.options[1] === input) gsap.to('#orange', {x: 100, borderWidth: 20, ease: "back.inOut"})
        if (this.displayObject.options[2] === input) gsap.to('#green', {x: 100, borderWidth: 20, ease: "back.inOut"})
        if (this.displayObject.options[3] === input) gsap.to('#yellow', {x: 100, borderWidth: 20, ease: "back.inOut"})
        this.currentCategory = CategoryLoader.loadCategories(QuestionType.drawing).find((c) => c.name === input)!;
    }
}

