# Green Nouala

Statische Website mit HTML, CSS und JavaScript. Kein Framework, keine Installation und kein Build erforderlich. Es wurde nichts veröffentlicht und kein Git-Push ausgeführt.

## Lokal öffnen

`index.html` direkt im Browser öffnen. Für eine HTTP-Vorschau mit Node.js 22:

```sh
node scripts/serve.mjs
```

Danach `http://127.0.0.1:4173` öffnen. Mit `Strg+C` beenden.

## Kontaktdaten ändern

In `config.js` Telefonnummer, WhatsApp-Nummer, E-Mail, Adresse, Maps und soziale Profile eintragen. WhatsApp verwendet die internationale Nummer ohne Leerzeichen, beispielsweise `212600000000`.

Die Devis-Formulare prüfen die Eingaben und bereiten einen WhatsApp- oder E-Mail-Entwurf vor. Der Besucher bestätigt das Absenden in der jeweiligen Anwendung. Solange keine eigenen Kontaktdaten konfiguriert sind, lässt sich die Anfrage als Textdatei herunterladen. Es wird keine erfolgreiche Zustellung behauptet.

Ein eigener HTTPS-Empfänger für POST/JSON kann optional als `formEndpoint` eingetragen werden. GitHub Pages selbst verarbeitet keine Formulare. Serverseitige Verarbeitung, CORS und Spam-Schutz liegen dann beim eigenen Empfänger. Ohne diesen Eintrag braucht die Website keinen Serverdienst.

## Enthaltene Bereiche

- Startseite, Pépinière, Geschichte und Services.
- Portfolio mit allen 13 verlinkten Projektseiten.
- Beide Blogbereiche mit den verlinkten Artikeln sowie Kontakt und Devis.
- Bismarckia-Landingpage auf Französisch und Darija, inklusive Galerie, Vergleich, FAQ, Bildvergrößerung und Angebotsformular.
- Pflanzenkatalog mit sieben botanischen Einträgen, Suche, Kategorien und Angebotslinks.
- Die beiden zusätzlichen Startseiten aus der Sitemap und eine Datenschutzerklärung.

Alle internen Links und Laufzeitdateien sind relativ, damit auch `https://BENUTZER.github.io/REPOSITORY/` funktioniert. Die Bismarckia-Seite liegt unter `bismarckia/index.html`, im selben Repository.

## Prüfen

```sh
node scripts/check.mjs
```

Prüft lokale Links, Bilder, Styles, JavaScript-Syntax, Formularstruktur und HTTP-Abruf aller Seiten unter einem Repository-Unterpfad. Die visuelle Browserprüfung war in der Arbeitsumgebung nicht verfügbar; eine pixelgenaue Übereinstimmung ist deshalb nicht bestätigt.

## GitHub Actions

Der Workflow `.github/workflows/deploy.yml` ist vorbereitet. Er prüft die Dateien und veröffentlicht über GitHub Pages, sobald **du** den Code auf `main` oder `master` pushst oder den Workflow manuell startest.

1. Code in dein GitHub-Repository pushen.
2. Im Repository **Settings → Pages → Build and deployment → Source: GitHub Actions** auswählen.
3. Workflow **Deploy Green Nouala to GitHub Pages** ausführen bzw. den Push-Lauf prüfen.

Der Workflow kopiert nur Website-Dateien in das Pages-Artefakt. Git-Metadaten und lokale Recherchedateien gehören nicht dazu. Die verwendeten Pages-Aktionen entsprechen dem [offiziellen GitHub-Beispiel](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Vorlageninhalte

Layout und Inhalte wurden anhand von [Pépinière Belkora](https://www.pepinierebelkora.com/) und der [Bismarckia-Seite](https://bismarckia.pepinierebelkora.com/) lokal übernommen und für Green Nouala verbunden. Die ursprünglichen Formulardienste und Tracking-Skripte sind entfernt.

Fotos, Portfolio-Projekte, Kundenbewertungen, Kundenlogos, Jahreszahlen, Garantien und Unternehmensangaben aus der Vorlage sind **Beispielinhalte, keine nachgewiesenen Green-Nouala-Referenzen**. Die Website kennzeichnet diese Vorlage. Vor einer Veröffentlichung die Beispielinhalte durch eigene Angaben ersetzen und die Nutzungsrechte für übernommene Fotos und Schriftdateien klären. Einzelheiten und Quelldateien stehen in `docs/CONTENT.md`, `docs/reference-pages.json`, `docs/asset-sources.json` und `docs/plant-photos.html`.
# greennouala
