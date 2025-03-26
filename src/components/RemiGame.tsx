import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card,
  Modal,
  InputGroup,
} from 'react-bootstrap';

interface Player {
  id: number;
  name: string;
  scores: number[];
  totalScore: number;
  selected?: boolean;
  total?: number;
}

// Create a global storage object to handle data persistence
const GameStorage = {
  // IndexedDB funkcionalnost
  initIndexedDB: () => {
    return new Promise<void>((resolve, reject) => {
      if (!window.indexedDB) {
        console.log('Vaš preglednik ne podržava IndexedDB.');
        resolve();
        return;
      }

      const request = window.indexedDB.open('RemiBlokDB', 1);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        resolve(); // Nastavi bez IndexedDB
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('Creating object store in IndexedDB...');
        if (!db.objectStoreNames.contains('gameData')) {
          db.createObjectStore('gameData', { keyPath: 'id' });
          console.log('IndexedDB Game Data store created');
        }
      };

      request.onsuccess = (event) => {
        console.log('IndexedDB initialized successfully');
        resolve();
      };
    });
  },

  // Pojednostavljeni saveToIndexedDB koji je sigurniji
  saveToIndexedDB: (data: any) => {
    return new Promise<boolean>((resolve) => {
      try {
        // Prvo inicijaliziraj bazu
        GameStorage.initIndexedDB()
          .then(() => {
            const request = window.indexedDB.open('RemiBlokDB', 1);

            request.onerror = () => {
              console.error('Error opening IndexedDB for saving');
              resolve(false);
            };

            request.onsuccess = (event) => {
              try {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('gameData')) {
                  console.log('gameData store not found during save operation');
                  db.close();
                  resolve(false);
                  return;
                }

                const transaction = db.transaction(['gameData'], 'readwrite');
                const store = transaction.objectStore('gameData');

                const saveData = {
                  id: 'remiGameData',
                  ...data,
                  timestamp: new Date().getTime(),
                };

                const saveRequest = store.put(saveData);

                saveRequest.onsuccess = () => {
                  console.log('Data saved to IndexedDB successfully');
                };

                saveRequest.onerror = (err) => {
                  console.error('Error saving data to IndexedDB', err);
                };

                transaction.oncomplete = () => {
                  console.log('Transaction completed');
                  db.close();
                  resolve(true);
                };

                transaction.onerror = (err) => {
                  console.error('Transaction error', err);
                  db.close();
                  resolve(false);
                };
              } catch (err) {
                console.error('Error in IndexedDB save operation', err);
                resolve(false);
              }
            };
          })
          .catch((err) => {
            console.error('Error initializing IndexedDB', err);
            resolve(false);
          });
      } catch (err) {
        console.error('Error in saveToIndexedDB', err);
        resolve(false);
      }
    });
  },

  // Pojednostavljeni loadFromIndexedDB
  loadFromIndexedDB: () => {
    return new Promise<any>((resolve) => {
      try {
        // Prvo inicijaliziraj bazu
        GameStorage.initIndexedDB()
          .then(() => {
            const request = window.indexedDB.open('RemiBlokDB', 1);

            request.onerror = () => {
              console.error('Error opening IndexedDB for loading');
              resolve(null);
            };

            request.onsuccess = (event) => {
              try {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('gameData')) {
                  console.log('gameData store not found during load operation');
                  db.close();
                  resolve(null);
                  return;
                }

                const transaction = db.transaction(['gameData'], 'readonly');
                const store = transaction.objectStore('gameData');
                const getRequest = store.get('remiGameData');

                getRequest.onsuccess = () => {
                  const result = getRequest.result;
                  if (result) {
                    // Ukloni ID i timestamp prije vraćanja
                    const { id, timestamp, ...cleanResult } = result;
                    console.log('Data loaded from IndexedDB successfully');
                    resolve(cleanResult);
                  } else {
                    console.log('No data found in IndexedDB');
                    resolve(null);
                  }
                };

                getRequest.onerror = (err) => {
                  console.error('Error getting data from IndexedDB', err);
                  resolve(null);
                };

                transaction.oncomplete = () => {
                  db.close();
                };

                transaction.onerror = (err) => {
                  console.error('Transaction error during load', err);
                  db.close();
                  resolve(null);
                };
              } catch (err) {
                console.error('Error in IndexedDB load operation', err);
                resolve(null);
              }
            };
          })
          .catch((err) => {
            console.error('Error initializing IndexedDB', err);
            resolve(null);
          });
      } catch (err) {
        console.error('Error in loadFromIndexedDB', err);
        resolve(null);
      }
    });
  },

  saveGame: (data: any) => {
    return new Promise<boolean>((resolve) => {
      try {
        // Spremi u localStorage (primarni izvor)
        localStorage.setItem('remiGameData', JSON.stringify(data));
        console.log('Data saved to localStorage');

        // Spremi u sessionStorage (prva rezerva)
        sessionStorage.setItem('remiGameData', JSON.stringify(data));
        console.log('Data saved to sessionStorage');

        // Spremi u cookie (druga rezerva, samo ključne podatke)
        const cookieData = {
          gameStarted: data.gameStarted,
          numPlayers: data.numPlayers,
          currentRound: data.currentRound,
          timestamp: new Date().getTime(),
        };
        document.cookie = `remiGameData=${JSON.stringify(
          cookieData
        )}; path=/; max-age=86400`;
        console.log('Basic data saved to cookie');

        // Pokušaj spremiti u IndexedDB (za veće podatke)
        GameStorage.saveToIndexedDB(data)
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            // Ako IndexedDB ne uspije, još uvijek imamo ostale metode
            resolve(true);
          });
      } catch (error) {
        console.error('Error in saveGame:', error);

        // Pokušaj alternativnu metodu ako prva ne uspije
        try {
          localStorage.setItem('remiGameData_backup', JSON.stringify(data));
          resolve(true);
        } catch (backupError) {
          console.error('Backup save failed:', backupError);
          resolve(false);
        }
      }
    });
  },

  loadGame: () => {
    return new Promise<any>((resolve) => {
      let source = 'unknown';
      let data: string | null = null;

      try {
        // Pokušaj učitati iz localStorage (primarni izvor)
        data = localStorage.getItem('remiGameData');
        if (data) {
          source = 'localStorage';
          console.log('Data loaded from localStorage');
          resolve(JSON.parse(data));
          return;
        }

        // Pokušaj učitati iz localStorage backup
        data = localStorage.getItem('remiGameData_backup');
        if (data) {
          source = 'localStorage_backup';
          console.log('Data loaded from localStorage backup');
          resolve(JSON.parse(data));
          return;
        }

        // Pokušaj učitati iz sessionStorage
        data = sessionStorage.getItem('remiGameData');
        if (data) {
          source = 'sessionStorage';
          console.log('Data loaded from sessionStorage');
          resolve(JSON.parse(data));
          return;
        }

        // Pokušaj učitati iz IndexedDB
        GameStorage.loadFromIndexedDB()
          .then((idbData) => {
            if (idbData) {
              source = 'IndexedDB';
              console.log('Data loaded from IndexedDB');
              resolve(idbData);
              return;
            }

            // Pokušaj učitati iz kolačića
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
              const [name, value] = cookie.trim().split('=');
              if (name === 'remiGameData') {
                data = decodeURIComponent(value);
                source = 'cookie';
                console.log('Data loaded from cookie');
                resolve(JSON.parse(data));
                return;
              }
            }

            // Ništa nije pronađeno
            console.log('No saved data found');
            resolve(null);
          })
          .catch((error) => {
            console.error('Error loading from IndexedDB:', error);

            // Ako neuspjeh dohvaćanja iz IndexedDB, ali već imamo podatke iz drugog izvora
            if (data) {
              console.log(`Data loaded from ${source}`);
              resolve(JSON.parse(data));
            } else {
              console.log('No saved data found');
              resolve(null);
            }
          });
      } catch (error) {
        console.error('Error loading game data:', error);
        resolve(null);
      }
    });
  },

  clearGame: () => {
    return new Promise<boolean>((resolve) => {
      try {
        // Izbriši iz svih izvora
        localStorage.removeItem('remiGameData');
        localStorage.removeItem('remiGameData_backup');
        sessionStorage.removeItem('remiGameData');
        document.cookie =
          'remiGameData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Pokušaj očistiti IndexedDB
        if (window.indexedDB) {
          const request = window.indexedDB.open('RemiBlokDB', 1);
          request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (db.objectStoreNames.contains('gameData')) {
              try {
                const transaction = db.transaction(['gameData'], 'readwrite');
                const store = transaction.objectStore('gameData');
                const deleteRequest = store.delete('remiGameData');

                deleteRequest.onsuccess = () => {
                  console.log('Data deleted from IndexedDB');
                };

                transaction.oncomplete = () => {
                  db.close();
                  console.log('All data cleared successfully');
                  resolve(true);
                };

                transaction.onerror = () => {
                  db.close();
                  console.log(
                    'Error in IndexedDB delete transaction, but other storages cleared'
                  );
                  resolve(true);
                };
              } catch (err) {
                db.close();
                console.log(
                  'Error in IndexedDB clear, but other storages cleared'
                );
                resolve(true);
              }
            } else {
              db.close();
              console.log(
                'No gameData store to clear, but other storages cleared'
              );
              resolve(true);
            }
          };
          request.onerror = () => {
            console.error('Error opening IndexedDB for clearing');
            console.log('Other storages cleared');
            resolve(true);
          };
        } else {
          console.log('IndexedDB not available, but other storages cleared');
          resolve(true);
        }
      } catch (error) {
        console.error('Error clearing game data:', error);
        resolve(false);
      }
    });
  },
};

