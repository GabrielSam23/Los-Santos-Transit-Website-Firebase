const firebaseConfig = {
    apiKey: "AIzaSyDcpEuSY75MbcjGEpGzsyBoVgbSRLraM1Y",
    authDomain: "teste-c291f.firebaseapp.com",
    projectId: "teste-c291f",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

let currentChatboxId = localStorage.getItem('currentChatboxId'); // Recuperar currentChatboxId do localStorage
let chatboxFormSubmitted = false; // Variável para controlar se o formulário de chatbox já foi enviado



// Lista de emails de administradores
// Lista de emails de administradores
// Lista de emails de administradores
const listaAdministradores = ['admin1@gmail.com', 'admin2@example.com'];

// Função para verificar se o email atual é um administrador
function verificarAdministrador(emailAtual) {
    console.log('Email atual:', emailAtual);
    console.log('Lista de administradores:', listaAdministradores);
    return listaAdministradores.includes(emailAtual);
}

auth.onAuthStateChanged((user) => {
    const chatboxContainer = document.getElementById('chatbox-container');
    chatboxContainer.innerHTML = ''; // Limpar o conteúdo do contêiner de chatbox
    
    if (user) {
        // Usuário autenticado, exibir botão de logout e ocultar formulário de login
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('logout-button').style.display = 'block';
        document.getElementById('login-button').style.display = 'none'; // Ocultar botão de login

        // Verificar se o usuário atual é um administrador
        if (verificarAdministrador(user.email)) {
            // O email atual é um administrador
            console.log('Usuário atual é um administrador');
            alert('Você está logado como administrador!');
            // Faça o que precisar para usuários administradores aqui
        } else {
            // O email atual não é um administrador
            console.log('Usuário atual não é um administrador');
            // Faça o que precisar para usuários não administradores aqui
        }

        // Carregar os chatboxes do usuário autenticado
        carregarChatboxsEAdicionarListener(user.uid);
        carregarChatboxsDoUsuario(user.uid);

        alert('Login bem-sucedido!');
    } else {
        // Usuário não autenticado, exibir formulário de login e ocultar botão de logout
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('logout-button').style.display = 'none';
        document.getElementById('login-button').style.display = 'block'; // Exibir botão de login
    }
});



window.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Usuário autenticado, carregar chatboxs
            carregarChatboxsEAdicionarListener(user.uid);
        }
    });
});

function carregarChatboxsEAdicionarListener(userId) {
    db.collection('chatboxs').where('userId', '==', userId).onSnapshot((snapshot) => {
        const chatboxContainer = document.getElementById('chatbox-container');
        chatboxContainer.innerHTML = ''; // Limpar o conteúdo do contêiner de chatbox
        
        snapshot.forEach((doc) => {
            const chatboxData = doc.data();
            // Verificar se o usuário autenticado é o mesmo que criou o chatbox
            if (chatboxData.userId === userId) {
                carregarChatbox(doc.id, chatboxData.nome, chatboxData.email);
            }                
        });
    }, (error) => {
        console.error("Erro ao carregar chatboxs em tempo real: ", error);
    });
}



function carregarChatboxsDoUsuario(userId) {
    db.collection('chatboxs').where('userId', '==', userId).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const chatboxData = doc.data();
                // Verificar se o usuário autenticado é o mesmo que criou o chatbox
                if (chatboxData.userId === auth.currentUser.uid) {
                    carregarChatbox(doc.id, chatboxData.nome, chatboxData.email);
                    currentChatboxId = doc.id; // Atualizar o chatboxId global
                }                
            });
        })
        .catch((error) => {
            console.error("Erro ao carregar chatboxs: ", error);
        });
}



// Evento para realizar o login
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;

    auth.signInWithEmailAndPassword(email, senha)
        .catch((error) => {
            alert('Erro ao fazer login: ' + error.message);
        });
});

