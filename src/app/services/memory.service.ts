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
            Round.drawing,
            Round.waitForIt,
            Round.whatIsTheQuestion,
            Round.spotlight,
            Round.skipping,
            Round.musicBox,
            Round.stopTheClock,
            Round.fastestFinger,
            Round.punktesammler,
            // Round.wonderWall,
            // Round.timeline,
            // Round.shortFuse,
            // Round.stealing,
            // Round.iLiterallyJustToldYou,
        ];
        this.roundNumber = 0;
        this.players = [
            {
                name: "Name",
                controllerId: 0,
                gameScore: 11,
            }, {
                name: "Benedikt",
                controllerId: 1,
                gameScore: 10,
            }, {
                name: "Waltraud",
                controllerId: 2,
                gameScore: 0,
            }, {
                name: "Moritz",
                controllerId: 3,
                gameScore: -10,
            },
        ]
        this.category = CategoryLoader.inDiesemJahr;
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
        secondary: "#015c53",
        rules: ""
    };
    static stopTheClock: RoundInterface = {
        name: "Stoppt die Uhr!",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/stoptheclock",
        iconPath: "M200-80q-33 0-56.5-23.5T120-160v-480q0-33 23.5-56.5T200-720h40v-200h480v200h40q33 0 56.5 23.5T840-640v480q0 33-23.5 56.5T760-80H200Zm120-640h320v-120H320v120ZM200-160h560v-480H200v480Zm280-40q83 0 141.5-58.5T680-400q0-83-58.5-141.5T480-600q-83 0-141.5 58.5T280-400q0 83 58.5 141.5T480-200Zm0-60q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm46-66 28-28-54-54v-92h-40v108l66 66Zm-46-74Z",
        background: "#5c0147",
        primary: "#e120ff",
        secondary: "#f3ade2",
        rules: ""
    };
    static iLiterallyJustToldYou = {
        name: "Gerade sagte ich...",
        category: false,
        questionType: QuestionType.multipleChoice,
        path: "/justtold",
        iconPath: "M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131Zm-80-29L280-360H120v-240h160l200-200v640Zm80-160v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Zm-160-34v-252l-86 86H200v80h114l86 86ZM40-680v-240h240v80H120v160H40ZM680-40v-80h160v-160h80v240H680ZM300-480Z",
        background: "#00326f",
        primary: "#527da3",
        secondary: "#bf7238",
        rules: ""
    }
    static wonderWall = {
        name: "Wunderwand",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/wonderwall",
        iconPath: "M160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h560q33 0 56.5 23.5T800-760v80h80v80h-80v80h80v80h-80v80h80v80h-80v80q0 33-23.5 56.5T720-120H160Zm0-80h560v-560H160v560Zm80-80h200v-160H240v160Zm240-280h160v-120H480v120Zm-240 80h200v-200H240v200Zm240 200h160v-240H480v240ZM160-760v560-560Z",
        background: "#000e47",
        primary: "#1c3193",
        secondary: "#84acff",
        rules: ""
    }
    static whatIsTheQuestion = {
        name: "Lückentext",
        category: true,
        questionType: QuestionType.openEnded,
        path: "/whatisthequestion",
        iconPath: "M440-120v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-640v-80h80v80h-80Zm160 640v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80Zm0-160v-80h80v80h-80ZM120-120v-80h80v-560h-80v-80h240v80h-80v560h80v80H120Z",
        background: "#0c6100",
        primary: "#257017",
        secondary: "#d3ff5d",
        rules: ""
    }
    static spotlight = {
        name: "Rampensau",
        category: false,
        questionType: QuestionType.openEnded,
        path: "/spotlight",
        iconPath: "M480-80q-121 0-200.5-32.5T200-220q0-75 79.5-107.5T480-360q121 0 200.5 32.5T760-220q0 75-79.5 107.5T480-80Zm0-80q-101 0-162-21t-74-59q-2 5-3 10t-1 10q0 45 65.5 72.5T480-120q109 0 174.5-27.5T720-220q0-5-1-10t-3-10q-13 38-74 59t-162 21Zm0-40q88 0 144-17t56-43q0-26-56-43t-144-17q-88 0-144 17t-56 43q0 26 56 43t144 17Zm-40-200v-200h-80l160-280v200h80L440-400Zm40 200Zm0 80Zm0-40Z",
        background: "#4b0080",
        primary: "#4b0080",
        secondary: "#ffe900",
        rules: ""
    }
    static shortFuse = {
        name: "Tick Tack Bumm",
        category: true,
        questionType: QuestionType.openEnded,
        path: "/shortfuse",
        iconPath: "M346-48q-125 0-212.5-88.5T46-350q0-125 86.5-211.5T344-648h13l27-47q12-22 36-28.5t46 6.5l30 17 5-8q23-43 72-56t92 12l35 20-40 69-35-20q-14-8-30.5-3.5T570-668l-5 8 40 23q21 12 27.5 36t-5.5 45l-27 48q23 36 34.5 76.5T646-348q0 125-87.5 212.5T346-48Zm0-80q91 0 155.5-64.5T566-348q0-31-8.5-61T532-466l-26-41 42-72-104-60-42 72h-44q-94 0-163.5 60T125-350q0 92 64.5 157T346-128Zm454-480v-80h120v80H800ZM580-828v-120h80v120h-80Zm195 81-56-56 85-85 56 56-85 85ZM346-348Z",
        background: "#980a01",
        primary: "#ff8400",
        secondary: "#ffff00",
        rules: ""
    }
    static fastestFinger = {
        name: "Schnell am Drücker!",
        category: true,
        questionType: QuestionType.openEnded,
        path: "/fastest",
        iconPath: "m226-559 78 33q14-28 29-54t33-52l-56-11-84 84Zm142 83 114 113q42-16 90-49t90-75q70-70 109.5-155.5T806-800q-72-5-158 34.5T492-656q-42 42-75 90t-49 90Zm178-65q-23-23-23-56.5t23-56.5q23-23 57-23t57 23q23 23 23 56.5T660-541q-23 23-57 23t-57-23Zm19 321 84-84-11-56q-26 18-52 32.5T532-299l33 79Zm313-653q19 121-23.5 235.5T708-419l20 99q4 20-2 39t-20 33L538-80l-84-197-171-171-197-84 167-168q14-14 33.5-20t39.5-2l99 20q104-104 218-147t235-24ZM157-321q35-35 85.5-35.5T328-322q35 35 34.5 85.5T327-151q-25 25-83.5 43T82-76q14-103 32-161.5t43-83.5Zm57 56q-10 10-20 36.5T180-175q27-4 53.5-13.5T270-208q12-12 13-29t-11-29q-12-12-29-11.5T214-265Z",
        background: "#232ED1",
        primary: "#087E8B",
        secondary: "#FF5A5F",
        rules: ""
    }
    static stealing = {
        name: "Diebstahl",
        category: true,
        questionType: QuestionType.openEnded,
        path: "/stealing",
        iconPath: "M440-240q116 0 198-81.5T720-520q0-116-82-198t-198-82q-117 0-198.5 82T160-520q0 117 81.5 198.5T440-240Zm0-280Zm0 160q-83 0-147.5-44.5T200-520q28-70 92.5-115T440-680q82 0 146.5 45T680-520q-29 71-93.5 115.5T440-360Zm0-60q55 0 101-26.5t72-73.5q-26-46-72-73t-101-27q-56 0-102 27t-72 73q26 47 72 73.5T440-420Zm0-40q25 0 42.5-17t17.5-43q0-25-17.5-42.5T440-580q-26 0-43 17.5T380-520q0 26 17 43t43 17Zm0 300q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T80-520q0-74 28.5-139.5t77-114.5q48.5-49 114-77.5T440-880q74 0 139.5 28.5T694-774q49 49 77.5 114.5T800-520q0 64-21 121t-58 104l159 159-57 56-159-158q-47 37-104 57.5T440-160Z",
        background: "#300057",
        primary: "#9900ff",
        secondary: "#ff96ff",
        rules: ""
    } // Buzzern? Prozentuales Stehlen von Punkten GLOBALER TIMER
    static waitForIt = {
        name: "Abwarten...",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/wait",
        iconPath: "M340-520q42 0 71-29t29-71v-100H240v100q0 42 29 71t71 29ZM240-240h200v-100q0-42-29-71t-71-29q-42 0-71 29t-29 71v100Zm-140 80v-80h60v-100q0-42 18-78t50-62q-32-26-50-62t-18-78v-100h-60v-80h480v80h-60v100q0 42-18 78t-50 62q32 26 50 62t18 78v100h60v80H100Zm640 0v-488l-44 44-56-56 140-140 140 140-57 56-43-43v487h-80ZM340-720Zm0 480Z",
        background: "#231c30",
        primary: "#8F0000",
        secondary: "#33009a",
        rules: ""
    } // Wait for it, Hintere Plätze maybe mehr punkte?
    static optIn = {
        name: "Einsteigen bitte",
        category: true,
        questionType: QuestionType.multipleChoice,
        path: "/optin",
        iconPath: "M320-200q-117 0-198.5-81.5T40-480q0-117 81.5-198.5T320-760h320q117 0 198.5 81.5T920-480q0 117-81.5 198.5T640-200H320Zm0-80h320q83 0 141.5-58.5T840-480q0-83-58.5-141.5T640-680H320q-83 0-141.5 58.5T120-480q0 83 58.5 141.5T320-280Zm10-80h60v-90h90v-60h-90v-90h-60v90h-90v60h90v90Zm290 0h60v-240H560v60h60v180ZM480-480Z",
        background: "",
        primary: "",
        secondary: "",
        rules: ""
    } //Maybe prozentuale punkte
    static massAnswers = {
        name: "Massenhafte Antworten",
        category: true,
        questionType: QuestionType.openEnded,
        path: "/mass",
        iconPath: "",
        background: "",
        primary: "",
        secondary: "",
        rules: ""
    } //drawful (2) music, buzz to answer
    static musicBox = {
        name: "Ab der ersten Sekunde",
        category: true,
        questionType: QuestionType.music,
        path: "/musicbox",
        iconPath: "M320-320h80v-320h-80v320Zm160 0 240-160-240-160v320Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
        background: "#1A1F4A",
        primary: "#6600ff",
        secondary: "#00FFC3",
        rules: "Ein Lied beginnt zu spielen, wer glaubt es zu erkennen, drückt den Buzzer und die Musik stoppt. Punkte gibts, wenn entweder der Liedtitel exakt richtig ist, oder der Interpret richtig ist und der Titel so ein bissl stimmt. Je schneller, desto mehr Punkte."
    } //Von anfang an, buzzern, titel und interpret
    static musicalMemory = {
        name: "Musikalisches Gedächtnis",
        category: true,
        questionType: QuestionType.music,
        path: "/musicmemory",
        iconPath: "M140-640q38-109 131.5-174.5T480-880q82 0 155.5 35T760-746v-134h80v240H600v-80h76q-39-39-90-59.5T480-800q-81 0-149.5 43T227-640h-87ZM420-80q-58 0-99-41t-41-99q0-58 41-99t99-41q16 0 31 3t29 10v-213h200v80H560v260q0 58-41 99t-99 41Z",
        background: "",
        primary: "",
        secondary: "",
        rules: ""
    } // Nur memory segment, auch mehrmals, multiple choice
    static textAware = {
        name: "Textsicher",
        category: true,
        questionType: QuestionType.music,
        path: "/textaware",
        iconPath: "M120-200v-240h720v240H120Zm0-320v-80h720v80H120Zm0-160v-80h720v80H120Z",
        background: "",
        primary: "",
        secondary: "",
        rules: ""
    } // nur text, multiple choice, antwort nach geschwindigkeit
    static skipping = {
        name: "Mixtape",
        category: true,
        questionType: QuestionType.music,
        path: "/musicskipping",
        iconPath: "M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z",
        background: "#4e4a3d",
        primary: "#99ff00",
        secondary: "#ff003c",
        rules: "Teile zwei Lieder werden in zufälliger reihenfolge gespielt, wer glaubt beide zu erkennen, drückt den Buzzer und die Musik stoppt. Punkte gibts, wenn entweder die Liedtitel exakt richtig ist, oder die Interpreten richtig sind und die Titel so ein bissl stimmten. Je schneller, desto mehr Punkte."
    } //shuffeln von segmenten, buzzern, titel und interpret
    static timeline = {
        name: "Hitster",
        category: false,
        questionType: QuestionType.music,
        path: "/timeline",
        iconPath: "m360-240 56-56-62-64h166v-80H354l62-64-56-56-160 160 160 160Zm240-160 160-160-160-160-56 56 62 64H440v80h166l-62 64 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z",
        background: "#002929",
        primary: "#5e60ce",
        secondary: "#64dfdf",
        rules: ""
    } //lieder richtig in timeline einräumen
    static waschmaschine = {
        name: "Waschmaschine",
        category: false,
        questionType: QuestionType.music,
        path: "/waschmaschine",
        iconPath: "",
        background: "",
        primary: "",
        secondary: "",
        rules: ""
    } //drei lieder gleichzeitig spielen mit so abwechselnder lautstärke, danach "welches lied war nicht zu hören" ahh frage ODER WAS IST MIT STEREO?? ODER DIMENSIONAL??
    static drawing = {
        name: "Mal'mal",
        category: false,
        questionType: QuestionType.drawing,
        path: "/drawing",
        iconPath: "m499-287 335-335-52-52-335 335 52 52Zm-261 87q-100-5-149-42T40-349q0-65 53.5-105.5T242-503q39-3 58.5-12.5T320-542q0-26-29.5-39T193-600l7-80q103 8 151.5 41.5T400-542q0 53-38.5 83T248-423q-64 5-96 23.5T120-349q0 35 28 50.5t94 18.5l-4 80Zm280 7L353-358l382-382q20-20 47.5-20t47.5 20l70 70q20 20 20 47.5T900-575L518-193Zm-159 33q-17 4-30-9t-9-30l33-159 165 165-159 33Z",
        background: "#88FF88",
        primary: "#8888FF",
        secondary: "#FF8888",
        rules: ""
    }
    // Audience Knowledge?
    // Autism Knowledge explaining
    // Irgend eine art von Teamspiel
    // Streak?
    // Pikmin 3 formidable oak

    //SKILL GAMES (Mii News (Breaking News) - Tomodachi Life Music Extended [OST])

    /*
    background: "#FFFFFF",
    primary: "#edb3d9",
    secondary: "#a9d7e8",
    */
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
    rules: string;
}
