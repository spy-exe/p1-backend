// Variáveis globais para os gráficos
let graficoForcaCortante;
let graficoMomentoFletor;

// Variável para armazenar a tipologia de viga atual
let tipologiaAtual = 'simples';

// Configuração dos gráficos
const configGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    family: "'Plus Jakarta Sans', sans-serif",
                    weight: 500
                },
                padding: 15
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            titleFont: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 14,
                weight: 600
            },
            bodyFont: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 13
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += context.parsed.y.toFixed(2);
                    }
                    return label;
                }
            }
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Posição (m)',
                font: {
                    family: "'Plus Jakarta Sans', sans-serif",
                    size: 14,
                    weight: 600
                },
                padding: {top: 10, bottom: 0}
            },
            grid: {
                color: 'rgba(226, 232, 240, 0.5)',
                drawBorder: false
            },
            ticks: {
                font: {
                    family: "'Plus Jakarta Sans', sans-serif"
                },
                maxRotation: 0
            }
        },
        y: {
            title: {
                display: true,
                text: 'Valor',
                font: {
                    family: "'Plus Jakarta Sans', sans-serif",
                    size: 14,
                    weight: 600
                },
                padding: {top: 0, bottom: 10}
            },
            grid: {
                color: 'rgba(226, 232, 240, 0.5)',
                drawBorder: false
            },
            ticks: {
                font: {
                    family: "'Plus Jakarta Sans', sans-serif"
                }
            }
        }
    },
    animations: {
        tension: {
            duration: 1000,
            easing: 'easeOutQuart',
            from: 0.8,
            to: 0.2,
            loop: false
        }
    }
};

// Verifica o tema do sistema para ajustar os gráficos
function atualizarTemaGraficos() {
    // Verifica se o usuário prefere o tema escuro
    const prefereDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (prefereDarkMode) {
        Chart.defaults.color = '#cbd5e1';
        Chart.defaults.borderColor = 'rgba(51, 65, 85, 0.5)';
        
        // Atualiza as configurações do gráfico para o tema escuro
        configGrafico.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        configGrafico.scales.x.grid.color = 'rgba(51, 65, 85, 0.5)';
        configGrafico.scales.y.grid.color = 'rgba(51, 65, 85, 0.5)';
    } else {
        Chart.defaults.color = '#475569';
        Chart.defaults.borderColor = 'rgba(226, 232, 240, 0.8)';
    }
    
    // Recria os gráficos se já existirem
    if (graficoForcaCortante) {
        inicializarGraficos();
    }
}

// Inicializa os gráficos vazios
function inicializarGraficos() {
    const ctxCortante = document.getElementById('grafico-cortante').getContext('2d');
    const ctxMomento = document.getElementById('grafico-momento').getContext('2d');
    
    // Destrói os gráficos existentes, se houver
    if (graficoForcaCortante) graficoForcaCortante.destroy();
    if (graficoMomentoFletor) graficoMomentoFletor.destroy();
    
    // Gráfico de Força Cortante
    graficoForcaCortante = new Chart(ctxCortante, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Força Cortante (N)',
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 2,
                tension: 0,
                fill: 'origin',
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#6366f1',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                data: []
            }]
        },
        options: {
            ...configGrafico,
            scales: {
                ...configGrafico.scales,
                y: {
                    ...configGrafico.scales.y,
                    title: {
                        ...configGrafico.scales.y.title,
                        text: 'Força Cortante (N)'
                    },
                    grid: {
                        ...configGrafico.scales.y.grid,
                        color: (context) => {
                            if (context.tick.value === 0) {
                                return 'rgba(0, 0, 0, 0.5)';
                            }
                            return 'rgba(226, 232, 240, 0.5)';
                        },
                        lineWidth: (context) => {
                            if (context.tick.value === 0) {
                                return 2;
                            }
                            return 1;
                        }
                    }
                }
            }
        }
    });
    
    // Gráfico de Momento Fletor
    graficoMomentoFletor = new Chart(ctxMomento, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Momento Fletor (N.m)',
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                borderWidth: 2,
                tension: 0,
                fill: 'origin',
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#ec4899',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                data: []
            }]
        },
        options: {
            ...configGrafico,
            scales: {
                ...configGrafico.scales,
                y: {
                    ...configGrafico.scales.y,
                    title: {
                        ...configGrafico.scales.y.title,
                        text: 'Momento Fletor (N.m)'
                    },
                    grid: {
                        ...configGrafico.scales.y.grid,
                        color: (context) => {
                            if (context.tick.value === 0) {
                                return 'rgba(0, 0, 0, 0.5)';
                            }
                            return 'rgba(226, 232, 240, 0.5)';
                        },
                        lineWidth: (context) => {
                            if (context.tick.value === 0) {
                                return 2;
                            }
                            return 1;
                        }
                    }
                }
            }
        }
    });
}

