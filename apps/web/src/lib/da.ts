export const da = {
  // App
  title: "Festspil",
  subtitle: "Sjove partyspil for venner og familie",

  // Landing
  createRoom: "Opret rum",
  pickGame: "Vælg et spil",

  // Join
  enterCode: "Indtast rumkode",
  enterName: "Dit navn",
  join: "Deltag",
  invalidCode: "Ugyldig rumkode",
  roomNotFound: "Rummet blev ikke fundet",
  nameTaken: "Navnet er allerede taget",

  // Lobby
  waitingForHost: "Venter på værten...",
  startGame: "Start Spil",
  playersJoined: "spillere tilsluttet",
  youreIn: "Du er med!",
  needMorePlayers: "Mindst 3 spillere",
  roomCode: "Rumkode",

  // Game common
  timeLeft: "Tid tilbage",
  round: "Runde",
  of: "af",
  submit: "Send",
  nextRound: "Næste runde",
  scores: "Point",
  gameOver: "Spillet er slut!",
  playAgain: "Spil igen",
  backToLobby: "Tilbage til lobbyen",
  lookAtScreen: "Se op på skærmen!",
  waiting: "Venter på andre...",

  // Connection
  connectionLost: "Forbindelse mistet — genopretter...",

  // Games
  duel: {
    name: "Duel",
    description: "Skriv sjove svar — stem på det bedste!",
    writeAnswer: "Skriv dit svar",
    prompt: "Spørgsmål",
    voteForBest: "Stem på det bedste svar",
    winner: "Vinder",
    quiplash: "QUIPLASH!",
  },

  bluff: {
    name: "Bluff",
    description: "Find det rigtige svar blandt løgnene",
    writeFake: "Skriv et falsk svar",
    guessReal: "Gæt det rigtige svar",
    theRealAnswer: "Det rigtige svar var:",
    youFooled: "Du narrede",
    players: "spillere",
  },

  tegn: {
    name: "Tegn & Gæt",
    description: "Tegn på din telefon — andre gætter!",
    draw: "Tegn!",
    guess: "Skriv dit gæt",
    theWordWas: "Ordet var:",
    clear: "Ryd",
    undo: "Fortryd",
  },
} as const;
