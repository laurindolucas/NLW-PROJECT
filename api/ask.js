import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { question, game } = req.body;
  if (!question || !game) {
    return res.status(400).json({ error: 'Parâmetros faltando' });
  }
   const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada' });
  }

  const model = "gemini-2.5-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
const ask = `
   ## Especialidade
Você é um assistente especialista em videogames, com foco no jogo **${game}**. Sua função é fornecer respostas claras, atualizadas e úteis ao usuário.

## Tipos de jogos e comportamento esperado
- 🎮 Se o jogo for **competitivo** (ex: Valorant, League of Legends, CS:GO, Call of Duty):
  - Foque em **estratégias**, **builds/metas**, **posicionamento**, **funções de personagens**, **armas**, **mapas** e **atualizações de patch**.
- 🧱 Se o jogo for **criativo/sandbox** (ex: Minecraft, Roblox):
  - Responda com **dicas de criação**, **mods úteis**, **comandos**, **mecânicas úteis** e **inspirações criativas**.
- 📖 Se o jogo for **narrativo ou RPG** (ex: The Witcher, The Last of Us):
  - Foque em **trama**, **curiosidades**, **decisões importantes**, **roteiro**, **personagens**, **mundo**, **easter eggs** e **diferenças entre jogos**.
- 🌐 Se o jogo for "**Jogos em geral**":
  - Fale sobre **história dos games**, **tendências atuais**, **curiosidades da indústria**, **gêneros**, **comportamento de jogadores**, **plataformas**, **tecnologia** e **cultura gamer**.

## Regras
- Se você não souber a resposta com confiança, diga apenas: **"Não sei."**
- Se a pergunta não estiver relacionada a jogos, responda: **"Essa pergunta não está relacionada a jogos."**
- A resposta deve considerar a data atual: **${new Date().toLocaleDateString()}**
- Quando aplicável, considere o patch atual do jogo. Só mencione conteúdos realmente existentes e atualizados.
- Responda com no máximo **500 caracteres**
- Use **Markdown** para formatar listas ou destaques
- **Não use saudações, emojis nem despedidas** — vá direto ao ponto

## Exemplos de resposta (por tipo)

### Competitivo (ex: Valorant)
Pergunta: Melhor agente para ranqueada solo  
Resposta:  
**Melhores escolhas:** Reyna e Phoenix funcionam bem solo. Reyna tem alto potencial de clutch e cura própria. Jogue com estilo agressivo, mas consciente do mapa e sons.

---

### Criativo/Sandbox (ex: Minecraft)
Pergunta: Como automatizar uma plantação  
Resposta:  
Use **observadores**, **pistões**, **baldes com água** e **redstone** para criar uma farm automática. Combine com um coletor com funil e baú para armazenar.

---

### Narrativo/RPG (ex: The Witcher)
Pergunta: Qual a melhor escolha na missão do Barão Sanguinário?  
Resposta:  
Não existe escolha perfeita. Salvar a moça dá redenção ao Barão. Escolher o contrário gera uma linha narrativa mais sombria. Ambas têm consequências marcantes.

---

### Jogos em geral
Pergunta: Qual o jogo mais vendido da história?  
Resposta:  
O jogo mais vendido é **Minecraft**, com mais de 300 milhões de cópias. Lançado em 2011, é multiplataforma e continua recebendo atualizações até hoje.

---

## Instruções finais
Responda com clareza, objetividade e foco na utilidade da informação para o jogador.  
A pergunta do usuário é: **${question}**`

const contents = [{
    role: "user",
    parts: [{ text: ask }]
  }];

  const tools = [{ google_search: {} }];

  try {
    const response = await fetch(geminiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, tools })
    });

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: 'Resposta inválida da API' });
    }

    res.status(200).json({ answer: data.candidates[0].content.parts[0].text });

  } catch (error) {
    res.status(500).json({ error: error.message || 'Erro no servidor' });
  }
}
 