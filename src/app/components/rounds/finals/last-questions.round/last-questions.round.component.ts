import { Component, HostListener, ViewChild } from '@angular/core';
import { ScoreboardComponent } from "../../../scoreboard/scoreboard.component";
import { NgClass, NgStyle } from "@angular/common";
import { RoundInterface } from "../../../../services/round";
import { Category, CategoryLoader, Question, QuestionLoader, QuestionType } from "../../../../../Loader";
import { TimerComponent } from "../../../timer/timer.component";
import { ButtonState, BuzzDeviceService } from "../../../../services/buzz-device.service";
import { MemoryService } from "../../../../services/memory.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../../services/hue-light.service";
import gsap from "gsap";
import { ColorFader, MusicFader, shuffleArray, Style, styledLogger } from "../../../../../utils";
import { inputToColor } from "../../../../../models";

@Component({
    selector: 'app-last-questions.round',
    imports: [ScoreboardComponent, NgStyle, TimerComponent, NgClass],
    templateUrl: './last-questions.round.component.html',
    standalone: true,
    styleUrl: './last-questions.round.component.css'
})
export class LastQuestionsRoundComponent {
    bgc: string;
    round: RoundInterface;
    currentQuestion: Question = {
        question: "", answers: [
            {answer: "", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false},
        ], shuffle: false
    };
    openCategories: Category[] = [];
    multipleCategories: Category[] = [];
    questions: Question[] = [this.currentQuestion];
    spacePressed = false;
    music: HTMLAudioElement = new Audio();
    timerDone = false;
    amountOfQuestions = 1 /*10 TODO*/;
    buzzerQuestion = false;
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    private inputs: ButtonState[] = [];
    private acceptInputsVar = false;
    banner: { questionNumber: number, isBuzzer: boolean, categoryName: string } =
        { questionNumber: NaN, categoryName: "", isBuzzer: false };

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        buzz.onPress(buttonState => this.onPress(buttonState));
        this.setupWithDelay();
        this.openCategories = CategoryLoader.loadCategories(QuestionType.openEnded)
        this.multipleCategories = CategoryLoader.loadCategories(QuestionType.multipleChoice)
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
                square: undefined,
                playerPercent: 0,
                perks: player.perks
            }
        }), false])

        gsap.set('#scoreboard', {x: 600})

        const away = {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"}
        gsap.set('#blue', away)
        gsap.set('#orange', away)
        gsap.set('#green', away)
        gsap.set('#yellow', away)
        gsap.set('#question', {y: -600, rotationX: -45, opacity: 1, ease: "back.inOut"})
        gsap.set('#timer', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})

        this.hideBanner();
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
        this.music.src = "/music/wwds/masterfragebgm.mp3";
        this.music.loop = true
        // await this.waitForSpace();
        await this.waitForSpace();
        for (let i = 0; i < this.amountOfQuestions; i++) {
            await this.introduceQuestion(i);
            new Audio('music/wwds/frage.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 250));
            this.displayQuestion(true)
            this.hue.setColor(HueLightService.secondary, this.buzzerQuestion ? this.round.primary : this.round.secondary, 1000, 50)
            this.hue.setColor(HueLightService.primary, this.buzzerQuestion ? this.round.secondary : this.round.primary, 100, 255)
            await new Promise(resolve => setTimeout(resolve, 500));
            this.music.play()
            if (!this.buzzerQuestion) {
                await this.waitForSpace()
                this.displayAnswers(true)
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            this.displayTimer(true)
            await this.waitForSpace()
            await this.startTimer();
            this.hue.setColor(HueLightService.secondary, this.buzzerQuestion ? this.round.primary : this.round.secondary, 1000, 254)
            styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
            await new Promise(resolve => setTimeout(resolve, 1000))
            this.revealAnswers();
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
        this.router.navigateByUrl("scoreboard/final/" + this.bgc.slice(1, this.bgc.length));
    }

    private onPress(buttonState: ButtonState) {
        if (this.acceptInputsVar && buttonState.button !== 0) {
            if (!this.inputs.some(input => input.controller === buttonState.controller)) {
                this.inputs.push(buttonState);
                new Audio('music/wwds/einloggen.mp3').play();
                const states = new Array(4).fill(true);
                for (const input of this.inputs) {
                    states[input.controller] = false;
                }
                this.buzz.setLeds(states);
                this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                    return {
                        name: player.name,
                        score: player.gameScore,
                        playerPercent: player.finalPercentage,
                        pointAward: undefined,
                        square: this.inputs.some(input => input.controller === player.controllerId) ? {
                            squareBackground: '#00000000',
                            squareBorder: '#FFF'
                        } : undefined,
                        active: !this.inputs.some(input => input.controller === player.controllerId),
                        perks: player.perks
                    }
                }), false])
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
        this.inputs = [];
        this.questions = this.questions.slice(1, this.questions.length);
        this.currentQuestion = this.questions[0];
        if (this.buzzerQuestion) {
            this.currentQuestion.answers[2] = this.currentQuestion.answers[0];
            this.currentQuestion.answers[2].correct = true;
            this.currentQuestion.answers[0] = {answer: "", correct: false};
            this.currentQuestion.answers[1] = {answer: "", correct: false};
            this.currentQuestion.answers[3] = {answer: "", correct: false};
        }
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
        this.timer.startTimer(this.music)
        this.acceptInputs(true);
        while (!this.timerDone && this.inputs.length < this.memory.players.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
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
                    active: true,
                    playerPercent: player.finalPercentage,
                    perks: player.perks
                }
            }), false])
        } else {
            this.buzz.setLeds(new Array(4).fill(false))
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    playerPercent: player.finalPercentage,
                    square: this.inputs.some(input => input.controller === player.controllerId) ? {
                        squareBackground: '#00000000',
                        squareBorder: '#FFF'
                    } : undefined,
                    active: false,
                    perks: player.perks
                }
            }), false])
        }
    }

    private revealAnswers() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                playerPercent: player.finalPercentage,
                pointAward: undefined,
                square: input ? {
                    squareBackground: inputToColor(input.button) + '80',
                    squareBorder: inputToColor(input.button)
                } : undefined,
                active: false,
                perks: player.perks
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private revealCorrect() {
        if (this.currentQuestion.answers[0].correct && !this.buzzerQuestion) gsap.to('#blue', {duration: 0.5, borderWidth: 20})
        else gsap.to('#blue', {duration: 0.5, scale: 0.9});
        if (this.currentQuestion.answers[1].correct && !this.buzzerQuestion) gsap.to('#orange', {duration: 0.5, borderWidth: 20})
        else gsap.to('#orange', {duration: 0.5, scale: 0.9})
        if (this.currentQuestion.answers[2].correct || this.buzzerQuestion) gsap.to('#green', {duration: 0.5, borderWidth: 20})
        else gsap.to('#green', {duration: 0.5, scale: 0.9})
        if (this.currentQuestion.answers[3].correct && !this.buzzerQuestion) gsap.to('#yellow', {duration: 0.5, borderWidth: 20})
        else gsap.to('#yellow', {duration: 0.5, scale: 0.9})
        if (this.buzzerQuestion) gsap.to('#green', {rotateY: 2, x: 30, ease: "back.inOut"})
    }

    private flipToCorrect() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            const correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                playerPercent: player.finalPercentage,
                pointAward: undefined,
                square: input ? {
                    squareBackground: inputToColor(input.button),
                    squareBorder: input.button - 1 === correctInput ? '#00FF00' : '#FF0000',
                } : undefined,
                active: false,
                perks: player.perks
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private flipToPoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            const correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                playerPercent: player.finalPercentage,
                pointAward: undefined,
                square: input?.button === correctInput + 1 ? {
                    squareBackground: '#00000080',
                    squareBorder: '#00FF00',
                    squareText: "+10%"
                } : undefined,
                active: false,
                perks: player.perks
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private async collectPoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        const correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: 0,
                square: undefined,
                active: false,
                playerPercent: player.finalPercentage + (input?.button === correctInput + 1 ? 10 : 0),
                perks: player.perks
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private async introduceQuestion(questionNumber: number) {
        this.buzzerQuestion = questionNumber % 2 === 0;
        const category = this.buzzerQuestion ? this.openCategories[questionNumber] : this.multipleCategories[questionNumber]
        this.questions = [this.currentQuestion]
        this.questions = this.questions.concat(QuestionLoader.loadQuestion(category));
        this.banner = {questionNumber: questionNumber+1, isBuzzer: this.buzzerQuestion, categoryName: category.name}
        await this.animateBanner();
        this.setupNextQuestion();
        await this.waitForSpace();
        this.hideBanner();
    }

    private async animateBanner() {
        new Audio('/music/div/last10banner.mp3').play()
        await new Promise(resolve => setTimeout(resolve, 0));
//go
        this.hue.setColor(HueLightService.secondary, this.buzzerQuestion ? this.round.primary : this.round.secondary, 1000, 255)
        this.hue.setColor(HueLightService.primary, this.buzzerQuestion ? this.round.secondary : this.round.primary, 1000, 255)
        new ColorFader().fadeColor(this.bgc, this.buzzerQuestion ? '#414136' : this.round.background, 1000, value => this.bgc = value)

        gsap.to('#banner', {duration: 0.3, scale: 1, autoAlpha: 1, x: 0})
        gsap.to('#banner-question-number', {rotation: 0, scale: 1})
        await new Promise(resolve => setTimeout(resolve, 381));
//break
        gsap.to('#banner-category-name', {autoAlpha: 1, x: 0, duration: 0.2, ease: 'back.out'})
        await new Promise(resolve => setTimeout(resolve, 445));
//slice
    }

    private async hideBanner() {
        gsap.to('#banner', {duration: 0.5, scale: 0.5, autoAlpha: 0, x: -2000})
        await new Promise(resolve => setTimeout(resolve, 1000));
        //reset
        gsap.set('#banner', {scale: 0.5, autoAlpha: 0, x: 2000})
        gsap.set('#banner-category-name', {autoAlpha: 0, x: 2000})
        gsap.set('#banner-question-number', {rotation: 270, scale: 2, opacity: 1})

    }
}
