const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const appSource = fs.readFileSync('outputs/go chess/app.js', 'utf8');
const css = fs.readFileSync('outputs/go chess/styles.css', 'utf8');
const store = new Map();

function boot() {
  const app = { innerHTML: '', listeners: {}, addEventListener(name, callback) { this.listeners[name] = callback; } };
  const context = {
    document: { getElementById: id => id === 'app' ? app : null },
    localStorage: { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) },
    window: { confirm: () => true },
    setTimeout,
    clearTimeout,
    console
  };
  const instrumented = appSource.replace(/\n  render\(\);\n\}\)\(\);\s*$/, '\n  render();\n  window.__testApi = { fromFen, legalMovesFrom, applyRaw, createInitialGame, choosePiuMove, submitProfileForm, selectProfileAvatar, getLessonCount: () => lessons.length };\n})();');
  assert.notEqual(instrumented, appSource, 'test hook should attach to the app closure');
  vm.runInNewContext(instrumented, context, { filename: 'app.js' });
  app.testApi = context.window.__testApi;
  return app;
}

function click(app, descriptor) {
  const target = {
    closest(selector) {
      if (selector === '[data-profile-tab]' && descriptor.profileTab) return { dataset: { profileTab: descriptor.profileTab } };
      if (selector === '[data-avatar]' && descriptor.avatar) return { dataset: { avatar: descriptor.avatar } };
      if (selector === '[data-page]' && descriptor.page) return { dataset: { page: descriptor.page } };
      if (selector === '[data-lesson]' && Number.isInteger(descriptor.lesson)) return { dataset: { lesson: String(descriptor.lesson) } };
      if (selector === '[data-boss]' && descriptor.boss) return { dataset: { boss: 'true' } };
      if (selector === '[data-answer]' && descriptor.answer) return { dataset: { answer: descriptor.answer.stage, index: String(descriptor.answer.index) } };
      if (selector === '[data-square]' && descriptor.square) return { dataset: { square: descriptor.square } };
      if (selector === '[data-action]' && descriptor.action) return { dataset: { action: descriptor.action } };
      return null;
    }
  };
  app.listeners.click({ target });
}