// Função para selecionar tipo de viga
function selecionarTipologia(tipo) {
    // Armazena a tipologia selecionada
    tipologiaAtual = tipo;
    
    // Atualiza a classe ativa
    document.querySelectorAll('.tipologia-option').forEach(option => {
        option.classList.remove('active');
    });
    
    document.querySelector(`.tipologia-option[onclick="selecionarTipologia('${tipo}')"]`).classList.add('active');
    
    // Ajusta os campos com base no tipo de viga
    if (tipo === 'balanco') {
        // Para viga em balanço, ajusta os padrões se necessário
        const comprimentoInput = document.getElementById("comprimento");
        if (!comprimentoInput.value || parseFloat(comprimentoInput.value) < 0.5) {
            comprimentoInput.value = "3.5";
        }
    }
}

// Função para mudar entre as abas
function changeTab(tabName) {
    // Atualiza o botão ativo
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.tab-button[onclick="changeTab('${tabName}')"]`).classList.add('active');
    
    // Atualiza o conteúdo da aba
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none';
    });
    
    const targetPane = document.getElementById(`${tabName}-tab`);
    if (targetPane) {
        targetPane.classList.add('active');
        targetPane.style.display = 'block';
    }
}

// Validação em tempo real e feedback visual
function validarEntrada(input, min, max) {
    const valor = parseFloat(input.value);
    
    if (isNaN(valor)) {
        mostraErro(input, "Por favor, insira um número válido");
        return false;
    }
    
    if (min !== undefined && valor < min) {
        mostraErro(input, `O valor deve ser maior ou igual a ${min}`);
        return false;
    }
    
    if (max !== undefined && valor > max) {
        mostraErro(input, `O valor deve ser menor ou igual a ${max}`);
        return false;
    }
    
    // Remove qualquer estado de erro
    removerErro(input);
    return true;
}

// Mostrar mensagem de erro
function mostraErro(input, mensagem) {
    // Remove erro anterior, se existir
    removerErro(input);
    
    input.style.borderColor = 'var(--error-color)';
    input.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
    
    // Cria o elemento de mensagem de erro
    const erro = document.createElement('div');
    erro.className = 'erro-mensagem';
    erro.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${mensagem}`;
    
    // Insere após o input
    input.parentNode.insertAdjacentElement('afterend', erro);
}

// Remover mensagem de erro
function removerErro(input) {
    input.style.borderColor = '';
    input.style.backgroundColor = '';
    
    // Remove a mensagem de erro, se existir
    const erroExistente = input.parentNode.parentNode.querySelector('.erro-mensagem');
    if (erroExistente) {
        erroExistente.remove();
    }
}

