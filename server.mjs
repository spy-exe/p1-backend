import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';  // Usando import

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Endpoint existente para cálculo de reações
app.post("/reacoes", (req, res) => {
    const { comprimento, forca, posicao } = req.body;

    if (!comprimento || !forca || !posicao) {
        return res.status(400).json({ error: "Preencha todos os campos!" });
    }

    // Cálculo das reações de apoio (Apoios simples)
    const Ra = forca * (comprimento - posicao) / comprimento;
    const Rb = forca * posicao / comprimento;

    // Geração dos diagramas (valores simulados para exemplo)
    let forcas = [];
    let momentos = [];

    for (let x = 0; x <= comprimento; x++) {
        let cortante = x < posicao ? Ra : Ra - forca;
        let momento = x < posicao ? Ra * x : Ra * x - forca * (x - posicao);
        forcas.push(cortante);
        momentos.push(momento);
    }

    res.json({ forcas, momentos });
});

// Endpoint para cálculo da Temperatura de Transição Vítrea
const MATERIAL_API_URL = 'https://api.materials.com/tg'; // Substitua pela URL real da API

app.post("/tg", async (req, res) => {
    const { material, formula } = req.body;  // material e fórmula para cálculo de Tg
    if (!material || !formula) {
        return res.status(400).json({ error: "Informe o material e a fórmula para cálculo!" });
    }

    try {
        const response = await fetch(MATERIAL_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ material, formula })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(404).json({ error: data.error });
        }

        // Supondo que a API retorna a temperatura de transição vítrea
        res.json({ tg: data.tg, descricao: data.descricao });
    } catch (error) {
        res.status(500).json({ error: "Erro ao calcular Tg do material." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://172.233.0.77:${PORT}`);
});
