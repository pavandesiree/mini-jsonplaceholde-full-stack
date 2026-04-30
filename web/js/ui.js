// js/ui.js — Funzioni di rendering DOM
//
// Ogni funzione riceve dati + contenitore + callbacks.
// Nessuna chiamata API qui — solo costruzione HTML.

// ============================================================
// Helper
// ============================================================

export function pulisciContenitore(contenitore) {
    contenitore.innerHTML = "";
}

export function mostraErrore(messaggio, contenitore) {
    const div = document.createElement("div");
    div.className = "errore";
    div.textContent = messaggio;
    contenitore.prepend(div);

    // Rimuovi dopo 4 secondi
    setTimeout(() => div.remove(), 4000);
}

function mostraVuoto(contenitore, testo) {
    contenitore.innerHTML = `<p class="vuoto">${testo}</p>`;
}

// Helper per formattare le date
function formattaData(dataInput) {
    if (!dataInput) return "N/D";

    const data = new Date(dataInput);

    if (isNaN(data)) return "N/D";

    return data.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// ============================================================
// Utenti
// ============================================================

export function mostraUtenti(utenti, contenitore, callbacks, utenteLoggato) {
    pulisciContenitore(contenitore);

    if (utenti.length === 0) {
        mostraVuoto(contenitore, "Nessun utente trovato");
        return;
    }

    const isAdmin = utenteLoggato && utenteLoggato.ruolo === "admin";

    utenti.forEach(utente => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>${utente.nome}</h3>
            <p>Email: ${utente.email}</p>
            <p>Città: ${utente.citta || "Nessuna città"}</p>
            <p>CF: ${utente.codiceFiscale}</p>
            <p>Sesso: ${utente.sesso}</p>
            <p>Data nascita: ${formattaData(utente.dataNascita)}</p>
            <p>Telefono: ${utente.telefono || "N/D"}</p>
            <div class="azioni">
                <button class="btn-primario" data-azione="vedi-post">Vedi Post</button>
                ${isAdmin ? `<button class="btn-secondario" data-azione="modifica">Modifica</button>` : ""}
                ${isAdmin ? `<button class="btn-pericolo" data-azione="elimina">Elimina</button>` : ""}
            </div>
        `;
        card.querySelector('[data-azione="vedi-post"]').addEventListener("click", () => {
            callbacks.onVediPost(utente);
        });

        if (isAdmin) {
            card.querySelector('[data-azione="modifica"]').addEventListener("click", () => {
                callbacks.onModifica(utente);
            });

            card.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
                callbacks.onElimina(utente.id);
            });
        }

        contenitore.appendChild(card);
    });
}

// ============================================================
// Post
// ============================================================

export function mostraPost(post, contenitore, callbacks, utenteLoggato) {
    pulisciContenitore(contenitore);

    if (post.length === 0) {
        mostraVuoto(contenitore, "Nessun post trovato");
        return;
    }

    post.forEach(p => {
        const card = document.createElement("div");
        const puoEliminare = utenteLoggato && (utenteLoggato.id === p.userId || utenteLoggato.ruolo === "admin");
        card.className = "card";
        card.innerHTML = `
            <h3>${p.titolo}</h3>
            <p>${p.corpo}</p>
            ${p.creatoIl ? `<p>Creato il: ${formattaData(p.creatoIl)}</p>` : ""}
            <div class="azioni">
                <button class="btn-primario" data-azione="vedi-commenti">Vedi Commenti</button>
                ${puoEliminare ? `<button class="btn-pericolo" data-azione="elimina">Elimina</button>` : ""}
            </div>
        `;

        card.querySelector('[data-azione="vedi-commenti"]').addEventListener("click", () => {
            callbacks.onVediCommenti(p);
        });

        if (puoEliminare) {
            card.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
                callbacks.onElimina(p.id);
            });
        }

        contenitore.appendChild(card);
    });
}

// ============================================================
// Commenti
// ============================================================

export function mostraCommenti(commenti, contenitore, callbacks) {
    pulisciContenitore(contenitore);

    if (commenti.length === 0) {
        mostraVuoto(contenitore, "Nessun commento trovato");
        return;
    }

    commenti.forEach(c => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${c.nome}</h3>
            <p>${c.email}</p>
            <p>${c.corpo}</p>
            ${c.creatoIl ? `<p>Creato il: ${formattaData(c.creatoIl)}</p>` : ""}
            <div class="azioni">
                <button class="btn-pericolo" data-azione="elimina">Elimina</button>
            </div>
        `;

        card.querySelector('[data-azione="elimina"]').addEventListener("click", () => {
            callbacks.onElimina(c.id);
        });

        contenitore.appendChild(card);
    });
}