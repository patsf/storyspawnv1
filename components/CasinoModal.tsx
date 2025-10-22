import React, { useState, useEffect, useMemo } from 'react';
import { CogIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface CasinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerGold: number;
  onGameEnd: (amount: number) => void;
}

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
interface Card {
  suit: Suit;
  rank: Rank;
}
type GamePhase = 'betting' | 'playing' | 'dealer-turn' | 'result';

const suitSymbols: Record<Suit, { symbol: string, color: string }> = {
    hearts: { symbol: '♥', color: 'text-red-500' },
    diamonds: { symbol: '♦', color: 'text-red-500' },
    clubs: { symbol: '♣', color: 'text-black' },
    spades: { symbol: '♠', color: 'text-black' },
};

const CardComponent: React.FC<{ card: Card, faceDown?: boolean, delay?: number }> = ({ card, faceDown, delay = 0 }) => {
    if (faceDown) {
        return <div style={{ animationDelay: `${delay}ms` }} className="w-20 h-28 bg-red-800 border-2 border-red-900 rounded-lg flex items-center justify-center shadow-lg animate-fade-in"><div className="w-16 h-24 border-2 border-red-600 rounded-md"></div></div>;
    }
    const { symbol, color } = suitSymbols[card.suit];
    return (
        <div style={{ animationDelay: `${delay}ms` }} className={`w-20 h-28 bg-stone-100 border-2 border-stone-300 rounded-lg flex flex-col justify-between items-center p-1 shadow-lg text-black font-bold animate-slide-in-up`}>
            <div className={`self-start ${color}`}>{card.rank}</div>
            <div className={`text-4xl ${color}`}>{symbol}</div>
            <div className={`self-end rotate-180 ${color}`}>{card.rank}</div>
        </div>
    );
};

