import { Component, HostListener, OnDestroy } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { NgStyle } from "@angular/common";
import { MemoryService } from "../../../services/memory.service";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../services/hue-light.service";
import gsap from "gsap";
import { ColorFader, countWithDelay, MusicFader, randomNumber, shuffleArray, Style, styledLogger } from "../../../../utils";
import { inputToColor } from "../../../../models";
import { Language, Musicloader, MusicQuestion } from "../../../../MusicLoader";
import { RoundInterface } from "../../../../round";

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
    private stoppBuzzFlash = false;

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        buzz.onPress(buttonState => this.onPress(buttonState));
        styledLogger(this.round.name, Style.speak)
        styledLogger(this.round.rules, Style.speak)
        this.setupWithDelay();
        this.allTracks = this.allTracks.concat(Musicloader.loadMusic(memory.category!));
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
        gsap.set('#progress-bar', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})
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
        this.music.src = "/music/div/generic beat.mp3";
        this.music.loop = true
        this.music.play()
        await new Promise(resolve => setTimeout(resolve, 500))
        for (let i = 0; i < this.amountOfQuestions; i++) {
            this.displayBar(true)
            await new Promise(resolve => setTimeout(resolve, 250));
            await this.setupNextQuestion()
            await this.waitForSpace();
            new MusicFader().fadeOut(this.music, 1000);
            this.displayScoreboard(false)
            new Audio('music/wwds/frage.mp3').play();
            await new Promise(resolve => setTimeout(resolve, 250));
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
            await this.play();
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
            styledLogger("Richtige Antwort: " + this.displayObject.answers.find(ans => ans.correct)?.answer, Style.information)
            await new Promise(resolve => setTimeout(resolve, 1000))
            if (!this.isCorrect && this.excludedIds.length < this.memory.players.length) {
                this.revealAnswers();
                await this.waitForSpace();
            }
            new Audio('music/wwds/richtig.mp3').play();
            this.revealCorrect();
            await new Promise(resolve => setTimeout(resolve, 500));
            this.flipToCorrect()
            const music = new Audio("musicround/" + this.allTracks[0].path)
            music.currentTime = this.allTracks[0].highlightFrom;
            music.play();
            await this.waitForSpace(true);
            if (i + 1 === this.amountOfQuestions) {
                new MusicFader().fadeOut(music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                this.memory.crossMusic.play()
            }
            this.flipToPoints()
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.collectPoints()
            this.displayBar(false)
            this.displayAnswers(false)
            await this.removeLyrics();
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.scoreboard.sortSubject.next();
            await new Promise(resolve => setTimeout(resolve, 1000));
            new MusicFader().fadeOut(music, 1000);
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
        const loops = 250 /*250*/;
        for (let i = 0; i < loops && !this.isCorrect && this.excludedIds.length < this.memory.players.length; i++) {
            this.barWidth -= .2;
            if (i % 5 === 0) {
                this.barWidth = Number(this.barWidth.toFixed(0))
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            let bool = false;
            while (this.inputs.length > 0 && !this.isCorrect) {
                bool = !bool;
                const states = new Array(4).fill(false);
                states[this.inputs[0].controller] = bool
                this.buzz.setLeds(states);
                gsap.to('#points', {borderColor: bool ? inputToColor(0) : '#FFF', duration: 0.1})
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            if ((i === 0 || i % Math.floor(loops / this.displayObject.lyrics.length) === 0) && i != loops && lyricIndex < this.displayObject.lyrics.length) {
                new Audio('music/div/bassjingle.mp3').play();
                await this.showNextLyric(lyricIndex, lyricColor);
                if (i !== 0) {
                    for (let o = 0; o < Math.floor((maxPoints - 10) / this.displayObject.lyrics.length); o++) {
                        if (double) {
                            this.possiblePoints -= 1
                            await new Promise(resolve => setTimeout(resolve, 50));
                        }
                        this.possiblePoints -= 1;
                        bool = !bool;
                        gsap.to('#points', {borderColor: bool ? inputToColor(2) : '#FFF', duration: 0.1})
                        await new Promise(resolve => setTimeout(resolve, 250));
                    }
                    double = false;
                } else {
                    double = true;
                }
                lyricIndex++;
            }
            gsap.to('#points', {borderColor: '#FFF', duration: 0.1})
        }
        this.acceptInputs(false)

        if (!this.isCorrect && this.excludedIds.length < this.memory.players.length) countWithDelay(this.possiblePoints, 10, 50, value => this.possiblePoints = value)

        gsap.to('#progress-bar', {borderColor: '#000'})
        gsap.to('#points', {borderColor: '#000'})

        await new Promise(resolve => setTimeout(resolve, 1000));
        this.barWidth = 50
        await this.showLyricsList(lyricColor);
        this.displayScoreboard(true);
        if (!this.isCorrect && this.excludedIds.length < this.memory.players.length) {
            await this.displayAnswers(true);
            this.acceptColors = true
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.acceptInputs(true);
            const timerMusic = new Audio('music/buzz/BTV-BL_ATA_Clock.mp3');
            await this.waitForSpace();
            timerMusic.play();
            for (let i = 0; i < 24 && this.inputs.length + this.excludedIds.length < this.memory.players.length; i++) {
                this.barWidth -= 50 / 24;
                for (let o = 0; o < this.displayObject.lyrics.length; o++) {
                    const lyric = this.displayObject.lyrics[o];
                    const elementId = `#lyric-${lyric.trackId}-${lyric.order}`;
                    const borderColor = ((i % 2 === 0 || o % 2 === 0) && !(i % 2 === 0 && o % 2 === 0)) ? '#FFF' : '#000'
                    gsap.to(elementId, {borderColor: borderColor});
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            new MusicFader().fadeOut(timerMusic, 500)
            this.acceptInputs(false)
            for (const lyric of this.displayObject.lyrics) {
                const elementId = `#lyric-${lyric.trackId}-${lyric.order}`;
                gsap.to(elementId, {borderColor: '#000'});
            }
        }
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
            const bgColor = ColorFader.adjustBrightness(inputToColor(lyricColor) || '#FFF', o * -20);
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
            const yOffset = -450 + ((o > 5 ? o - 4 : o) * 110);
            const scaleValue = 0.3
            const bgColor = ColorFader.adjustBrightness(inputToColor(lyricColor) || '#FFFFFF', (this.displayObject.lyrics.length - o) * -5);
            const borderColor = ColorFader.adjustBrightness('#FFFFFF', (this.displayObject.lyrics.length - o) * -5);
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
        if (this.acceptInputsVar && this.inputs.length === 0 && !this.acceptColors && !this.excludedIds.some(id => buttonState.controller === id) && buttonState.button === 0) {
            styledLogger("Buzzed: " + this.memory.players.find(player => player.controllerId === buttonState.controller)?.name, Style.speak)
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
                for (const id of this.excludedIds) {
                    states[id] = false;
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
                        perks: player.perks,
                        active: !this.inputs.some(input => input.controller === player.controllerId) && !this.excludedIds.some(id => id === player.controllerId)
                    }
                }), false])
            }
        }
    }

    private async waitForSpace(bounceLights = false) {
        styledLogger("Space zum weitermachen", Style.requiresInput)
        this.spacePressed = false

        async function bounceLyric(lyric: { text: string, order: number, trackId: number }) {
            gsap.to('#lyric-' + lyric.trackId + '-' + lyric.order, {borderColor: '#FFF'});
            await new Promise(resolve => setTimeout(resolve, 500));
            gsap.to('#lyric-' + lyric.trackId + '-' + lyric.order, {borderColor: '#000'});
        }

        let i = 0;
        const lyrics = shuffleArray(this.displayObject.lyrics.slice());
        const lights = shuffleArray(HueLightService.primary.concat(HueLightService.secondary));
        while (!this.spacePressed) {
            if (bounceLights) {
                this.hue.bounceLight([lights[i % lights.length]])
                bounceLyric(lyrics[i % lyrics.length]);
                i++;
            }
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        this.spacePressed = false
    }

    private setupNextQuestion() {
        // this.timer.resetTimer();
        this.inputs = [];
        this.excludedIds = [];
        this.isCorrect = false
        this.acceptColors = false;
        this.barWidth = 50
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

        if (this.allTracks[0].information.language.includes(Language.other)) pointsWorth *= 1.25;
        if (this.allTracks[0].information.language.includes(Language.other) && this.allTracks[0].information.language.length === 1) pointsWorth *= 2;

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
                states[player.controllerId] = !this.excludedIds.includes(player.controllerId);
            }
            this.buzz.setLeds(states);
            this.scoreboard.playerSubject.next([this.memory.players.map(player => {
                return {
                    name: player.name,
                    score: player.gameScore,
                    pointAward: undefined,
                    square: undefined,
                    perks: player.perks,
                    active: !this.excludedIds.includes(player.controllerId)
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
                    perks: player.perks,
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
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private revealCorrect() {
        if (this.isCorrect || this.excludedIds.length >= this.memory.players.length) {
            if (this.displayObject.answers[0].correct) gsap.to('#blue', {rotateY: 2, x: 30, ease: "back.inOut", duration: 0.5, borderWidth: 20})
            if (this.displayObject.answers[1].correct) gsap.to('#orange', {rotateY: 2, x: 30, ease: "back.inOut", duration: 0.5, borderWidth: 20})
            if (this.displayObject.answers[2].correct) gsap.to('#green', {rotateY: 2, x: 30, ease: "back.inOut", duration: 0.5, borderWidth: 20})
            if (this.displayObject.answers[3].correct) gsap.to('#yellow', {rotateY: 2, x: 30, ease: "back.inOut", duration: 0.5, borderWidth: 20})
        } else {
            if (this.displayObject.answers[0].correct) gsap.to('#blue', {duration: 0.5, borderWidth: 20})
            else gsap.to('#blue', {duration: 0.5, scale: 0.9});
            if (this.displayObject.answers[1].correct) gsap.to('#orange', {duration: 0.5, borderWidth: 20})
            else gsap.to('#orange', {duration: 0.5, scale: 0.9})
            if (this.displayObject.answers[2].correct) gsap.to('#green', {duration: 0.5, borderWidth: 20})
            else gsap.to('#green', {duration: 0.5, scale: 0.9})
            if (this.displayObject.answers[3].correct) gsap.to('#yellow', {duration: 0.5, borderWidth: 20})
            else gsap.to('#yellow', {duration: 0.5, scale: 0.9})
        }
    }

    private flipToCorrect() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            const correctInput = this.displayObject.answers.indexOf(this.displayObject.answers.find(ans => ans.correct)!);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: this.possiblePoints,
                square: input ? (this.isCorrect ? {
                    squareBackground: '#00000088',
                    squareBorder: '#00FF00',
                } : {
                    squareBackground: inputToColor(input.button),
                    squareBorder: input.button - 1 === correctInput ? '#00FF00' : '#FF0000',
                }) : undefined,
                perks: player.perks,
                active: false
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private flipToPoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            const correctInput = this.displayObject.answers.indexOf(this.displayObject.answers.find(ans => ans.correct)!);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: input?.button === correctInput + 1 || (this.isCorrect && input) ? {
                    squareBackground: '#00000080',
                    squareBorder: '#00FF00',
                    squareText: "+" + this.possiblePoints
                } : undefined,
                active: false,
                perks: player.perks,
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private async collectPoints() {
        const scoreboardPlayers: ScoreboardPlayer[] = [];
        const correctInput = this.displayObject.answers.indexOf(this.displayObject.answers.find(ans => ans.correct)!);
        this.memory.players.forEach((player) => {
            const input = this.inputs.find(input => input.controller === player.controllerId);
            scoreboardPlayers.push({
                name: player.name,
                score: player.gameScore,
                pointAward: input?.button === correctInput + 1 || (this.isCorrect && input) ? this.possiblePoints : 0,
                square: undefined,
                active: false,
                perks: player.perks,
            })
        })
        this.scoreboard.playerSubject.next([scoreboardPlayers, true])
    }

    private correct() {
        this.stoppBuzzFlash = true;
        this.isCorrect = true;
    }

    private async incorrect() {
        this.excludedIds.push(this.inputs[0].controller)
        this.stoppBuzzFlash = true;

        this.inputs = [];

        const states = new Array(4).fill(true);
        for (const id of this.excludedIds) {
            states[id] = false;
        }
        this.buzz.setLeds(states);
    }

    private async removeLyrics() {
        for (const lyric of this.displayObject.lyrics) {
            const elementId = `#lyric-${lyric.trackId}-${lyric.order}`;
            gsap.to(elementId, {x: -1500, ease: "back.inOut"});
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}
