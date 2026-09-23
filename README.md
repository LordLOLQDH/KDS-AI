# KDS AI

Ein KI-gestützter Assistent für KDS.

## Aktuelle Version

**v1.6**

## Funktionen

- Moderne GitHub-Pages-Oberfläche
- Chat mit dem KDS AI-Assistenten
- KDS-Wissensdatenbank mit Leistungen und Preisen
- Unterscheidung zwischen normalen Preisen und Testkundenpreisen
- Automatische Antworten über die Supabase Edge Function
- OpenRouter als KI-Anbieter
- Keine API-Schlüssel im Frontend
- Responsive Darstellung für Smartphone und Desktop
- Überarbeitetes, reduziertes KDS-Interface
- Manueller Aktualisieren-Button zum Umgehen alter Browser-Caches

## Projektaufbau

```text
GitHub Pages
    ↓
KDS AI Frontend
    ↓
Supabase Edge Function
    ↓
KDS-Wissensdatenbank + KI
```

## Dateien

- `index.html` – Oberfläche der Web-App
- `style.css` – Design und responsive Darstellung
- `app.js` – Chat-Logik, Verbindung zum Backend und manuelles Aktualisieren
- `supabase/functions/ai-chat/` – KI-Backend
- `README.md` – Projektdokumentation

## Versionierung

Die Versionsnummer wird bei Änderungen am Frontend aktualisiert.

Beispiel:

`1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → ... → 1.9 → 2.0`

Größere Funktionsänderungen können einen Sprung auf eine neue Hauptversion auslösen.

## Manueller Update

Wenn der Browser eine ältere Version der Website aus dem Cache geladen hat, kann über **„Aktualisieren“** oben rechts ein neuer Seitenaufruf mit Cache-Busting ausgelöst werden. Dadurch wird die aktuelle GitHub-Pages-Version neu geladen.

## Sicherheit

API-Schlüssel und andere geheime Zugangsdaten gehören ausschließlich ins Backend bzw. in die Supabase Secrets. Sie dürfen nicht in GitHub oder den öffentlichen Frontend-Code eingetragen werden.

## Status

KDS AI befindet sich aktuell im Aufbau und wird schrittweise erweitert.
