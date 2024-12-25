import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonState, BuzzDeviceService } from '../../buzz-device.service';
import { Player } from '../../models';
import gsap from 'gsap';
import { NgOptimizedImage, NgStyle } from '@angular/common';

export interface PlayerData {
  playerInformation: Player;
  options: string[],
  selectedOption: number,
  joined: boolean
}

@Component({
  selector: 'app-join-game',
  templateUrl: './join-game.component.html',
  styleUrls: ['./join-game.component.css'],
  standalone: true,
  imports: [NgOptimizedImage]
})
export class JoinGameComponent {


  static options: {
    alphabet: string[], defaultOption: string[], readyOption: string[]
  } = {
    alphabet: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Ü", "Ä", "Ö"],
    defaultOption: ["Neu", "Vorhanden"],
    readyOption: ["FERTIG"],
  }
  @ViewChild('headline', {static: true}) headline!: ElementRef;
  @ViewChild('playerContainer', {static: true}) playerContainer!: ElementRef;
  players: PlayerData[] = [{
    playerInformation: new Player("", 0, 0, 0),
    options: [],
    selectedOption: NaN,
    joined: false
  }, {
    playerInformation: new Player("", 1, 0, 0),
    options: [],
    selectedOption: NaN,
    joined: false
  }, {
    playerInformation: new Player("", 2, 0, 0),
    options: [],
    selectedOption: NaN,
    joined: false
  }, {playerInformation: new Player("", 3, 0, 0), options: [], selectedOption: NaN, joined: false},];
  states: boolean[] = new Array(4).fill(true);

  constructor(private buzzService: BuzzDeviceService, private cdr: ChangeDetectorRef) {
    this.buzzService.onRelease(input => {
      if (this.players.find(player => player.playerInformation.controllerId === input.controller && player.options[0] === "STARTBEREIT")) {
        this.states[input.controller] = false;
        this.buzzService.setLeds(this.states);
      }
    })
    this.buzzService.onPress(async (input) => {
      if (input.button === 0 && !this.players.some((player) => player.playerInformation.controllerId === input.controller && player.joined)) {
        // Add new player
        this.players[input.controller] = {
          playerInformation: new Player('', input.controller, 0, 0),
          options: ['Neu', 'Vorhanden'],
          selectedOption: 0,
          joined: true,
        };

        // Trigger change detection to update the DOM
        this.cdr.detectChanges();

        // Animate the new player element
        this.animatePlayerJoin(input.controller);

        // Flash LEDs
        for (let i = 0; i < 5; i++) {
          this.states[input.controller] = i % 2 === 0;
          this.buzzService.setLeds(this.states);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } else if (this.players.some(player => player.playerInformation.controllerId === input.controller && player.joined)) {
        this.handleInput(this.players.find(player => player.playerInformation.controllerId === input.controller)!, input)
      }
    });

    this.startPulse();
  }

  updateSelectedOption(player: any, direction: number) {
    const optionsContainer = document.getElementById(`options-${player.playerInformation.controllerId}`);

    if (optionsContainer) {
      // Calculate the new index
      const previousIndex = player.selectedOption;
      player.selectedOption = (player.selectedOption + direction + player.options.length) % player.options.length;

      // Calculate the new position
      const optionHeight = 50; // Match this to the `line-height` or actual height of an option
      const newPosition = -player.selectedOption * optionHeight;

      // Animate the options container to the new position
      gsap.to(optionsContainer, { y: newPosition, duration: 0.5, ease: "power2.out" });
    }
  }

  handleInput(player: PlayerData, input: ButtonState) {
    switch (input.button) {
      case 0: // Confirm button
        this.handleConfirm(player);
        break;
      case 1: // Previous option
        this.updateSelectedOption(player, -1);
        break;
      case 2: // Next option
        this.updateSelectedOption(player, 1);
        break;
      case 3: // Delete last character
        if (player.options[0] === "FERTIG" && player.playerInformation.name.length > 0) {
          player.playerInformation.name = player.playerInformation.name.slice(0, -1);
        }
        break;
      case 4: // Reset player
        this.resetPlayer(player, input.controller);
        break;
    }
  }

  handleConfirm(player: PlayerData) {
    const selectedOption = player.options[player.selectedOption];
    if (JoinGameComponent.options.defaultOption[0]===selectedOption) {
      player.options = JoinGameComponent.options.readyOption.concat(JoinGameComponent.options.alphabet);
    } else if (JoinGameComponent.options.alphabet.includes(selectedOption)) {
      player.playerInformation.name += selectedOption;
    } else if (selectedOption === "FERTIG" && player.playerInformation.name.length > 1) {
      player.options = ["STARTBEREIT"];
      this.states[player.playerInformation.controllerId!] = false;
      this.buzzService.setLeds(this.states);
    } else if (player.options[0] === "STARTBEREIT") {
      this.states[player.playerInformation.controllerId!] = true;
      this.buzzService.setLeds(this.states);
    }
  }

  resetPlayer(player: PlayerData, controllerId: number) {
    this.players[this.players.indexOf(player)] = {
      playerInformation: new Player('', controllerId, 0, 0),
      options: JoinGameComponent.options.defaultOption,
      selectedOption: 0,
      joined: true,
    };
    this.states[player.playerInformation.controllerId!] = true;
    this.buzzService.setLeds(this.states);
  }

  private animatePlayerJoin(index: number): void {
    // Find the newly added player element
    const playerElement = document.querySelectorAll('.player')[index] as HTMLElement;

    if (playerElement) {
      // Apply GSAP animation
      gsap.fromTo(playerElement, {opacity: 0, rotation: 0}, {opacity: 1, rotation: 360, duration: 1});
    }
  }

  private async startPulse() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.buzzService.setLeds(this.states);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    for (let i = 0; i < 8; i++) {
      if (!this.players.some((player) => player.playerInformation.controllerId === i % 4 && player.joined)) {
        this.states[i % 4] = i - 4 >= 0;
        this.buzzService.setLeds(this.states);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (this.players.filter(player => player.joined).length === 4) break;
      if (i === 7) i = -1;
    }
  }
}


