const WebSocket = require('ws')
const Methods = require('./methods')
const { naipeOrder } = require('../constants/naipeOrder')
const { strengthOrder } = require('../constants/strengthOrder')
const { cards } = require('../constants/cards')
var moment = require('moment');

const { normalizePort, safeParseJSON, generateError } = require('../helpers')

// todo check why so many connections variable
// users connected to the server
let connections = [];
let connectedPlayers = [];
let playersLastSeen = {
    p0: {connected: false, lastSeen: null},
    p1: {connected: false, lastSeen: null},
    p2: {connected: false, lastSeen: null},
    p3: {connected: false, lastSeen: null},
}

// the current game all player hands
let hands = [];

// the current game manilha
let manilha = null;

let handling = [];

// the current game scoreboard
let scoreboard = {
    team1: {
        score: 0,
        players: ['',''],
    },
    team2: {
        score: 0,
        players: ['',''],
    }
};

// todo truco feature
let trucado = 1;

// todo o que é isso
let roundTurn = '';
let handTurn = '';

// the current game round
let round = 0;

// each round pontuation
let points = [
    {},
    {},
    {}
];

// pick a random card from the available cards
const pickRandomCard = (availableCards) => {
    let pickedCardIndex = Math.floor(Math.random() * (availableCards.length));
    return { pickedCard: availableCards[pickedCardIndex], pickedCardIndex }
}

// deal cards to players
const dealCards = () => {
    hands = [];
    manilha = null;
    // copy the cards array to avoid mutating the original array
    let availableCards = [...cards];
    const _hands = [];
    // there are 4 players to deal cards
    [...Array(4)].forEach(() => {
        const hand = [];
        // each player has 3 cards
        [...Array(3)].forEach(() => {
            // pick a random card from the available cards
            const {pickedCard, pickedCardIndex} = pickRandomCard(availableCards);
            // remove the card from the available card
            availableCards.splice(pickedCardIndex, 1);
            hand.push(pickedCard);
        })
        _hands.push(hand);
    })

    // distribute hands to players
    hands = _hands.map((h, i) => ({cards: _hands[i], player: connectedPlayers[i]}))

    // generate "manilha"
    const {pickedCard, pickedCardIndex} = pickRandomCard(availableCards);
    availableCards.splice(pickedCardIndex, 1);
    manilha = pickedCard;
}

const handleRoundWinner = () => {
    setTimeout(() => {
        let winnerIndex;
        let draw;

        // gather all cards from hands
        const cards = handling.map(h => h.card);
        // check for manilhas
        const manilhas = cards.filter(cc => strengthOrder[strengthOrder.indexOf(cc.nr) - 1] === manilha.nr);
        const manilhasLength = manilhas.length;

        if (manilhasLength) {
            if (manilhasLength > 1) {
                let cardLevels = [];

                // create an array with the manilha level
                manilhas.forEach(m => {{
                    cardLevels.push(naipeOrder.indexOf(m.naipe));}
                });

                // get the winner naipe index
                let winnerNaipe = naipeOrder[Math.max(...cardLevels)];

                // get the card number from manilhas list with the winner index
                let winnerNr = manilhas.find(m => m.naipe === winnerNaipe).nr;

                // set the winner index from cards list
                cards.some((card, i) => {
                    if (winnerNr === card.nr && winnerNaipe === card.naipe) {
                        winnerIndex = i;
                        return true;
                    }
                    return false;
                });
            } else {
                // there is only one manilha
                const _manilha = manilhas[0];
                // find the winner index with the manilha
                cards.some((card, i) => {
                    if (_manilha.nr === card.nr && _manilha.naipe === card.naipe) {
                        winnerIndex = i;
                        return true;
                    }
                    return false;
                });
            }
        } else {
            // there is no manilha
            let _strengthOrder = [...strengthOrder];
            // find the manilha number in the strength order
            let manilhaNumber = _strengthOrder.find(s => s === manilha.nr);
            // remove the manilha number from the strength order
            _strengthOrder.splice(_strengthOrder.indexOf(manilha.nr), 1);
            // add the manilha number to the end of the strength order because it is the strongest card
            // TODO for the strongest because it should not be the last
            _strengthOrder.splice(_strengthOrder.length + 1, 0, manilhaNumber);


            let cardLevels = [];
            for (let i = 0; i <= 3; i++) {
                cardLevels.push(strengthOrder.indexOf(strengthOrder.find(so => so === handling[i].card.nr)));
            }
            const biggestCard = Math.max(...cardLevels);
            const cardNrs = cards.map(c => c.nr);
            if (new Set(cardNrs).size !== cardNrs.length) {
                const repeateds = cardNrs.filter((item, index) => cardNrs.indexOf(item) !== index);
                if (repeateds.length === 1) {
                    if (biggestCard === strengthOrder.indexOf(repeateds[0])) {
                        const biggestRepeatedCard = repeateds.find(r => strengthOrder.indexOf(r) === biggestCard);
                        const repeatedCardsHands = handling.filter(h => h.card.nr === biggestRepeatedCard);
                        const repeatedPlayers = repeatedCardsHands.map(rch => rch.player);
                        if (scoreboard.team1.players.find(p => repeatedPlayers.includes(p)) &&
                            scoreboard.team2.players.find(p => repeatedPlayers.includes(p))) {
                            draw = true;
                        } else {
                            if (scoreboard.team1.players.find(p => repeatedPlayers.includes(p))) {
                                handling.find((h, i) => {
                                    if (scoreboard.team1.players.includes(h.player)) {
                                        winnerIndex = i;
                                        return true;
                                    }
                                    return false;
                                });
                            } else {
                                handling.find((h, i) => {
                                    if (scoreboard.team2.players.includes(h.player)) {
                                        winnerIndex = i;
                                        return true;
                                    }
                                    return false;
                                });
                            }
                        }
                    }
                } else {
                    const biggestRepeatedCard = repeateds.find(r => strengthOrder.indexOf(r) === biggestCard);
                    const repeatedCardsHands = handling.filter(h => h.card.nr === biggestRepeatedCard);
                    // check if repeated are from same team
                    const repeatedPlayers = repeatedCardsHands.map(rch => rch.player);
                    if (scoreboard.team1.players.find(p => repeatedPlayers.includes(p)) &&
                        scoreboard.team2.players.find(p => repeatedPlayers.includes(p))) {
                        draw = true;
                    } else {
                        if (scoreboard.team1.players.find(p => repeatedPlayers.includes(p))) {
                            handling.find((h, i) => {
                                if (scoreboard.team1.players.includes(h.player)) {
                                    winnerIndex = i;
                                    return true;
                                }
                                return false;
                            });
                        } else {
                            handling.find((h, i) => {
                                if (scoreboard.team2.players.includes(h.player)) {
                                    winnerIndex = i;
                                    return true;
                                }
                                return false;
                            });
                        }
                    }
                }
            }
            winnerIndex = cardLevels.indexOf(biggestCard);
        }
        scoreHandler(draw ? null : handling[winnerIndex].player)
    }, 2500);
}

