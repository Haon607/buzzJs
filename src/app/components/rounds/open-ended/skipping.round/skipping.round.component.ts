import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import gsap from 'gsap';
import { ScoreboardComponent } from "../../../scoreboard/scoreboard.component";
import { NgClass, NgStyle } from "@angular/common";
import { TimerComponent } from "../../../timer/timer.component";
import { MemoryService } from "../../../../services/memory.service";
import { Question } from "../../../../../Loader";
import { ButtonState, BuzzDeviceService } from "../../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../../services/hue-light.service";
import { MusicFader, randomNumber, shuffleArray, Style, styledLogger } from "../../../../../utils";
import { Genre, Musicloader, MusicQuestion } from "../../../../../MusicLoader";
import { RoundInterface } from "../../../../services/round";

@Component({
  selector: 'app-skipping.round',
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
export class SkippingRoundComponent implements OnDestroy {
  bgc: string;
  round: RoundInterface;
  currentQuestion: Question = {
    question: "", answers: [
      {answer: "", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false},
    ], shuffle: false
  };
  currentTracks: MusicQuestion[] = []
  musicTracks: MusicQuestion[] = [{
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
  }];
  spacePressed = false;
  backgroundMusic: HTMLAudioElement = new Audio();
  music0: HTMLAudioElement = new Audio();
  music1: HTMLAudioElement = new Audio();
  timerDone = false;
  gotCorrect = false;
  amountOfTracks = 5;
  @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
  maxTime = 60;
  timerSound = false;
  monospaceQuestion = false;
  private latestInput: ButtonState | null = null;
  private excludeIds: number[] = [];
  private acceptInputsVar = false;
  private timerShown = false;
  private stoppBuzzFlash = false

  constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
    this.round = memory.rounds[memory.roundNumber];
    this.bgc = this.round.background;
    buzz.onPress(buttonState => this.onPress(buttonState));
    styledLogger(this.round.name, Style.speak)
    styledLogger(this.round.rules, Style.speak)
    this.setupWithDelay();
    this.musicTracks = this.musicTracks.concat(Musicloader.loadMusic(memory.category!));
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

  private async displayAnswers(tf: boolean) {
    if (tf) {
      gsap.to('#answer', {rotateY: 2, x: 30, ease: "back.inOut"})
    } else {
      gsap.to('#answer', {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"})
    }
  }

  private async startRound() {
    this.backgroundMusic.src = "/music/div/generic beat.mp3";
    this.backgroundMusic.loop = true
    this.backgroundMusic.play()
    for (let i = 0; i < this.amountOfTracks; i++) {
      this.setupNextQuestion()
      await this.waitForSpace();
      new Audio('music/wwds/frage.mp3').play();
      await new Promise(resolve => setTimeout(resolve, 250));
      this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
      new MusicFader().fadeOut(this.backgroundMusic, 1000);
      this.music0.src = "musicround/" + this.currentTracks[0].path;
      this.music1.src = "musicround/" + this.currentTracks[1].path;
      this.music0.load();
      this.music1.load();
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.startTimer();
      this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
      styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
      this.music0.currentTime = this.currentTracks[0].highlightFrom;
      this.music0.play()
      await this.waitForSpace(true)
      await new MusicFader().fadeOut(this.music0, 500);
      this.music1.currentTime = this.currentTracks[1].highlightFrom;
      this.music1.play()
      await new Promise(resolve => setTimeout(resolve, 1000))
      new Audio('music/wwds/richtig.mp3').play();
      this.displayAnswers(true);
      this.displayTimer(true)
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.waitForSpace(true);
      if (i + 1 === this.amountOfTracks) {
        new MusicFader().fadeOut(this.music1, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
        // this.memory.crossMusic.volume = 0.2;
        this.memory.crossMusic.play()
      }
      this.flipToPoints()
      await new Promise(resolve => setTimeout(resolve, 1500));
      new MusicFader().fadeOut(this.music1, 1000);
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
    this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
  }

  private async onPress(buttonState: ButtonState) {
    if (this.acceptInputsVar && buttonState.button === 0) {
      if (!this.latestInput && !this.excludeIds.includes(buttonState.controller)) {
        this.hue.setColor(HueLightService.primary, this.round.secondary, 0, 254);
        this.hue.setColor(HueLightService.secondary, this.round.primary, 0, 254);
        this.hue.setColor(HueLightService.primary, this.round.primary, 2500, 254);
        this.hue.setColor(HueLightService.secondary, this.round.secondary, 2500, 50);
        this.latestInput = buttonState;
        this.timer.stopTimer()
        new MusicFader().fadeOut(this.music0, 1000);
        new MusicFader().fadeOut(this.music1, 1000);
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

  private async waitForSpace(bounceLights = false) {
    styledLogger("Space zum weitermachen", Style.requiresInput)
    this.spacePressed = false
    const lights = shuffleArray(HueLightService.primary.concat(HueLightService.secondary));
    let i = 0;
    while (!this.spacePressed) {
      if (bounceLights) this.hue.bounceLight([lights[i%lights.length]])
      await new Promise(resolve => setTimeout(resolve, 250));
      i++;
    }
    this.spacePressed = false
  }

  private setupNextQuestion() {
    this.timer.resetTimer();
    this.latestInput = null;
    this.excludeIds = [];
    this.gotCorrect = false;
    this.timerShown = false;
    this.musicTracks = this.musicTracks.slice(2, this.musicTracks.length);
    this.currentTracks[0] = this.musicTracks[0];
    this.currentTracks[1] = this.musicTracks[1];
    this.currentQuestion.answers[0].answer =
        this.currentTracks[0].information.title + " - " + this.currentTracks[0].information.interpret +
        " & " +
        this.currentTracks[1].information.title + " - " + this.currentTracks[1].information.interpret;
    this.printTrack();
  }

  private printTrack() {
    styledLogger(this.currentTracks[0].information.title + " - " + this.currentTracks[0].information.interpret + " " + this.currentTracks[0].information.releaseYear, Style.information)
    styledLogger(this.currentTracks[1].information.title + " - " + this.currentTracks[1].information.interpret + " " + this.currentTracks[1].information.releaseYear, Style.information)
  }

  private async startTimer() {
    this.timer.startTimer();
    this.music0.play();
    this.timerDone = false;
    this.acceptInputs(true);
    let altTrack = false
    while (!this.timerDone && !this.gotCorrect && this.excludeIds.length < this.memory.players.length) {
      await new Promise(resolve => setTimeout(resolve, 100));

      if (this.timer.remainingTime < 15.5 && !this.timerShown) {
        this.timerShown = true;
        this.displayTimer(true)
      }
      if (Number(this.timer.remainingTime.toFixed(1)) % 0.25 === 0) {
        if (randomNumber(0, 4) === 0) {
          altTrack = !altTrack
          if (!(this.music0.paused && this.music1.paused))
            if (altTrack) {
              this.music0.pause()
              this.music1.play()
            } else {
              this.music1.pause()
              this.music0.play()
            }
        }
        if (altTrack) {
          this.music1.currentTime = randomNumber(20, Math.floor(this.music1.duration)-20 + Math.random())
        } else {
          this.music0.currentTime = randomNumber(20, Math.floor(this.music0.duration)-20 + Math.random())
        }
      }
    }
    this.timer.stopTimer();
    this.acceptInputs(false);
    this.music0.pause()
    this.music1.pause()
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
          squareText: "+" + (Math.floor(this.timer.remainingTime * 0.8))
        } : undefined,
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
        pointAward: this.latestInput?.controller === player.controllerId ? Math.floor(this.timer.remainingTime * 0.8) : undefined,
        square: undefined,
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
        active: false
      })
    })
    this.scoreboard.playerSubject.next([scoreboardPlayers, false])

    await new Promise(resolve => setTimeout(resolve, 1000))
    this.latestInput = null;

    this.timer.startTimer();
    this.music0.play()

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
        active: !this.excludeIds.includes(player.controllerId)
      })
    })
    this.scoreboard.playerSubject.next([scoreboardPlayers, true])
  }
}