const createDeck = (): Card[] => {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const getCardValue = (card: Card, currentScore: number): number => {
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    if (card.rank === 'A') return currentScore + 11 > 21 ? 1 : 11;
    return parseInt(card.rank);
};

const calculateScore = (hand: Card[]): number => {
    let score = 0;
    let aceCount = 0;
    for (const card of hand) {
        if (card.rank === 'A') {
            aceCount++;
            score += 11;
        } else {
            score += getCardValue(card, score);
        }
    }
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
};

const CasinoModal: React.FC<CasinoModalProps> = ({ isOpen, onClose, playerGold, onGameEnd }) => {
    const [deck, setDeck] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [bet, setBet] = useState(10);
    const [phase, setPhase] = useState<GamePhase>('betting');
    const [message, setMessage] = useState('Place your bet!');
    const [winnings, setWinnings] = useState(0);

    const playerScore = useMemo(() => calculateScore(playerHand), [playerHand]);
    const dealerScore = useMemo(() => calculateScore(dealerHand), [dealerHand]);

    const resetForNewRound = () => {
        setPhase('betting');
        setMessage('Place your bet!');
        setPlayerHand([]);
        setDealerHand([]);
    };

    const startRound = () => {
        if (bet > playerGold + winnings) {
            setMessage("You can't afford that bet!");
            return;
        }
        let newDeck = shuffleDeck(createDeck());
        const playerInitialHand = [newDeck.pop()!, newDeck.pop()!];
        const dealerInitialHand = [newDeck.pop()!, newDeck.pop()!];
        
        setDeck(newDeck);
        setPlayerHand(playerInitialHand);
        setDealerHand(dealerInitialHand);
        setPhase('playing');
        setMessage('Your turn. Hit or Stand?');

        const initialPlayerScore = calculateScore(playerInitialHand);
        if (initialPlayerScore === 21) {
            setPhase('result');
            setMessage('Blackjack! You win!');
            setWinnings(prev => prev + bet * 1.5);
        }
    };

    const handleHit = () => {
        if (phase !== 'playing') return;
        const newDeck = [...deck];
        const newCard = newDeck.pop()!;
        const newHand = [...playerHand, newCard];
        setDeck(newDeck);
        setPlayerHand(newHand);
        if (calculateScore(newHand) > 21) {
            setPhase('result');
            setMessage('Bust! You lose.');
            setWinnings(prev => prev - bet);
        }
    };

    const handleStand = () => {
        if (phase !== 'playing') return;
        setPhase('dealer-turn');
        setMessage("Dealer's turn...");
    };

    useEffect(() => {
        if (phase === 'dealer-turn') {
            let currentDealerHand = [...dealerHand];
            let currentDeck = [...deck];
            
            const playDealer = () => {
                let currentScore = calculateScore(currentDealerHand);
                if (currentScore < 17 && currentDeck.length > 0) {
                    const newCard = currentDeck.pop()!;
                    currentDealerHand = [...currentDealerHand, newCard];
                    setDealerHand(currentDealerHand);
                    setTimeout(playDealer, 1000);
                } else {
                    setDeck(currentDeck);
                    setPhase('result');
                    const finalDealerScore = calculateScore(currentDealerHand);
                    if (finalDealerScore > 21 || playerScore > finalDealerScore) {
                        setMessage(`You win! Dealer has ${finalDealerScore}.`);
                        setWinnings(prev => prev + bet);
                    } else if (playerScore < finalDealerScore) {
                        setMessage(`You lose! Dealer has ${finalDealerScore}.`);
                        setWinnings(prev => prev - bet);
                    } else {
                        setMessage("It's a push! Your bet is returned.");
                    }
                }
            };
            setTimeout(playDealer, 1000);
        }
    }, [phase]);

    const handleExit = () => {
        onGameEnd(winnings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={handleExit}>
            <div className="bg-green-900/90 border-8 border-yellow-800 rounded-lg w-full max-w-3xl m-4 text-white flex flex-col shadow-2xl shadow-black/50 p-6 relative aspect-[4/3]" onClick={e => e.stopPropagation()}>
                
                {/* Dealer Hand */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-center mb-2 font-bold text-lg text-yellow-200/80">Dealer's Hand {phase !== 'playing' && `: ${dealerScore}`}</p>
                    <div className="flex gap-2 h-28">
                        {dealerHand.map((card, i) => <CardComponent key={i} card={card} faceDown={phase === 'playing' && i === 1} delay={i * 100} />)}
                    </div>
                </div>
                
                {/* Game Info & Controls */}
                <div className="text-center my-4">
                    <h2 className="text-3xl font-bold text-yellow-300 drop-shadow-lg mb-2 min-h-[40px]">{message}</h2>
                    {phase === 'betting' && (
                        <div className="flex flex-col items-center gap-4 mt-4 animate-fade-in">
                             <div className="flex items-center gap-3 bg-black/30 p-2 rounded-lg">
                                <CogIcon className="w-5 h-5 text-yellow-300" />
                                <input type="number" value={bet} onChange={e => setBet(Math.max(1, parseInt(e.target.value) || 0))} min="1" max={playerGold + winnings} className="bg-transparent w-20 text-center text-lg font-bold"/>
                                <span className="text-sm">/ {playerGold + winnings}</span>
                             </div>
                            <button onClick={startRound} disabled={bet > playerGold + winnings} className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg text-xl hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">Place Bet</button>
                        </div>
                    )}
                     {phase === 'playing' && (
                        <div className="flex gap-4 mt-4 justify-center animate-fade-in">
                            <button onClick={handleHit} className="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl hover:bg-blue-400 transition-colors">Hit</button>
                            <button onClick={handleStand} className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg text-xl hover:bg-red-400 transition-colors">Stand</button>
                        </div>
                    )}
                    {phase === 'result' && (
                        <div className="flex gap-4 mt-4 justify-center animate-fade-in">
                            <button onClick={resetForNewRound} disabled={(playerGold + winnings) <= 0} className="bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg text-xl hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">Play Again</button>
                            <button onClick={handleExit} className="bg-stone-500 text-white font-bold py-3 px-8 rounded-lg text-xl hover:bg-stone-400 transition-colors">Leave Table</button>
                        </div>
                    )}
                     {phase === 'dealer-turn' && (
                        <div className="mt-4"><LoadingSpinner /></div>
                    )}
                </div>

                {/* Player Hand */}
                 <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex gap-2 h-28">
                        {playerHand.map((card, i) => <CardComponent key={i} card={card} delay={i * 100} />)}
                    </div>
                    <p className="text-center mt-2 font-bold text-lg text-yellow-200/80">Your Hand: {playerScore}</p>
                </div>
            </div>
        </div>
    );
};

export default CasinoModal;