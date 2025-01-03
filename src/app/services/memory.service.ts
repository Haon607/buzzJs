import { EventEmitter, Injectable } from '@angular/core';
import { Style, styledLogger } from '../../utils';
import { Category, CategoryLoader, QuestionType } from "../../Loader";
import { Player } from "../../models";

@Injectable({
    providedIn: 'root'
})
export class MemoryService {
    rounds: RoundInterface[] = [];
    roundNumber: number = 0;
    players: Player[] = [];
    category: Category | null = null;
    scoreboardKill: EventEmitter<void> = new EventEmitter<void>();
    crossMusic: HTMLAudioElement = new Audio();

    constructor() {
        this.rounds = [
            Round.punktesammler,
            Round.stopTheClock,
            Round.iLiterallyJustToldYou,
            Round.shortFuse,
            Round.wonderWall,
            Round.spotlight,
            Round.whatIsTheQuestion,
        ];
        this.roundNumber = 0;
        this.players = [
            {
                name: "Name",
                controllerId: 0,
                gameScore: 0,
            },{
                name: "Benedikt",
                controllerId: 1,
                gameScore: 0,
            },{
                name: "Waltraud",
                controllerId: 2,
                gameScore: 0,
            },{
                name: "Moritz",
                controllerId: 3,
                gameScore: 0,
            },
        ]
        this.category = CategoryLoader.videospiele;
    }

    print() {
        styledLogger("Printing Memory", Style.information)
        styledLogger("Rounds: " + this.rounds.map(round => round.name), Style.information)
        styledLogger("Round number: " + this.roundNumber, Style.information)
        styledLogger("Category: " + this.category, Style.information)
        styledLogger("Players: " + this.players, Style.information)
    }
}

export class Round {
    static punktesammler: RoundInterface = {
        name: "Punktesammler",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/punktesammler",
        iconPath: "m260-520 220-360 220 360H260ZM700-80q-75 0-127.5-52.5T520-260q0-75 52.5-127.5T700-440q75 0 127.5 52.5T880-260q0 75-52.5 127.5T700-80Zm-580-20v-320h320v320H120Zm580-60q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm-500-20h160v-160H200v160Zm202-420h156l-78-126-78 126Zm78 0ZM360-340Zm340 80Z",
        background: "#015c53",
        primary: "#20fff8",
        secondary: "#015c53"
    };
    static stopTheClock: RoundInterface = {
        name: "Stoppt die Uhr!",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/stoptheclock",
        iconPath: "M200-80q-33 0-56.5-23.5T120-160v-480q0-33 23.5-56.5T200-720h40v-200h480v200h40q33 0 56.5 23.5T840-640v480q0 33-23.5 56.5T760-80H200Zm120-640h320v-120H320v120ZM200-160h560v-480H200v480Zm280-40q83 0 141.5-58.5T680-400q0-83-58.5-141.5T480-600q-83 0-141.5 58.5T280-400q0 83 58.5 141.5T480-200Zm0-60q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm46-66 28-28-54-54v-92h-40v108l66 66Zm-46-74Z",
        background: "#5c0147",
        primary: "#e120ff",
        secondary: "#f3ade2"
    };
    static iLiterallyJustToldYou = {
        name: "Gerade sagte ich...",
        category: false,
        questionType: QuestionType.multipleChoice,
        path: "/justtold",
        iconPath: "M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131Zm-80-29L280-360H120v-240h160l200-200v640Zm80-160v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Zm-160-34v-252l-86 86H200v80h114l86 86ZM40-680v-240h240v80H120v160H40ZM680-40v-80h160v-160h80v240H680ZM300-480Z",
        background: "#00326f",
        primary: "#527da3",
        secondary: "#bf7238"
    }
    static wonderWall = {
        name: "Wunderwand",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/wonderwall",
        iconPath: "M160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h560q33 0 56.5 23.5T800-760v80h80v80h-80v80h80v80h-80v80h80v80h-80v80q0 33-23.5 56.5T720-120H160Zm0-80h560v-560H160v560Zm80-80h200v-160H240v160Zm240-280h160v-120H480v120Zm-240 80h200v-200H240v200Zm240 200h160v-240H480v240ZM160-760v560-560Z",
        background: "#000e47",
        primary: "#1c3193",
        secondary: "#84acff"
    }
    static whatIsTheQuestion = {
        name: "Was ist die Frage?",
        category: true,
        questionType: QuestionType.buzzer,
        path: "/whatisthequestion",
        iconPath: "M440-120v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80ZM120-120v-80h80v-560h-80v-80h240v80h-80v560h80v80H120Z",
        background: "#0c6100",
        primary: "#257017",
        secondary: "#d3ff5d"
    }
    static spotlight = {
        name: "Rampensau",
        category: true,
        questionType: QuestionType.buzzer,
        path: "/spotlight",
        iconPath: "M480-80q-121 0-200.5-32.5T200-220q0-75 79.5-107.5T480-360q121 0 200.5 32.5T760-220q0 75-79.5 107.5T480-80Zm0-80q-101 0-162-21t-74-59q-2 5-3 10t-1 10q0 45 65.5 72.5T480-120q109 0 174.5-27.5T720-220q0-5-1-10t-3-10q-13 38-74 59t-162 21Zm0-40q88 0 144-17t56-43q0-26-56-43t-144-17q-88 0-144 17t-56 43q0 26 56 43t144 17Zm-40-200v-200h-80l160-280v200h80L440-400Zm40 200Zm0 80Zm0-40Z",
        background: "#4b0080",
        primary: "#c00fdc",
        secondary: "#ece186"
    }
    static shortFuse = {
        name: "Tick Tack Bumm",
        category: true,
        questionType: QuestionType.buzzer,
        path: "/spotlight",
        iconPath: "M346-48q-125 0-212.5-88.5T46-350q0-125 86.5-211.5T344-648h13l27-47q12-22 36-28.5t46 6.5l30 17 5-8q23-43 72-56t92 12l35 20-40 69-35-20q-14-8-30.5-3.5T570-668l-5 8 40 23q21 12 27.5 36t-5.5 45l-27 48q23 36 34.5 76.5T646-348q0 125-87.5 212.5T346-48Zm0-80q91 0 155.5-64.5T566-348q0-31-8.5-61T532-466l-26-41 42-72-104-60-42 72h-44q-94 0-163.5 60T125-350q0 92 64.5 157T346-128Zm454-480v-80h120v80H800ZM580-828v-120h80v120h-80Zm195 81-56-56 85-85 56 56-85 85ZM346-348Z",
        background: "#980a01",
        primary: "#ff8400",
        secondary: "#ffff00"
    }
    // Liederbeginn Buzzing
    // Lieder autism highlight multiselect
}

export interface RoundInterface {
    name: string;
    questionType: QuestionType;
    category: boolean;
    path: string;
    iconPath: string;
    background: string;
    primary: string;
    secondary: string;
}
