class Songo {
    constructor() {
        this.coteJoueur2 = [5, 5, 5, 5, 5, 5, 5];
        this.coteJoueur1 = [5, 5, 5, 5, 5, 5, 5];
        this.pointJoueur1 = 0;
        this.pointJoueur2 = 0;
        this.tour = 1;
        this.statutJeu = 0;
        this.pseudoJ1 = "ARCHICAD1";
        this.pseudoJ2 = "ARCHICAD2";
    }

    estBloque(idJ) {
        const cote = (idJ === 1) ? this.coteJoueur1 : this.coteJoueur2;
        return cote.reduce((acc, val) => acc + val, 0) === 0 ? 1 : 0;
    }

    distribution(idJ, indexChoisi) {
        if (idJ !== this.tour || this.statutJeu !== 0) return null;

        let coteActuel = (idJ === 1) ? this.coteJoueur1 : this.coteJoueur2;
        if (coteActuel[indexChoisi] === 0) return null;

        let pions = coteActuel[indexChoisi];
        coteActuel[indexChoisi] = 0;

        let indiceActuel = indexChoisi;
        let campActuel = idJ;
        let changerCamp = 0;
        while (pions > 0) {
            if (campActuel === 1) {
                indiceActuel++;
            } else {
                indiceActuel--;
            }
            if (campActuel === 1) {
                if (indiceActuel > 6) {
                    indiceActuel--;
                    campActuel = 2;
                    changerCamp++;
                    if (changerCamp === 2) {
                        indiceActuel++;
                    }
                }
            } else if (campActuel === 2) {
                if (indiceActuel < 0) {
                    indiceActuel++;
                    campActuel = 1;
                    changerCamp++;
                    if (changerCamp === 2) {
                        indiceActuel++;
                    }
                }
            }

            if (campActuel === 1) {
                this.coteJoueur1[indiceActuel]++;
            } else {
                this.coteJoueur2[indiceActuel]++;
            }
            pions--;
        }

        return { campFinal: campActuel, indexFinal: indiceActuel };
    }

    priseEnChaine(idJ, infoFin) {
        if (!infoFin) return;
        let camp = infoFin.campFinal;
        let index = infoFin.indexFinal;
        if (camp === idJ) {
            this.tour = (this.tour === 1) ? 2 : 1;
            return null;
        } else if (camp === 1) {
            while (index >= 0 && this.coteJoueur1[index] > 0 && this.coteJoueur1[index] < 4) {
                this.pointJoueur2 += this.coteJoueur1[index];
                this.coteJoueur1[index] = 0;
                index--;
            }
            this.tour = (this.tour === 1) ? 2 : 1;
            this.verifierFin();
        } else {
            while (index <= 6 && this.coteJoueur2[index] > 0 && this.coteJoueur2[index] < 4) {
                this.pointJoueur1 += this.coteJoueur2[index];
                this.coteJoueur2[index] = 0;
                index++;
            }
            this.tour = (this.tour === 1) ? 2 : 1;
            this.verifierFin();
        }
    }

    verifierFin() {
        if (this.pointJoueur1 > 35) this.statutJeu = 1;
        else if (this.pointJoueur2 > 35) this.statutJeu = 2;
        else if (this.estBloque(1) && this.estBloque(2)) {
            this.statutJeu = this.pointJoueur1 > this.pointJoueur2 ? 1 : 2;
        }
    }

    reset() {
        this.coteJoueur1 = [5, 5, 5, 5, 5, 5, 5];
        this.coteJoueur2 = [5, 5, 5, 5, 5, 5, 5];
        this.pointJoueur1 = 0;
        this.pointJoueur2 = 0;
        this.tour = 1;
        this.statutJeu = 0;
    }