// Formata os números para exibição
function formatarNumero(numero) {
    return new Intl.NumberFormat('pt-BR', { 
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(numero);
}

// Função para animar contadores
function animarContador(elementId, inicio, fim, duracao) {
    const elemento = document.getElementById(elementId);
    const range = Math.abs(fim - inicio);
    const incremento = range / 60; // 60 frames por segundo
    const direcao = fim > inicio ? 1 : -1;
    const intervaloDuracao = duracao / 60;
    
    let atual = inicio;
    const timer = setInterval(() => {
        atual += incremento * direcao;
        
        if ((direcao > 0 && atual >= fim) || (direcao < 0 && atual <= fim)) {
            clearInterval(timer);
            elemento.textContent = formatarNumero(fim);
        } else {
            elemento.textContent = formatarNumero(atual);
        }
    }, intervaloDuracao);
}

// Função principal para calcular as reações
async function calcular() {
    const comprimentoInput = document.getElementById("comprimento");
    const forcaInput = document.getElementById("forca");
    const posicaoInput = document.getElementById("posicao");
    
    const comprimento = parseFloat(comprimentoInput.value);
    const forca = parseFloat(forcaInput.value);
    const posicao = parseFloat(posicaoInput.value);

    // Validação de entrada com feedback visual
    let valido = true;
    
    if (!validarEntrada(comprimentoInput, 0.1)) {
        valido = false;
    }
    
    if (!validarEntrada(forcaInput, 1)) {
        valido = false;
    }
    
    if (!validarEntrada(posicaoInput, 0.1, comprimento)) {
        valido = false;
    }
    
    if (!valido) {
        // Efeito shake nos campos com erro
        const formContainer = document.querySelector('.form-container');
        formContainer.classList.add('shake');
        setTimeout(() => formContainer.classList.remove('shake'), 500);
        return;
    }

    // Mostra o indicador de carregamento
    document.getElementById("loading").style.display = "flex";

    try {
        // Calcula localmente para demonstração (em produção usaria a API)
        let Ra, Rb, Ma;
        
        if (tipologiaAtual === 'simples') {
            // Cálculo para viga bi-apoiada
            Ra = forca * (comprimento - posicao) / comprimento;
            Rb = forca * posicao / comprimento;
            Ma = 0;
        } else {
            // Cálculo para viga em balanço
            Ra = forca;
            Rb = 0;
            Ma = forca * posicao;
        }
        
        // Geração dos diagramas
        const numPontos = Math.max(100, comprimento * 10);
        const step = comprimento / numPontos;
        
        let forcas = [];
        let momentos = [];
        let posicoes = [];
        
        // Gerar pontos para os diagramas
        for (let i = 0; i <= numPontos; i++) {
            const x = i * step;
            posicoes.push(x);
            
            // Cálculo da força cortante
            let cortante;
            
            if (tipologiaAtual === 'simples') {
                // Viga bi-apoiada
                if (x < posicao) {
                    cortante = Ra;
                } else {
                    cortante = Ra - forca;
                }
            } else {
                // Viga em balanço
                if (x < posicao) {
                    cortante = 0;
                } else {
                    cortante = -forca;
                }
            }
            
            forcas.push(cortante);
            
            // Cálculo do momento fletor
            let momento;
            
            if (tipologiaAtual === 'simples') {
                // Viga bi-apoiada
                if (x <= posicao) {
                    momento = Ra * x;
                } else {
                    momento = Ra * x - forca * (x - posicao);
                }
            } else {
                // Viga em balanço
                if (x < posicao) {
                    momento = 0;
                } else {
                    momento = -forca * (x - posicao);
                }
            }
            
            momentos.push(momento);
        }
        
        // Encontrar o momento máximo (absoluto)
        const momentoMaxAbs = Math.max(...momentos.map(m => Math.abs(m)));
        const indexMomentoMax = momentos.findIndex(m => Math.abs(m) === momentoMaxAbs);
        const posicaoMomentoMax = posicoes[indexMomentoMax];
        const momentoMax = momentos[indexMomentoMax];
        
        // Exibe o container de resultados
        const resultsContainer = document.getElementById("results-container");
        resultsContainer.style.display = "block";
        
        // Atualiza os valores de reação
        document.getElementById("reacao-a").textContent = formatarNumero(Ra);
        if (tipologiaAtual === 'simples') {
            document.getElementById("reacao-b").textContent = formatarNumero(Rb);
            document.getElementById("reacao-b-container").style.display = "block";
        } else {
            document.getElementById("reacao-b-container").style.display = "none";
        }
        
        // Atualiza detalhes
        const detalhesEl = document.getElementById("detalhes-esforco");
        if (tipologiaAtual === 'simples') {
            detalhesEl.innerHTML = `
                <p><strong>Força aplicada:</strong> ${forca}N à ${posicao}m da extremidade esquerda</p>
                <p><strong>Momento máximo:</strong> ${Math.abs(momentoMax).toFixed(2)}N.m à ${posicaoMomentoMax.toFixed(2)}m</p>
            `;
        } else {
            detalhesEl.innerHTML = `
                <p><strong>Força aplicada:</strong> ${forca}N à ${posicao}m do engaste</p>
                <p><strong>Momento no engaste:</strong> ${Ma.toFixed(2)}N.m</p>
                <p><strong>Momento máximo:</strong> ${Math.abs(momentoMax).toFixed(2)}N.m à ${posicaoMomentoMax.toFixed(2)}m</p>
            `;
        }
        detalhesEl.style.display = "block";
        
        // Inicializa os gráficos se ainda não foram criados
        if (!graficoForcaCortante || !graficoMomentoFletor) {
            inicializarGraficos();
        }
        
        // Atualiza os gráficos
        atualizarGraficos(posicoes, forcas, momentos, Ra, Rb, forca, posicao, comprimento);
        
        // Renderiza o esquema da viga
        renderizarEsquemaViga(comprimento, posicao, forca, Ra, Rb, Ma);
        
        // Configura a visualização das abas
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.style.display = 'none';
        });
        document.getElementById('cortante-tab').style.display = 'block';
        
        // Rola para exibir os resultados
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error("Erro:", error);
        mostrarNotificacao(error.message || "Erro ao calcular reações", "erro");
    } finally {
        // Esconde o indicador de carregamento
        document.getElementById("loading").style.display = "none";
    }
}

