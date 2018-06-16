
// Initialize Firebase
var config = {
  apiKey: "AIzaSyA3BdoEQopXHa5uCIQ9inBpWxApnvB0IH0",
  authDomain: "iot-psm.firebaseapp.com",
  databaseURL: "https://iot-psm.firebaseio.com",
  projectId: "iot-psm",
  storageBucket: "iot-psm.appspot.com",
  messagingSenderId: "468311252860"
};
firebase.initializeApp(config);

// reference to firebase database
let database = firebase.database();

/*
---------------------------
  COMPONENTS
---------------------------
*/ 

let modal = document.querySelector('.modal');
let modalTitle = document.querySelector('.modal .title');
let modalBody = document.querySelector('.modal .body');
let backgroundShade = document.querySelector('.modal-state');
let bntCloseModal = document.querySelector('.modal .close');


/*
---------------------------
  NAVEGAÇÃO
---------------------------
*/ 

// containers

let home = document.querySelector('.home');
let cadastro = document.querySelector('.cadastro');
let biblioteca = document.querySelector('.biblioteca');

// btns
let btnCadastro = document.querySelector('#goNewMusic');
let btnBiblioteca = document.querySelector( '#goBiblioteca');
let btnHeader = document.querySelector('header a');

btnCadastro.addEventListener('click', function() {
  home.classList.remove('show');
  cadastro.classList.add('show');
  biblioteca.classList.remove('show');
});

btnHeader.addEventListener('click', function() {
  home.classList.add('show');
  cadastro.classList.remove('show');
  biblioteca.classList.remove('show');
});

/*
---------------------------
  CADASTRO MUSICAS
---------------------------
*/ 

// vetores armazenam notas / tempos
let notas = [];
let tempos = [];
let frequencias = [];
let nomesTempos = [];
let oitavas = [];

let nota = document.querySelector('#nota');
let duracao = document.querySelector('#duracao');

// btns
let btnAdd = document.querySelector('#btnAdd');
let btnFinish = document.querySelector('#btnFinish');

let bpm = document.querySelector('.input_andamento');

// add nota / duracao -> vetores
btnAdd.addEventListener('click', function() {

  // houve nota? escolheu uma duracao?
  if (nota.value != "" && duracao.value != "") {
    
    // atualizando vetores
    let notaEscolhida = nota.value.slice(0, 4);
    let frequencia = nota.value.slice(5, 8);
    let oitava = nota.value.slice(9, 10);  
    
    if (notaEscolhida == 'Paus')
      notaEscolhida = 'Pausa';
    
    // calculo duracao
    let padrao = 60000 / bpm.value;
    let duracaoNotaMili; 
    let tempoToNota;

    switch (duracao.value) {
      case "8":
        tempoToNota = "Breve";
        duracaoNotaMili = 8 * padrao;
        break;
      case "4":
        tempoToNota = "Semibreve";
        duracaoNotaMili = 4 * padrao;
        break;
      case "2":
        tempoToNota = "Mínima";
        duracaoNotaMili = 2 * padrao;
        break;
      case "1":
        tempoToNota = "Semínima";
        duracaoNotaMili = padrao;
        break;
      case "0.5":
        tempoToNota = "Colcheia";
        duracaoNotaMili = 0.5 * padrao;
        break;
      case "0.25":
        tempoToNota = "Semicolcheia";
        duracaoNotaMili = 0.25 * padrao;
        break;
      case "0.125":
        tempoToNota = "Fusa";
        duracaoNotaMili = 0.125 * padrao;
        break;
      case "0.0625":
        tempoToNota = "Semifusa";
        duracaoNotaMili = 0.0625 * padrao;
        break;
      default:
        break;
    }

    notas.push(notaEscolhida);
    frequencias.push(frequencia);
    tempos.push(duracaoNotaMili);
    nomesTempos.push(tempoToNota); 
    oitavas.push(oitava);       

    let lista = document.querySelector('#notas');

    let item = document.createElement('li');

    if (notaEscolhida == 'Pausa') 
      item.textContent = `${notaEscolhida} - duração: ${tempoToNota}`;
    else
      item.textContent = `nota: ${notaEscolhida} (${oitava}ª oitava) - tempo: ${tempoToNota}`;

    lista.appendChild(item);

    // limpando dados
    nota.value = "";
    duracao.value = "";

  }

});

// print vetores on click finish
btnFinish.addEventListener('click', function() {

  let nome = document.querySelector('#nomeMusica').value;
  let valido = true;

  // get key to music
  let newPostKey = firebase.database().ref().child('musicas').push().key;

  if (!notas[0]) {
    alert('Por favor crie uma música');
    valido = false;
  }

  if (valido) {
    firebase.database().ref('musicas/' + newPostKey).set({
      nome: nome,
      notas: notas,
      frequencias: frequencias,
      tempos: tempos,
      oitavas: oitavas,
      nomesTempos: nomesTempos,
      tocando: false,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });

    alert('Música cadastrada com sucesso!');
  
    home.classList.add('show');
    cadastro.classList.remove('show');

    // limpando dados
    document.querySelector('#nomeMusica').value = "";
    document.querySelector('.input_andamento').value = "";
    document.querySelector('#notas').innerHTML = "";
  } 

});

