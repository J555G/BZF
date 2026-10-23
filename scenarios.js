/* Praxis-Szenarien für den Sprechfunk nach Sichtflugregeln.
   Flugplätze Lindenau und Seebrück sowie ihre Meldepunkte sind erfunden; Bremen Information ist der echte FIS.
   Luftfahrzeug: Ultraleicht D-MJGA (gesprochen: Delta Mike Juliett Golf Alfa), abgekürzt D-GA.
   Schritt: ctx = Lage, atc = Funkspruch der Bodenstelle vorher (optional), task = Aufgabe,
   opts[0] = richtiger Funkspruch, keys = Bestandteile, die beim freien Formulieren nicht fehlen dürfen. */
window.BZF_SCENARIOS = [
{
  id:"de-abflug", lang:"de", title:"Abflug vom unkontrollierten Landeplatz",
  intro:"Die Ikarus C42 D-MJGA steht auf dem Vorfeld des Landeplatzes Lindenau (Lindenau Info) und soll nach Seebrück fliegen.",
  steps:[
    { ctx:"Vor dem Anlassen soll geprüft werden, ob das Funkgerät gut ankommt.", task:"Funkprobe auf 122,505 durchführen.",
      opts:["Lindenau Info, D-MJGA, Funkprobe auf 122,505","Lindenau Info, D-MJGA, Radio Check Radio Check","Lindenau Info, hören Sie mich?","Lindenau Info, D-MJGA, Test, Test, eins, zwo, drei"],
      keys:["Lindenau Info","D-MJGA","Funkprobe"],
      note:"Eine Testübermittlung enthält Rufzeichen der Bodenstelle, eigenes Rufzeichen, das Wort Funkprobe (englisch RADIO CHECK) und die Frequenz. Gesprochen: eins zwo zwo Komma fünf null fünf." },
    { atc:"D-MJGA, Lindenau Info, höre Sie fünf.", ctx:"Die Antwort kommt klar.", task:"Was bedeutet 'höre Sie fünf', und wie wird reagiert?",
      opts:["Sehr gut verständlich. Ich kann einfach mit 'D-MJGA' bestätigen.","Schwer verständlich. Ich wiederhole die Funkprobe.","Zeitweise verständlich. Ich wechsle die Frequenz.","Unverständlich. Ich sende die Meldung blind."],
      keys:[], note:"Lesbarkeitsskala: eins unverständlich, zwo zeitweise verständlich, drei schwer verständlich, vier verständlich, fünf sehr gut verständlich." },
    { ctx:"Das Luftfahrzeug ist rollbereit.", task:"Bei Lindenau Info melden und die Rollinformation erbitten.",
      opts:["Lindenau Info, D-MJGA, Ikarus C42, am Vorfeld, VFR nach Seebrück, erbitte Rollinformation","Lindenau Info, D-GA, erbitte Rollfreigabe zur Piste","Lindenau Info, D-MJGA, rolle zur Piste 26","Lindenau, hier Ultraleicht am Vorfeld, möchte nach Seebrück"],
      keys:["Lindenau Info","D-MJGA","Vorfeld","Seebrück","Rollinformation"],
      note:"Am unkontrollierten Platz gibt es keine Freigaben, nur Informationen. Das abgekürzte Rufzeichen D-GA darf erst verwendet werden, wenn die Bodenstelle es benutzt hat." },
    { atc:"D-GA, Piste 26, Wind 240 Grad, 8 Knoten, QNH 1015.", task:"Bestätigen.",
      opts:["Piste 26, QNH 1015, D-GA","Verstanden, D-GA","Wind 240 Grad, 8 Knoten, D-GA","Piste 26, Wind 240 Grad, 8 Knoten, D-GA"],
      keys:["26","1015","D-GA"],
      note:"Betriebspiste und QNH werden zurückgelesen, Wind nicht. Das Rufzeichen steht bei der Bestätigung am Ende. Gesprochen: Q N H eins null eins fünf." },
    { ctx:"Das Luftfahrzeug steht am Rollhalt, alle Checks sind erledigt.", task:"Melden, dass das Luftfahrzeug startbereit ist.",
      opts:["D-GA, Rollhalt Piste 26, abflugbereit","D-GA, Rollhalt Piste 26, startbereit","D-GA, starte jetzt","D-GA, erbitte Startfreigabe"],
      keys:["D-GA","26","abflugbereit"],
      note:"Die Sprechgruppe heißt abflugbereit. 'Start frei' sagt nur eine Flugverkehrskontrollstelle, und das gibt es an einem Landeplatz mit Info nicht." },
    { ctx:"Nach dem Start verlässt das Luftfahrzeug die Platzrunde Richtung Nordosten.", task:"Abmelden.",
      opts:["D-GA, verlasse Platzrunde Richtung Nordost, wechsle zu Bremen Information","D-GA, Ende","Lindenau Info, ich fliege jetzt weg, tschüss","D-GA, verlasse Frequenz"],
      keys:["D-GA","verlasse","Bremen Information"],
      note:"Kurz und vollständig: was der Pilot tut und wohin er wechselt. So weiß die Info, dass das Luftfahrzeug nicht mehr auf der Frequenz ist." }
  ]
},
{
  id:"de-fis", lang:"de", title:"Fluginformationsdienst unterwegs",
  intro:"Das Luftfahrzeug fliegt 10 NM nordöstlich von Lindenau in 2500 ft, Bremen Information soll gerufen werden.",
  steps:[
    { ctx:"Die Frequenz ist ruhig.", task:"Den Einleitungsanruf absetzen.",
      opts:["Bremen Information, D-MJGA","D-MJGA an Bremen Information, kommen","Bremen, hier D-MJGA, Ikarus C42, VFR nach Seebrück, 2500 Fuß, erbitte Verkehrsinformationen, kommen","Hallo Bremen Information"],
      keys:["Bremen Information","D-MJGA"],
      note:"Beim Herstellen der Verbindung genügt der Einleitungsanruf: gerufene Stelle, dann eigenes Rufzeichen. Das Wort 'kommen' gehört nicht zur heutigen Phraseologie." },
    { atc:"D-MJGA, Bremen Information.", task:"Meldung abgeben.",
      opts:["D-MJGA, Ikarus C42, VFR von Lindenau nach Seebrück, 10 Meilen nordöstlich Lindenau, 2500 Fuß, erbitte Verkehrsinformationen","D-GA, erbitte Freigabe nach Seebrück","D-MJGA, ich bin unterwegs nach Seebrück","D-MJGA, Ikarus C42, erbitte QNH und Wetter für alle Plätze"],
      keys:["D-MJGA","Lindenau","Seebrück","Meilen","2500","Verkehrsinformationen"],
      note:"Muster: Rufzeichen, Muster, Flugregeln und Strecke, Standort, Höhe, Anliegen. FIS gibt Informationen, keine Freigaben." },
    { atc:"D-GA, squawk 4421, QNH 1013.", task:"Bestätigen.",
      opts:["Squawk 4421, QNH 1013, D-GA","Verstanden, D-GA","Wilco, D-GA","D-GA, 4421"],
      keys:["4421","1013","D-GA"],
      note:"SSR-Code und QNH gehören zu den Angaben, die immer zurückgelesen werden. Gesprochen: squawk vier vier zwo eins." },
    { atc:"D-GA, Verkehr 2 Uhr, 3 Meilen, entgegengesetzte Richtung, Motorsegler, 500 Fuß über Ihnen.", ctx:"Der Pilot hält Ausschau und sieht den Motorsegler kurz darauf rechts vorne.", task:"Antworten.",
      opts:["D-GA, Verkehr in Sicht","D-GA, Verkehr 2 Uhr, 3 Meilen, 500 Fuß über mir","Wilco, D-GA","Negativ, D-GA"],
      keys:["D-GA","Sicht"],
      note:"Verkehrshinweise werden nicht zurückgelesen. Sinnvoll ist die Meldung 'Verkehr in Sicht' oder 'halte Ausschau'. 2 Uhr bedeutet rechts voraus." }
  ]
},
{
  id:"de-ctr", lang:"de", title:"Einflug in die Kontrollzone und Landung",
  intro:"Der Flug geht nach Seebrück, einem Flugplatz mit Flugverkehrskontrolle (Seebrück Turm, Kontrollzone Luftraum D). Einflug über den Pflichtmeldepunkt November. Die ATIS meldet Information Bravo.",
  steps:[
    { ctx:"Das Luftfahrzeug ist noch 5 Minuten vor November in 2000 ft.", task:"Seebrück Turm mit vollständiger Erstmeldung rufen.",
      opts:["Seebrück Turm, D-MJGA, Ikarus C42, 5 Minuten vor November, 2000 Fuß, Information Bravo, zur Landung","Seebrück Turm, D-GA, über November, erbitte Landung","Seebrück Turm, D-MJGA, bin in der Kontrollzone, zur Landung","Seebrück Turm, D-MJGA, Information Bravo"],
      keys:["Seebrück Turm","D-MJGA","November","2000","Bravo","Landung"],
      note:"Vor dem Einflug in den Luftraum D muss die Verbindung stehen und die Freigabe vorliegen. Die ATIS-Kennung zeigt dem Turm, dass der Pilot Wetter und Piste schon hat." },
    { atc:"D-GA, Seebrück Turm, fliegen Sie in die Kontrollzone über November, 1500 Fuß oder darunter, Piste 33, QNH 1012, melden Sie November.", task:"Die Freigabe bestätigen.",
      opts:["In die Kontrollzone über November, 1500 Fuß oder darunter, Piste 33, QNH 1012, werde November melden, D-GA","Verstanden, D-GA","Wilco, D-GA","Piste 33, QNH 1012, D-GA"],
      keys:["November","1500","33","1012","D-GA"],
      note:"Freigaben werden mit allen sicherheitsrelevanten Teilen zurückgelesen: Strecke, Höhe, Piste, QNH. 'Melden Sie' wird mit 'werde … melden' oder 'wilco' bestätigt." },
    { ctx:"Das Luftfahrzeug überfliegt November.", task:"Die Standortmeldung abgeben.",
      opts:["D-GA, November","D-GA, über November um 1432, 1500 Fuß","Seebrück Turm, D-MJGA, Ikarus C42, über November, 1500 Fuß, zur Landung","D-GA, bin jetzt da"],
      keys:["D-GA","November"],
      note:"Erfolgt die Meldung beim Überflug, entfällt die Uhrzeit. Nach hergestellter Verbindung reicht das abgekürzte Rufzeichen und der Meldepunkt." },
    { atc:"D-GA, fliegen Sie in den rechten Gegenanflug Piste 33, melden Sie Queranflug.", task:"Bestätigen.",
      opts:["Rechter Gegenanflug Piste 33, werde Queranflug melden, D-GA","Linker Gegenanflug 33, D-GA","Verstanden, D-GA","Rechter Queranflug Piste 33, D-GA"],
      keys:["rechte","Gegenanflug","33","Queranflug","D-GA"],
      note:"Anweisungen zum Flugweg werden zurückgelesen. Rechts oder links ist entscheidend, weil Platzrunden normalerweise Linkskurven haben und hier ausdrücklich rechts angewiesen wurde." },
    { atc:"D-GA, Piste 33, Landung frei, Wind 300 Grad, 10 Knoten.", task:"Bestätigen.",
      opts:["Piste 33, Landung frei, D-GA","Landung frei, Wind 300 Grad, 10 Knoten, D-GA","Wilco, D-GA","D-GA, lande"],
      keys:["33","Landung frei","D-GA"],
      note:"Landefreigabe immer mit Piste zurücklesen. Der Wind ist Information und wird nicht wiederholt." },
    { atc:"D-GA, verlassen Sie die Piste über Rollbahn C, rollen Sie zum Vorfeld.", task:"Bestätigen.",
      opts:["Verlasse Piste über C, rolle zum Vorfeld, D-GA","Verstanden, D-GA","D-GA, rolle","Vorfeld, D-GA"],
      keys:["C","Vorfeld","D-GA"],
      note:"Rollanweisungen werden zurückgelesen, damit kein Missverständnis auf dem Rollfeld entsteht." }
  ]
},
{
  id:"de-mayday", lang:"de", title:"Notfall: Motorausfall",
  intro:"Das Luftfahrzeug fliegt 8 NM südlich von Lindenau in 1500 ft, Steuerkurs 180, und ist mit Bremen Information verbunden. Der Motor setzt aus und springt nicht wieder an.",
  steps:[
    { ctx:"Ein Notlandefeld liegt voraus.", task:"Die Notmeldung absetzen.",
      opts:["MAYDAY MAYDAY MAYDAY, Bremen Information, D-MJGA, Motorausfall, beabsichtige Notlandung auf einem Feld, 8 Meilen südlich Lindenau, 1500 Fuß, Steuerkurs 180","PAN PAN, PAN PAN, PAN PAN, Bremen Information, D-MJGA, Motorausfall, Notlandung","Bremen Information, D-GA, ich habe ein Problem mit dem Motor","Notfall, Notfall, Notfall, D-MJGA, Motorausfall, 8 Meilen südlich Lindenau"],
      keys:["MAYDAY","Bremen Information","D-MJGA","Motorausfall","Notlandung","südlich Lindenau","1500","180"],
      note:"MAYDAY steht für schwere, unmittelbare Gefahr. Inhalt: Art der Notlage, Absicht, Standort, Höhe, Kurs. Auf der benutzten Frequenz senden, wenn dort Verbindung besteht; sonst 121,5." },
    { task:"Welcher Transpondercode wird geschaltet, wenn kein anderer zugewiesen ist?",
      opts:["7700","7600","7500","7000"], keys:[],
      note:"7700 Notlage, 7600 Funkausfall, 7500 Entführung, 7000 VFR-Standardcode." }
  ]
},
{
  id:"de-funkausfall", lang:"de", title:"Funkausfall vor der Kontrollzone",
  intro:"Das Luftfahrzeug soll in die Kontrollzone Seebrück einfliegen. Der Empfänger ist ausgefallen, senden ist vermutlich noch möglich.",
  steps:[
    { task:"Welcher Transpondercode wird geschaltet?", opts:["7600","7700","7000","7500"], keys:[], note:"7600 zeigt dem Lotsen den Funkausfall an." },
    { task:"Es liegt noch keine Einflugfreigabe vor. Wie ist vorzugehen?",
      opts:["Nicht einfliegen, auf dem nächstgelegenen geeigneten Flugplatz landen und dem Turm schnellstmöglich die Landezeit übermitteln","Trotzdem in die Kontrollzone einfliegen und landen","Vollkreise fliegen, bis der Turm Lichtsignale gibt","Umkehren und unbedingt zum Startflugplatz zurückfliegen"],
      keys:[], note:"Ohne Freigabe kein Einflug in die CTR. Nur aus flugbetrieblichen Gründen darf der Flug in die CTR fortgesetzt werden." },
    { ctx:"Der Pilot sendet eine Blindsendung, damit der Turm seine Absicht kennt.", task:"Die Blindsendung formulieren.",
      opts:["Blindsendung, Seebrück Turm, D-MJGA, Empfängerausfall, lande in Lindenau, nächste Meldung um 1450. Ich wiederhole: Blindsendung, Seebrück Turm, D-MJGA, Empfängerausfall, lande in Lindenau, nächste Meldung um 1450","Seebrück Turm, D-MJGA, Funkausfall, Ende","MAYDAY MAYDAY MAYDAY, Seebrück Turm, D-MJGA, Funkausfall","Seebrück Turm, D-MJGA, hören Sie mich? Hören Sie mich?"],
      keys:["Blindsendung","D-MJGA","wiederhole","nächste Meldung"],
      note:"Merkmale der Blindsendung: Die Meldung wird zweimal gesendet und enthält die Uhrzeit der nächsten beabsichtigten Meldung." }
  ]
},
{
  id:"en-fis", lang:"en", title:"Flight information service in English",
  intro:"You are 10 NM northeast of Lindenau at 2500 ft, VFR to Seebrück, and call Bremen Information in English.",
  steps:[
    { ctx:"The frequency is quiet.", task:"Make the initial call.",
      opts:["Bremen Information, D-MJGA","D-MJGA calling Bremen Information, over","Hello Bremen, this is D-MJGA","Bremen Information, D-GA"],
      keys:["Bremen Information","D-MJGA"],
      note:"Station called, then your full callsign. Spoken: Delta Mike Juliett Golf Alfa." },
    { atc:"D-MJGA, Bremen Information.", task:"Pass your message.",
      opts:["D-MJGA, Ikarus C42, VFR from Lindenau to Seebrück, 10 miles northeast of Lindenau, 2500 feet, request traffic information","D-MJGA, request clearance to Seebrück","D-MJGA, flying to Seebrück now","D-MJGA, Ikarus C42, request weather for all airports"],
      keys:["D-MJGA","Lindenau","Seebrück","miles","2500","traffic information"],
      note:"Callsign, type, flight rules and route, position, level, request. FIS provides information, not clearances." },
    { atc:"D-GA, squawk 4421, QNH 1013.", task:"Read back.",
      opts:["Squawk 4421, QNH 1013, D-GA","Roger, D-GA","Wilco, D-GA","4421, D-GA"],
      keys:["4421","1013","D-GA"],
      note:"SSR codes and altimeter settings must always be read back. Spoken: squawk four four two one, QNH one zero one three." },
    { atc:"D-GA, traffic one o'clock, 3 miles, opposite direction, motor glider, 500 feet above.", ctx:"You cannot see it yet.", task:"Respond.",
      opts:["Looking out, D-GA","Traffic one o'clock, 3 miles, 500 feet above, D-GA","Negative contact, wilco, D-GA","Roger, cleared, D-GA"],
      keys:["D-GA","looking"],
      note:"Traffic information is not read back. Reply 'traffic in sight' or 'looking out' (also heard: 'negative contact')." }
  ]
},
{
  id:"en-ctr", lang:"en", title:"Control zone entry and landing in English",
  intro:"You are inbound to Seebrück (Seebrück Tower, control zone class D), entry via reporting point November, ATIS information Bravo.",
  steps:[
    { ctx:"5 minutes before November, 2000 ft.", task:"Call Seebrück Tower.",
      opts:["Seebrück Tower, D-MJGA, Ikarus C42, 5 minutes before November, 2000 feet, information Bravo, for landing","Seebrück Tower, D-GA, over November, request landing","Seebrück Tower, D-MJGA, inside control zone, for landing","Seebrück Tower, D-MJGA, information Bravo"],
      keys:["Seebrück Tower","D-MJGA","November","2000","Bravo","landing"],
      note:"You need the clearance before entering class D. Quoting the ATIS letter tells the controller you have the current information." },
    { atc:"D-GA, Seebrück Tower, enter control zone via November, 1500 feet or below, runway 33, QNH 1012, report November.", task:"Read back the clearance.",
      opts:["Enter control zone via November, 1500 feet or below, runway 33, QNH 1012, wilco, D-GA","Roger, D-GA","Wilco, D-GA","Runway 33, QNH 1012, D-GA"],
      keys:["November","1500","33","1012","D-GA"],
      note:"Read back route, level, runway and QNH. 'Report November' is acknowledged with 'wilco'." },
    { atc:"D-GA, join right downwind runway 33, report base.", task:"Read back.",
      opts:["Join right downwind runway 33, wilco, D-GA","Left downwind 33, D-GA","Roger, D-GA","Right base runway 33, D-GA"],
      keys:["right downwind","33","D-GA"],
      note:"Circuit instructions are read back. Right or left matters, the standard circuit is left-hand." },
    { atc:"D-GA, runway 33, cleared to land, wind 300 degrees, 10 knots.", task:"Read back.",
      opts:["Runway 33, cleared to land, D-GA","Cleared to land, wind 300 degrees 10 knots, D-GA","Wilco, D-GA","Landing, D-GA"],
      keys:["33","cleared to land","D-GA"],
      note:"Landing clearance with runway is read back, the wind is not." },
    { atc:"D-GA, vacate via taxiway Charlie, taxi to the apron.", task:"Read back.",
      opts:["Vacate via Charlie, taxi to the apron, D-GA","Roger, D-GA","Taxiing, D-GA","Apron, D-GA"],
      keys:["Charlie","apron","D-GA"],
      note:"Taxi instructions are always read back." }
  ]
},
{
  id:"en-mayday", lang:"en", title:"Emergency: engine failure in English",
  intro:"8 NM south of Lindenau, 1500 ft, heading 180, in contact with Bremen Information. The engine fails and will not restart.",
  steps:[
    { task:"Transmit the distress message.",
      opts:["MAYDAY MAYDAY MAYDAY, Bremen Information, D-MJGA, engine failure, intend forced landing in a field, 8 miles south of Lindenau, 1500 feet, heading 180","PAN PAN, PAN PAN, PAN PAN, Bremen Information, D-MJGA, engine failure","Bremen Information, D-GA, I have an engine problem","Emergency emergency emergency, D-MJGA, engine failure"],
      keys:["MAYDAY","Bremen Information","D-MJGA","engine failure","forced landing","south of Lindenau","1500","180"],
      note:"Nature of the emergency, intentions, position, level, heading. Use the frequency in use, otherwise 121.5." },
    { task:"When would PAN PAN be the right signal instead?",
      opts:["When the aircraft is in a difficult situation but not in grave and imminent danger, for example a rough-running engine or being uncertain of position","Only after landing","Whenever you lose radio contact","When you want to cancel a MAYDAY"],
      keys:[], note:"PAN PAN is the urgency signal: a difficult situation without grave and imminent danger." }
  ]
}
];
