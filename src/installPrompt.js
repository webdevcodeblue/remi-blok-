// Ova skripta dodaje prompt za instalaciju PWA aplikacije

let deferredPrompt;
let installBanner;

// Funkcija za stvaranje i prikazivanje instalacijskog bannera
const showInstallBanner = () => {
  // Provjeri je li banner već stvoren
  if (installBanner) return;

  // Stvori banner element
  installBanner = document.createElement('div');
  installBanner.className = 'install-banner';
  installBanner.innerHTML = `
    <div class="install-content">
      <img src="${window.location.pathname}logo192.png" alt="Remi Blok Icon" class="install-icon">
      <div class="install-text">
        <h3>Instalirajte Remi Blok</h3>
        <p>Koristite aplikaciju i bez interneta!</p>
      </div>
    </div>
    <div class="install-actions">
      <button id="install-button">Instaliraj 😉</button>
      <button id="close-banner">Ne, hvala</button>
    </div>
  `;

  // Dodaj CSS za banner
  const style = document.createElement('style');
  style.textContent = `
    .install-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #fff;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      padding: 15px;
      display: flex;
      flex-direction: column;
      z-index: 10000;
      border-top: 3px solid #2196F3;
      animation: slide-up 0.3s ease-out;
    }
    @keyframes slide-up {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .install-content {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .install-icon {
      width: 40px;
      height: 40px;
      margin-right: 15px;
      border-radius: 8px;
    }
    .install-text {
      flex-grow: 1;
    }
    .install-text h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      color: #333;
    }
    .install-text p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
    .install-actions {
      display: flex;
      gap: 10px;
    }
    .install-actions button {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      cursor: pointer;
      font-size: 14px;
      border: none;
      transition: all 0.2s ease;
    }
    #install-button {
      background: linear-gradient(135deg, #2196F3, #1565C0);
      color: white;
      flex-grow: 1;
    }
    #install-button:hover {
      background: linear-gradient(135deg, #1E88E5, #0D47A1);
      box-shadow: 0 2px 5px rgba(33, 150, 243, 0.3);
    }
    #close-banner {
      background-color: #f5f5f5;
      color: #333;
    }
    #close-banner:hover {
      background-color: #e0e0e0;
    }
  `;

  // Dodaj banner i stil na stranicu
  document.head.appendChild(style);
  document.body.appendChild(installBanner);

  // Dodaj event listenere
  document.getElementById('install-button').addEventListener('click', () => {
    // Sakrij banner
    hideInstallBanner();

    // Pokreni prompt za instalaciju
    if (deferredPrompt) {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Korisnik je prihvatio instalaciju');
          // Spremi u localStorage da korisnik ne dobiva ponovno prompt
          localStorage.setItem('appInstalled', 'true');
        } else {
          console.log('Korisnik je odbio instalaciju');
          // Možda prikaži opet kasnije
          setTimeout(() => {
            if (!localStorage.getItem('appInstalled')) {
              showInstallBanner();
            }
          }, 3 * 24 * 60 * 60 * 1000); // Prikaži opet za 3 dana
        }

        deferredPrompt = null;
      });
    }
  });

  document.getElementById('close-banner').addEventListener('click', () => {
    hideInstallBanner();

    // Označi u sessionStorage da korisnik ne želi instalirati aplikaciju u ovoj sesiji
    sessionStorage.setItem('installDeclined', 'true');
  });
};

// Funkcija za sakrivanje bannera
const hideInstallBanner = () => {
  if (installBanner) {
    installBanner.style.animation = 'slide-down 0.3s ease-out forwards';

    // Dodaj animaciju za izlaz
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slide-down {
        from { transform: translateY(0); }
        to { transform: translateY(100%); }
      }
    `;
    document.head.appendChild(style);

    // Ukloni banner nakon animacije
    setTimeout(() => {
      if (installBanner && installBanner.parentNode) {
        installBanner.parentNode.removeChild(installBanner);
        installBanner = null;
      }
    }, 300);
  }
};

// Osluškuj beforeinstallprompt događaj
window.addEventListener('beforeinstallprompt', (e) => {
  // Spriječi automatski prompt
  e.preventDefault();

  // Spremi event za kasniju upotrebu
  deferredPrompt = e;

  // Provjeri je li korisnik već odbio instalaciju u ovoj sesiji
  if (sessionStorage.getItem('installDeclined')) {
    return;
  }

  // Provjeri je li aplikacija već instalirana
  if (localStorage.getItem('appInstalled')) {
    return;
  }

  // Provjeri je li korisnik na mobilnom uređaju
  if (window.innerWidth < 768) {
    // Počekaj 2 sekunde prije prikazivanja prompta
    setTimeout(() => {
      showInstallBanner();
    }, 2000); // 2 sekunde
  } else {
    showInstallBanner(); // Prikaži odmah na desktop uređajima
  }
});

// Osluškuj appinstalled događaj
window.addEventListener('appinstalled', () => {
  console.log('Aplikacija je instalirana');
  // Sakrij banner ako je prikazan
  hideInstallBanner();
  // Zapiši da je aplikacija instalirana
  localStorage.setItem('appInstalled', 'true');
});