const scoreHandler = (winnerPlayer) => {
    const isDraw = !winnerPlayer;
    let winnerTeam;
    let finishedRound;
    if (scoreboard.team1.players.find(p => winnerPlayer === p)) {
        winnerTeam = 'team1';
    } else {
        winnerTeam = 'team2';
    }
    if (isDraw) {
        // mão empatada
        points[round] = {draw: true};
        if (round === 1 || round === 2) {
            // mao empatada na segunda ou ultima rodada, quem ganhou a primeira mão leva
            if (scoreboard.team1.players.find(p => points[0].winner === p)) {
                scoreboard.team1.score = scoreboard.team1.score + 1;
            } else {
                scoreboard.team2.score = scoreboard.team2.score + 1;
            }
            finishedRound = true;
            round = 0;
        } else {
            // mao empatada na primeira rodada, só mantém empate e não pontua
            round = round + 1;
        }
    } else {
        points[round] = {winner: winnerPlayer};
         if (round === 1) {
             // segunda mão
             console.log('// segunda mão');
            if (points[0].draw) {
                // segunda mão com empate na primeira
                console.log('// segunda mão com empate na primeira');
                scoreboard[winnerTeam].score = scoreboard[winnerTeam].score + 1;
                round = 0;
                finishedRound = true;
            } else {
                console.log('// segunda mão sem empate na primeira');
                // segunda mão sem empate na primeira
                if (scoreboard[winnerTeam].players.includes(points[0].winner)) {
                    // o time que venceu essa mão também venceu a mão anterior
                    console.log('// o time que venceu essa mão também venceu a mão anterior');
                    scoreboard[winnerTeam].score = scoreboard[winnerTeam].score + 1;
                    round = 0;
                    finishedRound = true;
                } else {
                    console.log('// o time que venceu essa mão perdeu a anterior, teremos terceira mão');
                    // o time que venceu essa mão perdeu a anterior, teremos terceira mão
                    round = round + 1;
                }
            }
        } else if (round === 0) {
             console.log('// primeira mão, só atribui o ponto pra quem ganhou');
             // primeira mão, só atribui o ponto pra quem ganhou
             round = round + 1;
        } else {
             // ultima mão
             console.log('// o time que vence essa mao vence a rodada');
             scoreboard[winnerTeam].score = scoreboard[winnerTeam].score + 1;
             round = 0;
             finishedRound = true;
        }
    }
    if (finishedRound) {
        points = [
            {},
            {},
            {}
        ];
        newHand();
    } else {
        handling = [];
        if (!isDraw) {
            handTurn = winnerPlayer;
        }
    }

    // turn = turn === connectedPlayers.length - 1 ? 0 : turn + 1;
    console.log(scoreboard);


    connections.forEach( c => {
        c.send(JSON.stringify({type: 'turn', turn: handTurn}));
        c.send(JSON.stringify({ type: 'played', handling: [] }));
        c.send(JSON.stringify({ type: 'points', points }));
        c.send(JSON.stringify({ type: 'scoreboard', scoreboard }));
        c.send(JSON.stringify({ type: 'winnerround', winner: isDraw ? 'empate' : winnerPlayer }));
    });
}