const RemiGame: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [newScore, setNewScore] = useState<{ [key: number]: string }>({});
  const [dealer, setDealer] = useState<number>(0);
  const [currentPlayerInputIndex, setCurrentPlayerInputIndex] =
    useState<number>(0);
  const [showScoreInputModal, setShowScoreInputModal] =
    useState<boolean>(false);
  const [scoreToEdit, setScoreToEdit] = useState<{
    playerId: number;
    roundIndex: number;
    currentScore: number;
  } | null>(null);
  const [dealerHistory, setDealerHistory] = useState<number[]>([]);
  const [roundResults, setRoundResults] = useState<number[]>([]);
  const [gameEnded, setGameEnded] = useState<boolean>(false);

  // Učitaj spremljene podatke na početku
  useEffect(() => {
    console.log('Initializing game...');

    // Učitaj podatke iz različitih spremišta
    GameStorage.loadGame()
      .then((savedData) => {
        console.log('Load result:', savedData);

        if (savedData) {
          // Postavi inicijalne podatke
          if (savedData.players) {
            console.log('Setting players from saved data:', savedData.players);
            setPlayers(savedData.players);
            setNumPlayers(savedData.numPlayers);
          }

          // Postavi stanje igre
          if (savedData.gameStarted !== undefined) {
            console.log('Setting game state:', savedData.gameStarted);
            setGameStarted(savedData.gameStarted);
          }

          // Postavi trenutnu rundu
          if (savedData.currentRound !== undefined) {
            console.log('Setting current round:', savedData.currentRound);
            setCurrentRound(savedData.currentRound);
          }

          // Postavi rezultate ako postoje
          if (savedData.roundResults) {
            console.log('Setting round results:', savedData.roundResults);
            setRoundResults(savedData.roundResults);
          }

          // Postavi dealera ako postoji
          if (savedData.dealer !== undefined) {
            console.log('Setting dealer:', savedData.dealer);
            setDealer(savedData.dealer);
          }

          // Postavi stanje pobjednika ako postoji
          if (savedData.gameEnded !== undefined) {
            console.log('Setting game ended state:', savedData.gameEnded);
            setGameEnded(savedData.gameEnded);
          }

          // Provjeri jesu li rezultati prisutni da bi postavili igru na "započeta"
          if (savedData.roundResults && savedData.roundResults.length > 0) {
            setGameStarted(true);
          }
        } else {
          console.log('No saved data found - initializing new players');
          setPlayers([
            {
              id: 1,
              name: 'Igrač 1',
              selected: true,
              total: 0,
              scores: [],
              totalScore: 0,
            },
            {
              id: 2,
              name: 'Igrač 2',
              selected: true,
              total: 0,
              scores: [],
              totalScore: 0,
            },
            {
              id: 3,
              name: 'Igrač 3',
              selected: true,
              total: 0,
              scores: [],
              totalScore: 0,
            },
            {
              id: 4,
              name: 'Igrač 4',
              selected: true,
              total: 0,
              scores: [],
              totalScore: 0,
            },
          ]);
        }
      })
      .catch((error) => {
        console.error('Error loading game data:', error);
        // Inicijaliziraj nove igrače ako je došlo do greške
        setPlayers([
          {
            id: 1,
            name: 'Igrač 1',
            selected: true,
            total: 0,
            scores: [],
            totalScore: 0,
          },
          {
            id: 2,
            name: 'Igrač 2',
            selected: true,
            total: 0,
            scores: [],
            totalScore: 0,
          },
          {
            id: 3,
            name: 'Igrač 3',
            selected: true,
            total: 0,
            scores: [],
            totalScore: 0,
          },
          {
            id: 4,
            name: 'Igrač 4',
            selected: true,
            total: 0,
            scores: [],
            totalScore: 0,
          },
        ]);
      });

    // Postavi slušač događaja za spremanje podataka prije zatvaranja stranice
    const handleBeforeUnload = () => {
      console.log('Page is being refreshed/closed, saving data...');
      if (players.length > 0) {
        const data = {
          players,
          numPlayers,
          gameStarted,
          currentRound,
          roundResults,
          dealer,
          gameEnded,
        };
        GameStorage.saveGame(data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Auto-save svakih 10 sekundi
    const autoSaveInterval = setInterval(() => {
      console.log('Auto-saving game data...');
      if (players.length > 0) {
        const data = {
          players,
          numPlayers,
          gameStarted,
          currentRound,
          roundResults,
          dealer,
          gameEnded,
        };
        GameStorage.saveGame(data);
      }
    }, 10000);

    // Čišćenje
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(autoSaveInterval);
    };
  }, []); // Samo kod inicijalizacije

  // Spremi podatke kada se promijeni važno stanje
  useEffect(() => {
    if (!players.length) return; // Ne spremaj ako nema igrača

    console.log('Game state changed, saving data...');
    const data = {
      players,
      numPlayers,
      gameStarted,
      currentRound,
      roundResults,
      dealer,
      gameEnded,
    };

    GameStorage.saveGame(data);
  }, [
    players,
    numPlayers,
    gameStarted,
    currentRound,
    roundResults,
    dealer,
    gameEnded,
  ]);

  // Initialize players
  const initializePlayers = (count: number) => {
    const initialPlayers: Player[] = [];
    for (let i = 0; i < count; i++) {
      initialPlayers.push({
        id: i,
        name: `Igrač ${i + 1}`,
        scores: [],
        totalScore: 0,
      });
    }
    setPlayers(initialPlayers);

    // Initialize newScore object
    const scoreObj: { [key: number]: string } = {};
    initialPlayers.forEach((player) => {
      scoreObj[player.id] = '';
    });
    setNewScore(scoreObj);
  };

  // Update players when numPlayers changes
  useEffect(() => {
    if (!gameStarted) {
      initializePlayers(numPlayers);
    }
  }, [numPlayers, gameStarted]);

  // Funkcija za određivanje sljedećeg djelitelja prema zadanom algoritmu
  const getNextDealer = (currentRound: number, totalPlayers: number) => {
    // Ako je početni krug, počni s igračem 0
    if (currentRound === 0) return 0;

    // Za implementaciju redoslijeda: 0,1,2,3,0,3,2,1,0,1,2,3,0,3,2,1,0...
    const cyclePeriod = totalPlayers * 2;
    const positionInCycle = currentRound % cyclePeriod;

    if (positionInCycle < totalPlayers) {
      // Prva polovica ciklusa - rastući redoslijed (0,1,2,3)
      return positionInCycle % totalPlayers;
    } else {
      // Druga polovica ciklusa - padajući redoslijed počevši s prvim (0,3,2,1)
      // Prvi igrač, pa onda od zadnjeg prema drugom
      if (positionInCycle === totalPlayers) {
        return 0;
      } else {
        return totalPlayers - (positionInCycle - totalPlayers);
      }
    }
  };

  // Start a new game
  const startGame = () => {
    try {
      // Reset scores
      const resetPlayers = players.map((player) => ({
        ...player,
        scores: [],
        totalScore: 0,
      }));
      setPlayers(resetPlayers);
      setCurrentRound(0);
      setGameStarted(true);
      setDealer(0);
      setDealerHistory([0]);
      setCurrentPlayerInputIndex(0);

      // Initialize newScore object
      const scoreObj: { [key: number]: string } = {};
      resetPlayers.forEach((player) => {
        scoreObj[player.id] = '';
      });
      setNewScore(scoreObj);

      // Save initial state immediately
      const dataToSave = {
        players: resetPlayers,
        numPlayers,
        gameStarted: true,
        currentRound: 0,
        dealer: 0,
        dealerHistory: [0],
      };
      GameStorage.saveGame(dataToSave);
      console.log('New game saved to storage');
    } catch (e) {
      console.error('Error starting new game:', e);
    }
  };

  // Update player name
  const handleNameChange = (id: number, name: string) => {
    setPlayers(
      players.map((player) => (player.id === id ? { ...player, name } : player))
    );
  };

  // Handle score input change
  const handleScoreChange = (value: string) => {
    if (currentPlayerInputIndex < players.length) {
      const playerId = players[currentPlayerInputIndex].id;
      setNewScore({
        ...newScore,
        [playerId]: value,
      });
    }
  };

  // Handle numpad input
  const handleNumpadInput = (key: string) => {
    if (currentPlayerInputIndex < players.length) {
      const playerId = players[currentPlayerInputIndex].id;
      let currentValue = newScore[playerId] || '';

      if (key === 'backspace') {
        currentValue = currentValue.slice(0, -1);
      } else if (key === 'clear') {
        currentValue = '';
      } else if (key === '-') {
        if (currentValue.startsWith('-')) {
          currentValue = currentValue.substring(1);
        } else {
          currentValue = '-' + currentValue;
        }
      } else {
        currentValue += key;
      }

      setNewScore({
        ...newScore,
        [playerId]: currentValue,
      });
    }
  };

  // Handle numpad input for edit modal
  const handleEditNumpadInput = (key: string) => {
    if (!scoreToEdit) return;

    const playerId = scoreToEdit.playerId;
    let currentValue = newScore[playerId] || '';

    if (key === 'backspace') {
      currentValue = currentValue.slice(0, -1);
    } else if (key === 'clear') {
      currentValue = '';
    } else if (key === '-') {
      if (currentValue.startsWith('-')) {
        currentValue = currentValue.substring(1);
      } else {
        currentValue = '-' + currentValue;
      }
    } else {
      currentValue += key;
    }

    setNewScore({
      ...newScore,
      [playerId]: currentValue,
    });
  };

  // Move to next player for score input
  const moveToNextPlayer = () => {
    if (currentPlayerInputIndex < players.length - 1) {
      setCurrentPlayerInputIndex(currentPlayerInputIndex + 1);
    } else {
      // Last player reached, submit round scores
      setShowScoreInputModal(false);
      submitRoundScores();
    }
  };

  // Dodati novu funkciju za provjeru jesu li svi bodovi uneseni
  const allScoresEntered = () => {
    // Provjeri jesu li uneseni bodovi za sve igrače
    return players.every(
      (player) =>
        newScore[player.id] !== undefined && newScore[player.id] !== ''
    );
  };

  // Modificirati submitPlayerScore funkciju
  const submitPlayerScore = () => {
    const allScoresValid = allScoresEntered();

    if (allScoresValid) {
      // Svi igrači imaju unesene bodove, bez obzira na trenutni indeks
      setShowScoreInputModal(false);
      submitRoundScores();
    } else if (currentPlayerInputIndex < players.length - 1) {
      // Premjesti na sljedećeg igrača samo ako nisu svi bodovi uneseni
      setCurrentPlayerInputIndex(currentPlayerInputIndex + 1);
    } else {
      // Ako smo na zadnjem igraču ali još nemamo sve bodove
      // Prijeđi na prvog igrača koji nema unesen rezultat
      const nextPlayerWithoutScore = players.findIndex(
        (player) =>
          newScore[player.id] === undefined || newScore[player.id] === ''
      );

      if (nextPlayerWithoutScore !== -1) {
        setCurrentPlayerInputIndex(nextPlayerWithoutScore);
      }
    }
  };

  // Add scores for the current round
  const submitRoundScores = () => {
    try {
      // Check if all scores are entered
      const allScoresEntered = Object.values(newScore).every(
        (score) => score !== ''
      );

      if (!allScoresEntered) {
        alert('Molimo unesite bodove za sve igrače!');
        return;
      }

      // Update player scores
      const updatedPlayers = players.map((player) => {
        const score = parseInt(newScore[player.id]);
        const updatedScores = [...player.scores, score];
        const totalScore = updatedScores.reduce((sum, score) => sum + score, 0);

        return {
          ...player,
          scores: updatedScores,
          totalScore,
        };
      });

      const newRound = currentRound + 1;

      // Calculate next dealer using the algorithm
      const nextDealer = getNextDealer(newRound, players.length);
      const updatedDealerHistory = [...dealerHistory, nextDealer];

      // Set new state
      setPlayers(updatedPlayers);
      setCurrentRound(newRound);
      setDealer(nextDealer);
      setDealerHistory(updatedDealerHistory);

      // Reset newScore for next round
      const scoreObj: { [key: number]: string } = {};
      updatedPlayers.forEach((player) => {
        scoreObj[player.id] = '';
      });
      setNewScore(scoreObj);
      setCurrentPlayerInputIndex(0);

      // Explicitly save all data
      const dataToSave = {
        players: updatedPlayers,
        numPlayers,
        gameStarted,
        currentRound: newRound,
        dealer: nextDealer,
        dealerHistory: updatedDealerHistory,
      };
      GameStorage.saveGame(dataToSave);
      console.log('Round results saved');
    } catch (e) {
      console.error('Error saving round results:', e);
    }
  };

  // Start the score input process
  const startScoreInput = () => {
    setCurrentPlayerInputIndex(0);
    setShowScoreInputModal(true);
  };

  // Find min and max total scores
  const findMinMaxScores = () => {
    if (players.length === 0) return { min: 0, max: 0 };

    let min = players[0].totalScore;
    let max = players[0].totalScore;

    players.forEach((player) => {
      if (player.totalScore < min) min = player.totalScore;
      if (player.totalScore > max) max = player.totalScore;
    });

    return { min, max };
  };

  // Find min and max scores for a specific round
  const findMinMaxScoresForRound = (roundIndex: number) => {
    if (players.length === 0 || roundIndex < 0 || roundIndex >= currentRound)
      return { min: 0, max: 0 };

    const scoresInRound = players.map((player) => player.scores[roundIndex]);
    const min = Math.min(...scoresInRound);
    const max = Math.max(...scoresInRound);

    return { min, max };
  };

  // Get score cell style based on if it's min or max in a round
  const getRoundScoreCellStyle = (score: number, roundIndex: number) => {
    const { min, max } = findMinMaxScoresForRound(roundIndex);

    if (score === min && min !== max) return 'text-success fw-bold';
    if (score === max && min !== max) return 'text-danger fw-bold';
    return score < 0 ? 'text-success' : 'text-danger';
  };

  // Edit score in a specific round
  const openScoreEditModal = (
    playerId: number,
    roundIndex: number,
    currentScore: number
  ) => {
    setScoreToEdit({ playerId, roundIndex, currentScore });
    // Inicijalno postavimo prazno polje za uređivanje umjesto trenutne vrijednosti
    setNewScore({
      ...newScore,
      [playerId]: '',
    });
  };

  // Save edited score
  const saveEditedScore = () => {
    try {
      if (!scoreToEdit) return;

      const { playerId, roundIndex, currentScore } = scoreToEdit;
      // Ako je polje prazno, koristimo 0 kao zadanu vrijednost
      const newScoreValue =
        newScore[playerId] === '' ? 0 : parseInt(newScore[playerId] || '0');

      const updatedPlayers = players.map((player) => {
        if (player.id === playerId) {
          const updatedScores = [...player.scores];
          updatedScores[roundIndex] = newScoreValue;
          const totalScore = updatedScores.reduce(
            (sum, score) => sum + score,
            0
          );

          return {
            ...player,
            scores: updatedScores,
            totalScore,
          };
        }
        return player;
      });

      setPlayers(updatedPlayers);
      setScoreToEdit(null);

      // Reset newScore
      const scoreObj: { [key: number]: string } = {};
      updatedPlayers.forEach((player) => {
        scoreObj[player.id] = '';
      });
      setNewScore(scoreObj);

      // Explicitly save data after editing
      const dataToSave = {
        players: updatedPlayers,
        numPlayers,
        gameStarted,
        currentRound,
        dealer,
        dealerHistory,
      };
      GameStorage.saveGame(dataToSave);
      console.log('Edited result saved');
    } catch (e) {
      console.error('Error saving edited result:', e);
    }
  };

  // Get score cell style based on if it's min or max
  const getScoreCellStyle = (score: number) => {
    const { min, max } = findMinMaxScores();

    if (score === min && min !== max) return 'text-success fw-bold';
    if (score === max && min !== max) return 'text-danger fw-bold';
    return '';
  };

  // Numpad component
  const NumpadComponent = ({ onInput }: { onInput: (key: string) => void }) => {
    return (
      <div className="mt-3">
        <div className="d-flex flex-column align-items-center">
          {/* Prvi red: 1, 2, 3 */}
          <div className="d-flex justify-content-center w-100 mb-2">
            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                variant="outline-secondary"
                className="mx-1"
                style={{ width: '70px', height: '70px', fontSize: '1.7rem' }}
                onClick={() => onInput(num.toString())}
              >
                {num}
              </Button>
            ))}
          </div>

          {/* Drugi red: 4, 5, 6 */}
          <div className="d-flex justify-content-center w-100 mb-2">
            {[4, 5, 6].map((num) => (
              <Button
                key={num}
                variant="outline-secondary"
                className="mx-1"
                style={{ width: '70px', height: '70px', fontSize: '1.7rem' }}
                onClick={() => onInput(num.toString())}
              >
                {num}
              </Button>
            ))}
          </div>

          {/* Treći red: 7, 8, 9 */}
          <div className="d-flex justify-content-center w-100 mb-2">
            {[7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline-secondary"
                className="mx-1"
                style={{ width: '70px', height: '70px', fontSize: '1.7rem' }}
                onClick={() => onInput(num.toString())}
              >
                {num}
              </Button>
            ))}
          </div>

          {/* Četvrti red: -, 0, ← */}
          <div className="d-flex justify-content-center w-100 mb-2">
            <Button
              variant="outline-secondary"
              className="mx-1"
              style={{ width: '70px', height: '70px', fontSize: '1.7rem' }}
              onClick={() => onInput('-')}
            >
              -
            </Button>
            <Button
              variant="outline-secondary"
              className="mx-1"
              style={{ width: '70px', height: '70px', fontSize: '1.7rem' }}
              onClick={() => onInput('0')}
            >
              0
            </Button>
            <Button
              variant="outline-danger"
              className="mx-1"
              style={{ width: '70px', height: '70px', fontSize: '1.7rem' }}
              onClick={() => onInput('backspace')}
            >
              ←
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Create reverse round indexes array
  const reverseRoundIndexes = () => {
    return Array.from({ length: currentRound }, (_, i) => currentRound - 1 - i);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'Jeste li sigurni da želite izbrisati sve podatke igre i početi ispočetka?'
      )
    ) {
      try {
        GameStorage.clearGame();
        console.log('Data deleted from storage');
        // Reset state
        initializePlayers(numPlayers);
        setGameStarted(false);
        setCurrentRound(0);
        setDealer(0);
        setDealerHistory([]);
        alert('Svi podaci su obrisani');
      } catch (e) {
        console.error('Error deleting data:', e);
      }
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Remi Blok</h2>
          <div>
            {gameStarted && (
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      'Jeste li sigurni da želite završiti trenutnu igru? Podaci neće biti sačuvani.'
                    )
                  ) {
                    setGameStarted(false);
                    // Save the game state change immediately
                    const dataToSave = {
                      players,
                      numPlayers,
                      gameStarted: false,
                      currentRound,
                      dealer,
                      dealerHistory,
                    };
                    GameStorage.saveGame(dataToSave);
                  }
                }}
              >
                Nova igra
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          {!gameStarted ? (
            <div>
              <Form.Group className="mb-3">
                <Form.Label>Broj igrača (2-6):</Form.Label>
                <Form.Control
                  type="number"
                  min={2}
                  max={6}
                  value={numPlayers}
                  onChange={(e) => setNumPlayers(parseInt(e.target.value))}
                />
              </Form.Group>

              {players.map((player) => (
                <Form.Group key={player.id} className="mb-3">
                  <Form.Label>Ime Igrača {player.id + 1}:</Form.Label>
                  <Form.Control
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      handleNameChange(player.id, e.target.value)
                    }
                    className="form-control-modern"
                    placeholder={`Igrač ${player.id + 1}`}
                    onClick={(e) => {
                      // Označi cijeli tekst pri kliku
                      (e.target as HTMLInputElement).select();
                    }}
                  />
                </Form.Group>
              ))}

              <Button variant="primary" onClick={startGame} className="mt-2">
                Započni Igru
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <h3>Runda: {currentRound + 1}</h3>
                <p className="text-muted">Djelitelj: {players[dealer]?.name}</p>
              </div>

              <Row>
                <Col>
                  <h4>Unos rezultata</h4>
                  <Button
                    variant="primary"
                    onClick={startScoreInput}
                    className="mt-2 mb-3"
                  >
                    Unesi bodove za rundu {currentRound + 1}
                  </Button>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col>
                  <h4>Rezultati</h4>
                  <Table striped bordered hover responsive className="mt-3">
                    <thead>
                      <tr style={{ fontSize: '1.2rem' }}>
                        <th>Igrač</th>
                        <th>Ukupno</th>
                        {reverseRoundIndexes().map((roundIdx) => (
                          <th key={roundIdx}>Runda {roundIdx + 1}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '1.2rem' }}>
                      {players.map((player) => (
                        <tr key={player.id}>
                          <td>{player.name}</td>
                          <td className={getScoreCellStyle(player.totalScore)}>
                            {player.totalScore}
                          </td>
                          {reverseRoundIndexes().map((roundIdx) => (
                            <td
                              key={roundIdx}
                              className={getRoundScoreCellStyle(
                                player.scores[roundIdx],
                                roundIdx
                              )}
                              onClick={() =>
                                openScoreEditModal(
                                  player.id,
                                  roundIdx,
                                  player.scores[roundIdx]
                                )
                              }
                              style={{ cursor: 'pointer' }}
                            >
                              {player.scores[roundIdx]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal za unos bodova */}
      <Modal
        show={showScoreInputModal}
        onHide={() => setShowScoreInputModal(false)}
        backdrop="static"
        centered
        fullscreen="sm-down"
      >
        <Modal.Header>
          <Modal.Title>Unos bodova za rundu {currentRound + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2">
          {/* Izbor igrača */}
          <div
            className={`d-flex flex-wrap justify-content-center mb-3 ${
              players.length === 4 ? 'flex-row' : ''
            }`}
          >
            {players.length === 4 ? (
              <>
                {/* Prvi red za 4 igrača (igrač 1 i 2) */}
                <div className="d-flex justify-content-center w-100 mb-2">
                  {[0, 1].map((idx) => (
                    <Button
                      key={players[idx].id}
                      variant={
                        currentPlayerInputIndex === idx
                          ? 'primary'
                          : 'outline-primary'
                      }
                      className="mx-1"
                      onClick={() => setCurrentPlayerInputIndex(idx)}
                      style={{ minWidth: '140px', flex: 1 }}
                    >
                      {players[idx].name}
                      {newScore[players[idx].id]
                        ? ` (${newScore[players[idx].id]})`
                        : ''}
                    </Button>
                  ))}
                </div>
                {/* Drugi red za 4 igrača (igrač 3 i 4) */}
                <div className="d-flex justify-content-center w-100 mb-2">
                  {[2, 3].map((idx) => (
                    <Button
                      key={players[idx].id}
                      variant={
                        currentPlayerInputIndex === idx
                          ? 'primary'
                          : 'outline-primary'
                      }
                      className="mx-1"
                      onClick={() => setCurrentPlayerInputIndex(idx)}
                      style={{ minWidth: '140px', flex: 1 }}
                    >
                      {players[idx].name}
                      {newScore[players[idx].id]
                        ? ` (${newScore[players[idx].id]})`
                        : ''}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              /* Za ostale brojeve igrača prikaži jedan ispod drugog */
              players.map((player, idx) => (
                <Button
                  key={player.id}
                  variant={
                    currentPlayerInputIndex === idx
                      ? 'primary'
                      : 'outline-primary'
                  }
                  className="mx-1 mb-2"
                  onClick={() => setCurrentPlayerInputIndex(idx)}
                  style={{ minWidth: '100px' }}
                >
                  {player.name}
                  {newScore[player.id] ? ` (${newScore[player.id]})` : ''}
                </Button>
              ))
            )}
          </div>

          <Form.Group>
            <Form.Label>
              Bodovi za {players[currentPlayerInputIndex]?.name}:
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                inputMode="numeric"
                value={newScore[players[currentPlayerInputIndex]?.id] || ''}
                onChange={(e) => handleScoreChange(e.target.value)}
                placeholder="Unesite bodove"
                readOnly
              />
            </InputGroup>
            <NumpadComponent onInput={handleNumpadInput} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowScoreInputModal(false)}
          >
            Odustani
          </Button>
          <Button
            variant={allScoresEntered() ? 'success' : 'primary'}
            onClick={submitPlayerScore}
          >
            {allScoresEntered() ? 'Spremi rundu' : 'Sljedeći igrač'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal za uređivanje bodova */}
      <Modal
        show={scoreToEdit !== null}
        onHide={() => setScoreToEdit(null)}
        backdrop="static"
        centered
        fullscreen="sm-down"
      >
        <Modal.Header>
          <Modal.Title>
            Uredi bodove za{' '}
            {scoreToEdit
              ? players.find((p) => p.id === scoreToEdit.playerId)?.name
              : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-2">
          <Form.Group>
            <Form.Label>Bodovi:</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                inputMode="numeric"
                value={scoreToEdit ? newScore[scoreToEdit.playerId] || '' : ''}
                onChange={(e) =>
                  scoreToEdit &&
                  setNewScore({
                    ...newScore,
                    [scoreToEdit.playerId]: e.target.value,
                  })
                }
                placeholder="Unesite bodove"
                readOnly
              />
            </InputGroup>
            <NumpadComponent onInput={handleEditNumpadInput} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setScoreToEdit(null)}>
            Odustani
          </Button>
          <Button variant="primary" onClick={saveEditedScore}>
            Spremi promjene
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RemiGame;
