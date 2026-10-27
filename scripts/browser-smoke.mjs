import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { getNextBarraArrivals } from '../src/lib/timetable.js';
import { getStationArrivals } from '../src/lib/arrivals.js';

const binary = process.env.BROWSER_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
].find(existsSync);
assert.ok(binary, 'Set BROWSER_PATH to an installed Chromium browser.');
assert.ok(existsSync('dist/index.html'), 'Run npm run build first.');
const profile = await mkdtemp(join(tmpdir(), 'lrt-browser-'));
const browser = spawn(binary, [
  '--headless=new', '--no-first-run', '--disable-gpu', '--disable-background-networking',
  '--disable-crash-reporter', '--remote-debugging-pipe', '--user-data-dir=' + profile,
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
let serial = 0;
let buffer = '';
let stderr = '';
const pending = new Map();
const handlers = new Set();
browser.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-1500); });
browser.on('error', error => { for (const item of pending.values()) item.reject(error); });
browser.on('exit', code => {
  for (const item of pending.values()) item.reject(new Error('Browser exited (' + code + '): ' + stderr));
  pending.clear();
});
function command(method, params = {}, sessionId) {
  return new Promise((resolveCommand, reject) => {
    const id = ++serial;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 8000);
    pending.set(id, { resolve: result => { clearTimeout(timeout); resolveCommand(result); }, reject: error => { clearTimeout(timeout); reject(error); } });
    browser.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
  });
}
browser.stdio[4].on('data', chunk => {
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, index));
    buffer = buffer.slice(index + 1);
    if (message.id) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) item?.reject(new Error(JSON.stringify(message.error)));
      else item?.resolve(message.result);
    } else for (const handler of handlers) handler(message);
  }
});

