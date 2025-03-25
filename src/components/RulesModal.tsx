import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface RulesModalProps {
  show: boolean;
  onHide: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Pravila igre Remi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Osnovne informacije</h4>
        <p>
          Remi se igra s 2 standardna špila od 52 karte + 4 džokera. Može igrati
          od 2 do 6 igrača.
        </p>

        <h4>Početak igre</h4>
        <ul>
          <li>Nasumično se odabere igrač koji će prvi dijeliti.</li>
          <li>Igrač prije njega presječe špil karata.</li>
          <li>
            Djelitelj u prvom krugu dijeljenja igraču ispred sebe podijeli tri
            karte a ostalim igračima po dvije.
          </li>
          <li>
            Poslije prvog kruga dijeljenja dijeli se svima po dvije karte dok
            igrač ispred djelitelja ne dobije 15 karata a svi ostali po 14
            karata.
          </li>
          <li>
            Igrač prije djelitelja izvlači jednu kartu s dna presječene grupe
            karata i stavlja je licem na gore.
          </li>
          <li>
            Ukoliko igrač koji sječe izvuče džokera, može ga zadržati za sebe i
            izvlači sljedeću kartu.
          </li>
        </ul>

        <h4>Cilj igre</h4>
        <p>
          Cilj igre je osloboditi se svih karata koje imate u ruci. Da biste se
          oslobađali karata prvo morate se otvoriti.
        </p>

        <h4>Otvaranje</h4>
        <p>
          Otvaranje se vrši tako što na stol ispred sebe izlažete složene
          validne grupe karata licem na gore a čiji zbroj mora biti 51 ili veći.
        </p>
        <ul>
          <li>Karte 10, 12, 13, 14 i kečevi se računaju kao 10 bodova.</li>
          <li>Ostale karte se računaju u njihovoj vrijednosti.</li>
          <li>
            Validna grupa karata pri izlaganju mora imati najmanje 3 karte.
          </li>
        </ul>

        <h4>Tipovi grupa</h4>
        <ol>
          <li>
            <strong>Grupe istog broja</strong> - Grupu čine karte istog broja
            ali različitih znakova (na primjer 10♥, 10♣, 10♦).
            <ul>
              <li>Takva grupa ne može imati dvije karte s istim znakom.</li>
              <li>Grupa može imati 3 ili maksimalno 4 karte.</li>
            </ul>
          </li>
          <li>
            <strong>Rastući nizovi</strong> - Uzlazni niz karata istog znaka (na
            primjer 1♣, 2♣, 3♣, 4♣ ili 13♥, 14♥, 1♥).
            <ul>
              <li>Nizovi mogu početi s kecom i završavaju se kecom.</li>
              <li>Kec ne ide poslije desetke već poslije popa.</li>
              <li>Poslije popa i keca ne možete staviti dvojku.</li>
            </ul>
          </li>
        </ol>

        <h4>Pravila vezana za džokere</h4>
        <ul>
          <li>Džokeri mogu zamijeniti bilo koju kartu u grupama.</li>
          <li>
            Vrijednost džokera se računa ovisno o tome koju kartu mijenja.
          </li>
          <li>Pri otvaranju grupa može imati samo jednog džokera.</li>
          <li>
            Džokera nije dozvoljeno izbaciti samostalno već samo u kombinaciji s
            još jednom kartom (sahranjivanje džokera).
          </li>
        </ul>

        <h4>Bodovanje</h4>
        <ul>
          <li>
            Pobjednik runde dobiva <strong>-40</strong> bodova.
          </li>
          <li>
            Za handiranje (pobjeda u jednom potezu) pobjednik dobiva{' '}
            <strong>-80</strong> bodova.
          </li>
          <li>
            Ukoliko igrač handira s kartom koja je presječena na početku igre,
            dobiva <strong>-120</strong> bodova.
          </li>
          <li>Ostalim igračima se zbrajaju vrijednosti preostalih karata.</li>
          <li>
            Ukoliko je nekome ostao džoker u ruci on se računa{' '}
            <strong>+20</strong> bodova.
          </li>
          <li>
            Ukoliko se igrač nije otvorio njemu se piše <strong>+100</strong>{' '}
            bodova.
          </li>
          <li>
            Ukoliko netko od igrača handira ostalim igračima se udvostručuju
            bodovi.
          </li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Zatvori
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RulesModal;
