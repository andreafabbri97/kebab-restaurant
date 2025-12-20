# Restaurant Manager System

Sistema completo di gestione ristorante sviluppato da Andrea Fabbri.

---

## Contesto per Sviluppatori / IA

Questa sezione contiene tutto il contesto necessario per continuare lo sviluppo del progetto.

### Informazioni Progetto

| Campo | Valore |
|-------|--------|
| **Nome** | Restaurant Manager System |
| **Versione** | 2.5 |
| **Proprietario** | Andrea Fabbri |
| **Repository** | https://github.com/andreafabbri97/restaurant-manager |
| **Deploy** | https://andreafabbri97.github.io/restaurant-manager/ |
| **Licenza** | Proprietaria (tutti i diritti riservati) |

### Stack Tecnologico

| Tecnologia | Versione | Uso |
|------------|----------|-----|
| React | 19.x | Frontend framework |
| TypeScript | 5.9.x | Type safety |
| Vite | 7.x | Build tool |
| Tailwind CSS | 3.4.x | Styling |
| Supabase | 2.88.x | Database PostgreSQL + Realtime |
| React Router | 7.x | Routing (HashRouter per GitHub Pages) |
| React Query | 5.x | Data fetching |
| Lucide React | 0.561.x | Icone |
| Recharts | 3.6.x | Grafici |
| jsPDF | 3.x | Export PDF menu |
| date-fns | 4.x | Date utilities |

### Struttura Directory

```
kebab-restaurant-app/
├── src/
│   ├── components/
│   │   ├── layout/          # Sidebar, Layout principale
│   │   ├── order/           # CartContent, componenti ordini
│   │   └── ui/              # Modal, Toast, componenti riutilizzabili
│   ├── context/
│   │   ├── AuthContext.tsx      # Autenticazione utenti
│   │   ├── LanguageContext.tsx  # i18n (IT/EN)
│   │   ├── ThemeContext.tsx     # Tema chiaro/scuro
│   │   └── NotificationContext.tsx
│   ├── hooks/
│   │   └── useCurrency.ts   # Formattazione prezzi
│   ├── lib/
│   │   ├── database.ts      # Tutte le funzioni CRUD (Supabase + localStorage fallback)
│   │   └── supabase.ts      # Client Supabase
│   ├── locales/             # File traduzioni JSON (IT/EN) - DA COMPLETARE
│   ├── pages/               # Tutte le pagine dell'app
│   └── types/
│       └── index.ts         # Tipi TypeScript + ROLE_PERMISSIONS
├── public/
│   └── icon.svg             # Icona app (forchetta + coltello)
├── supabase-schema.sql      # Schema database completo
├── supabase-rls-policies.sql # Politiche RLS per sicurezza
├── CLIENT_SETUP.md          # Guida setup nuovi clienti
└── vite.config.ts           # Configurazione Vite + PWA
```

### Database Schema

Le tabelle principali in Supabase sono:

| Tabella | Descrizione |
|---------|-------------|
| `categories` | Categorie menu (Kebab, Bevande, ecc.) |
| `ingredients` | Ingredienti con costo unitario |
| `menu_items` | Piatti del menu con prezzo |
| `menu_item_ingredients` | Ricette: collegamento piatti-ingredienti |
| `inventory` | Scorte magazzino con soglie |
| `tables` | Tavoli del ristorante |
| `orders` | Ordini (asporto, domicilio, tavolo) |
| `order_items` | Prodotti di ogni ordine |
| `table_sessions` | Sessioni "conto aperto" per tavoli |
| `session_payments` | Pagamenti parziali (split bill) |
| `employees` | Dipendenti |
| `work_shifts` | Turni di lavoro |
| `reservations` | Prenotazioni tavoli |
| `expenses` | Spese generali |
| `supplies` | Forniture ricevute |
| `supply_items` | Dettaglio forniture |
| `users` | Utenti sistema (login) |
| `cash_closures` | Chiusure cassa giornaliere |
| `settings` | Configurazione negozio |

### Sistema di Autenticazione

- **Tre ruoli**: `superadmin`, `admin`, `staff`
- Permessi definiti in `src/types/index.ts` → `ROLE_PERMISSIONS`
- Login custom (non Supabase Auth) - password in chiaro nel DB (da migliorare)
- Credenziali default: `admin` / `admin123`
- Sessione salvata in localStorage (`kebab_auth_user`)

### Sistema Multilingua

- Context: `src/context/LanguageContext.tsx`
- Traduzioni: `src/locales/it.json` e `en.json` (DA COMPLETARE)
- Hook: `useLanguage()` → `{ language, setLanguage, t }`
- Persistenza: localStorage (`kebab_language`)

### Modello di Business Multi-Cliente

Il software è pensato per essere venduto a più ristoranti. Strategia di deployment:

