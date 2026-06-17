import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { SECTION_ORDER, buildDesignation, getGroup } from '../constants.js';

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  navy: '1A237E',
  navyMid: '283593',
  navyLight: 'C5CAE9',
  green: '1B5E20',
  greenLight: 'E8F5E9',
  greenMid: '2E7D32',
  red: 'B71C1C',
  redLight: 'FFEBEE',
  redMid: 'C62828',
  purple: '4A148C',
  purpleLight: 'EDE7F6',
  purpleMid: '6A1B9A',
  orange: 'E65100',
  orangeLight: 'FFF3E0',
  gray: 'FAFAFA',
  grayMid: 'F0F0F0',
  grayDark: 'BDBDBD',
  black: '212121',
  white: 'FFFFFF',
  charcoal: '424242',
  charcoalLight: 'F5F5F5',
};

const SECTION_COLORS = {
  'Gestion des dettes': C.navy,
  'Charges & frais divers': C.red,
  'Achats marchandises': C.redMid,
  'Dépenses véhicule': C.navy,
  'Paie du personnel': C.redMid,
  "Chiffre d'affaires (CA)": C.greenMid,
  'Trésorerie & divers': C.purpleMid,
};

// Teinte claire utilisée pour les lignes alternées de chaque section
const SECTION_TINTS = {
  [C.navy]: C.navyLight,
  [C.red]: C.redLight,
  [C.redMid]: C.redLight,
  [C.greenMid]: C.greenLight,
  [C.purpleMid]: C.purpleLight,
};

const ff = (size = 11, bold = false, color = C.black, italic = false) => ({
  name: 'Calibri',
  size,
  bold,
  italic,
  color: { argb: 'FF' + color },
});

const bg = (color) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } });

const bd = (color = C.grayDark, style = 'thin') => {
  const s = { style, color: { argb: 'FF' + color } };
  return { top: s, left: s, bottom: s, right: s };
};

// Bordure "total" : double trait au-dessus, comme un total de tableau croisé
const bdTotal = (color = C.grayDark) => ({
  ...bd(color),
  top: { style: 'double', color: { argb: 'FF' + color } },
});

const AL = { horizontal: 'left', vertical: 'middle', wrapText: true };
const AC = { horizontal: 'center', vertical: 'middle', wrapText: true };
const AR = { horizontal: 'right', vertical: 'middle' };

const DA_FMT = '#,##0 "DA"';
const PCT_FMT = '0.0%';

function mergeTitle(ws, row, col1, col2, text, fontOpts, fillOpts, height = 30) {
  ws.mergeCells(row, col1, row, col2);
  const cell = ws.getCell(row, col1);
  cell.value = text;
  cell.font = fontOpts;
  cell.fill = fillOpts;
  cell.alignment = AC;
  ws.getRow(row).height = height;
}

// ─── Helpers de regroupement ───────────────────────────────────────────────
function groupByDesignation(transactions) {
  const map = new Map();
  for (const t of transactions) {
    const designation = buildDesignation(t.group_id, t.name);
    if (!map.has(designation)) map.set(designation, { designation, entree: 0, sortie: 0 });
    const row = map.get(designation);
    row.entree += t.entree || 0;
    row.sortie += t.sortie || 0;
  }
  return [...map.values()].sort((a, b) => a.designation.localeCompare(b.designation, 'fr'));
}

