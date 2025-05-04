import gsap from 'gsap';
import { Component, HostListener, OnDestroy, ViewChild } from "@angular/core";
import { ScoreboardComponent } from "../../embettables/scoreboard/scoreboard.component";
import { NgStyle } from "@angular/common";
import { TimerComponent } from "../../embettables/timer/timer.component";
import { MemoryService } from "../../../services/memory.service";
import { Genre, Musicloader, MusicQuestion } from "../../../../MusicLoader";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService, ScoreboardSquare } from "../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../services/hue-light.service";
import { MusicFader, shuffleArray, Style, styledLogger } from "../../../../utils";
import { CategoryLoader } from "../../../../Loader";
import { inputToColor } from "../../../../models";
import { RoundInterface } from "../../../../round";

@Component({
    selector: 'app-timeline.round',
    imports: [
        ScoreboardComponent,
        NgStyle,
        TimerComponent,
    ],
    templateUrl: './timeline.round.component.html',
    standalone: true,
    styleUrl: './timeline.round.component.css'
})
export class TimelineRoundComponent implements OnDestroy {
    bgc: string;
    round: RoundInterface;
    currentTrack: MusicQuestion = {
        id: NaN,
        path: "",
        information: {
            title: "",
            interpret: "",
            releaseYear: NaN,
            group: false,
            genre: Genre.pop,
            language: []
        },
        highlightFrom: NaN,
        memory: {
            from: NaN,
            to: NaN
        },
        lyrics: []
    }
    musicTracks: MusicQuestion[] = [this.currentTrack];
    spacePressed = false;
    backgroundMusic: HTMLAudioElement = new Audio();
    music: HTMLAudioElement = new Audio();
    timerDone = false;
    trackList: { track: MusicQuestion, yPos: number }[] = [];
    markers: {
        color: string;
        controller: number;
        yPos: number;
        index: number;
        visible: boolean;
    }[] = [];
    playerMarkers: {
        color: string;
        controller: number;
        yPos: number;
        index: number;
    }[] = [];
    pointList: { index: number, pointValue: number, yPos: number }[] = [];
    players: { name: string, controller: number, change: string }[] = [];
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    private acceptInputsVar = false;
    private timerShown = false;
    private readonly maxTracks = 15;

    constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
        this.round = memory.rounds[memory.roundNumber];
        this.bgc = this.round.background;
        buzz.onPress(buttonState => this.onPress(buttonState));
        styledLogger(this.round.name, Style.speak)
        styledLogger(this.round.rules, Style.speak)
        this.setupWithDelay();
        this.musicTracks = this.musicTracks.concat(Musicloader.loadMusic(CategoryLoader.allMusic));
        this.startRound();
    }

    @HostListener('document:keydown', ['$event'])
    async handleKeyboardEvent(event: KeyboardEvent) {
        if (this.buzz.emulate(event.key)) this.onPress(this.buzz.emulate(event.key)!);

        if (event.key === 'i') this.memory.print();

        if (event.key === 'r') this.setupNextQuestion();

        if (event.key === 'o') {
            styledLogger("TIMER STARTED", Style.information);
            this.timer.startTimer()
        }
        if (event.key === 'p') {
            styledLogger("TIMER PAUSED, [o] to resume", Style.requiresInput);
            this.timer.stopTimer()
        }

        if (event.key === ' ') this.spacePressed = true;
    }

    ngOnDestroy(): void {
        this.backgroundMusic.pause();
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
                playerColor: inputToColor(player.controllerId + 1)!,
                perks: player.perks,
            }
        }), false])

        this.memory.players.forEach((player) => {
            this.players.push({name: player.name, controller: player.controllerId, change: ""})
        })

        gsap.set('#scoreboard', {x: 600})

        gsap.set('#timer', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})

        await new Promise(resolve => setTimeout(resolve, 750));

        this.players.forEach((player) => {
            gsap.set('#player-' + player.controller, {borderColor: inputToColor(player.controller + 1), background: inputToColor(player.controller + 1) + '44'})
        })
        gsap.set('#player-container', {y: 700, opacity: 1});

        await new Promise(resolve => setTimeout(resolve, 250));

        gsap.to('#player-container', {y: 0, ease: 'back.out'});
    }

    private displayTimer(tf: boolean) {
        if (tf) {
            gsap.to('#timer', {y: 0, rotationX: 0, ease: 'back.inOut'})
        } else {
            gsap.to('#timer', {y: -300, rotationX: -45, ease: "back.inOut"})
        }
    }

    private async startRound() {
        this.backgroundMusic.src = "/music/div/generic beat.mp3";
        this.backgroundMusic.loop = true
        this.backgroundMusic.play()
        await this.waitForSpace();
        await this.firstThreeTracks();
        await new Promise(resolve => setTimeout(resolve, 250));
        this.backgroundMusic.play()
        this.initPointsList();
        for (let i = 0; !this.playerMarkers.some(pMarker => pMarker.index === 0) && this.trackList.length < this.maxTracks; i++) {
            this.setupNextQuestion()
            await this.waitForSpace();
            new Audio('music/wwds/frage.mp3').play();
            this.updatePins(true);
            await new Promise(resolve => setTimeout(resolve, 250));
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
            new MusicFader().fadeOut(this.backgroundMusic, 1000);
            this.music.src = "musicround/" + this.currentTrack.path;
            this.music.load();
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.startTimer();
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
            await new Promise(resolve => setTimeout(resolve, 1000))
            await this.updatePins(true);
            await this.waitForSpace()
            new Audio('music/wwds/richtig.mp3').play();
            this.displayTimer(true)
            await this.addTrackToList(this.currentTrack);
            await this.updatePins(true, true)
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.showChange()
            await this.waitForSpace(true);
            new MusicFader().fadeOut(this.music, 1000);
            if (this.playerMarkers.some(pMarker => pMarker.index <= 0) || this.trackList.length === this.maxTracks) {
                new MusicFader().fadeOut(this.music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                // this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
            }
            this.collectPoints()
            this.displayTimer(false)
            this.updatePins(false)
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        styledLogger("ENDE DER RUNDE", Style.speak)
        await this.waitForSpace()
        await this.displayScoreboard()
        await this.displayScoresOnScoreboard();
        await new Promise(resolve => setTimeout(resolve, 1500));
        this.scoreboard.sortSubject.next();
        await this.waitForSpace();
        gsap.to('#scorebar', {x: -2000})
        gsap.to('#scoreboard', {x: 600})
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
    }

    private async firstThreeTracks() {
        this.musicTracks = this.musicTracks.slice(1, this.musicTracks.length)
        new MusicFader().fadeOut(this.backgroundMusic, 500)
        for (let i = 0; i < 3; i++) {
            this.currentTrack = this.musicTracks[0];
            this.musicTracks = this.musicTracks.slice(1, this.musicTracks.length);
            this.printTrack(Style.speak);
            this.music.src = "musicround/" + this.currentTrack.path;
            this.music.currentTime = this.currentTrack.highlightFrom;
            this.music.play();
            this.addTrackToList(this.currentTrack);
            await new Promise(resolve => setTimeout(resolve, 250));
            await this.waitForSpace(true);
        }
        new MusicFader().fadeOut(this.music, 500);
    }

    private async onPress(buttonState: ButtonState) {
        if (this.markers.some(marker => marker.controller === buttonState.controller && marker.visible) && this.acceptInputsVar) {
            if (buttonState.button === 0) {
                this.markers.find(marker => buttonState.controller === marker.controller)!.visible = false;
                new Audio('music/div/nextplayer.mp3').play();

                this.players.find(player => player.controller === buttonState.controller)!.change = (this.players.filter(player => player.change !== "").length + 1) + "."
                const states = new Array(4).fill(false);
                for (const player of this.players) {
                    states[player.controller] = player.change === "";
                }
                this.buzz.setLeds(states);
            }
            if (buttonState.button === 1) {
                if (this.markers.find(marker => buttonState.controller === marker.controller)!.index > -1)
                    this.markers.find(marker => buttonState.controller === marker.controller)!.index--;
                new Audio('music/div/spin0.mp3').play();
            }
            if (buttonState.button === 2) {
                if (this.markers.find(marker => buttonState.controller === marker.controller)!.index < this.trackList.length - 1)
                    this.markers.find(marker => buttonState.controller === marker.controller)!.index++;
                new Audio('music/div/spin1.mp3').play();
            }
            this.updatePins();
        }
    }

    private async waitForSpace(bounceLights = false) {
        styledLogger("Space zum weitermachen", Style.requiresInput)
        this.spacePressed = false

        async function bounceTracks(trackId: number, trackList: { track: MusicQuestion, yPos: number }[], currentTrack: boolean, i: number) {
            if (trackList.length <= 3)
                if (!(i % 5 === 0)) return
                else {
                    for (const track of trackList) {
                        gsap.to('#track-' + track.track.id, {borderColor: '#FFF'});
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                    for (const track of trackList) {
                        gsap.to('#track-' + track.track.id, {borderColor: '#000'});
                    }
                }
            else {
                gsap.to('#track-' + trackId, {borderColor: currentTrack ? '#FFF' : '#888'});
                await new Promise(resolve => setTimeout(resolve, 500));
                gsap.to('#track-' + trackId, {borderColor: '#000'});
            }
        }

        async function bounceTimer(i: number) {
            if (!(i % 5 === 0)) return
            gsap.to('#timer', {borderColor: '#FFF'});
            await new Promise(resolve => setTimeout(resolve, 500));
            gsap.to('#timer', {borderColor: '#000'});
        }

        async function bouncePoints(i: number, length: number) {
            if (!(i % 5 === 0)) return;

            async function bouncePoint(index: number) {
                gsap.to('#scorebar-value-' + index, {borderColor: '#FFF'});
                await new Promise(resolve => setTimeout(resolve, 500));
                gsap.to('#scorebar-value-' + index, {borderColor: '#000'});
            }

            for (let o = 0; o < length; o++) {
                bouncePoint(o);
                await new Promise(resolve => setTimeout(resolve, 500 / length));
            }
        }

        let i = 0;
        const tracks = shuffleArray(this.trackList.slice());
        const lights = shuffleArray(HueLightService.primary.concat(HueLightService.secondary));
        while (!this.spacePressed) {
            if (bounceLights) {
                this.hue.bounceLight([lights[i % lights.length]])
                bounceTracks(tracks[i % tracks.length].track.id, this.trackList, tracks[i % tracks.length].track.id === this.currentTrack.id, i);
                bounceTimer(i)
                if (this.trackList.length > 3) bouncePoints(i, this.pointList.length)
                i++;
            }
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        this.spacePressed = false
    }

    private setupNextQuestion() {
        this.timer.resetTimer();
        this.markers = [];
        this.memory.players.forEach(player => {
            this.markers.push({
                color: inputToColor(player.controllerId + 1) || '#FFF',
                controller: player.controllerId,
                yPos: NaN,
                index: 0,
                visible: false,
            })
        })
        this.players.forEach(player => {
            player.change = "";
        })
        this.timerShown = false;
        this.musicTracks = this.musicTracks.slice(1, this.musicTracks.length);
        this.currentTrack = this.musicTracks[0];
        this.printTrack();
    }

    private printTrack(style: Style = Style.information) {
        styledLogger(this.currentTrack.information.title, style)
        styledLogger(this.currentTrack.information.interpret, style)
        styledLogger(this.currentTrack.information.releaseYear.toString(), style)
    }

    private async startTimer() {
        this.timer.startTimer();
        this.music.play();
        this.timerDone = false;
        this.acceptInputs(true);
        while (!this.timerDone && this.markers.filter(marker => !marker.visible).length < this.memory.players.length/* && this.inputs.length < this.memory.players.length*/) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (this.timer.remainingTime < 15 && !this.timerShown) {
                this.timerShown = true;
                this.displayTimer(true)
            }
        }
        this.timer.stopTimer();
        this.acceptInputs(false);
    }

    private acceptInputs(tf: boolean) {
        this.acceptInputsVar = tf;
        const states = new Array(4).fill(false);
        for (const player of this.memory.players) {
            states[player.controllerId] = tf
        }
        this.buzz.setLeds(states);
    }

    private showChange() {
        const correctPlayers: { placement: number, controller: number }[] = [];
        for (const correctMarker of this.markers.filter(marker => marker.yPos === this.trackList.find(track => track.track.id === this.currentTrack.id)!.yPos)) {
            const correspondingPlayer = this.players.find(player => player.controller === correctMarker.controller)!
            let placement = Number(correspondingPlayer.change.slice(0, 1));
            if (placement === 0) placement = NaN;
            correctPlayers.push({placement: placement, controller: correspondingPlayer.controller})
        }
        correctPlayers.sort((a, b) => {
            if (isNaN(a.placement) && isNaN(b.placement)) return 0; // Keep NaNs in place relative to each other
            if (isNaN(a.placement)) return 1; // Move NaN to the end
            if (isNaN(b.placement)) return -1; // Move NaN to the end
            return a.placement - b.placement; // Normal numeric sort
        });
        const maxPoints = 4
        let currentAddition = maxPoints
        for (const correct of correctPlayers) {
            const correspondingPlayer = this.players.find(player => player.controller === correct.controller)!
            correspondingPlayer.change = "+" + currentAddition
            this.playerMarkers.find(pMarker => pMarker.controller === correspondingPlayer.controller)!.index -= currentAddition
            if (!isNaN(correct.placement)) {
                currentAddition -= Math.floor(maxPoints / this.players.length)
            }
        }

        for (const incorrect of this.markers.filter(marker => marker.yPos !== this.trackList.find(track => track.track.id === this.currentTrack.id)!.yPos)) {
            const correspondingPlayer = this.players.find(player => player.controller === incorrect.controller)!
            if (this.trackList.find(track => track.track.id === this.currentTrack.id)!.yPos > incorrect.yPos) {
                correspondingPlayer.change = "-" + (1 + Math.floor((this.currentTrack.information.releaseYear - this.trackList[incorrect.index + 1].track.information.releaseYear) / 5))
                this.playerMarkers.find(pMarker => pMarker.controller === correspondingPlayer.controller)!.index += (1 + Math.floor((this.currentTrack.information.releaseYear - this.trackList[incorrect.index + 1].track.information.releaseYear) / 5))
            } else {
                correspondingPlayer.change = "-" + (1 + Math.floor((this.trackList[incorrect.index].track.information.releaseYear - this.currentTrack.information.releaseYear) / 5))
                this.playerMarkers.find(pMarker => pMarker.controller === correspondingPlayer.controller)!.index += (1 + Math.floor((this.trackList[incorrect.index].track.information.releaseYear - this.currentTrack.information.releaseYear) / 5))
            }
        }
    }

    private async collectPoints() {
        for (const pMarker of this.playerMarkers) {
            if (pMarker.index < 0) pMarker.index = 0;
            if (pMarker.index >= this.pointList.length) pMarker.index = this.pointList.length - 1;
        }
        this.updatePlayerPins(true)
    }

    private async addTrackToList(question: MusicQuestion) {
        this.trackList.push({track: question, yPos: NaN});

        const height = 1080;
        const minusLast = 150;

        // Sort the trackList by release year first
        this.trackList.sort((a, b) => a.track.information.releaseYear - b.track.information.releaseYear);

        const space = (height - minusLast) / (this.trackList.length - 1); // Calculate space to position tracks evenly
        let index = 0;

        // Calculate the range of release years
        const minYear = this.trackList[0].track.information.releaseYear;
        const maxYear = this.trackList[this.trackList.length - 1].track.information.releaseYear;
        const yearRange = maxYear - minYear;

        // Wait before starting the animation
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Set initial position of the newly added track
        gsap.set("#track-" + question.id, {x: -1500, y: 500});

        // Loop through the track list and position them
        for (const track of this.trackList) {
            let yPosition = index === this.trackList.length - 1 ? height - minusLast : space * index; // Ensure the last track is at the bottom

            // Normalize the release year to a hue (0-270 for the rainbow spectrum)
            const normalizedYear = (track.track.information.releaseYear - minYear) / yearRange; // Range from 0 to 1
            const hue = normalizedYear * 270; // Map normalized value to 0-270
            const backgroundColor = `hsl(${hue}, 100%, 15%)`;

            yPosition += 35;

            if (this.trackList.length === 1) {
                yPosition = 500;
            }

            // Apply animation and background color
            gsap.to(`#track-${track.track.id}`, {
                y: yPosition,
                rotateY: 2,
                x: 15,
                opacity: 1,
                backgroundColor: backgroundColor, // Apply background color dynamically
            });
            track.yPos = yPosition;

            index++;
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    private async updatePins(setVisible: boolean | null = null, revealPhase = false) {
        this.trackList.sort((a, b) => a.yPos - b.yPos);

        if (this.markers.some(marker => isNaN(marker.yPos))) {
            for (const marker of this.markers) {
                gsap.set("#marker-" + marker.controller, {x: 30, y: -500});
                marker.index = Math.floor(this.trackList.length / 2) - 1;
            }
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        for (const marker of this.markers) {
            marker.yPos = NaN
            if (revealPhase) {
                const track = this.trackList.find(t => t.track.id === this.currentTrack.id)!;
                if (marker.index + 1 === this.trackList.indexOf(track)) {
                    marker.yPos = track.yPos;
                } else if (marker.index + 1 > this.trackList.indexOf(track)) {
                    marker.index++;
                } else if (this.trackList[marker.index + 1].track.information.releaseYear == this.currentTrack.information.releaseYear) {
                    marker.yPos = track.yPos;
                }
            }

            if (setVisible !== null) marker.visible = setVisible

            if (marker.index === -1 && isNaN(marker.yPos)) marker.yPos = 0;
            else if (marker.index === this.trackList.length - 1 && isNaN(marker.yPos)) marker.yPos = 1000;
            else if (isNaN(marker.yPos)) marker.yPos = this.trackList[marker.index].yPos + (this.trackList[marker.index + 1].yPos - this.trackList[marker.index].yPos) / 2;
            gsap.to("#marker-" + marker.controller, {y: marker.yPos, opacity: marker.visible ? 1 : 0, x: 30 + (marker.controller * 10), duration: 0.5});
        }
    }

    private async initPointsList() {
        for (let i = 0; i <= 20; i++) {
            this.pointList.push({index: NaN, pointValue: this.generateSequenceValue(i), yPos: NaN})
        }
        this.pointList.sort((a, b) => a.pointValue - b.pointValue);
        for (let i = 0; i <= 20; i++) {
            this.pointList[i].index = i;
        }
        this.pointList.reverse();

        const height = 1080;
        const minusLast = 150;

        const space = (height - minusLast) / (this.pointList.length - 1); // Calculate space to position tracks evenly
        let index = 0;

        // Calculate the range of release years
        const minPoint = this.pointList[0].pointValue;
        const maxPoint = this.pointList[this.pointList.length - 1].pointValue;
        const pointRange = maxPoint - minPoint;

        // Wait before starting the animation
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Loop through the track list and position them
        for (const point of this.pointList) {
            // Set initial position of the newly added track
            gsap.set("#scorebar-value-" + point.index, {x: -1500, y: 500});
            let yPosition = index === this.pointList.length - 1 ? height - minusLast : space * index; // Ensure the last track is at the bottom

            // Normalize the release year to a hue (0-270 for the rainbow spectrum)
            const normalizedPoint = (point.pointValue - minPoint) / pointRange; // Range from 0 to 1
            const hue = normalizedPoint * 270; // Map normalized value to 0-270
            const backgroundColor = `hsl(${hue}, 100%, 15%)`;

            yPosition += 45;

            // Apply animation and background color
            gsap.to("#scorebar-value-" + point.index, {
                y: yPosition,
                rotateY: -2,
                x: -15,
                opacity: 1,
                backgroundColor: backgroundColor, // Apply background color dynamically
            });
            point.yPos = yPosition;

            index++;
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        for (const player of this.memory.players) {
            this.playerMarkers.push({
                color: inputToColor(player.controllerId + 1)!,
                controller: player.controllerId,
                yPos: NaN,
                index: 0
            })
        }
        this.updatePlayerPins();
    }

    private generateSequenceValue(i: number, maxIndex = 20, maxValue = 250, variance = 0.1) {
        const base = Math.pow(i / maxIndex, 1.5); // Normalized growth
        const noiseFactor = 1 + (Math.random() * 2 - 1) * variance; // Random variation
        return Math.floor(base * maxValue * noiseFactor);
    }

    private async updatePlayerPins(collectPoints = false) {
        if (this.playerMarkers.some(playerMarker => isNaN(playerMarker.yPos))) {
            for (const playerMarker of this.playerMarkers) {
                playerMarker.index = this.pointList.length - 1;
            }
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        for (const playerMarker of this.playerMarkers) {
            playerMarker.yPos = this.pointList[playerMarker.index].yPos;
            gsap.to("#p-marker-" + playerMarker.controller, {y: playerMarker.yPos, opacity: 1, x: 0 - (playerMarker.controller * 8), duration: collectPoints ? 3 : 0.5, ease: "back.inOut"});
        }
    }

    private async displayScoreboard() {
        gsap.to('#track-list', {x: -1500, ease: "back.in", duration: 1.2})
        gsap.to('#player-container', {y: 250, ease: "back.in", opacity: 0});
        await new Promise(resolve => setTimeout(resolve, 1500))
        gsap.to('#scorebar', {x: -1200, ease: "back.out", duration: 2})
        for (const point of this.pointList) {
            gsap.to("#scorebar-value-" + point.index, {
                rotateY: 2,
                duration: 2,
            });
        }
        await new Promise(resolve => setTimeout(resolve, 2000))

        gsap.to('#scoreboard', {x: -50, y: -120, scale: 1.2, ease: 'bounce'})
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    private async displayScoresOnScoreboard() {
        let steps: { playerIds: number[], value: number, index: number }[] = []
        steps = this.pointList.map(point => {
            return {playerIds: this.playerMarkers.filter(pm => (20 - pm.index) >= point.index).map(pm => pm.controller), value: point.pointValue, index: point.index}
        });
        steps = steps.filter(step => step.playerIds.length > 0).reverse();

        for (const step of steps) {
            if (step.index !== 0) {
                if (steps[step.index - 1].playerIds.length !== step.playerIds.length) {
                    new Audio('music/div/nextplayer.mp3').play()
                    await new Promise(resolve => setTimeout(resolve, 500))
                } else gsap.to('#scorebar-value-' + (step.index - 1), {borderColor: '#888'});
                this.updateScoreboard(steps, step);
            }
            gsap.to('#scorebar-value-' + step.index, {borderColor: '#FFF', duration: 0.5});
            new Audio('music/div/spin' + (step.index % 4) + '.mp3').play()
            await new Promise(resolve => setTimeout(resolve, 200))
        }
        new Audio('music/div/spinresult.mp3').play()
        let scoreboardReturn: [ScoreboardPlayer[], boolean] = [[], false];
        const sub = this.scoreboard.playerSubject.subscribe(returned => scoreboardReturn = returned);
        await new Promise(resolve => setTimeout(resolve, 500))
        this.updateScoreboard(steps)
        await this.waitForSpace();
        sub.unsubscribe()
        this.scoreboard.playerSubject.next([scoreboardReturn[0].slice().map(scoreboardPlayer => {
                const clonedPlayer = {...scoreboardPlayer};
                clonedPlayer.pointAward = Number(clonedPlayer.square!.squareText);
                clonedPlayer.square = undefined;
                clonedPlayer.playerColor = '#FFFFFF'
                return clonedPlayer;
            }), true]
        )
    }

    private updateScoreboard(steps: { playerIds: number[], value: number, index: number }[], step: { playerIds: number[], value: number, index: number } | null = null) {
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
            let square: ScoreboardSquare | undefined = undefined;
            const playerSteps = steps.filter(s => s.playerIds.includes(player.controllerId));
            const shouldUpdate = step === null || !steps.some(s => s.index >= step.index && s.playerIds.includes(player.controllerId));

            if (shouldUpdate) {
                square = {squareBackground: '', squareText: '', squareBorder: ''};

                const playerColor = inputToColor(player.controllerId + 1);
                if (playerColor) {
                    square.squareBackground = `${playerColor}88`;
                    square.squareBorder = playerColor;
                }

                const maxStep = playerSteps.reduce((max, s) => s.value > max.value ? s : max, {value: 0});
                square.squareText = maxStep.value.toString();
            }
            return {
                name: player.name,
                score: player.gameScore,
                pointAward: undefined,
                square: square,
                active: step ? ((steps[step.index + 1] ? !steps[step.index + 1].playerIds.includes(player.controllerId) : true) && step?.playerIds.includes(player.controllerId))! : false,
                playerColor: inputToColor(player.controllerId + 1),
                perks: player.perks,
            }
        }), false])
    }
}
