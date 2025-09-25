---
title: "Bröllopsbudget i Excel – komplett mall"
description: "Ladda ner vår Excel-mall för bröllopsbudget, automatisera beräkningar och håll koll på kostnaderna steg för steg."
summary: "Så sätter ni upp, anpassar och följer upp en bröllopsbudget med vår smarta Excel-mall och checklistor."
primaryKeyword: "bröllopsbudget excel"
secondaryKeywords:
  - "budget bröllop mall"
schemaType: "Article"
status: "published"
evergreen: true
faq:
  - question: "Hur laddar vi ner och använder Excel-mallen?"
    answer: "Klicka på länken under CTA, skapa en kopia i Excel eller Google Sheets och följ instruktionerna i artikeln för att lägga in er budget."
  - question: "Kan vi automatiskt räkna ut kostnad per gäst i mallen?"
    answer: "Ja, fyll i totala kostnaden och antal gäster så räknar formeln `=Totalkostnad/Antal gäster` ut snittkostnaden direkt."
  - question: "Hur ofta bör bröllopsbudgeten uppdateras?"
    answer: "Justera budgeten varje gång en offert kommer in eller en betalning görs – sätt av 15 minuter per vecka för att hålla siffrorna aktuella."
sources:
  - label: "Konsumentverket – Koll på pengarna"
    url: "https://www.konsumentverket.se/teman/koll-pa-pengarna/"
  - label: "SCB – Konsumentprisindex"
    url: "https://www.scb.se/hitta-statistik/statistik-efter-amne/priser-och-konsumtion/kpi/"
  - label: "Svenska Bröllopskoordinatorer – Prisundersökning 2024"
    url: "https://www.svenskabrollopskoordinatorer.se/"
related:
  - "budget/brollopsbudget-2025"
  - "checklistor/brollopsbudget-checklista"
---

## TL;DR – Snabbsvar

Vår Excel-mall ger ett bröllopsbudget-överslag på minuter: fyll i gästlista, kostnadsposter och prioriteringar så räknar mallen ut totalsumma, kostnad per gäst och buffert. Automatiken bygger på svenska prisnivåer 2025 och är enkel att uppdatera veckovis. Koppla mallen till checklistan för att säkerställa att inga utgifter missas.

**Nyckeltal:** För ett bröllop med 75 gäster visar mallen att en standardbudget på 120 000 kr kräver cirka 1 600 kr per gäst, inklusive 10 % buffert.

## 1. Introduktion & snabba fakta

Excel-mallen är byggd för svenska bröllop med kategorier, moms och typiska betalplaner. Ni kan:

- växla mellan tre budgetnivåer (smart, standard, premium)
- lägga in offert, avtalad kostnad och faktiskt utfall
- följa automatiska diagram för kostnadsfördelning
- se varningsfält som färgmarkeras när en kategori överstiger budget.

Tipset är att börja med totalbudget och gästlista. Fyll sedan i prioriteringar – vad är viktigast, var kan ni skala ner? Mallen innehåller stödrader för kommentarer och ansvarig person, vilket underlättar om ni planerar tillsammans med vittnen eller koordinator.

## 2. Så laddar ni ner och startar mallen

1. Öppna CTA-länken längst ner i artikeln och välj "Ladda ner" om ni använder Excel, eller "Öppna i Google Sheets" för ett molnalternativ.
2. Skapa en kopia innan ni börjar redigera så att originallänken förblir oförändrad.
3. På fliken **Inställningar** slår ni på valfri budgetnivå och anger bröllopsdatum, antal gäster samt valuta (SEK är förvalt).
4. På fliken **Kostnader** fyller ni i offertsummor. Formlerna kopierar automatiskt totalsummor till översikten.
5. Använd fliken **Betalplan** för att planera deposition, delbetalning och slutbetalning. Ni får automatiska förfallodatum 30 dagar före respektive efter eventet.

## 3. Vad ingår i Excel-mallen?

| Flik | Funktion | Viktiga formler |
| ---- | -------- | --------------- |
| Inställningar | Sätt totalbudget, prioriteringar, antal gäster | `=SUMMA(TabellKostnader[Budget])` |
| Kostnader | Lista poster, offert, budget och utfall | `=IF([@Utfall]>[@Budget];"ÖVER";"OK")` |
| Diagram | Visualiserar fördelning och trend | Dynamiska pivottabeller |
| Betalplan | Deposition, delbetalningar och påminnelser | `=DATO(ÅR($B$2);MÅNAD($B$2)-1;DAG($B$2))` |
| Gästlista | Importera namn, RSVP, specialkost | Dataverifiering + villkorsstyrd formatering |