const handleNextHandleTurn = (isNewRound, player) => {
    if (scoreboard.team1.players.find(p => player === p)) {
        console.log('quem jogou foi do time 1');
        if (scoreboard.team1.players.indexOf(player) === 0) {
            console.log('quem jogou foi do time 0 posicao 0');
            handTurn = scoreboard.team2.players[1];
        } else {
            console.log('quem jogou foi do time 0 posicao 1');
            handTurn = scoreboard.team2.players[0];
        }
    } else {
        console.log('quem jogou foi do time 2');
        if (scoreboard.team2.players.indexOf(player) === 0) {
            console.log('quem jogou foi do time 2 posicao 0');
            handTurn = scoreboard.team1.players[0];
        } else {
            console.log('quem jogou foi do time 2 posicao 1');
            handTurn = scoreboard.team1.players[1];
        }
    }
    console.log('próximo deve ser', handTurn);
    // if (isNewRound) {
    //
    // }
    connections.forEach( c => {
        c.send(JSON.stringify({type: 'turn', turn: handTurn}))
    });
};

const newHand = () => {
    // clear all hands and manilha and send event to users
    for (let i = 0; i < connections.length; i++) {
        connections[i].send(JSON.stringify({type: 'hands', hands: []}));
        connections[i].send(JSON.stringify({type: 'manilha', manilha: null}));
    }
    // shuffle and distribute cards
    dealCards();
    // send new hands, manilha, updated scoreboard to users
    connections.forEach( c => {
        handling = [];
        c.send(JSON.stringify({ type: 'played', handling: [] }))
        c.send(JSON.stringify({ type: 'hands', hands }));
        c.send(JSON.stringify({ type: 'manilha', manilha }));
        c.send(JSON.stringify({type: 'scoreboard', scoreboard}));
    });
}

const handleResetData = () => {
    hands = [];
    manilha = null;
    connectedPlayers = [];
    handling = [];
    scoreboard = {
        team1: {
            score: 0,
            players: ['',''],
        },
        team2: {
            score: 0,
            players: ['',''],
        }
    };

    playersLastSeen = {
        p0: {connected: false, lastSeen: null},
        p1: {connected: false, lastSeen: null},
        p2: {connected: false, lastSeen: null},
        p3: {connected: false, lastSeen: null},
    }
    trucado = 1;
    handTurn = '';
    roundTurn = '';
    round = 0;
    points = [
        {},
        {},
        {}
    ];
    connections.forEach( c => {
        c.send(JSON.stringify({  type: 'restart' }));
        connections = connections.filter(co => co !== c);
    });
}

const handlePing = (ping) => {
    const playerPingIndex = connectedPlayers.indexOf(ping);
    if (playerPingIndex !== -1) {
        playersLastSeen[`p${playerPingIndex}`] = {connected: true, lastSeen: new Date()};
    }
    Object.keys(playersLastSeen).forEach(k => {
        if (playersLastSeen[k]?.connected && moment().diff(moment(playersLastSeen[k]?.lastSeen), 'seconds') > 4) {
            playersLastSeen[k] = {...playersLastSeen[k], connected: false};
        }
        if (playersLastSeen[k]?.connected && moment().diff(moment(playersLastSeen[k]?.lastSeen), 'hours') > 1) {
            console.log('Detectada partida iniciada vazia, limpando dados...')
            handleResetData();
        }
    })
    connections.forEach( c => {
        c.send(JSON.stringify({type: 'connectedPlayers', connectedPlayers}))
        c.send(JSON.stringify({type: 'connections', playersLastSeen}))
    });
}

