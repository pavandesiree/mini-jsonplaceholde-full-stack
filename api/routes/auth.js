import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { creaUtente, trovaUtentePerEmail, trovaUtentePerId } from "../database/queries/utenti.js";
import { richiediAutenticazione } from "../middleware/autenticazione.js";

const router = Router();

router.post("/registrazione", async (req, res) => {
    // validazione + creaUtente + firma token + risposta { token, utente }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errore: "Email e password sono obbligatori" });
        }

        const utente = await trovaUtentePerEmail(email);
        if (!utente) return res.status(401).json({ errore: "Credenziali non valide" });

        const valida = await bcrypt.compare(password, utente.password);
        if (!valida) return res.status(401).json({ errore: "Credenziali non valide" });

        const token = jwt.sign(
            { id: utente.id, email: utente.email, ruolo: utente.ruolo },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            utente: { id: utente.id, nome: utente.nome, email: utente.email, ruolo: utente.ruolo }
        });

    } catch (errore) {
        console.error("Errore POST /api/auth/login:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

router.post("/logout", richiediAutenticazione, (req, res) => {
    res.json({ messaggio: "Logout effettuato con successo" });
});

router.get("/refresh", richiediAutenticazione, async (req, res) => {
    try {
        const utente = await trovaUtentePerId(req.utente.id);
        if (!utente) return res.status(404).json({ errore: "Utente non trovato" });

        const token = jwt.sign(
            { id: utente.id, email: utente.email, ruolo: utente.ruolo },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            utente: { id: utente.id, nome: utente.nome, email: utente.email, ruolo: utente.ruolo }
        });

    } catch (errore) {
        console.error("Errore GET /api/auth/refresh:", errore);
        res.status(500).json({ errore: "Errore interno del server" });
    }
});

export default router;