1. **Ogni cliente ha il proprio account GitHub + Supabase** (free tier)
2. Il repo principale (`andreafabbri97/restaurant-manager`) è un **Template Repository**
3. Per nuovo cliente: fork/template → modifica `supabase.ts` con sue credenziali → deploy
4. Vedere `CLIENT_SETUP.md` per istruzioni complete

**Limiti Free Tier**:
- GitHub: repo pubblico per GitHub Pages (privato richiede Pro)
- Supabase: 500MB database, 1GB storage per progetto

### Problemi Noti / TODO

1. **Performance "Costo Piatti"**: La pagina DishCosts.tsx è lenta perché:
   - `calculateAllDishCosts()` fa query sequenziali per ogni piatto
   - `getDishCostSummary()` richiama `calculateAllDishCosts()` di nuovo
   - Soluzione: fare le query una sola volta e passare i dati

2. **Traduzioni incomplete**: I file `src/locales/*.json` esistono ma non sono completi. La struttura del LanguageContext è pronta.

3. **Password in chiaro**: Le password utente sono salvate in chiaro. Da implementare hashing.

4. **localStorage keys**: Usano prefisso `kebab_` per retrocompatibilità (es. `kebab_auth_user`, `kebab_users`)

### Convenzioni Codice

- **Stile**: Tailwind CSS con classi custom in `index.css`
- **Componenti**: Functional components con hooks
- **State management**: React Context (no Redux)
- **Data fetching**: Funzioni async in `database.ts`, chiamate con useEffect
- **Lazy loading**: Pagine caricate con `React.lazy()` in App.tsx
- **Tema scuro**: Default, con opzione chiaro

### Comandi Utili

```bash
# Sviluppo
npm run dev

# Build produzione
npm run build

# Deploy su GitHub Pages
npm run deploy

# Lint
npm run lint
```

### Credenziali Supabase (Produzione)

