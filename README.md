# KDS AI

Ein KI-gestützter Assistent für KDS.

![KDS AI Logo](IMG_3297.jpeg)

## Aktuelle Version

**v1.9**

## Funktionen

- KDS-Infos können automatisch die direkte WhatsApp-Kontaktmöglichkeit enthalten

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
- KDS-Logo als Website-Logo, Browser-Icon und Social-Share-Bild
- `IMG_3297.jpeg` als zentrale Logo-Datei für Website, Browser und Teilen

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
- `IMG_3297.jpeg` – KDS-Logo für Website, Browser-Icon und Social Sharing
- `supabase/functions/ai-chat/` – KI-Backend
- `README.md` – Projektdokumentation

## Kontaktregeln der KDS-KI

Die KDS-KI darf die geschäftliche E-Mail `kraus-digital@proton.me` als Kontaktadresse nennen, wenn ein Kunde ausdrücklich danach fragt.

Bei einer allgemeinen Frage nach Kontaktmöglichkeiten soll die KI nicht automatisch die E-Mail-Adresse nennen. Sie kann stattdessen anbieten, die geschäftliche E-Mail-Adresse zu geben.

Die KDS-WhatsApp-Nummer `+49 175 4081426` darf die KI als Kontaktmöglichkeit auch bei einer allgemeinen Kontaktfrage nennen.

Die administrative/private E-Mail `adam_kraus@icloud.com` darf genannt werden, wenn ausdrücklich nach der Admin-E-Mail oder privaten E-Mail gefragt wird. Sie darf nicht automatisch als allgemeine Kundenkontaktadresse verwendet werden.

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
