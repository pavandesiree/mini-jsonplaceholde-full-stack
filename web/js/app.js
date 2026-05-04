// js/app.js — Modulo principale
//
// Importa api.js e ui.js, gestisce navigazione, form e drill-down.

import * as api from "./api.js";
import * as ui from "./ui.js";

// ============================================================
// Stato drill-down
// ============================================================

let utenteSelezionato = null;   // { id, nome }
let postSelezionato = null;     // { id, titolo }
let paginaCorrentePost = 1;
let limitePost = 5;

// ============================================================
// Esercizio 3 - Stato modifica utente
// ============================================================

let utenteInModifica = null;

// ============================================================
// Riferimenti DOM
// ============================================================

const sezioni = {
    utenti: document.getElementById("sezione-utenti"),
    post: document.getElementById("sezione-post"),
    commenti: document.getElementById("sezione-commenti"),
};

const navBottoni = {
    utenti: document.getElementById("nav-utenti"),
    post: document.getElementById("nav-post"),
    commenti: document.getElementById("nav-commenti"),
};

const liste = {
    utenti: document.getElementById("lista-utenti"),
    post: document.getElementById("lista-post"),
    commenti: document.getElementById("lista-commenti"),
};

const breadcrumbs = {
    post: document.getElementById("breadcrumb-post"),
    commenti: document.getElementById("breadcrumb-commenti"),
};

const titoli = {
    post: document.getElementById("titolo-post"),
    commenti: document.getElementById("titolo-commenti"),
};

// ============================================================
// Esercizio 11 - Funzioni Login-Logout
// ============================================================
document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    console.log("Tentativo login con:", email, password);
    try {
        const { utente } = await api.login(email, password);
        localStorage.setItem("utente", JSON.stringify(utente));
        aggiornaStatoLogin();
        aggiornaVisibilitaUI();
        await caricaUtenti();
        document.getElementById("form-login").reset();
    } catch (errore) {
        console.log("Errore completo:", errore);
        console.log("Messaggio:", errore.message);
        alert("Login fallito: " + errore.message);
    }
});

function getUtenteLoggato() {
    const raw = localStorage.getItem("utente");
    return raw ? JSON.parse(raw) : null;
}

function logout() {
    api.logout();
    localStorage.removeItem("utente");
    aggiornaStatoLogin();
    aggiornaVisibilitaUI();
    annullaModifica();
    document.getElementById("form-utente").reset();
    document.getElementById("form-login").reset();
    caricaUtenti();
}

function aggiornaStatoLogin() {
    const utente = JSON.parse(localStorage.getItem("utente") || "null");
    document.getElementById("stato-login").textContent = utente
        ? `Loggato come ${utente.nome}`
        : "Non sei autenticato";
}

function aggiornaVisibilitaUI() {
    const utente = getUtenteLoggato();
    const formNuovoUtente = document.getElementById("form-utente");

    if (formNuovoUtente) {
        formNuovoUtente.style.display =
            utente?.ruolo === "admin" ? "" : "none";
    }
}

// ============================================================
// Esercizio 3 - Funzioni modifica utente
// ============================================================
function attivaModificaUtente(utente) {
    utenteInModifica = utente;

    document.getElementById("utente-nome").value = utente.nome;
    document.getElementById("utente-email").value = utente.email;
    document.getElementById("utente-citta").value = utente.citta || "";
    document.getElementById("utente-cf").value = utente.codiceFiscale || "";
    document.getElementById("utente-sesso").value = utente.sesso || "";
    document.getElementById("utente-dataNascita").value = utente.dataNascita || "";
    document.getElementById("utente-telefono").value = utente.telefono || "";

    document.querySelector("#form-utente button[type='submit']").textContent = "Aggiorna utente";
    const h3Form = document.querySelector("#form-utente h3");
    if (h3Form) h3Form.textContent = "Modifica utente";}

function resetFormUtente() {
    utenteInModifica = null;

    const form = document.getElementById("form-utente");
    form.reset();

    document.querySelector("#form-utente button[type='submit']").textContent = "Crea utente";
    const h3Form = document.querySelector("#form-utente h3");
    if (h3Form) h3Form.textContent = "Nuovo utente";}

// ============================================================
// Navigazione
// ============================================================

function mostraSezione(nome) {
    for (const [chiave, sezione] of Object.entries(sezioni)) {
        sezione.classList.toggle("nascosta", chiave !== nome);
        navBottoni[chiave].classList.toggle("attivo", chiave === nome);
    }
}

