import gsap from 'gsap';
import { Component, HostListener, OnDestroy, ViewChild } from "@angular/core";
import { ScoreboardComponent } from "../../../scoreboard/scoreboard.component";
import { NgClass, NgStyle } from "@angular/common";
import { TimerComponent } from "../../../timer/timer.component";
import { MemoryService } from "../../../../services/memory.service";
import { CategoryLoader, Question, QuestionLoader } from "../../../../../Loader";
import { ButtonState, BuzzDeviceService } from "../../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService, ScoreboardSquare } from "../../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../../services/hue-light.service";
import { MusicFader, randomNumber, shuffleArray, Style, styledLogger } from "../../../../../utils";
import { Player } from "../../../../../models";
import { RoundInterface } from "../../../../services/round";

@Component({
    selector: 'app-spotlight.round',
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
export class SpotlightRoundComponent implements OnDestroy {
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
    playerOrder: number[] = [];
    selectedPlayerAnswered = false;
    currentPlayer = NaN;
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    maxTime = 12.1;
    timerSound = true;
    monospaceQuestion = false;
    private doubtingPlayers: number[] = [];
    private acceptInputsVar = false;
    private pointsPerQuestion = 60;
    private currentPlayerMayAnswer = false;
    private revealongoing = false;
    private categorySelect = false;

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        buzz.onPress(buttonState => this.onPress(buttonState));
        this.setupWithDelay();
        this.startRound();
    }

    private async startRound() {
        this.music.src = "/music/buzz/bqw-on_the_spot.mp3";
        this.music.loop = true
        this.music.play()
        while (this.playerOrder.length < 4) {
            this.playerOrder = this.playerOrder.concat(shuffleArray(this.memory.players.map(player => player.controllerId)));
        }
        styledLogger("Reihenfolge:\n" + this.playerOrder.map(id => this.memory.players.find(player => player.controllerId === id)?.name).join(', '), Style.information)
        for (let i = 0; i < this.playerOrder.length; i++) {
            this.setupNextRound()
            this.hue.turnOff(HueLightService.secondary, 1000)
            await this.waitForSpace();
            await this.selectPlayer(i);
            await new Promise(resolve => setTimeout(resolve, 500));
            this.hue.turnOff(HueLightService.secondary, 0)
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.selectCategory();
            this.setupNextQuestion()
            await this.waitForSpace();
            new Audio('music/wwds/frage.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 250));
            this.displayQuestion(true)
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
            await this.awaitSelectedPlayerAnswer();
            this.displayTimer(true)
            styledLogger("Buzzern um zu behaupten Spieler liegt falsch", Style.speak)
            this.hue.setColor(HueLightService.secondary, '#FF0000', 1000, 50)
            await this.startTimer();
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
            styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
            this.spacePressed = false
            this.revealongoing = true
            this.flipToPossiblePoints()
            styledLogger("+ oder - zum Auflösen", Style.requiresInput)
            while (this.revealongoing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            this.displayTimer(false)
            this.displayQuestion(false)
            this.displayAnswer(false)
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.scoreboard.sortSubject.next();
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (i + 1 === this.playerOrder.length) {
                new MusicFader().fadeOut(this.music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                // this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
            }
        }
        await this.waitForSpace()
        gsap.to('#scoreboard', {x: 600})
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (this.buzz.emulate(event.key)) this.onPress(this.buzz.emulate(event.key)!);

        if (event.key === 'i') this.memory.print();

        if (event.key === 'r') this.setupNextQuestion();

        if (event.key === '+') this.reveal(true);
        if (event.key === '-') this.reveal(false);

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

    private displayAnswer(tf: boolean) {
        if (tf) {
            gsap.to('#answer', {rotateY: 2, x: 30, ease: "back.inOut"})
        } else {
            gsap.to('#answer', {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"})
        }
    }

    private async onPress(buttonState: ButtonState) {
        if (this.currentPlayer === buttonState.controller && buttonState.button === 0 && this.currentPlayerMayAnswer) {
            new Audio('music/div/nextplayer.mp3').play();
            this.selectedPlayerAnswered = true;
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: this.currentPlayer === player.controllerId ? {
                        squareBackground: '#00000088',
                        squareBorder: '#FFF'
                    } : undefined,
                    active: false
                }
            }), false])
        }
        if (this.currentPlayer === buttonState.controller && buttonState.button === 0 && this.categorySelect) {
            this.categorySelect = false;
        }
        if (this.currentPlayer !== buttonState.controller && buttonState.button === 0 && this.acceptInputsVar && !(this.doubtingPlayers.some(id => buttonState.controller === id))) {
            new Audio('music/wwds/einloggen.mp3').play();
            this.doubtingPlayers.push(buttonState.controller)
            const states = new Array(4).fill(false);
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                const square = this.getSquare(player)
                if (player.controllerId !== this.currentPlayer && square) square.squareText = "⚡";
                states[player.controllerId] = !this.doubtingPlayers.some(id => id === player.controllerId) && player.controllerId !== this.currentPlayer
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: square,
                    active: !this.doubtingPlayers.some(id => id === player.controllerId) && player.controllerId !== this.currentPlayer
                }
            }), false])
            this.buzz.setLeds(states);
        }
    }

    private async waitForSpace() {
        this.spacePressed = false;
        styledLogger("Space zum weitermachen", Style.requiresInput)
        while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
        this.spacePressed = false
    }

    private setupNextRound() {
        this.timer.resetTimer();
        this.categorySelect = false
        this.doubtingPlayers = []
        this.currentPlayer = NaN
        this.selectedPlayerAnswered = false
        this.questions = [{
            question: "", answers: [
                {answer: "", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false},
            ], shuffle: false
        }]
    }

    private setupNextQuestion() {
        this.questions = this.questions.slice(1, this.questions.length);
        this.currentQuestion = this.questions[0];
        if (this.currentQuestion.shuffle) this.currentQuestion.answers = shuffleArray(this.currentQuestion.answers);
        this.printQuestion()
    }

    private printQuestion() {
        styledLogger(this.currentQuestion.question, Style.speak)
        styledLogger(this.currentQuestion.answers[0].answer, Style.information)
    }

    private async startTimer() {
        this.timerDone = false;
        this.timer.startTimer(this.music)
        this.acceptInputs(true);

        while (!this.timerDone && this.doubtingPlayers.length < this.memory.players.length-1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.timer.stopTimer(this.music)
        this.acceptInputs(false)
    }

    private acceptInputs(tf: boolean) {
        this.acceptInputsVar = tf;
        if (tf) {
            const states = new Array(4).fill(false);
            for (const player of this.memory.players) {
                states[player.controllerId] = player.controllerId !== this.currentPlayer;
            }
            this.buzz.setLeds(states);
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: player.controllerId === this.currentPlayer ? {
                        squareBackground: '#00000088',
                        squareBorder: '#FFF'
                    } : undefined,
                    active: player.controllerId !== this.currentPlayer
                }
            }), false])
        } else {
            this.buzz.setLeds(new Array(4).fill(false))
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                const square = this.getSquare(player);
                if (player.controllerId !== this.currentPlayer && square) square.squareText = "⚡";
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: square,
                    active: false
                }
            }), false])
        }
    }

    private getSquare(player: Player, correct: boolean | undefined = undefined) {
        let square: ScoreboardSquare | undefined = undefined;
        if (this.currentPlayer === player.controllerId) square = {
            squareBackground: '#00000088',
            squareBorder: correct === undefined ? '#FFF' : (correct ? '#0F0' : '#F00')
        }
        if (this.doubtingPlayers.some(id => player.controllerId === id)) square = {
            squareBackground: this.round.secondary + '88',
            squareBorder: correct === undefined ? this.round.secondary : (correct ? '#F00' : '#0F0'),
        }
        return square;
    }

    private flipToPossiblePoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const square = this.getSquare(player)
            if (square) square.squareText = this.getPointsAtStake(this.currentPlayer === player.controllerId, this.doubtingPlayers.length)
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: square,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private flipToActualPoints(correct: boolean) {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const square = this.getSquare(player, correct)
            const points = this.getPoints(this.currentPlayer === player.controllerId, this.doubtingPlayers.length, correct)
            if (square) square.squareText = (points > 0 ? "+" : "") + points
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: square,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private getPointsAtStake(selectedPlayer: boolean, howManyDoubts: number) {
        if (selectedPlayer) {
            return (howManyDoubts > 0 ? "±" : "+") + this.pointsPerQuestion
        } else {
            return "±" + (this.pointsPerQuestion/howManyDoubts)
        }
    }

    private getPoints(selectedPlayer: boolean, howManyDoubts: number, selectedPlayerCorrect: boolean): number {
        if (selectedPlayer) {
            return selectedPlayerCorrect || howManyDoubts === 0 ? this.pointsPerQuestion : -this.pointsPerQuestion
        } else {
            return selectedPlayerCorrect ? -(this.pointsPerQuestion/howManyDoubts) : (this.pointsPerQuestion/howManyDoubts)
        }
    }

    private async collectPoints(correct: boolean) {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: this.getPoints(player.controllerId === this.currentPlayer, this.doubtingPlayers.length, correct),
                square: undefined,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private async selectPlayer(questionNumber: number) {
        const possible = this.memory.players.map(player => player.controllerId);
        const spinAmount = randomNumber(10,20);
        styledLogger("Nächster Spieler: " + this.memory.players.find(player => player.controllerId === this.playerOrder[questionNumber])?.name, Style.information)
        for (let i = 0; i < spinAmount; i++) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(i, 2)))
            new Audio('music/div/spin' + i % 4 + '.mp3').play();
            this.hue.setColor([HueLightService.secondary[i%HueLightService.secondary.length]], this.round.secondary, 0, 254)
            this.hue.turnOff([HueLightService.secondary[(i-1)%HueLightService.secondary.length]])

            const selected = i < spinAmount -1 ? shuffleArray(possible)[0] : this.playerOrder[questionNumber];

            const states = new Array(4).fill(false);
            states[selected] = true;
            this.buzz.setLeds(states);

            let scoreboardPlayers: ScoreboardPlayer[] = [];
            this.memory.players.forEach((player) => {
                scoreboardPlayers.push({
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: undefined,
                    active: player.controllerId === selected
                })
            })
            this.scoreboard.playerSubject.next([scoreboardPlayers, false])
            await new Promise(resolve => setTimeout(resolve, Math.max(Math.pow(i, 2), 100)))
            if (i < spinAmount-1) {
                this.buzz.setLeds(new Array(4).fill(false));

                scoreboardPlayers = [];
                this.memory.players.forEach((player) => {
                    scoreboardPlayers.push({
                        name: player.name,
                        score: player.gameScore,
                        pointAward: undefined,
                        square: undefined,
                        active: false
                    })
                })
                this.scoreboard.playerSubject.next([scoreboardPlayers, false])
            }
        }
        await new Audio('music/div/spinresult.mp3').play()
        this.currentPlayer = this.playerOrder[questionNumber]
    }

    private async awaitSelectedPlayerAnswer() {
        this.currentPlayerMayAnswer = true;
        styledLogger("Gewählter Spieler muss antwort sagen", Style.speak)
        styledLogger("Gewählter Spieler muss danach Buzzern", Style.requiresInput)
        while (!this.selectedPlayerAnswered) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        this.currentPlayerMayAnswer = false;
    }


    private async reveal(correct: boolean) {
        if (this.revealongoing) {
            new Audio('music/wwds/richtig.mp3').play();
            this.displayAnswer(true);
            this.flipToActualPoints(correct)
            await this.waitForSpace();
            this.revealongoing = false
            this.collectPoints(correct);
        }
    }

    private async selectCategory() {
        this.displayAnswer(true);
        this.categorySelect = true
        const categories = shuffleArray(CategoryLoader.loadCategories(this.round.questionType!)).slice(0,4);
        let i = 0
        for (; this.categorySelect; i++) {
            this.hue.setColor([HueLightService.secondary[i%HueLightService.secondary.length]], this.round.secondary, 0, 254)
            this.hue.turnOff([HueLightService.secondary[(i-1)%HueLightService.secondary.length]])
            const states = new Array(4).fill(false);
            states[this.currentPlayer] = i%2 === 0
            this.buzz.setLeds(states);
            this.currentQuestion.answers[0].answer = categories[i%categories.length].name;
            new Audio('music/div/spin' + i%4 + '.mp3').play();
            await new Promise(resolve => setTimeout(resolve, randomNumber(100,300)));
        }
        i-- //????
        this.categorySelect = false
        const states = new Array(4).fill(false);
        states[this.currentPlayer] = true
        this.buzz.setLeds(states);
        new Audio('music/div/spinresult.mp3').play();
        this.questions = this.questions.concat(QuestionLoader.loadQuestion(categories[i%categories.length]));
        styledLogger("Kategorie: " + categories[i%categories.length].name, Style.speak)
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.displayAnswer(false);
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
}
