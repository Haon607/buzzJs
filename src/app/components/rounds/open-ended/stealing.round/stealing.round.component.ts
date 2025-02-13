import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MemoryService, RoundInterface } from "../../../../services/memory.service";
import { Question, QuestionLoader } from "../../../../../Loader";
import { TimerComponent } from "../../../timer/timer.component";
import { ButtonState, BuzzDeviceService } from "../../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../../services/hue-light.service";
import gsap from "gsap";
import { MusicFader, shuffleArray, Style, styledLogger } from "../../../../../utils";
import { ScoreboardComponent } from "../../../scoreboard/scoreboard.component";
import { NgClass, NgStyle } from "@angular/common";
import { Player } from "../../../../../models";

@Component({
  selector: 'app-stealing.round',
  imports: [
    ScoreboardComponent,
    NgStyle,
    TimerComponent,
    NgClass
  ],
  templateUrl: './../open-ended.html',
  standalone: true,
  styleUrl: './../open-ended.css'
})
export class  StealingRoundComponent implements OnDestroy{
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
  amountOfQuestions = NaN;
  @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
  maxTime = 120;
  timerSound = false;
  monospaceQuestion = false;
  private latestInput: ButtonState | null = null;
  private acceptInputsVar = false;
  private stoppBuzzFlash = false;
  private revealongoing = false;
  private skipVar = false;
  private isCorrect: boolean | null = null;
  private percentCounter = 400;
  private readonly percentThrough = 40;

  constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
    this.round = memory.rounds[memory.roundNumber];
    this.bgc = this.round.background;
    this.round.secondary = "#FFFFFF"
    buzz.onPress(buttonState => this.onPress(buttonState));
    this.setupWithDelay();
    this.questions = this.questions.concat(QuestionLoader.loadQuestion(memory.category!));
    this.startRound();
  }

  @HostListener('document:keydown', ['$event'])
  async handleKeyboardEvent(event: KeyboardEvent) {
    if (this.buzz.emulate(event.key)) this.onPress(this.buzz.emulate(event.key)!);

    if (event.key === 'i') this.memory.print();

    if (event.key === 'r') this.setupNextQuestion();
    if (event.key === 'd') {
      this.displayQuestion(true);
    }

    if (event.key === '+') this.correct();
    if (event.key === '-') this.incorrect();
    if (event.key === 's') this.skip();

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

    this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000)

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
    await new Promise(resolve => setTimeout(resolve, 250));
    this.displayTimer(true)
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
    this.music.src = "/music/mp/smpj-dc2.mp3";
    this.music.play()
    await this.waitForSpace();
    await new MusicFader().fadeOut(this.music, 1000);
    this.music.src = "/music/buzz/BTV-BL_PS.mp3";
    this.music.loop = true
    this.music.play()
    for (let i = 0; !this.timerDone; i++) {
      this.setupNextQuestion()
      await this.waitForSpace();
      new Audio('music/wwds/frage.mp3').play();
      await new Promise(resolve => setTimeout(resolve, 250));
      this.hue.turnOff(HueLightService.secondary, 1000)
      await this.startTimer();
      this.hue.turnOn(HueLightService.secondary, 100)
      styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
      this.revealongoing = true
      styledLogger("+ oder - zum Auflösen", Style.requiresInput)
      let timePassed = 0;
      while (this.revealongoing) {
        await new Promise(resolve => setTimeout(resolve, 100));
        timePassed++
        if (timePassed % 10 === 0) {
          styledLogger((timePassed / 10) + "sekunden vergangen", Style.information);
          if (timePassed >= 100) {
            styledLogger("Falsch markieren?", Style.requiresInput);
          }
        }
      }
      new Audio('music/wwds/richtig.mp3').play();
      this.displayQuestion(true);
      this.displayAnswers(true);
      await this.waitForSpace();
      this.collectPoints()
      this.displayQuestion(false)
      this.displayAnswers(false)
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000)
      this.scoreboard.sortSubject.next();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    new MusicFader().fadeOut(this.music, 1000);
    await new Promise(resolve => setTimeout(resolve, 500));
    this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
    this.memory.crossMusic.volume = 0.2;
    this.memory.crossMusic.play()
    await this.waitForSpace()
    gsap.to('#scoreboard', {x: 600})
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
  }

  private async onPress(buttonState: ButtonState) {
    if (this.acceptInputsVar && buttonState.button === 0) {
      if (!this.latestInput) {
        this.latestInput = buttonState;
        this.timer.stopTimer()
        new Audio('music/wwds/einloggen.mp3').play();
        this.scoreboard.playerSubject.next([this.memory.players.map(player => {
          return {
            name: player.name,
            score: player.gameScore,
            pointAward: undefined,
            square: this.latestInput?.controller === player.controllerId ? {
              squareBackground: '#FF000088',
              squareBorder: '#FFF',
              squareText: "±" + this.calculatePoints(player, true)
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

  private async waitForSpace() {
    styledLogger("Space zum weitermachen", Style.requiresInput)
    while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
    this.spacePressed = false
  }

  private setupNextQuestion() {
    this.latestInput = null;
    this.skipVar = false;
    this.isCorrect = null;
    this.questions = this.questions.slice(1, this.questions.length);
    this.currentQuestion = this.questions[0];
    if (this.currentQuestion.shuffle) this.currentQuestion.answers = shuffleArray(this.currentQuestion.answers);
    this.currentQuestion.answers[1] = {answer: (this.percentCounter/this.percentThrough).toFixed(1) + "%", correct: false}
    this.printQuestion()
  }

  private printQuestion() {
    styledLogger(this.currentQuestion.question, Style.speak)
    styledLogger(this.currentQuestion.answers[0].answer, Style.information)
  }

  private async startTimer() {
    this.timer.startTimer()
    this.acceptInputs(true);
    let timePassed = 0;
    while (!this.latestInput && !this.skipVar) {
      await new Promise(resolve => setTimeout(resolve, 100));
      this.percentCounter++;
      this.currentQuestion.answers[1] = {answer: (this.percentCounter/this.percentThrough).toFixed(1) + "%", correct: false}

      timePassed++;
      if (timePassed % 50 === 0) {
        styledLogger(timePassed / 10 + " sekunden seit Start der Frage vergangen", Style.information)
        if (timePassed >= 150) {
          styledLogger("Frage schließen?", Style.requiresInput)
        }
      }
    }
    this.acceptInputs(false);
    this.timer.stopTimer();
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
    }
  }

  private async collectPoints() {
    const scoreboardPlayers: ScoreboardPlayer[] = [];
    this.memory.players.forEach((player) => {
      scoreboardPlayers.push({
        name: player.name,
        score: player.gameScore,
        pointAward: this.latestInput?.controller === player.controllerId ? this.calculatePoints(player, this.isCorrect!) : undefined,
        square: undefined,
        active: false
      })
    })
    this.scoreboard.playerSubject.next([scoreboardPlayers, true])
  }
//TODO THIS SCORING IS NOT STEALING, THINK
  private correct() {
    this.stoppBuzzFlash = true;
    this.revealongoing = false;
    this.isCorrect = true;
    this.hue.setColor(HueLightService.secondary, "#00FF00", 100);

    const scoreboardPlayers: ScoreboardPlayer[] = [];
    this.memory.players.forEach((player) => {
      scoreboardPlayers.push({
        name: player.name,
        score: player.gameScore,
        pointAward: undefined,
        square: this.latestInput?.controller === player.controllerId ? {
          squareBackground: '#00000080',
          squareBorder: '#00FF00',
          squareText: "+" + this.calculatePoints(player, true)
        } : undefined,
        active: false
      })
    })
    this.scoreboard.playerSubject.next([scoreboardPlayers, false])
  }

  private async incorrect() {
    this.stoppBuzzFlash = true;
    this.revealongoing = false;
    this.isCorrect = false;
    this.hue.setColor(HueLightService.secondary, "#FF0000", 100);

    const scoreboardPlayers: ScoreboardPlayer[] = [];
    this.memory.players.forEach((player) => {
      scoreboardPlayers.push({
        name: player.name,
        score: player.gameScore,
        pointAward: undefined,
        square: this.latestInput?.controller === player.controllerId ? {
          squareBackground: '#00000080',
          squareBorder: '#FF0000',
          squareText: "" + this.calculatePoints(player, false)
        } : undefined,
        active: false
      })
    })
    this.scoreboard.playerSubject.next([scoreboardPlayers, false])
  }


  private calculatePoints(player: Player, correct: boolean) {
    return Math.floor((player.gameScore * ((this.percentCounter/this.percentThrough) / 100)) * (correct ? 1 : -1));
  }

  private skip() {
    this.skipVar = true
  }
}
