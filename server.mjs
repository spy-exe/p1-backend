import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import fs from 'fs';

// Configuração de caminhos para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialização do aplicativo
const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Middleware de proteção e otimização
app.use(helmet({
    contentSecurityPolicy: isProd ? undefined : false, // Desabilita em desenvolvimento
    crossOriginEmbedderPolicy: isProd ? undefined : false, // Desabilita em desenvolvimento
}));
app.use(compression()); // Comprime as respostas
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do logger
if (isProd) {
    // Cria um stream de gravação para logs
    const accessLogStream = fs.createWriteStream(
        path.join(__dirname, 'access.log'),
        { flags: 'a' }
    );
    app.use(morgan('combined', { stream: accessLogStream }));
} else {
    app.use(morgan('dev'));
}

// Rate limiter para proteger contra ataques de força bruta
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas requisições deste IP, tente novamente após 15 minutos'
});

// Aplica limitador de taxa apenas às rotas da API
app.use('/reacoes', apiLimiter);
app.use('/tg', apiLimiter);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Banco de dados de materiais
const materiaisDB = {
    "polietileno": { fator: 0.3, descricao: "Termoplástico flexível comum em embalagens, com excelente resistência química e boa processabilidade." },
    "polipropileno": { fator: 0.4, descricao: "Termoplástico resistente a químicos com boa resistência ao impacto e estabilidade térmica superior ao polietileno." },
    "pvc": { fator: 0.5, descricao: "Plástico versátil usado em tubulações, com boa resistência a chamas e produtos químicos, mas sensível à exposição UV." },
    "poliestireno": { fator: 0.6, descricao: "Termoplástico rígido e transparente com excelente isolamento térmico, mas relativamente frágil." },
    "pet": { fator: 0.7, descricao: "Usado em garrafas e embalagens, com excelente transparência, barreira a gases e boa resistência mecânica." },
    "nylon": { fator: 0.8, descricao: "Polímero resistente usado em fibras e peças de engenharia, com alta tenacidade e boa resistência a abrasão." },
    "policarbonato": { fator: 0.9, descricao: "Termoplástico de engenharia com excepcional resistência ao impacto, transparência e estabilidade dimensional." },
    "acrilico": { fator: 1.0, descricao: "Alternativa transparente ao vidro com excelente claridade ótica, resistência UV e propriedades de isolamento." }
};

// Middleware de validação genérico
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    };
};

// Tratamento de erros assíncrono
const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};

// ========== ROTAS API ==========

