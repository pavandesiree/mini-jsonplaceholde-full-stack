// js/api.js — Modulo per le chiamate API
//
// Tutte le funzioni fetch sono qui. Nessun codice DOM.
// Importa queste funzioni da app.js per ottenere/creare/eliminare dati.

const BASE_URL = 'https://mini-jsonplaceholder-full-stack.onrender.com';

// ============================================================
// Helper privato — wrappa fetch con JSON e gestione errori
// ============================================================

async function chiamataApi(percorso, opzioni = {}, tentativo = 1) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...opzioni.headers,
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const risposta = await fetch(`${BASE_URL}${percorso}`, { ...opzioni, headers });
    if (risposta.status === 401 && tentativo === 1) {
        const ok = await tentaRefresh();
        if (ok) return chiamataApi(percorso, opzioni, 2);
    }
    return risposta.json();
}

export async function login(email, password) {
    return chiamataApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

// ============================================================
// Utenti
// ============================================================

export async function ottieniUtenti() {
    return chiamataApi("/utenti");
}

export async function creaUtente(dati) {
    return chiamataApi("/utenti", {
        method: "POST",
        body: JSON.stringify(dati),
    });
}

export async function eliminaUtente(id) {
    return chiamataApi(`/utenti/${id}`, { method: "DELETE" });
}

export async function aggiornaUtente(id, dati) {
    return chiamataApi(`/utenti/${id}`, {
        method: "PUT",
        body: JSON.stringify(dati),
    });
}

// ============================================================
// Post
// ============================================================

export async function ottieniPost(userId, pagina = 1, limite = 5) {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    params.append("pagina", pagina);
    params.append("limite", limite);
    return chiamataApi(`/post?${params.toString()}`);
}

export async function creaPost(dati) {
    return chiamataApi("/post", {
        method: "POST",
        body: JSON.stringify(dati),
    });
}

export async function eliminaPost(id) {
    return chiamataApi(`/post/${id}`, { method: "DELETE" });
}

// ============================================================
// Commenti
// ============================================================

export async function ottieniCommenti(postId) {
    const query = postId ? `?postId=${postId}` : "";
    return chiamataApi(`/commenti${query}`);
}

export async function creaCommento(dati) {
    return chiamataApi("/commenti", {
        method: "POST",
        body: JSON.stringify(dati),
    });
}

export async function eliminaCommento(id) {
    return chiamataApi(`/commenti/${id}`, { method: "DELETE" });
}
