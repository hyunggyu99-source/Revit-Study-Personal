/**
 * Revit / EnergyPlus / OpenStudio HTML Report Parser v4
 * ======================================================
 * Designed for actual OpenStudio Results + EnergyPlus tabular HTML:
 *   - Uses <!-- FullName:... --> comments to identify tables precisely
 *   - Handles &nbsp; as empty values, <td> headers (no <th>)
 *   - Distinguishes Facility vs AirLoop vs Zone-level peak loads
 *   - Supports: K-HVAC Systems, Annual Building, Facility Component Load Summary
 */
// eslint-disable-next-line no-unused-vars
var RevitParser = (function () {
  'use strict';

  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* ====================== SI Conversion ====================== */
  var SI_CONV = {
    'ft2':       { to: 'm\u00B2',      factor: 0.092903 },
    'ft3':       { to: 'm\u00B3',      factor: 0.028317 },
    'Btu/h':     { to: 'W',            factor: 0.293071 },
    'kBtu':      { to: 'kWh',          factor: 0.293071 },
    'kWh':       { to: 'kWh',          factor: 1 },
    'therms':    { to: 'kWh',          factor: 29.3071 },
    'Btu/h-ft2': { to: 'W/m\u00B2',   factor: 3.15459 },
    'gal':       { to: 'L',            factor: 3.78541 }
  };

  function convertValueSI(value, unitStr) {
    if (typeof value !== 'number' || value === 0) return { value: value, unit: unitStr };
    for (var key in SI_CONV) {
      if (unitStr && unitStr.indexOf(key) !== -1) {
        return { value: value * SI_CONV[key].factor, unit: unitStr.replace(key, SI_CONV[key].to) };
      }
    }
    return { value: value, unit: unitStr };
  }

  function convertHeaderSI(header) {
    if (!header) return header;
    var result = header;
    for (var key in SI_CONV) {
      if (header.indexOf('[' + key + ']') !== -1) {
        result = result.replace('[' + key + ']', '[' + SI_CONV[key].to + ']');
      }
    }
    return result;
  }

  /* ====================== Main parse ====================== */
  function parse(htmlText, fileName) {
    var doc = new DOMParser().parseFromString(htmlText, 'text/html');
    var report = createEmpty(fileName);

    // Primary: use FullName comments to map tables
    parseByComments(doc, htmlText, report);

    // Secondary: script-embedded chart data (Highcharts / dimple)
    parseScriptData(doc, htmlText, report);

    // Fallback: heuristic scan
    if (isEmpty(report)) parseFallback(doc, report);

    // Metadata
    parseMeta(doc, report);

    // Detect design-day simulation
    if (/Values gathered over\s+0\.00 hours/i.test(htmlText) ||
        /DOES NOT REPRESENT A FULL ANNUAL SIMULATION/i.test(htmlText)) {
      report.isDesignDay = true;
    }

    computeTotals(report);
    return report;
  }

  function createEmpty(fileName) {
    return {
      fileName: fileName || 'Unknown',
      reportType: '', facility: '', timestamp: '', building: '', environment: '',
      parsedAt: new Date().toISOString(),
      peakLoads: { cooling: [], heating: [] },
      zonePeakLoads: {},
      airloopPeakLoads: { cooling: [], heating: [] },
      zones: [],
      spaces: [],
      monthly: { electricity: {}, naturalGas: {}, districtCooling: {}, districtHeating: {} },
      endUses: { main: [], bySubcategory: [], bySpaceType: [] },
      annual: {},
      // HVAC-specific data
      equipment: {},      // { centralPlant:[], coolingCoils:[], heatingCoils:[], fans:[], pumps:[] }
      hvacSizing: {},     // { zoneCooling:[], zoneHeating:[], systemAirFlow:[], coilSizing:[] }
      coilDetails: [],
      outdoorAir: {},     // { average:[], minimum:[], mechVentByZone:[], totalByZone:[], byAirLoop:[] }
      standard621: {},    // { sysCooling:[], sysHeating:[], zoneParams:[], sysParams:[] }
      envelope: {},       // { opaqueExterior:[], exteriorFenestration:[], exteriorDoor:[] }
      sensibleHeatGain: {},// { annual:[], peakCooling:[], peakHeating:[] }
      peakConditions: {},  // { coolingFacility:[], heatingFacility:[], coolingAirloop:[], heatingAirloop:[] }
      engineeringChecks: {},
      otherTables: [],
      warnings: []
    };
  }

  function isEmpty(r) {
    return r.peakLoads.cooling.length === 0 && r.peakLoads.heating.length === 0 &&
      r.zones.length === 0 && r.endUses.main.length === 0 &&
      Object.keys(r.monthly.electricity).length === 0 &&
      Object.keys(r.equipment).length === 0;
  }

  /* ====================== Strategy 1: FullName Comment-based ====================== */
  function parseByComments(doc, htmlText, report) {
    // Find all <!-- FullName:...--> comments and the next <table>
    var commentPattern = /<!--\s*FullName:(.*?)-->/g;
    var match;
    var commentMap = []; // { fullName, index }

    while ((match = commentPattern.exec(htmlText)) !== null) {
      commentMap.push({ fullName: match[1].trim(), index: match.index });
    }

    if (commentMap.length === 0) return; // Not an EnergyPlus report

    // Get all tables in DOM order
    var allTables = doc.querySelectorAll('table');
    // For each table, find its preceding FullName comment
    // We use the HTML comment approach: parse the outerHTML position

    // Alternative: walk siblings of each comment node
    // More reliable: for each table, check if preceding sibling or preceding comment matches
    // Let's use a simpler approach: for each FullName comment, find the next table after it

    var tableElements = [];
    for (var ti = 0; ti < allTables.length; ti++) {
      tableElements.push(allTables[ti]);
    }

    // Map comments to tables by checking which table comes after each comment
    // We'll use the text content position in the HTML
    for (var ci = 0; ci < commentMap.length; ci++) {
      var cm = commentMap[ci];
      var fn = cm.fullName;

      // Find the table element that follows this comment
      // Strategy: look for the table whose HTML appears after the comment
      var tableAfter = findTableAfterComment(doc, fn);
      if (!tableAfter) continue;

      var parsed = parseTableGeneric(tableAfter);
      if (!parsed || parsed.headers.length < 2 || parsed.rows.length === 0) continue;

      classifyByFullName(fn, parsed, report);
    }
  }

  function findTableAfterComment(doc, fullName) {
    // Walk all comment nodes to find the matching one, then find next table sibling
    var walker = doc.createTreeWalker(doc.body || doc, NodeFilter.SHOW_COMMENT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var txt = node.textContent.trim();
      if (txt.indexOf('FullName:') === 0 || txt.indexOf(' FullName:') === 0) {
        var cmName = txt.replace(/^\s*FullName:\s*/, '').trim();
        if (cmName === fullName) {
          // Find next sibling table
          var sibling = node.nextSibling;
          while (sibling) {
            if (sibling.nodeType === 1 && sibling.tagName === 'TABLE') return sibling;
            if (sibling.nodeType === 1 && sibling.querySelector) {
              var inner = sibling.querySelector('table');
              if (inner) return inner;
            }
            sibling = sibling.nextSibling;
          }
        }
      }
    }
    return null;
  }

  function classifyByFullName(fullName, parsed, report) {
    var fn = fullName.toLowerCase();
    var objs = toObjects(parsed);

    // Facility Component Load Summary
    if (/facility component load summary.*estimated cooling/i.test(fn)) {
      report.peakLoads.cooling = objs;
      return;
    }
    if (/facility component load summary.*estimated heating/i.test(fn)) {
      report.peakLoads.heating = objs;
      return;
    }

    // AirLoop Component Load Summary
    if (/airloop component load summary.*estimated cooling/i.test(fn)) {
      report.airloopPeakLoads.cooling = objs;
      return;
    }
    if (/airloop component load summary.*estimated heating/i.test(fn)) {
      report.airloopPeakLoads.heating = objs;
      return;
    }

    // Zone Component Load Summary (per-zone)
    var zoneMatch = fullName.match(/Zone Component Load Summary_(.*?)_Estimated (Cooling|Heating)/i);
    if (zoneMatch) {
      var zoneName = zoneMatch[1].trim();
      var loadType = zoneMatch[2].toLowerCase();
      if (!report.zonePeakLoads[zoneName]) report.zonePeakLoads[zoneName] = { cooling: [], heating: [] };
      report.zonePeakLoads[zoneName][loadType] = objs;
      return;
    }

    // Input Verification - Zone Summary (preferred over Initialization Summary)
    if (/input verification.*zone summary/i.test(fn)) {
      report.zones = objs;
      return;
    }
    // Input Verification - Space Summary
    if (/input verification.*space summary/i.test(fn)) {
      report.spaces = objs;
      return;
    }

    // Initialization Summary - Zone Summary (fallback)
    if (/initialization summary.*zone summary/i.test(fn) && report.zones.length === 0) {
      report.zones = objs;
      return;
    }

    // Annual Building - Site and Source Energy
    if (/annual building.*site and source energy/i.test(fn)) {
      for (var j = 0; j < objs.length; j++) {
        if (/total\s*site\s*energy/i.test(objs[j]._name || '')) {
          report.annual.totalSiteEnergy = objs[j]['Total Energy [kBtu]'] || objs[j]['Total Energy [GJ]'] || 0;
          report.annual.eui = objs[j]['Energy Per Conditioned Building Area [kBtu/ft2]'] || 0;
        }
      }
      return;
    }

    // Annual Building - Building Area
    if (/annual building.*building area/i.test(fn)) {
      for (var ja = 0; ja < objs.length; ja++) {
        if (/conditioned/i.test(objs[ja]._name || '')) {
          report.annual.buildingArea = objs[ja]['Area [ft2]'] || objs[ja]['Area [m2]'] || 0;
        }
      }
      return;
    }

    // Annual Building - End Uses (first occurrence = energy, not demand)
    if (/annual building utility.*_end uses$/i.test(fn)) {
      if (report.endUses.main.length === 0) report.endUses.main = objs;
      return;
    }
    if (/annual building utility.*end uses by subcategory/i.test(fn)) {
      if (report.endUses.bySubcategory.length === 0) report.endUses.bySubcategory = objs;
      return;
    }
    if (/annual building utility.*end uses by space type/i.test(fn)) {
      if (report.endUses.bySpaceType.length === 0) report.endUses.bySpaceType = objs;
      return;
    }

    // ===== Equipment Summary =====
    if (/equipment summary.*central plant/i.test(fn)) { report.equipment.centralPlant = objs; return; }
    if (/equipment summary.*cooling coils$/i.test(fn)) { report.equipment.coolingCoils = objs; return; }
    if (/equipment summary.*heating coils$/i.test(fn)) { report.equipment.heatingCoils = objs; return; }
    if (/equipment summary.*fans$/i.test(fn)) { report.equipment.fans = objs; return; }
    if (/equipment summary.*pumps$/i.test(fn)) { report.equipment.pumps = objs; return; }
    if (/equipment summary.*service water/i.test(fn)) { report.equipment.serviceWater = objs; return; }

    // ===== HVAC Sizing Summary =====
    if (/hvac sizing.*zone sensible cooling/i.test(fn)) { report.hvacSizing.zoneCooling = objs; return; }
    if (/hvac sizing.*zone sensible heating/i.test(fn)) { report.hvacSizing.zoneHeating = objs; return; }
    if (/hvac sizing.*system design air flow/i.test(fn)) { report.hvacSizing.systemAirFlow = objs; return; }
    if (/hvac sizing.*coil sizing summary/i.test(fn)) { report.hvacSizing.coilSizing = objs; return; }
    if (/hvac sizing.*plant loop/i.test(fn)) { report.hvacSizing.plantLoop = objs; return; }

    // ===== Coil Sizing Details =====
    if (/coil sizing details.*coils/i.test(fn)) { report.coilDetails = objs; return; }

    // ===== Outdoor Air =====
    if (/outdoor air summary.*average/i.test(fn)) { report.outdoorAir.average = objs; return; }
    if (/outdoor air summary.*minimum/i.test(fn)) { report.outdoorAir.minimum = objs; return; }
    if (/outdoor air details.*mechanical ventilation/i.test(fn)) { report.outdoorAir.mechVentByZone = objs; return; }
    if (/outdoor air details.*total outdoor air by zone/i.test(fn)) { report.outdoorAir.totalByZone = objs; return; }
    if (/outdoor air details.*average.*by zone/i.test(fn)) { report.outdoorAir.avgByZone = objs; return; }
    if (/outdoor air details.*total outdoor air by airloop/i.test(fn)) { report.outdoorAir.totalByAirLoop = objs; return; }
    if (/outdoor air details.*average.*by airloop/i.test(fn)) { report.outdoorAir.avgByAirLoop = objs; return; }

    // ===== Standard 62.1 =====
    if (/standard 62.*system ventilation.*cooling/i.test(fn)) { report.standard621.sysCooling = objs; return; }
    if (/standard 62.*system ventilation.*heating/i.test(fn)) { report.standard621.sysHeating = objs; return; }
    if (/standard 62.*zone ventilation param/i.test(fn)) { report.standard621.zoneParams = objs; return; }
    if (/standard 62.*system ventilation param/i.test(fn)) { report.standard621.sysParams = objs; return; }
    if (/standard 62.*zone ventilation calc.*cooling/i.test(fn)) { report.standard621.zoneCalcCooling = objs; return; }
    if (/standard 62.*zone ventilation calc.*heating/i.test(fn)) { report.standard621.zoneCalcHeating = objs; return; }

    // ===== Envelope Summary =====
    if (/envelope summary.*opaque exterior/i.test(fn)) { report.envelope.opaqueExterior = objs; return; }
    if (/envelope summary.*opaque interior/i.test(fn)) { report.envelope.opaqueInterior = objs; return; }
    if (/envelope summary.*exterior fenestration$/i.test(fn)) { report.envelope.exteriorFenestration = objs; return; }
    if (/envelope summary.*exterior door/i.test(fn)) { report.envelope.exteriorDoor = objs; return; }

    // ===== Sensible Heat Gain Summary =====
    if (/sensible heat gain.*peak cooling/i.test(fn)) { report.sensibleHeatGain.peakCooling = objs; return; }
    if (/sensible heat gain.*peak heating/i.test(fn)) { report.sensibleHeatGain.peakHeating = objs; return; }
    if (/sensible heat gain.*annual/i.test(fn)) { report.sensibleHeatGain.annual = objs; return; }

    // ===== Peak Conditions / Engineering Checks =====
    if (/facility component.*cooling peak conditions/i.test(fn)) { report.peakConditions.coolingFacility = objs; return; }
    if (/facility component.*heating peak conditions/i.test(fn)) { report.peakConditions.heatingFacility = objs; return; }
    if (/facility component.*engineering.*cooling/i.test(fn)) { report.engineeringChecks.coolingFacility = objs; return; }
    if (/facility component.*engineering.*heating/i.test(fn)) { report.engineeringChecks.heatingFacility = objs; return; }

    // ===== Component Sizing Summary =====
    if (/component sizing summary.*airloophvac/i.test(fn)) {
      if (!report.hvacSizing.airLoopHVAC) report.hvacSizing.airLoopHVAC = [];
      report.hvacSizing.airLoopHVAC = report.hvacSizing.airLoopHVAC.concat(objs); return;
    }
    if (/component sizing summary.*chiller/i.test(fn)) {
      if (!report.hvacSizing.chiller) report.hvacSizing.chiller = [];
      report.hvacSizing.chiller = report.hvacSizing.chiller.concat(objs); return;
    }
    if (/component sizing summary.*boiler/i.test(fn)) {
      if (!report.hvacSizing.boiler) report.hvacSizing.boiler = [];
      report.hvacSizing.boiler = report.hvacSizing.boiler.concat(objs); return;
    }

    // Monthly tables
    if (hasMonthHeaders(parsed.headers)) {
      parseMonthlyRows(parsed, report);
    }
  }

  /* ====================== Generic Table Parser ====================== */
  function parseTableGeneric(table) {
    var trs = table.querySelectorAll('tr');
    if (trs.length < 2) return null;

    var headerCells = trs[0].querySelectorAll('td, th');
    var headers = [];
    for (var h = 0; h < headerCells.length; h++) {
      headers.push(cleanText(headerCells[h]));
    }

    var rows = [];
    for (var r = 1; r < trs.length; r++) {
      var cells = trs[r].querySelectorAll('td, th');
      var rowData = [];
      for (var c = 0; c < cells.length; c++) {
        rowData.push(cleanText(cells[c]));
      }
      if (rowData.length >= 2 && rowData.some(function(v){ return v !== ''; })) {
        rows.push(rowData);
      }
    }
    return { headers: headers, rows: rows };
  }

  function cleanText(el) {
    // Handle &nbsp; and whitespace
    var txt = el.textContent || '';
    txt = txt.replace(/\u00a0/g, '').replace(/&nbsp;/g, '').trim();
    return txt;
  }

  function toObjects(parsed) {
    var results = [];
    for (var r = 0; r < parsed.rows.length; r++) {
      var obj = {};
      var row = parsed.rows[r];
      for (var c = 0; c < parsed.headers.length && c < row.length; c++) {
        var header = parsed.headers[c];
        if (!header && c === 0) header = '';  // first col = name column
        else if (!header) header = 'Col' + c;
        var val = row[c];
        if (c === 0) {
          obj._name = val;
          obj[''] = val;
        } else {
          var numStr = val.replace(/,/g, '');
          if (numStr !== '' && !isNaN(parseFloat(numStr)) && /[\d]/.test(numStr)) {
            obj[header] = parseFloat(numStr);
          } else {
            obj[header] = val === '' ? 0 : val;
          }
        }
      }
      results.push(obj);
    }
    return results;
  }

  /* ====================== Monthly ====================== */
  function hasMonthHeaders(headers) {
    var count = 0;
    for (var i = 0; i < headers.length; i++) {
      for (var m = 0; m < MONTHS.length; m++) {
        if (headers[i].toLowerCase().indexOf(MONTHS[m].toLowerCase()) === 0) { count++; break; }
      }
    }
    return count >= 6;
  }

  function parseMonthlyRows(parsed, report) {
    var monthCols = {};
    for (var h = 0; h < parsed.headers.length; h++) {
      for (var m = 0; m < MONTHS.length; m++) {
        if (parsed.headers[h].toLowerCase().indexOf(MONTHS[m].toLowerCase()) === 0) { monthCols[m] = h; break; }
      }
    }
    for (var r = 0; r < parsed.rows.length; r++) {
      var row = parsed.rows[r];
      var key = normCatKey(row[0] || '');
      if (!key) continue;
      var data = [];
      for (var mi = 0; mi < 12; mi++) {
        var ci = monthCols[mi];
        data.push(ci !== undefined && row[ci] ? (parseFloat(row[ci].replace(/,/g, '')) || 0) : 0);
      }
      if (!report.monthly.electricity[key]) report.monthly.electricity[key] = data;
    }
  }

  /* ====================== Strategy 2: Script Data ====================== */
  function parseScriptData(doc, htmlText, report) {
    var scripts = doc.querySelectorAll('script');
    var allScript = '';
    for (var i = 0; i < scripts.length; i++) allScript += scripts[i].textContent + '\n';
    if (!allScript || allScript.length < 100) return;

    var seriesPattern = /series\s*:\s*\[([\s\S]*?)\]\s*(?:\}|,\s*\w)/g;
    var match;
    while ((match = seriesPattern.exec(allScript)) !== null) {
      var series = parseHighchartsSeries(match[1]);
      if (series.length === 0) continue;
      var hasElec = series.some(function(s) { return /cooling|lighting|equipment|fans|pumps/i.test(s.name); });
      var isGas = series.length <= 2 && series.every(function(s) { return /heating/i.test(s.name) || /total/i.test(s.name); });
      if (hasElec) assignSeries(series, report.monthly.electricity);
      else if (isGas) assignSeries(series, report.monthly.naturalGas);
    }
  }

  function parseHighchartsSeries(text) {
    var series = [];
    var pat = /\{\s*name\s*:\s*['"](.*?)['"]\s*,[\s\S]*?data\s*:\s*\[([\d\s.,eE+-]*)\]/g;
    var m;
    while ((m = pat.exec(text)) !== null) {
      var data = m[2].split(',').map(function(v) { return parseFloat(v.trim()) || 0; });
      if (data.length === 12) series.push({ name: m[1].trim(), data: data });
    }
    return series;
  }

  function assignSeries(series, target) {
    for (var i = 0; i < series.length; i++) {
      var key = normCatKey(series[i].name);
      if (key && !target[key]) target[key] = series[i].data;
    }
  }

  /* ====================== Strategy 3: Fallback ====================== */
  function parseFallback(doc, report) {
    var allEls = doc.body ? doc.body.querySelectorAll('b, table') : [];
    var currentSection = '';
    for (var i = 0; i < allEls.length; i++) {
      var el = allEls[i];
      if (el.tagName === 'B') { currentSection = el.textContent.trim(); continue; }
      if (el.tagName !== 'TABLE') continue;
      var parsed = parseTableGeneric(el);
      if (!parsed || parsed.headers.length < 2 || parsed.rows.length === 0) continue;
      var sec = currentSection.toLowerCase();
      var hdr = parsed.headers.join(' ').toLowerCase();

      if (/estimated\s*cooling\s*peak/i.test(sec) && report.peakLoads.cooling.length === 0) {
        report.peakLoads.cooling = toObjects(parsed);
      } else if (/estimated\s*heating\s*peak/i.test(sec) && report.peakLoads.heating.length === 0) {
        report.peakLoads.heating = toObjects(parsed);
      } else if (/^zone\s*summary$/i.test(sec) && report.zones.length === 0) {
        report.zones = toObjects(parsed);
      } else if (/^space\s*summary$/i.test(sec) && report.spaces.length === 0) {
        report.spaces = toObjects(parsed);
      } else if (/^end\s*uses$/i.test(sec) && /electricity/i.test(hdr) && report.endUses.main.length === 0) {
        report.endUses.main = toObjects(parsed);
      } else if (/end\s*uses\s*by\s*subcategory/i.test(sec) && report.endUses.bySubcategory.length === 0) {
        report.endUses.bySubcategory = toObjects(parsed);
      } else if (/end\s*uses\s*by\s*space\s*type/i.test(sec) && report.endUses.bySpaceType.length === 0) {
        report.endUses.bySpaceType = toObjects(parsed);
      } else if (hasMonthHeaders(parsed.headers)) {
        parseMonthlyRows(parsed, report);
      }
    }
  }

  /* ====================== Metadata ====================== */
  function parseMeta(doc, report) {
    var allP = doc.querySelectorAll('p');
    for (var i = 0; i < allP.length; i++) {
      var txt = allP[i].textContent.trim();
      var b = allP[i].querySelector('b');
      var bText = b ? b.textContent.trim() : '';

      if (!report.reportType && /^report\s*:/i.test(txt)) {
        report.reportType = bText || txt.replace(/^report\s*:\s*/i, '');
      }
      if (!report.facility && /^for\s*:/i.test(txt)) {
        report.facility = bText || txt.replace(/^for\s*:\s*/i, '');
      }
      if (!report.timestamp && /timestamp/i.test(txt)) {
        report.timestamp = bText ? bText.replace(/\s+/g, ' ').trim() : '';
      }
      if (!report.building && /^building\s*:/i.test(txt)) {
        report.building = bText;
      }
      if (!report.environment && /^environment\s*:/i.test(txt)) {
        report.environment = bText;
      }
    }
    // Fallback title from <title>
    if (!report.reportType) {
      var titleEl = doc.querySelector('title');
      if (titleEl) report.reportType = titleEl.textContent.trim();
    }
  }

  /* ====================== Helpers ====================== */
  function normCatKey(name) {
    if (!name) return null;
    var l = name.toLowerCase().trim();
    var map = {
      'heating':'heating','cooling':'cooling',
      'interior lighting':'interiorLighting','exterior lighting':'exteriorLighting',
      'interior equipment':'interiorEquipment','exterior equipment':'exteriorEquipment',
      'fans':'fans','pumps':'pumps',
      'heat recovery':'heatRecovery','heat rejection':'heatRejection',
      'humidification':'humidification','water systems':'waterSystems',
      'refrigeration':'refrigeration','generators':'generators'
    };
    return map[l] || null;
  }

  function computeTotals(report) {
    // If no Facility peak loads, try AirLoop as fallback
    if (report.peakLoads.cooling.length === 0 && report.airloopPeakLoads.cooling.length > 0) {
      report.peakLoads.cooling = report.airloopPeakLoads.cooling;
    }
    if (report.peakLoads.heating.length === 0 && report.airloopPeakLoads.heating.length > 0) {
      report.peakLoads.heating = report.airloopPeakLoads.heating;
    }

    // Monthly totals
    var elec = report.monthly.electricity;
    if (Object.keys(elec).length > 0 && !elec.total) {
      elec.total = new Array(12).fill(0);
      for (var k in elec) {
        if (k !== 'total' && Array.isArray(elec[k])) {
          for (var i = 0; i < 12; i++) elec.total[i] += (elec[k][i] || 0);
        }
      }
    }
    if (elec.total) report.annual.totalElectricity = elec.total.reduce(function(a,b){return a+b;},0);

    // Zone peak loads count
    var zoneNames = Object.keys(report.zonePeakLoads);

    // Warnings
    if (report.peakLoads.cooling.length === 0 && report.peakLoads.heating.length === 0) {
      report.warnings.push('No Facility Peak Load data');
    }
    if (report.zones.length === 0) report.warnings.push('No Zone Summary');
    if (zoneNames.length > 0) {
      report.warnings.push(zoneNames.length + ' zone-level peak loads available');
    }
  }

  /* ====================== Demo Data ====================== */
  function getDemoData() {
    var r = createEmpty('Demo_FacilityComponentLoadSummary.html');
    r.reportType = 'Facility Component Load Summary';
    r.facility = 'Facility';
    r.building = 'bldg-1';
    r.timestamp = '2026-02-05 17:28:31';

    r.peakLoads.cooling = [
      {_name:'People','':'People','Sensible - Instant [Btu/h]':1705.60,'Sensible - Delayed [Btu/h]':134.74,'Sensible - Return Air [Btu/h]':0,'Latent [Btu/h]':1949.26,'Total [Btu/h]':3789.61,'%Grand Total':7.38,'Related Area [ft2]':72.54,'Total per Area [Btu/h-ft2]':178.25},
      {_name:'Lights','':'Lights','Sensible - Instant [Btu/h]':182.27,'Sensible - Delayed [Btu/h]':0,'Sensible - Return Air [Btu/h]':0,'Latent [Btu/h]':0,'Total [Btu/h]':182.27,'%Grand Total':0.36,'Related Area [ft2]':72.54,'Total per Area [Btu/h-ft2]':8.57},
      {_name:'Equipment','':'Equipment','Sensible - Instant [Btu/h]':86.74,'Sensible - Delayed [Btu/h]':0,'Latent [Btu/h]':0,'Total [Btu/h]':86.74,'%Grand Total':0.17,'Related Area [ft2]':72.54,'Total per Area [Btu/h-ft2]':4.08},
      {_name:'Infiltration','':'Infiltration','Sensible - Instant [Btu/h]':1986.57,'Latent [Btu/h]':3169.50,'Total [Btu/h]':5156.07,'%Grand Total':10.05,'Related Area [ft2]':2764.31,'Total per Area [Btu/h-ft2]':6.36},
      {_name:'Roof','':'Roof','Sensible - Delayed [Btu/h]':27439.07,'Total [Btu/h]':27439.07,'%Grand Total':53.46,'Related Area [ft2]':1299.14,'Total per Area [Btu/h-ft2]':72.06},
      {_name:'Interzone Ceiling','':'Interzone Ceiling','Sensible - Delayed [Btu/h]':-101.7,'Total [Btu/h]':-101.7,'%Grand Total':-0.2,'Related Area [ft2]':69.67,'Total per Area [Btu/h-ft2]':-5.0},
      {_name:'Exterior Wall','':'Exterior Wall','Sensible - Delayed [Btu/h]':11623.52,'Total [Btu/h]':11623.52,'%Grand Total':22.64,'Related Area [ft2]':2764.31,'Total per Area [Btu/h-ft2]':14.35},
      {_name:'Interzone Wall','':'Interzone Wall','Sensible - Delayed [Btu/h]':-695.2,'Total [Btu/h]':-695.2,'%Grand Total':-1.4,'Related Area [ft2]':1569.42,'Total per Area [Btu/h-ft2]':-1.5},
      {_name:'Interzone Floor','':'Interzone Floor','Sensible - Delayed [Btu/h]':130.60,'Total [Btu/h]':130.60,'%Grand Total':0.25,'Related Area [ft2]':72.54,'Total per Area [Btu/h-ft2]':6.14},
      {_name:'Fenestration Conduction','':'Fenestration Conduction','Sensible - Instant [Btu/h]':3600.61,'Total [Btu/h]':3600.61,'%Grand Total':7.01,'Related Area [ft2]':832.47,'Total per Area [Btu/h-ft2]':14.76},
      {_name:'Fenestration Solar','':'Fenestration Solar','Sensible - Delayed [Btu/h]':61.29,'Total [Btu/h]':61.29,'%Grand Total':0.12,'Related Area [ft2]':832.47,'Total per Area [Btu/h-ft2]':0.25},
      {_name:'Opaque Door','':'Opaque Door','Sensible - Delayed [Btu/h]':56.59,'Total [Btu/h]':56.59,'%Grand Total':0.11,'Related Area [ft2]':215.36,'Total per Area [Btu/h-ft2]':0.90},
      {_name:'Grand Total','':'Grand Total','Sensible - Instant [Btu/h]':7561.80,'Sensible - Delayed [Btu/h]':38648.84,'Sensible - Return Air [Btu/h]':0,'Latent [Btu/h]':5118.76,'Total [Btu/h]':51329.40,'%Grand Total':100,'Related Area [ft2]':0,'Total per Area [Btu/h-ft2]':0}
    ];
    r.peakLoads.heating = [
      {_name:'People','':'People','Total [Btu/h]':0,'%Grand Total':0,'Related Area [ft2]':72.54},
      {_name:'Infiltration','':'Infiltration','Sensible - Instant [Btu/h]':-7306.8,'Latent [Btu/h]':-1931.6,'Total [Btu/h]':-9238.4,'%Grand Total':11.0,'Related Area [ft2]':2764.31,'Total per Area [Btu/h-ft2]':-11.4},
      {_name:'Roof','':'Roof','Sensible - Delayed [Btu/h]':-27155.0,'Total [Btu/h]':-27155.0,'%Grand Total':32.32,'Related Area [ft2]':1299.14,'Total per Area [Btu/h-ft2]':-71.3},
      {_name:'Exterior Wall','':'Exterior Wall','Sensible - Delayed [Btu/h]':-31902.9,'Total [Btu/h]':-31902.9,'%Grand Total':37.97,'Related Area [ft2]':2764.31,'Total per Area [Btu/h-ft2]':-39.4},
      {_name:'Fenestration Conduction','':'Fenestration Conduction','Sensible - Instant [Btu/h]':-15705.7,'Total [Btu/h]':-15705.7,'%Grand Total':18.69,'Related Area [ft2]':832.47,'Total per Area [Btu/h-ft2]':-64.4},
      {_name:'Grand Total','':'Grand Total','Sensible - Instant [Btu/h]':-23012.5,'Sensible - Delayed [Btu/h]':-59073.6,'Latent [Btu/h]':-1931.6,'Total [Btu/h]':-84017.7,'%Grand Total':100}
    ];

    r.zones = [
      {_name:'1 STAIRWELL','':'1 STAIRWELL','Area [ft2]':41.57,'Conditioned (Y/N)':'Yes','Part of Total Floor Area (Y/N)':'Yes','Volume [ft3]':1207.57,'Multipliers':1.00,'Above Ground Gross Wall Area [ft2]':196.78,'Lighting [Btu/h-ft2]':2.0470,'People [ft2 per person]':36.89,'Plug and Process [Btu/h-ft2]':1.0235},
      {_name:'6F_OPENWORKSPACE_VAV-1','':'6F_OPENWORKSPACE_VAV-1','Area [ft2]':0,'Conditioned (Y/N)':'Yes','Volume [ft3]':6764.08,'Multipliers':1.00,'Above Ground Gross Wall Area [ft2]':1066.93,'Window Glass Area [ft2]':696.19},
      {_name:'7F_OPENWORKSPACE_VAV-1','':'7F_OPENWORKSPACE_VAV-1','Area [ft2]':3.05,'Conditioned (Y/N)':'Yes','Volume [ft3]':1648.49,'Multipliers':1.00,'Above Ground Gross Wall Area [ft2]':164.80,'Window Glass Area [ft2]':29.77,'Lighting [Btu/h-ft2]':3.7528,'People [ft2 per person]':3.99,'Plug and Process [Btu/h-ft2]':5.1175},
      {_name:'7F_RESTROOM_FCU-1','':'7F_RESTROOM_FCU-1','Area [ft2]':27.92,'Conditioned (Y/N)':'Yes','Volume [ft3]':298.37,'Multipliers':1.00,'Above Ground Gross Wall Area [ft2]':179.55,'Lighting [Btu/h-ft2]':3.0705,'People [ft2 per person]':98.44,'Plug and Process [Btu/h-ft2]':1.0235},
      {_name:'Total','':'Total','Area [ft2]':72.54,'Volume [ft3]':14751.86,'Above Ground Gross Wall Area [ft2]':2764.31,'Window Glass Area [ft2]':832.47,'Lighting [Btu/h-ft2]':2.5127,'People [ft2 per person]':7.44,'Plug and Process [Btu/h-ft2]':1.1958}
    ];

    r.endUses.main = [
      {_name:'Heating','':'Heating','Electricity [kBtu]':0,'Natural Gas [kBtu]':88933.59,'District Heating [kBtu]':20237.93},
      {_name:'Cooling','':'Cooling','Electricity [kBtu]':6332.90,'District Cooling [kBtu]':6644.58},
      {_name:'Interior Lighting','':'Interior Lighting','Electricity [kBtu]':659.09},
      {_name:'Interior Equipment','':'Interior Equipment','Electricity [kBtu]':313.66},
      {_name:'Fans','':'Fans','Electricity [kBtu]':8303.21},
      {_name:'Pumps','':'Pumps','Electricity [kBtu]':319.78}
    ];

    r.monthly.electricity = {
      cooling:[1.29,3.94,6.34,50.09,157.58,350.17,448.3,517.5,229.13,77.38,11.53,1.5],
      interiorLighting:[16.39,14.81,16.39,15.87,16.39,15.87,16.39,16.39,15.87,16.39,15.87,16.39],
      interiorEquipment:[7.80,7.05,7.80,7.55,7.80,7.55,7.80,7.80,7.55,7.80,7.55,7.80],
      fans:[145.30,119.87,125.49,135.33,214.96,330.30,349.46,390.26,225.76,128.25,120.30,146.53],
      pumps:[15.06,10.01,7.48,2.64,3.70,6.82,8.51,10.30,4.43,2.92,6.53,15.25]
    };
    r.monthly.naturalGas = { heating:[19.65,14.57,12.21,4.83,1.94,0.15,0.02,0.04,0.73,3.82,11.15,19.83] };
    r.annual = { totalSiteEnergy:131804.73, totalElectricity:4665.11, eui:1817.06, buildingArea:72.54 };
    computeTotals(r);
    return r;
  }

  function getDemoData2() {
    var r = getDemoData();
    r.fileName = 'Demo_K-HVAC_Systems_loads4.html';
    r.timestamp = '2026-02-05 17:26:32';
    r.peakLoads.cooling = r.peakLoads.cooling.map(function(row) {
      var nr = {}; for (var k in row) nr[k] = row[k];
      if (/roof|exterior wall|fenestration/i.test(row._name||'')) {
        nr['Total [Btu/h]'] = Math.round((row['Total [Btu/h]']||0)*0.75*100)/100;
        nr['%Grand Total'] = Math.round((row['%Grand Total']||0)*0.75*100)/100;
      }
      return nr;
    });
    r.peakLoads.heating = r.peakLoads.heating.map(function(row) {
      var nr = {}; for (var k in row) nr[k] = row[k];
      if (/roof|exterior wall|fenestration/i.test(row._name||'')) {
        nr['Total [Btu/h]'] = Math.round((row['Total [Btu/h]']||0)*0.75*100)/100;
      }
      return nr;
    });
    return r;
  }

  /* ====================== Public API ====================== */
  return {
    parse: parse, getDemoData: getDemoData, getDemoData2: getDemoData2,
    MONTHS: MONTHS, SI_CONV: SI_CONV,
    convertValueSI: convertValueSI, convertHeaderSI: convertHeaderSI
  };
})();
