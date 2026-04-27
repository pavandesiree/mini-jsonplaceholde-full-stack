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

    const token = jwt.sign(
        { id: utente.id, email: utente.email, ruolo: utente.ruolo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({ token, utente: { id: utente.id, nome: utente.nome, email: utente.email} });
});

export default router;