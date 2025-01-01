import { Component } from '@angular/core';
import { ScoreboardComponent } from "../../scoreboard/scoreboard.component";
import { MemoryService, RoundInterface } from "../../../services/memory.service";
import { NgStyle } from "@angular/common";
import { ScoreboardService } from "../../../services/scoreboard.service";
import { randomNumber } from "../../../../utils";

@Component({
  selector: 'app-punktesammler.round',
  imports: [
    ScoreboardComponent,
    NgStyle
  ],
  templateUrl: '../multiple-choice.html',
  standalone: true,
  styleUrl: '../multiple-choice.css'
})
export class PunktesammlerRoundComponent {
  bgc: string;
  round: RoundInterface;

  constructor(private memory: MemoryService, private scoreboard: ScoreboardService) {
    this.round = memory.rounds[memory.roundNumber];
    this.bgc = this.round.background
    this.setupWithDelay();
  }

  private async setupWithDelay() {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(this.memory.players)
    this.scoreboard.playerSubject.next([this.memory.players.map(player => {return {
      name: player.name,
      score: player.gameScore,
      pointAward: undefined,
      active: false,
      square: undefined
    }}), false])

    await new Promise(resolve => setTimeout(resolve, 1000));
    this.scoreboard.playerSubject.next([this.memory.players.map(player => {return {
      name: player.name,
      score: player.gameScore,
      pointAward: undefined,
      active: false,
      square: {squareBackground: '#F00', squareBorder: '#0F0'},
    }}), false])
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.scoreboard.playerSubject.next([this.memory.players.map(player => {return {
      name: player.name,
      score: player.gameScore,
      pointAward: undefined,
      active: false,
      square: {squareBackground: '#0F0', squareBorder: '#F00', squareText: "HELLA\n1000"},
    }}), true])
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.scoreboard.playerSubject.next([this.memory.players.map(player => {return {
      name: player.name,
      score: player.gameScore,
      pointAward: undefined,
      active: true,
      square: {squareBackground: '#0F0', squareBorder: '#F00', squareText: "BEN"},
    }}), true])
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.scoreboard.playerSubject.next([this.memory.players.map(player => {return {
      name: player.name,
      score: player.gameScore,
      pointAward: randomNumber(0, 100),
      active: true,
      square: undefined
    }}), true])

    await new Promise(resolve => setTimeout(resolve, 5000));
    this.scoreboard.sortSubject.next()
    return;
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.scoreboard.playerSubject.next([this.memory.players.map(player => {return {
      name: player.name,
      score: player.gameScore,
      pointAward: undefined,
      active: false,
      square: {squareBackground: '#F00', squareBorder: '#0F0'},
    }}), false])
  }
}
