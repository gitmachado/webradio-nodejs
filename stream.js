const http = require('http');
const { spawn } = require('child_process');
const stream = require('stream');

const { audioFiles } = require('./songs/audioFiles');
const { vignettesFiles } = require('./vignettes/vignettesFiles');
let shuffledAudioFiles = shuffleArray(audioFiles, vignettesFiles);

let currentAudioIndex = 0;
let ffmpegProcess;
let outputStream = new stream.PassThrough();

function startFFMpeg() {
    const inputAudioFile = shuffledAudioFiles[currentAudioIndex].url;
    const ffmpegProcess = spawn('ffmpeg', [
        '-re',                      // Forçar FFmpeg a ler o arquivo na taxa de reprodução original
        '-i', inputAudioFile,      // Especificar o arquivo de entrada de áudio
        '-acodec', 'aac',           // Codec de áudio AAC
        '-b:a', '128k',             // Taxa de bits de áudio
        '-ac', '2',                 // Número de canais de áudio
        '-ar', '44100',             // Taxa de amostragem de áudio
        '-f', 'adts',               // Formato de saída ADTS para streaming de áudio
        '-'                         // Saída para pipe
    ]);

    console.log("Reproduzindo: ", inputAudioFile);

    ffmpegProcess.stdout.on('data', (data) => {
        if (outputStream) {
            outputStream.write(data);
        }
    });

    ffmpegProcess.stderr.on('data', (data) => {
        console.error(`FFMPEG: ${shuffledAudioFiles[currentAudioIndex].name} ${data}`);
    });

    ffmpegProcess.on('close', (code) => {
        switchAudio();
    });
}

function switchAudio() {
    if (currentAudioIndex === audioFiles.length - 1) {
        // Se o índice atual for o último, embaralhe o array novamente
        shuffledAudioFiles = shuffleArray(audioFiles);
    }
    currentAudioIndex = (currentAudioIndex + 1) % audioFiles.length;
    console.log(`Switching to audio file: ${shuffledAudioFiles[currentAudioIndex].url}`);
    if (ffmpegProcess) {
        ffmpegProcess.kill();
    }
    startFFMpeg();
}
function shuffleArray(audioFiles, vignettesFiles) {
    // Embaralhar o array de áudios
    for (let i = audioFiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [audioFiles[i], audioFiles[j]] = [audioFiles[j], audioFiles[i]];
    }

    // Criar novo array com músicas e vinhetas a cada 3 músicas
    const mixedArray = [];
    let counter = 0;
    for (let i = 0; i < audioFiles.length; i++) {
        mixedArray.push(audioFiles[i]);
        counter++;
        if (counter === 3 && i !== audioFiles.length - 1) {
            // Adicionar vinheta
            const vignetteIndex = Math.floor(Math.random() * vignettesFiles.length);
            mixedArray.push(vignettesFiles[vignetteIndex]);
            counter = 0;
        }
    }

    return mixedArray;
}

startFFMpeg();

// Criando um servidor HTTP para transmitir a transmissão de áudio
const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'audio/aac',
        'Transfer-Encoding': 'chunked'
    });

    outputStream.pipe(res);
});

// Porta para o servidor HTTP
const port = 8000;

// Iniciar o servidor HTTP
server.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
});
