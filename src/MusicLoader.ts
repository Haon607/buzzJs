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
    disco = "Disco",
    rock = "Rock"
}

export enum Language {
    german = "Deutsch",
    english = "Englisch",
    other = "Andere Sprachen",
}

export class Musicloader {
    static empty: MusicQuestion = {
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
        lyrics: []
    }

    public static loadMusic(category: Category): MusicQuestion[] {
        const musicQuestions: MusicQuestion[] = [];

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
                genre: Genre.schlager,
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
            highlightFrom: 54,
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
            highlightFrom: 35,
            memory: {
                from: 54,
                to: 60
            },
            lyrics: [
                "Passin' every red light",
                "I know I'm in over my head",
                "A rebel and I don't hide",
                "Remember all the words that you said",
                "Even if the love was hurtin'",
                "I'll be yours, I'll be yours again",
                "I can feel that fire's burnin'",
                "Give me more",
                "So tell me, would you feel my love?",
                "'Cause I can never get enough",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Alvaro Soler - La Cintura.mp3",
            information: {
                title: "La cintura",
                interpret: "Álvaro Soler",
                releaseYear: 2018,
                group: false,
                genre: Genre.pop,
                language: [Language.other]
            },
            highlightFrom: 47,
            memory: {
                from: 60 + 18,
                to: 60 + 21
            },
            lyrics: [
                "Destaca cuando anda, va causando impresión",
                "Cada día cuando levanta, brilla como el sol",
                "Su vestido de seda calienta mi corazón",
                "Como en una novela en la televisión, eh",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Sophie Ellis-Bextor - Murder On The Dancefloor.mp3",
            information: {
                title: "Murder On The Dancefloor",
                interpret: "Sophie Ellis-Bextor",
                releaseYear: 2001,
                group: false,
                genre: Genre.disco,
                language: [Language.english]
            },
            highlightFrom: 60 + 46,
            memory: {
                from: 60 + 1,
                to: 60 + 3
            },
            lyrics: [
                "It's murder on the dancefloor",
                "But you better not kill the groove",
                "DJ, gonna burn this goddamn house right down",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Jupiter Jones - Still Lyrics.mp3",
            information: {
                title: "Still",
                interpret: "Jupiter Jones",
                releaseYear: 2011,
                group: true,
                genre: Genre.pop,
                language: [Language.german]
            },
            highlightFrom: 57,
            memory: {
                from: 60 + 23,
                to: 60 + 27
            },
            lyrics: [
                "So still, dass jeder von uns wusste, das hier ist für immer",
                "Für immer und ein Leben und es war so still",
                "Dass jeder von uns ahnte, hierfür gibt′s kein Wort",
                "Das jemals das Gefühl beschreiben kann",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Stromae - Alors on danse (Official Video).mp3",
            information: {
                title: "Alors on danse",
                interpret: "Stromae",
                releaseYear: 2010,
                group: false,
                genre: Genre.hiphop,
                language: [Language.other]
            },
            highlightFrom: 48,
            memory: {
                from: 120 + 19,
                to: 120 + 21.5
            },
            lyrics: [
                "Qui dit étude dit travail",
                "Qui dit taf te dit les thunes",
                "Qui dit argent dit dépenses",
                "Et qui dit crédit dit créance",
                "Qui dit dette te dit huissier",
                "Et lui dit assis dans la merde",
                "Qui dit amour dit les gosses",
                "Dit toujours et dit divorce",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Village People - YMCA (OFFICIAL Music Video 1978).mp3",
            information: {
                title: "YMCA",
                interpret: "Village People",
                releaseYear: 1978,
                group: true,
                genre: Genre.disco,
                language: [Language.english]
            },
            highlightFrom: 42,
            memory: {
                from: 120 + 50,
                to: 120 + 52
            },
            lyrics: [
                "Young man there′s no need to feel down",
                "I said young man pick yourself off the ground",
                "I said young man 'cause your in a new town",
                "There′s no need to be unhappy",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Capital Cities - Safe And Sound.mp3",
            information: {
                title: "Safe And Sound",
                interpret: "Capital Cities",
                releaseYear: 2011,
                group: true,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 54,
            memory: {
                from: 32.5,
                to: 35
            },
            lyrics: [
                "I could lift you up",
                "I could show you what you want to see",
                "And take you where you want to be",
                "You could be my luck",
                "Even if the sky is falling down",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Neil Diamond - Sweet Caroline (Audio).mp3",
            information: {
                title: "Sweet Caroline",
                interpret: "Neil Diamond",
                releaseYear: 1969,
                group: false,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 120 + 10,
            memory: {
                from: 60 + 5.5,
                to: 60 + 7.5
            },
            lyrics: [
                "Where it began",
                "I can't begin to know when",
                "But then I know it's growin' strong",
                "Was in the spring",
                "And spring became the summer",
                "Who'd have believe you'd come along?",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Haus am See.mp3",
            information: {
                title: "Haus am See",
                interpret: "Peter Fox",
                releaseYear: 2008,
                group: false,
                genre: Genre.pop,
                language: [Language.german]
            },
            highlightFrom: 60 + 1,
            memory: {
                from: 180 + 3,
                to: 180 + 10
            },
            lyrics: [
                "Hier bin ich gebor'n und laufe durch die Straßen",
                "Kenn die Gesichter, jedes Haus und jeden Laden",
                "Ich muss ma' weg, kenn jede Taube hier beim Namen",
                "Daumen raus, ich warte auf 'ne schicke Frau mit schnellem Wagen",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Eddy Grant - Gimme Hope Jo Anna  1988.mp3",
            information: {
                title: "Gimme Hope Jo Anna",
                interpret: "Eddy Gran",
                releaseYear: 1988,
                group: false,
                genre: Genre.schlager,
                language: [Language.english]
            },
            highlightFrom: 44,
            memory: {
                from: 7,
                to: 10
            },
            lyrics: [
                "Well Jo'anna she runs a country",
                "She runs in Durban and the Transvaal",
                "She makes a few of her people happy oh",
                "She don't care about the rest at all",
                "She's got a system they call apartheid",
                "It keeps a brother in subjection",
                "But maybe pressure will make Jo'anna see",
                "How everybody could live as one",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Train - Drive By (Video).mp3",
            information: {
                title: "Drive By",
                interpret: "Train",
                releaseYear: 2012,
                group: true,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 37,
            memory: {
                from: 2,
                to: 5
            },
            lyrics: [
                "On the other side of a street I knew",
                "Stood a girl that looked like you",
                "I guess that's déjà vu",
                "But I thought this can't be true 'cause",
                "You moved to west L.A., or New York or Santa Fe",
                "Or wherever, to get away from me",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Ace of Base - All That She Wants (Official Music Video).mp3",
            information: {
                title: "All That She Wants",
                interpret: "Ace of Base",
                releaseYear: 1992,
                group: true,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 60 + 55,
            memory: {
                from: 120 + 5,
                to: 120 + 6
            },
            lyrics: [
                "She leads a lonely life",
                "She leads a lonely life",
                "When she woke up late in the morning light",
                "And the day had just begun",
                "She opened up her eyes and thought",
                '"Oh, what a morning"',
                "It's not a day for work",
                "It's a day for catching tan",
                "Just lying on the beach and having fun",
                "She's going to get you",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "OneRepublic - Counting Stars.mp3",
            information: {
                title: "Counting Stars",
                interpret: "OneRepublic",
                releaseYear: 2013,
                group: true,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 60 + 17,
            memory: {
                from: 30,
                to: 37
            },
            lyrics: [
                `Lately, I′ve been, I've been losing sleep`,
                `Dreaming about the things that we could be`,
                `But baby, I′ve been, I've been praying hard`,
                `Said, "No more counting dollars, we'll be counting stars`,
                `Yeah, we′ll be counting stars"`,
                `I see this life like a swinging vine`,
                `Swing my heart across the line`,
                `And in my face is flashing signs`,
                `Seek it out and ye shall find`,
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "You're The One That I Want (From “Grease”).mp3",
            information: {
                title: "You're The One That I Want",
                interpret: "John Travolta und Olivia Newton-John",
                releaseYear: 1978,
                group: false,
                genre: Genre.pop,
                language: [Language.english]
            },
            highlightFrom: 46,
            memory: {
                from: 60 + 5,
                to: 60 + 9
            },
            lyrics: [
                "I got chills, they're multiplying",
                "And I'm losing control",
                "'Cause the power you're supplying",
                "It's electrifying (electrifying)",
                "You better shape up",
                "'Cause I need a man",
                "And my heart is set on you",
                "You better shape up",
                "You better understand",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "The Rolling Stones - Start Me Up - Official Promo.mp3",
            information: {
                title: "Start Me Up",
                interpret: "The Rolling Stones",
                releaseYear: 1981,
                group: true,
                genre: Genre.rock,
                language: [Language.english]
            },
            highlightFrom: 60 + 39,
            memory: {
                from: 30,
                to: 32
            },
            lyrics: [
                "If you start me up",
                "If you start me up I′ll never stop",
                "If you start me up",
                "If you start me up I'll never stop",
                "I′ve been running hot",
                "You got me ticking, now don't blow my top",
                "If you start me up",
                "If you start me up I'll never stop",
                "Never stop, never stop, never stop",
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Dire Straits - Walk Of Life (Official Music Video).mp3",
            information: {
                title: "Walk Of Life",
                interpret: "Dire Straits",
                releaseYear: 1985,
                group: true,
                genre: Genre.rock,
                language: [Language.english]
            },
            highlightFrom: 60 +40,
            memory: {
                from: 120 + 20,
                to: 120 + 25
            },
            lyrics: [
                'Here comes Johnny singing oldies, goldies',
                '"Be-Bop-A-Lula, " "Baby What I Say"',
                'Here comes Johnny singing, "I Gotta Woman"',
                'Down in the tunnels, trying to make it pay',
                'He got the action, he got the motion',
                'Oh yeah, the boy can play',
                'Dedication, devotion',
                'Turning all the night time into the day',
            ]
        });
        musicQuestions.push({
            id: NaN,
            path: "Olivia Rodrigo - good 4 u (Official Video).mp3",
            information: {
                title: "good 4 u",
                interpret: "Olivia Rodrigo",
                releaseYear: 2021,
                group: false,
                genre: Genre.rock,
                language: [Language.english]
            },
            highlightFrom: 60 +20,
            memory: {
                from: 5.5,
                to: 6.5
            },
            lyrics: [
                "Well, good for you, I guess you moved on really easily",
                "You found a new girl, and it only took a couple weeks",
                "Remember when you said that you wanted to give me the world? (World)",
                "And good for you, I guess that you've been working on yourself",
                "I guess that therapist I found for you, she really helped",
                "Now you can be a better man for your brand-new girl",
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