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
}

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

  // Učitaj podatke prilikom prvog pokretanja komponente
  useEffect(() => {
    try {
      console.log('Započinjem učitavanje podataka...');

      // Provjeri sve moguće lokacije podataka
      let savedData = localStorage.getItem('remiGameData');

      // Ako nema podataka na standardnom mjestu, provjeri backup
      if (!savedData) {
        console.log(
          'Nema podataka na standardnom mjestu, provjeravam backup...'
        );
        savedData = localStorage.getItem('remiGameData_backup');
      }

      // Provjeri je li localStorage dostupan i radi
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          console.log('localStorage je dostupan i radi');
        } catch (e) {
          console.error('localStorage nije dostupan:', e);
        }
      }

      if (savedData) {
        const data = JSON.parse(savedData);

        // Provjera valjanosti podataka
        if (
          data &&
          data.players &&
          Array.isArray(data.players) &&
          data.players.length > 0
        ) {
          console.log('Učitavam spremljene podatke:', data);
          setPlayers(data.players);
          setNumPlayers(data.numPlayers || 2);
          setGameStarted(data.gameStarted || false);
          setCurrentRound(data.currentRound || 0);
          setDealer(data.dealer || 0);
          setDealerHistory(data.dealerHistory || []);

          // Inicijaliziraj newScore objekt na temelju učitanih igrača
          const scoreObj: { [key: number]: string } = {};
          data.players.forEach((player: Player) => {
            scoreObj[player.id] = '';
          });
          setNewScore(scoreObj);
        } else {
          console.warn(
            'Nevaljani spremljeni podaci, inicijaliziram nove igrače'
          );
          initializePlayers(numPlayers);
          // Obriši nevaljane podatke
          localStorage.removeItem('remiGameData');
          localStorage.removeItem('remiGameData_backup');
        }
      } else {
        console.log('Nema spremljenih podataka, započinjem novu igru');
        // Inicijaliziraj igrače ako nema spremljenih podataka
        initializePlayers(numPlayers);
      }
    } catch (e) {
      console.error('Greška pri učitavanju podataka:', e);
      // U slučaju greške, inicijaliziraj nove igrače
      initializePlayers(numPlayers);
      // Obriši potencijalno korumpirane podatke
      try {
        localStorage.removeItem('remiGameData');
        localStorage.removeItem('remiGameData_backup');
      } catch (clearErr) {
        console.error('Greška pri čišćenju podataka:', clearErr);
      }
    }
  }, []);

  // Spremi podatke prije zatvaranja ili osvježavanja stranice
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('Stranica se zatvara/osvježava, spremam podatke...');

      // Osiguraj da su podaci spremljeni prije zatvaranja
      if (players.length > 0) {
        const dataToSave = {
          players,
          numPlayers,
          gameStarted,
          currentRound,
          dealer,
          dealerHistory,
        };

        try {
          // Spremi na oba mjesta za sigurnost
          localStorage.setItem('remiGameData', JSON.stringify(dataToSave));
          localStorage.setItem(
            'remiGameData_backup',
            JSON.stringify(dataToSave)
          );
          console.log('Podaci spremljeni prije zatvaranja');
        } catch (e) {
          console.error('Greška pri spremanju prije zatvaranja:', e);
        }
      }
    };

    // Dodaj event listener za zatvaranje ili osvježavanje
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Ukloni event listener kada se komponenta uništi
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [players, numPlayers, gameStarted, currentRound, dealer, dealerHistory]);

  // Spremanje podataka u localStorage
  const saveGameData = () => {
    try {
      if (players.length > 0) {
        const dataToSave = {
          players,
          numPlayers,
          gameStarted,
          currentRound,
          dealer,
          dealerHistory,
        };

        // Pokušaj izravno spremiti
        localStorage.setItem('remiGameData', JSON.stringify(dataToSave));

        // Provjeri je li spremljeno
        const checkSaved = localStorage.getItem('remiGameData');
        if (checkSaved) {
          console.log('Podaci uspješno spremljeni');
        } else {
          console.warn('Podaci nisu uspješno spremljeni');

          // Pokušaj s novim ključem ako prethodni nije uspio
          localStorage.setItem(
            'remiGameData_backup',
            JSON.stringify(dataToSave)
          );
        }
      }
    } catch (e) {
      console.error('Greška pri spremanju podataka:', e);
      // Pokušaj spremiti kao backup
      try {
        localStorage.setItem(
          'remiGameData_backup',
          JSON.stringify({
            players,
            numPlayers,
            gameStarted,
            currentRound,
            dealer,
            dealerHistory,
          })
        );
        console.log('Backup podataka spremljen');
      } catch (e2) {
        console.error('Ni backup nije uspio:', e2);
      }
    }
  };

  // Spremi podatke na svaku promjenu bitnih stanja
  useEffect(() => {
    saveGameData();
  }, [players, numPlayers, gameStarted, currentRound, dealer, dealerHistory]);

  // Inicijaliziraj igrače
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

      // Odmah spremi inicijalno stanje u localStorage
      const dataToSave = {
        players: resetPlayers,
        numPlayers,
        gameStarted: true,
        currentRound: 0,
        dealer: 0,
        dealerHistory: [0],
      };
      localStorage.setItem('remiGameData', JSON.stringify(dataToSave));
      console.log('Nova igra spremljena u localStorage');
    } catch (e) {
      console.error('Greška pri započinjanju nove igre:', e);
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

  // Submit score and go to next player or finish round
  const submitPlayerScore = () => {
    const playerId = players[currentPlayerInputIndex].id;
    if (newScore[playerId] === '') {
      alert('Molimo unesite bodove za trenutnog igrača!');
      return;
    }

    moveToNextPlayer();
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

      // Postavi novo stanje
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

      // Eksplicitno spremi sve podatke
      const dataToSave = {
        players: updatedPlayers,
        numPlayers,
        gameStarted,
        currentRound: newRound,
        dealer: nextDealer,
        dealerHistory: updatedDealerHistory,
      };
      localStorage.setItem('remiGameData', JSON.stringify(dataToSave));
      console.log('Rezultati runde spremljeni');
    } catch (e) {
      console.error('Greška pri spremanju rezultata runde:', e);
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

      // Eksplicitno spremi podatke nakon uređivanja
      const dataToSave = {
        players: updatedPlayers,
        numPlayers,
        gameStarted,
        currentRound,
        dealer,
        dealerHistory,
      };
      localStorage.setItem('remiGameData', JSON.stringify(dataToSave));
      console.log('Uređeni rezultat spremljen');
    } catch (e) {
      console.error('Greška pri spremanju uređenog rezultata:', e);
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
        localStorage.removeItem('remiGameData');
        console.log('Podaci obrisani iz localStorage-a');
        // Resetiraj stanje
        initializePlayers(numPlayers);
        setGameStarted(false);
        setCurrentRound(0);
        setDealer(0);
        setDealerHistory([]);
        alert('Svi podaci su obrisani');
      } catch (e) {
        console.error('Greška pri brisanju podataka:', e);
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
                      'Jeste li sigurni da želite završiti trenutnu igru? Podaci će biti sačuvani.'
                    )
                  ) {
                    setGameStarted(false);
                    saveGameData(); // Odmah spremi promjenu
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
          {currentPlayerInputIndex < players.length - 1 ? (
            <Button variant="primary" onClick={submitPlayerScore}>
              Sljedeći igrač
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={submitPlayerScore}
              disabled={Object.values(newScore).some((score) => score === '')}
            >
              Spremi rundu
            </Button>
          )}
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