// ─── SHEET 1 : RAPPORT DE GESTION ──────────────────────────────────────────
function buildRapportSheet(wb, transactions, user) {
  const ws = wb.addWorksheet('Rapport de Gestion', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true },
    views: [{ rightToLeft: false }],
  });

  ws.columns = [{ width: 36 }, { width: 18 }, { width: 18 }, { width: 18 }];

  const now = new Date();
  mergeTitle(
    ws,
    1,
    1,
    4,
    `RAPPORT DE GESTION — ${(user?.name || '').toUpperCase() || 'HANOUT'}`,
    ff(15, true, C.white),
    bg(C.navy),
    36
  );
  mergeTitle(
    ws,
    2,
    1,
    4,
    `Généré le ${now.toLocaleDateString('fr-DZ', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`,
    ff(9, false, C.navyLight, true),
    bg(C.navyMid),
    20
  );

  let row = 4;

  // ── KPI globaux ────────────────────────────────────────────────────────
  const totalEntree = transactions.reduce((s, t) => s + (t.entree || 0), 0);
  const totalSortie = transactions.reduce((s, t) => s + (t.sortie || 0), 0);
  const solde = totalEntree - totalSortie;

  ws.mergeCells(row, 1, row, 4);
  const kpiTitle = ws.getCell(row, 1);
  kpiTitle.value = '📊  RÉSUMÉ GÉNÉRAL';
  kpiTitle.font = ff(10, true, C.white);
  kpiTitle.fill = bg(C.navyMid);
  kpiTitle.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws.getRow(row).height = 20;
  row++;

  const kpiHdr = ws.getRow(row);
  kpiHdr.height = 20;
  ['Total Entrées (DA)', 'Total Sorties (DA)', 'Solde Net (DA)'].forEach((h, i) => {
    const c = kpiHdr.getCell(i + 2);
    c.value = h;
    c.font = ff(10, true, C.white);
    c.fill = bg(C.navyMid);
    c.alignment = AC;
    c.border = bd(C.navy);
  });
  kpiHdr.getCell(1).fill = bg(C.navyMid);
  kpiHdr.getCell(1).border = bd(C.navy);
  row++;

  const kpiVal = ws.getRow(row);
  kpiVal.height = 32;
  kpiVal.getCell(1).fill = bg(C.gray);
  kpiVal.getCell(1).border = bd(C.grayDark);
  [
    { v: totalEntree, color: C.greenMid },
    { v: totalSortie, color: C.redMid },
    { v: solde, color: solde >= 0 ? C.greenMid : C.redMid },
  ].forEach((k, i) => {
    const c = kpiVal.getCell(i + 2);
    c.value = k.v;
    c.numFmt = DA_FMT;
    c.font = ff(13, true, k.color);
    c.fill = bg(C.gray);
    c.alignment = AC;
    c.border = bd(C.grayDark);
  });
  row += 2;

  if (transactions.length === 0) {
    ws.mergeCells(row, 1, row, 4);
    const c = ws.getCell(row, 1);
    c.value = 'Aucune transaction enregistrée pour le moment.';
    c.font = ff(11, false, C.black, true);
    c.alignment = AC;
    ws.getRow(row).height = 28;
    return;
  }

  // ── Sections par groupe (Désignation) ────────────────────────────────────
  for (const section of SECTION_ORDER) {
    const sectionTx = transactions.filter((t) => getGroup(t.group_id).section === section);
    if (sectionTx.length === 0) continue;

    const color = SECTION_COLORS[section] || C.navy;
    const grouped = groupByDesignation(sectionTx);

    // Bandeau titre
    mergeTitle(ws, row, 1, 3, section.toUpperCase(), ff(11, true, C.white), bg(color), 24);
    row++;

    // En-têtes colonnes
    const hdr = ws.getRow(row);
    hdr.height = 22;
    ['Désignation', 'SUM de Entrée (DA)', 'SUM de Sortie (DA)'].forEach((h, i) => {
      const c = hdr.getCell(i + 1);
      c.value = h;
      c.font = ff(10, true, C.white);
      c.fill = bg(color);
      c.alignment = i === 0 ? AL : AC;
      c.border = bd(color);
    });
    row++;

    // Lignes de données
    const tint = SECTION_TINTS[color] || C.gray;
    let secTotalEntree = 0;
    let secTotalSortie = 0;
    grouped.forEach((g, idx) => {
      secTotalEntree += g.entree;
      secTotalSortie += g.sortie;
      const r = ws.getRow(row);
      r.height = 20;
      const fillC = idx % 2 === 0 ? tint : C.white;

      const cells = [
        { v: g.designation, fmt: null, al: AL, bold: true, color: C.black },
        { v: g.entree, fmt: DA_FMT, al: AR, bold: false, color: C.greenMid },
        { v: g.sortie, fmt: DA_FMT, al: AR, bold: false, color: C.redMid },
      ];
      cells.forEach((d, i) => {
        const c = r.getCell(i + 1);
        c.value = d.v;
        if (d.fmt) c.numFmt = d.fmt;
        c.font = ff(10, d.bold, d.color);
        c.fill = bg(fillC);
        c.alignment = d.al;
        c.border = bd(C.grayDark);
      });
      row++;
    });

    // Total général — style sobre avec double trait, comme un total de TCD
    const tr = ws.getRow(row);
    tr.height = 22;
    const tCells = [
      { v: 'Total général', fmt: null, al: AL, color: C.black },
      { v: secTotalEntree, fmt: DA_FMT, al: AR, color: C.greenMid },
      { v: secTotalSortie, fmt: DA_FMT, al: AR, color: C.redMid },
    ];
    tCells.forEach((d, i) => {
      const c = tr.getCell(i + 1);
      c.value = d.v;
      if (d.fmt) c.numFmt = d.fmt;
      c.font = ff(10, true, d.color);
      c.fill = bg(C.grayMid);
      c.alignment = d.al;
      c.border = bdTotal(C.grayDark);
    });
    row += 2; // ligne vide
  }
}