```
URL: https://jhyidrhckhoavlmmmlwq.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Hardcoded in `src/lib/supabase.ts` come fallback)

---

# Guida Operativa per Staff

Questa sezione è per chi lavora in sala.

---

## Come fare un ordine veloce (asporto/domicilio)

1. Vai su **Nuovo Ordine** dal menu laterale
2. In alto, scegli **Asporto** o **Domicilio**
3. Inserisci nome e telefono del cliente
4. Clicca sui prodotti per aggiungerli al carrello
5. Usa **+** e **-** per modificare le quantità
6. Scegli il metodo di pagamento (Contanti, Carta, Online)
7. Se il cliente ha la SMAC, spunta la casella
8. Clicca **Invia Ordine**

L'ordine appare nella lista Ordini e in Cucina.

---

## Come aprire un conto al tavolo

1. Vai su **Tavoli**
2. Clicca sul tavolo verde (disponibile)
3. Si apre "Apri Conto": inserisci numero coperti
4. Opzionale: inserisci nome e telefono cliente
5. Clicca **Apri Conto**
6. Il tavolo diventa rosso (occupato)

Se il cliente ha prenotato, i dati si compilano automaticamente.

---

## Come aggiungere una comanda a un tavolo già aperto

1. Vai su **Tavoli**
2. Clicca sul tavolo rosso (occupato)
3. Si apre il riepilogo del conto
4. Clicca **Aggiungi Comanda**
5. Aggiungi i prodotti come per un ordine normale
6. Clicca **Invia Ordine**

Ogni comanda ha un numero (Comanda #1, #2, ecc.).

---

## Come chiudere un conto (pagamento completo)

1. Clicca sul tavolo rosso
2. Nel riepilogo conto, clicca **Chiudi Conto**
3. Scegli metodo pagamento: Contanti, Carta, Online
4. Se contanti: usa il **Calcolatore Resto**
   - Clicca sul taglio (5, 10, 20, 50, 100) o inserisci importo
   - Leggi il resto da dare al cliente
5. Spunta SMAC se passata
6. Clicca **Conferma Pagamento**

Il tavolo torna verde (disponibile).

---

## Come dividere il conto (split bill)

1. Clicca sul tavolo rosso
2. Clicca **Dividi Conto**
3. Scegli una delle 3 modalità:

### Manuale
- Inserisci l'importo che la persona paga
- Usa i pulsanti rapidi: Tutto, Metà, 1/N
- Scegli Contanti o Carta
- **IMPORTANTE: Spunta "SMAC passato" se il cliente passa la tessera per questo pagamento**
- Se contanti: usa il calcolatore resto
- Clicca **Aggiungi Pagamento**

### Alla Romana
- Inserisci quante persone totali al tavolo
- Inserisci quante persone pagano ora
- Il sistema calcola la quota
- Clicca **Applica Calcolo**
- Poi conferma con **Aggiungi Pagamento**

### Per Consumazione
- Usa i pulsanti **+** e **-** per scegliere quanti pezzi di ogni prodotto pagare
- Esempio: se ci sono 4 kebab, puoi pagarne solo 1 o 2
- Il pulsante **Tutti** seleziona l'intera quantità di quel prodotto
- Il sistema somma automaticamente
- Clicca **Applica Selezione**
- Poi conferma con **Aggiungi Pagamento**

**IMPORTANTE - Tracking Prodotti Pagati**: Quando paghi "Per Consumazione", i prodotti pagati vengono tracciati. Se torni a dividere il conto, vedrai solo i prodotti ancora da pagare.

**NOTA SMAC**: Ogni pagamento parziale può avere la sua SMAC. Spunta la casella per chi passa la tessera, lasciala vuota per chi non la passa.

Ripeti per ogni persona. Quando il rimanente arriva a zero, il conto si chiude automaticamente.

---

## Significato dei colori tavoli

- **Verde** = Disponibile, puoi aprire un conto
- **Rosso** = Occupato, clienti stanno mangiando
- **Arancione** = Prenotato per dopo

---

## Come trasferire un tavolo

1. Clicca sul tavolo rosso attuale
2. Clicca **Trasferisci**
3. Clicca sul nuovo tavolo (deve essere verde)
4. Il conto si sposta, i clienti continuano a ordinare

---

## Come gestire le prenotazioni

### Nuova prenotazione
1. Vai su **Tavoli**
2. Clicca **Nuova Prenotazione** in alto
3. Scegli data e ora
4. Inserisci nome cliente e telefono
5. Inserisci numero ospiti
6. Seleziona uno o più tavoli (per gruppi grandi)
7. Clicca **Crea Prenotazione**

### Quando arriva il cliente prenotato
1. Clicca sul tavolo arancione
2. I dati della prenotazione sono già inseriti
3. Clicca **Apri Conto**

---

## Come applicare sconti a un ordine

1. Vai su **Ordini** → **Storico**
2. Clicca sull'icona **matita** dell'ordine da modificare
3. Nel popup "Modifica Ordine", trovi la sezione **Totale Ordine**
4. Modifica l'importo (es. da €30.30 a €30.00)
5. Il sistema mostra lo sconto applicato
6. Clicca **Salva Modifiche**

---

## Scorciatoie utili

| Azione | Come fare |
|--------|-----------|
| Ordine veloce | Nuovo Ordine > Asporto > prodotti > Invia |
| Apri tavolo | Tavoli > tavolo verde > Apri Conto |
| Aggiungi comanda | Tavoli > tavolo rosso > Aggiungi Comanda |
| Rimuovi dal carrello | Clicca il pulsante **-** rosso sulla card prodotto |
| Chiudi conto | Tavoli > tavolo rosso > Chiudi Conto |
| Dividi conto | Tavoli > tavolo rosso > Dividi Conto |
| Resto contanti | Nel pagamento, usa Calcolatore Resto |
| Sconto ordine | Ordini > Storico > Modifica > Cambia totale |

---

## Problemi Tecnici

| Problema | Soluzione |
|----------|-----------|
| L'app non risponde | Ricarica pagina (F5) |
| Ordini non si aggiornano | Icona sidebar: verde = ok, arancione = ricarica |
| Su telefono non vedo bene | Ruota in orizzontale o usa tablet/PC |

---

## Per Amministratori

### Funzionalità del sistema

| Modulo | Descrizione |
|--------|-------------|
| Dashboard | Statistiche in tempo reale, ordini pendenti, incasso giornaliero |
| Ordini | Gestione ordini con stati, filtri, storico ultimi 7 giorni |
| Tavoli | Mappa tavoli, prenotazioni, sessioni, split bill |
| Menu | CRUD prodotti, categorie, disponibilità, export PDF |
| Inventario | Scorte, carichi/scarichi, soglie alert, EOQ |
| Ricette | Collegamento piatti-ingredienti per costo e scarico automatico |
| Costo Piatti | Margini di profitto, analisi per piatto |
| Personale | Turni, presenze, ore lavorate |
| Chiusura Cassa | Riconciliazione giornaliera contanti/carte |
| SMAC | Tracking tessere fedeltà per ordine |
| Report | Analisi vendite, spese, profitto per periodo |
| Utenti | Gestione account e ruoli (Staff/Admin/Superadmin) |
| Impostazioni | Configurazione negozio, lingua, tema, backup dati |
| Guida FAQ | Documentazione e FAQ integrate |

### Caratteristiche Tecniche

- **Multilingua**: Italiano e Inglese
- **Tema**: Chiaro o Scuro
- **Realtime**: Ordini si aggiornano automaticamente
- **Multi-dispositivo**: PC, tablet e smartphone
- **Offline**: Fallback localStorage quando Supabase non disponibile
- **PWA**: Installabile come app

### Sicurezza

- RLS (Row Level Security) abilitato su Supabase
- Tre livelli di accesso: Staff, Admin, Superadmin
- Backup JSON esportabile da Impostazioni

---

*Versione 2.5 - Restaurant Manager System*
*Copyright (c) 2024-2025 Andrea Fabbri. Tutti i diritti riservati.*