    importState(state) {
        this.coteJoueur1 = state.coteJoueur1;
        this.coteJoueur2 = state.coteJoueur2;
        this.pointJoueur1 = state.pointJoueur1;
        this.pointJoueur2 = state.pointJoueur2;
        this.tour = state.tour;
        this.statutJeu = state.statutJeu;
        this.pseudoJ1 = state.pseudoJ1;
        this.pseudoJ2 = state.pseudoJ2;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const jeu = new Songo();

    const sonClic = new Audio('sounds/click.mp3');
    const sonScore = new Audio('sounds/score.mp3');
    const sonVictoire = new Audio('sounds/victory.mp3');

    const cases1 = document.querySelectorAll('.casej1');
    const cases2 = document.querySelectorAll('.casej2');
    const infos = document.getElementById('infos');
    const scoreJ1 = document.getElementById('score1');
    const scoreJ2 = document.getElementById('score2');
    const res = document.getElementById('res');
    const start = document.getElementById('start');
    const btnValider = document.getElementById('valider');
    const nomInput = document.getElementById('champNom');
    const nomInput2 = document.getElementById('champNom2');
    const restart = document.getElementById('restart');
    const elementsJeu = document.querySelectorAll('.jeu');
    const champs = document.getElementById('champs');

    const btnCreer = document.getElementById('creer-partie');
    const btnRejoindre = document.getElementById('rejoindre-partie');
    const zoneId = document.getElementById('zone-id');
    const zoneRejoindre = document.getElementById('zone-rejoindre');
    const partageId = document.getElementById('partage-id');
    const codeHote = document.getElementById('code-hote');
    const btnValiderConnexion = document.getElementById('valider-connexion');
    const roleAffiche = document.getElementById('role-affiche');
    const menuConnexion = document.getElementById('menu-connexion');

    let monPeer = null;
    let connexionP2P = null;
    let monRole = 0;

    let ancienScoreJ1 = 0;
    let ancienScoreJ2 = 0;

    btnCreer.addEventListener('click', () => {
        btnCreer.style.display = 'none';
        btnRejoindre.style.display = 'none';
        zoneId.style.display = 'block';
        monRole = 1;
        roleAffiche.innerText = "1 (Hôte)";

        monPeer = new Peer();
        monPeer.on('open', (id) => {
            partageId.innerText = id;
        });

        monPeer.on('connection', (conn) => {
            connexionP2P = conn;
            initialiserCanalP2P();
            activerEtapeNoms();
        });
    });

    btnRejoindre.addEventListener('click', () => {
        btnCreer.style.display = 'none';
        btnRejoindre.style.display = 'none';
        zoneRejoindre.style.display = 'block';
        monRole = 2;
        roleAffiche.innerText = "2 (Invité)";
    });

    btnValiderConnexion.addEventListener('click', () => {
        const targetId = codeHote.value.trim();
        if (!targetId) return;

        monPeer = new Peer();
        monPeer.on('open', () => {
            connexionP2P = monPeer.connect(targetId);
            initialiserCanalP2P();
            menuConnexion.style.display = 'none';
            champs.style.display = 'block';
        });
    });

    function initialiserCanalP2P() {
        connexionP2P.on('data', (data) => {
            if (data.type === 'SYNC') {
                jeu.importState(data.game);
                document.getElementById('pseudoAffiche').innerText = jeu.pseudoJ1;
                document.getElementById('pseudoAffiche2').innerText = jeu.pseudoJ2;
                majInterface();
            }
        });
    }

    function activerEtapeNoms() {
        menuConnexion.style.display = 'none';
        champs.style.display = 'block';
    }

    start.addEventListener('click', () => {
        champs.style.display = 'block';
        start.style.display = "none";
    });

    btnValider.addEventListener('click', () => {
        if (nomInput.value.trim() !== "" && nomInput2.value.trim() !== "") {
            jeu.pseudoJ1 = nomInput.value;
            jeu.pseudoJ2 = nomInput2.value;
        } else {
            jeu.pseudoJ1 = "ARCHICAD1";
            jeu.pseudoJ2 = "ARCHICAD2";
        }

        document.getElementById('pseudoAffiche').innerText = jeu.pseudoJ1;
        document.getElementById('pseudoAffiche2').innerText = jeu.pseudoJ2;

        elementsJeu.forEach(el => el.style.display = "flex");
        start.style.display = "none";
        champs.style.display = "none";

        document.getElementById('etat').style.display = "block";
        document.getElementById('tablejeu').style.display = "block";

        syncData();
        majInterface();
    });

    function syncData() {
        if (connexionP2P) {
            connexionP2P.send({
                type: 'SYNC',
                game: {
                    coteJoueur1: jeu.coteJoueur1,
                    coteJoueur2: jeu.coteJoueur2,
                    pointJoueur1: jeu.pointJoueur1,
                    pointJoueur2: jeu.pointJoueur2,
                    tour: jeu.tour,
                    statutJeu: jeu.statutJeu,
                    pseudoJ1: jeu.pseudoJ1,
                    pseudoJ2: jeu.pseudoJ2
                }
            });
        }
    }

    function majInterface() {
        scoreJ1.innerText = jeu.pointJoueur1;
        scoreJ2.innerText = jeu.pointJoueur2;

        jeu.coteJoueur1.forEach((p, i) => { if (cases1[i]) cases1[i].innerText = p; });
        jeu.coteJoueur2.forEach((p, i) => { if (cases2[i]) cases2[i].innerText = p; });

        if (jeu.pointJoueur1 > ancienScoreJ1 || jeu.pointJoueur2 > ancienScoreJ2) {
            sonScore.play().catch(e => console.log("Audio en attente"));
        }
        ancienScoreJ1 = jeu.pointJoueur1;
        ancienScoreJ2 = jeu.pointJoueur2;

        if (jeu.statutJeu !== 0) {
            res.style.display = "block";
            sonVictoire.play().catch(e => console.log("Audio en attente"));
            res.innerHTML = jeu.statutJeu === 1 ? `🏆 ${jeu.pseudoJ1} Gagne !` : `🏆 ${jeu.pseudoJ2} Gagne !`;
            infos.innerText = "Partie terminée !";
        } else {
            res.style.display = "none";
            const actuelPseudo = jeu.tour === 1 ? jeu.pseudoJ1 : jeu.pseudoJ2;
            if (jeu.tour === monRole) {
                infos.innerText = `🟢 C'est votre tour de jouer (${actuelPseudo})`;
            } else {
                infos.innerText = `🔴 Attente du coup de votre adversaire (${actuelPseudo})`;
            }
        }
    }

    cases1.forEach((e, i) => {
        e.addEventListener('click', () => {
            if (monRole !== 1) {
                infos.innerText = "❌ Vous êtes Joueur 2. Contrôlez le camp du haut.";
                return;
            }
            if (jeu.tour !== 1) {
                infos.innerText = `❌ Ce n'est pas ton tour ! (Tour de ${jeu.pseudoJ2})`;
                return;
            }
            sonClic.play().catch(e => console.log("Audio actif"));
            const infoFin = jeu.distribution(1, i);
            if (infoFin === null) {
                infos.innerText = "❌ Coup invalide (case vide) !";
                return;
            }
            jeu.priseEnChaine(1, infoFin);
            syncData();
            majInterface();
        });
    });

    cases2.forEach((e, i) => {
        e.addEventListener('click', () => {
            if (monRole !== 2) {
                infos.innerText = "❌ Vous êtes Joueur 1. Contrôlez le camp du bas.";
                return;
            }
            if (jeu.tour !== 2) {
                infos.innerText = `❌ Ce n'est pas ton tour ! (Tour de ${jeu.pseudoJ1})`;
                return;
            }
            sonClic.play().catch(e => console.log("Audio actif"));
            const infoFin = jeu.distribution(2, i);
            if (infoFin === null) {
                infos.innerText = "❌ Coup invalide (case vide) !";
                return;
            }
            jeu.priseEnChaine(2, infoFin);
            syncData();
            majInterface();
        });
    });

    restart.addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment recommencer la partie?')) {
            jeu.reset();
            ancienScoreJ1 = 0;
            ancienScoreJ2 = 0;
            syncData();
            majInterface();
        }
    });
});