// ─── SHEET 2 : RÉPARTITION DES SORTIES ─────────────────────────────────────
function buildRepartitionSheet(wb, transactions) {
  const ws = wb.addWorksheet('Répartition Sorties', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true },
  });

  ws.columns = [{ width: 36 }, { width: 18 }, { width: 14 }];

  mergeTitle(
    ws,
    1,
    1,
    3,
    'SUM DE SORTIE (DA) PAR DÉSIGNATION',
    ff(13, true, C.white),
    bg(C.navy),
    32
  );
  mergeTitle(
    ws,
    2,
    1,
    3,
    'Le diagramme circulaire ci-contre est généré automatiquement à partir de ce tableau.',
    ff(9, false, C.navyLight, true),
    bg(C.navyMid),
    28
  );

  const grouped = groupByDesignation(transactions)
    .filter((g) => g.sortie > 0)
    .sort((a, b) => b.sortie - a.sortie);

  const totalSortie = grouped.reduce((s, g) => s + g.sortie, 0);

  let row = 4;
  const hdr = ws.getRow(row);
  hdr.height = 22;
  ['Désignation', 'SUM de Sortie (DA)', '% du total'].forEach((h, i) => {
    const c = hdr.getCell(i + 1);
    c.value = h;
    c.font = ff(10, true, C.white);
    c.fill = bg(C.navyMid);
    c.alignment = i === 0 ? AL : AC;
    c.border = bd(C.navy);
  });
  ws.views = [{ state: 'frozen', ySplit: row }];
  row++;

  if (grouped.length === 0) {
    ws.mergeCells(row, 1, row, 3);
    const c = ws.getCell(row, 1);
    c.value = 'Aucune sortie enregistrée.';
    c.font = ff(10, false, C.black, true);
    c.alignment = AC;
    return null;
  }

  const firstDataRow = row;

  grouped.forEach((g, idx) => {
    const r = ws.getRow(row);
    r.height = 20;
    const fillC = idx % 2 === 0 ? C.redLight : C.white;
    const pct = totalSortie > 0 ? g.sortie / totalSortie : 0;

    const cells = [
      { v: g.designation, fmt: null, al: AL, bold: true },
      { v: g.sortie, fmt: DA_FMT, al: AR, bold: true },
      { v: pct, fmt: PCT_FMT, al: AC, bold: false },
    ];
    cells.forEach((d, i) => {
      const c = r.getCell(i + 1);
      c.value = d.v;
      if (d.fmt) c.numFmt = d.fmt;
      c.font = ff(10, d.bold, C.black);
      c.fill = bg(fillC);
      c.alignment = d.al;
      c.border = bd(C.grayDark);
    });
    row++;
  });

  const tr = ws.getRow(row);
  tr.height = 22;
  const tCells = [
    { v: 'TOTAL GÉNÉRAL', al: AL },
    { v: totalSortie, fmt: DA_FMT, al: AR },
    { v: 1, fmt: PCT_FMT, al: AC },
  ];
  tCells.forEach((d, i) => {
    const c = tr.getCell(i + 1);
    c.value = d.v;
    if (d.fmt) c.numFmt = d.fmt;
    c.font = ff(10, true, C.white);
    c.fill = bg(C.redMid);
    c.alignment = d.al;
    c.border = bd(C.red);
  });

  return {
    sheetName: ws.name,
    firstRow: firstDataRow,
    lastRow: firstDataRow + grouped.length - 1,
    categories: grouped.map((g) => g.designation),
    values: grouped.map((g) => g.sortie),
    title: 'SUM de Sortie (DA) par rapport à Désignation',
  };
}

