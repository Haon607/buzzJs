import { EventEmitter, Injectable } from '@angular/core';
import { randomNumber, Style, styledLogger } from '../../utils';
import { Category, CategoryLoader } from "../../Loader";
import { Player } from "../../models";
import { Round, RoundInterface } from "./round";

@Injectable({
    providedIn: 'root'
})
export class MemoryService {
    rounds: RoundInterface[] = [];
    roundNumber = 0;
    players: Player[] = [];
    category: Category | null = null;
    scoreboardKill: EventEmitter<void> = new EventEmitter<void>();
    crossMusic: HTMLAudioElement = new Audio();
    // pointsPerRound: number = 100;
    // pointsPerRoundIncrement: number = 25;

    constructor() {
        this.rounds = [
          // Round.itLiterallyJustHappened,
            Round.drawing,
            Round.streak,
            // Round.washingMachine,
            Round.punktesammler,
            // Round.wonderWall,
            // Round.iLiterallyJustToldYou,
            Round.timeline,
            Round.waitForIt,
            Round.textAware,
            Round.whatIsTheQuestion,
            Round.spotlight,
            Round.skipping,
            Round.musicBox,
            Round.stopTheClock,
            // Round.shortFuse,
            // Round.stealing,
            // Round.fastestFinger,
            Round.final10,
            // Round.savePoints
        ];
        this.roundNumber = 0;
        // this.pointsPerRound = 100;
        // this.pointsPerRoundIncrement = 25;
        this.players = [
            {
                name: "Name",
                controllerId: 0,
                gameScore: randomNumber(0,10000),
                finalPercentage: randomNumber(0,100),
                perks: null
            }, {
                name: "Benedikt",
                controllerId: 1,
                gameScore: randomNumber(0,10000),
                finalPercentage: randomNumber(0,100),
                perks: null
            }, {
                name: "Waltraud",
                controllerId: 2,
                gameScore: randomNumber(0,10000),
                finalPercentage: randomNumber(0,100),
                perks: null
            }, {
                name: "Moritz",
                controllerId: 3,
                gameScore: randomNumber(0,10000),
                finalPercentage: randomNumber(0,100),
                perks: null
            },
        ]
        this.category = CategoryLoader.videogames;
    }

    print() {
        styledLogger("Printing Memory", Style.highlightInformation)
        styledLogger("Rounds:" + this.rounds.map(round => " " + round.name), Style.information)
        styledLogger("Round number: " + this.roundNumber, Style.information)
        // styledLogger("Points per Round: " + this.pointsPerRound, Style.information)
        // styledLogger("Points per Round increment: " + this.pointsPerRoundIncrement, Style.information)
        // styledLogger("Points at stake this Round: " + this.calculatePointsPerOpportunity(1), Style.information)
        styledLogger("Category: " + this.category?.name, Style.information)
        styledLogger("Players:" + this.players.map(player => " " + player.controllerId + " " + player.name + " " + player.gameScore + " " + player.finalPercentage + "%").join("; "), Style.information)
    }

    // calculatePointsPerOpportunity(opportunities: number) {
    //     return Math.floor((this.pointsPerRound + (this.pointsPerRoundIncrement * this.roundNumber)) / opportunities)
    // }
}
