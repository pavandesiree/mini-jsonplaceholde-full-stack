-- database/seed.sql — Dati iniziali
--
-- Inserisce gli stessi dati che avevamo nel vecchio database.js.
-- Viene eseguito automaticamente da Docker al primo avvio.

INSERT INTO utenti (id, nome, email, password, citta, codiceFiscale, sesso, dataNascita, telefono, creatoIl) VALUES
    (1, 'Mario Rossi',   'mario@email.com', '$2b$10$j/CfHe3IvCpDZFW4sBxRFewPA7uFVC4QWV3rLBsPYfVla80NwBnSq',  'Roma',    'RSSMRA90A01H501U', 'M', '1990-01-01', '+391234567890', NULL),
    (2, 'Luigi Verdi',   'luigi@email.com', '$2b$10$Hvpkyoe5iUjcBkRJEyR9we.EDsZiWRcUrUXW9tH4goKF9v8Zckz3S',  'Milano',  'VRDLGU85B12F205X', 'M', '1985-02-12', '+39111222333', NULL),
    (3, 'Peach Bianchi', 'peach@email.com', '$2b$10$Aj.B5eVwqFVltBGxtXaoT.GsU9KZYUOnuSZyAEMHwgdKFxesQY7IC',  'Napoli',  'BNCPCH92C23F839Y', 'F', '1992-03-23', '+39333444555', NULL),
    (4, 'Toad Gialli',   'toad@email.com', '$2b$10$Ku8QKT.GWCr2mwiLidRTKu0ttzOiO9bA3Qm1HjtigZdtvmWhliVCO',   'Torino',  'GLLTDA88D10L219Z', 'Altro', NULL, NULL, NULL),
    (5, 'Bowser Neri',   'bowser@email.com', '$2b$10$39gWixQlpIgjRU.K7SBpOOi9ro9Ev7lBIqYqO4C3lFm9GJpKKtlWu', 'Firenze', 'NRIBWS80E05D612K', 'M', '1980-05-05', '+39999888777', NULL);

INSERT INTO post (id, userId, titolo, corpo) VALUES
    (1, 1, 'Il mio primo post',          'Ciao a tutti! Questo è il mio primo post sulla piattaforma.'),
    (2, 1, 'Node.js è fantastico',       'Oggi ho imparato a creare un server con Express.js.'),
    (3, 2, 'Ricetta pasta e fagioli',    'Ingredienti: pasta, fagioli, olio, aglio, peperoncino...'),
    (4, 3, 'Viaggio a Parigi',           'La Tour Eiffel è ancora più bella dal vivo di quanto immaginassi.'),
    (5, 3, 'Consigli per lo studio',     'Ecco i miei 5 consigli per studiare programmazione in modo efficace.'),
    (6, 4, 'Recensione: The Last of Us', 'Un capolavoro videoludico che emoziona dall''inizio alla fine.'),
    (7, 5, 'Il futuro dell''AI',         'L''intelligenza artificiale sta cambiando il modo in cui lavoriamo.'),
    (8, 2, 'La mia città preferita',     'Milano non è solo moda e business, ha anche una grande anima culturale.');

INSERT INTO commenti (id, postId, nome, email, corpo) VALUES
    (1,  1, 'Luigi Verdi',   'luigi@email.com',  'Benvenuto nella piattaforma!'),
    (2,  1, 'Peach Bianchi', 'peach@email.com',   'Bel primo post, complimenti!'),
    (3,  2, 'Toad Gialli',   'toad@email.com',    'Anche io sto imparando Node.js, è davvero potente.'),
    (4,  3, 'Mario Rossi',   'mario@email.com',   'Ottima ricetta! La provo stasera.'),
    (5,  4, 'Bowser Neri',   'bowser@email.com',  'Parigi è nella mia bucket list, grazie per il racconto!'),
    (6,  4, 'Luigi Verdi',   'luigi@email.com',   'Ci sono stato l''anno scorso, confermo tutto!'),
    (7,  5, 'Toad Gialli',   'toad@email.com',    'Il consiglio sulla pratica quotidiana è il più importante.'),
    (8,  7, 'Mario Rossi',   'mario@email.com',   'L''AI è un tema affascinante ma anche un po'' spaventoso.'),
    (9,  7, 'Peach Bianchi', 'peach@email.com',   'Sono d''accordo, l''importante è usarla in modo etico.'),
    (10, 6, 'Luigi Verdi',   'luigi@email.com',   'Capolavoro assoluto, lo sto rigiocando per la terza volta.');