/*
---------------------------
  BIBLIOTECA
---------------------------
*/ 

btnBiblioteca.addEventListener('click', function() {

  home.classList.remove('show');
  cadastro.classList.remove('show');
  biblioteca.classList.add('show');

  firebase.database().ref('musicas').on('value', musicas => {
    
    let container = document.querySelector('.biblioteca .container');
    let partitura = document.querySelector('.modal-partitura');
    container.innerHTML = "";

    musicas.forEach(musica => {

      let id = musica.key;
      let dados = musica.val();

      let timestamp = dados.createdAt;
      let date = convertToHour(timestamp);

      let nome = dados.nome;
      let tocando = dados.tocando;

      let notas = dados.notas;
      let tempos = dados.nomesTempos;
      let oitavas = dados.oitavas;

      let html = 
        '<div id="' + id + '" class="box-music">' +

          '<div class="btn-music">' +
            '<button class="btn-play"> <img src="img/ic_btn_play.svg" width="50" height="50"> </button>' +
            '<button class="btn-stop"> <img src="img/ic_btn_stop.svg" width="50" height="50"> </button>' +
            
            '<div class="name-music">' +
              '<p class="timestamp">' + date + '</p>' +
              '<p class="name">' + nome + '</p>' +
            '</div>' +
          '</div>' +

          '<div class="options-music">' +
            '<div class="options-menu">' +
              '<button class="btn-partitura">Partitura</button>' +
              '<button class="btn-delete">Apagar</button>' +
            '</div>' +
            '<button class="btn-menu"><i class="fas fa-ellipsis-v fa-2x"></i></button>' +
          '</div>' +
        '</div>';
      
      // appending to HTML
      let component = document.createElement('div');
      component.innerHTML = html;
      container.appendChild(component); 

      // functions play / stop 
      let btnPlay = document.querySelector('#' + id + ' .btn-play');
      let btnStop = document.querySelector('#' + id + ' .btn-stop');

      if (tocando) {
        btnStop.classList.add('active');
        btnPlay.classList.remove('active');
      } else {
        btnPlay.classList.add('active');
        btnStop.classList.remove('active');
      }

      btnPlay.addEventListener('click', function() {
        firebase.database().ref('musicas/' + id + '/tocando').set(true);
      }); 
      
      btnStop.addEventListener('click', function() {
        firebase.database().ref('musicas/' + id + '/tocando').set(false);
      });   

      // functions options menu
      let options = document.querySelector('#' + id + ' .options-music .btn-menu');
      let menu = document.querySelector('#' + id + ' .options-menu');
      let btnPartitura = document.querySelector('#' + id + ' .btn-partitura');
      let btnDelete = document.querySelector('#' + id + ' .btn-delete');

      // show / hide menu
      options.addEventListener('click', function() {
        menu.classList.toggle('active');
      });

      // show partitura
      btnPartitura.addEventListener('click', function() {

        modalTitle.textContent = 'Partitura da música' + nome;

        // updating modal

        for (let i = 0; i < notas.length; i++) {
          let item = document.createElement('li');

          if (notas[i] == 'Pausa') 
            item.textContent = `${notas[i]} - duração: ${tempos[i]}`;
          else
            item.textContent = `nota: ${notas[i]} (${oitavas[i]}ª oitava) - duração: ${tempos[i]}`;

          partitura.appendChild(item);
        }

        // showing modal
        modal.classList.toggle('active');
        backgroundShade.classList.toggle('active');
        // closing menu
        menu.classList.toggle('active');
      });

      // delete music
      btnDelete.addEventListener('click', function() {

        firebase.database().ref('musicas/' + id).remove();

        // closing menu
        menu.classList.toggle('active');
      });
      
    });
  });

});

/*
---------------------------
  FUNÇÕES
---------------------------
*/ 

bntCloseModal.addEventListener('click', function() {
  modal.classList.toggle('active');
  backgroundShade.classList.toggle('active');
  document.querySelector('.modal .modal-partitura').innerHTML = "";
});

// convert timestamp to DD HH:MM
function convertToHour(timestamp) {
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  let date = new Date(timestamp);
  // Hours part from the timestamp
  let hours = date.getHours();
  // Minutes part from the timestamp
  let minutes = "0" + date.getMinutes();
  // Day part from the timestamp
  let day = date.getDate(); 
  // Day part from the timestamp
  let month = date.getMonth() + 1; 

  // Will display time in 10:30:23 format
  return day + '/' + month + ' ' + hours + ':' + minutes.substr(-2);
}


