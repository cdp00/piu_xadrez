(() => {
  'use strict';

  const STORAGE_KEY = 'piu-xadrez-progresso-v1';
  const PIECE_GLYPHS = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  const PIECE_NAMES = { K: 'rei', Q: 'dama', R: 'torre', B: 'bispo', N: 'cavalo', P: 'peão' };
  const FILES = 'abcdefgh';
  const PROFILE_BIRDS = [
    { id: 'piu', name: 'Piu', emoji: '🐦' },
    { id: 'tucano', name: 'Tucano', emoji: '🦜' },
    { id: 'coruja', name: 'Coruja', emoji: '🦉' },
    { id: 'pinguim', name: 'Pinguim', emoji: '🐧' },
    { id: 'flamingo', name: 'Flamingo', emoji: '🦩' }
  ];
  const MAGNUS_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/MagnusCarlsen24.jpg/250px-MagnusCarlsen24.jpg';
  const MAGNUS_SOURCE = 'https://commons.wikimedia.org/wiki/File:MagnusCarlsen24.jpg';
  const MAGNUS_LICENSE = 'https://creativecommons.org/licenses/by-sa/3.0/';

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  function normalizePlayerName(value) {
    return String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  }
  function avatarVisual(avatarId, className) {
    if (avatarId === 'magnus') return `<span class="${className} avatar-photo" role="img" aria-label="Foto de Magnus Carlsen"><img src="${MAGNUS_PHOTO}" alt="Magnus Carlsen" loading="lazy" referrerpolicy="no-referrer"></span>`;
    const bird = PROFILE_BIRDS.find(option => option.id === avatarId) || PROFILE_BIRDS[0];
    return `<span class="${className}" role="img" aria-label="${bird.name}">${bird.emoji}</span>`;
  }

  const lessons = [
    { title: 'Conhecendo o tabuleiro', icon: '▦', time: '4 min', intro: 'O tabuleiro tem 64 casas: oito colunas e oito fileiras. Coloque sempre uma casa clara no canto inferior direito. As colunas recebem letras de a a h; as fileiras, números de 1 a 8.', tip: 'Olhe primeiro para o canto direito: a casa h1 é clara. Esse pequeno hábito ajuda a montar o tabuleiro certo.', quiz: { ask: 'Quantas casas tem um tabuleiro de xadrez?', options: ['32 casas', '64 casas', '100 casas'], answer: 1 }, exercise: { ask: 'Ao posicionar o tabuleiro, qual casa deve ficar clara no canto inferior direito?', options: ['a1', 'h1', 'h8'], answer: 1 }, piece: '♔', move: 'As casas formam uma grade de 8 por 8.' },
    { title: 'Peões', icon: '♟', time: '5 min', intro: 'O peão anda uma casa para a frente. No primeiro movimento, pode avançar duas casas se o caminho estiver livre. Ele captura uma casa na diagonal e, ao chegar ao outro lado, pode virar outra peça.', tip: 'Peão anda para a frente, mas captura de lado! Imagine uma pequena diagonal antes de avançar.', quiz: { ask: 'Como o peão captura uma peça?', options: ['Uma casa na diagonal', 'Uma casa para trás', 'Em linha reta para a frente'], answer: 0 }, exercise: { ask: 'Um peão branco está em e4. Qual casa pode capturar?', options: ['e5', 'd5', 'e3'], answer: 1 }, piece: '♙', move: 'O peão avança, mas captura na diagonal.' },
    { title: 'Torres', icon: '♖', time: '4 min', intro: 'A torre anda quantas casas quiser em linha reta: na horizontal ou na vertical. Ela para antes de uma peça da mesma cor e pode capturar a primeira peça adversária que encontrar.', tip: 'A torre percorre corredores retos. Se o caminho estiver livre, ela pode atravessar o tabuleiro inteiro.', quiz: { ask: 'Em quais direções a torre se move?', options: ['Só na diagonal', 'Em linhas retas, na horizontal e vertical', 'Em forma de L'], answer: 1 }, exercise: { ask: 'Uma torre está em a1. Qual casa está na mesma coluna?', options: ['a6', 'f1', 'c3'], answer: 0 }, piece: '♖', move: 'A torre desliza em linhas retas.' },
    { title: 'Cavalos', icon: '♘', time: '5 min', intro: 'O cavalo anda em forma de L: duas casas numa direção e uma para o lado. É a única peça que pode pular por cima das outras. A casa de chegada precisa estar vazia ou ocupada por uma peça adversária.', tip: 'Conte “dois e um”: duas casas retas, depois uma para o lado. O cavalo sempre troca a cor da casa.', quiz: { ask: 'Qual é o movimento do cavalo?', options: ['Uma diagonal longa', 'Duas casas e depois uma para o lado', 'Qualquer número de casas retas'], answer: 1 }, exercise: { ask: 'Um cavalo está em b1. Para qual casa ele pode pular?', options: ['b3', 'c3', 'd2'], answer: 1 }, piece: '♘', move: 'Duas casas e uma para o lado: um L.' },
    { title: 'Bispos', icon: '♗', time: '4 min', intro: 'O bispo se move na diagonal, por quantas casas quiser, desde que o caminho esteja livre. Cada bispo permanece sempre nas casas da mesma cor em que começou.', tip: 'Bispos gostam das diagonais. Um começa nas casas claras e o outro nas escuras.', quiz: { ask: 'Como o bispo se move?', options: ['Na diagonal', 'Em linha reta horizontal', 'Em forma de L'], answer: 0 }, exercise: { ask: 'Um bispo está em c1. Qual casa fica na mesma diagonal?', options: ['c4', 'f4', 'a1'], answer: 1 }, piece: '♗', move: 'O bispo segue pelas diagonais.' },
    { title: 'Dama', icon: '♕', time: '5 min', intro: 'A dama combina os movimentos da torre e do bispo: anda em linha reta ou na diagonal, por quantas casas quiser. É a peça que alcança mais casas, mas cuide bem dela!', tip: 'A dama reúne os caminhos da torre e do bispo. Uma peça poderosa também precisa de proteção.', quiz: { ask: 'Quais movimentos a dama combina?', options: ['Cavalo e peão', 'Torre e bispo', 'Rei e cavalo'], answer: 1 }, exercise: { ask: 'A dama está em d4. Qual casa alcança em uma diagonal?', options: ['h8', 'd8', 'f4'], answer: 0 }, piece: '♕', move: 'A dama anda em linhas retas e diagonais.' },
    { title: 'Rei', icon: '♔', time: '4 min', intro: 'O rei anda uma casa em qualquer direção. Ele não pode se mover para uma casa atacada por uma peça adversária. Proteger o rei é a prioridade de cada partida.', tip: 'Antes de mover o rei, veja se a casa de chegada está sendo atacada.', quiz: { ask: 'Quantas casas o rei pode andar por vez?', options: ['Uma casa', 'Duas casas', 'Quantas quiser'], answer: 0 }, exercise: { ask: 'O rei está em e4. Qual casa vizinha pode alcançar?', options: ['e6', 'f5', 'g4'], answer: 1 }, piece: '♔', move: 'O rei avança uma casa por vez.' },
    { title: 'Xeque', icon: '⚠', time: '5 min', intro: 'Quando uma peça ameaça capturar o rei, dizemos que ele está em xeque. Quem está em xeque precisa sair da ameaça: movendo o rei, capturando a peça atacante ou bloqueando o caminho.', tip: 'Xeque é um aviso: proteja o rei imediatamente. Não é permitido ignorar a ameaça.', quiz: { ask: 'O que significa estar em xeque?', options: ['O rei está ameaçado', 'A partida terminou empatada', 'Uma peça foi promovida'], answer: 0 }, exercise: { ask: 'Como você pode responder a um xeque?', options: ['Ignorar e jogar outra peça', 'Proteger o rei de uma forma legal', 'Mover duas peças'], answer: 1 }, piece: '♜', move: 'A torre na mesma coluna ameaça o rei.' },
    { title: 'Xeque-mate', icon: '♚', time: '6 min', intro: 'Xeque-mate acontece quando o rei está em xeque e não existe nenhum movimento legal para escapar. A partida termina ali. Dar mate é o objetivo final do xadrez.', tip: 'Procure as casas de fuga do rei adversário. Se nenhuma for segura, pode haver mate!', quiz: { ask: 'Quando acontece o xeque-mate?', options: ['Quando uma dama é capturada', 'Quando o rei está em xeque e não pode escapar', 'Quando os dois reis se encontram'], answer: 1 }, exercise: { ask: 'No xeque-mate, o rei pode escapar para uma casa segura?', options: ['Sim, sempre', 'Não há nenhuma saída legal', 'Só se mover duas casas'], answer: 1 }, piece: '♕', move: 'A dama protegida fecha todas as saídas.' },
    { title: 'Roque', icon: '♖', time: '5 min', intro: 'O roque é um movimento especial do rei com uma torre. O rei anda duas casas em direção à torre, que salta para o outro lado dele. Só vale se rei e torre ainda não se moveram, não houver peças no caminho e o rei não passar por xeque.', tip: 'Roque ajuda a proteger o rei. Lembre-se: nem o rei nem a torre podem ter se movido antes.', quiz: { ask: 'Quantas casas o rei anda durante o roque?', options: ['Uma', 'Duas', 'Três'], answer: 1 }, exercise: { ask: 'Qual peça também se move no roque?', options: ['Um bispo', 'A torre', 'A dama'], answer: 1 }, piece: '♔', move: 'No roque, o rei e a torre se movimentam juntos.' },
    { title: 'Aberturas básicas', icon: '⌘', time: '6 min', intro: 'No início da partida, tente ocupar o centro com peões, desenvolver cavalos e bispos e fazer o roque. Essas ideias ajudam suas peças a participar e deixam o rei mais seguro.', tip: 'Não precisa decorar dezenas de lances. Desenvolva as peças e dispute o centro com calma.', quiz: { ask: 'O que é uma boa ideia para começar a partida?', options: ['Mover várias vezes o mesmo peão', 'Desenvolver peças e disputar o centro', 'Levar a dama para um canto'], answer: 1 }, exercise: { ask: 'Qual peça costuma ser desenvolvida cedo para controlar o centro?', options: ['Cavalo', 'Rei', 'Peão da coluna h'], answer: 0 }, piece: '♘', move: 'Cavalos e bispos ajudam a controlar o centro.' },
    { title: 'Táticas', icon: '✦', time: '7 min', intro: 'Táticas são ideias curtas que criam uma vantagem. Procure peças desprotegidas, ataques duplos e peças que podem ser capturadas. Antes de cada lance, observe o que o adversário ameaça.', tip: 'Pergunte: “O que meu lance ameaça?” e “O que o outro lado pode capturar?”', quiz: { ask: 'O que é uma tática no xadrez?', options: ['Um plano de vários anos', 'Uma combinação curta que ganha vantagem', 'Uma regra de empate'], answer: 1 }, exercise: { ask: 'Qual é uma boa pergunta antes de fazer um lance?', options: ['O que meu lance ameaça?', 'Quantas casas tem o tabuleiro?', 'Posso mover duas vezes?'], answer: 0 }, piece: '♘', move: 'Uma peça pode criar uma ameaça dupla.' },
    { title: 'Finais', icon: '♙', time: '7 min', intro: 'No final, há menos peças no tabuleiro e o rei pode participar mais. Apoie seus peões com o rei e tente levá-los até a última fileira para promovê-los.', tip: 'No final, traga o rei para o jogo. Ele pode ajudar seus peões a avançar.', quiz: { ask: 'No final da partida, o rei pode...', options: ['Continuar escondido para sempre', 'Ajudar a apoiar os peões', 'Sair do tabuleiro'], answer: 1 }, exercise: { ask: 'O que pode acontecer quando um peão chega à última fileira?', options: ['Ele é removido', 'Pode ser promovido a outra peça', 'A partida acaba automaticamente'], answer: 1 }, piece: '♙', move: 'O peão pode avançar até a promoção.' },
    { title: 'Garfo', icon: '♘', time: '6 min', intro: 'O garfo é um ataque duplo: uma peça ameaça duas ou mais peças ao mesmo tempo. O cavalo é ótimo para isso, porque pode atacar peças distantes com um único salto.', tip: 'Quando o adversário precisa salvar uma peça, veja se outra fica vulnerável.', quiz: { ask: 'O que uma peça faz quando dá um garfo?', options: ['Ataca duas ou mais peças de uma vez', 'Protege o rei com o roque', 'Avança um peão duas casas'], answer: 0 }, exercise: { ask: 'Qual peça costuma ser especialmente boa para dar garfos?', options: ['Cavalo', 'Torre', 'Peão'], answer: 0 }, piece: '♘', move: 'Um salto pode ameaçar rei e dama ao mesmo tempo.' },
    { title: 'Cravada', icon: '♗', time: '6 min', intro: 'Uma peça está cravada quando não pode sair de uma linha de ataque sem expor uma peça mais valiosa atrás dela, como o rei. Bispos, torres e damas podem criar cravadas.', tip: 'Procure peças alinhadas com o rei ou com a dama adversária.', quiz: { ask: 'Por que uma peça cravada pode não conseguir se mover?', options: ['Porque sair da linha deixaria uma peça importante sob ataque', 'Porque só o rei pode se mover', 'Porque a partida está empatada'], answer: 0 }, exercise: { ask: 'Qual peça pode cravar uma peça numa diagonal?', options: ['Bispo', 'Cavalo', 'Peão'], answer: 0 }, piece: '♗', move: 'O bispo prende a peça que protege o rei.' },
    { title: 'Ataque descoberto', icon: '♖', time: '6 min', intro: 'No ataque descoberto, uma peça sai da frente e revela o ataque de outra peça que estava escondida. O lance pode criar duas ameaças ao mesmo tempo.', tip: 'Antes de mover uma peça, veja o que ela está escondendo na mesma linha ou diagonal.', quiz: { ask: 'O que acontece num ataque descoberto?', options: ['Uma peça abre o caminho de ataque de outra', 'O rei salta por cima da torre', 'Um peão captura para trás'], answer: 0 }, exercise: { ask: 'Qual combinação pode criar um ataque descoberto?', options: ['Mover a peça que está na frente de uma torre', 'Mover um peão bloqueado', 'Trocar de lado no tabuleiro'], answer: 0 }, piece: '♖', move: 'Ao sair da frente, a torre revela seu ataque.' },
    { title: 'Desvio e atração', icon: '✦', time: '7 min', intro: 'Desviar é afastar uma peça que está defendendo algo importante. Atrair é chamar uma peça para uma casa onde ela fica vulnerável. Essas ideias ajudam a abrir caminho para uma combinação.', tip: 'Descubra quem está defendendo a casa que você quer atacar.', quiz: { ask: 'O que é um desvio tático?', options: ['Afastar uma peça defensora de uma tarefa importante', 'Recuar todas as peças', 'Fazer dois roques seguidos'], answer: 0 }, exercise: { ask: 'Uma peça protege o rei e a dama. O que um desvio pode tentar fazer?', options: ['Afastá-la para criar uma oportunidade', 'Trocar sua cor', 'Bloquear o próprio rei'], answer: 0 }, piece: '♕', move: 'Um lance pode afastar o defensor da dama.' },
    { title: 'Planos de meio-jogo', icon: '⌘', time: '7 min', intro: 'No meio-jogo, escolha um plano simples: melhorar a pior peça, pressionar uma fraqueza ou abrir uma coluna para a torre. Um plano ajuda suas peças a trabalhar juntas.', tip: 'Pergunte qual peça sua está menos ativa e como ela pode melhorar.', quiz: { ask: 'Qual é um plano útil no meio-jogo?', options: ['Melhorar a peça menos ativa', 'Mover a mesma peça sem objetivo', 'Deixar o rei no centro sempre'], answer: 0 }, exercise: { ask: 'Sua torre está atrás dos próprios peões. O que pode ajudá-la?', options: ['Abrir uma coluna para ela', 'Trocá-la pelo rei', 'Mover um cavalo para o canto'], answer: 0 }, piece: '♖', move: 'Uma coluna aberta dá espaço para a torre.' },
    { title: 'Sacrifício tático', icon: '♕', time: '8 min', intro: 'Um sacrifício é entregar material de propósito para ganhar algo maior, como um ataque decisivo, uma peça de volta ou xeque-mate. Antes de sacrificar, calcule a resposta do adversário.', tip: 'Não sacrifique no impulso: confira se existe uma continuação concreta.', quiz: { ask: 'Por que um jogador pode sacrificar uma peça?', options: ['Para obter uma vantagem maior e calculada', 'Para terminar o próprio turno', 'Porque peças capturadas voltam ao tabuleiro'], answer: 0 }, exercise: { ask: 'O que fazer antes de um sacrifício?', options: ['Calcular a sequência e a resposta adversária', 'Olhar só para o primeiro lance', 'Ignorar o rei'], answer: 0 }, piece: '♕', move: 'Um sacrifício pode abrir uma rota para o mate.' },
    { title: 'Calcular variantes', icon: '♞', time: '8 min', intro: 'Calcular é imaginar lances e respostas antes de jogar. Comece pelos lances forçados: xeques, capturas e ameaças. Para cada opção, pense na melhor resposta do adversário.', tip: 'Visualize alguns lances sem tocar nas peças. Depois confira se a posição final é segura.', quiz: { ask: 'Quais lances vale a pena calcular primeiro?', options: ['Xeques, capturas e ameaças', 'Só movimentos de peão', 'Lances aleatórios'], answer: 0 }, exercise: { ask: 'Depois de encontrar um lance forte, qual é a próxima pergunta?', options: ['Qual é a melhor resposta do adversário?', 'Posso jogar de novo?', 'Quantas peças há no tabuleiro?'], answer: 0 }, piece: '♘', move: 'Imagine o lance e a resposta antes de jogar.' },
    { title: 'Mate com dama e rei', icon: '♔', time: '8 min', intro: 'Com dama e rei contra um rei sozinho, use a dama para reduzir o espaço do adversário e aproxime seu rei para ajudar. Dê o mate sem deixar o rei adversário afogado.', tip: 'Aproxime seu rei para apoiar a dama e deixe ao menos uma casa de fuga até o lance final.', quiz: { ask: 'O que ajuda a dar mate com dama e rei?', options: ['Aproximar o próprio rei para apoiar a dama', 'Afastar o rei para o canto oposto', 'Capturar o próprio peão'], answer: 0 }, exercise: { ask: 'O que deve ser evitado ao encurralar o rei sozinho?', options: ['Afogamento antes do mate', 'Proteger a dama', 'Usar o próprio rei'], answer: 0 }, piece: '♕', move: 'Dama e rei trabalham juntos para limitar as casas.' },
    { title: 'Finais de torre', icon: '♖', time: '8 min', intro: 'Nos finais de torre, mantenha a torre ativa e atrás dos peões passados sempre que possível. Uma torre ativa pode dar xeques e cortar o rei adversário do tabuleiro.', tip: 'Uma torre ativa costuma ser mais útil do que uma torre parada defendendo um peão.', quiz: { ask: 'Onde a torre costuma ficar bem contra um peão passado?', options: ['Atrás do peão', 'Na frente do próprio rei', 'No canto sem saída'], answer: 0 }, exercise: { ask: 'O que uma torre ativa pode fazer?', options: ['Dar xeques e cortar o rei adversário', 'Imitar o salto do cavalo', 'Mover na diagonal'], answer: 0 }, piece: '♖', move: 'A torre atrás do peão controla sua corrida.' },
    { title: 'Oposição no final', icon: '♔', time: '8 min', intro: 'Na oposição, os reis ficam frente a frente com uma casa entre eles. Quem não tem a vez pode impedir o avanço do outro rei. Essa ideia ajuda a escoltar um peão até a promoção.', tip: 'Conte as casas entre os reis e pense em quem vai precisar ceder passagem.', quiz: { ask: 'Para que serve a oposição entre reis?', options: ['Ganhar espaço e apoiar o avanço do peão', 'Permitir que o rei ande duas casas', 'Fazer um roque no final'], answer: 0 }, exercise: { ask: 'No final de peões, quem pode ganhar a oposição?', options: ['O rei que força o adversário a ceder passagem', 'A torre que não está no tabuleiro', 'O peão que anda para trás'], answer: 0 }, piece: '♙', move: 'O rei conquista a casa de passagem para o peão.' }
  ];

  const achievements = [
    { id: 'first', icon: '🌱', name: 'Primeiros passos', desc: 'Conclua sua primeira aula.', test: s => s.completed.length >= 1 },
    { id: 'three', icon: '📚', name: 'Curioso', desc: 'Conclua 3 aulas.', test: s => s.completed.length >= 3 },
    { id: 'seven', icon: '⭐', name: 'Meio do caminho', desc: 'Conclua 7 aulas.', test: s => s.completed.length >= 7 },
    { id: 'all', icon: '🏆', name: 'Mestre do tabuleiro', desc: 'Complete a trilha e vença o Piu.', test: s => s.completed.length >= lessons.length && s.bossWins > 0 },
    { id: 'boss', icon: '👑', name: 'Venceu o Boss', desc: 'Ganhe uma partida contra o Piu.', test: s => s.bossWins > 0 },
    { id: 'streak', icon: '🔥', name: 'Constância', desc: 'Mantenha uma sequência de 3 dias.', test: s => s.streak >= 3 },
    { id: 'xp', icon: '✨', name: 'Centena de XP', desc: 'Acumule 100 XP.', test: s => s.xp >= 100 }
  ];

  const challenges = [
    { title: 'A torre encontra a dama', prompt: 'Sua torre está na coluna a. Capture a dama adversária em a7.', tag: 'Qual peça pode capturar?', expected: { from: 'a4', to: 'a7' }, fen: '7k/q7/8/8/R7/8/8/K7 w - -', message: 'Boa! A torre percorreu a coluna e capturou a dama.' },
    { title: 'Mate em um lance', prompt: 'As brancas jogam. Encontre o xeque-mate em um lance.', tag: 'Encontre o xeque-mate', expected: { from: 'f7', to: 'g7' }, fen: '7k/5Q2/6K1/8/8/8/8/8 w - -', message: 'Xeque-mate! A dama está protegida pelo rei.' },
    { title: 'Salto do cavalo', prompt: 'Leve o cavalo de b1 até c3 com um salto em L.', tag: 'Mova o cavalo', expected: { from: 'b1', to: 'c3' }, fen: '4k3/8/8/8/8/8/8/KN6 w - -', message: 'Boa jogada! O cavalo chegou a c3.' },
    { title: 'Peão atento', prompt: 'O peão branco em e4 pode capturar a torre em d5. Faça a captura.', tag: 'Qual é a melhor jogada?', expected: { from: 'e4', to: 'd5' }, fen: '7k/8/8/3r4/4P3/8/8/K7 w - -', message: 'Boa! O peão captura na diagonal.' }
  ];

  function todayString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function yesterdayString() { const d = new Date(); d.setDate(d.getDate() - 1); return todayString(d); }
  function freshProgress() { return { xp: 0, completed: [], streak: 0, lastActive: '', solvedChallenges: [], bossWins: 0, playerName: 'Estrategista', avatar: 'piu', magnusUnlocked: false }; }
  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!parsed || typeof parsed !== 'object') return freshProgress();
      const magnusUnlocked = parsed.magnusUnlocked === true;
      const avatar = PROFILE_BIRDS.some(option => option.id === parsed.avatar) || (parsed.avatar === 'magnus' && magnusUnlocked) ? parsed.avatar : 'piu';
      return {
        xp: Number.isFinite(parsed.xp) && parsed.xp >= 0 ? parsed.xp : 0,
        completed: Array.isArray(parsed.completed) ? [...new Set(parsed.completed.filter(n => Number.isInteger(n) && n >= 0 && n < lessons.length))].sort((a,b) => a-b) : [],
        streak: Number.isFinite(parsed.streak) && parsed.streak >= 0 ? parsed.streak : 0,
        lastActive: typeof parsed.lastActive === 'string' ? parsed.lastActive : '',
        solvedChallenges: Array.isArray(parsed.solvedChallenges) ? [...new Set(parsed.solvedChallenges.filter(n => Number.isInteger(n) && n >= 0 && n < challenges.length))] : [],
        bossWins: Number.isInteger(parsed.bossWins) && parsed.bossWins >= 0 ? parsed.bossWins : 0,
        playerName: normalizePlayerName(parsed.playerName) || 'Estrategista',
        avatar,
        magnusUnlocked
      };
    } catch (error) { return freshProgress(); }
  }
  const progress = readProgress();
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch (error) { /* The lessons remain playable when storage is unavailable. */ }
  }
  function updateDailyStreak() {
    const today = todayString();
    if (progress.lastActive === today) return;
    progress.streak = progress.lastActive === yesterdayString() ? progress.streak + 1 : 1;
    progress.lastActive = today;
    persist();
  }
  updateDailyStreak();

  const ui = { page: 'home', lessonIndex: 0, lessonAnswers: {}, challengeIndex: 0, mode: 'puzzle', toast: '', toastTimer: null, profileTab: 'birds' };
  let game = fromFen(challenges[0].fen);
  const app = document.getElementById('app');

  function piece(type, color) { return type ? { type, color } : null; }
  function emptyBoard() { return Array.from({ length: 8 }, () => Array(8).fill(null)); }
  function createInitialGame() {
    const board = emptyBoard();
    const back = ['R','N','B','Q','K','B','N','R'];
    for (let c = 0; c < 8; c++) {
      board[0][c] = piece(back[c], 'b'); board[1][c] = piece('P', 'b');
      board[6][c] = piece('P', 'w'); board[7][c] = piece(back[c], 'w');
    }
    return { board, turn: 'w', castling: { wK: true, wQ: true, bK: true, bQ: true }, ep: null, selected: null, legal: [], lastMove: null, history: [], message: 'Brancas jogam. Selecione uma peça para ver seus movimentos.', error: false, checkmate: false, puzzleSolved: false, aiThinking: false, bossRewarded: false };
  }
  function fromFen(fen) {
    const [placement, active = 'w'] = fen.split(' ');
    const board = emptyBoard();
    placement.split('/').forEach((row, r) => {
      let c = 0;
      for (const char of row) {
        if (/\d/.test(char)) c += Number(char);
        else { const color = char === char.toUpperCase() ? 'w' : 'b'; board[r][c] = piece(char.toUpperCase(), color); c++; }
      }
    });
    return { board, turn: active, castling: { wK: false, wQ: false, bK: false, bQ: false }, ep: null, selected: null, legal: [], lastMove: null, history: [], message: 'Brancas jogam. Selecione uma peça para ver seus movimentos.', error: false, checkmate: false, puzzleSolved: false, aiThinking: false, bossRewarded: false };
  }
  function cloneGame(g) {
    return { ...g, board: g.board.map(row => row.map(p => p ? { ...p } : null)), castling: { ...g.castling }, ep: g.ep ? { ...g.ep } : null, selected: null, legal: [] };
  }
  function coord(r, c) { return `${FILES[c]}${8-r}`; }
  function parseSquare(square) { return { r: 8 - Number(square[1]), c: FILES.indexOf(square[0]) }; }
  function inside(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
  function opposite(color) { return color === 'w' ? 'b' : 'w'; }

  function isSquareAttacked(board, r, c, byColor) {
    const pawnSourceR = r + (byColor === 'w' ? 1 : -1);
    for (const dc of [-1, 1]) if (inside(pawnSourceR, c + dc)) {
      const p = board[pawnSourceR][c + dc]; if (p && p.color === byColor && p.type === 'P') return true;
    }
    const knightOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [dr,dc] of knightOffsets) if (inside(r+dr,c+dc)) { const p=board[r+dr][c+dc]; if (p && p.color===byColor && p.type==='N') return true; }
    for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) if (dr||dc) {
      if (inside(r+dr,c+dc)) { const p=board[r+dr][c+dc]; if (p && p.color===byColor && p.type==='K') return true; }
    }
    const rays = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    for (let i=0; i<rays.length; i++) {
      const [dr,dc] = rays[i]; let nr=r+dr, nc=c+dc, distance=1;
      while (inside(nr,nc)) {
        const p=board[nr][nc];
        if (p) {
          if (p.color===byColor && (p.type==='Q' || (i<4 && p.type==='R') || (i>=4 && p.type==='B'))) return true;
          break;
        }
        nr+=dr; nc+=dc; distance++;
      }
    }
    return false;
  }
  function kingPosition(board, color) {
    for (let r=0; r<8; r++) for (let c=0; c<8; c++) { const p=board[r][c]; if (p && p.color===color && p.type==='K') return { r,c }; }
    return null;
  }
  function isInCheck(g, color) { const k=kingPosition(g.board,color); return k ? isSquareAttacked(g.board,k.r,k.c,opposite(color)) : false; }

  function pseudoMoves(g, r, c) {
    const p=g.board[r][c]; if (!p) return [];
    const moves=[]; const add=(nr,nc,extra={})=>{ if (inside(nr,nc)) moves.push({ from:{r,c}, to:{r:nr,c:nc}, ...extra }); };
    const canLand=(nr,nc)=>inside(nr,nc) && (!g.board[nr][nc] || (g.board[nr][nc].color!==p.color && g.board[nr][nc].type!=='K'));
    if (p.type==='P') {
      const dir=p.color==='w'?-1:1, start=p.color==='w'?6:1, next=r+dir;
      if (inside(next,c) && !g.board[next][c]) {
        add(next,c);
        if (r===start && !g.board[r+2*dir][c]) add(r+2*dir,c,{doublePawn:true});
      }
      for (const dc of [-1,1]) if (inside(next,c+dc)) {
        const target=g.board[next][c+dc];
        if (target && target.color!==p.color && target.type!=='K') add(next,c+dc);
        else if (g.ep && g.ep.r===next && g.ep.c===c+dc) add(next,c+dc,{enPassant:true});
      }
    }
    if (p.type==='N') for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) if (canLand(r+dr,c+dc)) add(r+dr,c+dc);
    if (p.type==='K') {
      for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) if ((dr||dc) && canLand(r+dr,c+dc)) add(r+dr,c+dc);
      const home=p.color==='w'?7:0, enemy=opposite(p.color), rightK=p.color+'K', rightQ=p.color+'Q';
      if (r===home && c===4 && !isSquareAttacked(g.board,home,4,enemy)) {
        if (g.castling[rightK] && !g.board[home][5] && !g.board[home][6] && !isSquareAttacked(g.board,home,5,enemy) && !isSquareAttacked(g.board,home,6,enemy)) add(home,6,{castle:'K'});
        if (g.castling[rightQ] && !g.board[home][1] && !g.board[home][2] && !g.board[home][3] && !isSquareAttacked(g.board,home,3,enemy) && !isSquareAttacked(g.board,home,2,enemy)) add(home,2,{castle:'Q'});
      }
    }
    if (p.type==='R' || p.type==='B' || p.type==='Q') {
      const dirs=[];
      if (p.type==='R' || p.type==='Q') dirs.push([1,0],[-1,0],[0,1],[0,-1]);
      if (p.type==='B' || p.type==='Q') dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
      for (const [dr,dc] of dirs) { let nr=r+dr,nc=c+dc; while(inside(nr,nc)) { const target=g.board[nr][nc]; if (!target) add(nr,nc); else { if(target.color!==p.color && target.type!=='K') add(nr,nc); break; } nr+=dr; nc+=dc; } }
    }
    return moves;
  }
  function applyRaw(g, move) {
    const next=cloneGame(g), from=move.from, to=move.to, moving=next.board[from.r][from.c];
    if (!moving) return next;
    const captured=next.board[to.r][to.c];
    next.board[from.r][from.c]=null;
    if (move.enPassant) next.board[from.r][to.c]=null;
    next.board[to.r][to.c]=moving;
    if (moving.type==='P' && (to.r===0 || to.r===7)) next.board[to.r][to.c]=piece('Q',moving.color);
    if (move.castle) {
      const row=from.r;
      if (move.castle==='K') { next.board[row][5]=next.board[row][7]; next.board[row][7]=null; }
      else { next.board[row][3]=next.board[row][0]; next.board[row][0]=null; }
    }
    if (moving.type==='K') { next.castling[moving.color+'K']=false; next.castling[moving.color+'Q']=false; }
    if (moving.type==='R') {
      if (from.r===7 && from.c===0) next.castling.wQ=false;
      if (from.r===7 && from.c===7) next.castling.wK=false;
      if (from.r===0 && from.c===0) next.castling.bQ=false;
      if (from.r===0 && from.c===7) next.castling.bK=false;
    }
    if (captured && captured.type==='R') {
      if (to.r===7 && to.c===0) next.castling.wQ=false;
      if (to.r===7 && to.c===7) next.castling.wK=false;
      if (to.r===0 && to.c===0) next.castling.bQ=false;
      if (to.r===0 && to.c===7) next.castling.bK=false;
    }
    next.ep=moving.type==='P' && Math.abs(to.r-from.r)===2 ? { r:(to.r+from.r)/2, c:from.c } : null;
    next.turn=opposite(moving.color);
    return next;
  }
  function legalMovesFrom(g,r,c) {
    const p=g.board[r][c]; if (!p || p.color!==g.turn) return [];
    return pseudoMoves(g,r,c).filter(m=>!isInCheck(applyRaw(g,m),p.color));
  }
  function allLegalMoves(g,color) {
    const original=g.turn; const copy={...g,turn:color}; const all=[];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) { const p=g.board[r][c]; if(p && p.color===color) all.push(...legalMovesFrom(copy,r,c)); }
    return all;
  }
  function moveLabel(p,move,capture) {
    if (move.castle) return move.castle==='K'?'O-O':'O-O-O';
    const prefix=p.type==='P' ? (capture ? FILES[move.from.c] : '') : p.type;
    return `${prefix}${capture?'×':''}${coord(move.to.r,move.to.c)}`;
  }

  function mascotBird() {
    return `<svg class="bird-mascot" viewBox="0 0 200 200" role="img" aria-label="Piu, passarinho verde que ensina xadrez">
      <ellipse cx="103" cy="171" rx="49" ry="9" fill="#145d36" opacity=".18"/>
      <path d="M50 111c0-40 27-70 66-70 29 0 53 21 56 52 2 22-8 42-27 52l-3 14-25-7c-29 5-57-10-65-41z" fill="#b7ef74" stroke="#17643d" stroke-width="5" stroke-linejoin="round"/>
      <path d="M60 119c10 14 25 22 44 24-8 9-20 14-32 12l-15 12 1-23c-6-8-9-17-9-27z" fill="#77cc61" stroke="#17643d" stroke-width="4" stroke-linejoin="round"/>
      <path d="M75 53c12-13 29-20 48-18-8 10-17 16-28 20" fill="#48ac58" stroke="#17643d" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="130" cy="89" rx="22" ry="25" fill="#fffdf5" stroke="#17643d" stroke-width="4"/>
      <ellipse cx="137" cy="91" rx="7" ry="10" fill="#24372b"/><circle cx="140" cy="87" r="3" fill="#fff"/>
      <path d="M151 112c9-3 17-2 25 3-7 9-17 12-28 9" fill="#f4a849" stroke="#17643d" stroke-width="4" stroke-linejoin="round"/>
      <path d="M90 148l-5 12m26-9 1 12" stroke="#e99337" stroke-width="6" stroke-linecap="round"/>
      <path d="M77 101c6-7 13-8 20-5" fill="none" stroke="#398d4e" stroke-width="4" stroke-linecap="round"/>
      <path d="M123 48l5-10m12 13 10-7" stroke="#f7d06e" stroke-width="4" stroke-linecap="round"/>
      <path d="M91 66c7 5 12 10 14 16" fill="none" stroke="#89d466" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }

  const navItems = [
    { id: 'home', icon: '⌂', label: 'Início' },
    { id: 'path', icon: '♧', label: 'Trilha de aulas' },
    { id: 'practice', icon: '♟', label: 'Praticar' },
    { id: 'profile', icon: '◎', label: 'Meu perfil' }
  ];
  function navMarkup(className='nav-list') {
    return `<nav class="${className}" aria-label="Navegação principal">${navItems.map(item => `<button type="button" class="nav-link ${ui.page===item.id?'active':''}" data-page="${item.id}" ${ui.page===item.id?'aria-current="page"':''}><span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span></button>`).join('')}</nav>`;
  }
  function totalLevelCount() { return lessons.length + 1; }
  function currentLevel() { return Math.min(progress.completed.length + 1, totalLevelCount()); }
  function currentAccountLevel() { return Math.floor(progress.xp / 100) + 1; }
  function percentComplete() { return Math.round((progress.completed.length / lessons.length) * 100); }
  function nextLessonIndex() { return progress.completed.length < lessons.length ? progress.completed.length : lessons.length - 1; }
  function pageTitle() {
    if (ui.page==='lesson') return lessons[ui.lessonIndex].title;
    return ({ home:'Início', path:'Trilha de aulas', practice:'Praticar', profile:'Meu perfil' })[ui.page] || 'Piu Xadrez';
  }
  function headerMarkup() {
    return `<header class="topbar"><div class="breadcrumb">Piu Xadrez <span aria-hidden="true">›</span> <strong>${pageTitle()}</strong></div><div class="top-profile"><div class="top-xp"><span aria-hidden="true">✦</span> ${progress.xp} XP</div>${avatarVisual(progress.avatar,'avatar')}<span class="player-name">${escapeHtml(progress.playerName)}</span></div></header>`;
  }
  function shell(content) {
    return `<div class="layout"><aside class="sidebar"><div class="brand"><span class="brand-mark" aria-hidden="true">♞</span><span>Piu Xadrez</span></div><div class="nav-label">Aprender</div>${navMarkup()}<div class="sidebar-spacer"></div><div class="side-streak"><span class="flame" aria-hidden="true">🔥</span><strong>${progress.streak} ${progress.streak===1?'dia':'dias'} de sequência</strong><p>Uma aula por dia e logo você vira mestre do tabuleiro.</p></div><div class="sidebar-footer">Feito para aprender, lance a lance.</div></aside><div class="main-column">${headerMarkup()}<main class="page-content">${content}</main></div>${navMarkup('mobile-nav')}${ui.toast?`<div class="toast" role="status">${ui.toast}</div>`:''}</div>`;
  }

  function homeView() {
    const bossUnlocked=progress.completed.length>=lessons.length;
    const next=nextLessonIndex(), lesson=lessons[next], first=!progress.completed.length;
    return `<section aria-labelledby="welcome-title"><div class="hero-card"><div class="hero-copy"><p class="eyebrow">Seu cantinho de xadrez</p><h1 id="welcome-title">${first?`Vamos jogar, ${escapeHtml(progress.playerName)}?`:'Que bom ter você de volta!'}</h1><p>Aprenda xadrez jogando! A cada lance, uma nova descoberta.</p><div class="hero-actions"><button type="button" class="button button-primary" data-action="start">${first?'COMEÇAR':bossUnlocked?'JOGAR CONTRA O PIU':'CONTINUAR APRENDENDO'} <span aria-hidden="true">→</span></button><button type="button" class="button button-soft" data-page="path">Ver a trilha</button></div></div><div class="hero-art">${mascotBird()}<div class="mascot-caption">Oi! Eu sou o Piu 👋</div></div></div>
      <div class="stats-grid"><article class="stat-card"><div class="stat-top"><span>Nível atual</span><span class="stat-icon">🏅</span></div><div class="stat-number">${currentLevel()} <small>de ${totalLevelCount()}</small></div></article><article class="stat-card"><div class="stat-top"><span>Experiência</span><span class="stat-icon">✦</span></div><div class="stat-number">${progress.xp} <small>XP</small></div></article><article class="stat-card"><div class="stat-top"><span>Sequência</span><span class="stat-icon">🔥</span></div><div class="stat-number">${progress.streak} <small>${progress.streak===1?'dia':'dias'}</small></div></article></div>
      <div class="section-heading"><h2>Sua próxima jogada</h2><button type="button" class="text-button" data-page="path">Ver todas as aulas →</button></div>
      <div class="home-grid"><article class="card continue-card"><div class="continue-copy"><span class="lesson-pill">${bossUnlocked?'NÍVEL BOSS':'AULA '+(next+1)+' · '+lesson.time}</span><h3>${bossUnlocked?'Desafie o Piu':lesson.title}</h3><p>${bossUnlocked?'Você chegou ao final da trilha. Agora é sua vez de jogar contra o Piu!':'Uma nova etapa para aprender no seu ritmo.'}</p><div class="mini-progress" aria-label="${percentComplete()}% das aulas concluídas"><span style="width:${percentComplete()}%"></span></div></div><button type="button" class="button button-green" data-action="${bossUnlocked?'boss':'continue'}">${bossUnlocked?'JOGAR':'CONTINUAR'} <span aria-hidden="true">→</span></button></article><article class="card bird-tip">${mascotBird()}<div><strong>Piu te lembra</strong><p>“Cada grande jogador começou aprendendo um lance. Vamos nessa!”</p></div></article></div>
      <div class="section-heading"><h2>Seu progresso</h2><button type="button" class="text-button" data-page="profile">Ver perfil →</button></div><article class="card" style="padding:18px 20px"><div class="path-progress-meta"><span>${progress.completed.length} de ${lessons.length} aulas concluídas</span><span>${percentComplete()}%</span></div><div class="progress-track"><span style="width:${percentComplete()}%"></span></div></article>
    </section>`;
  }

  function lessonDifficulty(index) {
    if (index < 13) return 'Iniciante';
    if (index < 18) return 'Médio';
    return 'Difícil';
  }
  function pathView() {
    const openCount=Math.min(progress.completed.length+1,lessons.length);
    const bossUnlocked=progress.completed.length>=lessons.length;
    const sectionNames={0:'Iniciante · fundamentos',13:'Médio · estratégia e táticas',18:'Difícil · cálculo e finais'};
    const lessonCards=lessons.map((lesson,index)=>{
      const done=progress.completed.includes(index), unlocked=index<openCount || done, status=done?'Concluída':unlocked?'Disponível':'Bloqueada';
      const heading=sectionNames[index]?`<div class="path-section-heading">${sectionNames[index]}</div>`:'';
      return `${heading}<article class="lesson-card ${done?'done':''} ${unlocked?'open':'locked'}" ${unlocked?`data-lesson="${index}" role="button" tabindex="0" aria-label="Abrir aula ${index+1}: ${lesson.title}"`:''}><div class="lesson-number">${done?'✓':index+1}</div><div class="lesson-meta"><strong><span class="lesson-emoji" aria-hidden="true">${lesson.icon}</span>Nível ${index+1} — ${lesson.title}</strong><span>${lessonDifficulty(index)} · ${lesson.time} · ${status}</span></div><div class="lesson-cta">${done?'REVER':unlocked?'COMEÇAR':'🔒'} <span aria-hidden="true">${unlocked?'→':''}</span></div></article>`;
    }).join('');
    const bossCard=`<div class="path-section-heading">Desafio final</div><article class="lesson-card boss-card ${bossUnlocked?'open':'locked'} ${progress.bossWins?'done':''}" data-boss="true" role="button" tabindex="0" aria-label="${bossUnlocked?'Jogar contra o Piu':'Boss bloqueado: conclua as aulas'}"><div class="lesson-number">${progress.bossWins?'✓':'♚'}</div><div class="lesson-meta"><strong>Nível ${totalLevelCount()} — Boss: contra o Piu</strong><span>${bossUnlocked?'Jogue de brancas contra o Piu · Vitórias: '+progress.bossWins:'Conclua as '+lessons.length+' aulas para desbloquear'}</span></div><div class="lesson-cta">${bossUnlocked?'JOGAR':'🔒'} <span aria-hidden="true">${bossUnlocked?'→':''}</span></div></article>`;
    return `<section aria-labelledby="path-title"><div class="path-header"><div><p class="eyebrow">Sua jornada</p><h1 id="path-title">Trilha de aprendizado</h1><p class="subheading" style="margin:6px 0 0">Iniciante, médio e difícil. Depois, enfrente o Piu no Boss!</p></div><article class="card path-progress-card"><div class="path-progress-meta"><span>Seu progresso</span><span>${progress.completed.length}/${lessons.length} aulas</span></div><div class="progress-track"><span style="width:${percentComplete()}%"></span></div></article></div><div class="path-list">${lessonCards}${bossCard}</div></section>`;
  }

  function miniBoard(index) {
    const symbols=Array(16).fill('');
    const visualPiece=lessons[index].piece;
    const from=10, to=5;
    symbols[from]=visualPiece;
    if(index!==0 && index!==6 && index!==7 && index!==8) symbols[to]='•';
    if(index===0) symbols[15]='';
    if(index===7) { symbols[1]='♚'; symbols[13]='♜'; }
    if(index===8) { symbols[3]='♚'; symbols[10]='♕'; }
    return `<div class="mini-board" aria-label="Exemplo visual do movimento">${symbols.map((symbol,i)=>`<div class="mini-square ${Math.floor(i/4)%2===i%2?'light':'dark'} ${symbol==='•'?'marked':''}"><span>${symbol==='•'?'':symbol}</span></div>`).join('')}</div>`;
  }
  function answerBlock(stage, question, answerState) {
    const done=answerState && answerState.correct;
    const selected=answerState ? answerState.selected : -1;
    const feedback=done?'Boa! Resposta certa.':answerState && selected>=0?'Quase! Tente novamente.':'';
    return `<div class="question-block"><div class="question-count">${stage==='quiz'?'Pergunta rápida':'Exercício'}</div><h3>${question.ask}</h3><div class="answer-list">${question.options.map((option,index)=>{
      const cls=selected===index?(done?'selected-correct':'selected-wrong'):'';
      return `<button type="button" class="answer-option ${cls}" data-answer="${stage}" data-index="${index}" ${done?'disabled':''}><span class="answer-letter">${String.fromCharCode(65+index)}</span>${option}</button>`;
    }).join('')}</div><div class="answer-feedback ${done?'good':''}" role="status">${feedback}</div></div>`;
  }
  function lessonView() {
    const i=ui.lessonIndex, lesson=lessons[i], answers=ui.lessonAnswers;
    const allCorrect=!!(answers.quiz?.correct && answers.exercise?.correct);
    const complete=progress.completed.includes(i);
    return `<section aria-labelledby="lesson-title"><div class="lesson-topline"><button type="button" class="back-button" data-page="path"><span aria-hidden="true">←</span> Trilha</button><span class="lesson-pill" style="margin:0">NÍVEL ${i+1} DE ${totalLevelCount()}</span></div><div class="lesson-layout"><article class="card lesson-main-card"><p class="eyebrow">${lesson.time} de aprendizado</p><h1 id="lesson-title">${lesson.icon} ${lesson.title}</h1><p class="lesson-description">${lesson.intro}</p><div class="visual-example">${miniBoard(i)}<div class="visual-caption"><strong>Veja a ideia no tabuleiro</strong>${lesson.move}<br>As peças do xadrez seguem movimentos próprios. Pratique e observe cada casa.</div></div><div class="coach-note"><span class="note-emoji" aria-hidden="true">🐦</span><span>${lesson.tip}</span></div>${answerBlock('quiz',lesson.quiz,answers.quiz)}${answerBlock('exercise',lesson.exercise,answers.exercise)}</article><aside class="lesson-sidebar"><article class="card lesson-summary"><h3>Resumo da aula</h3><p>Responda à pergunta e complete o exercício. Você pode tentar quantas vezes precisar.</p><div class="summary-line"><span>Etapas</span><strong>${Number(!!answers.quiz?.correct)+Number(!!answers.exercise?.correct)}/2</strong></div><div class="summary-line"><span>Recompensa</span><strong>+25 XP ✦</strong></div><div class="summary-line"><span>Status</span><strong>${complete?'Concluída':allCorrect?'Pronta!':'Em andamento'}</strong></div><button type="button" class="button button-green lesson-complete" data-action="complete-lesson" ${(!allCorrect && !complete)?'disabled':''}>${complete?'Aula concluída ✓':allCorrect?'Concluir aula +25 XP':'Responder para concluir'}</button></article><div class="unlock-note"><strong>🎯 Dica do Piu</strong>Leia com calma e experimente as respostas. Errar também faz parte de aprender!</div></aside></div></section>`;
  }

  function squareName(r,c) {
    const p=game.board[r][c];
    return `${coord(r,c)}${p?`, ${p.color==='w'?'branca':'preta'}: ${PIECE_NAMES[p.type]}`:''}`;
  }
  function boardMarkup() {
    const checkedKing=kingPosition(game.board,game.turn), checkSquare=isInCheck(game,game.turn)?checkedKing:null;
    const cells=[];
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p=game.board[r][c], selected=game.selected && game.selected.r===r && game.selected.c===c;
      const legal=game.legal.find(m=>m.to.r===r && m.to.c===c);
      const last=game.lastMove && ((game.lastMove.from.r===r&&game.lastMove.from.c===c)||(game.lastMove.to.r===r&&game.lastMove.to.c===c));
      const inCheck=checkSquare && checkSquare.r===r && checkSquare.c===c;
      const glyph=p?PIECE_GLYPHS[p.color==='w'?p.type:p.type.toLowerCase()]||'':'';
      const label=squareName(r,c);
      cells.push(`<button type="button" class="square ${(r+c)%2?'dark-square':'light-square'} ${selected?'selected-square':''} ${legal?(game.board[r][c]?'legal-capture':'legal-square'):''} ${last?'last-move':''} ${inCheck?'in-check':''}" data-square="${r},${c}" aria-label="Casa ${label}" aria-pressed="${selected?'true':'false'}">${glyph?`<span class="piece ${p.color==='w'?'white-piece':'black-piece'}" aria-hidden="true">${glyph}</span>`:''}</button>`);
    }
    return `<div class="board-frame"><div class="rank-labels" aria-hidden="true">${[8,7,6,5,4,3,2,1].map(n=>`<span>${n}</span>`).join('')}</div><div class="chessboard" role="grid" aria-label="Tabuleiro de xadrez">${cells.join('')}</div><div class="file-labels" aria-hidden="true">${FILES.split('').map(f=>`<span>${f}</span>`).join('')}</div></div>`;
  }
  function boardView() {
    const challenge=challenges[ui.challengeIndex];
    const isPuzzle=ui.mode==='puzzle', isBoss=ui.mode==='boss';
    const title=isPuzzle?challenge.title:isBoss?'Você contra o Piu':'Jogo livre';
    const turn=game.checkmate?'Partida encerrada':isBoss?(game.aiThinking?'Piu pensando…':game.turn==='w'?'Sua vez · brancas':'Piu joga · pretas'):`Vez das ${game.turn==='w'?'brancas':'pretas'}`;
    let challengeActions;
    if(isPuzzle) challengeActions=`<div class="challenge-dots">${challenges.map((_,i)=>`<span class="challenge-dot ${i===ui.challengeIndex?'active':''} ${progress.solvedChallenges.includes(i)?'done':''}"></span>`).join('')}</div><button type="button" class="button button-green" style="margin-top:15px" data-action="${game.puzzleSolved?'next-challenge':'reset-challenge'}">${game.puzzleSolved?'Próximo desafio →':'Tentar novamente'}</button><button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="free-play">Quero jogar livremente</button>`;
    else if(isBoss) challengeActions=`<div class="boss-opponent">${mascotBird()}<div><strong>Piu, nível Boss</strong><span>Você joga de brancas. Piu responde de pretas.</span></div></div><p class="boss-reward">Vença o Piu e ganhe 50 XP. ${progress.bossWins?`Vitórias: ${progress.bossWins}`:''}</p><button type="button" class="button button-green" data-action="rematch-piu">${game.checkmate?'Jogar outra vez':'Recomeçar partida'}</button><button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="puzzles">Voltar aos desafios</button>`;
    else challengeActions=`<button type="button" class="button button-green" data-action="reset-board">Nova partida</button><button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="puzzles">Voltar aos desafios</button>${progress.completed.length>=lessons.length?`<button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="boss">Desafiar o Piu</button>`:''}`;
    const subtitle=isBoss?'Encontre seus melhores lances. O Piu joga pelas pretas e responde automaticamente.':'Clique em uma peça para ver os movimentos legais e escolha uma casa destacada.';
    return `<section aria-labelledby="practice-title"><p class="eyebrow">${isBoss?'Nível Boss':'Hora de colocar em prática'}</p><h1 id="practice-title">${isBoss?'Partida contra o Piu':'Vamos jogar?'}</h1><p class="subheading">${subtitle}</p><div class="practice-layout"><article class="card board-card"><div class="board-top"><h2>${isPuzzle?'Desafio do momento':isBoss?'Nível Boss · Piu':'Tabuleiro livre'}</h2><span class="turn-pill">${turn}</span></div>${boardMarkup()}<div class="board-status ${game.error?'error':''}" role="status">${game.message}</div><div class="board-controls">${ui.mode==='free'?`<button type="button" class="button button-outline button-small" data-action="reset-board">Reiniciar tabuleiro</button>`:''}</div></article><aside class="practice-side"><article class="card challenge-card"><span class="challenge-tag">${isPuzzle?challenge.tag:isBoss?'BOSS FINAL':'Treino livre'}</span><h2>${title}</h2><p>${isPuzzle?challenge.prompt:isBoss?'Você controla as brancas. O Piu controla as pretas e faz um lance depois de cada jogada sua.':'Mova as peças brancas e pretas alternando os turnos. As regras legais, o xeque e o xeque-mate são verificados automaticamente.'}</p>${challengeActions}</article><article class="card how-card"><h3>Como jogar</h3><p><strong>1.</strong> Selecione uma peça da vez.<br><strong>2.</strong> As casas possíveis ficam destacadas.<br><strong>3.</strong> Clique em uma casa para mover.</p><div class="move-list"><strong>Últimos lances</strong><br>${game.history.length?game.history.slice(-6).map((move,i)=>`${Math.max(1,Math.ceil((game.history.length-5)/2)+Math.floor(i/2))}${i%2===0?'.':'...'} ${move}`).join(' &nbsp; '):'Seus lances aparecerão aqui.'}</div></article></aside></div></section>`;
  }

  function profileView() {
    const unlocked=achievements.filter(a=>a.test(progress)).length;
    const avatarOptions = PROFILE_BIRDS.map(option=>({ ...option, isPhoto: false }));
    if(progress.magnusUnlocked) avatarOptions.push({ id:'magnus', name:'Magnus Carlsen', isPhoto:true });
    const avatarChoices = avatarOptions.map(option=>`<button type="button" class="avatar-choice ${progress.avatar===option.id?'selected':''}" data-avatar="${option.id}" aria-pressed="${progress.avatar===option.id}" aria-label="Usar avatar ${option.name}">${option.isPhoto?`<img src="${MAGNUS_PHOTO}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span aria-hidden="true">${option.emoji}</span>`}<strong>${option.name}</strong>${progress.avatar===option.id?'<span class="avatar-selected-mark" aria-label="Selecionado">✓</span>':''}</button>`).join('');
    const birdPanel = `<div class="profile-tab-panel" role="tabpanel" id="profile-birds-panel" ${ui.profileTab==='birds'?'':'hidden'}><p>Escolha uma ave para aparecer no seu perfil.</p><div class="avatar-options">${avatarChoices}</div>${progress.magnusUnlocked?`<p class="photo-credit">Foto: <a href="${MAGNUS_SOURCE}" target="_blank" rel="noreferrer">Stefan64 / Wikimedia Commons</a> · <a href="${MAGNUS_LICENSE}" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>.</p>`:''}</div>`;
    const codePanel = `<div class="profile-tab-panel" role="tabpanel" id="profile-code-panel" ${ui.profileTab==='code'?'':'hidden'}><p>Tem um código especial? Digite aqui para liberar um avatar surpresa.</p><form class="unlock-code-form" data-profile-form="unlock-magnus"><label for="unlock-code">Código secreto</label><div class="profile-form-row"><input id="unlock-code" name="code" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="Digite o código" aria-describedby="unlock-code-hint"><button type="submit" class="button button-green">Desbloquear</button></div><small id="unlock-code-hint">O código libera uma foto especial de perfil.</small></form>${progress.magnusUnlocked?'<div class="unlock-success" role="status">✓ Foto especial desbloqueada! Encontre-a na aba Aves.</div>':''}</div>`;
    return `<section aria-labelledby="profile-title"><p class="eyebrow">Seu caminho até aqui</p><h1 id="profile-title">Meu perfil</h1><p class="subheading">Cada partida e cada aula fazem parte da sua evolução.</p><article class="card profile-hero">${avatarVisual(progress.avatar,'profile-avatar')}<div><h2>${escapeHtml(progress.playerName)}</h2><p>Aprendiz de xadrez · Nível ${currentAccountLevel()}</p></div><div class="profile-xp"><strong>${progress.xp} XP</strong><span>${progress.xp%100}/100 para o próximo nível</span></div></article><article class="card profile-editor"><h2>Personalize seu perfil</h2><form class="profile-name-form" data-profile-form="player-name"><label for="player-name">Seu nome</label><div class="profile-form-row"><input id="player-name" name="playerName" type="text" maxlength="24" value="${escapeHtml(progress.playerName)}" autocomplete="nickname" placeholder="Como quer ser chamado?"><button type="submit" class="button button-green">Salvar nome</button></div></form><div class="profile-tabs" role="tablist" aria-label="Opções da foto de perfil"><button type="button" class="profile-tab ${ui.profileTab==='birds'?'active':''}" data-profile-tab="birds" role="tab" aria-selected="${ui.profileTab==='birds'}" aria-controls="profile-birds-panel">Aves</button><button type="button" class="profile-tab ${ui.profileTab==='code'?'active':''}" data-profile-tab="code" role="tab" aria-selected="${ui.profileTab==='code'}" aria-controls="profile-code-panel">Código secreto</button></div>${birdPanel}${codePanel}</article><div class="profile-grid"><article class="card profile-stat"><div class="stat-top">Nível da trilha<span>📖</span></div><div class="stat-number">${currentLevel()} <small>de ${totalLevelCount()}</small></div></article><article class="card profile-stat"><div class="stat-top">Aulas concluídas<span>✅</span></div><div class="stat-number">${progress.completed.length} <small>de ${lessons.length}</small></div></article><article class="card profile-stat"><div class="stat-top">Sequência atual<span>🔥</span></div><div class="stat-number">${progress.streak} <small>${progress.streak===1?'dia':'dias'}</small></div></article></div><div class="section-heading"><h2>Conquistas</h2><span class="text-button" style="cursor:default">${unlocked} de ${achievements.length} desbloqueadas</span></div><div class="achievement-grid">${achievements.map(a=>`<article class="achievement ${a.test(progress)?'':'locked'}"><div class="achievement-icon" aria-hidden="true">${a.icon}</div><div><strong>${a.name}</strong><span>${a.desc}</span></div></article>`).join('')}</div><div class="section-heading"><h2>Progresso da trilha</h2></div><article class="card" style="padding:18px 20px;margin-bottom:16px"><div class="path-progress-meta"><span>${progress.completed.length} aulas concluídas · ${progress.bossWins} vitórias contra o Piu</span><span>${percentComplete()}%</span></div><div class="progress-track"><span style="width:${percentComplete()}%"></span></div></article><article class="card settings-card"><div><h3>Dados neste navegador</h3><p>Seu XP, aulas e sequência ficam salvos neste dispositivo.</p></div><button type="button" class="button button-outline button-small" data-action="reset-progress">Zerar progresso</button></article></section>`;
  }

  function submitProfileForm(form) {
    if(form.dataset.profileForm==='player-name') {
      const name=normalizePlayerName(form.elements.playerName.value);
      if(!name) { showToast('Digite um nome para seu perfil.'); return; }
      progress.playerName=name; persist(); render(); showToast('Nome atualizado!');
    } else if(form.dataset.profileForm==='unlock-magnus') {
      const code=String(form.elements.code.value || '').trim();
      if(code!=='6742') { showToast('Esse código não confere. Tente novamente!'); return; }
      progress.magnusUnlocked=true; persist(); ui.profileTab='birds'; render(); showToast('Foto especial desbloqueada! Escolha o Magnus na aba Aves.');
    }
  }
  function selectProfileAvatar(avatarId) {
    const allowed = PROFILE_BIRDS.some(option=>option.id===avatarId) || (avatarId==='magnus' && progress.magnusUnlocked);
    if(!allowed) { showToast('Desbloqueie esse avatar primeiro.'); return; }
    progress.avatar=avatarId; persist(); render();
    const selected=avatarId==='magnus'?'Magnus Carlsen':PROFILE_BIRDS.find(option=>option.id===avatarId).name;
    showToast(`Foto de perfil alterada para ${selected}!`);
  }

  function render() {
    let content='';
    if(ui.page==='home') content=homeView();
    else if(ui.page==='path') content=pathView();
    else if(ui.page==='lesson') content=lessonView();
    else if(ui.page==='practice') content=boardView();
    else if(ui.page==='profile') content=profileView();
    app.innerHTML=shell(content);
  }
  function showToast(message) {
    ui.toast=message; render();
    if(ui.toastTimer) clearTimeout(ui.toastTimer);
    ui.toastTimer=setTimeout(()=>{ui.toast='';render();},2200);
  }
  function openLesson(index) {
    if(index>progress.completed.length && !progress.completed.includes(index)) { showToast('Conclua a aula anterior para desbloquear esta.'); return; }
    ui.lessonIndex=index;
    ui.lessonAnswers=progress.completed.includes(index)?{ quiz:{selected:lessons[index].quiz.answer,correct:true}, exercise:{selected:lessons[index].exercise.answer,correct:true} }:{};
    ui.page='lesson'; render();
  }
  function startLearning() {
    if (progress.completed.length>=lessons.length) startBoss();
    else openLesson(nextLessonIndex());
  }
  function answerQuestion(stage,index) {
    const question=lessons[ui.lessonIndex][stage];
    if(!ui.lessonAnswers[stage]?.correct) ui.lessonAnswers[stage]={selected:index,correct:index===question.answer};
    if(ui.lessonAnswers[stage].correct) {
      ui.lessonAnswers[stage].selected=question.answer;
      const other=stage==='quiz'?'exercise':'quiz';
      if(ui.lessonAnswers[other]?.correct) ui.lessonAnswers[stage].correct=true;
    }
    render();
  }
  function completeLesson() {
    const i=ui.lessonIndex, answers=ui.lessonAnswers;
    if(!(answers.quiz?.correct && answers.exercise?.correct)) { showToast('Responda às duas etapas para concluir.'); return; }
    if(progress.completed.includes(i)) { showToast('Aula já concluída. Boa revisão!'); return; }
    progress.completed.push(i); progress.completed.sort((a,b)=>a-b); progress.xp+=25; persist();
    ui.lessonAnswers={quiz:{selected:lessons[i].quiz.answer,correct:true},exercise:{selected:lessons[i].exercise.answer,correct:true}};
    render(); showToast('Aula concluída! +25 XP ✦');
  }
  function setChallenge(index) {
    ui.challengeIndex=(index+challenges.length)%challenges.length;
    ui.mode='puzzle'; game=fromFen(challenges[ui.challengeIndex].fen); render();
  }
  function startBoss() {
    if (progress.completed.length<lessons.length) { showToast('Conclua as aulas difíceis para desbloquear o Boss.'); return; }
    ui.mode='boss'; ui.page='practice'; game=createInitialGame(); render();
  }
  function updateGameMessage(message,error=false) { game.message=message; game.error=error; }
  function materialScore(g,color='b') {
    const values={P:1,N:3,B:3,R:5,Q:9,K:0}; let score=0;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) {
      const p=g.board[r][c]; if(p) score+=(p.color===color?1:-1)*values[p.type];
    }
    return score;
  }
  function moveCenterBonus(move) {
    const centerDistance=Math.abs(3.5-move.to.c)+Math.abs(3.5-move.to.r);
    return (7-centerDistance)*0.035;
  }
  function choosePiuMove(position) {
    const options=allLegalMoves(position,'b');
    if(!options.length) return null;
    let bestScore=-Infinity, bestMoves=[];
    for(const move of options) {
      const afterPiu=applyRaw(position,move);
      const whiteReplies=allLegalMoves(afterPiu,'w');
      let score;
      if(isInCheck(afterPiu,'w') && whiteReplies.length===0) score=10000;
      else if(!whiteReplies.length) score=0;
      else {
        let worstReply=Infinity;
        for(const reply of whiteReplies) {
          const afterReply=applyRaw(afterPiu,reply);
          const blackReplies=allLegalMoves(afterReply,'b');
          const piuMated=isInCheck(afterReply,'b') && blackReplies.length===0;
          const replyScore=piuMated?-10000:materialScore(afterReply,'b');
          if(replyScore<worstReply) worstReply=replyScore;
        }
        score=worstReply;
      }
      score+=moveCenterBonus(move);
      if(isInCheck(afterPiu,'w')) score+=0.35;
      score+=Math.random()*0.08;
      if(score>bestScore+0.001) { bestScore=score; bestMoves=[move]; }
      else if(Math.abs(score-bestScore)<=0.001) bestMoves.push(move);
    }
    return bestMoves[Math.floor(Math.random()*bestMoves.length)] || options[0];
  }
  function schedulePiuMove() {
    const position=game;
    setTimeout(()=>{
      if(ui.page!=='practice' || ui.mode!=='boss' || game!==position || !game.aiThinking || game.checkmate) return;
      const move=choosePiuMove(game);
      if(move) playMove(move);
      else { game.aiThinking=false; game.checkmate=true; game.message='Empate: não há lances legais.'; render(); }
    },420);
  }
  function playMove(move) {
    const moving=game.board[move.from.r][move.from.c];
    if(ui.mode==='puzzle') {
      const expected=challenges[ui.challengeIndex].expected;
      if(coord(move.from.r,move.from.c)!==expected.from || coord(move.to.r,move.to.c)!==expected.to) {
        updateGameMessage('Quase! Tente novamente.',true); game.selected=null; game.legal=[]; render(); return;
      }
    }
    const captured=game.board[move.to.r][move.to.c] || (move.enPassant?piece('P',opposite(moving.color)):null);
    const label=moveLabel(moving,move,!!captured);
    const next=applyRaw(game,move);
    const turnColor=next.turn;
    const check=isInCheck(next,turnColor), legal=allLegalMoves(next,turnColor);
    const mate=check && legal.length===0;
    const stalemate=!check && legal.length===0;
    next.lastMove={from:move.from,to:move.to};
    next.history=[...game.history,label+(mate?'#':check?'+':'')];
    next.checkmate=mate||stalemate;
    next.puzzleSolved=ui.mode==='puzzle';
    let bossWinMessage='';
    if(ui.mode==='puzzle') next.message=challenges[ui.challengeIndex].message;
    else if(ui.mode==='boss') {
      const piuMoved=moving.color==='b';
      next.aiThinking=false;
      if(mate && piuMoved) next.message='Xeque-mate! Piu venceu. Quer tentar de novo?';
      else if(mate) {
        next.message='Xeque-mate! Você venceu o Piu! +50 XP';
        if(!game.bossRewarded) { progress.bossWins+=1; progress.xp+=50; next.bossRewarded=true; persist(); bossWinMessage='Você venceu o Piu! +50 XP ✦'; }
      } else if(stalemate) next.message='Empate por afogamento. Boa partida!';
      else if(piuMoved) next.message=check?'Xeque! Piu está pressionando.':'Sua vez, estrategista!';
      else { next.message=check?'Xeque! Piu está pensando em como responder…':'Piu está pensando…'; next.aiThinking=true; }
    } else next.message=mate?'Xeque-mate!':check?'Xeque! Boa jogada!':stalemate?'Empate por afogamento.':`${turnColor==='w'?'Brancas':'Pretas'} jogam. Boa jogada!`;
    next.error=false;
    game=next;
    const firstSolve=ui.mode==='puzzle' && !progress.solvedChallenges.includes(ui.challengeIndex);
    if(firstSolve) {
      progress.solvedChallenges.push(ui.challengeIndex); progress.xp+=15; persist();
    }
    render();
    if(ui.mode==='puzzle') showToast(firstSolve?'Desafio concluído! +15 XP ✦':'Desafio concluído!');
    else if(ui.mode==='boss' && bossWinMessage) showToast(bossWinMessage);
    if(ui.mode==='boss' && game.aiThinking) schedulePiuMove();
  }
  function clickSquare(r,c) {
    if(game.puzzleSolved || game.checkmate || game.aiThinking || (ui.mode==='boss' && game.turn==='b')) return;
    const selectedMove=game.selected && game.legal.find(m=>m.to.r===r && m.to.c===c);
    if(selectedMove) { playMove(selectedMove); return; }
    const p=game.board[r][c];
    if(p && p.color===game.turn) {
      game.selected={r,c}; game.legal=legalMovesFrom(game,r,c); game.error=false;
      game.message=game.legal.length?'Escolha uma das casas destacadas.':'Essa peça não tem movimentos legais agora.';
      render(); return;
    }
    game.selected=null; game.legal=[]; game.error=true; game.message='Selecione uma peça da vez primeiro.'; render();
  }

  app.addEventListener('click', event => {
    const profileTab=event.target.closest('[data-profile-tab]');
    if(profileTab) { ui.profileTab=profileTab.dataset.profileTab; render(); return; }
    const avatarChoice=event.target.closest('[data-avatar]');
    if(avatarChoice) { selectProfileAvatar(avatarChoice.dataset.avatar); return; }
    const nav=event.target.closest('[data-page]');
    if(nav) {
      ui.page=nav.dataset.page; render();
      if(ui.page==='practice' && ui.mode==='boss' && game.aiThinking) schedulePiuMove();
      return;
    }
    const lessonCard=event.target.closest('[data-lesson]');
    if(lessonCard) { openLesson(Number(lessonCard.dataset.lesson)); return; }
    const bossCard=event.target.closest('[data-boss]');
    if(bossCard) { startBoss(); return; }
    const answer=event.target.closest('[data-answer]');
    if(answer) { answerQuestion(answer.dataset.answer,Number(answer.dataset.index)); return; }
    const square=event.target.closest('[data-square]');
    if(square) { const [r,c]=square.dataset.square.split(',').map(Number); clickSquare(r,c); return; }
    const action=event.target.closest('[data-action]');
    if(!action) return;
    switch(action.dataset.action) {
      case 'start': case 'continue': startLearning(); break;
      case 'complete-lesson': completeLesson(); break;
      case 'reset-challenge': setChallenge(ui.challengeIndex); break;
      case 'next-challenge': setChallenge(ui.challengeIndex+1); break;
      case 'free-play': ui.mode='free'; game=createInitialGame(); render(); break;
      case 'puzzles': setChallenge(ui.challengeIndex); break;
      case 'boss': case 'rematch-piu': startBoss(); break;
      case 'reset-board': ui.mode='free'; game=createInitialGame(); render(); break;
      case 'reset-progress':
        if(window.confirm('Quer apagar seu XP, sequência, aulas e conquistas deste navegador?')) {
          const profile={playerName:progress.playerName,avatar:progress.avatar,magnusUnlocked:progress.magnusUnlocked};
          const clean=freshProgress(); Object.keys(progress).forEach(k=>delete progress[k]); Object.assign(progress,clean,profile); updateDailyStreak(); persist(); ui.page='home'; render(); showToast('Progresso reiniciado. Vamos começar de novo!');
        }
        break;
    }
  });
  app.addEventListener('submit', event => {
    const form=event.target.closest('[data-profile-form]');
    if(!form) return;
    event.preventDefault();
    submitProfileForm(form);
  });
  app.addEventListener('keydown', event => {
    const lessonCard=event.target.closest('[data-lesson]');
    if(lessonCard && (event.key==='Enter' || event.key===' ')) { event.preventDefault(); openLesson(Number(lessonCard.dataset.lesson)); }
    const bossCard=event.target.closest('[data-boss]');
    if(bossCard && (event.key==='Enter' || event.key===' ')) { event.preventDefault(); startBoss(); }
  });

  render();
})();