// ─── SHEET 3 : LÉGENDE (FR / AR) ────────────────────────────────────────────
const LEGEND_ROWS = [
  [
    'Salaire – [NOM]',
    "Salaire mensuel versé à l'employé [NOM].\nأجرة وراتب العامل [الاسم] كل شهر.",
  ],
  [
    'Approvisionnement de caisse',
    "Argent ajouté à la caisse (ou retiré) pour des dépenses personnelles / externes.\nالدراهم اللي تزيدها للكاسة، ولا تسحبها منها للمصاريف الخاصة من برا المحل.",
  ],
  [
    'RAS (Rien à signaler)',
    "À utiliser quand aucune opération n'a eu lieu ce jour-là.\nتكتب \"RAS\" إذا ما كان حتى دخل ولا خرج فهاد النهار.",
  ],
  [
    'Impôts – Taxes',
    "Paiements liés aux impôts et taxes (CASNOS, IFU, droits...).\nكل المصاريف المتعلقة بالضرائب والرسوم (الكاسنوس، الضريبة الجزافية...).",
  ],
  [
    'Sortie – [NOM]',
    "Charges courantes et frais divers du magasin : électricité, internet, loyer, sponsoring, zakat...\nالمصاريف الأساسية للمحل: الكهرباء، الأنترنيت، الكراء، الزكاة وغيرها.",
  ],
  [
    'Achat – [NOM]',
    "Achat de marchandises auprès d'un fournisseur (désigné par son nom).\nشراء البضاعة من عند مورد معيّن، يُكتب اسمه.",
  ],
  [
    'Dette – [NOM]',
    "Dette envers une personne, ou créance d'une personne envers le magasin (désignée par son nom).\nالديون: فلوس عليك ولا لك مع شخص معيّن، تكتب اسمه.",
  ],
  [
    '[Action] – Véhicule\n(Achat, Documents, Vidange, Tôlier, Vignette, Vente...)',
    "Toutes les dépenses (ou recettes) liées au véhicule du magasin.\nكل مصاريف (أو مداخيل) السيارة: وثائق، فيدانج، طولي، فينييت، بيع...",
  ],
  [
    'Recette / Recette soir',
    "Chiffre d'affaires (entrées de caisse) de la journée, matin et soir.\nمداخيل اليوم (رقم الأعمال)، صباحًا ومساءً.",
  ],
];

function buildLegendSheet(wb) {
  const ws = wb.addWorksheet('Légende', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true },
  });

  ws.columns = [{ width: 34 }, { width: 60 }];

  mergeTitle(
    ws,
    1,
    1,
    2,
    'GUIDE DES DÉSIGNATIONS — دليل التصنيفات',
    ff(13, true, C.white),
    bg(C.charcoal),
    32
  );

  const hdr = ws.getRow(2);
  hdr.height = 26;
  ['Désignation / التصنيف', '(Explication) واش يعني'].forEach((h, i) => {
    const c = hdr.getCell(i + 1);
    c.value = h;
    c.font = ff(11, true, C.white);
    c.fill = bg(C.charcoal);
    c.alignment = AC;
    c.border = bd(C.charcoal);
  });

  let row = 3;
  LEGEND_ROWS.forEach(([designation, explication], idx) => {
    const r = ws.getRow(row);
    r.height = 56;
    const fillC = idx % 2 === 0 ? C.charcoalLight : C.white;

    const c1 = r.getCell(1);
    c1.value = designation;
    c1.font = ff(10, true, C.black);
    c1.fill = bg(fillC);
    c1.alignment = AL;
    c1.border = bd(C.grayDark);

    const c2 = r.getCell(2);
    c2.value = explication;
    c2.font = ff(10, false, C.black);
    c2.fill = bg(fillC);
    c2.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
    c2.border = bd(C.grayDark);

    row++;
  });
}