const handleNewPlayerConnected = (name, seat) => {
    // if there is less than 4 players and the choosen seat is empty
    if (connectedPlayers.length < 4 && !scoreboard?.[seat.prop]?.players[seat.at]) {
        // if the seat is empty, add the player to the seat
        if (!scoreboard[seat.prop].players[seat.at]) {
            scoreboard[seat.prop].players[seat.at] = name;
            // if the user was already seat at the other chair of the same team, remove the user from the seat
            const playersOnTeam = scoreboard[seat.prop].players.filter(p => p === name);
            if (playersOnTeam.length > 1) {
                scoreboard[seat.prop].players[seat.at === 0 ? 1 : 0] = '';
            }
            // if the user was already seat at the other team, remove the user from the seat
            const otherTeam = seat.prop === 'team1' ? 'team2' : 'team1';
            scoreboard[otherTeam].players =
                scoreboard[otherTeam].players.map(p => p === name ? '' : p);

            // if user is not already on connected list, add the user to the connected list
            if (!connectedPlayers.find(cp => cp === name)) {
                connectedPlayers.push(name);
            }
        }
        // if the player is already in the chosen seat, remove the player from the seat
    } else if (scoreboard[seat.prop].players[seat.at] === name) {
        scoreboard[seat.prop].players[seat.at] = '';
        // remove him from the connected list to avoid duplicates
        connectedPlayers = connectedPlayers.filter(cp => cp !== name);
    }

    // if there are 4 players, start the game
    if (connectedPlayers.length === 4) {
        // todo check in rules who needs to start game
        // generate random number between 0 and 3 to choose who starts the game
        let turn = Math.floor(Math.random() * (connectedPlayers.length - 1));
        handTurn = connectedPlayers[turn];
        roundTurn = connectedPlayers[turn];
        // send the turn to all players
        connections.forEach( c => {
            c.send(JSON.stringify({ type: 'turn', turn: handTurn }));
        });

        // shuffle and distribute cards
        newHand();
    }
    connections.forEach( c => {
        c.send(JSON.stringify({type: 'scoreboard', scoreboard}));
        if (connectedPlayers.length === 4) {
            c.send(JSON.stringify({type: 'ready', ready: true}));
        }
    });
}




const WSS = new WebSocket.Server({
    port: normalizePort(process.env.SOCKET_PORT || 8070),
    path: '/ws'
})

WSS.on('listening', () => {
  console.log(
    `WebSocket Server is now listening on PORT: ${WSS.address().port}`
  )
})

WSS.on('connection', (ws, req) => {

    connections.push(ws);

    // console.log(req.socket.remoteAddress);
    connections.forEach( c => {
        if (connectedPlayers.length === 4) {
            c.send(JSON.stringify({type: 'ready', ready: true}));
        }
        c.send(JSON.stringify({type: 'scoreboard', scoreboard}));
    });

  ws.on('message', message => {
      // console.log(message);
    const data = safeParseJSON(message)

    if (data === null) {
      ws.send(
        JSON.stringify(
          generateError({
            error: 'Parse Error',
            reasons: [
              {
                reason: 'invalid_message_data',
                message: 'Unable to parse the message contents',
                data: message,
                location: 'websocket-message'
              }
            ]
          })
        )
      )
    } else if (data.method === 'ping') {
        handlePing(data.data.ping)
    } else if (data.method === 'takeseat') {
        handleNewPlayerConnected(data.data.name, data.data.seat);
    } else if (data.method === 'played') {
        const card = data.data.data.card;
        const player = data.data.data.player;
        let _hands = [...hands];
        let hand = _hands?.find(h => {
            return h.player === player;
        });
        hand = {
            player: data.data.data.player,
            cards: hand?.cards?.filter(c => !(c.nr === card.nr && c.naipe === card.naipe))};
        let index;
        hands.map((hh, i) => {
            if (hh.player === player) {
                index = i;
            }
        })

        if (index !== -1) {
            hands[index] = hand;
        }
        handling.push({card, player});
        connections.forEach( c => {
            c.send(JSON.stringify({ type: 'hands', hands }));
            c.send(JSON.stringify({ type: 'played', handling }));
        });
        if (handling.length === 4) {
            handleRoundWinner()
        } else {
            handleNextHandleTurn(false, data.data.data.player);
        }
    } else if (data.method === 'restart') {
        handleResetData()
    } else if (data.method === 'gethands') {
        connections.forEach( c => {
            c.send(JSON.stringify({ type: 'turn', turn: handTurn }));
            c.send(JSON.stringify({ type: 'played', handling }));
            c.send(JSON.stringify({ type: 'points', points }));
            c.send(JSON.stringify({ type: 'hands', hands }));
            c.send(JSON.stringify({ type: 'manilha', manilha }));
            c.send(JSON.stringify({type: 'scoreboard', scoreboard}));
        });
    } else if (data.method === 'cleartable') {
        hands = [];
        manilha = null;
        console.log('cleared cards');
        connections.forEach( c => {
            c.send(JSON.stringify({ type: 'hands', hands: [] }));
            c.send(JSON.stringify({  type: 'manilha', manilha: null }));
        });
    } else {
      ws.send(
        JSON.stringify(
          generateError({
            error: 'Method Not Found',
            reasons: [
              {
                reason: 'invalid_method',
                message: 'Unable to find matching method',
                data: data.method,
                location: 'method'
              }
            ]
          })
        )
      )
    }
  })
})