// Evento para realizar o logout
document.addEventListener('DOMContentLoaded', function() {
    const settingsMenu = document.getElementById('settings-menu');
    const settingsIcon = document.getElementById('settings-icon');
    const logoutOption = document.getElementById('logout-option');
    const loginButton = document.getElementById('login-button');

    // Evento para deslogar ao clicar em "Deslogar"
    logoutOption.addEventListener('click', function() {
        auth.signOut()
            .catch((error) => {
                console.error('Erro ao fazer logout:', error);
            });
    });

    // Mostrar/Esconder menu de configurações ao clicar no ícone de engrenagem
    settingsIcon.addEventListener('click', function() {
        settingsMenu.classList.toggle('show');
    });

    // Fechar menu de configurações se clicar fora dele
    window.addEventListener('click', function(event) {
        if (!event.target.matches('#settings-icon')) {
            const dropdowns = document.getElementsByClassName("settings-menu");
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });

    auth.onAuthStateChanged((user) => {
        if (user) {
            // Usuário autenticado
            settingsIcon.style.display = 'inline-block'; // Exibir ícone de engrenagem
            loginButton.style.display = 'none'; // Ocultar botão de login
            document.getElementById('logout-button').style.display = 'inline-block'; // Exibir botão de logout
        } else {
            // Usuário não autenticado
            settingsIcon.style.display = 'none'; // Ocultar ícone de engrenagem
            loginButton.style.display = 'inline-block'; // Exibir botão de login
            document.getElementById('logout-button').style.display = 'none'; // Ocultar botão de logout
        }
    });
});



function mostrarInfoRota(rotaId) {
    const rotas = document.querySelectorAll('.rota-content');
    const tabs = document.querySelectorAll('.rota-tab-link');
    const infoRota = document.getElementById('rota-info');

    rotas.forEach(rota => {
        rota.classList.remove('active');
    });

    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(rotaId).classList.add('active');
    document.querySelector(`[href="#${rotaId}"]`).classList.add('active');

    // Carregar informações da rota
    const detalhesRota = document.getElementById('detalhes-rota');
    const mapaRota = document.getElementById('mapa-rota');

    // Substitua as informações fictícias pelas informações reais da rota
    switch (rotaId) {
        case 'rota1':
            detalhesRota.innerHTML = `
                <h3>Rota 1</h3>
                <p>A Rota 1 é a rota principal que conecta o Centro da cidade à Zona Sul. É uma rota muito utilizada por trabalhadores e estudantes.</p>
                <p>Detalhes da Rota 1:</p>
                <ul>
                    <li>Distância: 10 km</li>
                    <li>Número de Paradas: 15</li>
                    <li>Frequência: A cada 20 minutos</li>
                </ul>
            `;
            // Substitua o mapa fictício pelo mapa real da Rota 1
            mapaRota.style.backgroundImage = "url('caminho/para/mapa-real-rota1.png')";
            break;

        case 'rota2':
            detalhesRota.innerHTML = `
                <h3>Rota 2</h3>
                <p>A Rota 2 é uma rota circular que atende principalmente a Zona Norte da cidade. Ela oferece uma alternativa conveniente para os residentes dessa região.</p>
                <p>Detalhes da Rota 2:</p>
                <ul>
                    <li>Distância: 12 km</li>
                    <li>Número de Paradas: 20</li>
                    <li>Frequência: A cada 30 minutos</li>
                </ul>
            `;
            // Substitua o mapa fictício pelo mapa real da Rota 2
            mapaRota.style.backgroundImage = "url('caminho/para/mapa-real-rota2.png')";
            break;

        case 'rota3':
            detalhesRota.innerHTML = `
                <h3>Rota 3</h3>
                <p>A Rota 3 conecta o Subúrbio ao Centro da cidade. Ela passa por áreas residenciais e comerciais, proporcionando um transporte essencial para a população local.</p>
                <p>Detalhes da Rota 3:</p>
                <ul>
                    <li>Distância: 8 km</li>
                    <li>Número de Paradas: 12</li>
                    <li>Frequência: A cada 25 minutos</li>
                </ul>
            `;
            // Substitua o mapa fictício pelo mapa real da Rota 3
            mapaRota.style.backgroundImage = "url('caminho/para/mapa-real-rota3.png')";
            break;

        default:
            break;
    }

    infoRota.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('login-container');
    const loginButton = document.getElementById('login-button');
    const popupContent = document.getElementById('popup-content');
    const loginForm = document.getElementById('login-form');

    // Evento para fechar a página de login ao clicar fora dela
    window.addEventListener('click', function(event) {
        // Verifica se o usuário clicou fora do popup e fora do formulário de login
        if (event.target !== popupContent && event.target !== loginButton && loginContainer.style.display === 'block' && !loginForm.contains(event.target)) {
            loginContainer.style.display = 'none';
        }
    });

    // Evento para abrir a página de login ao clicar no botão de login
    document.getElementById('login-button').addEventListener('click', function() {
        if (!firebase.auth().currentUser) { // Verifica se o usuário não está autenticado
            document.getElementById('login-container').style.display = 'block';
        }
    });

    // Sistema de alternar entre abas
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetTab = tab.getAttribute('href').substring(1);
            tabContents.forEach(content => {
                content.style.display = 'none';
            });

            document.getElementById(targetTab).style.display = 'block';
        });
    });
});


    // Verifica se o nome do usuário já foi salvo
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
        // Se já foi salvo, preenche automaticamente o campo de nome nos comentários
        document.querySelectorAll('.nome-comentario-input').forEach(input => {
            input.value = savedUsername;
        });
    }

    function displayNews() {
        const newsContainer = document.getElementById('newsContainer');
    
        db.collection("noticias")
            .orderBy("timestamp", "desc") // Ordena as notícias por data em ordem decrescente (a mais recente primeiro)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const newsData = doc.data();
                    const timestamp = newsData.timestamp.toDate();
                    const formattedTimestamp = formatTimestamp(timestamp); // Use a função formatTimestamp para formatar a data e hora
    
                    const newsElement = document.createElement('div');
                    newsElement.classList.add('noticia-box'); // Adiciona a classe noticia-box
                    newsElement.innerHTML = `
                        <h3>${newsData.title}</h3>
                        <p>${newsData.content}</p>
                        <img src="${newsData.imageURL}">
                        <p style="display: inline-block;">${formattedTimestamp}</p>
                        <p class="author" style="display: inline-block;">Autor: ${newsData.author}</p>
    
                        <!-- Comentários -->
                        <div class="comentarios">
                            <h4>Comentários:</h4>
                            <div id="comentarios-noticia-${doc.id}">
                                <!-- Os comentários serão exibidos aqui -->
                            </div>
                            <!-- Nome do usuário agora é dinâmico -->
                            <input type="text" id="novo-comentario-noticia-${doc.id}" placeholder="Adicione um comentário">
                            <button onclick="adicionarComentario('${doc.id}')">Enviar Comentário</button>
                        </div>
                    `;
                    newsContainer.appendChild(newsElement);
    
                    // Adiciona os comentários existentes ao carregar a notícia
                    displayComments(doc.id);
                });
            });
    }
    
    
    
    
    function displayComments(noticiaId) {
        const comentariosContainer = document.getElementById(`comentarios-noticia-${noticiaId}`);
    
        db.collection(`noticias/${noticiaId}/comentarios`)
            .orderBy("timestamp", "desc") // Ordena os comentários por timestamp em ordem decrescente
            .get()
            .then((querySnapshot) => {
                comentariosContainer.innerHTML = ''; // Limpa os comentários existentes antes de adicionar novos
    
                querySnapshot.forEach((comentarioDoc) => {
                    const comentarioData = comentarioDoc.data();
    
                    // Verifique se o campo timestamp está presente e é uma instância de Timestamp
                    if (comentarioData.timestamp instanceof firebase.firestore.Timestamp) {
                        // Converta o timestamp para uma data
                        const timestamp = comentarioData.timestamp.toDate();
                        const formattedTimestamp = formatTimestamp(timestamp);
    
                        const comentarioElement = document.createElement('div');
                        comentarioElement.innerHTML = `<p>${formattedTimestamp} <strong>${comentarioData.nome}:</strong> ${comentarioData.texto}</p>`;
                        comentariosContainer.appendChild(comentarioElement);
                    } else {
                        console.error("O campo 'timestamp' não está definido corretamente no documento de comentário.");
                    }
                });
    
                // Preencha automaticamente o campo de nome do usuário com o nome extraído do endereço de e-mail
                const emailUsuario = auth.currentUser.email;
                const nomeUsuario = emailUsuario.substring(0, emailUsuario.indexOf('@'));
                novoComentarioInput.value = nomeUsuario;
            })
            .catch((error) => {
                console.error("Erro ao carregar comentários:", error);
            });
    }

    
    
    
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
    
        // Extrai o dia do timestamp e do momento atual
        const timestampDay = date.getDate();
        const currentDay = now.getDate();
    
        if (timestampDay === currentDay) {
            // Se o dia do timestamp for igual ao dia atual, então é hoje
            const hours = date.getHours();
            const minutes = date.getMinutes();
            return `Hoje às ${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        } else if (timestampDay === currentDay - 1) {
            // Se o dia do timestamp for um dia antes do dia atual, então é ontem
            const hours = date.getHours();
            const minutes = date.getMinutes();
            return `Ontem às ${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        } else {
            // Caso contrário, retorna a data formatada no calendário brasileiro
            const formattedDate = date.toLocaleDateString('pt-BR');
            const hours = date.getHours();
            const minutes = date.getMinutes();
            return `${formattedDate} às ${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        }
    }
    
    
    
    
document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Evite o comportamento padrão do formulário

    // Colete os valores dos campos de entrada
    const fullName = document.querySelector('.fullName').value;
    const emailAddress = document.querySelector('.emailAddress').value;
    const subject = document.querySelector('.subject').value;
    const message = document.querySelector('.message').value;

    // Salve esses valores no Firestore
    db.collection("messages").add({
        fullName: fullName,
        emailAddress: emailAddress,
        subject: subject,
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function(docRef) {
        console.log("formulario escrito com id: ", docRef.id);
        // Limpe os campos após o envio
        document.querySelector('.fullName').value = '';
        document.querySelector('.emailAddress').value = '';
        document.querySelector('.subject').value = '';
        document.querySelector('.message').value = '';

        alert("Formulario de contato enviado com succeso");
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
        alert("Ocorreu um erro enquanto voce enviava seu formulario, tente novamente!");
    });
});

function adicionarComentario(noticiaId) {
    const emailUsuario = auth.currentUser.email;
    const nomeUsuario = emailUsuario.substring(0, emailUsuario.indexOf('@'));

    const novoComentarioInput = document.getElementById(`novo-comentario-noticia-${noticiaId}`);

    const novoComentarioTexto = novoComentarioInput.value.trim();

    if (nomeUsuario !== '' && novoComentarioTexto !== '') {
        // Obtenha a data e hora atual
        const timestamp = firebase.firestore.Timestamp.fromDate(new Date());

        db.collection(`noticias/${noticiaId}/comentarios`).add({
            nome: nomeUsuario,
            texto: novoComentarioTexto,
            timestamp: timestamp // Salve o timestamp junto com o comentário
        }).then(() => {
            // Limpa os campos de entrada após adicionar o comentário
            novoComentarioInput.value = '';

            // Atualiza a exibição dos comentários
            displayComments(noticiaId);
        });
    }
}


// Chame a função para exibir as notícias
displayNews()


// Funções relacionadas aos chatboxs

function criarChatbox(nome) {
    const userId = auth.currentUser.uid; // Obter o ID do usuário autenticado

    // Adicionar o chatbox ao Firestore
    db.collection('chatboxs').add({
        userId: userId,
        nome: nome,
        email: auth.currentUser.email // Usar o email do usuário autenticado
    })
    .then((docRef) => {
        alert('Chatbox criado com sucesso!'); // Exibir um alerta de sucesso
        document.getElementById('nome-input').value = ''; // Limpar o campo do nome
    })
    .catch((error) => {
        console.error('Erro ao criar chatbox:', error); // Se houver um erro, exiba-o no console
        alert('Erro ao criar chatbox. Por favor, tente novamente.'); // Exiba um alerta de erro
    });
}

function encerrarConversa() {
    if (confirm("Tem certeza de que deseja encerrar esta conversa?")) {
        if (currentChatboxId) {
            // Excluir as mensagens do chatbox
            db.collection(`chatboxs/${currentChatboxId}/mensagens`).get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    doc.ref.delete();
                });
            });

            // Excluir o chatbox
            db.collection('chatboxs').doc(currentChatboxId).delete().then(() => {
                alert('Conversa encerrada com sucesso!');
                // Remover o chatbox da interface
                document.getElementById(`chatbox-${currentChatboxId}`).remove();
                currentChatboxId = null; // Resetar o chatboxId global
            }).catch(error => {
                console.error("Erro ao encerrar a conversa:", error);
                alert('Erro ao encerrar a conversa. Por favor, tente novamente.');
            });
        } else {
            console.error("chatboxId é inválido:", currentChatboxId);
        }
    }
}

// Função para carregar os chatboxs existentes ao carregar a página
// Função para carregar os chatboxs existentes ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    // Monitorar mudanças nos chatboxs do usuário atual
    db.collection('chatboxs').where('userId', '==', auth.currentUser.uid)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    // Adicionar novo chatbox na interface
                    const chatboxData = change.doc.data();
                    carregarChatbox(change.doc.id, chatboxData.nome, chatboxData.email);
                } else if (change.type === 'removed') {
                    // Remover chatbox da interface
                    const chatboxId = change.doc.id;
                    const chatboxElement = document.getElementById(`chatbox-${chatboxId}`);
                    if (chatboxElement) {
                        chatboxElement.remove();
                    }
                }
            });
        }, (error) => {
            console.error("Erro ao carregar chatboxs em tempo real: ", error);
        });
});

function carregarChatbox(chatboxId, nome, email) {
    const chatboxContainer = document.getElementById('chatbox-container');
    const chatboxElement = document.createElement('div');
    chatboxElement.id = `chatbox-${chatboxId}`;
    chatboxElement.classList.add('chatbox-container');
    chatboxElement.innerHTML = `
        <h3>Assunto: ${nome}</h3>
        <p>Email: ${email}</p>
        <div id="chatbox-messages-${chatboxId}"></div>
        <form id="message-form-${chatboxId}" data-chatbox-id="${chatboxId}" data-nome="${nome}">
            <input type="text" id="message-input-${chatboxId}" placeholder="Digite sua mensagem">
            <button type="submit">Enviar</button>
        </form>
    `;
    chatboxContainer.appendChild(chatboxElement);

    // Adicionar listener para enviar mensagem
    const messageForm = document.getElementById(`message-form-${chatboxId}`);
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        enviarMensagem(chatboxId);
    });

    // Carregar mensagens do chatbox após adicionar o chatbox na página
    carregarMensagens(chatboxId);
}


// Função para enviar uma mensagem para um chatbox específico
function enviarMensagem(chatboxId) {
    const messageInput = document.getElementById(`message-input-${chatboxId}`);
    const mensagem = messageInput.value.trim();

    if (mensagem !== '') {
        // Obter o nome do chatbox a partir do atributo de dados (data attribute)
        const chatboxNome = document.getElementById(`message-form-${chatboxId}`).getAttribute('data-nome');

        db.collection(`chatboxs/${chatboxId}/mensagens`).add({
            remetente: chatboxNome,
            mensagem: mensagem,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            messageInput.value = '';
            // Recarregar as mensagens do chatbox após o envio de mensagem
            carregarMensagens(chatboxId);
        })
        .catch((error) => {
            console.error("Erro ao enviar mensagem: ", error);
        });
    }
}

// Função para carregar todas as mensagens de um chatbox específico em tempo real
// Função para carregar todas as mensagens de um chatbox específico em tempo real
// Função para carregar todas as mensagens de um chatbox específico em tempo real
function carregarMensagens(chatboxId) {
    const chatboxMessages = document.getElementById(`chatbox-messages-${chatboxId}`);
    if (!chatboxMessages) return; // Verificar se o elemento existe

    // Limpar mensagens anteriores
    chatboxMessages.innerHTML = '';

    // Obter o ID do usuário autenticado
    const userId = auth.currentUser.uid;

    // Adicionar listener em tempo real
    db.collection(`chatboxs/${chatboxId}/mensagens`).orderBy('timestamp')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const mensagemData = change.doc.data();
                    const mensagemElement = document.createElement('div');
                    mensagemElement.textContent = `${mensagemData.remetente}: ${mensagemData.mensagem}`;
                    mensagemElement.id = `mensagem-${change.doc.id}`; // Adicionar um ID único para a mensagem
                    chatboxMessages.appendChild(mensagemElement);
                    

                }
            });
        }, (error) => {
            console.error("Erro ao carregar mensagens em tempo real: ", error);
        });
}





// Abrir/Fechar o popup quando o botão de popup é clicado
document.getElementById('chatbox-popup').addEventListener('click', function() {
    const popup = document.getElementById('popup-content');
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
});

// Evento para criar um novo chatbox ao enviar o formulário
document.getElementById('create-chatbox-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar o comportamento padrão do formulário

    // Colete os valores do formulário
    const nome = document.getElementById('nome-input').value.trim();

    // Verifique se o nome não está vazio
    if (nome !== '') {
        criarChatbox(nome); // Chame a função para criar o chatbox com o nome fornecido
    } else {
        alert('Por favor, preencha o nome.'); // Se o nome estiver vazio, exiba um alerta
    }
});


// Evento para encerrar um chatbox ao clicar no botão "Encerrar"

document.getElementById('sendMessageBtn').addEventListener('click', function(event) {
    // Evite que o formulário seja enviado normalmente
    event.preventDefault();
    // Chame a função sendContact para enviar os dados do formulário
    sendContact();
});

async function sendContact(ev) {
    event.preventDefault();

    const senderName = document.querySelector('.fullName').value;
    const senderEmail = document.querySelector('.emailAddress').value;
    const subject = "*" + document.querySelector('.subject').value + "*"; // Destacando o texto do assunto com Markdown
    const message = document.querySelector('.message').value;

    // Verifica se algum campo está vazio
    if (senderName.trim() === '' || senderEmail.trim() === '' || subject.trim() === '' || message.trim() === '') {
        alert('Por favor, preencha todos os campos.');
        return; // Retorna se algum campo estiver vazio
    }

   // Função para gerar um número de contrato aleatório
// Função para gerar um número de contrato aleatório composto apenas por números
function gerarNumeroContrato() {
    const caracteresPermitidos = '0123456789';
    const comprimentoNumero = 8; // Defina o comprimento desejado do número do contrato

    let numeroContrato = '';
    for (let i = 0; i < comprimentoNumero; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteresPermitidos.length);
        numeroContrato += caracteresPermitidos.charAt(indiceAleatorio);
    }

    return numeroContrato;
}

// Gerar número de contrato aleatório
const numeroContratoAleatorio = gerarNumeroContrato();

// Atualizar o webhookBody para incluir o número de contrato
const webhookBody = {
    embeds: [{
        title: '📝 Novo contrato recebido!',
        description: 'Um novo contrato foi submetido.',
        color: 0x0099ff, // Cor da listra vertical (azul)
        fields: [
            { name: '👤 Nome:', value: senderName }, 
            { name: '📧 Email (Discord):', value: senderEmail },
            { name: '📌 Assunto:', value: subject },
            { name: '💬 Mensagem:', value: message },
            { name: '📄 Número do contrato:', value: numeroContratoAleatorio } // Adicionando o número de contrato
        ],
        thumbnail: {
            url: 'https://pbs.twimg.com/profile_images/891779342103138304/vPaHzwXA_400x400.jpg' // Insira a URL da sua imagem aqui
        },
        timestamp: new Date(),
        footer: {
            text: 'Contrato recebido'
        }
    }],
};


    
    
    webhookUrl = "https://discord.com/api/webhooks/1207040195870982214/M4xuv2MiU7XSNI0CtV7s6z03ZzCI5rGSfTCU96B8khQ9Cs5plWMksDhg4JVpsfueFOWY";

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookBody),
    });

    if (response.ok) {
        // Exibir mensagem de sucesso
        const successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'block';

        // Limpar os campos do formulário após alguns segundos
        setTimeout(() => {
            document.querySelector('.fullName').value = '';
            document.querySelector('.emailAddress').value = '';
            document.querySelector('.subject').value = '';
            document.querySelector('.message').value = '';

            // Ocultar a mensagem de sucesso após 3 segundos
            successMessage.style.display = 'none';
        }, 3000);
    } else {
        alert('Houve um erro! Por favor, tente novamente mais tarde.');
    }
}

// Adicione isso ao seu script.js
