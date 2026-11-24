/**
 * RSVP receiver for wedding.caldrooten.com
 *
 * This runs inside a Google Sheet (Extensions > Apps Script). The website's
 * RSVP form posts to it, and it adds one row per RSVP to the "RSVPs" tab.
 * There is nothing secret in this file. Setup steps are in ../README.md.
 *
 * The next line limits what Google lets this script touch to this one spreadsheet.
 * @OnlyCurrentDoc
 */

var SHEET_NAME = 'RSVPs';
var HEADERS = [
  'Received', 'Name(s)', 'Attending', 'Number in party',
  'T-shirt size(s)', 'Dietary restrictions', 'Sleeping pad', 'Help with bedding'
];
var MAX_PER_HOUR = 60;      // flood guard: more than this in one hour gets turned away
var MIN_SECONDS_ON_PAGE = 3; // real people take longer than this to fill in the form

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};

    // Spam checks. Bots get a normal-looking "ok" so they don't retry, but nothing is saved.
    if (p.website) { return reply({ ok: true }); }
    if (!(Number(p.seconds_on_page) >= MIN_SECONDS_ON_PAGE)) { return reply({ ok: true }); }

    var names = clean(p.names, 200);
    var attending = p.attending === 'Yes' ? 'Yes' : (p.attending === 'No' ? 'No' : '');
    var partySize = parseInt(p.party_size, 10);
    if (!names || !attending || !(partySize >= 1 && partySize <= 20)) {
      return reply({ ok: false, error: 'invalid' });
    }

    var cache = CacheService.getScriptCache();
    var hourKey = 'rsvp-' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
    var soFar = Number(cache.get(hourKey) || 0);
    if (soFar >= MAX_PER_HOUR) { return reply({ ok: false, error: 'busy' }); }
    cache.put(hourKey, String(soFar + 1), 3900);

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      getSheet().appendRow([
        new Date(),
        names,
        attending,
        partySize,
        clean(p.shirt_sizes, 200),
        clean(p.dietary, 300),
        p.sleeping_pad === 'Yes' ? 'Yes' : 'No',
        p.bedding_help === 'Yes' ? 'Yes' : 'No'
      ]);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'server' });
  }
}

// Opening the web app address in a browser just confirms it is running.
function doGet() {
  return reply({ ok: true, service: 'rsvp' });
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Trim, cap the length, and stop a cell from being read as a spreadsheet formula.
function clean(value, maxLength) {
  var text = String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(text)) { text = "'" + text; }
  return text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