try {
  await command('Browser.getVersion');
  const { targetId } = await command('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await command('Target.attachToTarget', { targetId, flatten: true });
  const cdp = (method, params) => command(method, params, sessionId);
  const exceptions = [];
  const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
  handlers.add(message => {
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text + ': ' + message.params.exceptionDetails.exception?.description);
    if (message.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = message.params;
    const url = new URL(request.url);
    let relative = decodeURIComponent(url.pathname).replace(/^\/lrt-web-app\//, '');
    let filename = resolve('dist', relative);
    if (!filename.startsWith(resolve('dist') + '/') && !filename.startsWith(resolve('dist') + '\\')) filename = resolve('dist/index.html');
    if (url.hostname === 'unpkg.com' || url.hostname.endsWith('tile.openstreetmap.org')) {
      cdp('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }).catch(() => {});
      return;
    }
    // Photo content is irrelevant to these interaction tests; use a small local image.
    if (extname(filename) === '.jpg') filename = resolve('dist/logo.png');
    if (!existsSync(filename) || !extname(filename)) filename = resolve('dist/index.html');
    cdp('Fetch.fulfillRequest', { requestId, responseCode: 200,
      responseHeaders: [{ name: 'Content-Type', value: contentTypes[extname(filename)] || 'application/octet-stream' }],
      body: readFileSync(filename).toString('base64'),
    }).catch(error => exceptions.push(error.message));
  });
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  const initial = Date.parse('2026-09-07T08:01:00+08:00');
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: [
    'window.__testNow=' + initial + ';',
    'const NativeDate=Date;window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[window.__testNow]));}static now(){return window.__testNow;}};',
    "if(!localStorage.getItem('macao-lrt-language'))localStorage.setItem('macao-lrt-language','en');",
    'window.__alerts=[];window.alert=message=>window.__alerts.push(message);',
    'window.__notifications=[];window.__permissionRequests=0;window.Notification=class {static permission="default";static requestPermission(){window.__permissionRequests++;this.permission="granted";return Promise.resolve("granted");}constructor(title,options){window.__notifications.push({title,...options});}};',
    'window.__geoFail=false;window.__geoDelay=0;Object.defineProperty(navigator,"geolocation",{value:{getCurrentPosition(success,failure){setTimeout(()=>window.__geoFail?failure({code:1}):success({coords:{latitude:22.183645,longitude:113.529448,accuracy:10}}),window.__geoDelay);}}});',
  ].join('\n') });
  const evaluate = async expression => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  async function waitFor(expression) {
    for (let i = 0; i < 100; i++) { if (await evaluate('Boolean(' + expression + ')')) return; await delay(50); }
    throw new Error('UI timeout: ' + expression);
  }
  const go = async path => {
    await cdp('Page.navigate', { url: 'http://lrt.test/lrt-web-app/' + path });
    await waitFor("document.getElementById('root')?.textContent.length>20");
  };
  const changeSelect = (index, value) => evaluate("(()=>{const el=document.querySelectorAll('select')[" + index + "];el.value=" + JSON.stringify(value) + ";el.dispatchEvent(new Event('change',{bubbles:true}));})()");
  const click = selector => evaluate("(()=>{const el=document.querySelector(" + JSON.stringify(selector) + ");if(!el)throw new Error('Missing '+ " + JSON.stringify(selector) + ");el.focus();el.click();})()");
  const body = () => evaluate('document.body.textContent');

  await go('route');
  await changeSelect(1, '12'); await changeSelect(3, '9'); await changeSelect(4, 'single');
  assert.ok((await body()).includes('MOP 6'));
  await changeSelect(1, '9'); await changeSelect(3, '12');
  assert.ok((await body()).includes('MOP 6'));
  await changeSelect(1, '12');
  assert.ok((await body()).includes('MOP 0'));
  console.log('PASS route fares: Airport directions and same-station journey');

  await go('station/1');
  await waitFor("document.querySelector('[role=tabpanel]')");
  const before = await evaluate("document.querySelector('[role=tabpanel]').textContent");
  await evaluate('window.__testNow+=60000');
  await delay(1200);
  assert.notEqual(await evaluate("document.querySelector('[role=tabpanel]').textContent"), before);
  assert.equal(await evaluate("document.querySelector('nav a[aria-current=page]').getAttribute('href')"), '/lrt-web-app/station');
  await click('button[aria-label="Save station"]');
  await click('[role=tabpanel] button');
  await waitFor('document.querySelector("dialog")?.open');
  await evaluate("(()=>{const el=document.querySelector('dialog');const r=el.getBoundingClientRect();el.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:r.left+3,clientY:r.top+3}));})()");
  assert.ok(await evaluate('document.querySelector("dialog")?.open'));
  await changeSelect(0, '5'); await changeSelect(1, 'weekdays');
  await click('dialog button[type=submit]');
  await waitFor('!document.querySelector("dialog")');
  assert.equal(await evaluate("JSON.parse(localStorage.getItem('lrt-reminders'))[0].leadMinutes"), 5);
  console.log('PASS station countdown refresh, nested navigation, favorite and reminder dialog');

  await go('my');
  assert.ok((await body()).includes('Barra'));
  assert.equal(await evaluate('document.querySelectorAll("li").length'), 2);
  await changeSelect(0, 'pt'); await changeSelect(1, 'dark');
  await cdp('Page.reload');
  await waitFor("document.documentElement.lang==='pt' && document.documentElement.dataset.theme==='dark'");
  assert.notEqual(await evaluate('getComputedStyle(document.body).backgroundColor'), 'rgb(243, 244, 246)');
  await changeSelect(0, 'en'); await changeSelect(1, 'light');
  await click('button[aria-label^="Cancel reminder"]');
  await waitFor("JSON.parse(localStorage.getItem('lrt-reminders')).length===0");
  console.log('PASS settings, language/theme persistence and reminder cancellation');

  await go('');
  await waitFor("Array.from(document.querySelectorAll('button')).some(el=>el.ariaLabel==='Locating...'&&!el.disabled)");
  const untilTrain = getNextBarraArrivals(1, initial)[0];
  await evaluate('window.__testNow=' + (initial + Math.max(0, untilTrain - 1) * 60_000));
  await delay(1200);
  assert.equal(await evaluate('window.__notifications.length'), 0);
  assert.equal(await evaluate('window.__permissionRequests'), 0);
  assert.equal(await evaluate('window.__alerts.length'), 0);
  await click('button[aria-label="Set reminder"]');
  await waitFor('window.__notifications.length===1');
  await delay(1200);
  assert.equal(await evaluate('window.__notifications.length'), 1);
  assert.equal(await evaluate('JSON.parse(localStorage.getItem("lrt-reminders")).length'), 0);
  await evaluate('window.__geoDelay=500');
  await click('button[aria-label="Locating..."]');
  await changeSelect(0, 'Hengqin'); await changeSelect(1, '15');
  await delay(700);
  assert.equal(await evaluate("document.querySelectorAll('select')[1].value"), '15');
  await evaluate('window.__geoDelay=0');
  await changeSelect(0, 'Hengqin'); await changeSelect(1, '15');
  await evaluate('window.__geoFail=true');
  await click('button[aria-label="Locating..."]');
  await waitFor("document.querySelectorAll('select')[0].value==='Taipa' && document.querySelectorAll('select')[1].value==='1'");
  console.log('PASS reminders only when enabled, exactly-once delivery and geolocation fallback');

  const simultaneous = getStationArrivals('2', 3, initial).map(entry => ({
    id: '2:' + entry.id, stationId: '2', directionId: entry.id, leadMinutes: 15,
    repeat: 'once', createdAt: initial, targetDeparture: entry.departures[0], lastDeparture: null,
  }));
  await evaluate('localStorage.setItem("lrt-reminders",' + JSON.stringify(JSON.stringify(simultaneous)) + ')');
  await go('station/2');
  await evaluate('Notification.permission="denied"');
  await waitFor('JSON.parse(localStorage.getItem("lrt-reminders")).length===0');
  const combinedNotice = await evaluate('document.querySelector("[role=status]").textContent');
  assert.equal(combinedNotice.split('Ocean:').length, 3);
  assert.equal(await evaluate('window.__notifications.length'), 0);
  console.log('PASS simultaneous reminders remain visible when OS notifications are denied');

  await go('station');
  await click('button[aria-label^="Barra:"]');
  await waitFor("document.querySelector('[role=dialog]')");
  await click('button[aria-label="Zoom in"]');
  await waitFor("document.querySelector('[role=dialog] img').style.transform.includes('scale(1.5)')");
  const bounds = await evaluate("(()=>{const r=document.querySelector('[role=dialog] img').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()");
  const mouse = (type, x, y, extra = {}) => cdp('Input.dispatchMouseEvent', { type, x, y, ...extra });
  await mouse('mousePressed', bounds.x, bounds.y, {button:'left',clickCount:1});
  await mouse('mouseMoved', bounds.x+40, bounds.y+20, {button:'left',buttons:1});
  await mouse('mouseReleased', bounds.x+40, bounds.y+20, {button:'left',clickCount:1});
  const transform = await evaluate("document.querySelector('[role=dialog] img').style.transform");
  assert.ok(!transform.includes('translate(0px, 0px)'), JSON.stringify({ bounds, transform, viewport: await evaluate('({width:innerWidth,height:innerHeight})') }));
  await click('button[aria-label="Reset zoom"]');
  for (let i=0;i<2;i++) {
    await mouse('mousePressed', bounds.x, bounds.y, {button:'left',clickCount:1});
    await mouse('mouseReleased', bounds.x, bounds.y, {button:'left',clickCount:1});
  }
  await waitFor("document.querySelector('[role=dialog] img').style.transform.includes('scale(2.5)')");
  await cdp('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[{x:bounds.x,y:bounds.y,id:1},{x:bounds.x,y:bounds.y,id:2}]});
  await cdp('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:bounds.x-10,y:bounds.y,id:1},{x:bounds.x+10,y:bounds.y,id:2}]});
  await cdp('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
  assert.ok(!/NaN|Infinity/.test(await evaluate("document.querySelector('[role=dialog] img').style.transform")));
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
  await waitFor("!document.querySelector('[role=dialog]')");
  assert.ok(await evaluate('document.activeElement.tagName==="BUTTON"'));
  await go('station/not-a-station');
  await waitFor("location.pathname==='/lrt-web-app/station'");
  await evaluate('localStorage.setItem("macao-lrt-language","invalid")');
  await cdp('Page.reload');
  await waitFor("document.documentElement.lang==='zh-Hant'");
  assert.deepEqual(exceptions, []);
  console.log('PASS image zoom/pan/double-tap/pinch/Escape/focus, invalid language and station fallback');
  console.log('All browser smoke checks passed.');
} finally {
  try { await command('Browser.close'); } catch { browser.kill(); }
  await delay(300);
  if (dirname(resolve(profile)) === resolve(tmpdir()) && basename(profile).startsWith('lrt-browser-')) {
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