// Função para atualizar os gráficos
function atualizarGraficos(posicoes, forcas, momentos, Ra, Rb, forca, posicaoForca, comprimento) {
    // Adicionar pontos de interesse para os gráficos
    const pontosInteresseCortante = [{
        x: 0,
        y: Ra,
        r: 6,
        label: `Ra = ${Ra.toFixed(2)}N`
    }];
    
    // Adicionar ponto de descontinuidade na força aplicada
    pontosInteresseCortante.push({
        x: posicaoForca,
        y: forcas.find((_, i) => posicoes[i] >= posicaoForca),
        r: 6,
        label: `V = ${forcas.find((_, i) => posicoes[i] >= posicaoForca).toFixed(2)}N`
    });
    
    // Adicionar ponto B para viga simples
    if (tipologiaAtual === 'simples') {
        pontosInteresseCortante.push({
            x: comprimento,
            y: -Rb, // Convenção de sinal
            r: 6,
            label: `Rb = ${Rb.toFixed(2)}N`
        });
    }
    
    // Para o diagrama de momento, encontrar o momento máximo
    const momentoMax = Math.max(...momentos.map(m => Math.abs(m)));
    const indexMomentoMax = momentos.findIndex(m => Math.abs(m) === momentoMax);
    
    const pontosInteresseMomento = [{
        x: posicoes[indexMomentoMax],
        y: momentos[indexMomentoMax],
        r: 6,
        label: `M = ${momentos[indexMomentoMax].toFixed(2)}N.m`
    }];
    
    // Se for viga em balanço, adicionar o momento no engaste
    if (tipologiaAtual === 'balanco') {
        pontosInteresseMomento.push({
            x: 0,
            y: 0,
            r: 6,
            label: `M = ${(forca * posicaoForca).toFixed(2)}N.m`
        });
    }
    
    // Atualiza o gráfico de força cortante
    graficoForcaCortante.data.labels = posicoes.map(p => p.toFixed(2));
    graficoForcaCortante.data.datasets[0].data = forcas;
    
    // Adiciona pontos de destaque ao gráfico de força cortante
    graficoForcaCortante.data.datasets = [{
        label: 'Força Cortante (N)',
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderWidth: 2,
        tension: 0,
        fill: 'origin',
        pointRadius: 0,
        pointHoverRadius: 6,
        data: forcas
    }, ...pontosInteresseCortante.map(p => ({
        label: p.label,
        data: [{ x: p.x, y: p.y }],
        pointRadius: p.r,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#047857',
        pointBorderWidth: 1,
        pointHoverRadius: 8,
        showLine: false
    }))];
    
    // Atualiza o gráfico de momento fletor
    graficoMomentoFletor.data.labels = posicoes.map(p => p.toFixed(2));
    graficoMomentoFletor.data.datasets[0].data = momentos;
    
    // Adiciona pontos de destaque ao gráfico de momento fletor
    graficoMomentoFletor.data.datasets = [{
        label: 'Momento Fletor (N.m)',
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderWidth: 2,
        tension: 0,
        fill: 'origin',
        pointRadius: 0,
        pointHoverRadius: 6,
        data: momentos
    }, ...pontosInteresseMomento.map(p => ({
        label: p.label,
        data: [{ x: p.x, y: p.y }],
        pointRadius: p.r,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#d97706',
        pointBorderWidth: 1,
        pointHoverRadius: 8,
        showLine: false
    }))];
    
    // Determina a escala adequada para os gráficos
    const maxForcaAbs = Math.max(...forcas.map(f => Math.abs(f))) * 1.2;
    const maxMomentoAbs = Math.max(...momentos.map(m => Math.abs(m))) * 1.2;
    
    graficoForcaCortante.options.scales.y.min = -maxForcaAbs;
    graficoForcaCortante.options.scales.y.max = maxForcaAbs;
    
    graficoMomentoFletor.options.scales.y.min = -maxMomentoAbs;
    graficoMomentoFletor.options.scales.y.max = maxMomentoAbs;
    
    // Atualiza os gráficos
    graficoForcaCortante.update();
    graficoMomentoFletor.update();
}

