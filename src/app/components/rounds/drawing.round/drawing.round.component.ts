import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ScoreboardComponent } from "../../embettables/scoreboard/scoreboard.component";
import { TimerComponent } from "../../embettables/timer/timer.component";
import { MemoryService } from "../../../services/memory.service";
import { Category, CategoryLoader, QuestionLoader, QuestionType } from "../../../../Loader";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../services/hue-light.service";
import gsap from "gsap";
import { ColorFader, getRandomWeightedItem, MusicFader, shuffleArray, Style, styledLogger } from "../../../../utils";
import { NgStyle } from "@angular/common";
import { RoundInterface } from "../../../../round";
import { CanvasMirrorComponent } from "../../embettables/canvas-mirror/canvas-mirror.component";
import { Animate } from "../../../../Animate";
import { Player } from "../../../../models";
import { ProgressbarComponent } from "../../embettables/progressbar/progressbar.component";

@Component({
    selector: 'app-drawing.round',
    imports: [
        ScoreboardComponent,
        NgStyle,
        CanvasMirrorComponent,
        ProgressbarComponent
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
    drawingMusic: HTMLAudioElement = new Audio('music/jackbox/drawfuldraw.mp3');
    gotCorrect = false;
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    @ViewChild(CanvasMirrorComponent) canvas: CanvasMirrorComponent = new CanvasMirrorComponent();
    displayObject: { options: string[], answer: string } = {options: [], answer: ""};
    currentCategory: Category | null = null;
    progressBar: { percent: number, text: string } = {percent: 0, text: '3:00'};
    private drawingPlayer: Player;
    private latestInput: number | null = null;
    private excludeIds: number[] = [];
    private acceptInputsVar = false;
    private stoppBuzzFlash = false
    private promts: string[] = [];
    private colorRotation = ['#88FF88', '#FF8888', '#8888FF'] //Backround, Primary, Secondary
    private colorRotationInProgress = false;
    private amountCorrect: number = 0;

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        this.categories = CategoryLoader.loadCategories(this.round.questionType!)
        buzz.onPress(buttonState => this.onPress(buttonState));
        styledLogger(this.round.name, Style.speak)
        styledLogger(this.round.rules, Style.speak)
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
        gsap.set('#canvas', {x: -2000, scale: 1, autoAlpha: 1})
        gsap.set('.option', {rotateY: 88, x: -1150, opacity: 1})
        gsap.set('#progress-bar', {y: -300, rotationX: -45, rotationY: -2, opacity: 1})

        await new Promise(resolve => setTimeout(resolve, 650));
        this.canvas.input.subscribe(input => this.selectCategory(input));
        this.canvas.done.subscribe(() => new MusicFader().fadeOut(this.drawingMusic, 500));

        setInterval(() => {
            this.progressBar.percent = this.getPlayedTrackInPercent()
            const secondsLeft = Math.floor(this.drawingMusic.duration - this.drawingMusic.currentTime);
            this.progressBar.text = Math.floor(secondsLeft / 60) + ":" + String(secondsLeft % 60).padStart(2, '0');
        }, 100)

        await new Promise(resolve => setTimeout(resolve, 100));
        gsap.to('#scoreboard', {x: 0, ease: 'bounce'})
    }

    private displayBar(tf: boolean) {
        if (tf) {
            gsap.to('#progress-bar', {y: 0, rotationX: 0, ease: 'back.inOut'})
        } else {
            gsap.to('#progress-bar', {y: -300, rotationX: -45, ease: "back.inOut"})
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
        const initMusic = new Audio("/music/mp/smpj-dc2.mp3");
        initMusic.play()
        do {
            await new Promise(resolve => setTimeout(resolve, 500));
            styledLogger("Initialize Drawing tablet", Style.requiresInput)
            this.canvas.sendClear()
        } while (!this.canvas.lastUpdate);
        this.setCanvasColor(CanvasMirrorComponent.baseBorderColor);
        gsap.to('#canvas', {x: 0, ease: 'bounce'})
        await this.waitForSpace();
        new MusicFader().fadeOut(initMusic, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        await this.roundStartAnimation();
        await this.chooseCategory()
        this.drawingMusic.play()

        let colorInterval = setInterval(() => {
            this.rotateColors(10000)
        }, 12500)

        for (let i = 0; !this.drawingMusic.ended; i++) {
            if (!this.promts[1]) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.drawingMusic.pause()
                await this.chooseCategory()
            }
            this.setupNextQuestion();
            this.acceptInputs(true)
            do {
                await new Promise(resolve => setTimeout(resolve, 100));
            } while (!this.drawingMusic.paused && !this.gotCorrect && this.excludeIds.length < this.memory.players.length);
            if (this.drawingMusic.ended) {
                this.canvas.sendDone();
            }
            this.acceptInputsVar = false
            if (!this.gotCorrect) {
                this.music.src = "/music/jackbox/drawfulreveal.mp3";
                this.music.play();
            }
            while (this.latestInput !== null && !this.gotCorrect) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            while (!this.gotCorrect && this.excludeIds.length < this.memory.players.length) {
                await this.playerAnswer(this.getPlayerToForceAnswer());
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            this.displayAnswer(true)
            if (this.gotCorrect) {
                if (this.drawingMusic.ended) {
                    new MusicFader().fadeOut(this.music, 1000)
                    await new Promise(resolve => setTimeout(resolve, 500));
                    this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                    this.memory.crossMusic.play()
                }
                this.flipToPoints();
                await new Promise(resolve => setTimeout(resolve, 3000));
                this.collectPoints();
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.scoreboard.sortSubject.next();
                this.amountCorrect++;
            } else {
                if (this.drawingMusic.ended) {
                    new MusicFader().fadeOut(this.music, 1000)
                    await new Promise(resolve => setTimeout(resolve, 500));
                    this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                    this.memory.crossMusic.play()
                }
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            this.setCanvasColor(CanvasMirrorComponent.baseBorderColor);
            this.displayAnswer(false)
            new MusicFader().fadeOut(this.music, 1000);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        await this.waitForSpace();
        this.displayBar(false);
        let points = 0;
        for (let i = 0; i <= this.amountCorrect; i++) {
            points += (10 * ((i/10) +1))
        }
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: player.controllerId === this.drawingPlayer.controllerId ? {
                    squareBackground: '#00000080',
                    squareBorder: '#00FF00',
                    squareText: this.amountCorrect + " Beg. +" + points + " Pkt"
                } : undefined,
                perks: player.perks,
                active: false
            }
        }), false])
        await this.waitForSpace();
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: player.controllerId === this.drawingPlayer.controllerId ? points : undefined,
                square: undefined,
                perks: player.perks,
                active: false
            }
        }), true])
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.scoreboard.sortSubject.next();
        await this.waitForSpace();
        clearInterval(colorInterval)
        gsap.to('#canvas', {x: -2000})
        gsap.to('#scoreboard', {x: 600})
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
    }

    private async roundStartAnimation() {
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: undefined,
                perks: player.perks,
                active: true
            }
        }), true])
        new ColorFader().fadeColor(this.bgc, ColorFader.adjustBrightness(this.bgc, -50), 300, color => this.bgc = color);
        await new Animate(this.hue, this.buzz).gameOn(this.round.primary, '#404040', this.round.secondary, this.round.primary);
        new ColorFader().fadeColor(this.bgc, this.round.background, 300, color => this.bgc = color);
        this.displayBar(true)
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
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    private async onPress(buttonState: ButtonState) {
        if (this.acceptInputsVar && buttonState.button === 0) {
            if (!this.latestInput && !this.excludeIds.includes(buttonState.controller)) {
                this.playerAnswer(buttonState.controller)
            }
        }
    }

    private async flashBuzzer(controller: number) {
        const states = new Array(4).fill(false);
        while (!this.stoppBuzzFlash) {
            states[controller] = !states[controller];
            this.buzz.setLeds(states);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.stoppBuzzFlash = false;
    }

    private async waitForSpace() {
        styledLogger("Space zum weitermachen", Style.requiresInput)
        this.spacePressed = false
        while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
        this.spacePressed = false
    }

    private setupNextQuestion() {
        this.latestInput = null;
        this.excludeIds = [this.drawingPlayer.controllerId];
        this.gotCorrect = false;
        this.promts = this.promts.slice(1);
        this.displayObject.answer = this.promts[0];
        this.canvas.sendClear();
        this.printPromt();
        this.canvas.sendMessage(this.promts[0]);
        this.drawingMusic.play()
    }

    private printPromt() {
        styledLogger(this.currentCategory?.name!, Style.information)
        styledLogger(this.promts[0], Style.highlightInformation)
    }

    private acceptInputs(tf: boolean) {
        this.acceptInputsVar = tf;
        if (tf) {
            const states = new Array(4).fill(false);
            for (const player of this.memory.players.filter(player => player.controllerId !== this.drawingPlayer.controllerId)) {
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
                    active: player.controllerId !== this.drawingPlayer.controllerId
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
                square: this.latestInput === player.controllerId ? {
                    squareBackground: '#00000080',
                    squareBorder: '#00FF00',
                    squareText: "+" + 40
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
                pointAward: this.latestInput === player.controllerId ? 40 : undefined,
                square: undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private correct() {
        this.gotCorrect = true;
        this.setCanvasColor('#00FF00');

        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: this.latestInput === player.controllerId ? {
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
        this.excludeIds.push(this.latestInput!)
        this.setCanvasColor('#FF0000');

        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: this.latestInput === player.controllerId ? {
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
        this.setCanvasColor(CanvasMirrorComponent.baseBorderColor);
    }

    private async chooseCategory() {
        this.currentCategory = null;
        this.music.src = "/music/jackbox/drawfuldecoy.mp3";
        this.music.play();
        this.setCanvasColor('#F86613');
        this.displayObject.options = this.categories.slice(0, 4).map((category) => category.name);
        styledLogger("Kategoriewahl", Style.speak)
        styledLogger(this.displayObject.options.join(", "), Style.speak)
        this.canvas.sendOptions(this.displayObject.options)
        this.displayAnswers(true);
        while (!this.currentCategory) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        this.promts = shuffleArray(QuestionLoader.loadQuestion(this.currentCategory)
            .flatMap((question) => question.answers)
            .filter(answer => answer.drawAble)
            .map(answer => answer.answer));
        new MusicFader().fadeOut(this.music, 1000);
        this.categories = shuffleArray(this.categories.filter(category => category.name !== this.currentCategory!.name));
        await this.waitForSpace();
        this.setCanvasColor(CanvasMirrorComponent.baseBorderColor);
        this.displayAnswers(false);
    }

    private async selectCategory(input: string) {
        styledLogger(input, Style.speak)
        new Audio('music/div/spinresult.mp3').play();
        // this.rotateColors(1000)
        if (this.displayObject.options[0] === input) gsap.to('#blue', {x: 100, borderWidth: 20, ease: "back.inOut"})
        if (this.displayObject.options[1] === input) gsap.to('#orange', {x: 100, borderWidth: 20, ease: "back.inOut"})
        if (this.displayObject.options[2] === input) gsap.to('#green', {x: 100, borderWidth: 20, ease: "back.inOut"})
        if (this.displayObject.options[3] === input) gsap.to('#yellow', {x: 100, borderWidth: 20, ease: "back.inOut"})
        this.currentCategory = CategoryLoader.loadCategories(QuestionType.drawing).find((c) => c.name === input)!;
    }

    private async rotateColors(time: number) {
        while (this.colorRotationInProgress) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        this.colorRotationInProgress = true;
        const temp = this.colorRotation[0];
        this.colorRotation[0] = this.colorRotation[1];
        this.colorRotation[1] = this.colorRotation[2];
        this.colorRotation[2] = temp;
        new ColorFader().fadeColor(this.bgc, this.colorRotation[0], time, (color) => this.bgc = color);
        this.hue.setColor(HueLightService.primary, this.colorRotation[1], time)
        this.hue.setColor(HueLightService.secondary, this.colorRotation[2], time)
        await new Promise(resolve => setTimeout(resolve, time * 1.05))
        this.colorRotationInProgress = false;
    }

    private getPlayedTrackInPercent(): number {
        return (this.drawingMusic.currentTime / this.drawingMusic.duration) * 100
    }

    private async playerAnswer(player: number) {
        new Audio('music/wwds/einloggen.mp3').play();
        styledLogger("Antwort von: " + this.memory.players.filter(mPlayer => mPlayer.controllerId === player)[0].name, Style.speak);
        this.latestInput = player;
        this.flashBuzzer(player);
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: this.latestInput === player.controllerId ? {
                    squareBackground: '#FF000088',
                    squareBorder: '#FFF'
                } : undefined,
                perks: player.perks,
                active: this.latestInput === player.controllerId
            }
        }), false])
        do {
            await new Promise(resolve => setTimeout(resolve, 100));
        } while (this.latestInput !== null && !this.gotCorrect) //0 === null
        this.stoppBuzzFlash = true;
        await new Promise(resolve => setTimeout(resolve, 100));

        const states = new Array(4).fill(true);
        for (const id of this.excludeIds) {
            states[id] = false;
        }
        this.buzz.setLeds(states);

        if (this.gotCorrect) return;

        const scoreboardPlayers: ScoreboardPlayer[] = [];
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

    private getPlayerToForceAnswer() {
        const players = this.memory.players.filter(player => player.controllerId !== this.drawingPlayer.controllerId).filter(player => !this.excludeIds.includes(player.controllerId));
        const highestScore = players.sort((a, b) => a.gameScore - b.gameScore)[players.length - 1].gameScore;
        return getRandomWeightedItem(players.map(player => {
            return {item: player.controllerId, weight: Math.max(highestScore - player.gameScore, 1)}
        }));
    }

    private setCanvasColor(color: string) {
        this.canvas.setColor(color)
    }
}
