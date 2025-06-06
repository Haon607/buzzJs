import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ButtonState, BuzzDeviceService } from '../../services/buzz-device.service';
import { Player } from '../../../models';
import gsap from 'gsap';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { MemoryService } from '../../services/memory.service';
import { Style, styledLogger } from '../../../utils';
import { Round } from "../../../round";

export interface PlayerData {
  playerInformation: Player;
  options: string[];
  selectedOption: number;
  joined: boolean;
}

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.css'],
  standalone: true,
  imports: [NgOptimizedImage],
})
export class JoinGameComponent implements OnDestroy {
  static options = {
    alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ü', 'Ä', 'Ö'],
    defaultOption: ['Neu', 'Vorhanden'],
    readyOption: ['FERTIG'],
  };

  onThisPage: boolean;

  @ViewChild('headline', {static: true}) headline!: ElementRef;
  @ViewChild('controls', {static: true}) controls!: ElementRef;
  @ViewChild('playerContainer', {static: true}) playerContainer!: ElementRef;

  players: PlayerData[] = [
    {playerInformation: new Player('', 0, 0), options: [], selectedOption: NaN, joined: false},
    {playerInformation: new Player('', 1, 0), options: [], selectedOption: NaN, joined: false},
    {playerInformation: new Player('', 2, 0), options: [], selectedOption: NaN, joined: false},
    {playerInformation: new Player('', 3, 0), options: [], selectedOption: NaN, joined: false},
  ];

  inCustomRoundsEditor = false;
  states: boolean[] = new Array(4).fill(true);

  constructor(private buzz: BuzzDeviceService, private cdr: ChangeDetectorRef, private router: Router, private memory: MemoryService) {
    this.onThisPage = true;
    this.buzz.onRelease((input) => {
      if (this.players.find((player) => player.playerInformation.controllerId === input.controller && player.options[0] === 'STARTBEREIT')) {
        this.states[input.controller] = false;
        this.buzz.setLeds(this.states);
      }
    });

    this.buzz.onPress(async (input) => {
      await this.onPress(input);
    });

    this.startPulse();
  }

  @HostListener('document:keydown', ['$event'])
  async handleKeyboardEvent(event: KeyboardEvent) {
    if (this.inCustomRoundsEditor) {
      if (event.key === 'p') this.memory.rounds.push(Round.punktesammler);
      if (event.key === 'Backspace') this.memory.rounds.pop();
      if (event.key === 'q') {
        this.inCustomRoundsEditor = false;
        styledLogger("Quitting Round editor", Style.information);
      } else styledLogger("Selected Rounds: " + this.memory.rounds.map(round => " " + round.name), Style.information);
      return;
    }

    if (this.buzz.emulate(event.key)) this.onPress(this.buzz.emulate(event.key)!);

    if (event.key === 'i') this.memory.print();

    if (event.key === 'c') {
      this.inCustomRoundsEditor = true;
      styledLogger("Entering round editor\nCurrently loaded rounds: " + this.memory.rounds.map(round => " " + round.name), Style.information)
      styledLogger("[BACKSPACE]: remove last round\n" +
        "[p]: add Punktesammler\n" +
        "[q]: save and quit editor"
        , Style.requiresInput)
    }

    if (event.key === 'a' || event.key === '') this.populateRounds(event.key);

    // if (event.key === 'p') this.setPointsPerRound();

    if (event.key === ' ') {
      if (this.memory.rounds.length === 0) {
        styledLogger("Choose Round preset.\n" +
          "[c]: custom builder\n" +
          "[a]: all rounds"
          , Style.requiresInput)
      } else if (this.players.some(player => player.joined && player.options[0] !== "STARTBEREIT")) {
        styledLogger("Nicht alle Spieler sind bereit", Style.information);
      } else {
        await this.startGame();
      }
    }
  }

 /* private setPointsPerRound() {
    styledLogger("Opening Points per Round dialog...", Style.requiresInput)
    var input = prompt("Set initial Points per Round, currently: " + this.memory.pointsPerRound);
    let number = Number(input);
    if (isNaN(number)) {
      styledLogger("Input is not a number, aborting", Style.highlightInformation);
      return;
    }
    this.memory.pointsPerRound = number;
    styledLogger("Points per Round set to " + number, Style.information);

    styledLogger("Opening Points per Round increment dialog...", Style.requiresInput)
    input = prompt("Set initial Points per Round increment, currently: " + this.memory.pointsPerRoundIncrement);
    number = Number(input);
    if (isNaN(number)) {
      styledLogger("Input is not a number, aborting", Style.highlightInformation);
      return;
    }
    this.memory.pointsPerRoundIncrement = number;
    styledLogger("Points per Round increment set to " + number, Style.information);
    return;
  }*/

