# 🕹️ Pacman — Salesforce DX Unlocked Package

A fully playable **Pac-Man** game built as a Lightning Web Component (LWC), packaged as a Salesforce DX Unlocked Package.

Play classic Pac-Man right inside Salesforce! Eat dots, dodge ghosts (or eat them with power pellets!), and save your high score to a custom object.

---

## 📦 What's Included

| Component | Type | Description |
|---|---|---|
| `pacman` | LWC | The full game — canvas-based Pac-Man with ghosts, scoring, pause, and name entry |
| `PacmanScoreController` | Apex Class | Saves scores to Salesforce via `@AuraEnabled` |
| `PacmanScoreControllerTest` | Apex Test | 100% code coverage test class |
| `PacmanScore__c` | Custom Object | Stores player name + final score |
| `pacman` (tab) | Custom Tab | Lightning tab for the game LWC |
| `PacmanScore__c` (tab) | Custom Tab | Lightning tab for the Scores object |
| `Pacman` | Lightning App | App with both tabs |

---

## 🎮 How to Play

- **Arrow Keys** — Move Pac-Man
- **P key** or **Pause button** — Pause / Resume
- Eat all dots to win
- Eat power pellets (large flashing dots in corners) to turn ghosts blue — then eat them for bonus points!
- 3 lives total

### Scoring

| Action | Points |
|---|---|
| Eat a dot | 10 |
| Eat a power pellet | 50 |
| Eat a frightened ghost | 200 |

---

## 🚀 Deployment Guide

### Prerequisites

- [Salesforce CLI (`sf`)](https://developer.salesforce.com/tools/salesforcecli)
- A Salesforce Dev Hub org with Unlocked Packages enabled
- A scratch org or target org

### 1. Authenticate to your Dev Hub

```bash
sf org login web --set-default-dev-hub --alias myDevHub
```

### 2. Create a Scratch Org (optional, for testing)

```bash
sf org create scratch --definition-file config/project-scratch-def.json --alias pacman-scratch --set-default --duration-days 7
```

> You may need to create `config/project-scratch-def.json`. A minimal one:
> ```json
> {
>   "orgName": "Pacman Dev",
>   "edition": "Developer",
>   "features": ["EnableSetPasswordInApi"]
> }
> ```

### 3. Push Source to Scratch Org

```bash
sf project deploy start
```

Or for a scratch org:

```bash
sf push
```

### 4. Open the App

```bash
sf org open
```

Navigate to the **Pacman** app in the App Launcher.

---

## 📦 Working with the Unlocked Package

### Create the Package (first time only)

```bash
sf package create \
  --name "Pacman" \
  --package-type Unlocked \
  --path force-app \
  --target-dev-hub myDevHub
```

This will update `sfdx-project.json` with a package ID. Commit that change.

### Create a Package Version

```bash
sf package version create \
  --package Pacman \
  --installation-key-bypass \
  --wait 10 \
  --target-dev-hub myDevHub
```

### Install the Package in a Target Org

```bash
sf package install \
  --package "Pacman@1.0.0-1" \
  --target-org myTargetOrg \
  --wait 10
```

---

## 🏗️ Project Structure

```
force-app/main/default/
  lwc/pacman/                   ← Lightning Web Component (the game)
    pacman.html
    pacman.js
    pacman.js-meta.xml
    pacman.css
  classes/
    PacmanScoreController.cls          ← Apex: saves scores
    PacmanScoreController.cls-meta.xml
    PacmanScoreControllerTest.cls      ← Apex: test class (100% coverage)
    PacmanScoreControllerTest.cls-meta.xml
  objects/PacmanScore__c/
    PacmanScore__c.object-meta.xml     ← Custom object definition
    fields/PlayerName__c.field-meta.xml
    fields/Score__c.field-meta.xml
  tabs/
    pacman.tab-meta.xml                ← LWC tab
    PacmanScore__c.tab-meta.xml        ← Object tab
  applications/
    Pacman.app-meta.xml                ← Lightning App
```

---

## 🧪 Running Tests

```bash
sf apex run test --class-names PacmanScoreControllerTest --result-format human
```

---

## 📝 Notes

- API Version: **62.0**
- The game uses HTML5 Canvas rendered inside an LWC. This requires the component to run in a Lightning Tab or a page where `canvas` rendering is supported.
- Score saving is done via Apex when the game ends. If the save fails (e.g., offline or permissions issue), the game still shows the game over screen.

---

Built with 💛 and a lot of dots to eat.
