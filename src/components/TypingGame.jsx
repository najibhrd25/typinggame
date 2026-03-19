import { useEffect, useState, useRef, useCallback } from 'react';
import Confetti from 'react-confetti';
import './TypingGame.css';

const TEXT_OPTIONS = {
    quotes: {
        en: [
            "Believe you can and you're halfway there. The only limit to our realization of tomorrow will be our doubts of today.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts. Don't watch the clock; do what it does. Keep going.",
            "The future belongs to those who believe in the beauty of their dreams. You are never too old to set another goal or to dream a new dream.",
            "It does not matter how slowly you go as long as you do not stop. Hardships often prepare ordinary people for an extraordinary destiny.",
            "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
            "Your time is limited, don't waste it living someone else's life. Don't be trapped by dogma, which is living the result of other people's thinking."
        ],
        id: [
            "Percayalah bahwa kamu bisa, dan kamu sudah setengah jalan menuju ke sana. Satu-satunya batasan untuk masa depan kita adalah keraguan kita hari ini.",
            "Kesuksesan bukanlah akhir, kegagalan bukanlah hal yang mematikan: keberanian untuk melanjutkanlah yang penting. Teruslah melangkah.",
            "Masa depan milik mereka yang percaya pada keindahan mimpi mereka. Kamu tidak pernah terlalu tua untuk memiliki tujuan baru atau memimpikan hal baru.",
            "Tidak masalah seberapa lambat kamu berjalan selama kamu tidak berhenti. Kesulitan sering kali mempersiapkan orang biasa untuk takdir yang luar biasa.",
            "Satu-satunya cara untuk melakukan pekerjaan hebat adalah dengan mencintai apa yang kamu lakukan. Jika belum menemukannya, teruslah mencari.",
            "Waktumu terbatas, jangan sia-siakan dengan menjalani hidup orang lain. Jangan terjebak oleh dogma, yaitu hidup dengan hasil pemikiran orang lain."
        ]
    },
    words: {
        en: [
            "apple banana orange grape watermelon pineapple strawberry blueberry peach mango kiwi cherry lemon lime coconut papaya plum pear apricot raspberry",
            "house building apartment skyscraper cabin cottage mansion castle tent palace bungalow villa garage barn shed studio loft condo duplex flat",
            "car truck bicycle motorcycle boat airplane train helicopter submarine spaceship scooter bus van tractor ambulance fire engine taxi jet yacht",
            "dog cat bird fish hamster rabbit turtle snake lizard frog horse cow pig sheep goat chicken duck goose turkey deer bear lion tiger elephant",
            "computer keyboard mouse monitor laptop tablet smartphone watch camera television radio stereo speaker microphone headphone earphone printer",
            "sun moon star planet galaxy universe space sky cloud rain snow wind storm thunder lightning hurricane tornado earthquake volcano tsunami"
        ],
        id: [
            "apel pisang jeruk anggur semangka nanas stroberi mangga kiwi ceri lemon kelapa pepaya prem pir aprikot raspberi melon delima alpukat",
            "rumah gedung apartemen kabin pondok istana bangunan vila garasi gudang studio kondominium dupleks kemah perkemahan panggung gubuk kos",
            "mobil truk sepeda motor perahu pesawat kereta helikopter kapal selam taksi bus van traktor ambulans pemadam jet yacht rakit kapal feri",
            "anjing kucing burung ikan kelinci kura ular kadal katak kuda sapi babi domba kambing ayam bebek angsa kalkun rusa beruang singa harimau gajah",
            "komputer papan ketik tetikus monitor laptop tablet ponsel jam kamera televisi radio stereo pengeras suara mikrofon pelantang telinga pencetak",
            "matahari bulan bintang planet galaksi semesta ruang angkasa langit awan hujan salju angin badai guntur petir topan tornado gempa gunung tsunami"
        ]
    }
};

