import { Component, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { MemoryService, RoundInterface } from "../../../../services/memory.service";
import { Question, QuestionLoader } from "../../../../../Loader";
import { TimerComponent } from "../../../timer/timer.component";
import { ButtonState, BuzzDeviceService } from "../../../../services/buzz-device.service";
import { ScoreboardPlayer, ScoreboardService } from "../../../../services/scoreboard.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HueLightService } from "../../../../services/hue-light.service";
import gsap from "gsap";
import { MusicFader, shuffleArray, Style, styledLogger } from "../../../../../utils";
import { inputToColor } from "../../../../../models";
import { ScoreboardComponent } from "../../../scoreboard/scoreboard.component";
import { NgStyle } from "@angular/common";

@Component({
  selector: 'app-washing-machine.round',
  imports: [
    ScoreboardComponent,
    NgStyle,
    TimerComponent
  ],
  templateUrl: '../multiple-choice.html',
  standalone: true,
  styleUrl: '../multiple-choice.css'
})
export class WashingMachineRoundComponent implements OnDestroy {
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
  amountOfQuestions = 7;
  @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
  maxTime = 15;
  timerSound = true;
  questionFullWidth = false;
  private inputs: ButtonState[] = [];
  private acceptInputsVar = false;
  showTime = false;

  constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router, private hue: HueLightService) {
    this.round = memory.rounds[memory.roundNumber];
    this.bgc = this.round.background;
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

    const away = {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"}
    gsap.set('#blue', away)
    gsap.set('#orange', away)
    gsap.set('#green', away)
    gsap.set('#yellow', away)
    gsap.set('#question', {y: -300, rotationX: -45, opacity: 1, ease: "back.inOut"})
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
      gsap.to('#question', {y: -300, rotationX: -45, ease: "back.inOut"})
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
    this.music.src = "/music/buzz/BTV-BL_PB.mp3";
    this.music.loop = true
    this.music.play()
    for (let i = 0; i < this.amountOfQuestions; i++) {
      this.setupNextQuestion()
      await this.waitForSpace();
      new Audio('music/wwds/frage.mp3').play();
      await new Promise(resolve => setTimeout(resolve, 250));
      this.displayQuestion(true)
      this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 50)
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.waitForSpace()
      this.displayAnswers(true)
      await new Promise(resolve => setTimeout(resolve, 500));
      this.displayTimer(true)
      await this.waitForSpace()
      await this.startTimer();
      this.hue.setColor(HueLightService.secondary, this.round.secondary, 1000, 254)
      styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
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
    while (!this.spacePressed) await new Promise(resolve => setTimeout(resolve, 250));
    this.spacePressed = false
  }

  private setupNextQuestion() {
    this.timer.resetTimer();
    this.inputs = [];
    this.questions = this.questions.slice(1, this.questions.length);
    this.currentQuestion = this.questions[0];
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
    if (this.currentQuestion.answers[0].correct) gsap.to('#blue', {duration: 0.5, borderWidth: 20})
    else gsap.to('#blue', {duration: 0.5, scale: 0.9});
    if (this.currentQuestion.answers[1].correct) gsap.to('#orange', {duration: 0.5, borderWidth: 20})
    else gsap.to('#orange', {duration: 0.5, scale: 0.9})
    if (this.currentQuestion.answers[2].correct) gsap.to('#green', {duration: 0.5, borderWidth: 20})
    else gsap.to('#green', {duration: 0.5, scale: 0.9})
    if (this.currentQuestion.answers[3].correct) gsap.to('#yellow', {duration: 0.5, borderWidth: 20})
    else gsap.to('#yellow', {duration: 0.5, scale: 0.9})
  }

  private flipToCorrect() {
    const scoreboardPlayers: ScoreboardPlayer[] = [];
    this.memory.players.forEach((player) => {
      const input = this.inputs.find(input => input.controller === player.controllerId);
      const correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
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
        pointAward: undefined,
        square: input?.button === correctInput + 1 ? {
          squareBackground: '#00000080',
          squareBorder: '#00FF00',
          squareText: "+25"
        } : undefined,
        active: false
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
        pointAward: input?.button === correctInput + 1 ? 25 : 0,
        square: undefined,
        active: false
      })
    })
    this.scoreboard.playerSubject.next([scoreboardPlayers, true])
  }
}

