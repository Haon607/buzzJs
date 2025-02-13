import { Component, HostListener, OnDestroy } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { NgStyle } from "@angular/common";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../services/hue-light.service";
import gsap from "gsap";
import { ColorFader, countWithDelay, MusicFader, randomNumber, shuffleArray, Style, styledLogger } from "../../../../utils";
import { inputToColor } from "../../../../models";
import { Language, Musicloader, MusicQuestion } from "../../../../MusicLoader";

@Component({
    selector: 'app-text-aware',
    imports: [
        ScoreboardComponent,
        NgStyle
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
    spacePressed = false;
    music: HTMLAudioElement = new Audio();
    timerDone = false;
    amountOfQuestions = 5;
    maxTime = 30;
    possiblePoints = 0;
    barWidth = 50;
    private inputs: ButtonState[] = [];
    private excludedIds: number[] = [];
    private acceptInputsVar = false;
    private acceptColors = false;
    private isCorrect = false;

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

        //TODO +-

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
                active: false,
                square: undefined
            }
        }), false])

        gsap.set('#scoreboard', {x: 600})

        const away = {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"}
        gsap.set('#blue', away)
        gsap.set('#orange', away)
        gsap.set('#green', away)
        gsap.set('#yellow', away)
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
            gsap.to('#progress-bar', {y: 0, x: 0, rotationX: 0, rotate: 0, ease: 'back.inOut'})
        } else {
            gsap.to('#progress-bar', {y: -300, x: 0, rotationX: -45, rotate: 0, ease: "back.inOut"})
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
            await this.play();
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

    private async play() {
        gsap.to('#progress-bar', {borderColor: '#FFF'})
        gsap.to('#points', {borderColor: '#FFF'})
        this.acceptInputs(true)

        // this.displayObject.lyrics.map(lyric => lyric.text = "DAS IST HOFFENTLICH DREI ZEILEN LANG UND KEIN BISSCHEN KÜRZER, NUR SO FÜR TESTZWECKE UND SO")

        const maxPoints = this.possiblePoints;
        const lyricColor = randomNumber(1, 3);
        let lyricIndex = 0;
        let double = false;
        const loops = 20 /*250*/;
        for (let i = 0; i < loops; i++) {
            this.barWidth -= .2;
            if (i % 5 === 0) {
                this.barWidth = Number(this.barWidth.toFixed(0))
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            let bool = false;
            while (this.inputs.length > 0) {
                bool = !bool;
                await new Promise(resolve => setTimeout(resolve, 100));
                gsap.to('#points', {borderColor: bool ? inputToColor(0) : '#FFF', duration: 0.1})
            }
            if ((i === 0 || i % Math.floor(loops / this.displayObject.lyrics.length) === 0) && i != loops && lyricIndex < this.displayObject.lyrics.length) {
                await this.showNextLyric(lyricIndex, lyricColor);
                if (i !== 0) {
                    for (let o = 0; o < Math.floor((maxPoints - 10) / this.displayObject.lyrics.length); o++) {
                        if (double) countWithDelay(this.possiblePoints, this.possiblePoints-2, 100, value => this.possiblePoints = value)
                        else this.possiblePoints -= 1;
                        bool = !bool;
                        gsap.to('#points', {borderColor: bool ? inputToColor(2) : '#FFF', duration: 0.1})
                        await new Promise(resolve => setTimeout(resolve, 250));
                    }
                    double = false;
                } else {
                    double = true;
                }
                gsap.to('#points', {borderColor: '#FFF', duration: 0.1})
                lyricIndex++;
            }
        }
        countWithDelay(this.possiblePoints, 10, 50, value => this.possiblePoints = value)

        this.acceptInputs(false)

        gsap.to('#progress-bar', {borderColor: '#000'})
        gsap.to('#points', {borderColor: '#000'})

        await new Promise(resolve => setTimeout(resolve, 1000));
        this.barWidth = 50
        await this.showLyricsList(lyricColor);
        await this.displayAnswers(true);
        this.displayScoreboard(true);
        this.acceptColors = true
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.acceptInputs(true);
        const timerMusic = new Audio('music/buzz/BTV-BL_ATA_Clock.mp3');
        await this.waitForSpace();
        timerMusic.play();
        for (let i = 0; i < 24 && this.inputs.length < this.memory.players.length; i++) {
            this.barWidth -= 50/24;
                await new Promise(resolve => setTimeout(resolve, 500));
        }
        new MusicFader().fadeOut(timerMusic, 500)
        this.acceptInputs(false)
    }

    private async showNextLyric(lyricIndex: number, lyricColor: number) {
        gsap.set('#lyric-' + this.displayObject.lyrics[lyricIndex].trackId + '-' + this.displayObject.lyrics[lyricIndex].order, {y: 1000, opacity: 1})
        for (let o = lyricIndex; o >= 0; o--) {
            const lyric = this.displayObject.lyrics[lyricIndex - o];
            const elementId = `#lyric-${lyric.trackId}-${lyric.order}`;
            const isEven = o % 2 === 0;
            const xOffset = (o === 0 ? 0 : 450) * (isEven ? 1.1 : -1);
            const yOffset = 320 - (o * 200) - (o === 1 ? 100 : 0);
            const scaleValue = o === 0 ? 1 : 0.5;
            const bgColor = ColorFader.adjustBrightness(inputToColor(lyricColor) || '#FFF', o*-20);
            const borderColor = o === 0 ? '#FFF' : '#000';
            const opacityValue = o > 3 ? 0 : 1;
            const rotation = (o * 2) * (isEven ? 1 : -1);

            gsap.to(elementId, {
                x: xOffset,
                y: yOffset,
                scale: scaleValue,
                ease: 'back.inOut',
                background: bgColor,
                borderColor: borderColor,
                opacity: opacityValue,
                rotate: rotation
            });

            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    private async showLyricsList(lyricColor: number) {
        gsap.to('#progress-bar', {x: 350, y: 10, rotate: 2, ease: 'back.inOut'})
        // gsap.set('#lyric-' + this.displayObject.lyrics[lyricIndex].trackId + '-' + this.displayObject.lyrics[lyricIndex].order, {y: 1000, opacity: 1})
        for (let o = 0; o < this.displayObject.lyrics.length; o++) {
            const lyric = this.displayObject.lyrics[o];
            const elementId = `#lyric-${lyric.trackId}-${lyric.order}`;
            const xOffset = o > 5 ? 0 : -600
            const yOffset = -450 + ((o > 5 ? o -4 : o) * 110);
            const scaleValue = 0.3
            const bgColor = ColorFader.adjustBrightness(inputToColor(lyricColor) || '#FFFFFF', (this.displayObject.lyrics.length-o)*-5);
            const borderColor = ColorFader.adjustBrightness('#FFFFFF', (this.displayObject.lyrics.length-o)*-5);
            const opacityValue = 1;
            const rotation = 0;

            gsap.to(elementId, {
                x: xOffset,
                y: yOffset,
                scale: scaleValue,
                ease: 'back.inOut',
                background: bgColor,
                borderColor: borderColor,
                opacity: opacityValue,
                rotate: rotation
            });

            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    private onPress(buttonState: ButtonState) {
        if (this.acceptInputsVar && !this.acceptColors && !this.excludedIds.some(id => buttonState.controller === id) && buttonState.button === 0) {
            this.acceptInputs(false);
            this.inputs.push(buttonState);
            new Audio('music/wwds/einloggen.mp3').play();
        }
        if (this.acceptInputsVar && this.acceptColors && !this.excludedIds.some(id => buttonState.controller === id) && buttonState.button !== 0) {
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
        this.spacePressed = false
        while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
        this.spacePressed = false
    }

    private setupNextQuestion() {
        // this.timer.resetTimer();
        this.inputs = [];
        this.excludedIds = [];
        this.isCorrect = false
        this.acceptColors = false;
        this.allTracks = this.allTracks.slice(4, this.allTracks.length);
        const lyrics: { text: string, order: number, trackId: number }[] = [];
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

        this.calculatePossiblePoints();

        this.printQuestion()
    }

    private calculatePossiblePoints() {
        let pointsWorth = 50;
        const amountOfMusicsInList = Musicloader.loadMusic(this.memory.category!).length;

        if (amountOfMusicsInList < 50) pointsWorth -= 50 - amountOfMusicsInList;

        if (this.allTracks[0].information.releaseYear < 2000) pointsWorth += (2000 - this.allTracks[0].information.releaseYear) / 5;

        if (this.allTracks[0].information.language.includes(Language.other)) pointsWorth *= 2;

        countWithDelay(this.possiblePoints, Math.floor(pointsWorth), 10, value => this.possiblePoints = value);
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
