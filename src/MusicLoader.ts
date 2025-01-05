import { shuffleArray } from './utils';
import { Category } from "./Loader";

export interface MusicQuestion {
    path: string
    information: {
        title: string
        interpret: string
        releaseYear: number
        group: boolean
        genre: Genre
        language: [Language]
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
}

export class Musicloader {
    public static loadMusic(category: Category): MusicQuestion[] {
        let musicQuestions: MusicQuestion[] = [];

        musicQuestions.push({
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


        return shuffleArray(musicQuestions.filter(category.musicFilterStatement!));
    }
}