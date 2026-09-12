#!/usr/bin/env node
/**
 * QA Giorenatto — chequeos automáticos de Etapa 1 (sin dependencias externas).
 *
 * Uso:  node tools/qa/check.mjs        (desde la raíz del repo web)
 * Exit: 0 = todo OK (puede haber WARN), 1 = hay al menos un ERROR.
 *
 * Chequea:
 *  1) productos.json parsea y cada ítem tiene id / nombre / precio / stock.
 *  2) Toda foto referenciada en productos.json existe en disco.
 *  3) index.html tiene un solo <h1>, todas las <img> tienen alt, y los ids
 *     que usa el JS existen en el documento.
 *
 * Extra (WARN, no rompe el build):
 *  - fotos en assets/products que no referencia ningún producto (huérfanas)
 *  - ids duplicados en productos.json
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const errors = [];
const warnings = [];
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const warn = (m) => { warnings.push(m); console.log(`  \x1b[33m!\x1b[0m ${m}`); };
const fail = (m) => { errors.push(m); console.log(`  \x1b[31m✗\x1b[0m ${m}`); };

function section(t) {
  console.log(`\n\x1b[1m${t}\x1b[0m`);
}

// ---------- 1) productos.json ----------
section("1) productos.json");
let productos = null;
try {
  productos = JSON.parse(readFileSync(join(ROOT, "productos.json"), "utf8"));
  ok("productos.json parsea como JSON");
} catch (e) {
  fail(`productos.json no parsea: ${e.message}`);
}

if (Array.isArray(productos)) {
  ok(`es una lista con ${productos.length} ítems`);
  const problemas = [];
  const ids = [];
  const REQUIRED_TEXT = ["id", "nombre"];
  productos.forEach((p, i) => {
    const donde = p && p.id ? p.id : `índice ${i}`;
    if (!p || typeof p !== "object") { problemas.push(`${donde}: no es un objeto`); return; }
    for (const k of REQUIRED_TEXT) {
      if (typeof p[k] !== "string" || !p[k].trim()) problemas.push(`${donde}: falta/ vacío "${k}"`);
    }
    if (typeof p.precio !== "number" || Number.isNaN(p.precio) || p.precio < 0) problemas.push(`${donde}: "precio" inválido (${JSON.stringify(p.precio)})`);
    if (typeof p.stock !== "number" || Number.isNaN(p.stock) || p.stock < 0) problemas.push(`${donde}: "stock" inválido (${JSON.stringify(p.stock)})`);
    if (p.id) ids.push(p.id);
  });
  if (problemas.length === 0) ok("todos los ítems tienen id, nombre, precio y stock válidos");
  else problemas.forEach(fail);

  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail(`ids duplicados: ${[...new Set(dup)].join(", ")}`);
  else ok("no hay ids duplicados");
} else if (productos !== null) {
  fail("productos.json no es una lista (array)");
}

// ---------- 2) fotos referenciadas ----------
section("2) fotos referenciadas existen en disco");
if (Array.isArray(productos)) {
  const refs = new Set();
  for (const p of productos) {
    if (p && typeof p.img === "string" && p.img) refs.add(p.img);
    for (const c of (p && p.colores) || []) if (c && c.foto) refs.add(c.foto);
  }
  const faltantes = [...refs].filter((r) => !existsSync(join(ROOT, r)));
  if (faltantes.length === 0) ok(`las ${refs.size} fotos referenciadas existen`);
  else faltantes.forEach((f) => fail(`falta en disco: ${f}`));

  const dir = join(ROOT, "assets/products");
  if (existsSync(dir)) {
    const enDisco = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).map((f) => `assets/products/${f}`);
    const huerfanas = enDisco.filter((f) => !refs.has(f));
    if (huerfanas.length) warn(`${huerfanas.length} imágenes en assets/products que ningún producto referencia (candidatas a limpiar): ${huerfanas.slice(0, 6).join(", ")}${huerfanas.length > 6 ? ", …" : ""}`);
    else ok(`no hay imágenes huérfanas en assets/products (${enDisco.length} archivos)`);
  }
}

// ---------- 3) index.html ----------
section("3) index.html");
let html = "";
try {
  html = readFileSync(join(ROOT, "index.html"), "utf8");
} catch (e) {
  fail(`no se pudo leer index.html: ${e.message}`);
}

if (html) {
  // 3a) un solo <h1>
  const h1s = html.match(/<h1[\s>]/gi) || [];
  if (h1s.length === 1) ok("tiene exactamente un <h1>");
  else fail(`tiene ${h1s.length} <h1> (se espera exactamente 1)`);

  // 3b) alt en todas las <img>
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const sinAlt = imgs.filter((t) => !/\balt\s*=/.test(t));
  if (sinAlt.length === 0) ok(`todas las <img> tienen atributo alt (${imgs.length} encontradas, HTML estático + plantillas JS)`);
  else sinAlt.slice(0, 8).forEach((t) => fail(`<img> sin alt: ${t.slice(0, 90)}`));

  // 3c) ids que usa el JS existen en el documento
  const usados = new Set();
  const IMPORTANTE = "no se pudieron extraer ids del JS; el checker no está validando nada";
  let m;
  const reId = /getElementById\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  while ((m = reId.exec(html)) !== null) usados.add(m[1]);
  const reSel = /querySelector(?:All)?\(\s*["'`]([^"'`]+)["'`]/g;
  while ((m = reSel.exec(html)) !== null) {
    let idm;
    const reHash = /#([A-Za-z][A-Za-z0-9_-]*)/g;
    while ((idm = reHash.exec(m[1])) !== null) usados.add(idm[1]);
  }
  if (usados.size < 5) fail(IMPORTANTE);
  const definidos = new Set();
  const defRe = /\bid\s*=\s*["']([^"']+)["']/g;
  while ((m = defRe.exec(html)) !== null) definidos.add(m[1]);
  const inexistentes = [...usados].filter((id) => !definidos.has(id));
  if (inexistentes.length === 0) ok(`los ${usados.size} ids que referencia el JS existen en el documento`);
  else inexistentes.forEach((id) => fail(`el JS usa #${id} pero no existe ese id en index.html`));
}

// ---------- resumen ----------
console.log("\n" + "─".repeat(60));
console.log(`\x1b[1mResumen:\x1b[0m ${errors.length} error(es), ${warnings.length} advertencia(s)`);
if (errors.length) {
  console.log("\x1b[31mFALLO\x1b[0m");
  process.exit(1);
}
console.log("\x1b[32mOK\x1b[0m");
process.exit(0);
