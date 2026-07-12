# Rektumkarzinom KIS Eingabemaske

Lokale, statische Eingabemaske zur strukturierten Dokumentation von Rektumkarzinom-Fällen für KIS-/Tumorboard-Zusammenfassungen.

## Start

Einfach `index.html` im Browser öffnen.

Optional mit lokalem Webserver:

```bash
python3 -m http.server 8080
```

Danach: <http://localhost:8080>

## Deployment / Domain

Die Anwendung ist für GitHub Pages vorbereitet. Die Custom Domain ist über `CNAME` auf `daktyloi.com` gesetzt. DNS-seitig muss `daktyloi.com` auf GitHub Pages zeigen.

## Datenschutz

- Keine echten Patientendaten in dieses Repository committen.
- Die Maske fragt bewusst keine Namen, Geburtsdaten, Adressen oder Kontaktinformationen ab.
- Die Anwendung speichert nichts automatisch und überträgt keine Daten an Server.
- Exportierte JSON-/CSV-Dateien können Patientendaten enthalten, wenn Anwender sie eingeben; diese Dateien sind per `.gitignore` ausgeschlossen.

## Funktionen

- Pflichtfeldprüfung
- Fortschrittsanzeige
- Plausible Struktur für Diagnostik, Staging, Therapie, OP/Pathologie und Nachsorge
- Erzeugung einer KIS-Zusammenfassung
- Kopieren der Zusammenfassung in die Zwischenablage
- JSON-Export für lokale Weiterverarbeitung
- CSV-Export mit Semikolon-Trennung und UTF-8-BOM für Excel/LibreOffice
- Warnung bei typischen personenbezogenen Datenmustern wie Geburtsdatum, E-Mail, Telefonnummer oder Versichertennummer