// ─── CAMEMBERT NATIF (injection XML post-génération) ───────────────────────
// ExcelJS ne sait pas créer de graphiques natifs : on génère le classeur
// normalement, puis on injecte les parties OOXML d'un graphique secteurs
// directement dans le zip (drawing + chart liés à la feuille "Répartition").
function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildChartXml({ sheetName, firstRow, lastRow, categories, values, title }) {
  const catRef = `'${sheetName}'!$A$${firstRow}:$A$${lastRow}`;
  const valRef = `'${sheetName}'!$B$${firstRow}:$B$${lastRow}`;
  const n = categories.length;
  const catPts = categories
    .map((cat, i) => `<c:pt idx="${i}"><c:v>${escapeXml(cat)}</c:v></c:pt>`)
    .join('');
  const valPts = values.map((v, i) => `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<c:chart>
<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1100" b="1"/></a:pPr><a:r><a:rPr lang="fr-FR" sz="1100" b="1"/><a:t>${escapeXml(title)}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>
<c:autoTitleDeleted val="0"/>
<c:plotArea>
<c:layout/>
<c:pieChart>
<c:varyColors val="1"/>
<c:ser>
<c:idx val="0"/>
<c:order val="0"/>
<c:dLbls>
<c:numFmt formatCode="0.0%" sourceLinked="0"/>
<c:showLegendKey val="0"/>
<c:showVal val="0"/>
<c:showCatName val="0"/>
<c:showSerName val="0"/>
<c:showPercent val="1"/>
<c:showBubbleSize val="0"/>
</c:dLbls>
<c:cat><c:strRef><c:f>${catRef}</c:f><c:strCache><c:ptCount val="${n}"/>${catPts}</c:strCache></c:strRef></c:cat>
<c:val><c:numRef><c:f>${valRef}</c:f><c:numCache><c:formatCode>#,##0 "DA"</c:formatCode><c:ptCount val="${n}"/>${valPts}</c:numCache></c:numRef></c:val>
</c:ser>
<c:firstSliceAng val="0"/>
</c:pieChart>
</c:plotArea>
<c:legend><c:legendPos val="r"/><c:overlay val="0"/></c:legend>
<c:plotVisOnly val="1"/>
</c:chart>
</c:chartSpace>`;
}

const DRAWING_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<xdr:twoCellAnchor>
<xdr:from><xdr:col>3</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
<xdr:to><xdr:col>11</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>22</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
<xdr:graphicFrame macro="">
<xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="Graphique Répartition"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>
<xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
<a:graphic>
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/>
</a:graphicData>
</a:graphic>
</xdr:graphicFrame>
<xdr:clientData/>
</xdr:twoCellAnchor>
</xdr:wsDr>`;

const DRAWING_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/></Relationships>`;

const SHEET_DRAWING_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`;

async function injectPieChart(buffer, chart) {
  if (!chart || chart.categories.length === 0) return buffer;

  const zip = await JSZip.loadAsync(buffer);

  // Repère le fichier XML correspondant à la feuille "Répartition Sorties"
  const workbookXml = await zip.file('xl/workbook.xml').async('string');
  const sheetTagMatch = workbookXml.match(
    new RegExp(`<sheet[^>]*name="${escapeRegExp(chart.sheetName)}"[^>]*/>`)
  );
  const ridMatch = sheetTagMatch?.[0]?.match(/r:id="(rId\d+)"/);
  if (!ridMatch) return buffer;

  const wbRelsXml = await zip.file('xl/_rels/workbook.xml.rels').async('string');
  const relMatch = wbRelsXml.match(new RegExp(`<Relationship Id="${ridMatch[1]}"[^>]*Target="([^"]+)"`));
  if (!relMatch) return buffer;
  const sheetPath = `xl/${relMatch[1]}`;
  const sheetFile = sheetPath.split('/').pop();

  // Lie la feuille à un nouveau dessin contenant le graphique
  const sheetXml = await zip.file(sheetPath).async('string');
  zip.file(sheetPath, sheetXml.replace('</worksheet>', '<drawing r:id="rId1"/></worksheet>'));
  zip.file(`xl/worksheets/_rels/${sheetFile}.rels`, SHEET_DRAWING_RELS_XML);

  zip.file('xl/drawings/drawing1.xml', DRAWING_XML);
  zip.file('xl/drawings/_rels/drawing1.xml.rels', DRAWING_RELS_XML);
  zip.file('xl/charts/chart1.xml', buildChartXml(chart));

  const contentTypesXml = await zip.file('[Content_Types].xml').async('string');
  const overrides =
    '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' +
    '<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>';
  zip.file('[Content_Types].xml', contentTypesXml.replace('</Types>', overrides + '</Types>'));

  return zip.generateAsync({ type: 'nodebuffer' });
}

// ─── EXPORT PRINCIPAL ──────────────────────────────────────────────────────
export async function generateRapportExcel(transactions, user) {
  const wb = new ExcelJS.Workbook();
  wb.creator = user?.name || 'Hanout App';
  wb.created = new Date();
  wb.modified = new Date();

  buildRapportSheet(wb, transactions, user);
  const chart = buildRepartitionSheet(wb, transactions);
  buildLegendSheet(wb);

  const buffer = await wb.xlsx.writeBuffer();
  return injectPieChart(buffer, chart);
}