// Função para renderizar o esquema da viga
function renderizarEsquemaViga(comprimento, posicao, forca, Ra, Rb, Ma = 0) {
    const canvas = document.getElementById('esquema-viga');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dimensões e posicionamento
    const marginX = 50;
    const marginY = 40;
    const vigaY = 80;
    
    // Escala para desenho proporcional
    const escala = (canvas.width - 2 * marginX) / comprimento;
    
    // Função auxiliar para converter posição real para posição no canvas
    const posX = (x) => marginX + x * escala;
    
    // Desenhar a linha da viga
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marginX, vigaY);
    ctx.lineTo(posX(comprimento), vigaY);
    ctx.stroke();
    
    // Desenhar os apoios conforme o tipo de viga
    if (tipologiaAtual === 'simples') {
        // Apoio A (esquerda - triângulo)
        ctx.beginPath();
        ctx.moveTo(marginX, vigaY);
        ctx.lineTo(marginX - 15, vigaY + 20);
        ctx.lineTo(marginX + 15, vigaY + 20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fill();
        ctx.stroke();
        
        // Apoio B (direita - triângulo)
        ctx.beginPath();
        ctx.moveTo(posX(comprimento), vigaY);
        ctx.lineTo(posX(comprimento) - 15, vigaY + 20);
        ctx.lineTo(posX(comprimento) + 15, vigaY + 20);
        ctx.closePath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fill();
        ctx.stroke();
        
        // Desenhar setas de reação
        ctx.beginPath();
        ctx.moveTo(marginX, vigaY + 25);
        ctx.lineTo(marginX, vigaY + 45);
        ctx.stroke();
        
        // Seta para cima em A
        ctx.beginPath();
        ctx.moveTo(marginX - 5, vigaY + 35);
        ctx.lineTo(marginX, vigaY + 25);
        ctx.lineTo(marginX + 5, vigaY + 35);
        ctx.stroke();
        
        // Seta para cima em B
        ctx.beginPath();
        ctx.moveTo(posX(comprimento), vigaY + 25);
        ctx.lineTo(posX(comprimento), vigaY + 45);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(posX(comprimento) - 5, vigaY + 35);
        ctx.lineTo(posX(comprimento), vigaY + 25);
        ctx.lineTo(posX(comprimento) + 5, vigaY + 35);
        ctx.stroke();
        
    } else {
        // Engaste (esquerda)
        ctx.beginPath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fillRect(marginX - 20, vigaY - 20, 20, 40);
        ctx.strokeRect(marginX - 20, vigaY - 20, 20, 40);
        
        // Hachurado para engaste
        ctx.beginPath();
        for (let y = vigaY - 20; y <= vigaY + 20; y += 5) {
            ctx.moveTo(marginX - 20, y);
            ctx.lineTo(marginX, y);
        }
        ctx.stroke();
        
        // Seta de reação vertical
        ctx.beginPath();
        ctx.moveTo(marginX, vigaY + 25);
        ctx.lineTo(marginX, vigaY + 45);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(marginX - 5, vigaY + 35);
        ctx.lineTo(marginX, vigaY + 25);
        ctx.lineTo(marginX + 5, vigaY + 35);
        ctx.stroke();
        
        // Seta de momento no engaste
        ctx.beginPath();
        ctx.arc(marginX, vigaY, 20, Math.PI * 0.75, Math.PI * 1.75, false);
        ctx.stroke();
        
        // Ponta da seta de momento
        ctx.beginPath();
        ctx.moveTo(marginX - 25, vigaY - 5);
        ctx.lineTo(marginX - 20, vigaY + 3);
        ctx.lineTo(marginX - 14, vigaY - 7);
        ctx.stroke();
    }
    
    // Desenhar a força para baixo no ponto de aplicação
    const forcaX = posX(posicao);
    
    ctx.beginPath();
    ctx.moveTo(forcaX, vigaY - 30);
    ctx.lineTo(forcaX, vigaY);
    ctx.stroke();
    
    // Seta da força
    ctx.beginPath();
    ctx.moveTo(forcaX - 5, vigaY - 10);
    ctx.lineTo(forcaX, vigaY);
    ctx.lineTo(forcaX + 5, vigaY - 10);
    ctx.stroke();
    
    // Adicionar textos e valores
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    
    // Texto da força
    ctx.fillStyle = '#6366f1';
    ctx.fillText(`${forca} N`, forcaX, vigaY - 35);
    
    // Valores das reações
    ctx.fillStyle = '#10b981';
    
    if (tipologiaAtual === 'simples') {
        ctx.fillText(`Ra = ${Ra.toFixed(2)} N`, marginX, vigaY + 55);
        ctx.fillText(`Rb = ${Rb.toFixed(2)} N`, posX(comprimento), vigaY + 55);
    } else {
        ctx.fillText(`Ra = ${Ra.toFixed(2)} N`, marginX, vigaY + 55);
        ctx.fillText(`Ma = ${Ma.toFixed(2)} N.m`, marginX - 35, vigaY - 25);
    }
    
    // Dimensões
    ctx.fillStyle = '#475569';
    
    // Comprimento total
    ctx.beginPath();
    ctx.moveTo(marginX, vigaY + 70);
    ctx.lineTo(posX(comprimento), vigaY + 70);
    ctx.stroke();
    
    // Traços verticais
    ctx.beginPath();
    ctx.moveTo(marginX, vigaY + 65);
    ctx.lineTo(marginX, vigaY + 75);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(posX(comprimento), vigaY + 65);
    ctx.lineTo(posX(comprimento), vigaY + 75);
    ctx.stroke();
    
    // Texto do comprimento
    ctx.fillText(`${comprimento} m`, (marginX + posX(comprimento)) / 2, vigaY + 85);
    
    // Distância até o ponto de aplicação da força
    ctx.beginPath();
    ctx.moveTo(marginX, vigaY - 5);
    ctx.lineTo(marginX, vigaY - 15);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(forcaX, vigaY - 5);
    ctx.lineTo(forcaX, vigaY - 15);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(marginX, vigaY - 10);
    ctx.lineTo(forcaX, vigaY - 10);
    ctx.stroke();
    
    // Texto da posição
    ctx.fillText(`${posicao} m`, (marginX + forcaX) / 2, vigaY - 20);
}