/* Umwandlung gesprochener Funksprüche in die Schreibweise der Musterfunksprüche.
   Beispiele: "eins zwo null Komma fünf" -> "120,5", "Delta Mike Juliett Golf Alfa" -> "D-MJGA",
   "zwo tausend fünf hundert" -> "2500", "one two two decimal five" -> "122.5".
   Außerdem Abgleich der Pflichtbestandteile (keys) eines Szenario-Schritts mit dem Text.
   Funktioniert im Browser (window.BZF_NORM) und in Node (module.exports, für Tests). */
(function(root){
"use strict";

const DIGITS = {
  null:0, zero:0, nul:0,
  eins:1, one:1, wun:1,
  zwo:2, zwei:2, two:2,
  drei:3, three:3, tree:3,
  vier:4, four:4, fower:4,
  fünf:5, fuenf:5, fünnef:5, fünef:5, five:5, fife:5,
  sechs:6, six:6,
  sieben:7, seven:7,
  acht:8, eight:8, ait:8,
  neun:9, nine:9, niner:9
};
const TEENS = { zehn:10, elf:11, zwölf:12, ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15,
  sixteen:16, seventeen:17, eighteen:18, nineteen:19 };
const TENS_EN = { twenty:20, thirty:30, forty:40, fourty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90 };
const HUNDRED = ["hundert","hundred"], THOUSAND = ["tausend","thousand","tousand"];
const DECIMAL = { komma:",", decimal:".", point:"." };

const ALPHA = {
  alfa:"a", alpha:"a", bravo:"b", charlie:"c", charly:"c", delta:"d", echo:"e", foxtrot:"f", fox:"f",
  golf:"g", hotel:"h", india:"i", juliett:"j", juliet:"j", juliette:"j", kilo:"k", lima:"l", mike:"m",
  november:"n", oscar:"o", oskar:"o", papa:"p", quebec:"q", romeo:"r", sierra:"s", tango:"t",
  uniform:"u", victor:"v", viktor:"v", whiskey:"w", whisky:"w", xray:"x", "x-ray":"x", yankee:"y", zulu:"z"
};

/* Deutsche Zahlwörter als ein Wort, z. B. "zweitausendfünfhundert", "dreiunddreißig", "zwölfhundert". */
const DE_UNIT = { ein:1, eins:1, zwei:2, zwo:2, drei:3, vier:4, fünf:5, sechs:6, sieben:7, sieb:7, acht:8, neun:9 };
const DE_TENS = { zwanzig:20, dreißig:30, dreissig:30, vierzig:40, fünfzig:50, sechzig:60, siebzig:70, achtzig:80, neunzig:90 };
const DE_TEEN = { zehn:10, elf:11, zwölf:12, dreizehn:13, vierzehn:14, fünfzehn:15, sechzehn:16, siebzehn:17, achtzehn:18, neunzehn:19 };
function deUnder100(w){
  if(w in DE_TEEN) return DE_TEEN[w];
  if(w in DE_TENS) return DE_TENS[w];
  if(w in DE_UNIT) return DE_UNIT[w];
  const m = w.match(/^(.+?)und(.+)$/);
  if(m && m[1] in DE_UNIT && m[2] in DE_TENS) return DE_UNIT[m[1]] + DE_TENS[m[2]];
  return null;
}
function deUnder1000(w){
  if(w==="") return 0;
  const i = w.indexOf("hundert");
  if(i<0) return deUnder100(w);
  const h = i===0 ? 1 : deUnder100(w.slice(0,i));
  if(h===null || h>99) return null;
  const rest = w.slice(i+7);
  const r = rest==="" ? 0 : deUnder100(rest);
  return r===null ? null : h*100 + r;
}
function deCompound(w){
  if(!/[a-zäöüß]/.test(w) || w.length<4) return null;
  const i = w.indexOf("tausend");
  if(i<0){
    if(w.indexOf("hundert")<0 && !(w in DE_TEEN) && !(w in DE_TENS) && !/und/.test(w)) return null;
    return deUnder1000(w);
  }
  const t = i===0 ? 1 : deUnder1000(w.slice(0,i));
  if(t===null) return null;
  const r = deUnder1000(w.slice(i+7));
  return r===null ? null : t*1000 + r;
}

function tokenize(text){
  return String(text||"").toLowerCase()
    .replace(/x-ray/g, "xray")
    .replace(/[„“"'´`!?;:()\[\]]/g, " ")
    .replace(/(\d),(\d)/g, "$1\u0000$2")       // Dezimalkomma in Ziffern schützen
    .replace(/(\d)\.(\d)/g, "$1\u0001$2")
    .replace(/[,.]/g, " | ")
    .replace(/\u0000/g, ",").replace(/\u0001/g, ".")
    .split(/\s+/).filter(Boolean);
}

/* Liefert eine Liste von Token. Zahlen- und Buchstabenfolgen werden zusammengefasst. */
function normTokens(text){
  const src = tokenize(text), out = [];
  let i = 0;
  while(i < src.length){
    const w = src[i];
    // Zahlenfolge
    if(isNumWord(w)){
      let s = "", j = i;
      while(j < src.length){
        const part = readNumber(src, j);
        if(!part) break;
        s += part.text; j = part.next;
        if(j < src.length && DECIMAL[src[j]] && j+1 < src.length && isNumWord(src[j+1])){ s += DECIMAL[src[j]]; j++; continue; }
        if(j < src.length && isNumWord(src[j]) && part.kind==="digits" && kindAt(src, j)==="digits") continue;
        break;
      }
      out.push(s); i = j; continue;
    }
    // Buchstabierfolge
    if(ALPHA[w]){
      let s = "", j = i;
      while(j < src.length && ALPHA[src[j]]){ s += ALPHA[src[j]]; j++; }
      // Kennzeichen abtrennen: D + 4 Buchstaben (D-MJGA) oder D + 2 (D-GA), Rest als eigene Buchstaben
      while(s.length){
        const n = s[0]==="d" ? (s.length>=5 ? 5 : s.length>=3 ? 3 : s.length) : s.length;
        out.push(reg(s.slice(0, n))); s = s.slice(n);
      }
      i = j; continue;
    }
    if(w!=="|") out.push(reg(w));
    i++;
  }
  return out;
}
function isNumWord(w){ return w in DIGITS || w in TEENS || w in TENS_EN || HUNDRED.includes(w) || THOUSAND.includes(w) || /^\d+([.,]\d+)?$/.test(w) || deCompound(w)!==null; }
function kindAt(src, j){ const w = src[j]; return (w in DIGITS || /^\d$/.test(w)) ? "digits" : "value"; }

/* Liest ab Position j eine Zahl. Einzelziffern hintereinander ergeben eine Ziffernfolge ("eins null eins fünf" -> 1015),
   mit hundert/tausend wird gerechnet ("zwo tausend fünf hundert" -> 2500). */
function readNumber(src, j){
  const w = src[j];
  if(/^\d+([.,]\d+)?$/.test(w)) return { text:w, next:j+1, kind: w.length===1 ? "digits" : "value" };
  const c = deCompound(w);
  if(c!==null && !(w in DIGITS)) return { text:String(c), next:j+1, kind:"value" };
  // Ziffern sammeln, ggf. mit hundert/tausend
  let total = 0, cur = "", k = j, usedMult = false, tens = 0;
  while(k < src.length){
    const x = src[k];
    if(x in DIGITS){ if(tens){ cur = String(tens + DIGITS[x]); tens = 0; } else cur += DIGITS[x]; k++; continue; }
    if(x in TEENS){ cur += TEENS[x]; k++; continue; }
    if(x in TENS_EN){ tens = TENS_EN[x]; k++; continue; }
    if(THOUSAND.includes(x)){ total += (cur ? +cur : (tens||1)) * 1000; cur = ""; tens = 0; usedMult = true; k++; continue; }
    if(HUNDRED.includes(x)){ total += (cur ? +cur : (tens||1)) * 100; cur = ""; tens = 0; usedMult = true; k++; continue; }
    break;
  }
  if(tens){ cur = String((cur ? +cur : 0) + tens); }
  if(k===j) return null;
  if(usedMult) return { text:String(total + (cur ? +cur : 0)), next:k, kind:"value" };
  return { text:cur, next:k, kind:"digits" };
}

/* Kennzeichen: d + 2 oder 4 Buchstaben -> D-GA / D-MJGA */
function reg(s){
  const m = s.match(/^d-?([a-z]{2}|[a-z]{4})$/);
  if(m) return "d-" + m[1];
  return s;
}

function normText(text, lang){
  return normTokens(text).map(t => {
    if(/^d-[a-z]+$/.test(t)) return t.toUpperCase();
    if(/^\d/.test(t)) return lang==="de" ? t.replace(".", ",") : t.replace(",", ".");
    return t;
  }).join(" ");
}

/* Prüft, ob ein Pflichtbestandteil im Text vorkommt. Vergleich auf normalisierten Token,
   Zahlen zusätzlich ohne Leerzeichen (falls die Erkennung "10 15" statt "1015" liefert). */
function hasKey(text, key){
  const t = normTokens(text), k = normTokens(key);
  if(!k.length) return true;
  // gleich, Zahl ohne Komma gleich, oder Wortanfang (gebeugte Formen: "rechter" enthält "rechte")
  const eq = (a, b) => a===b || a.replace(/[.,]/g, "")===b.replace(/[.,]/g, "") ||
    (/^[a-zäöüß]{4,}$/.test(b) && a.startsWith(b));
  for(let i=0; i+k.length<=t.length; i++){
    if(k.every((x, n) => eq(t[i+n], x))) return true;
  }
  if(k.length===1 && /^\d+$/.test(k[0])){
    const digits = t.map(x => /^\d+$/.test(x) ? x : "|").join("");
    if(digits.split("|").some(run => run===k[0])) return true;
  }
  return false;
}

const api = { normTokens, normText, hasKey };
if(typeof module === "object" && module.exports) module.exports = api;
else root.BZF_NORM = api;
})(typeof self !== "undefined" ? self : this);
