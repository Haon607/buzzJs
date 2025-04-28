import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MemoryService } from "../../../services/memory.service";
import { Question, QuestionLoader } from "../../../../Loader";
import { TimerComponent } from "../../timer/timer.component";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../services/hue-light.service";
import gsap from "gsap";
import { ColorFader, countWithDelay, MusicFader, shuffleArray, Style, styledLogger } from "../../../../utils";
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { NgStyle } from "@angular/common";
import { inputToColor } from "../../../../models";
import { RoundInterface } from "../../../services/round";
import { Animate } from "../../../../Animate";

@Component({
    selector: 'app-streak.round',
    imports: [
        ScoreboardComponent,
        NgStyle,
        TimerComponent
    ],
    templateUrl: './streak.round.component.html',
    standalone: true,
    styleUrl: './streak.round.component.css'
})
/*TODO charging up takes long! (Firefox)*/
export class StreakRoundComponent implements OnDestroy {
    bgc: string;
    round: RoundInterface;
    currentQuestion: Question = {
        question: "", answers: [
            {answer: "", correct: true, drawAble: false}, {answer: "", correct: false, drawAble: false}, {answer: "", correct: false, drawAble: false}, {answer: "", correct: false, drawAble: false},
        ], shuffle: false
    };
    questions: Question[] = [this.currentQuestion];
    spacePressed = false;
    musics: HTMLAudioElement[] = new Array(5);
    timerDone = false;
    gotCorrect = false;
    streaks: { controller: number, step: number, timer: number, inactiveBackgroundColor: string, activeBackgroundColor: string }[] = []
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    private latestInput: ButtonState | null = null;
    private excludeIds: number[] = [];
    private acceptInputsVar = false;
    private stoppBuzzFlash = false

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        buzz.onPress(buttonState => this.onPress(buttonState));
        styledLogger(this.round.name, Style.speak)
        styledLogger(this.round.rules, Style.speak)
        this.setupWithDelay();
        this.questions = this.questions.concat(QuestionLoader.loadQuestion(memory.category!));
        this.startRound();
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (this.buzz.emulate(event.key)) this.onPress(this.buzz.emulate(event.key)!);

        if (event.key === 'i') this.memory.print();

        if (event.key === 'r') this.setupNextQuestion();
        if (event.key === 'd') this.displayQuestion(true);

        if (event.key === '+') this.correct();
        if (event.key === '-') this.incorrect();

