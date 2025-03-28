async function calcular() {
    const comprimento = parseFloat(document.getElementById("comprimento").value);
    const forca = parseFloat(document.getElementById("forca").value);
    const posicao = parseFloat(document.getElementById("posicao").value);

    if (!comprimento || !forca || !posicao) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const response = await fetch("http://172.233.0.77:5000/reacoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comprimento, forca, posicao })
        });

        const data = await response.json();
        desenharGrafico(data.forcas, data.momentos);
    } catch (error) {
        alert("Erro de conexão com o servidor");
    }
}

function desenharGrafico(forcas, momentos) {
    const ctx = document.getElementById("grafico").getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: Array.from({ length: forcas.length }, (_, i) => i),
            datasets: [
                {
                    label: "Força Cortante (N)",
                    data: forcas,
                    borderColor: "blue",
                    fill: false
                },
                {
                    label: "Momento Fletor (Nm)",
                    data: momentos,
                    borderColor: "red",
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Posição (m)" } },
                y: { title: { display: true, text: "Valor" } }
            }
        }
    });
}