  private async startGame() {
    styledLogger("SPIELSTART", Style.speak);
    styledLogger("Spielernamen:", Style.information);
    styledLogger(this.players.filter(player => player.joined).map(player => player.playerInformation.name).join(", "), Style.speak);

    gsap.to(this.headline.nativeElement, {y: -350, opacity: 0, ease: "power1.in"})
    gsap.to(this.controls.nativeElement, {y: 250, opacity: 0, ease: "power1.in"})
    await new Promise(resolve => setTimeout(resolve, 1000));
    gsap.to(this.playerContainer.nativeElement, {x: 250, opacity: 0, ease: "power1.in"})
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (this.onThisPage) this.router.navigateByUrl('/category/000000');
  }

  updateSelectedOption(player: PlayerData, direction: number) {
    const optionsContainer = document.getElementById(`options-${player.playerInformation.controllerId}`);
    if (optionsContainer) {
      player.selectedOption = (player.selectedOption + direction + player.options.length) % player.options.length;
      const optionHeight = 50;
      const newPosition = -player.selectedOption * optionHeight;
      gsap.to(optionsContainer, {y: newPosition, duration: 0.5, ease: 'power2.out'});
    }
  }

  handleInput(player: PlayerData, input: ButtonState) {
    switch (input.button) {
      case 0:
        this.handleConfirm(player);
        break;
      case 1:
        this.updateSelectedOption(player, -1);
        break;
      case 2:
        this.updateSelectedOption(player, 1);
        break;
      case 3:
        if (player.options[0] === 'FERTIG' && player.playerInformation.name.length > 0) {
          player.playerInformation.name = player.playerInformation.name.slice(0, -1);
        }
        break;
      case 4:
        this.resetPlayer(player, input.controller);
        break;
    }
  }

  handleConfirm(player: PlayerData) {
    const selectedOption = player.options[player.selectedOption];
    if (JoinGameComponent.options.defaultOption[0] === selectedOption) {
      player.options = JoinGameComponent.options.readyOption.concat(JoinGameComponent.options.alphabet);
    } else if (JoinGameComponent.options.alphabet.includes(selectedOption)) {
      player.playerInformation.name += selectedOption;
    } else if (selectedOption === 'FERTIG' && player.playerInformation.name.length > 1) {
      player.options = ['STARTBEREIT'];
      this.states[player.playerInformation.controllerId!] = false;
      this.buzz.setLeds(this.states);
    } else if (player.options[0] === 'FERTIG') {
      styledLogger("Spieler " + player.playerInformation.controllerId + " muss einen Namen mit mehr als 2 Zeichen eingeben", Style.information)
    } else if (player.options[0] === 'STARTBEREIT') {
      this.states[player.playerInformation.controllerId!] = true;
      this.buzz.setLeds(this.states);
    }
  }

  resetPlayer(player: PlayerData, controllerId: number) {
    this.players[this.players.indexOf(player)] = {
      playerInformation: new Player('', controllerId, 0),
      options: JoinGameComponent.options.defaultOption,
      selectedOption: 0,
      joined: true,
    };
    this.states[player.playerInformation.controllerId!] = true;
    this.buzz.setLeds(this.states);
  }

  private async onPress(input: ButtonState) {
    if (input.button === 0 && !this.players.some((player) => player.playerInformation.controllerId === input.controller && player.joined)) {
      this.players[input.controller] = {
        playerInformation: new Player('', input.controller, 0),
        options: ['Neu', 'Vorhanden'],
        selectedOption: 0,
        joined: true,
      };
      this.cdr.detectChanges();
      this.animatePlayerJoin(input.controller);
      for (let i = 0; i < 5; i++) {
        this.states[input.controller] = i % 2 === 0;
        this.buzz.setLeds(this.states);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } else if (this.players.some((player) => player.playerInformation.controllerId === input.controller && player.joined)) {
      this.handleInput(this.players.find((player) => player.playerInformation.controllerId === input.controller)!, input);
    }
  }

  private animatePlayerJoin(index: number): void {
    const playerElement = document.querySelectorAll('.player')[index] as HTMLElement;
    if (playerElement) {
      gsap.fromTo(playerElement, {opacity: 0, rotation: 0}, {opacity: 1, rotation: 360, duration: 1});
    }
  }

  private async startPulse() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.buzz.setLeds(this.states);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    for (let i = 0; i < 8; i++) {
      if (!this.players.some((player) => player.playerInformation.controllerId === i % 4 && player.joined)) {
        this.states[i % 4] = i - 4 >= 0;
        this.buzz.setLeds(this.states);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (this.players.filter((player) => player.joined).length === 4 || !this.onThisPage) break;
      if (i === 7) i = -1;
    }
  }

  private populateRounds(key: string) {
    switch (key) {
      case 'a':
        this.memory.rounds = [Round.punktesammler/*TODO*/];
        break;
    }
  }

  ngOnDestroy(): void {
    this.onThisPage = false
    this.buzz.removeAllListeners()
  }
}
