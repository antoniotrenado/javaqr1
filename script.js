class QRGenerator {
    constructor() {
        this.canvas = document.getElementById('qr-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textInput = document.getElementById('text-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.copyBtn = document.getElementById('copy-btn');
        this.qrSize = document.getElementById('qr-size');
        this.errorCorrection = document.getElementById('error-correction');
        this.errorMessage = document.getElementById('error-message');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateQR());
        this.downloadBtn.addEventListener('click', () => this.downloadQR());
        this.copyBtn.addEventListener('click', () => this.copyQR());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateQR();
            }
        });
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        setTimeout(() => {
            this.errorMessage.classList.remove('show');
        }, 5000);
    }
    
    generateQR() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showError('Por favor ingresa algún texto o URL');
            return;
        }
        
        if (text.length > 2000) {
            this.showError('El texto es demasiado largo. Máximo 2000 caracteres.');
            return;
        }
        
        try {
            const size = parseInt(this.qrSize.value);
            const errorLevel = this.errorCorrection.value;
            
            this.canvas.width = size;
            this.canvas.height = size;
            
            // Generar el código QR
            this.drawQR(text, size, errorLevel);
            
            // Habilitar botones
            this.downloadBtn.disabled = false;
            this.copyBtn.disabled = false;
            
        } catch (error) {
            this.showError('Error al generar el código QR: ' + error.message);
        }
    }
    
    drawQR(text, size, errorLevel) {
        // Algoritmo simplificado de QR (versión básica)
        // Para una implementación completa, usarías una librería como qrcode.js
        
        // Este es un generador básico para demostrar el concepto
        // En producción, usa: https://github.com/kazuhikoarase/qrcode-generator
        const modules = this.generateQRModules(text, errorLevel);
        const moduleSize = size / modules.length;
        
        // Limpiar canvas
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, size, size);
        
        // Dibujar módulos
        this.ctx.fillStyle = 'black';
        for (let row = 0; row < modules.length; row++) {
            for (let col = 0; col < modules[row].length; col++) {
                if (modules[row][col]) {
                    this.ctx.fillRect(
                        col * moduleSize,
                        row * moduleSize,
                        moduleSize,
                        moduleSize
                    );
                }
            }
        }
        
        // Añadir borde
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, size, size);
    }
    
    generateQRModules(text, errorLevel) {
        // Implementación básica de QR (simplificada)
        // En la práctica, usarías una librería real
        
        const size = 21; // Tamaño mínimo del QR
        const modules = Array(size).fill().map(() => Array(size).fill(false));
        
        // Patrones de búsqueda (esquinas)
        this.addFinderPatterns(modules);
        
        // Información de versión y formato (simplificado)
        this.addFormatInfo(modules, errorLevel);
        
        // Datos (representación simplificada)
        this.addData(modules, text);
        
        // Máscara (simplificada)
        this.applyMask(modules);
        
        return modules;
    }
    
    addFinderPatterns(modules) {
        const pattern = [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],
            [1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1],
            [1,1,1,1,1,1,1]
        ];
        
        // Esquina superior izquierda
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                modules[i][j] = pattern[i][j] === 1;
            }
        }
        
        // Esquina superior derecha
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                modules[i][modules.length - 7 + j] = pattern[i][j] === 1;
            }
        }
        
        // Esquina inferior izquierda
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                modules[modules.length - 7 + i][j] = pattern[i][j] === 1;
            }
        }
    }
    
    addFormatInfo(modules, errorLevel) {
        // Información de formato simplificada
        const formatBits = errorLevel === 'L' ? [0,1,1,0,0,1,1,0,0,0,0,1,0,0,1] : 
                          errorLevel === 'M' ? [1,0,1,0,0,1,1,0,0,0,0,1,0,0,1] :
                          errorLevel === 'Q' ? [1,1,0,0,0,1,1,0,0,0,0,1,0,0,1] :
                          [0,0,0,0,0,1,1,0,0,0,0,1,0,0,1];
        
        // Colocar bits de formato (posiciones simplificadas)
        for (let i = 0; i < 9; i++) {
            if (i !== 6) { // Evitar el patrón de búsqueda
                modules[8][i] = formatBits[i] === 1;
                modules[i][8] = formatBits[i] === 1;
            }
        }
    }
    
    addData(modules, text) {
        // Convertir texto a bits y agregar al QR
        const data = this.textToBits(text);
        let bitIndex = 0;
        
        // Patrón de zigzag para colocar datos
        for (let col = modules.length - 1; col > 0; col -= 2) {
            if (col === 6) col--; // Saltar la línea de timing
            
            for (let row = 0; row < modules.length; row++) {
                for (let c = 0; c < 2; c++) {
                    const currentCol = col - c;
                    const currentRow = (col + 1) % 4 < 2 ? modules.length - 1 - row : row;
                    
                    if (!modules[currentRow][currentCol] && bitIndex < data.length) {
                        modules[currentRow][currentCol] = data[bitIndex] === '1';
                        bitIndex++;
                    }
                }
            }
        }
    }
    
    textToBits(text) {
        // Conversión simple de texto a bits
        let bits = '';
        for (let i = 0; i < text.length; i++) {
            const binary = text.charCodeAt(i).toString(2);
            bits += binary.padStart(8, '0');
        }
        return bits;
    }
    
    applyMask(modules) {
        // Máscara simple XOR
        for (let row = 0; row < modules.length; row++) {
            for (let col = 0; col < modules[row].length; col++) {
                if ((row + col) % 2 === 0 && !this.isReservedArea(modules, row, col)) {
                    modules[row][col] = !modules[row][col];
                }
            }
        }
    }
    
    isReservedArea(modules, row, col) {
        // Verificar si es un área reservada (patrones de búsqueda, etc.)
        const size = modules.length;
        
        // Patrones de búsqueda
        if ((row < 9 && col < 9) || 
            (row < 9 && col >= size - 8) || 
            (row >= size - 8 && col < 9)) {
            return true;
        }
        
        // Líneas de timing
        if (row === 6 || col === 6) return true;
        
        return false;
    }
    
    downloadQR() {
        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    async copyQR() {
        try {
            // Convertir canvas a blob
            const blob = await new Promise(resolve => 
                this.canvas.toBlob(resolve, 'image/png')
            );
            
            // Copiar al portapapeles
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            
            // Feedback visual
            this.copyBtn.textContent = '¡Copiado!';
            setTimeout(() => {
                this.copyBtn.textContent = 'Copiar al portapapeles';
            }, 2000);
            
        } catch (error) {
            this.showError('No se pudo copiar la imagen al portapapeles');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});