const TypingGame = () => {
    const [paragraph, setParagraph] = useState('');
    const [words, setWords] = useState([]); // Array of word strings
    const [typedWords, setTypedWords] = useState([]); // Array of strings the user typed
    const [currentWordIndex, setCurrentWordIndex] = useState(0); // Which word we are on
    const [currentTyped, setCurrentTyped] = useState(''); // Current word being typed

    const [selectedTime, setSelectedTime] = useState(60);
    const [time, setTime] = useState(60);
    const [selectedLanguage, setSelectedLanguage] = useState('id');
    const [selectedType, setSelectedType] = useState('quotes');
    const [focused, setFocused] = useState(false);
    const [startGame, setStartGame] = useState(false);
    const [confetti, setConfetti] = useState(false);

    // Stats
    const [mistakes, setMistakes] = useState(0);

    const paragraphRef = useRef(null);
    const typingRef = useRef(null);

    const generateText = useCallback(() => {
        const texts = TEXT_OPTIONS[selectedType][selectedLanguage];
        const randomIndex = Math.floor(Math.random() * texts.length);
        const text = texts[randomIndex];
        setParagraph(text);
        setWords(text.split(' '));

        // Reset state
        setTypedWords([]);
        setCurrentWordIndex(0);
        setCurrentTyped('');
        setMistakes(0);
        setStartGame(false);
        setConfetti(false);
        setTime(selectedTime);
    }, [selectedType, selectedLanguage, selectedTime]);

    useEffect(() => {
        generateText();
    }, [generateText]);

    const handlePaste = async (e) => {
        e.preventDefault();
        // Disallow pasting for typing games
    }

    const handleReset = () => {
        generateText();
    }

    const handleTyping = (e) => {
        if (time === 0) return;

        let value = e.target.value;

        if (!startGame && value.length > 0) {
            setStartGame(true);
        }

        // Handle Space: confirm word and move to next
        if (value.endsWith(' ')) {
            // Prevent leading spaces from doing anything on an empty word
            if (currentTyped.length === 0) return;

            // Calculate mistakes for this word right as we submit it
            const expectedWord = words[currentWordIndex];
            const typedWord = value.trim();

            // If they didn't type it right, it's a mistake (can be refined later, but simply marking missed chars inside the span loop works too)
            let newMistakes = 0;
            // A simple way to track total mistakes for the stats counter:
            const maxLen = Math.max(expectedWord.length, typedWord.length);
            for (let i = 0; i < maxLen; i++) {
                if (typedWord[i] !== expectedWord[i]) newMistakes++;
            }
            setMistakes(m => m + newMistakes);

            setTypedWords([...typedWords, typedWord]);
            setCurrentWordIndex(currentWordIndex + 1);
            setCurrentTyped('');

            // Check win condition (if it was the last word)
            if (currentWordIndex === words.length - 1) {
                setConfetti(true);
                setStartGame(false);
            }
            return;
        }

        // Handle normal typing
        setCurrentTyped(value);
    }

    useEffect(() => {
        let interval = null;
        if (startGame) {
            interval = time > 0 && setInterval(() => {
                setTime((time) => time - 1);
            }, 1000);
            if (time === 0) setStartGame(false);
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [time, startGame]);

    return (
        <>
            {confetti && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    numberOfPieces={1000}
                    recycle={false}
                />
            )}
            {/* <div className="game-tip">
            Click on the paragraph and start typing.
            <br/>
            <br/>
            You can erase mistakes or go backwards by pressing backspace.
        </div> */}
            <div className="typing-game-container">
                <div className="game-options">
                    <div className="option-group">
                        <button className={selectedTime === 10 ? 'active' : ''} onClick={() => setSelectedTime(10)}>10s</button>
                        <button className={selectedTime === 15 ? 'active' : ''} onClick={() => setSelectedTime(15)}>15s</button>
                        <button className={selectedTime === 30 ? 'active' : ''} onClick={() => setSelectedTime(30)}>30s</button>
                        <button className={selectedTime === 60 ? 'active' : ''} onClick={() => setSelectedTime(60)}>60s</button>
                    </div>
                    <div className="option-group">
                        <button className={selectedLanguage === 'id' ? 'active' : ''} onClick={() => setSelectedLanguage('id')}>ID</button>
                        <button className={selectedLanguage === 'en' ? 'active' : ''} onClick={() => setSelectedLanguage('en')}>EN</button>
                    </div>
                    <div className="option-group">
                        <button className={selectedType === 'words' ? 'active' : ''} onClick={() => setSelectedType('words')}>Words</button>
                        <button className={selectedType === 'quotes' ? 'active' : ''} onClick={() => setSelectedType('quotes')}>Quotes</button>
                    </div>
                </div>
                <div className={`typing-game${(currentWordIndex === words.length && time > 0) ? ' winner' : time === 0 ? ' time-out' : time <= 10 ? ' time-running-out' : focused ? ' focused' : ''}`}>
                    <div className="game-data">
                        <div>
                            Mistakes: <strong>{mistakes}</strong>
                        </div>
                        <div title="Word per minute">
                            WPM: <strong>{typedWords.length}</strong>
                        </div>
                        <div title="Character per minute">
                            CPM: <strong>{typedWords.join('').length + typedWords.length}</strong>
                        </div>
                        <div>
                            Time Left: <strong className={`${time === 0 ? 'text-danger' : ''}`}>{time}s</strong>
                        </div>
                    </div>
                    <div
                        className="typing-area"
                        ref={paragraphRef}
                        onClick={() => typingRef.current.focus()}
                    >
                        {words.map((word, wIdx) => {
                            const isCurrentWord = wIdx === currentWordIndex;
                            const isPastWord = wIdx < currentWordIndex;
                            const typedWord = isPastWord ? typedWords[wIdx] : (isCurrentWord ? currentTyped : '');

                            // We will render letters for the word + any extra characters typed
                            const lettersToRender = Math.max(word.length, typedWord.length);

                            // The space after the word is part of the rendering
                            let spaceClass = '';
                            if (isPastWord && typedWord !== word) {
                                // If they moved past the word but got it wrong
                                spaceClass = 'incorrect-word-space';
                            }

                            return (
                                <span key={wIdx} className={`word ${isCurrentWord ? 'current-word' : ''} ${isPastWord && typedWord !== word ? 'word-error' : ''}`}>
                                    {Array.from({ length: lettersToRender }).map((_, lIdx) => {
                                        const expectedChar = word[lIdx];
                                        const typedChar = typedWord[lIdx];

                                        let charClass = '';
                                        if (typedChar === undefined) {
                                            // Not typed yet
                                            charClass = 'pending';
                                        } else if (expectedChar === undefined) {
                                            // Extra characters typed
                                            charClass = 'extra-char incorrect';
                                        } else if (typedChar === expectedChar) {
                                            // Correctly typed
                                            charClass = 'correct';
                                        } else {
                                            // Incorrectly typed
                                            charClass = 'incorrect';
                                        }

                                        // Highlight the cursor position
                                        const isCursor = isCurrentWord && lIdx === currentTyped.length;

                                        return (
                                            <span key={lIdx} className={`${charClass} ${isCursor && focused ? 'cursor active-cursor' : ''}`}>
                                                {expectedChar || typedChar}
                                            </span>
                                        );
                                    })}
                                    {/* Space at the end of the word, also serves as cursor if they finish typing the word exactly */}
                                    <span className={`word-space ${isCurrentWord && currentTyped.length === word.length && focused ? 'cursor active-cursor' : ''} ${spaceClass}`}>
                                        &nbsp;
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                    {time > 0 && (
                        <input
                            ref={typingRef}
                            type="text"
                            className="hidden"
                            value={currentTyped}
                            onFocus={() => {
                                setFocused(true);
                            }}
                            onBlur={() => setFocused(false)}
                            onChange={handleTyping}
                        />
                    )}
                    <div className="game-info">
                        <div className="btn"
                            onClick={generateText}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                            </svg>
                            Refresh Text
                        </div>
                        <div className="btn"
                            onClick={handlePaste}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                            </svg>
                            Paste
                        </div>
                        <div className="btn"
                            onClick={handleReset}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z" />
                                <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z" />
                            </svg>
                            Reset
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TypingGame