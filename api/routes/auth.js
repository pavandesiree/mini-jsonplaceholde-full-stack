import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { creaUtente, trovaUtentePerEmail } from "../database/queries/utenti.js";

const router = Router();

router.post("/registrazione", async (req, res) => {
    // validazione + creaUtente + firma token + risposta { token, utente }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const utente = await trovaUtentePerEmail(email);
    if (!utente) return res.status(401).json({ errore: "Credenziali non valide" });

    const valida = await bcrypt.compare(password, utente.password);
    if (!valida) return res.status(401).json({ errore: "Credenziali non valide" });

    const accessToken = jwt.sign({ id: utente.id, ruolo: utente.ruolo, email: utente.email, nome: utente.nome}, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = crypto.randomUUID();
    await salvaRefreshToken(utente.id, refreshToken, scadenza7giorni);
    res.json({ accessToken, refreshToken, utente });
    
});

router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body;
    const record = await trovaRefreshToken(refreshToken);
    if (!record || new Date(record.scadenza) < new Date()) {
        return res.status(401).json({ errore: "Refresh token non valido o scaduto" });
    }
    const utente = await trovaUtentePerId(record.utenteId);
    const accessToken = jwt.sign({ id: utente.id, ruolo: utente.ruolo, email: utente.email, nome: utente.nome}, JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken });
});

router.post("/logout", async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ errore: "Refresh token mancante" });
    }
    const record = await trovaRefreshToken(refreshToken);
    if (!record) {
        return res.status(200).json({ messaggio: "Logout effettuato" });
    }
    await eliminaRefreshToken(refreshToken);
    res.status(200).json({ messaggio: "Logout effettuato" });
});

export default router;