function submitProfile(app, profileForm, fields) {
  const form = {
    dataset: { profileForm },
    elements: fields,
    closest(selector) { return selector === '[data-profile-form]' ? this : null; }
  };
  let prevented = false;
  app.listeners.submit({ target: form, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
}

let app = boot();
assert.match(app.innerHTML, /Aprenda xadrez jogando!/);
assert.match(app.innerHTML, /Piu Xadrez/);
assert.doesNotMatch(app.innerHTML, /Go Chess/);
assert.match(app.innerHTML, /passarinho verde/);
assert.match(app.innerHTML, /Piu te lembra/);
assert.doesNotMatch(app.innerHTML, /Max|onça pintada|Go Chess|tigre|tiger|🐯/i);

click(app, { action: 'start' });
assert.match(app.innerHTML, /Conhecendo o tabuleiro/);
click(app, { answer: { stage: 'quiz', index: 0 } });
assert.match(app.innerHTML, /Quase! Tente novamente\./);
click(app, { answer: { stage: 'quiz', index: 1 } });
click(app, { answer: { stage: 'exercise', index: 1 } });
assert.match(app.innerHTML, /data-action="complete-lesson"(?![^>]*disabled)/);
click(app, { action: 'complete-lesson' });
assert.match(app.innerHTML, /Aula concluída/);
assert.equal(JSON.parse(store.get('piu-xadrez-progresso-v1')).xp, 25);
assert.deepEqual(JSON.parse(store.get('piu-xadrez-progresso-v1')).completed, [0]);

click(app, { page: 'path' });
assert.match(app.innerHTML, /Nível 2 — Peões/);
assert.match(app.innerHTML, /Médio · estratégia e táticas/);
assert.match(app.innerHTML, /Difícil · cálculo e finais/);
assert.match(app.innerHTML, /Boss: contra o Piu/);
click(app, { page: 'practice' });
assert.match(app.innerHTML, /A torre encontra a dama/);
assert.match(app.innerHTML, /Casa a4/);
click(app, { square: '4,0' });
click(app, { square: '3,0' });
assert.match(app.innerHTML, /Quase! Tente novamente\./);
click(app, { action: 'reset-challenge' });
click(app, { square: '4,0' });
click(app, { square: '1,0' });
assert.match(app.innerHTML, /Desafio concluído/);
assert.equal(JSON.parse(store.get('piu-xadrez-progresso-v1')).xp, 40);
click(app, { action: 'next-challenge' });
click(app, { square: '1,5' });
click(app, { square: '1,6' });
assert.match(app.innerHTML, /Partida encerrada/);
assert.match(app.innerHTML, /Xeque-mate!/);

click(app, { action: 'free-play' });
click(app, { square: '6,4' });
assert.match(app.innerHTML, /class="square [^"]*legal-square[^"]*" data-square="4,4"/);
assert.doesNotMatch(app.innerHTML, /class="square [^"]*legal-square[^"]*" data-square="3,4"/);
click(app, { square: '4,4' });
assert.match(app.innerHTML, /Pretas jogam/);
click(app, { square: '1,4' });
click(app, { square: '3,4' });
assert.match(app.innerHTML, /Brancas jogam/);
click(app, { page: 'profile' });
assert.match(app.innerHTML, /55 XP/);

const { fromFen, legalMovesFrom, applyRaw } = app.testApi;
assert.equal(app.testApi.getLessonCount(), 23);
const movesFrom = (position, square) => {
  const r = 8 - Number(square[1]);
  const c = 'abcdefgh'.indexOf(square[0]);
  return legalMovesFrom(position, r, c);
};
const castle = fromFen('r3k2r/8/8/8/8/8/8/R3K2R w - -');
castle.castling = { wK: true, wQ: true, bK: true, bQ: true };
const castleMoves = movesFrom(castle, 'e1');
assert.ok(castleMoves.some(move => move.to.r === 7 && move.to.c === 6 && move.castle === 'K'));
assert.ok(castleMoves.some(move => move.to.r === 7 && move.to.c === 2 && move.castle === 'Q'));
const castled = applyRaw(castle, castleMoves.find(move => move.castle === 'K'));
assert.equal(castled.board[7][6].type, 'K');
assert.equal(castled.board[7][5].type, 'R');

const attackedCastle = fromFen('4kr2/8/8/8/8/8/8/R3K2R w - -');
attackedCastle.castling = { wK: true, wQ: true, bK: false, bQ: false };
assert.ok(!movesFrom(attackedCastle, 'e1').some(move => move.castle === 'K'));

const enPassant = fromFen('7k/8/8/3pP3/8/8/8/K7 w - -');
enPassant.ep = { r: 2, c: 3 };
const epMove = movesFrom(enPassant, 'e5').find(move => move.enPassant);
assert.ok(epMove);
const afterEp = applyRaw(enPassant, epMove);
assert.equal(afterEp.board[2][3].type, 'P');
assert.equal(afterEp.board[3][3], null);

const promotion = fromFen('7k/P7/8/8/8/8/8/K7 w - -');
const promoteMove = movesFrom(promotion, 'a7').find(move => move.to.r === 0 && move.to.c === 0);
assert.ok(promoteMove);
assert.equal(applyRaw(promotion, promoteMove).board[0][0].type, 'Q');

const pinnedRook = fromFen('k3r3/8/8/8/8/8/4R3/4K3 w - -');
assert.ok(!movesFrom(pinnedRook, 'e2').some(move => move.to.c !== 4));

app = boot();
click(app, { page: 'profile' });
assert.match(app.innerHTML, /55 XP/);
assert.match(css, /@media \(max-width: 780px\)/);
assert.match(css, /@media \(max-width: 540px\)/);

store.clear();
app = boot();
click(app, { page: 'profile' });
assert.match(app.innerHTML, /Personalize seu perfil/);
assert.match(app.innerHTML, /Pinguim/);
assert.match(app.innerHTML, /Código secreto/);
assert.doesNotMatch(app.innerHTML, /Magnus Carlsen/);
click(app, { profileTab: 'code' });
assert.match(app.innerHTML, /id="unlock-code"/);
submitProfile(app, 'unlock-magnus', { code: { value: '0000' } });
assert.equal(JSON.parse(store.get('piu-xadrez-progresso-v1')).magnusUnlocked, false);
assert.match(app.innerHTML, /Esse código não confere/);
submitProfile(app, 'unlock-magnus', { code: { value: '6742' } });
assert.equal(JSON.parse(store.get('piu-xadrez-progresso-v1')).magnusUnlocked, true);
assert.match(app.innerHTML, /Stefan64 \/ Wikimedia Commons/);
click(app, { avatar: 'magnus' });
assert.equal(JSON.parse(store.get('piu-xadrez-progresso-v1')).avatar, 'magnus');
assert.match(app.innerHTML, /MagnusCarlsen24\.jpg/);
submitProfile(app, 'player-name', { playerName: { value: 'Carlos' } });
assert.equal(JSON.parse(store.get('piu-xadrez-progresso-v1')).playerName, 'Carlos');
assert.match(app.innerHTML, /class="player-name">Carlos</);
app = boot();
click(app, { page: 'profile' });
assert.match(app.innerHTML, /<h2>Carlos<\/h2>/);
assert.match(app.innerHTML, /Magnus Carlsen/);

async function validateBossGame() {
  store.set('piu-xadrez-progresso-v1', JSON.stringify({ xp: 575, completed: Array.from({ length: 23 }, (_, i) => i), streak: 1, lastActive: '', solvedChallenges: [], bossWins: 0 }));
  app = boot();
  assert.match(app.innerHTML, /JOGAR CONTRA O PIU/);
  click(app, { page: 'path' });
  assert.match(app.innerHTML, /Boss: contra o Piu/);
  click(app, { boss: true });
  assert.match(app.innerHTML, /Partida contra o Piu/);
  assert.match(app.innerHTML, /Piu, nível Boss/);
  click(app, { square: '6,4' });
  click(app, { square: '4,4' });
  assert.match(app.innerHTML, /Piu está pensando/);
  await new Promise(resolve => setTimeout(resolve, 1400));
  assert.match(app.innerHTML, /Sua vez · brancas/);
  const blackMoves = app.testApi.choosePiuMove(app.testApi.createInitialGame());
  assert.ok(blackMoves);
}

validateBossGame().then(() => {
  console.log('Validação concluída: perfil personalizável e persistente, código 6742, avatar Magnus, 23 aulas, XP/localStorage, desafios, regras do tabuleiro, Piu responde no Boss e breakpoints responsivos.');
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
