import { shuffleArray } from './utils';
import { Category } from "./Loader";

export interface MusicQuestion {
    id: number
    path: string
    information: {
        title: string
        interpret: string
        releaseYear: number
        group: boolean
        genre: Genre
        language: Language[]
    }
    memory: {
        from: number,
        to: number
    }
    highlightFrom: number
    lyrics: string[]
}

export enum Genre {
    pop = "Pop",
    hiphop = "Hip Hop",
    schlager = "Schlager",
    rap = "Rap",
}

export enum Language {
    german = "Deutsch",
    english = "Englisch",
    other = "Andere Sprachen",
}

export class Musicloader {
    public static loadMusic(category: Category): MusicQuestion[] {
        let musicQuestions: MusicQuestion[] = [];

        musicQuestions.push({
            id: NaN,
            path: "a-ha - Take On Me (Official Video) [Remastered in 4K].mp3",
            information: {
                title: "Take On Me",
                interpret: "a-ha",
                releaseYear: 1985,
                group: true,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 50,
            memory: {
                from: 17,
                to: 19
            },
            lyrics: [
                "We're talking away",
                "I don't know what I'm to say",
                "I'll say it anyway",
                "Today is another day to find you",
                "Shyin' away",
                "Oh, I'll be comin' for your love, okay"
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "$oho Bani, Herbert Grönemeyer - ZEIT, DASS SICH WAS DREHT (prod. by Ericson & Drunken Masters).mp3",
            information: {
                title: "ZEIT, DASS SICH WAS DREHT",
                interpret: "$oho Bani und Herbert Grönemeyer",
                releaseYear: 2024,
                group: false,
                genre: Genre.hiphop,
                language: [Language.german]
            },
            highlightFrom: 39,
            memory: {
                from: 10,
                to: 15
            },
            lyrics: [
                "Dicka, uns're Zeit kommt, Shit, ich dreh' am Rad",
                "Und ich komm' mit paar Jungs, die haben nicht reingepasst",
                "Ich sag': „Bald gehen wir-, eh, wenn ihr so weitermacht“",
                "Dicka, meine Welt brennt, wo ist die Leidenschaft?",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Du hast mich tausendmal belogen.mp3",
            information: {
                title: "Du hast mich tausendmal belogen",
                interpret: "Andrea Berg",
                releaseYear: 2001,
                group: false,
                genre: Genre.schlager,
                language: [Language.german]
            },
            highlightFrom: 45,
            memory: {
                from: 120 + 32,
                to: 120 + 34
            },
            lyrics: [
                "Du brauchst das Gefühl, Frei zu sein",
                "Niemand sagst Du, fängt Dich ein",
                "Doch es war total liebe pur",
                "Manchmal frag ich mich warum du",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "American Authors - Best Day Of My Life.mp3",
            information: {
                title: "Best Day of My Life",
                interpret: "American Authors",
                releaseYear: 2013,
                group: true,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 42,
            memory: {
                from: 42,
                to: 44.6
            },
            lyrics: [
                "I had a dream so big and loud",
                "I jumped so high I touched the clouds",
                "Woah, oh, oh, oh, oh, oh-oh, oh",
                "Woah, oh, oh, oh, oh, oh-oh, oh",
                "I stretched my hands out to the sky",
                "We danced with monsters through the night",
                "Woah, oh, oh, oh, oh, oh-oh, oh",
                "Woah, oh, oh, oh, oh, oh-oh, oh",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Leider geil (Leider geil).mp3",
            information: {
                title: "Leider geil (Leider geil)",
                interpret: "Deichkind",
                releaseYear: 2012,
                group: true,
                genre: Genre.rap,
                language: [Language.german]
            },
            highlightFrom: 42,
            memory: {
                from: 120 + 45.3,
                to: 120 + 49.4
            },
            lyrics: [
                "Es tut mir leid, doch ich muss leider gestehen",
                "Es gibt Dinge auf der Welt, die sind (leider geil)",
                "Autos machen Dreck, Umwelt geht kaputt",
                "Doch 'ne fette neue Karre ist (leider geil)",
                "Ich knabber' an dem Buntstift, Mama sagt: „Lass das!“",
                "Doch es entpannt mich (leider geil)",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Cher - Believe (Official Music Video) [4K Remaster].mp3",
            information: {
                title: "Believe",
                interpret: "Cher",
                releaseYear: 1998,
                group: false,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 59,
            memory: {
                from: 60 + 2.74,
                to: 60 + 5.4
            },
            lyrics: [
                "No matter how hard I try",
                "You keep pushing me aside",
                "And I can't break through",
                "There's no talking to you",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "ABBA - Dancing Queen (Official Music Video).mp3",
            information: {
                title: "Dancing Queen",
                interpret: "ABBA",
                releaseYear: 1976,
                group: true,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 60 + 48,
            memory: {
                from: 120 + 10,
                to: 120 + 15
            },
            lyrics: [
                "You can dance, you can jive",
                "Having the time of your life, ooh",
                "See that girl, watch that scene",
                "Dig in the Dancing Queen"
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Ai Se Eu Te Pego (Nossa Nossa).mp3",
            information: {
                title: "Ai se eu te pego (Nossa Nossa)",
                interpret: "Michel Teló",
                releaseYear: 2011,
                group: false,
                genre: Genre.pop,
                language: [Language.other]
            },
            highlightFrom: 52,
            memory: {
                from: 22,
                to: 27
            },
            lyrics: [
                "Nossa, hein?",
                "Que que é isso!",
                "Nossa (nossa)",
                "(Assim você me mata)",
                "Ai (se eu te pego)",
                "(Ai, ai, se eu te pego)",
                "Vamo que vamo, turma!"
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Wencke Myhre - Er hat ein knallrotes Gummiboot 1970.mp3",
            information: {
                title: "Er hat ein knallrotes Gummiboot",
                interpret: "Wencke Myhre",
                releaseYear: 1970,
                group: false,
                genre: Genre.pop,
                language: [Language.german]
            },
            highlightFrom: 53.5,
            memory: {
                from: 15,
                to: 16
            },
            lyrics: [
                "Er hat ein knallrotes Gummiboot",
                "Mit diesem Gummiboot fahren wir hinaus",
                "Er hat ein knallrotes Gummiboot",
                "Und erst im Abendrot kommen wir nach Haus"
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "2RAUMWOHNUNG - 36grad (Official Video).mp3",
            information: {
                title: "36grad",
                interpret: "2raumwohnung",
                releaseYear: 2007,
                group: true,
                genre: Genre.pop,
                language: [Language.german]
            },
            highlightFrom: 54 ,
            memory: {
                from: 60 + 22,
                to: 60 + 26
            },
            lyrics: [
                "Ah-ah-ah",
                "Ah-ah-ah",
                "Ah-ah-ah",
                "Ah-ah-ah",
                "Guck mal, was die Jungs da hinten tun",
                'Und sag ihnen: "Das will ich auch"',
                "Denn immer wieder, wenn die Jungs das tun",
                "Dann merk ich, was ich brauch",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "ATB, Topic, A7S - Your Love (9PM) (Official Music Video).mp3",
            information: {
                title: "Your Love (9PM)",
                interpret: "A7S, ATB und Topic",
                releaseYear: 2021,
                group: true,
                genre: Genre.hiphop,
                language: [Language.english]
            },
            highlightFrom: 60 + 47,
            memory: {
                from: 120 + 6,
                to: 120 + 9
            },
            lyrics: [
                "Passin' every red light",
                "I know I'm in over my head",
                "A rebel and I don't hide",
                "Remember all the words that you said",
            ]
        });
        /*
        musicQuestions.push({
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
            lyrics: [

            ]
        });
        */

        for (let i = 0; i < musicQuestions.length; i++) {
            musicQuestions[i].id = i;
        }

        return shuffleArray(musicQuestions.filter(category.musicFilterStatement!));
    }
}