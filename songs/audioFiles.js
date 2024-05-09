const fs = require('fs');
const path = require('path');

// Diretório onde os arquivos de áudio estão localizados
const audioDirectory = './songs';

// Lê os arquivos de áudio no diretório
const audioFiles = fs.readdirSync(audioDirectory)
    .filter(file => file.endsWith('.aac'))
    .map(file => {
        const filePath = path.join(audioDirectory, file);
        return {
            url: filePath,
            name: path.basename(file, path.extname(file)), // Nome do arquivo sem a extensão
            size: fs.statSync(filePath).size // Tamanho do arquivo em bytes
            // Você pode adicionar mais informações aqui, como artista, duração, etc.
        };
    });

// Exporta a lista de objetos de informações de áudio
module.exports = { audioFiles };
