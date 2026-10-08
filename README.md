# KDS AI

Ein KI-gestützter Assistent für KDS.

![KDS AI Logo](IMG_3297.jpeg)

## Aktuelle Version

**v5.9.1** (aktuell)

**v5.0 Stable** ist zusätzlich als eingefrorene stabile Version unter `versions/v5.0-stable/` verfügbar.

## Funktionen

- KDS-Infos können automatisch die direkte WhatsApp-Kontaktmöglichkeit enthalten
- Sicherer Admin-Modus über den internen Admin-Zugang mit serverseitigem Admin-Token
- Admin kann dauerhafte kundenrelevante Informationen per Chat eingeben
- KI extrahiert Fakten aus Admin-Nachrichten und speichert sie in der Supabase-Wissensbasis
- Gespeicherte Fakten werden bei späteren Kundenfragen wieder als Wissensbasis verwendet
- Geheimnisartige Inhalte wie API-Keys, Tokens und Passwörter werden nicht als Wissensfakten gespeichert
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
    ↓
KDS-Kontaktfunktion → Brevo HTTPS API → adam_kraus@icloud.com
```

## Dateien

- `index.html` – Oberfläche der Web-App
- `style.css` – Design und responsive Darstellung
- `app.js` – Chat-Logik, Verbindung zum Backend, Kontakt-Erkennung und manuelles Aktualisieren
- `IMG_3297.jpeg` – KDS-Logo für Website, Browser-Icon und Social Sharing
- `supabase/functions/ai-chat/` – KI-Backend
- `supabase/functions/kds-contact-email-v2/` – Kontakt-E-Mailversand über Brevo
- `README.md` – Projektdokumentation

## Kontaktregeln der KDS-KI

Die KDS-KI darf die geschäftliche E-Mail `kraus-digital@proton.me` als Kontaktadresse nennen, wenn ein Kunde ausdrücklich danach fragt.

Bei einer allgemeinen Frage nach Kontaktmöglichkeiten soll die KI nicht automatisch die E-Mail-Adresse nennen. Sie kann stattdessen anbieten, die geschäftliche E-Mail-Adresse zu geben.

Die KDS-WhatsApp-Nummer `+49 175 4081426` darf die KI als Kontaktmöglichkeit auch bei einer allgemeinen Kontaktfrage nennen.

Die administrative/private E-Mail `adam_kraus@icloud.com` darf genannt werden, wenn ausdrücklich nach der Admin-E-Mail oder privaten E-Mail gefragt wird. Sie darf nicht automatisch als allgemeine Kundenkontaktadresse verwendet werden.

## Versionierung

Die aktuelle Version ist **v5.9.1**.

Die Versionsnummer wird bei relevanten Änderungen am Frontend oder Backend aktualisiert.

`1.1 → 1.2 → 1.3 → ... → 5.0 Stable → 5.9 → 5.9.1`

Größere Funktionsänderungen können einen Sprung auf eine neue Hauptversion auslösen.

## Manueller Update

Wenn der Browser eine ältere Version der Website aus dem Cache geladen hat, kann über **„Aktualisieren“** oben rechts ein neuer Seitenaufruf mit Cache-Busting ausgelöst werden. Dadurch wird die aktuelle GitHub-Pages-Version neu geladen.

## Sicherheit

API-Schlüssel und andere geheime Zugangsdaten gehören ausschließlich ins Backend bzw. in die Supabase Secrets. Sie dürfen nicht in GitHub oder den öffentlichen Frontend-Code eingetragen werden.

## Status

**KDS AI v5.9.1** befindet sich aktuell im Aufbau und wird schrittweise erweitert.

## Automatische Kontaktanfragen

KDS AI kann bei einer konkreten Kundenanfrage automatisch eine Benachrichtigung an `adam_kraus@icloud.com` senden. Das gilt nur für erkannte echte Kontakt- oder Projektanfragen.

Der Versand erfolgt serverseitig über die **Brevo HTTP API**. Dadurch ist kein SMTP-Zugriff aus der Supabase Edge Function nötig. Die API-Anbindung verwendet HTTPS und bleibt damit unabhängig von SMTP-Port-Beschränkungen.

### Brevo-Einrichtung

1. Kostenloses Brevo-Konto erstellen.
2. Als Absender `kraus-digital@proton.me` registrieren und die Bestätigungs-Mail bestätigen.
3. Unter **SMTP & API → API Keys** einen neuen API-Key erzeugen.
4. Den Key ausschließlich als Supabase Edge-Function-Secret **`KDS-AI-Email`** speichern.
5. Die Funktion `kds-contact-email-v2` deployen bzw. aktualisieren.

Der API-Key darf niemals in `app.js`, GitHub Pages oder anderen öffentlichen Dateien stehen.

Der kostenlose Brevo-Versand wird ausschließlich für technische KDS-AI-Kontaktanfragen verwendet; eine Kampagne ist dafür nicht erforderlich.

## Version 5.9.1

- Kontakt-Mailversand vollständig auf die Brevo HTTPS API ausgerichtet.
- iCloud-SMTP-Abhängigkeit aus der Kontaktfunktion entfernt.
- Der vorhandene Supabase-Secretname `KDS-AI-Email` wird verwendet.
- Bestehender Frontend-Endpunkt bleibt unverändert.
- Keine API-Schlüssel im Repository.
- README und Projektstatus auf v5.9.1 aktualisiert.