        if (event.key === ' ') this.spacePressed = true;
    }

    ngOnDestroy(): void {
        this.buzz.removeAllListeners();
        this.memory.scoreboardKill.next()
    }

    onTimeExpired() {
        this.timerDone = true
    }

    stepToScore(step: number) {
        switch (step) {
            case 1:
                return 17;
            case 2:
                return 25;
            case 3:
                return 40;
            case 4:
                return 70;
        }
        return 10;
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
                perks: player.perks,
                playerColor: inputToColor(player.controllerId + 1)
            }
        }), false])

        gsap.set('#scoreboard', {x: 600})

        gsap.set('#answer', {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"})
        gsap.set('#question', {y: -600, rotationX: -45, opacity: 1, ease: "back.inOut"})
        gsap.set('#timer', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})

        for (let i = 0; i < this.musics.length; i++) {
            this.musics[i] = new Audio();
            this.musics[i].src = "/music/smo/World Selection " + (i + 1) + " Super Mario Odyssey OST.mp3"
            this.musics[i].load();
            this.musics[i].volume = 0;
        }

        this.streaks = this.memory.players.map(player => {
            return {
                controller: player.controllerId,
                step: 0,
                timer: 0,
                inactiveBackgroundColor: inputToColor(player.controllerId + 1)! + '88',
                activeBackgroundColor: inputToColor(player.controllerId + 1)!,
            }
        })
        await new Promise(resolve => setTimeout(resolve, 100));

        this.streaks.forEach(streak =>
            gsap.set('#streak-' + streak.controller, {x: -1500, opacity: 1})
        )

        new Promise(resolve => setTimeout(resolve, 750));

        this.streaks.forEach(streak =>
            gsap.to('#streak-' + streak.controller, {x: 0, rotateY: 2, ease: 'back.out'})
        )

        gsap.to('#scoreboard', {x: 0, ease: 'bounce'})

        // this.displayAnswer(true)
        // this.displayQuestion(true)
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

    private async displayAnswer(tf: boolean) {
        if (tf) {
            gsap.to('#answer', {rotateY: 2, x: 30, ease: "back.inOut"})
        } else {
            gsap.to('#answer', {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"})
        }
    }

    private async startRound() {
        const initMusic = new Audio("/music/mp/smpj-dc2.mp3");
        initMusic.play()
        await this.waitForSpace();
        this.displayTimer(true);
        // initMusic.pause()
        new MusicFader().fadeOut(initMusic, 1000);
        await new Animate(this.hue).gameOn(this.round.primary, this.round.secondary, ColorFader.adjustBrightness('#888888', -50), ColorFader.adjustBrightness('#888888', -50));
        await new Promise(resolve => setTimeout(resolve, 500));
        for (let i = 0; i < this.musics.length; i++) {
            this.musics[i].play();
        }
        this.musics[0].volume = 1;
        for (let i = 0; !this.timerDone; i++) {
            this.careAboutStreaks();
            this.setupNextQuestion()
            new Audio('music/wwds/frage.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 250));
            await this.startInputs();
            new Audio('music/wwds/richtig.mp3').play();
            this.displayAnswer(true);
            if (this.timerDone) {
                this.musics.forEach(music => new MusicFader().fadeOut(music, 1000))
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                // this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
                await this.waitForSpace();
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            this.flipToPoints()
            await this.waitForSpace();
            await this.collectPoints()
            this.displayQuestion(false)
            this.displayAnswer(false)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.displayTimer(false)
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.scoreboard.sortSubject.next();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.waitForSpace()
        gsap.to('#scoreboard', {x: 600})
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
    }

    private async onPress(buttonState: ButtonState) {
        if (this.acceptInputsVar && buttonState.button === 0) {
            if (!this.latestInput && !this.excludeIds.includes(buttonState.controller)) {
                this.latestInput = buttonState;
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
        this.questions = this.questions.slice(1, this.questions.length);
        this.currentQuestion = this.questions[0];
        if (this.currentQuestion.shuffle) this.currentQuestion.answers = shuffleArray(this.currentQuestion.answers);
        this.printQuestion()
    }

    private printQuestion() {
        styledLogger(this.currentQuestion.question, Style.speak)
        styledLogger(this.currentQuestion.answers[0].answer, Style.information)
    }

    private async startInputs() {
        this.timerDone = false;
        this.acceptInputs(true);
        this.timer.startTimer()
        while (!this.timerDone && !this.gotCorrect && this.excludeIds.length < this.memory.players.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
            this.streaks.forEach(streak => {
                if (streak.step > 0 && streak.timer > 0) {
                    streak.timer -= 1;
                }
            })
            if (this.timer.remainingTime < 30) this.displayTimer(true)
        }
        this.timer.stopTimer()
        this.displayQuestion(true)
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
                    squareText: "+" + this.stepToScore(this.streaks.find(streak => streak.controller === player.controllerId)!.step)
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
                pointAward: this.latestInput?.controller === player.controllerId ? this.stepToScore(this.streaks.find(streak => streak.controller === player.controllerId)!.step) : undefined,
                square: undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])

        if (this.latestInput !== null) {
            let wasNotOn4 = false
            if (this.streaks.find(streak => streak.controller === this.latestInput!.controller)!.step < 4) {
                wasNotOn4 = true;
                this.streaks.find(streak => streak.controller === this.latestInput!.controller)!.step++
            }
            await countWithDelay(wasNotOn4 ? 0 : this.streaks.find(streak => streak.controller === this.latestInput!.controller)!.timer, 300, 1, value => this.streaks.find(streak => streak.controller === this.latestInput!.controller)!.timer = value);
        }
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

        this.streaks.find(streak => streak.controller === this.latestInput!.controller)!.timer = 0

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

    private async switchAudioStages(stage: number) {
        const index = this.musics.indexOf(this.musics.find(music => music.volume > 0.1)!);
        this.hue.setColor(HueLightService.primary, ColorFader.adjustBrightness(stage > 0 ? this.round.primary : '#888888', -50 + (20 * stage)), 500)
        this.hue.setColor(HueLightService.secondary, ColorFader.adjustBrightness(stage > 0 ? this.round.secondary : '#888888', -50 + (20 * stage)), 500)
        new ColorFader().fadeColor(this.bgc, stage === 0 ? this.round.background : ColorFader.adjustBrightness(this.round.primary, -100 + (15 * stage)), 500, value => this.bgc = value);
        if (index !== stage) {
            for (let i = 1; i <= 10; i++) {
                this.musics[stage].volume = i / 10;
                this.musics[index].volume = 1 - (i / 10);
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        }
    }

    private async careAboutStreaks() {
        let maxStep = 0;
        this.streaks.forEach(streak => {
            if (streak.step !== 0 && streak.timer === 0) {
                streak.step--;
                if (streak.step > 0) {
                    streak.timer = 300;
                }
            }

            for (let i = 1; i < 5; i++) {
                gsap.to('#streak-step-' + streak.controller + '-' + i, {borderColor: streak.step === i ? '#FFF' : '#000'});
            }

            maxStep = Math.max(maxStep, streak.step)
        })
        this.switchAudioStages(maxStep);
    }
}
