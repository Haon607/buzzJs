import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { NgStyle } from "@angular/common";
import { ScoreboardPlayer, ScoreboardService } from "../../../services/scoreboard.service";
import gsap from 'gsap';
import { Question, QuestionLoader } from "../../../../Loader";
import { TimerComponent } from "../../timer/timer.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonState, BuzzDeviceService } from "../../../services/buzz-device.service";
import { MusicFader, shuffleArray, Style, styledLogger } from "../../../../utils";
import { inputToColor } from "../../../../models";

@Component({
  selector: 'app-punktesammler.round',
  imports: [
    ScoreboardComponent,
    NgStyle,
    TimerComponent
  ],
  templateUrl: '../multiple-choice.html',
  standalone: true,
  styleUrl: '../multiple-choice.css'
})
export class StopTheClockRoundComponent implements OnDestroy {
  bgc: string;
  round: RoundInterface;
  currentQuestion: Question = {
    question: "", answers: [
      {answer: "", correct: true}, {answer: "", correct: false}, {answer: "", correct: false}, {answer: "", correct: false},
    ], shuffle: false
  };
  questions: Question[] = [this.currentQuestion];
  spacePressed: boolean = false;
  music: HTMLAudioElement = new Audio();
  timerDone: boolean = false;
  @ViewChild(TimerComponent) timer: TimerComponent = new TimerComponent();
  amountOfQuestions= 1
  private inputs: ButtonState[] = [];
  private acceptInputsVar: boolean = false;
  maxTime: number = 0;

  constructor(private memory: MemoryService, private scoreboard: ScoreboardService, private route: ActivatedRoute, private buzz: BuzzDeviceService, private router: Router) {
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

    let away = {rotateY: 88, x: -1150, opacity: 1, ease: "sine.inOut"}
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
    let time = 100;
    let see = {rotateY: 2, x: 30, ease: "back.inOut"}
    let away = {rotateY: 88, x: -1150, scale: 1, borderWidth: 5, ease: "back.inOut"}
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
    this.music.src = "/music/buzz/BBotW-stop_the_clock.mp3";
    this.music.loop = true
    this.music.play()
    for (let i = 0; i < this.amountOfQuestions; i++) {
      this.setupNextQuestion()
      await this.waitForSpace();
      this.displayQuestion(true)
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.waitForSpace()
      this.displayAnswers(true)
      await new Promise(resolve => setTimeout(resolve, 500));
      this.displayTimer(true)
      await this.waitForSpace()
      await this.startTimer();
      styledLogger("Richtige Antwort: " + this.currentQuestion.answers.find(ans => ans.correct)?.answer, Style.information)
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.revealAnswers();
      await this.waitForSpace();
      this.revealCorrect();
      await new Promise(resolve => setTimeout(resolve, 500));
      if (i+1 === this.amountOfQuestions) {
        new MusicFader().fadeOut(this.music, 1000);
        await new Promise(resolve => setTimeout(resolve, 500));
        this.memory.crossMusic = new Audio('/music/levelhead/Your Goods Delivered Real Good.mp3');
        this.memory.crossMusic.volume = 0.2;
        this.memory.crossMusic.play()
      }
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
    this.router.navigateByUrl("/category/" + this.bgc.slice(1, this.bgc.length));
  }

  private onPress(buttonState: ButtonState) {
    if (this.acceptInputsVar && buttonState.button !== 0) {
      if (!this.inputs.some(input => input.controller === buttonState.controller)) {
        this.inputs.push(buttonState);
        let states = new Array(4).fill(true);
        for (let input of this.inputs) {
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
    this.timer.startTimer()
    this.acceptInputs(true);
    while (!this.timerDone && this.inputs.length < this.memory.players.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    this.timer.stopTimer()
    this.acceptInputs(false)


  }

  private acceptInputs(tf: boolean) {
    this.acceptInputsVar = tf;
    if (tf) {
      let states = new Array(4).fill(false);
      for (let player of this.memory.players) {
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
    let scoreboardPlayers: ScoreboardPlayer[] = [];
    this.memory.players.forEach((player) => {
      let input = this.inputs.find(input => input.controller === player.controllerId);
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

  onTimeExpired() {
    this.timerDone = true
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
    let scoreboardPlayers: ScoreboardPlayer[] = [];
    this.memory.players.forEach((player) => {
      let input = this.inputs.find(input => input.controller === player.controllerId);
      let correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
      scoreboardPlayers.push({
        name: player.name,
        score: player.gameScore,
        pointAward: 25,
        square: input ? {
          squareBackground: inputToColor(input.button),
          squareBorder: input.button-1 === correctInput ? '#00FF00' : '#FF0000',
        } : undefined,
        active: false
      })
    })
    this.scoreboard.playerSubject.next([scoreboardPlayers, true])
  }

  private flipToPoints() {
    let scoreboardPlayers: ScoreboardPlayer[] = [];
    this.memory.players.forEach((player) => {
      let input = this.inputs.find(input => input.controller === player.controllerId);
      let correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
      scoreboardPlayers.push({
        name: player.name,
        score: player.gameScore,
        pointAward: undefined,
        square: input?.button === correctInput+1 ? {
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
    let scoreboardPlayers: ScoreboardPlayer[] = [];
    let correctInput = this.currentQuestion.answers.indexOf(this.currentQuestion.answers.find(ans => ans.correct)!);
    this.memory.players.forEach((player) => {
      let input = this.inputs.find(input => input.controller === player.controllerId);
      scoreboardPlayers.push({
        name: player.name,
        score: player.gameScore,
        pointAward: input?.button === correctInput+1 ? 25 : 0,
        square: undefined,
        active: false
      })
    })
    this.scoreboard.playerSubject.next([scoreboardPlayers, true])
  }
}