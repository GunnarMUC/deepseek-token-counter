# Projekt: DeepSeek Token Counter – VS Code Extension

## 1. Ausgangspunkt
Das Repository [`maludb/claude-token-counter`](https://github.com/maludb/claude-token-counter) dient als Basis.  
Es ist eine funktionierende VS-Code-Erweiterung, die Tokens zählt und Kosten anzeigt, allerdings ausschließlich für Claude-Modelle.  
**Ziel:** Die Erweiterung so umbauen, dass sie **nur noch DeepSeek-Modelle** unterstützt (Tokenzählung + Kostenberechnung) und alle Claude-spezifischen Teile entfernt werden.

## 2. Funktionsumfang (wie gehabt, aber für DeepSeek)
- **Tokenzählung** für den gesamten Inhalt des aktiven Editors oder markierten Text.
- **Kostenberechnung** auf Basis des gewählten DeepSeek-Modells und seiner aktuellen Preise pro 1 Million Input-/Output-Tokens.
- **Anzeige** in der Statusleiste (Token-Anzahl und Kosten) und bei Klick eine detaillierte Aufschlüsselung als Information-Message.
- **Modellauswahl** über eine Einstellung (Konfiguration), sodass der Nutzer zwischen allen unterstützten DeepSeek-Modellen wechseln kann.
- **Automatische Erkennung** von Input vs. Output? Zunächst reicht es, den gesamten Text als Input zu behandeln. Eine spätere Unterscheidung (z. B. bei Chat-Verläufen) ist optional.

## 3. Architekturänderungen gegenüber dem Ausgangsprojekt
1. **Alle Claude-Referenzen entfernen**  
   - Dateien, Konstanten, Imports für Claude-Tokenizer und Preise komplett entfernen.
   - Erweiterungsname, ID, Beschreibung in `package.json` auf DeepSeek anpassen.

2. **Abstrakte Modellkonfiguration einführen**  
   - Eine zentrale Datei (z. B. `models.ts`) definiert ein Interface `ModelConfig` mit Feldern:
     - `id: string` (z. B. `deepseek-chat`, `deepseek-reasoner`)
     - `name: string` (Anzeigename)
     - `tokenizerType: 'deepseek-sentencepiece'` (vorerst nur dieser eine Typ)
     - `pricing: { inputPer1M: number; outputPer1M: number }`
   - Eine Liste aller unterstützten DeepSeek-Modelle wird dort hartcodiert, aber über VS-Code-Einstellungen überschreibbar gemacht (siehe Abschnitt 7).

3. **Tokenizer-Integration**  
   - Der ursprüngliche Claude-Tokenizer wird durch einen **DeepSeek-kompatiblen Tokenizer auf Basis von SentencePiece** ersetzt.
   - **Methode:** Das npm-Paket `sentencepiece-js` verwenden, um das offizielle DeepSeek SentencePiece-Modell (`.model`-Datei) zu laden.
   - **Tokenizer-Dateien** müssen während der Entwicklung heruntergeladen und in den Extension-Out-Ordner gebündelt werden. Quelle: HuggingFace-Repositories `deepseek-ai/DeepSeek-V2` (für V2, V3, R1) oder das konkrete Modellverzeichnis, das die Datei `tokenizer.model` enthält.  
   - Falls mehrere Modelle unterschiedliche Tokenizer haben, sollte die Modellkonfiguration den Pfad zur jeweiligen `.model`-Datei enthalten. Als pragmatische Lösung für den ersten Wurf kann **ein gemeinsamer Tokenizer für alle aktuellen DeepSeek-Modelle** verwendet werden (DeepSeek V2, V3 und R1 teilen sich denselben Tokenizer mit 100k Vokabular).
   - Die Tokenzählung muss **schnell und offline** funktionieren – kein API-Call.

4. **Kostenberechnung**  
   - Nach der Tokenzählung wird anhand des ausgewählten Modells der Preis berechnet.
   - Formel: `(inputTokens / 1_000_000) * inputPricePer1M`
   - Da der Editorinhalt als Input gewertet wird, kann ein separater Output-Faktor vorerst ignoriert werden. Optional könnte ein fester Split (z. B. 70% Input / 30% Output) angenommen werden, bis eine Logik existiert, um Rollen zu unterscheiden. Dies konfigurierbar halten.

## 4. Detaillierte Anforderungen an die Tokenisierung
- **Paket:** `sentencepiece-js` (oder ein äquivalentes JavaScript-SentencePiece-Paket, das Protobuf-Modelle liest).
- **Laden des Modells:**  
  Beim Aktivieren der Extension oder beim ersten Tokenisierungsaufruf wird das SentencePiece-Modell aus dem Dateisystem (gebündelt im Extension-Ordner) geladen und im Speicher gehalten.
- **Tokenisierung einer Textzeichenkette:**  
  `tokenizer.encode(text)` liefert ein Array von Token-IDs. Dessen Länge ist die Tokenanzahl.
- **Fehlerbehandlung:** Falls das Modell nicht geladen werden kann, soll eine deutliche Fehlermeldung erscheinen und keine falschen Werte anzeigen.

## 5. Unterstützte Modelle und Preise
Die folgende Liste ist **initial** und muss manuell aktualisiert werden. Der Nutzer kann die Preise später über die VS-Code-Einstellungen anpassen (siehe 7).

| Modell-ID | Name | Input $/1M Tokens | Output $/1M Tokens |
|-----------|------|-------------------|---------------------|
| `deepseek-chat` (DeepSeek-V3) | DeepSeek-V3 | 0.27 | 1.10 |
| `deepseek-reasoner` (DeepSeek-R1) | DeepSeek-R1 | 0.55 | 2.19 |
| `deepseek-coder` (DeepSeek-Coder-V2) | DeepSeek-Coder V2 | 0.14 | 0.28 |
| `deepseek-chat-v2` (DeepSeek-V2) | DeepSeek-V2 | 0.14 | 0.28 |

*Hinweis:* Die Preise stammen von `https://api-docs.deepseek.com/quick_start/pricing`. Sie können sich ändern. Das Projekt soll eine einfache Möglichkeit bieten, diese Werte zu aktualisieren (Einstellungs-UI).

## 6. Benutzeroberfläche und Verhalten
- **Statusleiste:** Ein Eintrag mit dem Schema: `DeepSeek: 1.2k Tokens | ~$0.0003`
  - Bei Klick erscheint eine Quick-Pick- oder Notification mit Details:
Modell: DeepSeek-V3
Tokens (Input): 1200
Kosten: $0.0003 (Input)

text
- **Kontextmenü / Befehl:** Über die Kommando-Palette (`Ctrl+Shift+P`) soll es einen Befehl `DeepSeek Token Counter: Modell auswählen` geben, der eine Liste der konfigurierten Modelle zeigt und die Auswahl übernimmt.
- **Einstellungen:** Unter `File > Preferences > Settings > Extensions > DeepSeek Token Counter` sollen alle Modell-Preise editierbar sein, sowie die Möglichkeit, Modelle hinzuzufügen/zu entfernen. (Technisch: contribution points in `package.json` für ein Array von Modell-Konfigurationen, die die hardcoded Defaults überschreiben können.)

## 7. Konfiguration über VS Code Settings
Die `package.json` definiert folgende Contributions:
- `deepseekTokenCounter.models` (Array von Objekten mit `id`, `name`, `inputPricePer1M`, `outputPricePer1M`, `tokenizerModelPath` – optional, sonst Standard-Tokenizer)
- `deepseekTokenCounter.preferredModel` (String, ID des vorausgewählten Modells)
- `deepseekTokenCounter.assumeOutputRatio` (Zahl zwischen 0 und 1, Standard 0, d. h. nur Input. Falls >0, wird ein Teil der Tokens als Output gewertet und entsprechend bepreist.)

Die Extension liest diese Einstellungen beim Start und bei Änderungen.

## 8. Dateiarchitektur des Zielprojekts

Die folgende Verzeichnis- und Dateistruktur beschreibt das umgebaute Projekt. Dateien, die nicht aufgeführt sind, können aus dem Basisprojekt übernommen und bei Bedarf gelöscht werden, sofern sie keine Claude-Logik enthalten.
deepseek-token-counter/
├── .vscode/
│ ├── launch.json # Debug-Konfiguration (Extension Host)
│ └── tasks.json # Build-Task
├── media/ # Enthält gebündelte Ressourcen
│ ├── deepseek_tokenizer.model # SentencePiece-Modell (aus DeepSeek-Repo)
│ └── LICENSE.tokenizer # Lizenz für das Tokenizer-Modell
├── src/
│ ├── extension.ts # Einstiegspunkt: aktiviert/deaktiviert Extension
│ ├── models.ts # Modell-Konfiguration und Standard-Preisliste
│ ├── deepseek/
│ │ └── tokenizer.ts # SentencePiece-Integration, countTokens()
│ ├── statusbar.ts # Verwaltung des Statusleisten-Eintrags
│ └── settings.ts # Hilfsfunktionen zum Lesen der Extension-Settings
├── test/
│ └── tokenizer.test.ts # Tests für Tokenzählung und Kostenberechnung
├── package.json # Extension-Manifest und Contributions
├── tsconfig.json # TypeScript-Konfiguration
├── README.md # Angepasste Dokumentation
└── CHANGELOG.md

text

**Erläuterung der wichtigsten Dateien:**

- **`package.json`**:  
  - `name`: `deepseek-token-counter`  
  - `contributes.commands`: Befehl `deepseek.selectModel` und `deepseek.showDetails`  
  - `contributes.configuration`: Einstellungen unter `deepseekTokenCounter` (siehe Abschnitt 7)  
  - `activationEvents`: `onLanguage:plaintext`, `onLanguage:markdown`, etc. (wie gehabt)  
  - `dependencies`: u.a. `sentencepiece-js` hinzufügen, `@anthropic-ai/tokenizer` entfernen.

- **`src/extension.ts`**:  
  - `activate()`-Funktion: Statusleisten-Item erstellen (aus `statusbar.ts`), Event-Listener für Editor-Wechsel registrieren, Befehle registrieren.  
  - Beim Textwechsel: Text aus Editor holen, an `countTokens()` übergeben, aktives Modell aus `models.ts` lesen, Preis berechnen, Statusleiste updaten.

- **`src/models.ts`**:  
  - Exportiert `ModelConfig` Interface und `DEFAULT_MODELS` Array (die Tabelle aus Abschnitt 5).  
  - Funktion `getActiveModelConfig(): ModelConfig`: Liest `deepseekTokenCounter.models` und `preferredModel` aus den VS-Code-Einstellungen und merged sie mit den Defaults.

- **`src/deepseek/tokenizer.ts`**:  
  - Nutzt `sentencepiece-js` (npm-Paket).  
  - Enthält `async function loadTokenizer(modelPath: string): Promise<void>` – lädt das `.model`-File (Pfad via `context.asAbsolutePath`).  
  - `function countTokens(text: string): number` – nutzt das geladene Modell zur Zählung.

- **`src/statusbar.ts`**:  
  - Exportiert Klasse `TokenStatusBarItem`, die ein `vscode.StatusBarItem` verwaltet und mit Text, Tooltip und Klick-Handler konfiguriert.

- **`src/settings.ts`**:  
  - Hilfsfunktionen wie `getConfiguration()` zum Auslesen der Einstellungen.

- **`media/deepseek_tokenizer.model`**:  
  - Die SentencePiece-Modelldatei. Muss manuell oder per Build-Script aus dem offiziellen DeepSeek-Repository heruntergeladen und an diesen Pfad gelegt werden. In `package.json` ggf. als `files` oder über `.vscodeignore` sicherstellen, dass sie im Bundle landet.

## 9. Entwicklungsumsetzung (Reihenfolge)
1. Clone `maludb/claude-token-counter` als Basis.
2. In `package.json` alle Metadaten anpassen, Claude-spezifische Contributions entfernen, die neuen Contributions wie oben beschrieben einfügen.
3. Neues Modul `src/deepseek/tokenizer.ts`:
   - Importiert `sentencepiece-js`.
   - Lädt die `.model`-Datei (vorzugsweise aus dem `media/` oder `assets/` Ordner der Extension).
   - Exportiert eine Funktion `countTokens(text: string): number`.
4. Neues Modul `src/models.ts`:
   - Definiert Interface und Default-Modellliste.
   - Bietet Funktion, um die aktuelle Modellkonfiguration aus den VS-Code-Einstellungen ggf. überschrieben zu lesen.
5. Umbau der Hauptlogik (etwa `src/extension.ts`):
   - Entfernen aller Claude-Imports.
   - Beim Speichern/Editor-Wechsel den Text holen und mit dem DeepSeek-Tokenizer zählen.
   - Preis basierend auf aktivem Modell berechnen.
   - Statusleisten-Text setzen.
6. UI-Aktionen:
   - Befehl `extension.selectDeepSeekModel` implementieren (Quick Pick mit Modell-Namen).
   - Befehl `extension.showDetails` (bei Klick auf Statusleiste) implementieren.
7. `package.json`-Einstellungen in der Extension auslesen und bei Konfigurationsänderungen den Tokenizer ggf. neu initialisieren (wenn sich der Tokenizer-Pfad ändert) und die Statusleiste aktualisieren.
8. Tests: Sicherstellen, dass der Tokenizer korrekt zählt (Referenzwerte von DeepSeek-API vergleichen). Preise prüfen.

## 10. Wichtige Hinweise für die KI-gestützte Umsetzung
- **Keine Claude-Abhängigkeiten** mehr verwenden – auch keine Fallbacks.
- Das SentencePiece-Modell (`.model`-Datei) muss **zwingend** mit der Extension gebündelt werden (via `files` in `package.json` oder kopieren in den Out-Ordner). Urheberrechtlich sind DeepSeeks Tokenizer-Dateien unter der MIT-Lizenz verwendbar – bitte Lizenzdatei beilegen.
- Alle sichtbaren Texte und Befehle sollen von „Claude“ auf „DeepSeek“ umbenannt werden.
- Das Ergebnis muss als vollständiges, eigenständiges Repository abgegeben werden, das mit `npm install && npm run compile` baubar ist und als VS-Code-Erweiterung per `F5` debuggt werden kann.

## 11. Verwendung dieses Dokuments
Dieses Dokument ist eine detaillierte Spezifikation. Übergib es einem KI-Assistenten deiner Wahl in VS Code (z. B. „Implementiere die Erweiterung gemäß dieser Spezifikation“) und lasse dir Schritt für Schritt den nötigen Code generieren.