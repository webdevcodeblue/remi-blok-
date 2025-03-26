import React, { useState } from 'react';
import './App.css';
import RemiGame from './components/RemiGame';
import RulesModal from './components/RulesModal';
import { Container, Navbar, Button, Nav } from 'react-bootstrap';

function App() {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home" style={{ marginLeft: '15px' }}>
            Remi Blok
          </Navbar.Brand>
          <Nav className="me-auto">
            <Button variant="outline-light" onClick={() => setShowRules(true)}>
              Pravila igre
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <RemiGame />

      <RulesModal show={showRules} onHide={() => setShowRules(false)} />
    </div>
  );
}

export default App;
