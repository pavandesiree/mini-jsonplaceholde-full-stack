// routes/utenti.js — Route per la risorsa Utenti

import { Router } from "express";
import {
    trovaUtenti, trovaUtentePerId, creaUtente,
    sostituisciUtente, aggiornaUtente, eliminaUtente
} from "../database/queries/utenti.js";
import { richiediAutenticazione, richiediRuolo } from "../middleware/autenticazione.js";

const router = Router();

// GET /api/utenti
router.get("/", async (req, res) => {
    try {
        const { citta } = req.query;
        const risultato = await trovaUtenti(citta);
        res.json(risultato);
    } catch (errore) {
        console.error("Errore GET /api/utenti:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// GET /api/utenti/:id
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const utente = await trovaUtentePerId(id);
        if (!utente) {
            return res.status(404).json({ errore: `Utente con id ${id} non trovato` });
        }
        res.json(utente);
    } catch (errore) {
        console.error("Errore GET /api/utenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// POST /api/utenti
router.post("/", async (req, res) => {
    try {
        const { nome, email, password, citta, codiceFiscale, sesso, dataNascita, telefono } = req.body;
        if (!nome || !email || !password || !codiceFiscale || !sesso) {
            return res.status(400).json({ errore: "Campi obbligatori: nome, email, password, codiceFiscale, sesso" });
        }
        if (password.length < 8) {
            return res.status(400).json({ errore: "La password deve essere di almeno 8 caratteri" });
        }
        const nuovoUtente = await creaUtente({ nome, email, password, citta, codiceFiscale, sesso, dataNascita, telefono });
        res.status(201).json(nuovoUtente);
    } catch (errore) {
        console.error("Errore POST /api/utenti:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// PUT /api/utenti/:id — solo admin
router.put("/:id", richiediAutenticazione, richiediRuolo("admin"), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, citta, codiceFiscale, sesso, dataNascita, telefono } = req.body;
        if (!nome || !email || !codiceFiscale || !sesso) {
            return res.status(400).json({ errore: "Campi obbligatori: nome, email, codiceFiscale, sesso" });
        }
        const aggiornato = await sostituisciUtente(id, { nome, email, citta, codiceFiscale, sesso, dataNascita, telefono });
        if (!aggiornato) {
            return res.status(404).json({ errore: `Utente con id ${id} non trovato` });
        }
        res.json(aggiornato);
    } catch (errore) {
        console.error("Errore PUT /api/utenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// PATCH /api/utenti/:id — solo admin
router.patch("/:id", richiediAutenticazione, richiediRuolo("admin"), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, citta, codiceFiscale, sesso, dataNascita, telefono } = req.body;
        const utente = await aggiornaUtente(id, { nome, email, citta, codiceFiscale, sesso, dataNascita, telefono });
        if (!utente) {
            return res.status(404).json({ errore: `Utente con id ${id} non trovato` });
        }
        res.json(utente);
    } catch (errore) {
        console.error("Errore PATCH /api/utenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

// DELETE /api/utenti/:id — solo admin
router.delete("/:id", richiediAutenticazione, richiediRuolo("admin"), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const rimosso = await eliminaUtente(id);
        if (!rimosso) {
            return res.status(404).json({ errore: `Utente con id ${id} non trovato` });
        }
        res.json({ messaggio: "Utente eliminato", utente: rimosso });
    } catch (errore) {
        console.error("Errore DELETE /api/utenti/:id:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

export default router;