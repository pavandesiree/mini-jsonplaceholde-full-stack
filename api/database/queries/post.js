// database/queries/post.js — Query SQL per la risorsa Post
//
// Stessa struttura di queries/utenti.js — ogni funzione esegue una query SQL.

import pool from "../connessione.js";

// ============================================================
// SELECT — Lettura
// ============================================================

/**
 * Restituisce tutti i post. Se viene passato un userId, filtra per quello.
 *
 * SQL senza filtro:  SELECT * FROM post
 * SQL con filtro:    SELECT * FROM post WHERE userId = ?
 */
export async function trovaPost(userId, limite = 10, offset = 0) {
    let righe;
    let totale;

    if (userId) {
        const [rows] = await pool.query(
            "SELECT * FROM post WHERE userId = ? LIMIT ? OFFSET ?",
            [userId, limite, offset]
        );
        righe = rows;

        const [count] = await pool.query(
            "SELECT COUNT(*) as totale FROM post WHERE userId = ?",
            [userId]
        );
        totale = count[0].totale;
    } else {
        const [rows] = await pool.query(
            "SELECT * FROM post LIMIT ? OFFSET ?",
            [limite, offset]
        );
        righe = rows;

        const [count] = await pool.query(
            "SELECT COUNT(*) as totale FROM post"
        );
        totale = count[0].totale;
    }

    return { dati: righe, totale };
}

/**
 * Cerca un singolo post per ID.
 *
 * SQL: SELECT * FROM post WHERE id = ?
 */
export async function trovaPostPerId(id) {
    const [righe] = await pool.query(
        "SELECT * FROM post WHERE id = ?",
        [id]
    );
    return righe[0];
}

// ============================================================
// INSERT — Creazione
// ============================================================

/**
 * Crea un nuovo post nel database.
 *
 * SQL: INSERT INTO post (userId, titolo, corpo) VALUES (?, ?, ?)
 */
export async function creaPost({ userId, titolo, corpo }) {
    const [risultato] = await pool.query(
        "INSERT INTO post (userId, titolo, corpo) VALUES (?, ?, ?)",
        [userId, titolo, corpo]
    );

    return { id: risultato.insertId, userId, titolo, corpo };
}

// ============================================================
// UPDATE — Modifica
// ============================================================

/**
 * Sostituisce completamente un post (PUT).
 *
 * SQL: UPDATE post SET userId = ?, titolo = ?, corpo = ? WHERE id = ?
 */
export async function sostituisciPost(id, { userId, titolo, corpo }) {
    const [risultato] = await pool.query(
        "UPDATE post SET userId = ?, titolo = ?, corpo = ? WHERE id = ?",
        [userId, titolo, corpo, id]
    );

    if (risultato.affectedRows === 0) return null;
    return { id, userId, titolo, corpo };
}

/**
 * Aggiorna parzialmente un post (PATCH).
 *
 * SQL dinamico: UPDATE post SET <campo> = ?, ... WHERE id = ?
 */
export async function aggiornaPost(id, dati) {
    const campiPermessi = ["userId", "titolo", "corpo"];
    const aggiornamenti = [];
    const valori = [];

    for (const campo of campiPermessi) {
        if (dati[campo] !== undefined) {
            aggiornamenti.push(`${campo} = ?`);
            valori.push(dati[campo]);
        }
    }

    if (aggiornamenti.length > 0) {
        valori.push(id);
        await pool.query(
            `UPDATE post SET ${aggiornamenti.join(", ")} WHERE id = ?`,
            valori
        );
    }

    return trovaPostPerId(id);
}

// ============================================================
// DELETE — Eliminazione
// ============================================================

/**
 * Elimina un post per ID.
 *
 * SQL: DELETE FROM post WHERE id = ?
 */
export async function eliminaPost(id) {
    const post = await trovaPostPerId(id);
    if (!post) return null;

    await pool.query("DELETE FROM post WHERE id = ?", [id]);
    return post;
}