navBottoni.utenti.addEventListener("click", async () => {
    utenteSelezionato = null;
    mostraSezione("utenti");
    await caricaUtenti();
});

navBottoni.post.addEventListener("click", async () => {
    paginaCorrentePost = 1;
    utenteSelezionato = null;
    breadcrumbs.post.innerHTML = "";
    titoli.post.textContent = "Post";
    document.getElementById("post-userId").value = "";
    mostraSezione("post");
    await caricaPost();
});

navBottoni.commenti.addEventListener("click", async () => {
    postSelezionato = null;
    breadcrumbs.commenti.innerHTML = "";
    titoli.commenti.textContent = "Commenti";
    document.getElementById("commento-postId").value = "";
    mostraSezione("commenti");
    await caricaCommenti();
});

document.getElementById("nav-logout").addEventListener("click", () => {
    logout();
});

// ============================================================
// Caricamento dati
// ============================================================

async function caricaUtenti() {
    try {
        const utenti = await api.ottieniUtenti();
        const utenteLoggato = getUtenteLoggato();

        ui.mostraUtenti(utenti, liste.utenti, {
            onVediPost: vediPostDiUtente,
            onElimina: eliminaUtente,
            onModifica: attivaModificaUtente
        }, utenteLoggato);

    } catch (err) {
        ui.mostraErrore(err.message, liste.utenti);
    }
}

async function caricaPost(userId) {
    try {
        const risposta = await api.ottieniPost(userId, paginaCorrentePost, limitePost);
        const utenteLoggato = getUtenteLoggato();

        ui.mostraPost(risposta.dati, liste.post, {
            onVediCommenti: vediCommentiDiPost,
            onElimina: eliminaPost,
        }, utenteLoggato);

        renderPaginazione(risposta);

    } catch (err) {
        ui.mostraErrore(err.message, liste.post);
    }
}

async function caricaCommenti(postId) {
    try {
        const commenti = await api.ottieniCommenti(postId);
        ui.mostraCommenti(commenti, liste.commenti, {
            onElimina: eliminaCommento,
        });
    } catch (err) {
        ui.mostraErrore(err.message, liste.commenti);
    }
}

// Esercizio 5 - Contatore statistiche
async function aggiornaStatistiche() {
    try {
        const [utenti, post, commenti] = await Promise.all([
            api.ottieniUtenti(),
            api.ottieniPost(),
            api.ottieniCommenti()
        ]);

        document.getElementById("statistiche").textContent =
        `Utenti: ${utenti.length} | Post: ${post.totale} | Commenti: ${commenti.length}`;
    } catch (err) {
        console.error("Errore statistiche:", err);
    }
}

// ============================================================
// Drill-down
// ============================================================

async function vediPostDiUtente(utente) {
    paginaCorrentePost = 1;
    utenteSelezionato = { id: utente.id, nome: utente.nome };
    titoli.post.textContent = `Post di ${utente.nome}`;
    breadcrumbs.post.innerHTML = `<a id="torna-utenti">Utenti</a> &rarr; Post di ${utente.nome}`;
    document.getElementById("post-userId").value = utente.id;

    document.getElementById("torna-utenti").addEventListener("click", async () => {
        utenteSelezionato = null;
        mostraSezione("utenti");
        await caricaUtenti();
    });

    mostraSezione("post");
    await caricaPost(utente.id);
}

async function vediCommentiDiPost(post) {
    postSelezionato = { id: post.id, titolo: post.titolo };
    titoli.commenti.textContent = `Commenti al post: ${post.titolo}`;
    breadcrumbs.commenti.innerHTML = `<a id="torna-post">Post</a> &rarr; Commenti`;
    document.getElementById("commento-postId").value = post.id;

    document.getElementById("torna-post").addEventListener("click", async () => {
        postSelezionato = null;
        mostraSezione("post");
        if (utenteSelezionato) {
            await caricaPost(utenteSelezionato.id);
        } else {
            breadcrumbs.post.innerHTML = "";
            titoli.post.textContent = "Post";
            await caricaPost();
        }
    });

    mostraSezione("commenti");
    await caricaCommenti(post.id);
}

// ============================================================
// Eliminazione
// ============================================================

async function eliminaUtente(id) {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
    try {
        await api.eliminaUtente(id);
        await caricaUtenti();
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.utenti);
    }
}

async function eliminaPost(id) {
    if (!confirm("Sei sicuro di voler eliminare questo post?")) return;
    try {
        await api.eliminaPost(id);
        await caricaPost(utenteSelezionato?.id);
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.post);
    }
}

