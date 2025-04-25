// Informações de aplicação para diferentes faixas de Tg
const tgApplications = {
    low: {
        range: "Baixa (< 0°C)",
        cssClass: "low",
        applications: [
            "Materiais flexíveis para uso em baixas temperaturas",
            "Elastômeros e borrachas para aplicações criogênicas",
            "Adesivos para aplicações de baixa temperatura",
            "Componentes para armazenamento em congeladores"
        ]
    },
    medium: {
        range: "Média (0°C - 100°C)",
        cssClass: "medium",
        applications: [
            "Embalagens flexíveis e filmes plásticos",
            "Termoplásticos comuns para uso diário",
            "Componentes plásticos de produtos de consumo",
            "Resinas para processos de moldagem por injeção",
            "Materiais para uso em temperatura ambiente"
        ]
    },
    high: {
        range: "Alta (100°C - 200°C)",
        cssClass: "high",
        applications: [
            "Componentes automotivos e de engenharia",
            "Equipamentos para processamento de alimentos",
            "Aplicações em eletrônica",
            "Materiais para uso médico e farmacêutico",
            "Componentes resistentes ao calor"
        ]
    },
    veryHigh: {
        range: "Muito Alta (> 200°C)",
        cssClass: "very-high",
        applications: [
            "Componentes aeroespaciais",
            "Peças sujeitas a altas temperaturas em motores",
            "Materiais para aplicações industriais de alta temperatura",
            "Polímeros de engenharia avançados",
            "Materiais para ambientes extremos"
        ]
    }
};

// Detalhes adicionais sobre os materiais
const materialDetails = {
    polietileno: {
        fator: 0.3,
        descricao: "Termoplástico flexível comum em embalagens, com excelente resistência química e boa processabilidade.",
        tgRange: "Baixa a média"
    },
    polipropileno: {
        fator: 0.4,
        descricao: "Termoplástico resistente a químicos com boa resistência ao impacto e estabilidade térmica superior ao polietileno.",
        tgRange: "Média"
    },
    pvc: {
        fator: 0.5,
        descricao: "Plástico versátil usado em tubulações, com boa resistência a chamas e produtos químicos, mas sensível à exposição UV.",
        tgRange: "Média"
    },
    poliestireno: {
        fator: 0.6,
        descricao: "Termoplástico rígido e transparente com excelente isolamento térmico, mas relativamente frágil.",
        tgRange: "Média a alta"
    },
    pet: {
        fator: 0.7,
        descricao: "Usado em garrafas e embalagens, com excelente transparência, barreira a gases e boa resistência mecânica.",
        tgRange: "Alta"
    },
    nylon: {
        fator: 0.8,
        descricao: "Polímero resistente usado em fibras e peças de engenharia, com alta tenacidade e boa resistência a abrasão.",
        tgRange: "Alta"
    },
    policarbonato: {
        fator: 0.9,
        descricao: "Termoplástico de engenharia com excepcional resistência ao impacto, transparência e estabilidade dimensional.",
        tgRange: "Alta"
    },
    acrilico: {
        fator: 1.0,
        descricao: "Alternativa transparente ao vidro com excelente claridade ótica, resistência UV e propriedades de isolamento.",
        tgRange: "Alta"
    }
};

// Função para calcular a temperatura de transição vítrea
async function calcularTg() {
    const materialSelect = document.getElementById("material");
    const formulaInput = document.getElementById("formula");
    
    const material = materialSelect.value;
    const formula = formulaInput.value;

    // Validação de entrada com feedback visual
    if (!validarEntrada()) {
        return;
    }

    // Mostra o indicador de carregamento
    document.getElementById("loading").style.display = "flex";

    try {
        // Simula um pequeno atraso para mostrar o loading (pode ser removido em produção)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Faz a requisição para o servidor
        const response = await fetch("/tg", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ material, formula })
        });

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro ao calcular Tg.");
        }

        const data = await response.json();
        
        // Exibe o container de resultados com animação suave
        const resultsContainer = document.getElementById("resultado-container");
        resultsContainer.style.opacity = 0;
        resultsContainer.style.display = "block";
        
        // Animação de fade in
        (function fadeIn() {
            let opacity = parseFloat(resultsContainer.style.opacity);
            if ((opacity += 0.1) <= 1) {
                resultsContainer.style.opacity = opacity;
                requestAnimationFrame(fadeIn);
            }
        })();
        
        // Atualiza os valores no resultado com animação
        animarValorTg(data.tg);
        document.getElementById("material-nome").textContent = capitalizeFirstLetter(data.material);
        document.getElementById("formula-aplicada").textContent = data.formula;
        document.getElementById("material-descricao").textContent = data.descricao;
        
        // Destaca o estado relevante com base no valor de Tg
        destacarEstadoRelevante(data.tg);
        
        // Atualiza as aplicações com base no valor de Tg
        updateApplications(data.tg);
        
        // Rola suavemente para mostrar os resultados
        setTimeout(() => {
            resultsContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);
        
        // Mostra notificação de sucesso
        mostrarNotificacao("Temperatura calculada com sucesso!", "sucesso");
        
    } catch (error) {
        // Exibe uma notificação de erro estilizada
        mostrarNotificacao(error.message || "Erro ao calcular Tg. Verifique sua conexão.", "erro");
        console.error("Erro:", error);
    } finally {
        // Esconde o indicador de carregamento
        document.getElementById("loading").style.display = "none";
    }
}