// Endpoint para cálculo de reações
// Endpoint para cálculo de reações
app.post("/reacoes", asyncHandler(async (req, res) => {
    const { comprimento, forca, posicao, tipologia = 'simples' } = req.body;

    // Validação de entrada
    if (!comprimento || !forca || !posicao) {
        return res.status(400).json({ error: "Preencha todos os campos!" });
    }

    // Validação básica dos dados
    if (posicao > comprimento || posicao <= 0 || comprimento <= 0 || forca <= 0) {
        return res.status(400).json({ 
            error: "Valores inválidos! Verifique se a posição está dentro do comprimento da viga e se todos os valores são positivos." 
        });
    }

    // Simula um pequeno atraso para casos de estudo (remover em produção real)
    // await new Promise(resolve => setTimeout(resolve, 500));

    let Ra, Rb, forcas, momentos, posicoes, pontosCriticos;

    // Diferentes cálculos baseados na tipologia da viga
    if (tipologia === 'simples') {
        // Cálculo das reações de apoio (Apoios simples - bi-apoiada)
        Ra = forca * (comprimento - posicao) / comprimento;
        Rb = forca * posicao / comprimento;

        // Geração dos diagramas com mais pontos para uma melhor visualização
        const numPontos = Math.max(100, comprimento * 10); // Garante pelo menos 100 pontos
        const step = comprimento / numPontos;
        
        forcas = [];
        momentos = [];
        posicoes = [];
        pontosCriticos = {
            cortante: [],
            momento: []
        };

        // Valor máximo de momento para anotações
        let momentoMax = 0;
        let posicaoMomentoMax = 0;

        for (let i = 0; i <= numPontos; i++) {
            const x = i * step;
            posicoes.push(x);
            
            // Cálculo da força cortante
            let cortante = 0;
            if (x === 0) {
                cortante = Ra;
                pontosCriticos.cortante.push({ x: 0, y: Ra, label: `Ra=${Ra.toFixed(2)}N` });
            } else if (x < posicao) {
                cortante = Ra;
            } else if (Math.abs(x - posicao) < step) {
                // Ponto de aplicação da força - descontinuidade
                forcas.push(Ra);
                posicoes.push(x - step/1000); // Ponto logo antes
                cortante = Ra - forca;
                pontosCriticos.cortante.push({ x: posicao, y: cortante, label: `${cortante.toFixed(2)}N` });
            } else if (Math.abs(x - comprimento) < step) {
                cortante = -Rb;
                pontosCriticos.cortante.push({ x: comprimento, y: -Rb, label: `Rb=${Rb.toFixed(2)}N` });
            } else {
                cortante = Ra - forca;
            }
            
            forcas.push(cortante);
            
            // Cálculo do momento fletor
            let momento = 0;
            if (x <= posicao) {
                momento = Ra * x;
                if (Math.abs(x - posicao) < step) {
                    pontosCriticos.momento.push({ x: posicao, y: momento, label: `${momento.toFixed(2)}N.m` });
                }
            } else {
                momento = Ra * x - forca * (x - posicao);
            }
            
            // Verificando o momento máximo
            if (Math.abs(momento) > Math.abs(momentoMax)) {
                momentoMax = momento;
                posicaoMomentoMax = x;
            }
            
            momentos.push(momento);
        }
        
        // Adicionar o momento máximo aos pontos críticos (se não estiver já em um ponto crítico)
        if (
            posicaoMomentoMax > 0.01 && 
            Math.abs(posicaoMomentoMax - posicao) > 0.01 && 
            posicaoMomentoMax < comprimento - 0.01
        ) {
            pontosCriticos.momento.push({ 
                x: posicaoMomentoMax, 
                y: momentoMax, 
                label: `Max=${momentoMax.toFixed(2)}N.m` 
            });
        }
    } else if (tipologia === 'balanco') {
        // Cálculo para viga em balanço (engastada na extremidade esquerda)
        Ra = forca; // Reação vertical
        Rb = 0; // Não há reação em B
        const Ma = forca * posicao; // Momento de reação no engaste
        
        const numPontos = Math.max(100, comprimento * 10);
        const step = comprimento / numPontos;
        
        forcas = [];
        momentos = [];
        posicoes = [];
        pontosCriticos = {
            cortante: [],
            momento: []
        };
        
        for (let i = 0; i <= numPontos; i++) {
            const x = i * step;
            posicoes.push(x);
            
            // Força cortante
            let cortante;
            if (x < posicao) {
                cortante = 0;
            } else {
                cortante = -forca;
                if (Math.abs(x - posicao) < step) {
                    pontosCriticos.cortante.push({ x: posicao, y: cortante, label: `${cortante.toFixed(2)}N` });
                }
            }
            forcas.push(cortante);
            
            // Momento fletor
            let momento;
            if (x < posicao) {
                momento = 0;
            } else {
                momento = -forca * (x - posicao);
                if (x === comprimento) {
                    pontosCriticos.momento.push({ x: comprimento, y: momento, label: `${momento.toFixed(2)}N.m` });
                }
            }
            momentos.push(momento);
        }
        
        // Adicionar ponto de reação no engaste
        pontosCriticos.cortante.push({ x: 0, y: Ra, label: `Ra=${Ra.toFixed(2)}N` });
        pontosCriticos.momento.push({ x: 0, y: -Ma, label: `Ma=${Ma.toFixed(2)}N.m` });
    }

    res.json({ 
        forcas, 
        momentos, 
        posicoes,
        reacoes: {
            Ra,
            Rb
        },
        pontosCriticos
    });
}));

// Endpoint para cálculo da Temperatura de Transição Vítrea (Tg)
app.post("/tg", asyncHandler(async (req, res) => {
    const { material, formula } = req.body;
    
    if (!material || !formula) {
        return res.status(400).json({ error: "Informe o material e a fórmula para cálculo!" });
    }

    try {
        // Procura o material no banco de dados (case insensitive)
        const materialLowerCase = material.toLowerCase();
        const materialInfo = materiaisDB[materialLowerCase];

        if (!materialInfo) {
            return res.status(404).json({ 
                error: "Material não encontrado na base de dados.",
                sugestoes: Object.keys(materiaisDB)
            });
        }

        // Calcula Tg usando a fórmula fornecida pelo usuário, substituindo "fator" pelo valor do banco de dados
        let tgFormula = formula.replace(/fator/gi, materialInfo.fator);
        
        // Remove "Tg =" ou variações, caso exista na fórmula
        tgFormula = tgFormula.replace(/Tg\s*=\s*/i, "");
        
        // Avalia a fórmula de maneira segura usando Function (mais seguro que eval direto)
        // Ainda assim, em produção real, seria melhor usar uma biblioteca específica para avaliação segura de expressões matemáticas
        const calcTg = new Function('return ' + tgFormula);
        const tg = calcTg();

        // Validação do resultado
        if (isNaN(tg) || !isFinite(tg)) {
            throw new Error("O cálculo resultou em um valor inválido. Verifique a fórmula.");
        }

        res.json({ 
            tg: parseFloat(tg.toFixed(2)), 
            descricao: materialInfo.descricao,
            material: material,
            formula: formula
        });
    } catch (error) {
        console.error("Erro no cálculo de Tg:", error);
        res.status(500).json({ 
            error: "Erro ao calcular Tg. Verifique se a fórmula está correta.",
            detalhes: error.message
        });
    }
}));

// Rota para health check (útil para monitoramento)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Rota para todas as solicitações GET não encontradas - redireciona para o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: isProd ? 'Erro interno do servidor' : err.message,
        stack: isProd ? undefined : err.stack
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} em modo ${isProd ? 'produção' : 'desenvolvimento'}`);
});

// Tratamento para encerramento gracioso
process.on('SIGTERM', () => {
    console.log('SIGTERM recebido. Encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT recebido. Encerrando servidor...');
    process.exit(0);
});