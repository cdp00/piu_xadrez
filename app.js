(() => {
  'use strict';

  const STORAGE_KEY = 'piu-xadrez-progresso-v1';
  const ACCOUNTS_KEY = 'piu-xadrez-contas-v1';
  const SESSION_KEY = 'piu-xadrez-sessao-v1';
  const PASSWORD_ITERATIONS = 120000;
  const LEGACY_PASSWORD_ITERATIONS = [100000, 60000];
  const PIECE_GLYPHS = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  const PIECE_NAMES = { K: 'rei', Q: 'dama', R: 'torre', B: 'bispo', N: 'cavalo', P: 'peão' };
  const FILES = 'abcdefgh';
  const PROFILE_BIRDS = [
    { id: 'piu', name: 'Piu', emoji: '🐦' },
    { id: 'tucano', name: 'Tucano', emoji: '🦜' },
    { id: 'coruja', name: 'Coruja', emoji: '🦉' },
    { id: 'pinguim', name: 'Pinguim', emoji: '🐧' },
    { id: 'flamingo', name: 'Flamingo', emoji: '🦩' },
    { id: 'aguia', name: 'Águia', emoji: '🦅', unlockAt: 28 },
    { id: 'pato', name: 'Pato', emoji: '🦆', unlockAt: 38 }
  ];
  const MAGNUS_PHOTO = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/MagnusCarlsen24.jpg/250px-MagnusCarlsen24.jpg';
  const MAGNUS_SOURCE = 'https://commons.wikimedia.org/wiki/File:MagnusCarlsen24.jpg';
  const MAGNUS_LICENSE = 'https://creativecommons.org/licenses/by-sa/3.0/';
  const BOARD_THEMES = [
    { id: 'forest', name: 'Bosque', light: '#f0ead8', dark: '#8caa79' },
    { id: 'ocean', name: 'Oceano', light: '#dceff0', dark: '#57949a' },
    { id: 'sunset', name: 'Pôr do sol', light: '#f6e5d4', dark: '#c98a62' },
    { id: 'lavender', name: 'Lavanda', light: '#eee8f5', dark: '#927eae' }
  ];
  const PIECE_STYLES = [
    { id: 'classic', name: 'Clássico', white: '#fffdf4', black: '#35433b' },
    { id: 'gold', name: 'Dourado', white: '#ffe17b', black: '#725018' },
    { id: 'contrast', name: 'Alto contraste', white: '#ffffff', black: '#111820' }
  ];

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

  // Trilhas adicionais ficam no fim para que índices já gravados no progresso continuem válidos.
  const advancedLessons = [
    { title: 'Ilhas de peões', icon: '♙', time: '8 min', intro: 'Peões dobrados, isolados ou atrasados criam fraquezas que podem durar muitos lances. Antes de avançar, observe quais peões não podem ser protegidos por outros peões.', tip: 'Uma fraqueza não perde sozinha: ela vira alvo quando as peças adversárias conseguem pressioná-la.', quiz: { ask: 'O que torna um peão isolado vulnerável?', options: ['Não há peões vizinhos para apoiá-lo', 'Ele pode andar para trás', 'Ele protege todas as casas ao redor'], answer: 0 }, exercise: { ask: 'Qual peça costuma ajudar a defender uma fraqueza de peão?', options: ['Uma peça que consiga chegar até ela', 'O rei adversário', 'Uma peça já capturada'], answer: 0 }, piece: '♙', move: 'Compare os peões vizinhos e identifique quem ficou sem apoio.', reward: 30 },
    { title: 'Casas fortes', icon: '⌖', time: '8 min', intro: 'Uma casa forte pode servir de posto para um cavalo ou bispo, especialmente quando peões inimigos não conseguem expulsá-lo. Casas assim costumam ficar à frente de peões que não podem avançar.', tip: 'Um posto avançado é mais valioso quando uma peça amiga consegue ocupá-lo e permanecer ali.', quiz: { ask: 'O que ajuda a transformar uma casa em posto avançado?', options: ['Que peões adversários não consigam expulsar a peça', 'Que a casa fique no canto', 'Que a peça esteja longe da partida'], answer: 0 }, exercise: { ask: 'Qual peça costuma aproveitar bem uma casa central protegida?', options: ['Cavalo', 'Peão adversário', 'Rei no roque'], answer: 0 }, piece: '♘', move: 'Um cavalo bem instalado controla casas ao redor.', reward: 30 },
    { title: 'Colunas para as torres', icon: '♖', time: '8 min', intro: 'Uma coluna aberta não tem peões; uma coluna semiaberta tem apenas peões adversários. Coloque torres nessas rotas para pressionar a posição e disputar a sétima fileira.', tip: 'Duas torres podem se apoiar na mesma coluna para aumentar a pressão.', quiz: { ask: 'O que define uma coluna aberta?', options: ['Não há peões nela', 'Há apenas bispos nela', 'Os reis estão na mesma fileira'], answer: 0 }, exercise: { ask: 'Qual peça costuma aproveitar uma coluna aberta?', options: ['Torre', 'Cavalo preso', 'Peão bloqueado'], answer: 0 }, piece: '♖', move: 'Uma coluna sem peões abre caminho para as torres.', reward: 30 },
    { title: 'Trocas com propósito', icon: '⇄', time: '8 min', intro: 'Trocar peças muda a posição. Simplifique quando estiver com material a mais ou alivie a defesa quando o adversário tiver ataque. Compare também quais peças ficarão fortes depois da troca.', tip: 'Antes de capturar, pergunte qual peça sua vai ficar melhor — e qual peça do outro lado vai sumir.', quiz: { ask: 'Quando simplificar pode ajudar?', options: ['Quando você tem vantagem material e quer reduzir o contra-ataque', 'Sempre que uma captura estiver disponível', 'Quando o rei estiver em xeque, sem verificar a posição'], answer: 0 }, exercise: { ask: 'O que avaliar antes de trocar uma peça?', options: ['A posição que sobra depois da troca', 'A cor da última casa do tabuleiro', 'A ordem em que as peças entraram'], answer: 0 }, piece: '♗', move: 'Uma troca boa melhora a posição que permanece.', reward: 30 },
    { title: 'Prova de estratégia', icon: '✦', time: '10 min', intro: 'Junte as ideias de estrutura, casas fortes, colunas e trocas. Escolha um plano coerente com as características da posição em vez de jogar uma peça sem objetivo.', tip: 'A melhor estratégia nasce de observar as fraquezas e as peças mais ativas.', quiz: { ask: 'Se o adversário tem um peão isolado numa coluna aberta, que plano faz sentido?', options: ['Pressionar o peão com as torres e evitar trocas que aliviem a defesa', 'Mover o rei para o canto e ignorar a coluna', 'Avançar todos os peões sem olhar para as peças'], answer: 0 }, exercise: { ask: 'Sua peça menos ativa está sem rota. O que fazer primeiro?', options: ['Encontrar uma casa ou coluna para melhorar sua atividade', 'Sacrificá-la sem calcular', 'Passar o lance'], answer: 0 }, piece: '♖', move: 'Plano: identificar alvo, melhorar peças e aumentar a pressão.', reward: 60, final: true },
    { title: 'Defensor sobrecarregado', icon: '♕', time: '8 min', intro: 'Uma peça pode ter tarefas demais: proteger o rei, uma peça e uma casa importante ao mesmo tempo. Ataque um desses pontos e observe se o defensor consegue cumprir tudo.', tip: 'Conte as obrigações do defensor. Uma ameaça adicional pode tornar a posição insustentável.', quiz: { ask: 'Quando um defensor está sobrecarregado?', options: ['Quando precisa proteger mais alvos do que consegue', 'Quando está no centro', 'Quando tem muitos lances legais'], answer: 0 }, exercise: { ask: 'Como explorar um defensor sobrecarregado?', options: ['Criar uma ameaça a outro alvo que ele também protege', 'Trocar todas as peças sem motivo', 'Afastar sua própria peça atacante'], answer: 0 }, piece: '♕', move: 'Uma ameaça extra pode revelar que a defesa não dá conta.', reward: 30 },
    { title: 'Interferência na defesa', icon: '⤫', time: '8 min', intro: 'Uma interferência coloca uma peça entre duas peças adversárias alinhadas. Ao cortar a comunicação, você pode impedir uma defesa ou criar uma ameaça decisiva.', tip: 'Procure linhas em que uma peça protege outra à distância.', quiz: { ask: 'O que uma interferência tenta interromper?', options: ['A ligação entre duas peças adversárias', 'O movimento do próprio rei', 'A contagem dos lances'], answer: 0 }, exercise: { ask: 'Qual posição pode sugerir uma interferência?', options: ['Duas peças inimigas alinhadas numa mesma linha', 'Dois peões em colunas opostas', 'Um rei sem casas adjacentes'], answer: 0 }, piece: '♗', move: 'Interpor uma peça pode desligar a defesa distante.', reward: 30 },
    { title: 'Mate na última fileira', icon: '♜', time: '8 min', intro: 'Um rei preso atrás dos próprios peões pode ficar vulnerável a uma torre ou dama na última fileira. Observe as casas de fuga e veja se uma peça defensora consegue abrir uma saída.', tip: 'Antes do golpe, confira se a última fileira está realmente sem defesa suficiente.', quiz: { ask: 'Por que o mate na última fileira aparece?', options: ['O rei não tem uma casa segura para fugir dos xeques', 'A torre pode pular peças', 'O rei está no centro do tabuleiro'], answer: 0 }, exercise: { ask: 'O que é importante conferir antes de atacar a última fileira?', options: ['As casas de fuga do rei e a defesa adversária', 'A cor do peão mais distante', 'Se a dama já se moveu duas vezes'], answer: 0 }, piece: '♜', move: 'Um rei cercado pelos próprios peões pode não ter saída.', reward: 30 },
    { title: 'Encontrar a defesa', icon: '🛡', time: '8 min', intro: 'Quando estiver sob ataque, procure primeiro xeques, capturas e bloqueios que reduzam a ameaça. Às vezes a melhor defesa é trocar a peça atacante ou devolver material para salvar o rei.', tip: 'Não responda automaticamente ao último lance: descubra qual é a ameaça real.', quiz: { ask: 'Qual deve ser o primeiro passo ao enfrentar uma ameaça?', options: ['Identificar exatamente o que o adversário ameaça', 'Atacar um peão distante', 'Ignorar os xeques possíveis'], answer: 0 }, exercise: { ask: 'Quais recursos vale checar quando seu rei está ameaçado?', options: ['Mover, capturar o atacante ou bloquear o ataque', 'Fazer qualquer captura', 'Mover duas peças'], answer: 0 }, piece: '♔', move: 'Uma defesa ativa resolve a ameaça e melhora suas peças.', reward: 30 },
    { title: 'Prova de cálculo tático', icon: '⚡', time: '10 min', intro: 'Calcule uma combinação até uma posição segura. Compare as respostas adversárias, confira se seu rei fica protegido e só então escolha a continuação.', tip: 'Escreva mentalmente uma variante curta: seu lance, a melhor resposta e seu próximo recurso.', quiz: { ask: 'Como escolher uma variante de ataque?', options: ['Calcular a melhor resposta do adversário e conferir o resultado', 'Parar de calcular depois do primeiro lance', 'Escolher a linha com mais capturas aparentes'], answer: 0 }, exercise: { ask: 'Depois da combinação, o que precisa ser verificado?', options: ['Segurança do rei e vantagem que restou', 'A casa inicial do cavalo', 'Se os dois lados fizeram o mesmo número de capturas'], answer: 0 }, piece: '♘', move: 'Calcule a sequência inteira antes de executar a ideia.', reward: 60, final: true },
    { title: 'A corrida dos peões', icon: '♙', time: '8 min', intro: 'A regra do quadrado ajuda a saber se o rei alcança um peão passado. Imagine um quadrado entre o peão e a casa de promoção; se o rei entra nele a tempo, pode alcançá-lo, respeitando a vez de jogar.', tip: 'Conte a distância até a promoção e compare com os passos do rei.', quiz: { ask: 'Para que serve a regra do quadrado?', options: ['Estimar se o rei alcança um peão passado', 'Decidir quando fazer o roque', 'Contar casas atacadas pela dama'], answer: 0 }, exercise: { ask: 'O que você compara nessa corrida?', options: ['Passos do peão até promover e do rei até alcançá-lo', 'O número de peças capturadas', 'A distância entre as damas'], answer: 0 }, piece: '♙', move: 'Imagine o quadrado que cresce até a casa de promoção.', reward: 30 },
    { title: 'Criar um peão passado', icon: '♙', time: '8 min', intro: 'Um peão passado não tem peões adversários à sua frente nem nas colunas vizinhas que possam pará-lo. Apoie seu avanço com o rei e obrigue o adversário a gastar peças para contê-lo.', tip: 'Um peão passado pode distrair o rei adversário mesmo antes de avançar.', quiz: { ask: 'O que é um peão passado?', options: ['Um peão sem peões inimigos capazes de bloqueá-lo nas colunas próximas', 'Um peão que já foi capturado', 'Um peão que anda para trás'], answer: 0 }, exercise: { ask: 'Como apoiar um peão passado no final?', options: ['Aproximar o rei e avançá-lo com cuidado', 'Deixar o rei longe', 'Bloqueá-lo com uma peça amiga'], answer: 0 }, piece: '♙', move: 'O rei abre caminho para que o peão avance.', reward: 30 },
    { title: 'Atividade do rei', icon: '♔', time: '8 min', intro: 'Com poucas peças, o rei se torna uma peça ativa. Leve-o para o centro, ganhe oposição quando necessário e ajude a capturar peões ou escoltar os seus.', tip: 'No final, esconder o rei pode custar tempos preciosos.', quiz: { ask: 'Por que ativar o rei no final?', options: ['Ele ajuda a apoiar peões e disputar casas importantes', 'Ele pode capturar o próprio peão', 'Ele passa a andar como uma torre'], answer: 0 }, exercise: { ask: 'Qual caminho costuma ser útil para o rei no final?', options: ['Aproximar-se do centro e dos peões relevantes', 'Ficar parado no canto', 'Caminhar para uma casa atacada'], answer: 0 }, piece: '♔', move: 'Traga o rei para perto da ação quando for seguro.', reward: 30 },
    { title: 'Torre ativa e rei cortado', icon: '♖', time: '8 min', intro: 'Uma torre pode controlar uma fileira ou coluna para limitar o rei adversário. Enquanto isso, seu rei se aproxima do peão ou do alvo. Coordene as duas peças para ganhar espaço.', tip: 'Cortar o rei reduz suas rotas; depois, o próprio rei pode avançar.', quiz: { ask: 'O que significa cortar o rei com a torre?', options: ['Limitar sua passagem por uma linha do tabuleiro', 'Dar xeque em todos os lances', 'Trocar a torre por um peão'], answer: 0 }, exercise: { ask: 'Depois de limitar o rei adversário, o que fazer?', options: ['Aproximar o próprio rei e avançar o plano', 'Recuar a torre sem objetivo', 'Deixar o rei próprio parado'], answer: 0 }, piece: '♖', move: 'A torre controla uma linha enquanto o rei ganha espaço.', reward: 30 },
    { title: 'Prova de finais', icon: '♔', time: '10 min', intro: 'Use o rei com atividade, avalie a corrida dos peões e coordene a torre. No final, cada tempo importa: escolha o plano que cria uma ameaça concreta primeiro.', tip: 'Conte tempos, casas de promoção e rotas do rei antes de avançar.', quiz: { ask: 'No final, que fator costuma decidir a corrida?', options: ['A coordenação entre rei, peões e peças restantes', 'A posição original da dama', 'Quantos lances a partida já teve'], answer: 0 }, exercise: { ask: 'Antes de avançar um peão passado, o que precisa conferir?', options: ['Se o rei pode apoiar e se o rei rival consegue alcançá-lo', 'A cor do último lance', 'Se a torre está na primeira casa'], answer: 0 }, piece: '♙', move: 'Coordene rei e peão e confira a corrida até a promoção.', reward: 60, final: true },
    { title: 'Escolher lances candidatos', icon: '⌕', time: '8 min', intro: 'Em cada posição, liste poucas opções: xeques, capturas, ameaças e melhorias de peça. Calcule as candidatas mais promissoras e compare os resultados antes de decidir.', tip: 'Uma lista curta e organizada evita jogar a primeira ideia que aparece.', quiz: { ask: 'Quais opções merecem ser consideradas primeiro?', options: ['Xeques, capturas, ameaças e melhorias', 'Apenas movimentos de peões', 'O lance que parece mais rápido'], answer: 0 }, exercise: { ask: 'Depois de listar candidatas, o que fazer?', options: ['Comparar as respostas do adversário em cada variante', 'Escolher aleatoriamente', 'Parar de olhar o tabuleiro'], answer: 0 }, piece: '♘', move: 'Compare candidatas antes de fixar sua escolha.', reward: 30 },
    { title: 'Avaliar a posição', icon: '◉', time: '8 min', intro: 'Uma avaliação prática considera material, segurança dos reis, atividade das peças, estrutura de peões e espaço. Esses fatores ajudam a escolher se você deve atacar, trocar ou melhorar sua posição.', tip: 'Não conte só peças: uma peça ativa ou um rei exposto também mudam a posição.', quiz: { ask: 'Qual conjunto ajuda a avaliar uma posição?', options: ['Material, segurança dos reis, atividade e estrutura', 'Só a quantidade de peões', 'Apenas quem jogou por último'], answer: 0 }, exercise: { ask: 'Você tem material a mais, mas seu rei está exposto. Qual prioridade faz sentido?', options: ['Reduzir as ameaças e consolidar o rei', 'Abrir todas as linhas contra si', 'Entregar a dama sem cálculo'], answer: 0 }, piece: '♔', move: 'Avalie vários fatores, não apenas o material.', reward: 30 },
    { title: 'Antecipar o plano rival', icon: '👁', time: '8 min', intro: 'Tente prever o plano mais natural do adversário: uma ruptura, uma troca, uma coluna ou um ataque ao rei. Se o plano for perigoso, mude uma peça para impedi-lo ou crie uma ameaça mais urgente.', tip: 'Pergunte “o que ele faria se eu passasse a vez?” para enxergar a intenção.', quiz: { ask: 'Como antecipar um plano adversário?', options: ['Imaginar a próxima melhoria ou ameaça natural dele', 'Olhar somente para suas próprias peças', 'Jogar sem observar o último lance'], answer: 0 }, exercise: { ask: 'Você identificou uma ameaça que pode ser preparada. O que fazer?', options: ['Impedir a ideia ou criar uma resposta mais forte', 'Esperar que ela desapareça', 'Mover uma peça ao acaso'], answer: 0 }, piece: '♘', move: 'Reconhecer o plano a tempo permite preparar uma resposta.', reward: 30 },
    { title: 'Ruptura de peões', icon: '♙', time: '8 min', intro: 'Uma ruptura é um avanço de peão que desafia a estrutura adversária e pode abrir linhas para suas peças. Prepare-a com apoio e confira se a troca não deixa seus próprios peões fracos.', tip: 'Antes de romper, identifique qual linha você quer abrir e quem vai usá-la.', quiz: { ask: 'Para que serve uma ruptura de peões?', options: ['Abrir linhas ou alterar a estrutura para ativar peças', 'Promover todos os peões ao mesmo tempo', 'Impedir o roque por regra'], answer: 0 }, exercise: { ask: 'O que avaliar antes de avançar um peão para romper?', options: ['Quais linhas abrem e quais fraquezas ficam para trás', 'Somente o valor do peão', 'Se o adversário já moveu um cavalo'], answer: 0 }, piece: '♙', move: 'Uma ruptura bem preparada abre caminho para suas peças.', reward: 30 },
    { title: 'Desafio de graduação', icon: '♛', time: '12 min', intro: 'Mostre que consegue organizar uma partida: avalie a posição, encontre candidatas, calcule uma linha e escolha um plano de longo prazo. Depois, teste suas ideias contra adversários diferentes.', tip: 'Jogue com calma, confira as ameaças e explique para si mesmo o objetivo do lance.', quiz: { ask: 'Qual rotina reúne os hábitos de uma partida bem pensada?', options: ['Avaliar, prever ameaças, comparar candidatas e então jogar', 'Mover rápido e revisar depois', 'Atacar antes de desenvolver as peças'], answer: 0 }, exercise: { ask: 'Depois de escolher um plano, qual é o próximo passo?', options: ['Verificar a resposta adversária e se o plano continua seguro', 'Ignorar qualquer mudança na posição', 'Repetir o mesmo lance'], answer: 0 }, piece: '♕', move: 'Combine cálculo, avaliação e um plano que possa ser revisado.', reward: 60, final: true }
  ];
  lessons.push(...advancedLessons);

  const achievements = [
    { id: 'first', icon: '🌱', name: 'Primeiros passos', desc: 'Conclua sua primeira aula.', test: s => s.completed.length >= 1 },
    { id: 'three', icon: '📚', name: 'Curioso', desc: 'Conclua 3 aulas.', test: s => s.completed.length >= 3 },
    { id: 'seven', icon: '⭐', name: 'Meio do caminho', desc: 'Conclua 7 aulas.', test: s => s.completed.length >= 7 },
    { id: 'all', icon: '🏆', name: 'Mestre do tabuleiro', desc: 'Complete a trilha clássica e vença o Piu.', test: s => s.completed.length >= LEGACY_BOSS_UNLOCK && s.bossWins > 0 },
    { id: 'boss', icon: '👑', name: 'Venceu o Boss', desc: 'Ganhe uma partida contra o Piu.', test: s => s.bossWins > 0 },
    { id: 'streak', icon: '🔥', name: 'Constância', desc: 'Mantenha uma sequência de 3 dias.', test: s => s.streak >= 3 },
    { id: 'xp', icon: '✨', name: 'Centena de XP', desc: 'Acumule 100 XP.', test: s => s.xp >= 100 },
    { id: 'strategist', icon: '🧭', name: 'Estrategista', desc: 'Conclua a área de estratégia.', test: s => s.completed.length >= 28 },
    { id: 'tactician', icon: '⚡', name: 'Tático atento', desc: 'Conclua a área de combinações e defesa.', test: s => s.completed.length >= 33 },
    { id: 'endgame', icon: '♙', name: 'Técnico de finais', desc: 'Conclua a área de finais.', test: s => s.completed.length >= 38 },
    { id: 'graduate', icon: '🎓', name: 'Graduado do tabuleiro', desc: 'Conclua toda a trilha avançada.', test: s => s.completed.length >= lessons.length },
    { id: 'rival', icon: '🤝', name: 'Primeiro duelo', desc: 'Vença uma partida de treinamento.', test: s => s.trainingWins > 0 }
  ];

  const challenges = [
    { title: 'A torre encontra a dama', prompt: 'Sua torre está na coluna a. Capture a dama adversária em a7.', tag: 'Qual peça pode capturar?', expected: { from: 'a4', to: 'a7' }, fen: '7k/q7/8/8/R7/8/8/K7 w - -', message: 'Boa! A torre percorreu a coluna e capturou a dama.' },
    { title: 'Mate em um lance', prompt: 'As brancas jogam. Encontre o xeque-mate em um lance.', tag: 'Encontre o xeque-mate', expected: { from: 'f7', to: 'g7' }, fen: '7k/5Q2/6K1/8/8/8/8/8 w - -', message: 'Xeque-mate! A dama está protegida pelo rei.' },
    { title: 'Salto do cavalo', prompt: 'Leve o cavalo de b1 até c3 com um salto em L.', tag: 'Mova o cavalo', expected: { from: 'b1', to: 'c3' }, fen: '4k3/8/8/8/8/8/8/KN6 w - -', message: 'Boa jogada! O cavalo chegou a c3.' },
    { title: 'Peão atento', prompt: 'O peão branco em e4 pode capturar a torre em d5. Faça a captura.', tag: 'Qual é a melhor jogada?', expected: { from: 'e4', to: 'd5' }, fen: '7k/8/8/3r4/4P3/8/8/K7 w - -', message: 'Boa! O peão captura na diagonal.' },
    { title: 'Garfo no centro', prompt: 'Salte com o cavalo para atacar a dama e dar xeque ao rei.', tag: 'Ataque duplo', expected: { from: 'f5', to: 'd6' }, fen: '4k3/8/3q4/5N2/8/8/8/K7 w - -', message: 'Garfo! O cavalo ameaça a dama e o rei ao mesmo tempo.' },
    { title: 'Abrir a coluna', prompt: 'Mova o cavalo para revelar o ataque da torre ao rei adversário.', tag: 'Ataque descoberto', expected: { from: 'e4', to: 'c5' }, fen: '4k2q/8/8/8/4N3/8/8/4R1K1 w - -', message: 'Xeque! O cavalo saiu da frente e revelou a torre.' },
    { title: 'Promover com xeque', prompt: 'Leve o peão até a última fileira e transforme-o em dama.', tag: 'Corrida de peões', expected: { from: 'e7', to: 'e8' }, fen: 'k7/4P3/8/8/8/8/8/K7 w - -', message: 'Promoção! O peão virou dama e deu xeque.' },
    { title: 'A torre na sétima', prompt: 'Capture o peão em g7 com a torre e confira o xeque.', tag: 'Tática de torre', expected: { from: 'g1', to: 'g7' }, fen: '6k1/6p1/8/8/8/8/8/K5R1 w - -', message: 'Boa! A torre capturou o peão e ameaça o rei.' },
    { title: 'O bispo ativo', prompt: 'Capture a torre adversária na diagonal com o bispo.', tag: 'Diagonais', expected: { from: 'b2', to: 'e5' }, fen: '7k/8/8/4r3/8/8/1B6/K7 w - -', message: 'Boa jogada! O bispo cruzou a diagonal e ganhou a torre.' },
    { title: 'Desvio do guardião', prompt: 'Capture a peça que protege a dama para desmontar a defesa.', tag: 'Escolha de alvo', expected: { from: 'c4', to: 'e6' }, fen: '4k3/8/4r2q/8/2B5/8/8/K7 w - -', message: 'A peça defensora caiu; a dama ficou sem proteção.' },
    { title: 'Mate na última fileira', prompt: 'Dê mate com a torre na última fileira.', tag: 'Mate de torre', expected: { from: 'a1', to: 'a8' }, fen: '7k/6pp/8/8/8/8/8/R5K1 w - -', message: 'Xeque-mate! O rei não tem saída na última fileira.' },
    { title: 'O rei acompanha', prompt: 'Avance o rei para proteger o peão passado.', tag: 'Final de peões', expected: { from: 'd4', to: 'e4' }, fen: '8/8/4k3/8/3K4/4P3/8/8 w - -', message: 'Boa! O rei se aproxima e apoia o peão.' },
    { title: 'Dama e peão', prompt: 'Use a dama para capturar o peão avançado antes da promoção.', tag: 'Defesa ativa', expected: { from: 'd4', to: 'd7' }, fen: '7k/3p4/8/8/3Q4/8/8/K7 w - -', message: 'Boa defesa! A dama removeu o peão passado.' }
  ];

  const trainingOpponents = [
    { id: 'tico', name: 'Tico', species: 'tucano', emoji: '🦜', title: 'Aprendiz animado', bio: 'Joga lances simples e deixa espaço para você praticar.', unlockAt: 0, strength: 0 },
    { id: 'luma', name: 'Luma', species: 'coruja', emoji: '🦉', title: 'Observadora', bio: 'Protege as peças e tenta responder às ameaças.', unlockAt: 13, strength: 1 },
    { id: 'nino', name: 'Nino', species: 'pinguim', emoji: '🐧', title: 'Estrategista', bio: 'Calcula trocas e procura bons lances táticos.', unlockAt: 23, strength: 2 }
  ];
  const LEGACY_BOSS_UNLOCK = 23;

  function todayString(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function yesterdayString() { const d = new Date(); d.setDate(d.getDate() - 1); return todayString(d); }
  function normalizeUsername(value) { return String(value || '').trim(); }
  function isValidUsername(value) { return /^[A-Za-z0-9_.-]{3,20}$/.test(value); }
  function accountProgressKey(username) { return `${STORAGE_KEY}:aluno:${encodeURIComponent(username.toLowerCase())}`; }
  function freshSettings() { return { boardTheme: 'forest', pieceStyle: 'classic', piuAnimations: true }; }
  function normalizeSettings(value) {
    const settings=value&&typeof value==='object'?value:{};
    return {
      boardTheme: BOARD_THEMES.some(theme=>theme.id===settings.boardTheme)?settings.boardTheme:'forest',
      pieceStyle: PIECE_STYLES.some(style=>style.id===settings.pieceStyle)?settings.pieceStyle:'classic',
      piuAnimations: settings.piuAnimations!==false
    };
  }
  function freshProgress(playerName='Estrategista') { return { xp: 0, completed: [], streak: 0, lastActive: '', solvedChallenges: [], bossWins: 0, bossGames: 0, bossLosses: 0, bossDraws: 0, trainingWins: 0, trainingGames: 0, trainingLosses: 0, trainingDraws: 0, playerName, avatar: 'piu', magnusUnlocked: false, settings: freshSettings() }; }
  function readProgress(storageKey=STORAGE_KEY) {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (!parsed || typeof parsed !== 'object') return freshProgress();
      const magnusUnlocked = parsed.magnusUnlocked === true;
      const avatar = PROFILE_BIRDS.some(option => option.id === parsed.avatar) || (parsed.avatar === 'magnus' && magnusUnlocked) ? parsed.avatar : 'piu';
      const preservedProfileData={};
      for(const key of ['rating','elo','chessRating']) if(Number.isFinite(parsed[key])) preservedProfileData[key]=parsed[key];
      for(const key of ['achievements','achievementIds']) if(Array.isArray(parsed[key])) preservedProfileData[key]=parsed[key].filter(value=>typeof value==='string'||Number.isInteger(value)).slice(0,200);
      return {
        ...preservedProfileData,
        xp: Number.isFinite(parsed.xp) && parsed.xp >= 0 ? parsed.xp : 0,
        completed: Array.isArray(parsed.completed) ? [...new Set(parsed.completed.filter(n => Number.isInteger(n) && n >= 0 && n < lessons.length))].sort((a,b) => a-b) : [],
        streak: Number.isFinite(parsed.streak) && parsed.streak >= 0 ? parsed.streak : 0,
        lastActive: typeof parsed.lastActive === 'string' ? parsed.lastActive : '',
        solvedChallenges: Array.isArray(parsed.solvedChallenges) ? [...new Set(parsed.solvedChallenges.filter(n => Number.isInteger(n) && n >= 0 && n < challenges.length))] : [],
        bossWins: Number.isInteger(parsed.bossWins) && parsed.bossWins >= 0 ? parsed.bossWins : 0,
        bossGames: Number.isInteger(parsed.bossGames) && parsed.bossGames >= 0 ? parsed.bossGames : 0,
        bossLosses: Number.isInteger(parsed.bossLosses) && parsed.bossLosses >= 0 ? parsed.bossLosses : 0,
        bossDraws: Number.isInteger(parsed.bossDraws) && parsed.bossDraws >= 0 ? parsed.bossDraws : 0,
        trainingWins: Number.isInteger(parsed.trainingWins) && parsed.trainingWins >= 0 ? parsed.trainingWins : 0,
        trainingGames: Number.isInteger(parsed.trainingGames) && parsed.trainingGames >= 0 ? parsed.trainingGames : 0,
        trainingLosses: Number.isInteger(parsed.trainingLosses) && parsed.trainingLosses >= 0 ? parsed.trainingLosses : 0,
        trainingDraws: Number.isInteger(parsed.trainingDraws) && parsed.trainingDraws >= 0 ? parsed.trainingDraws : 0,
        playerName: normalizePlayerName(parsed.playerName) || 'Estrategista',
        avatar,
        magnusUnlocked,
        settings: normalizeSettings(parsed.settings)
      };
    } catch (error) { return freshProgress(); }
  }
  let currentUser = null;
  let progress = freshProgress();
  function persist() {
    if(!currentUser) return;
    try { localStorage.setItem(accountProgressKey(currentUser.username), JSON.stringify(progress)); }
    catch (error) { /* The lessons remain playable when storage is unavailable. */ }
    window.PiuOnline?.scheduleProfileSync(progress);
  }
  function updateDailyStreak() {
    const today = todayString();
    if (progress.lastActive === today) return;
    progress.streak = progress.lastActive === yesterdayString() ? progress.streak + 1 : 1;
    progress.lastActive = today;
    persist();
  }
  function readAccounts() {
    return readAccountRecords().map(normalizeAccountRecord).filter(Boolean);
  }
  function readAccountRecords() {
    try {
      const parsed=JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
      if(!Array.isArray(parsed)) return [];
      return parsed.filter(account=>account && typeof account.username==='string' && isValidUsername(account.username));
    } catch (error) { return []; }
  }
  function normalizeAccountRecord(account) {
    if(!account || typeof account!=='object') return null;
    const salt=account.salt ?? account.passwordSalt ?? account.saltHex;
    const hash=account.hash ?? account.passwordHash ?? account.password_hash;
    const rawIterations=account.iterations ?? account.kdfIterations ?? account.rounds;
    const iterations=rawIterations===undefined?PASSWORD_ITERATIONS:Number(rawIterations);
    if(typeof salt!=='string'||!/^[a-f0-9]{32}$/i.test(salt)||typeof hash!=='string'||!/^[a-f0-9]{64}$/i.test(hash)) return null;
    if(!Number.isInteger(iterations)||iterations<10000||iterations>1000000) return null;
    return { username:normalizeUsername(account.username), salt:salt.toLowerCase(), hash:hash.toLowerCase(), iterations };
  }
  function findAccountRecord(username,records=readAccountRecords()) {
    return records.find(account=>account.username.toLowerCase()===username.toLowerCase())||null;
  }
  function storeAccountRecord(account,records=readAccountRecords()) {
    const updated=records.filter(record=>record.username.toLowerCase()!==account.username.toLowerCase());
    updated.push(account);
    localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(updated));
  }
  function bytesToHex(bytes) { return Array.from(bytes, value=>value.toString(16).padStart(2,'0')).join(''); }
  function hexToBytes(hex) { return Uint8Array.from(hex.match(/.{2}/g) || [], byte=>parseInt(byte,16)); }
  function createSalt() {
    if(!window.crypto?.getRandomValues) throw new Error('crypto-unavailable');
    const salt=new Uint8Array(16); window.crypto.getRandomValues(salt); return bytesToHex(salt);
  }
  async function hashPassword(password,saltHex,iterations=PASSWORD_ITERATIONS) {
    if(!window.crypto?.subtle || typeof TextEncoder==='undefined') throw new Error('crypto-unavailable');
    const material=await window.crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    const bits=await window.crypto.subtle.deriveBits({name:'PBKDF2',salt:hexToBytes(saltHex),iterations,hash:'SHA-256'},material,256);
    return bytesToHex(new Uint8Array(bits));
  }
  function hashesMatch(left,right) {
    if(typeof left!=='string' || typeof right!=='string' || left.length!==right.length) return false;
    let difference=0;
    for(let i=0;i<left.length;i++) difference|=left.charCodeAt(i)^right.charCodeAt(i);
    return difference===0;
  }
  function saveSession(username) { localStorage.setItem(SESSION_KEY,JSON.stringify({username:username.toLowerCase()})); }
  function restoreSession() {
    try {
      const session=JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if(!session || typeof session.username!=='string') return;
      const account=readAccounts().find(entry=>entry.username.toLowerCase()===session.username.toLowerCase());
      if(!account) { localStorage.removeItem(SESSION_KEY); return; }
      currentUser=account;
      progress=readProgress(accountProgressKey(account.username));
      if(progress.playerName==='Estrategista') progress.playerName=account.username;
      updateDailyStreak();
    } catch (error) { currentUser=null; progress=freshProgress(); }
  }
  function authMessage(message,isError=true) { ui.authMessage=message; ui.authError=isError; render(); }
  function mergeProgressSnapshots(base, incoming) {
    const merged={...base,...incoming};
    merged.xp=Math.max(base.xp||0,incoming.xp||0);
    merged.streak=Math.max(base.streak||0,incoming.streak||0);
    for(const key of ['bossWins','bossGames','bossLosses','bossDraws','trainingWins','trainingGames','trainingLosses','trainingDraws']) merged[key]=Math.max(base[key]||0,incoming[key]||0);
    for(const key of ['completed','solvedChallenges','achievements','achievementIds']) if(base[key]||incoming[key]) merged[key]=[...new Set([...(base[key]||[]),...(incoming[key]||[])])].sort((a,b)=>typeof a==='number'&&typeof b==='number'?a-b:String(a).localeCompare(String(b)));
    if(base.lastActive&&incoming.lastActive) merged.lastActive=base.lastActive>incoming.lastActive?base.lastActive:incoming.lastActive;
    merged.settings={...(base.settings||freshSettings()),...(incoming.settings||{})};
    if(!incoming.playerName||incoming.playerName==='Estrategista') merged.playerName=base.playerName||incoming.playerName;
    if(!incoming.avatar) merged.avatar=base.avatar||'piu';
    merged.magnusUnlocked=base.magnusUnlocked===true||incoming.magnusUnlocked===true;
    if(merged.avatar==='magnus'&&!merged.magnusUnlocked) merged.avatar='piu';
    return merged;
  }
  async function verifyLocalPassword(username,password) {
    const record=findAccountRecord(username);
    const account=normalizeAccountRecord(record);
    if(!account) return false;
    const hasStoredIterations=record.iterations!==undefined||record.kdfIterations!==undefined||record.rounds!==undefined;
    const roundsToTry=hasStoredIterations?[account.iterations]:[...new Set([account.iterations,...LEGACY_PASSWORD_ITERATIONS])];
    for(const rounds of roundsToTry) if(hashesMatch(await hashPassword(password,account.salt,rounds),account.hash)) return true;
    return false;
  }
  async function createLocalCredential(username,password) {
    const salt=createSalt();
    const account={username,salt,hash:await hashPassword(password,salt,PASSWORD_ITERATIONS),iterations:PASSWORD_ITERATIONS};
    storeAccountRecord(account);
    return account;
  }
  async function finishOnlineLogin(username,password,remote) {
    const profileKey=accountProgressKey(username);
    const localProgress=localStorage.getItem(profileKey)?readProgress(profileKey):freshProgress(username);
    const account=await createLocalCredential(username,password);
    currentUser=account;
    progress=mergeProgressSnapshots(localProgress,remote.progress||{});
    progress.rating=remote.rating;
    if(progress.playerName==='Estrategista') progress.playerName=username;
    saveSession(username); updateDailyStreak(); ui.page='home'; ui.authMode='login'; ui.authMessage=''; ui.authError=false; render(); persist();
  }
  async function submitAuthForm(form) {
    const mode=form.dataset.authForm;
    const username=normalizeUsername(form.elements.username.value);
    const password=String(form.elements.password.value || '');
    if(!isValidUsername(username)) { authMessage('Use de 3 a 20 caracteres: letras sem acento, números, ponto, hífen ou _.'); return; }
    if(!password) { authMessage('Digite sua senha.'); return; }
    if(mode!=='login'&&password.length<8) { authMessage('A nova senha precisa ter pelo menos 8 caracteres.'); return; }
    if(password.length>128) { authMessage('A senha pode ter no máximo 128 caracteres.'); return; }
    try {
      if(mode==='register') {
        const confirmation=String(form.elements.confirmPassword.value || '');
        if(password!==confirmation) { authMessage('As senhas não são iguais. Confira e tente novamente.'); return; }
        const records=readAccountRecords();
        if(findAccountRecord(username,records)) { authMessage('Esse nome já está em uso. Escolha outro.'); return; }
        const salt=createSalt();
        const account={username,salt,hash:await hashPassword(password,salt,PASSWORD_ITERATIONS),iterations:PASSWORD_ITERATIONS};
        const profileKey=accountProgressKey(username);
        let initialProgress=localStorage.getItem(profileKey)?readProgress(profileKey):freshProgress(username);
        const legacyData=records.length===0&&!localStorage.getItem(profileKey)?localStorage.getItem(STORAGE_KEY):null;
        if(legacyData) {
          initialProgress=readProgress(STORAGE_KEY);
          if(initialProgress.playerName==='Estrategista') initialProgress.playerName=username;
        }
        storeAccountRecord(account,records);
        currentUser=account; progress=initialProgress; saveSession(username); persist();
        if(legacyData) localStorage.removeItem(STORAGE_KEY);
      } else if(mode==='reset') {
        const confirmation=String(form.elements.confirmPassword.value || '');
        if(password!==confirmation) { authMessage('As senhas não são iguais. Confira e tente novamente.'); return; }
        const records=readAccountRecords();
        const oldRecord=findAccountRecord(username,records);
        const profileKey=accountProgressKey(username);
        const hasSavedProfile=!!localStorage.getItem(profileKey);
        const legacyData=records.length===0&&!hasSavedProfile?localStorage.getItem(STORAGE_KEY):null;
        if(!oldRecord&&!hasSavedProfile&&!legacyData) {
          authMessage('Não encontrei esse perfil neste navegador. Confira o nome e abra o site no mesmo navegador e endereço em que o perfil foi criado.');
          return;
        }
        const salt=createSalt();
        const account={username:oldRecord?.username||username,salt,hash:await hashPassword(password,salt,PASSWORD_ITERATIONS),iterations:PASSWORD_ITERATIONS};
        storeAccountRecord(account,records);
        currentUser=account;
        progress=hasSavedProfile?readProgress(profileKey):legacyData?readProgress(STORAGE_KEY):freshProgress(account.username);
        if(progress.playerName==='Estrategista') progress.playerName=account.username;
        saveSession(account.username);
        if(legacyData) { persist(); localStorage.removeItem(STORAGE_KEY); }
      } else {
        const record=findAccountRecord(username);
        if(!record) {
          if(window.PiuOnline?.configured()) {
            try { const remote=await window.PiuOnline.loginExisting(username,password); await finishOnlineLogin(remote.username,password,remote); return; }
            catch(error) {
              authMessage(error.code==='account_not_found'?'Não encontrei uma conta com esse usuário. Crie uma conta para começar ou confirme o nome.':error.message||'Não foi possível entrar na conta online.');
              return;
            }
          }
          const hasSavedProfile=!!localStorage.getItem(accountProgressKey(username));
          authMessage(hasSavedProfile?'Os dados deste perfil foram encontrados, mas a credencial local precisa ser recriada. Use “Recuperar acesso”.':'Não encontrei esse perfil neste navegador. Confirme o nome e use o mesmo navegador e endereço em que a conta foi criada.');
          return;
        }
        const account=normalizeAccountRecord(record);
        if(!account) { authMessage('Este perfil usa um formato de credencial antigo. Use “Recuperar acesso” para definir uma nova senha sem perder o progresso.'); return; }
        const hasStoredIterations=record.iterations!==undefined||record.kdfIterations!==undefined||record.rounds!==undefined;
        const roundsToTry=hasStoredIterations?[account.iterations]:[...new Set([account.iterations,...LEGACY_PASSWORD_ITERATIONS])];
        let matchedIterations=0;
        for(const rounds of roundsToTry) {
          const candidate=await hashPassword(password,account.salt,rounds);
          if(hashesMatch(candidate,account.hash)) { matchedIterations=rounds; break; }
        }
        if(!matchedIterations) {
          if(window.PiuOnline?.configured()) {
            try { const remote=await window.PiuOnline.loginExisting(username,password); await finishOnlineLogin(remote.username,password,remote); return; }
            catch(error) { authMessage(error.code==='account_not_found'?'A senha não corresponde a este perfil. Você pode tentar novamente ou usar “Recuperar acesso”.':error.message||'Usuário ou senha inválidos.'); return; }
          }
          authMessage('A senha não corresponde a este perfil. Você pode tentar novamente ou usar “Recuperar acesso”.'); return;
        }
        let verifiedAccount=account;
        if(matchedIterations!==PASSWORD_ITERATIONS||record.iterations!==PASSWORD_ITERATIONS||record.salt!==account.salt||record.hash!==account.hash||record.passwordHash!==undefined||record.password_hash!==undefined) {
          const salt=createSalt();
          verifiedAccount={username:account.username,salt,hash:await hashPassword(password,salt,PASSWORD_ITERATIONS),iterations:PASSWORD_ITERATIONS};
          storeAccountRecord(verifiedAccount);
        }
        currentUser=verifiedAccount;
        progress=readProgress(accountProgressKey(verifiedAccount.username));
        if(progress.playerName==='Estrategista') progress.playerName=verifiedAccount.username;
        saveSession(verifiedAccount.username);
      }
      updateDailyStreak(); ui.page='home'; ui.authMode='login'; ui.authMessage=''; ui.authError=false; ui.toast=''; render();
      if(mode==='reset') showToast('Senha redefinida. Seu XP e seu progresso foram mantidos.');
      if(mode==='reset'&&window.PiuOnline?.getProfile?.()?.username?.toLowerCase()===currentUser.username.toLowerCase()) {
        window.PiuOnline.changePassword(password).then(()=>showToast('Senha online atualizada.')).catch(()=>showToast('A senha local foi redefinida; entre novamente online com a senha anterior para sincronizar.'));
      } else if(mode!=='reset'&&window.PiuOnline?.configured()) {
        const snapshot={...progress,settings:{...progress.settings},completed:[...progress.completed],solvedChallenges:[...progress.solvedChallenges]};
        window.PiuOnline.attachLocalAccount({username:currentUser.username,password,profile:snapshot,createIfMissing:true})
          .catch(error=>window.PiuOnlineAuthError?.(error));
      }
    } catch (error) {
      authMessage('Não foi possível criar ou abrir a conta. Use GitHub Pages, localhost ou um navegador atualizado.');
    }
  }
  function logout() {
    try { localStorage.removeItem(SESSION_KEY); } catch (error) { /* A sessão também é encerrada nesta página. */ }
    currentUser=null; progress=freshProgress(); ui.page='home'; ui.authMode='login'; ui.authMessage='Você saiu da conta.'; ui.authError=false; ui.toast='';
    game=fromFen(challenges[0].fen); render();
  }
  const ui = { page: 'home', lessonIndex: 0, lessonAnswers: {}, challengeIndex: 0, mode: 'puzzle', opponentId: 'tico', toast: '', toastTimer: null, profileTab: 'birds', authMode: 'login', authMessage: '', authError: false };
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
    { id: 'profile', icon: '◎', label: 'Meu perfil' },
    { id: 'settings', icon: '⚙️', label: 'Configurações' },
    { id: 'online', icon: '🌐', label: 'Multiplayer' }
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
    return ({ home:'Início', path:'Trilha de aulas', practice:'Praticar', training:'Partidas de treino', profile:'Meu perfil', settings:'Configurações', online:'Multiplayer online' })[ui.page] || 'Piu Xadrez';
  }
  function authView() {
    const creating=ui.authMode==='register';
    const recovering=ui.authMode==='reset';
    const onlineAvailable=window.PiuOnline?.configured?.()===true;
    const title=recovering?'Recuperar acesso':creating?'Crie sua conta':'Entre para aprender';
    const intro=recovering?'Defina uma nova senha para seu perfil local. O progresso existente será mantido.':creating?'Escolha um nome de usuário e uma senha. Não precisa de e-mail.':'Entre para continuar de onde parou.';
    const passLabel=recovering?'Nova senha':'Senha';
    const hints=recovering?'A redefinição local não apaga XP, rating, conquistas ou aulas. Se o perfil online estiver conectado, sua senha do servidor também é atualizada. Como não há e-mail, qualquer pessoa com acesso a este navegador pode redefinir a conta local.':creating?`Use de 3 a 20 caracteres no usuário. ${onlineAvailable?'Seu perfil será sincronizado para partidas online.':'Sua conta e seu progresso ficam salvos neste navegador.'}`:onlineAvailable?'Entre com o usuário e a senha do seu perfil. Contas online recuperam o progresso sincronizado.':'Seu perfil fica neste navegador. Use o mesmo navegador e endereço em que criou a conta.';
    const confirmation=creating||recovering?`<label for="auth-confirm-password">Confirme a nova senha</label><input id="auth-confirm-password" name="confirmPassword" type="password" minlength="8" maxlength="128" autocomplete="new-password" required placeholder="Digite novamente">`:'';
    const modeButton=recovering?'<button type="button" class="auth-switch" data-action="auth-login">Voltar ao login</button>':`<button type="button" class="auth-switch" data-action="auth-mode">${creating?'Já tem conta? Entrar':'Primeira vez aqui? Criar conta'}</button>`;
    const recoveryButton=!creating&&!recovering?'<button type="button" class="auth-recovery" data-action="recover-account">Esqueci minha senha · Recuperar acesso</button>':'';
    const footnote=onlineAvailable?'Sem e-mail. A senha nunca é exibida; o multiplayer usa uma conta sincronizada no servidor.':'Sem e-mail. Este perfil fica salvo apenas neste navegador.';
    return `<main class="auth-screen"><div class="auth-brand"><span class="brand-mark" aria-hidden="true">♞</span><span>Piu Xadrez</span></div><section class="card auth-card" aria-labelledby="auth-title"><div class="auth-mascot">${mascotBird()}</div><p class="eyebrow">Seu cantinho de xadrez</p><h1 id="auth-title">${title}</h1><p class="auth-intro">${intro}</p><form class="auth-form" data-auth-form="${recovering?'reset':creating?'register':'login'}"><label for="auth-username">Nome de usuário</label><input id="auth-username" name="username" type="text" minlength="3" maxlength="20" pattern="[A-Za-z0-9_.-]{3,20}" autocomplete="username" required placeholder="Ex.: Ana_Chess"><label for="auth-password">${passLabel}</label><input id="auth-password" name="password" type="password" minlength="${creating||recovering?8:1}" maxlength="128" autocomplete="${creating||recovering?'new-password':'current-password'}" required placeholder="${creating||recovering?'Pelo menos 8 caracteres':'Digite sua senha'}">${confirmation}<small class="auth-hint">${hints}</small><button type="submit" class="button button-primary auth-submit">${recovering?'Redefinir senha':creating?'Criar conta':'Entrar'} <span aria-hidden="true">→</span></button></form>${ui.authMessage?`<p class="auth-message ${ui.authError?'error':''}" role="status">${escapeHtml(ui.authMessage)}</p>`:''}${modeButton}${recoveryButton}</section><p class="auth-footnote">${footnote}</p></main>`;
  }
  function headerMarkup() {
    const onlineRating=window.PiuOnline?.getProfile?.()?.rating;
    return `<header class="topbar"><div class="breadcrumb">Piu Xadrez <span aria-hidden="true">›</span> <strong>${pageTitle()}</strong></div><div class="top-profile"><div class="top-xp"><span aria-hidden="true">✦</span> ${progress.xp} XP</div>${Number.isInteger(onlineRating)?`<div class="top-rating" title="Rating validado pelo servidor">♟ ${onlineRating}</div>`:''}${avatarVisual(progress.avatar,'avatar')}<span class="player-name">${escapeHtml(currentUser.username)}</span><button type="button" class="button button-outline button-small logout-button" data-action="logout">Sair</button></div></header>`;
  }
  function shell(content) {
    return `<div class="layout" data-board-theme="${progress.settings.boardTheme}" data-piece-style="${progress.settings.pieceStyle}" data-piu-animations="${progress.settings.piuAnimations?'on':'off'}"><aside class="sidebar"><div class="brand"><span class="brand-mark" aria-hidden="true">♞</span><span>Piu Xadrez</span></div><div class="nav-label">Aprender</div>${navMarkup()}<div class="sidebar-spacer"></div><div class="side-streak"><span class="flame" aria-hidden="true">🔥</span><strong>${progress.streak} ${progress.streak===1?'dia':'dias'} de sequência</strong><p>Uma aula por dia e logo você vira mestre do tabuleiro.</p></div><div class="sidebar-footer">Feito para aprender, lance a lance.</div></aside><div class="main-column">${headerMarkup()}<main class="page-content">${content}</main></div>${navMarkup('mobile-nav')}${ui.toast?`<div class="toast" role="status">${ui.toast}</div>`:''}</div>`;
  }

  function homeView() {
    const bossUnlocked=progress.completed.length>=lessons.length;
    const classicBossUnlocked=progress.completed.length>=LEGACY_BOSS_UNLOCK;
    const next=nextLessonIndex(), lesson=lessons[next], first=!progress.completed.length;
    return `<section aria-labelledby="welcome-title"><div class="hero-card"><div class="hero-copy"><p class="eyebrow">Seu cantinho de xadrez</p><h1 id="welcome-title">Olá, ${escapeHtml(currentUser.username)}!</h1><p>${first?'Aprenda xadrez jogando! A cada lance, uma nova descoberta.':'Que bom ter você de volta! Continue aprendendo a cada lance.'}</p><div class="hero-actions"><button type="button" class="button button-primary" data-action="start">${first?'COMEÇAR':bossUnlocked?'JOGAR CONTRA O PIU':'CONTINUAR APRENDENDO'} <span aria-hidden="true">→</span></button><button type="button" class="button button-soft" data-page="path">Ver a trilha</button>${classicBossUnlocked&&!bossUnlocked?'<button type="button" class="button button-soft" data-action="boss">Desafiar o Piu</button>':''}</div></div><div class="hero-art">${mascotBird()}<div class="mascot-caption">Oi! Eu sou o Piu 👋</div></div></div>
      <div class="stats-grid"><article class="stat-card"><div class="stat-top"><span>Nível atual</span><span class="stat-icon">🏅</span></div><div class="stat-number">${currentLevel()} <small>de ${totalLevelCount()}</small></div></article><article class="stat-card"><div class="stat-top"><span>Experiência</span><span class="stat-icon">✦</span></div><div class="stat-number">${progress.xp} <small>XP</small></div></article><article class="stat-card"><div class="stat-top"><span>Sequência</span><span class="stat-icon">🔥</span></div><div class="stat-number">${progress.streak} <small>${progress.streak===1?'dia':'dias'}</small></div></article></div>
      <div class="section-heading"><h2>Sua próxima jogada</h2><button type="button" class="text-button" data-page="path">Ver todas as aulas →</button></div>
      <div class="home-grid"><article class="card continue-card"><div class="continue-copy"><span class="lesson-pill">${bossUnlocked?'NÍVEL BOSS':'AULA '+(next+1)+' · '+lesson.time}</span><h3>${bossUnlocked?'Desafie o Piu':lesson.title}</h3><p>${bossUnlocked?'Você chegou ao final da trilha. Agora é sua vez de jogar contra o Piu!':'Uma nova etapa para aprender no seu ritmo.'}</p><div class="mini-progress" aria-label="${percentComplete()}% das aulas concluídas"><span style="width:${percentComplete()}%"></span></div></div><button type="button" class="button button-green" data-action="${bossUnlocked?'boss':'continue'}">${bossUnlocked?'JOGAR':'CONTINUAR'} <span aria-hidden="true">→</span></button></article><article class="card bird-tip">${mascotBird()}<div><strong>Piu te lembra</strong><p>“Cada grande jogador começou aprendendo um lance. Vamos nessa!”</p></div></article></div>
      <div class="section-heading"><h2>Seu progresso</h2><button type="button" class="text-button" data-page="profile">Ver perfil →</button></div><article class="card" style="padding:18px 20px"><div class="path-progress-meta"><span>${progress.completed.length} de ${lessons.length} aulas concluídas</span><span>${percentComplete()}%</span></div><div class="progress-track"><span style="width:${percentComplete()}%"></span></div></article>
    </section>`;
  }

  function lessonDifficulty(index) {
    if (index < 13) return 'Iniciante';
    if (index < 18) return 'Médio';
    if (index < 23) return 'Difícil';
    return 'Avançado';
  }
  function pathView() {
    const openCount=Math.min(progress.completed.length+1,lessons.length);
    const bossUnlocked=progress.completed.length>=LEGACY_BOSS_UNLOCK;
    const sectionNames={0:'Iniciante · fundamentos',13:'Médio · estratégia e táticas',18:'Difícil · cálculo e finais',23:'Avançado · estratégia posicional',28:'Avançado · combinações e defesa',33:'Avançado · finais técnicos',38:'Avançado · preparação de partida'};
    const bossCard=`<div class="path-section-heading">Desafio especial · libere após a área difícil</div><article class="lesson-card boss-card ${bossUnlocked?'open':'locked'} ${progress.bossWins?'done':''}" ${bossUnlocked?'data-boss="true" role="button" tabindex="0"':''} aria-label="${bossUnlocked?'Jogar contra o Piu':'Boss bloqueado: conclua as primeiras 23 aulas'}"><div class="lesson-number">${progress.bossWins?'✓':'♚'}</div><div class="lesson-meta"><strong>Boss clássico: contra o Piu</strong><span>${bossUnlocked?'Jogue de brancas contra o Piu · Vitórias: '+progress.bossWins:'Conclua a trilha até a área difícil para desbloquear'}</span></div><div class="lesson-cta">${bossUnlocked?'JOGAR':'🔒'} <span aria-hidden="true">${bossUnlocked?'→':''}</span></div></article>`;
    const lessonCards=lessons.map((lesson,index)=>{
      const done=progress.completed.includes(index), unlocked=index<openCount || done, status=done?'Concluída':unlocked?'Disponível':'Bloqueada';
      const heading=sectionNames[index]?`<div class="path-section-heading">${sectionNames[index]}</div>`:'';
      const badge=lesson.final?'<span class="final-badge">PROVA FINAL</span>':'';
      const nextGoal=!done&&unlocked?` · Próximo objetivo: ${lesson.title}`:'';
      return `${heading}<article class="lesson-card ${done?'done':''} ${unlocked?'open':'locked'} ${lesson.final?'final-lesson':''}" ${unlocked?`data-lesson="${index}" role="button" tabindex="0" aria-label="Abrir aula ${index+1}: ${lesson.title}"`:''}><div class="lesson-number">${done?'✓':index+1}</div><div class="lesson-meta"><strong><span class="lesson-emoji" aria-hidden="true">${lesson.icon}</span>Nível ${index+1} — ${lesson.title} ${badge}</strong><span>${lessonDifficulty(index)} · ${lesson.time} · ${status}${nextGoal}</span></div><div class="lesson-cta">${done?'REVER':unlocked?'COMEÇAR':'🔒'} <span aria-hidden="true">${unlocked?'→':''}</span></div></article>${index===22?bossCard:''}`;
    }).join('');
    const nextIndex=lessons.findIndex((_,index)=>!progress.completed.includes(index));
    const nextGoal=nextIndex>=0?`Próximo objetivo: Nível ${nextIndex+1} — ${lessons[nextIndex].title}`:'Próximo objetivo: enfrentar os personagens e buscar novas vitórias.';
    return `<section aria-labelledby="path-title"><div class="path-header"><div><p class="eyebrow">Sua jornada · ${lessons.length} etapas</p><h1 id="path-title">Trilha de aprendizado</h1><p class="subheading" style="margin:6px 0 0">Fundamentos, estratégia, tática e finais. Cada etapa nova traz uma ideia diferente.</p></div><article class="card path-progress-card"><div class="path-progress-meta"><span>Seu progresso</span><span>${progress.completed.length}/${lessons.length} aulas · ${percentComplete()}%</span></div><div class="progress-track"><span style="width:${percentComplete()}%"></span></div></article></div><article class="card path-next-goal"><strong>🎯 ${nextGoal}</strong><button type="button" class="button button-green button-small" data-action="continue">Continuar →</button><button type="button" class="button button-outline button-small" data-action="training">Conhecer personagens</button></article><div class="path-list">${lessonCards}</div></section>`;
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
    const reward=lesson.reward||25;
    return `<section aria-labelledby="lesson-title"><div class="lesson-topline"><button type="button" class="back-button" data-page="path"><span aria-hidden="true">←</span> Trilha</button><span class="lesson-pill" style="margin:0">NÍVEL ${i+1} DE ${totalLevelCount()}${lesson.final?' · PROVA FINAL':''}</span></div><div class="lesson-layout"><article class="card lesson-main-card"><p class="eyebrow">${lesson.time} de aprendizado${lesson.final?' · etapa de conclusão':''}</p><h1 id="lesson-title">${lesson.icon} ${lesson.title}</h1><p class="lesson-description">${lesson.intro}</p><div class="visual-example">${miniBoard(i)}<div class="visual-caption"><strong>Veja a ideia no tabuleiro</strong>${lesson.move}<br>As peças do xadrez seguem movimentos próprios. Pratique e observe cada casa.</div></div><div class="coach-note"><span class="note-emoji" aria-hidden="true">🐦</span><span>${lesson.tip}</span></div>${answerBlock('quiz',lesson.quiz,answers.quiz)}${answerBlock('exercise',lesson.exercise,answers.exercise)}</article><aside class="lesson-sidebar"><article class="card lesson-summary"><h3>${lesson.final?'Prova de área':'Resumo da aula'}</h3><p>Responda à pergunta e complete o exercício. Você pode tentar quantas vezes precisar.</p><div class="summary-line"><span>Etapas</span><strong>${Number(!!answers.quiz?.correct)+Number(!!answers.exercise?.correct)}/2</strong></div><div class="summary-line"><span>Recompensa</span><strong>+${reward} XP ✦</strong></div>${lesson.final?'<div class="summary-line"><span>Extra</span><strong>Marca de conclusão</strong></div>':''}<div class="summary-line"><span>Status</span><strong>${complete?'Concluída':allCorrect?'Pronta!':'Em andamento'}</strong></div><button type="button" class="button button-green lesson-complete" data-action="complete-lesson" ${(!allCorrect && !complete)?'disabled':''}>${complete?'Aula concluída ✓':allCorrect?`Concluir aula +${reward} XP`:'Responder para concluir'}</button></article><div class="unlock-note"><strong>🎯 Dica do Piu</strong>Leia com calma e experimente as respostas. Errar também faz parte de aprender!</div></aside></div></section>`;
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
    const isPuzzle=ui.mode==='puzzle', isBoss=ui.mode==='boss', isTraining=ui.mode==='training';
    const opponent=trainingOpponents.find(item=>item.id===ui.opponentId)||trainingOpponents[0];
    const title=isPuzzle?challenge.title:isBoss?'Você contra o Piu':isTraining?`Você contra ${opponent.name}`:'Jogo livre';
    const turn=game.checkmate?'Partida encerrada':(isBoss||isTraining)?(game.aiThinking?`${isBoss?'Piu':opponent.name} pensando…`:game.turn==='w'?'Sua vez · brancas':`${isBoss?'Piu':opponent.name} joga · pretas`):`Vez das ${game.turn==='w'?'brancas':'pretas'}`;
    let challengeActions;
    if(isPuzzle) challengeActions=`<div class="challenge-dots">${challenges.map((_,i)=>`<span class="challenge-dot ${i===ui.challengeIndex?'active':''} ${progress.solvedChallenges.includes(i)?'done':''}"></span>`).join('')}</div><button type="button" class="button button-green" style="margin-top:15px" data-action="${game.puzzleSolved?'next-challenge':'reset-challenge'}">${game.puzzleSolved?'Próximo desafio →':'Tentar novamente'}</button><button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="free-play">Quero jogar livremente</button>`;
    else if(isBoss) challengeActions=`<div class="boss-opponent">${mascotBird()}<div><strong>Piu, nível Boss</strong><span>Você joga de brancas. Piu responde de pretas.</span></div></div><p class="boss-reward">Vença o Piu e ganhe 50 XP. ${progress.bossWins?`Vitórias: ${progress.bossWins}`:''}</p><button type="button" class="button button-green" data-action="rematch-piu">${game.checkmate?'Jogar outra vez':'Recomeçar partida'}</button><button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="puzzles">Voltar aos desafios</button>`;
    else if(isTraining) challengeActions=`<div class="training-opponent"><span class="training-character" aria-hidden="true">${opponent.emoji}</span><div><strong>${opponent.name} · ${opponent.title}</strong><span>${opponent.bio}</span></div></div><p class="boss-reward">Vitórias em treinos: ${progress.trainingWins} · Cada vitória vale 20 XP.</p><button type="button" class="button button-green" data-action="rematch-training">${game.checkmate?'Jogar outra vez':'Recomeçar partida'}</button><button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="training">Trocar de personagem</button>`;
    else challengeActions=`<button type="button" class="button button-green" data-action="reset-board">Nova partida</button><button type="button" class="button button-outline" style="margin-top:9px" data-action="training">Jogar contra personagens</button><button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="puzzles">Voltar aos desafios</button>${progress.completed.length>=lessons.length?`<button type="button" class="text-button" style="display:block;margin:10px auto 0" data-action="boss">Desafiar o Piu</button>`:''}`;
    const subtitle=isBoss?'Encontre seus melhores lances. O Piu joga pelas pretas e responde automaticamente.':isTraining?`Treino contra ${opponent.name}: escolha seus lances e veja como suas ideias funcionam numa partida completa.`:'Clique em uma peça para ver os movimentos legais e escolha uma casa destacada.';
    return `<section aria-labelledby="practice-title"><p class="eyebrow">${isBoss?'Nível Boss':isTraining?'Partida de treinamento':'Hora de colocar em prática'}</p><h1 id="practice-title">${isBoss?'Partida contra o Piu':isTraining?`Partida contra ${opponent.name}`:'Vamos jogar?'}</h1><p class="subheading">${subtitle}</p><div class="practice-layout"><article class="card board-card"><div class="board-top"><h2>${isPuzzle?'Desafio do momento':isBoss?'Nível Boss · Piu':isTraining?`Treino · ${opponent.name}`:'Tabuleiro livre'}</h2><span class="turn-pill">${turn}</span></div>${boardMarkup()}<div class="board-status ${game.error?'error':''}" role="status">${game.message}</div><div class="board-controls">${ui.mode==='free'?`<button type="button" class="button button-outline button-small" data-action="reset-board">Reiniciar tabuleiro</button>`:''}</div></article><aside class="practice-side"><article class="card challenge-card"><span class="challenge-tag">${isPuzzle?challenge.tag:isBoss?'BOSS FINAL':isTraining?'PARTIDA COM PERSONAGEM':'Treino livre'}</span><h2>${title}</h2><p>${isPuzzle?challenge.prompt:isBoss?'Você controla as brancas. O Piu controla as pretas e faz um lance depois de cada jogada sua.':isTraining?`Você controla as brancas. ${opponent.name} joga pelas pretas e responde automaticamente.`:'Mova as peças brancas e pretas alternando os turnos. As regras legais, o xeque e o xeque-mate são verificados automaticamente.'}</p>${challengeActions}</article><article class="card how-card"><h3>Como jogar</h3><p><strong>1.</strong> Selecione uma peça da vez.<br><strong>2.</strong> As casas possíveis ficam destacadas.<br><strong>3.</strong> Clique em uma casa para mover.</p><div class="move-list"><strong>Últimos lances</strong><br>${game.history.length?game.history.slice(-6).map((move,i)=>`${Math.max(1,Math.ceil((game.history.length-5)/2)+Math.floor(i/2))}${i%2===0?'.':'...'} ${move}`).join(' &nbsp; '):'Seus lances aparecerão aqui.'}</div></article></aside></div></section>`;
  }

  function trainingLobbyView() {
    const cards=trainingOpponents.map(opponent=>{
      const unlocked=progress.completed.length>=opponent.unlockAt;
      const requirement=opponent.unlockAt?`Conclua ${opponent.unlockAt} aulas para liberar`:'Disponível agora';
      return `<article class="card training-card ${unlocked?'':'locked'}"><div class="training-character" aria-hidden="true">${opponent.emoji}</div><p class="challenge-tag">${opponent.title}</p><h2>${opponent.name}</h2><p>${opponent.bio}</p><div class="training-card-meta"><span>${unlocked?'Partida disponível':'🔒 '+requirement}</span><span>Força ${opponent.strength+1}/3</span></div><button type="button" class="button ${unlocked?'button-green':'button-outline'}" data-training-opponent="${opponent.id}" ${unlocked?'':'disabled'}>${unlocked?'Jogar partida':'Desbloquear na trilha'} ${unlocked?'→':''}</button></article>`;
    }).join('');
    return `<section aria-labelledby="training-title"><button type="button" class="back-button" data-page="path"><span aria-hidden="true">←</span> Voltar à trilha</button><p class="eyebrow">Partidas de treinamento</p><h1 id="training-title">Escolha um personagem</h1><p class="subheading">Partidas completas contra personagens com estilos e forças diferentes. Uma boa oportunidade para colocar suas aulas em prática.</p><div class="training-grid">${cards}</div><article class="card training-progress"><strong>Seu placar de treino</strong><span>${progress.trainingWins} vitórias · ${progress.trainingDraws} empates · ${progress.trainingLosses} derrotas</span><span>${progress.trainingGames} partidas iniciadas</span></article></section>`;
  }

  function settingsView() {
    const themeOptions=BOARD_THEMES.map(theme=>`<button type="button" class="settings-choice ${progress.settings.boardTheme===theme.id?'selected':''}" data-setting="boardTheme" data-value="${theme.id}" aria-pressed="${progress.settings.boardTheme===theme.id}"><span class="settings-theme-preview theme-${theme.id}" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span><strong>${theme.name}</strong><small>${progress.settings.boardTheme===theme.id?'Em uso':'Aplicar tema'}</small></span>${progress.settings.boardTheme===theme.id?'<span class="settings-check" aria-label="Selecionado">✓</span>':''}</button>`).join('');
    const pieceOptions=PIECE_STYLES.map(style=>`<button type="button" class="settings-choice ${progress.settings.pieceStyle===style.id?'selected':''}" data-setting="pieceStyle" data-value="${style.id}" aria-pressed="${progress.settings.pieceStyle===style.id}"><span class="piece-style-preview style-${style.id}" aria-hidden="true"><b>♙</b><b>♞</b></span><span><strong>${style.name}</strong><small>${progress.settings.pieceStyle===style.id?'Em uso':'Aplicar estilo'}</small></span>${progress.settings.pieceStyle===style.id?'<span class="settings-check" aria-label="Selecionado">✓</span>':''}</button>`).join('');
    return `<section aria-labelledby="settings-title"><p class="eyebrow">Do seu jeito</p><h1 id="settings-title">Configurações</h1><p class="subheading">Personalize sua experiência. As preferências ficam salvas no seu perfil neste navegador.</p><article class="card settings-section"><div class="settings-section-heading"><span class="settings-section-icon" aria-hidden="true">▦</span><div><h2>Tabuleiro</h2><p>Escolha as cores das casas para as partidas e desafios.</p></div></div><div class="settings-choice-grid" role="group" aria-label="Temas do tabuleiro">${themeOptions}</div></article><article class="card settings-section"><div class="settings-section-heading"><span class="settings-section-icon" aria-hidden="true">♞</span><div><h2>Peças</h2><p>Altere o contraste e as cores das peças no tabuleiro.</p></div></div><div class="settings-choice-grid" role="group" aria-label="Estilos de peças">${pieceOptions}</div></article><article class="card settings-section settings-motion"><div class="settings-section-heading"><span class="settings-section-icon" aria-hidden="true">✨</span><div><h2>Animações do Piu</h2><p>Controle o movimento suave do mascote pela interface.</p></div></div><button type="button" class="settings-switch ${progress.settings.piuAnimations?'on':''}" role="switch" aria-checked="${progress.settings.piuAnimations}" data-setting="piuAnimations" data-value="${!progress.settings.piuAnimations}"><span class="switch-track"><span class="switch-thumb"></span></span><span class="switch-label">Animações ${progress.settings.piuAnimations?'ativadas':'desativadas'}</span></button></article><p class="settings-saved-note" role="status">✓ Preferências salvas automaticamente para ${escapeHtml(currentUser.username)}.</p><button type="button" class="button button-outline settings-back" data-page="profile">Voltar ao perfil</button></section>`;
  }

  function saveSetting(name,value) {
    const allowed={
      boardTheme:BOARD_THEMES.map(theme=>theme.id),
      pieceStyle:PIECE_STYLES.map(style=>style.id),
      piuAnimations:['true','false']
    };
    if(!Object.prototype.hasOwnProperty.call(allowed,name)||!allowed[name].includes(String(value))) return;
    progress.settings[name]=name==='piuAnimations'?String(value)==='true':String(value);
    persist(); render();
    const message=name==='boardTheme'?'Tema do tabuleiro salvo!':name==='pieceStyle'?'Estilo das peças salvo!':`Animações do Piu ${progress.settings.piuAnimations?'ativadas':'desativadas'}.`;
    showToast(message);
  }

  function profileView() {
    const unlocked=achievements.filter(a=>a.test(progress)).length;
    const onlineRating=window.PiuOnline?.getProfile?.()?.rating;
    const ratingStat=Number.isInteger(onlineRating)?`<article class="card profile-stat"><div class="stat-top">Rating online<span>🌐</span></div><div class="stat-number">${onlineRating} <small>elo</small></div></article>`:`<article class="card profile-stat"><div class="stat-top">Rating online<span>🌐</span></div><div class="stat-number">— <small>conecte-se</small></div></article>`;
    const avatarOptions = PROFILE_BIRDS.map(option=>({ ...option, isPhoto: false, available: progress.completed.length >= (option.unlockAt||0) }));
    if(progress.magnusUnlocked) avatarOptions.push({ id:'magnus', name:'Magnus Carlsen', isPhoto:true });
    const avatarChoices = avatarOptions.map(option=>`<button type="button" class="avatar-choice ${progress.avatar===option.id?'selected':''} ${option.available===false?'avatar-locked':''}" ${option.available===false?'disabled':`data-avatar="${option.id}"`} aria-pressed="${progress.avatar===option.id}" aria-label="${option.available===false?`Bloqueado: ${option.name}`:`Usar avatar ${option.name}`}">${option.isPhoto?`<img src="${MAGNUS_PHOTO}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span aria-hidden="true">${option.emoji}</span>`}<strong>${option.name}</strong>${option.available===false?`<small>🔒 ${option.unlockAt} aulas</small>`:progress.avatar===option.id?'<span class="avatar-selected-mark" aria-label="Selecionado">✓</span>':''}</button>`).join('');
    const birdPanel = `<div class="profile-tab-panel" role="tabpanel" id="profile-birds-panel" ${ui.profileTab==='birds'?'':'hidden'}><p>Escolha uma ave para aparecer no seu perfil. Algumas são recompensas da trilha.</p><div class="avatar-options">${avatarChoices}</div>${progress.magnusUnlocked?`<p class="photo-credit">Foto: <a href="${MAGNUS_SOURCE}" target="_blank" rel="noreferrer">Stefan64 / Wikimedia Commons</a> · <a href="${MAGNUS_LICENSE}" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>.</p>`:''}</div>`;
    const codePanel = `<div class="profile-tab-panel" role="tabpanel" id="profile-code-panel" ${ui.profileTab==='code'?'':'hidden'}><p>Tem um código especial? Digite aqui para liberar um avatar surpresa.</p><form class="unlock-code-form" data-profile-form="unlock-magnus"><label for="unlock-code">Código secreto</label><div class="profile-form-row"><input id="unlock-code" name="code" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="Digite o código" aria-describedby="unlock-code-hint"><button type="submit" class="button button-green">Desbloquear</button></div><small id="unlock-code-hint">O código libera uma foto especial de perfil.</small></form>${progress.magnusUnlocked?'<div class="unlock-success" role="status">✓ Foto especial desbloqueada! Encontre-a na aba Aves.</div>':''}</div>`;
    return `<section aria-labelledby="profile-title"><p class="eyebrow">Seu caminho até aqui</p><h1 id="profile-title">Meu perfil</h1><p class="subheading">Cada partida e cada aula fazem parte da sua evolução.</p><article class="card profile-hero">${avatarVisual(progress.avatar,'profile-avatar')}<div><h2>${escapeHtml(progress.playerName)}</h2><p>Aprendiz de xadrez · Nível ${currentAccountLevel()}</p></div><div class="profile-xp"><strong>${progress.xp} XP</strong><span>${progress.xp%100}/100 para o próximo nível</span></div></article><article class="card profile-editor"><h2>Personalize seu perfil</h2><form class="profile-name-form" data-profile-form="player-name"><label for="player-name">Seu nome</label><div class="profile-form-row"><input id="player-name" name="playerName" type="text" maxlength="24" value="${escapeHtml(progress.playerName)}" autocomplete="nickname" placeholder="Como quer ser chamado?"><button type="submit" class="button button-green">Salvar nome</button></div></form><div class="profile-tabs" role="tablist" aria-label="Opções da foto de perfil"><button type="button" class="profile-tab ${ui.profileTab==='birds'?'active':''}" data-profile-tab="birds" role="tab" aria-selected="${ui.profileTab==='birds'}" aria-controls="profile-birds-panel">Aves</button><button type="button" class="profile-tab ${ui.profileTab==='code'?'active':''}" data-profile-tab="code" role="tab" aria-selected="${ui.profileTab==='code'}" aria-controls="profile-code-panel">Código secreto</button></div>${birdPanel}${codePanel}</article><div class="profile-grid"><article class="card profile-stat"><div class="stat-top">Nível da trilha<span>📖</span></div><div class="stat-number">${currentLevel()} <small>de ${totalLevelCount()}</small></div></article><article class="card profile-stat"><div class="stat-top">Aulas concluídas<span>✅</span></div><div class="stat-number">${progress.completed.length} <small>de ${lessons.length}</small></div></article><article class="card profile-stat"><div class="stat-top">Sequência atual<span>🔥</span></div><div class="stat-number">${progress.streak} <small>${progress.streak===1?'dia':'dias'}</small></div></article>${ratingStat}<article class="card profile-stat"><div class="stat-top">Partidas contra o Piu<span>♟</span></div><div class="stat-number">${progress.bossGames} <small>jogadas</small></div></article><article class="card profile-stat"><div class="stat-top">Treinos contra personagens<span>🎭</span></div><div class="stat-number">${progress.trainingWins} <small>vitórias</small></div></article></div><div class="section-heading"><h2>Conquistas</h2><span class="text-button" style="cursor:default">${unlocked} de ${achievements.length} desbloqueadas</span></div><div class="achievement-grid">${achievements.map(a=>`<article class="achievement ${a.test(progress)?'':'locked'}"><div class="achievement-icon" aria-hidden="true">${a.icon}</div><div><strong>${a.name}</strong><span>${a.desc}</span></div></article>`).join('')}</div><div class="section-heading"><h2>Progresso da trilha</h2></div><article class="card" style="padding:18px 20px;margin-bottom:16px"><div class="path-progress-meta"><span>${progress.completed.length} aulas concluídas · ${progress.bossWins} vitórias · ${progress.bossLosses} derrotas · ${progress.bossDraws} empates contra o Piu · ${progress.trainingWins} vitórias contra personagens</span><span>${percentComplete()}%</span></div><div class="progress-track"><span style="width:${percentComplete()}%"></span></div></article><article class="card settings-card"><div><h3>Dados neste navegador</h3><p>Seu XP, aulas e sequência ficam salvos neste dispositivo.</p></div><button type="button" class="button button-outline button-small" data-action="reset-progress">Zerar progresso</button></article></section>`;
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
    const allowed = PROFILE_BIRDS.some(option=>option.id===avatarId && progress.completed.length>=(option.unlockAt||0)) || (avatarId==='magnus' && progress.magnusUnlocked);
    if(!allowed) { showToast('Desbloqueie esse avatar primeiro.'); return; }
    progress.avatar=avatarId; persist(); render();
    const selected=avatarId==='magnus'?'Magnus Carlsen':PROFILE_BIRDS.find(option=>option.id===avatarId).name;
    showToast(`Foto de perfil alterada para ${selected}!`);
  }

  function render() {
    if(!currentUser) { app.innerHTML=authView(); return; }
    let content='';
    if(ui.page==='home') content=homeView();
    else if(ui.page==='path') content=pathView();
    else if(ui.page==='lesson') content=lessonView();
    else if(ui.page==='practice') content=boardView();
    else if(ui.page==='training') content=trainingLobbyView();
    else if(ui.page==='profile') content=profileView();
    else if(ui.page==='settings') content=settingsView();
    else if(ui.page==='online') content=window.PiuOnline?.render({ username:currentUser.username, progress }) || '<p>Multiplayer indisponível.</p>';
    app.innerHTML=shell(content);
  }
  window.PiuCurrentPage=()=>ui.page;
  window.PiuCurrentUser=()=>currentUser;
  window.PiuRender=render;
  window.PiuOnlineContext=()=>({username:currentUser?.username||'',progress});
  window.PiuApplyOnlineProfile=(remote,{merge=true}={})=>{
    if(!currentUser||!remote?.username||remote.username.toLowerCase()!==currentUser.username.toLowerCase()||!merge) return;
    progress=mergeProgressSnapshots(progress,remote.progress||{});
    persist();
    render();
  };
  window.PiuConnectOnline=async password=>{
    if(!currentUser) throw new Error('Entre no seu perfil local antes de conectar.');
    if(!await verifyLocalPassword(currentUser.username,password)) throw new Error('A senha não corresponde ao perfil atual.');
    const snapshot={...progress,settings:{...progress.settings},completed:[...progress.completed],solvedChallenges:[...progress.solvedChallenges]};
    return window.PiuOnline.attachLocalAccount({username:currentUser.username,password,profile:snapshot,createIfMissing:true});
  };
  window.PiuOnlineAuthError=error=>showToast(error?.message||'Não foi possível sincronizar o perfil online.');
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
    const reward=lessons[i].reward||25;
    progress.completed.push(i); progress.completed.sort((a,b)=>a-b); progress.xp+=reward; persist();
    ui.lessonAnswers={quiz:{selected:lessons[i].quiz.answer,correct:true},exercise:{selected:lessons[i].exercise.answer,correct:true}};
    render(); showToast(`Aula concluída! +${reward} XP${lessons[i].final?' · prova superada!':''} ✦`);
  }
  function setChallenge(index) {
    ui.challengeIndex=(index+challenges.length)%challenges.length;
    ui.mode='puzzle'; game=fromFen(challenges[ui.challengeIndex].fen); render();
  }
  function startBoss() {
    if (progress.completed.length<LEGACY_BOSS_UNLOCK) { showToast('Conclua as aulas até a área difícil para desbloquear o Boss.'); return; }
    ui.mode='boss'; ui.page='practice'; progress.bossGames+=1; persist(); game=createInitialGame(); render();
  }
  function startTraining(opponentId) {
    const opponent=trainingOpponents.find(item=>item.id===opponentId)||trainingOpponents[0];
    if(progress.completed.length<opponent.unlockAt) { showToast(`Conclua ${opponent.unlockAt} aulas para jogar com ${opponent.name}.`); return; }
    ui.opponentId=opponent.id; ui.mode='training'; ui.page='practice';
    progress.trainingGames+=1; persist(); game=createInitialGame(); game.message=`A partida começou! ${opponent.name} joga de pretas.`; render();
  }
  function showTrainingLobby() { ui.page='training'; render(); }
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
  function chooseTrainingMove(position,opponent) {
    const options=allLegalMoves(position,'b');
    if(!options.length) return null;
    if(opponent.strength===0) return options[Math.floor(Math.random()*options.length)];
    if(opponent.strength>=2) return choosePiuMove(position);
    let bestScore=-Infinity, bestMoves=[];
    for(const move of options) {
      const next=applyRaw(position,move);
      let score=materialScore(next,'b')+moveCenterBonus(move);
      if(isInCheck(next,'w')) score+=0.5;
      if(!allLegalMoves(next,'w').length && isInCheck(next,'w')) score+=1000;
      score+=Math.random()*0.12;
      if(score>bestScore) { bestScore=score; bestMoves=[move]; }
      else if(score===bestScore) bestMoves.push(move);
    }
    return bestMoves[Math.floor(Math.random()*bestMoves.length)]||options[0];
  }
  function schedulePiuMove() {
    const position=game;
    setTimeout(()=>{
      if(ui.page!=='practice' || !['boss','training'].includes(ui.mode) || game!==position || !game.aiThinking || game.checkmate) return;
      const opponent=trainingOpponents.find(item=>item.id===ui.opponentId)||trainingOpponents[0];
      const move=ui.mode==='boss'?choosePiuMove(game):chooseTrainingMove(game,opponent);
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
      if(mate && piuMoved) { if(!game.bossResultRecorded) { progress.bossLosses+=1; persist(); next.bossResultRecorded=true; } next.message='Xeque-mate! Piu venceu. Quer tentar de novo?'; }
      else if(mate) {
        next.message='Xeque-mate! Você venceu o Piu! +50 XP';
        if(!game.bossRewarded) { progress.bossWins+=1; progress.xp+=50; next.bossRewarded=true; next.bossResultRecorded=true; persist(); bossWinMessage='Você venceu o Piu! +50 XP ✦'; }
      } else if(stalemate) { if(!game.bossResultRecorded) { progress.bossDraws+=1; persist(); next.bossResultRecorded=true; } next.message='Empate por afogamento. Boa partida!'; }
      else if(piuMoved) next.message=check?'Xeque! Piu está pressionando.':'Sua vez, estrategista!';
      else { next.message=check?'Xeque! Piu está pensando em como responder…':'Piu está pensando…'; next.aiThinking=true; }
    } else if(ui.mode==='training') {
      const opponent=trainingOpponents.find(item=>item.id===ui.opponentId)||trainingOpponents[0];
      const opponentMoved=moving.color==='b';
      next.aiThinking=false;
      if(mate && opponentMoved) {
        next.message=`Xeque-mate! Você venceu ${opponent.name}! +20 XP`;
        if(!game.trainingResultRecorded) { progress.trainingWins+=1; progress.xp+=20; persist(); next.trainingRewarded=true; next.trainingResultRecorded=true; }
      } else if(mate) {
        next.message=`Xeque-mate! ${opponent.name} venceu. Jogue outra partida para tentar de novo.`;
        if(!game.trainingResultRecorded) { progress.trainingLosses+=1; persist(); next.trainingResultRecorded=true; }
      } else if(stalemate) {
        next.message=`Empate por afogamento. Boa partida contra ${opponent.name}!`;
        if(!game.trainingResultRecorded) { progress.trainingDraws+=1; persist(); next.trainingResultRecorded=true; }
      } else if(opponentMoved) next.message=check?'Xeque! Boa jogada.':'Sua vez!';
      else { next.message=check?`Xeque! ${opponent.name} está pensando…`:`${opponent.name} está pensando…`; next.aiThinking=true; }
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
    else if(ui.mode==='training' && game.trainingRewarded) showToast(`Vitória contra ${trainingOpponents.find(item=>item.id===ui.opponentId)?.name||'o personagem'}! +20 XP ✦`);
    if(['boss','training'].includes(ui.mode) && game.aiThinking) schedulePiuMove();
  }
  function clickSquare(r,c) {
    if(game.puzzleSolved || game.checkmate || game.aiThinking || (['boss','training'].includes(ui.mode) && game.turn==='b')) return;
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
    const setting=event.target.closest('[data-setting]');
    if(setting) { saveSetting(setting.dataset.setting,setting.dataset.value); return; }
    const profileTab=event.target.closest('[data-profile-tab]');
    if(profileTab) { ui.profileTab=profileTab.dataset.profileTab; render(); return; }
    const avatarChoice=event.target.closest('[data-avatar]');
    if(avatarChoice) { selectProfileAvatar(avatarChoice.dataset.avatar); return; }
    const nav=event.target.closest('[data-page]');
    if(nav) {
      ui.page=nav.dataset.page; render();
      if(ui.page==='online') window.PiuOnline?.open();
      if(ui.page==='practice' && ['boss','training'].includes(ui.mode) && game.aiThinking) schedulePiuMove();
      return;
    }
    const trainingOpponent=event.target.closest('[data-training-opponent]');
    if(trainingOpponent) { startTraining(trainingOpponent.dataset.trainingOpponent); return; }
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
      case 'auth-mode': ui.authMode=ui.authMode==='login'?'register':'login'; ui.authMessage=''; ui.authError=false; render(); break;
      case 'recover-account': ui.authMode='reset'; ui.authMessage=''; ui.authError=false; render(); break;
      case 'auth-login': ui.authMode='login'; ui.authMessage=''; ui.authError=false; render(); break;
      case 'logout': window.PiuOnline?.logoutAndClose(); logout(); break;
      case 'start': case 'continue': startLearning(); break;
      case 'complete-lesson': completeLesson(); break;
      case 'reset-challenge': setChallenge(ui.challengeIndex); break;
      case 'next-challenge': setChallenge(ui.challengeIndex+1); break;
      case 'free-play': ui.mode='free'; game=createInitialGame(); render(); break;
      case 'puzzles': setChallenge(ui.challengeIndex); break;
      case 'boss': case 'rematch-piu': startBoss(); break;
      case 'training': showTrainingLobby(); break;
      case 'rematch-training': startTraining(ui.opponentId); break;
      case 'reset-board': ui.mode='free'; game=createInitialGame(); render(); break;
      case 'reset-progress':
        if(window.confirm('Quer apagar seu XP, sequência, aulas e conquistas deste navegador?')) {
          const profile={playerName:progress.playerName,avatar:progress.avatar,magnusUnlocked:progress.magnusUnlocked,settings:{...progress.settings}};
          const clean=freshProgress(); Object.keys(progress).forEach(k=>delete progress[k]); Object.assign(progress,clean,profile); updateDailyStreak(); persist(); ui.page='home'; render(); showToast('Progresso reiniciado. Vamos começar de novo!');
        }
        break;
    }
  });
  app.addEventListener('submit', event => {
    const authForm=event.target.closest('[data-auth-form]');
    if(authForm) { event.preventDefault(); return submitAuthForm(authForm); }
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

  restoreSession();
  render();
  window.PiuOnline?.resume();
})();
