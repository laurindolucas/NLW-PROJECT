const form = document.getElementById('form-input')
const gameSelect = document.getElementById('select-games');
const questionInput = document.getElementById('input-massage');
const askButton = document.getElementById('btn-submit');
const aiResponse = document.getElementById('iaResponse');

const markdownToHTML = (text) => {
    const converter =  new showdown.Converter()
    return converter.makeHtml(text)
}

const askAi = async (question, game) => {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, game })
  });

  if (!response.ok) {
    throw new Error('Erro ao comunicar com a API');
  }

  const data = await response.json();
  return data.answer;
};

const sendform = async (event) => {
  event.preventDefault();
  const game = gameSelect.value;
  const question = questionInput.value;

  if (game === '' || question === '') {
    alert('Por favor, preencha todos os campos');
    return;
  }

  askButton.disabled = true;
  askButton.textContent = 'perguntando...';
  askButton.classList.add('loading');

  try {
    const text = await askAi(question, game);
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
    aiResponse.classList.remove('hidden');
  } catch (error) {
    console.error('Erro: ', error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = 'Perguntar';
    askButton.classList.remove('loading');
  }
};


form.addEventListener('submit', sendform)