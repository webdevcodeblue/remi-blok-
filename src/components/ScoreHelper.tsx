import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, ListGroup } from 'react-bootstrap';

const ScoreHelper: React.FC<{ onScoreCalculated: (score: number) => void }> = ({
  onScoreCalculated,
}) => {
  const [cards, setCards] = useState<{ [key: string]: number }>({
    '2-9': 0, // Cards 2-9
    '10-A': 0, // Cards 10, J, Q, K, A
    joker: 0, // Jokers
  });
  const [notOpened, setNotOpened] = useState<boolean>(false);
  const [handiranje, setHandiranje] = useState<boolean>(false);

  const calculateScore = () => {
    let total = 0;

    // Add card values
    total += cards['2-9'] * 5; // Average value of cards 2-9
    total += cards['10-A'] * 10; // Cards 10, J, Q, K, A are worth 10 each
    total += cards['joker'] * 20; // Jokers are worth 20 each

    // Add penalty for not opening
    if (notOpened) {
      total += 100;
    }

    // Double the score if opponent did "handiranje"
    if (handiranje) {
      total *= 2;
    }

    onScoreCalculated(total);
  };

  return (
    <Card className="mt-3 mb-3">
      <Card.Header className="bg-secondary text-white">
        <h5 className="mb-0">Pomoć za računanje bodova</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <h6>Preostale karte:</h6>
            <Form.Group className="mb-2">
              <Form.Label>Broj karata 2-9:</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={cards['2-9']}
                onChange={(e) =>
                  setCards({ ...cards, '2-9': parseInt(e.target.value) || 0 })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Broj karata 10, J, Q, K, A:</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={cards['10-A']}
                onChange={(e) =>
                  setCards({ ...cards, '10-A': parseInt(e.target.value) || 0 })
                }
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Broj džokera:</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="4"
                value={cards['joker']}
                onChange={(e) =>
                  setCards({ ...cards, joker: parseInt(e.target.value) || 0 })
                }
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <h6>Dodatne opcije:</h6>
            <Form.Check
              type="checkbox"
              id="not-opened"
              label="Igrač se nije otvorio (+100)"
              checked={notOpened}
              onChange={(e) => setNotOpened(e.target.checked)}
              className="mb-2"
            />

            <Form.Check
              type="checkbox"
              id="handiranje"
              label="Protivnik je handirao (×2)"
              checked={handiranje}
              onChange={(e) => setHandiranje(e.target.checked)}
              className="mb-2"
            />

            <Button variant="primary" onClick={calculateScore} className="mt-3">
              Izračunaj bodove
            </Button>
          </Col>
        </Row>

        <ListGroup className="mt-3">
          <ListGroup.Item>
            <strong>Podsetnik za bodovanje:</strong>
            <ul className="mb-0 mt-1">
              <li>Obične karte (2-9) - vrednost same karte</li>
              <li>Velike karte (10, J, Q, K, A) - 10 poena</li>
              <li>Džoker - 20 poena</li>
              <li>Nije otvoren - 100 poena</li>
              <li>Handiranje protivnika - duplira bodove</li>
              <li>
                Pobednik dobija -40 (-80 za handiranje, -120 sa presečenom
                kartom)
              </li>
            </ul>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default ScoreHelper;
