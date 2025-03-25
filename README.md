# Remi Blok

Aplikacija za praćenje rezultata u igri Remi (Rummy).

## Funkcionalnosti

- Mogućnost podešavanja broja igrača (2-6)
- Unos imena igrača
- Praćenje rezultata po rundama
- Automatsko računanje ukupnog zbroja
- Jednostavan unos bodova s predefiniranim vrijednostima (-40, -80, -120)
- Prikaz pravila igre
- Praćenje tko je djelitelj u svakoj rundi
- Mogućnost uređivanja rezultata nakon unosa

## Kako koristiti

1. Podesite broj igrača (2-6)
2. Unesite imena igrača
3. Kliknite na "Započni igru"
4. Za svaku rundu:
   - Kliknite na "Unesi bodove za rundu"
   - Unesite bodove za svakog igrača (negativne za pobjednika, pozitivne za ostale)
   - Kliknite na "Sljedeći igrač" ili "Spremi rundu" nakon unosa bodova
5. Pratite rezultate u tablici
   - Najmanji ukupni rezultat je označen zelenom bojom
   - Najveći ukupni rezultat je označen crvenom bojom
6. Ako želite ispraviti rezultat, kliknite na broj u tablici i uredite ga

## Pravila bodovanja

- Pobjednik runde dobiva -40 bodova
- Za handiranje (pobjeda u jednom potezu) pobjednik dobiva -80 bodova
- Ukoliko igrač handira s kartom koja je presječena na početku igre, dobiva -120 bodova
- Ostalim igračima se zbrajaju vrijednosti preostalih karata
- Karte 10, J, Q, K i A se računaju kao 10 bodova
- Ostale karte (2-9) se računaju u njihovoj vrijednosti
- Džoker se računa kao +20 bodova
- Ako se igrač nije otvorio, dobiva +100 bodova
- Kod handiranja ostalim igračima se bodovi udvostručuju

## Tehnologije

- React
- TypeScript
- Bootstrap
- React Bootstrap

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
