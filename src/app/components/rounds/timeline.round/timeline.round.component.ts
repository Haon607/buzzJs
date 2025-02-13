import gsap from 'gsap';
import { Component, HostListener, OnDestroy, ViewChild } from "@angular/core";
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { NgStyle } from "@angular/common";
import { TimerComponent } from "../../timer/timer.component";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { Genre, Musicloader, MusicQuestion } from "../../../../MusicLoader";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { ScoreboardService } from "../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../services/hue-light.service";
import { MusicFader, randomNumber, shuffleArray, Style, styledLogger } from "../../../../utils";
import { CategoryLoader } from "../../../../Loader";
import { Colors, inputToColor } from "../../../../models";


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
    trackList: MusicQuestion[] = [];
    markers: {
        color: Colors | null,
        after: number,
        correct: boolean
    }[] = [];
    @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
    protected readonly isNaN = isNaN;
    private excludeIds: number[] = [];
    private inputs: ButtonState[] = [];
    private acceptInputsVar = false;
    private timerShown = false;

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
                square: undefined
            }
        }), false])

        gsap.set('#scoreboard', {x: 600})

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

    private async startRound() {
        this.backgroundMusic.src = "/music/div/generic beat.mp3";
        this.backgroundMusic.loop = true
        this.backgroundMusic.play()
        await this.waitForSpace();
        this.musicTracks = this.musicTracks.slice(1, this.musicTracks.length)
        new MusicFader().fadeOut(this.backgroundMusic, 500)
        for (let i = 0; i < 3; i++) {
            this.currentTrack = this.musicTracks[0]
            this.musicTracks = this.musicTracks.slice(1, this.musicTracks.length);
            this.printTrack(Style.speak);
            await new Promise(resolve => setTimeout(resolve, 250));
            this.music.src = "musicround/" + this.currentTrack.path;
            this.music.currentTime = this.currentTrack.highlightFrom
            this.music.play();
            this.addTrackToList(this.currentTrack);
            await this.waitForSpace(true);
        }
        new MusicFader().fadeOut(this.music, 500)
        await new Promise(resolve => setTimeout(resolve, 250));
        this.backgroundMusic.play()
        for (let i = 0; this.excludeIds.length < this.memory.players.length; i++) {
            this.setupNextQuestion()
            await this.waitForSpace();
            new Audio('music/wwds/frage.mp3').play();
            this.placePins(this.currentTrack.information.releaseYear);
            await new Promise(resolve => setTimeout(resolve, 250));
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
            new MusicFader().fadeOut(this.backgroundMusic, 1000);
            this.music.src = "musicround/" + this.currentTrack.path;
            this.music.load();
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.startTimer();
            this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
            this.music.currentTime = this.currentTrack.highlightFrom;
            this.music.play()
            await new Promise(resolve => setTimeout(resolve, 1000))
            new Audio('music/wwds/richtig.mp3').play();
            this.displayTimer(true)
            await new Promise(resolve => setTimeout(resolve, 500));
            await this.waitForSpace(true);
            if (this.excludeIds.length === this.memory.players.length) {
                new MusicFader().fadeOut(this.music, 1000);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
                this.memory.crossMusic.volume = 0.2;
                this.memory.crossMusic.play()
            }
            this.flipToPoints()
            await new Promise(resolve => setTimeout(resolve, 1500));
            new MusicFader().fadeOut(this.music, 1000);
            this.collectPoints()
            this.displayTimer(false)
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
        if (buttonState.button !== 0 && !this.excludeIds.includes(buttonState.controller) && !this.inputs.some(input => input.button === buttonState.button)) {
            this.inputs.push(buttonState)
        }
    }

    private async waitForSpace(bounceLights = false) {
        styledLogger("Space zum weitermachen", Style.requiresInput)
        this.spacePressed = false
        const lights = shuffleArray(HueLightService.primary.concat(HueLightService.secondary));
        let i = 0;
        while (!this.spacePressed) {
            if (bounceLights) this.hue.bounceLight([lights[i % lights.length]])
            await new Promise(resolve => setTimeout(resolve, 250));
            i++;
        }
        this.spacePressed = false
    }

    private setupNextQuestion() {
        this.timer.resetTimer();
        this.inputs = [];
        this.markers = [];
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
        while (!this.timerDone && this.inputs.length < this.memory.players.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (this.timer.remainingTime < 25 && !this.timerShown) {
                this.timerShown = true;
                this.displayTimer(true)
            }
        }
        this.timer.stopTimer();
        this.acceptInputs(false);
        this.music.pause()
    }

    private acceptInputs(tf: boolean) {
        this.acceptInputsVar = tf;
    }

    private flipToPoints() {

    }

    private async collectPoints() {

    }

    private async addTrackToList(question: MusicQuestion) {
        this.trackList.push(question);

        const height = 1080;
        const minusLast = 150;

        // Sort the trackList by release year first
        this.trackList.sort((a, b) => a.information.releaseYear - b.information.releaseYear);

        const space = (height - minusLast) / (this.trackList.length - 1); // Calculate space to position tracks evenly
        let index = 0;

        // Calculate the range of release years
        const minYear = this.trackList[0].information.releaseYear;
        const maxYear = this.trackList[this.trackList.length - 1].information.releaseYear;
        const yearRange = maxYear - minYear;

        // Wait before starting the animation
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Set initial position of the newly added track
        gsap.set("#track-" + question.id, {x: -1500, y: 500});

        // Loop through the track list and position them
        for (const track of this.trackList) {
            const yPosition = index === this.trackList.length - 1 ? height - minusLast : space * index; // Ensure the last track is at the bottom

            // Normalize the release year to a hue (0-270 for the rainbow spectrum)
            const normalizedYear = (track.information.releaseYear - minYear) / yearRange; // Range from 0 to 1
            const hue = normalizedYear * 270; // Map normalized value to 0-270
            const backgroundColor = `hsl(${hue}, 100%, 15%)`;

            // Apply animation and background color
            gsap.to(`#track-${track.id}`, {
                y: yPosition + 35,
                rotateY: 2,
                x: 15,
                opacity: 1,
                backgroundColor: backgroundColor, // Apply background color dynamically
            });

            index++;
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    private async placePins(releaseYear: number) {
        // Sort track list by release year
        this.trackList.sort((a, b) => a.information.releaseYear - b.information.releaseYear);

        // Pick a random index for the correct answer (0 to 3)
        const correctIndex = randomNumber(0, 3);
        console.log(correctIndex);

        // Find the correct track index
        const correctTrackIndex = this.trackList.findIndex(track => track.information.releaseYear > releaseYear) - 1;
        const correctTrack = this.trackList[correctTrackIndex];

        // Make sure trackList is sorted again
        this.trackList.sort((a, b) => a.information.releaseYear - b.information.releaseYear);

        // Array to hold the markers
        const markers: { correct: boolean; color: Colors| null; after: number }[] = [];

        for (let i = 0; i < 4; i++) {
            let after: MusicQuestion | undefined;

            if (i === correctIndex) {
                // Use the correct track for the correct index
                after = correctTrack;
            } else {
                // Calculate the wrong track index based on the correct index
                const wrongTrackIndex = correctTrackIndex + (i - correctIndex);

                if (wrongTrackIndex >= 0 && wrongTrackIndex < this.trackList.length) {
                    after = this.trackList[wrongTrackIndex];
                } else {
                    // Ensure that "after" is valid even if the index is out of bounds
                    after = this.trackList[this.trackList.length - 1];
                }

                // Ensure there are no duplicates for the "after" year
                while (this.markers.some(marker => (after === undefined ? isNaN(marker.after) : marker.after === after?.information.releaseYear))) {
                    after = this.trackList[randomNumber(0, this.trackList.length - 1)];
                }

                console.log("WrongIndex" + wrongTrackIndex);
                console.log("Tracklist length: " + this.trackList.length);
            }

            console.log(after);

            // Push the marker with the calculated `after` value
            markers.push({
                correct: i === correctIndex,
                color: inputToColor(i + 1)!,
                after: after !== undefined ? after.information.releaseYear : NaN
            });
        }

        // Assign the markers to the relevant property (assuming `this.markers` exists)
        this.markers = markers;


        console.log(this.markers)
        await new Promise((resolve) => setTimeout(resolve, 100));

        for (const marker of this.markers) {
            gsap.set("#marker-" + marker.after, {x: -1500, y: 500});
        }


        for (const marker of this.markers) {
            gsap.to("#marker-" + marker.after, {y: 0, rotateY: 2, x: 15, opacity: 1, fill: marker.color!});
        }
    }
}