// Função para validar entradas
function validarEntrada() {
    const material = document.getElementById("material").value;
    const formula = document.getElementById("formula").value;
    
    // Remove mensagens de erro anteriores
    removerErros();

    if (!material) {
        mostrarErro("material", "Por favor, selecione um material.");
        return false;
    }

    if (!formula) {
        mostrarErro("formula", "Por favor, insira uma fórmula de cálculo.");
        return false;
    }

    // Verifica se a fórmula contém a variável "fator"
    if (!formula.includes("fator")) {
        mostrarErro("formula", "A fórmula deve conter a variável 'fator'.");
        return false;
    }

    // Verifica se a fórmula é válida (uma validação simples)
    try {
        // Remove "Tg =" se presente e substitui "fator" por um número para testar
        const testFormula = formula.replace(/Tg\s*=\s*/i, "").replace(/fator/gi, "1");
        eval(testFormula);
    } catch (e) {
        mostrarErro("formula", "A fórmula não é válida. Verifique a sintaxe.");
        return false;
    }

    return true;
}

// Função para mostrar mensagem de erro
function mostrarErro(elementId, mensagem) {
    const element = document.getElementById(elementId);
    
    // Adiciona estilo de erro
    if (element.tagName === "SELECT") {
        element.style.borderColor = "var(--error-color)";
        element.parentNode.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
    } else {
        element.style.borderColor = "var(--error-color)";
        element.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
    }
    
    // Cria e adiciona a mensagem de erro
    const errorMsg = document.createElement("div");
    errorMsg.className = "error-message";
    errorMsg.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${mensagem}`;
    
    // Insere após o input wrapper
    element.parentNode.insertAdjacentElement('afterend', errorMsg);
    
    // Efeito visual de shake
    const formContainer = document.querySelector('.form-container');
    formContainer.classList.add('shake');
    setTimeout(() => formContainer.classList.remove('shake'), 500);
}

// Função para remover todas as mensagens de erro
function removerErros() {
    // Remove todas as mensagens de erro
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Remove estilos de erro dos inputs
    document.querySelectorAll('input, select').forEach(el => {
        el.style.borderColor = "";
        el.style.backgroundColor = "";
    });
    
    // Remove estilos de erro dos input wrappers
    document.querySelectorAll('.input-wrapper').forEach(el => {
        el.style.backgroundColor = "";
    });
}

// Função para animar o valor de Tg
function animarValorTg(valorFinal) {
    const elemento = document.getElementById("tg-valor");
    const inicio = 0;
    const duracao = 1500;
    const incremento = valorFinal / 60; // 60 frames por segundo durante a duração
    
    let valorAtual = inicio;
    const intervalo = setInterval(() => {
        valorAtual += incremento;
        
        if (valorAtual >= valorFinal) {
            clearInterval(intervalo);
            elemento.textContent = valorFinal.toFixed(1);
        } else {
            elemento.textContent = valorAtual.toFixed(1);
        }
    }, duracao / 60);
}

// Função para destacar o estado relevante com base no valor de Tg
function destacarEstadoRelevante(tgValue) {
    const belowTg = document.getElementById("below-tg");
    const aboveTg = document.getElementById("above-tg");
    
    // Reseta estados
    belowTg.style.transform = "";
    belowTg.style.boxShadow = "";
    belowTg.style.borderLeftWidth = "";
    
    aboveTg.style.transform = "";
    aboveTg.style.boxShadow = "";
    aboveTg.style.borderLeftWidth = "";
    
    // Temperatura ambiente padrão (25°C)
    const ambientTemp = 25;
    
    if (tgValue > ambientTemp) {
        // Material está em estado vítreo na temperatura ambiente
        belowTg.style.transform = "scale(1.05)";
        belowTg.style.boxShadow = "var(--shadow-md)";
        belowTg.style.borderLeftWidth = "5px";
    } else {
        // Material está em estado borrachoso na temperatura ambiente
        aboveTg.style.transform = "scale(1.05)";
        aboveTg.style.boxShadow = "var(--shadow-md)";
        aboveTg.style.borderLeftWidth = "5px";
    }
}

// Função para atualizar a seção de aplicações com base no valor de Tg
function updateApplications(tgValue) {
    const applicationsContainer = document.getElementById("tg-applications");
    applicationsContainer.innerHTML = ""; // Limpa o conteúdo anterior
    
    // Determina a faixa de Tg
    let tgCategory;
    if (tgValue < 0) {
        tgCategory = tgApplications.low;
    } else if (tgValue >= 0 && tgValue < 100) {
        tgCategory = tgApplications.medium;
    } else if (tgValue >= 100 && tgValue < 200) {
        tgCategory = tgApplications.high;
    } else {
        tgCategory = tgApplications.veryHigh;
    }
    
    // Adiciona o cabeçalho da faixa
    const rangeHeader = document.createElement("div");
    rangeHeader.className = `tg-range ${tgCategory.cssClass}`;
    rangeHeader.textContent = `Aplicações para Tg ${tgCategory.range}:`;
    applicationsContainer.appendChild(rangeHeader);
    
    // Adiciona as aplicações com animação de entrada
    tgCategory.applications.forEach((app, index) => {
        const appItem = document.createElement("div");
        appItem.className = "application-item";
        
        appItem.innerHTML = `
            <i class="bi bi-check-circle"></i>
            <span>${app}</span>
        `;
        
        // Adiciona animação de entrada com atraso
        appItem.style.opacity = "0";
        appItem.style.transform = "translateX(20px)";
        appItem.style.transition = "all 0.3s ease";
        
        applicationsContainer.appendChild(appItem);
        
        // Anima a entrada com atraso baseado no índice
        setTimeout(() => {
            appItem.style.opacity = "1";
            appItem.style.transform = "translateX(0)";
        }, 100 + (index * 100));
    });
}

// Função para mostrar notificações estilizadas
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remove notificações anteriores
    const notificacoesExistentes = document.querySelectorAll('.notificacao');
    notificacoesExistentes.forEach(n => n.remove());
    
    // Cria o elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    
    // Define o ícone com base no tipo
    let icone = 'info-circle';
    if (tipo === 'erro') icone = 'exclamation-triangle';
    if (tipo === 'sucesso') icone = 'check-circle';
    
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <i class="bi bi-${icone}"></i>
            <span>${mensagem}</span>
        </div>
        <button class="fechar-notificacao"><i class="bi bi-x"></i></button>
    `;
    
    // Adiciona ao corpo do documento
    document.body.appendChild(notificacao);
    
    // Anima a entrada da notificação
    setTimeout(() => {
        notificacao.classList.add('visivel');
    }, 10);
    
    // Configura o fechamento automático
    const tempoExibicao = tipo === 'erro' ? 6000 : 4000;
    const temporizador = setTimeout(() => {
        fecharNotificacao(notificacao);
    }, tempoExibicao);
    
    // Configura o botão de fechar
    notificacao.querySelector('.fechar-notificacao').addEventListener('click', () => {
        clearTimeout(temporizador);
        fecharNotificacao(notificacao);
    });
}

