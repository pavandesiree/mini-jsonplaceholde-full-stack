import jwt from "jsonwebtoken";

export function richiediAutenticazione(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ errore: "Token mancante" });
    }

    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.utente = payload;
        next();
    } catch (errore) {
        return res.status(401).json({ errore: "Token non valido o scaduto" });
    }
}

export function richiediRuolo(...ruoliPermessi) {
    return (req, res, next) => {
        if (!req.utente || !ruoliPermessi.includes(req.utente.ruolo)) {
            return res.status(403).json({ errore: "Permessi insufficienti" });
        }
        next();
    };
}