async function eliminaCommento(id) {
    if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
    try {
        await api.eliminaCommento(id);
        await caricaCommenti(postSelezionato?.id);
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.commenti);
    }
}

// ============================================================
// Form — Creazione
// ============================================================

document.getElementById("form-utente").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("utente-nome").value.trim();
    const email = document.getElementById("utente-email").value.trim();
    const citta = document.getElementById("utente-citta").value.trim();

    const codiceFiscale = document.getElementById("utente-cf").value.trim();
    const sesso = document.getElementById("utente-sesso").value;
    const dataNascita = document.getElementById("utente-dataNascita").value;
    const telefono = document.getElementById("utente-telefono").value.trim();

    // Validazione Codice Fiscale
    const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    const cfUppercase = codiceFiscale.toUpperCase();

    if (!regexCF.test(cfUppercase)) {
        ui.mostraErrore("Codice fiscale non valido", liste.utenti);
        return;
    }

    try {
        if (utenteInModifica) {
            await api.aggiornaUtente(utenteInModifica.id, {
                nome,
                email,
                citta,
                codiceFiscale: cfUppercase,
                sesso,
                dataNascita: dataNascita || null,
                telefono: telefono || null
            });
            utenteInModifica = null;
            resetFormUtente();
        } else {
            await api.creaUtente({
                nome,
                email,
                citta,
                codiceFiscale: cfUppercase,
                sesso,
                dataNascita: dataNascita || null,
                telefono: telefono || null
            });
        }

        resetFormUtente();
        await caricaUtenti();
        await aggiornaStatistiche();

    } catch (err) {
        ui.mostraErrore(err.message, liste.utenti);
    }
});

document.getElementById("form-post").addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = parseInt(document.getElementById("post-userId").value);
    const titolo = document.getElementById("post-titolo").value.trim();
    const corpo = document.getElementById("post-corpo").value.trim();

    try {
        await api.creaPost({ userId, titolo, corpo });
        e.target.reset();
        if (utenteSelezionato) {
            document.getElementById("post-userId").value = utenteSelezionato.id;
        }
        await caricaPost(utenteSelezionato?.id);
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.post);
    }
});

document.getElementById("form-commento").addEventListener("submit", async (e) => {
    e.preventDefault();
    const postId = parseInt(document.getElementById("commento-postId").value);
    const nome = document.getElementById("commento-nome").value.trim();
    const email = document.getElementById("commento-email").value.trim();
    const corpo = document.getElementById("commento-corpo").value.trim();

    try {
        await api.creaCommento({ postId, nome, email, corpo });
        e.target.reset();
        if (postSelezionato) {
            document.getElementById("commento-postId").value = postSelezionato.id;
        }
        await caricaCommenti(postSelezionato?.id);
        await aggiornaStatistiche();
    } catch (err) {
        ui.mostraErrore(err.message, liste.commenti);
    }
});

// ============================================================
// Avvio — Carica la lista utenti all'apertura
// ============================================================

caricaUtenti();
aggiornaStatistiche();
aggiornaStatoLogin();
aggiornaVisibilitaUI();

// ============================================================
// Esercizio 4 - Filtro di ricerca utenti
// ============================================================

document.getElementById("ricerca-utenti").addEventListener("input", (e) => {
    const testo = e.target.value.toLowerCase();
    const cards = document.querySelectorAll("#lista-utenti .card");

    cards.forEach(card => {
        const contenuto = card.textContent.toLowerCase();
        card.style.display = contenuto.includes(testo) ? "" : "none";
    });
});

// ============================================================
// Esercizio 7 - Paginazione API
// ============================================================
function renderPaginazione({ pagina, pagine }) {
    let container = document.getElementById("paginazione-post");

    if (!container) {
        container = document.createElement("div");
        container.id = "paginazione-post";
        liste.post.after(container);
    }

    container.innerHTML = `
        <button id="prev-post" ${pagina <= 1 ? "disabled" : ""}>Precedente</button>
        <span> Pagina ${pagina} di ${pagine} </span>
        <button id="next-post" ${pagina >= pagine ? "disabled" : ""}>Successiva</button>
    `;

    document.getElementById("prev-post")?.addEventListener("click", async () => {
        paginaCorrentePost--;
        await caricaPost(utenteSelezionato?.id);
    });

    document.getElementById("next-post")?.addEventListener("click", async () => {
        paginaCorrentePost++;
        await caricaPost(utenteSelezionato?.id);
    });
}