Flikarna är sammankopplade via Excel-tabeller. För att lägga till en ny kostnadspost, skriv i raden under den sista posten så expanderar tabellen automatiskt. Diagrammen uppdateras utan att ni behöver göra något.

## 4. Rekommenderad kostnadsstruktur 2025

| Kostnadspost | Rek. andel | Kommentar |
| ------------- | ---------- | --------- |
| Lokal & hyra | 20–28 % | Regionala skillnader; i Stockholm addera +15 %. |
| Mat & dryck | 25–30 % | Inkludera serveringspersonal och provsmakning. |
| Foto & film | 8–12 % | Använd kolumnen för delbetalningar (bokning + leverans). |
| Blommor & dekor | 6–10 % | Kombinera köp, hyra och DIY för att hålla nivån. |
| Kläder & styling | 8–12 % | För in både klädinköp och skräddare. |
| Underhållning | 5–10 % | Lägg till liveband, DJ, ljudteknik separat. |
| Transport & logi | 4–8 % | Räkna in reseersättningar för leverantörer. |
| Övrigt | 5–10 % | T.ex. trycksaker, ringar, presenter. |
| Buffert | Minst 10 % | Mallen varnar om bufferten understiger 8 %. |

För mer detaljer och prisexempel – jämför med [Bröllopsbudget 2025](/budget/brollopsbudget-2025/), där vi bryter ned tre budgetnivåer och regionpriser.

## 5. Automatisera beräkningar och uppföljning

- **Kostnad per gäst:** Formeln `=SUMMA(Kostnader[Utfall]) / AntalGäster` uppdateras automatiskt. Vill ni se kostnad per kategori och gäst? Lägg till en hjälpkolumn med `=[@Utfall] / AntalGäster`.
- **Buffertvarning:** Villkorsstyrd formatering lyser rött när bufferten är under 8 % av totalbudgeten. Justera gränsen i fliken Inställningar om ni vill ha mer marginal.
- **Påminnelser:** Exportera betalplanen som ICS-fil via macro-knappen eller synka med valfri kalender genom att kopiera datumen och skapa återkommande påminnelser.
- **Versionshistorik:** Skapa kvartalsflikar (Q1, Q2 ...) för att spara historik. På så sätt kan ni jämföra offertläge vs faktiska kostnader över tid.

## 6. Matcha mallen med checklistor och avtal

Koppla varje kostnadspost till en uppgift i [Checklista för bröllopsbudget](/checklistor/brollopsbudget-checklista/). Markera kolumnen **Status** som "Research", "Offert" eller "Bokad" för att se var ni behöver lägga mest energi. Komplettera med avtalsnummer och kontaktperson så att ni snabbt hittar rätt information när ni förhandlar eller jämför leverantörer.

## 7. Expertinsikter och tips

- **Sätt en buffert för prisjusteringar:** SCB:s KPI visar att mat- och dryckespriserna kan öka 3–6 % årligen. Höj alltså budgetposten för catering något om ni bokar långt i förväg.
- **Prata paket med leverantörer:** Svenska Bröllopskoordinatorers prisundersökning 2024 visar att kompletta paket ofta sparar 10–15 % jämfört med att boka varje tjänst separat.
- **Följ Konsumentverkets riktlinjer:** Använd deras kategorisering (boende, transporter, mat) för att enklare jämföra hushållsbudget och bröllopsbudget.
- **Dokumentera lärdomar:** Lägg till en kolumn "Note to future us" för att skriva ner vad som fungerade bra – perfekt om ni ska hjälpa vänner eller planera framtida högtider.

## Vanliga frågor

**Hur hanterar vi förändringar i valutakurser?** Ange valutakod (SEK, EUR, USD) i fliken Inställningar. Mallen hämtar en växelkurs som ni manuellt kan uppdatera när ni får fakturor i utländsk valuta.

**Hur delar vi budgeten med familj eller toastmaster?** Skapa en delad fil i OneDrive eller Google Drive och använd bläddringsskydd på celler som inte ska ändras. Lägg till en "Kommentar"-kolumn för att delegera uppgifter.

**Hur ofta ska vi stämma av budgeten?** Vi rekommenderar en veckovis budgetträff. Uppdatera offert- och utfallskolumner och jämför diagrammet för att upptäcka kategorier som sticker iväg.

## CTA – Ladda ner mallen

Redo att sätta igång? [Öppna Excel-mallen för bröllopsbudget](https://docs.google.com/) och gör en egen kopia. Kombinera den med [Bröllopsbudget 2025](/budget/brollopsbudget-2025/) för prisnivåer och [Checklista för bröllopsbudget](/checklistor/brollopsbudget-checklista/) för nästa uppgifter.