// Função para fechar notificações com animação
function fecharNotificacao(elemento) {
    elemento.classList.remove('visivel');
    setTimeout(() => {
        elemento.remove();
    }, 300);
}

// Função auxiliar para capitalizar a primeira letra de cada palavra
function capitalizeFirstLetter(string) {
    return string.split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Carrega informações do material quando selecionado
    document.getElementById("material").addEventListener("change", function() {
        const selectedMaterial = this.value;
        if (selectedMaterial && materialDetails[selectedMaterial]) {
            const detalhes = materialDetails[selectedMaterial];
            
            // Atualiza a dica de fórmula baseada no material
            const hint = document.querySelector('.input-hint span');
            hint.innerHTML = `Use "fator" como variável (valor para ${capitalizeFirstLetter(selectedMaterial)}: <strong>${detalhes.fator}</strong>)`;
            
            // Destaca brevemente a dica para chamar atenção
            hint.parentNode.style.animation = "pulse 1s";
            setTimeout(() => {
                hint.parentNode.style.animation = "";
            }, 1000);
        }
    });
    
    // Adiciona funcionalidade de tecla Enter para calcular
    document.getElementById("formula").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            calcularTg();
        }
    });
    
    // Adiciona animação ao abrir a página
    const formContainer = document.querySelector('.form-container');
    formContainer.style.opacity = "0";
    formContainer.style.transform = "translateY(20px)";
    
    setTimeout(() => {
        formContainer.style.transition = "all 0.5s ease";
        formContainer.style.opacity = "1";
        formContainer.style.transform = "translateY(0)";
    }, 300);
    
    // Define estilo para mensagens de erro
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            color: var(--error-color);
            font-size: 12px;
            margin-top: 5px;
            display: flex;
            align-items: center;
        }
        
        .error-message i {
            margin-right: 5px;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); background-color: rgba(139, 92, 246, 0.1); }
        }
        
        .shake {
            animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
    `;
    document.head.appendChild(style);
    
    // Verifica o tema do sistema e adapta a UI
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
    }
    
    // Ouve por mudanças no tema do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    });
});