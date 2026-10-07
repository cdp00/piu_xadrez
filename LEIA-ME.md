# Piu Xadrez

Um site leve para aprender xadrez com aulas, desafios e um tabuleiro interativo. Piu é um passarinho verde original, divertido e animado. O projeto não usa bibliotecas externas: basta abrir `index.html` em um navegador moderno.

A trilha tem 13 aulas para iniciantes, 5 de nível médio, 5 de nível difícil e um Boss final. Depois de concluir as 23 aulas, desbloqueie a partida contra o Piu: você joga de brancas e o Piu responde pelas pretas.

## Como abrir

1. Descompacte ou mantenha a pasta do projeto no seu computador.
2. Abra `index.html` com um navegador.
3. Para manter o progresso entre visitas, permita o armazenamento local do navegador. O XP, as aulas concluídas, a sequência e os desafios resolvidos são salvos em `localStorage`.

Também é possível servir a pasta por um servidor local. Exemplo com Python, executado dentro desta pasta:

```bash
python -m http.server 8000
```

Depois, acesse `http://localhost:8000`.

## Arquivos

- `index.html`: página de entrada.
- `styles.css`: layout responsivo, ilustrações vetoriais originais e estilos.
- `app.js`: aulas, progresso, desafios e regras do tabuleiro.

O tabuleiro permite movimentos legais, captura, xeque, xeque-mate, roque, en passant e promoção automática do peão a dama. As peças podem ser movidas pelos dois lados no treino livre. No Boss, Piu escolhe respostas legais e você ganha 50 XP ao vencê-lo.

Em **Meu perfil**, personalize seu nome e escolha entre cinco avatares de aves. Na aba **Código secreto**, o código `6742` libera a foto de Magnus Carlsen. A foto é de Stefan64, publicada no Wikimedia Commons sob CC BY-SA 3.0; ela é carregada da internet e a atribuição também aparece no perfil.

Para recomeçar, use **Meu perfil → Zerar progresso**.
