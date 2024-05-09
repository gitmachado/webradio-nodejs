const fs = require('fs');
const path = require('path');

// Diret�rio onde os arquivos de �udio est�o localizados
const vignettesDirectory = './vignettes';

// L� os arquivos de �udio no diret�rio
const vignettesFiles = fs.readdirSync(vignettesDirectory)
    .filter(file => file.endsWith('.aac'))
    .map(file => {
        const filePath = path.join(vignettesDirectory, file);
        return {
            url: filePath,
            name: path.basename(file, path.extname(file)), // Nome do arquivo sem a extens�o
            size: fs.statSync(filePath).size // Tamanho do arquivo em bytes
            // Voc� pode adicionar mais informa��es aqui, como artista, dura��o, etc.
        };
    });

// Exporta a lista de objetos de informa��es de �udio
module.exports = { vignettesFiles };
