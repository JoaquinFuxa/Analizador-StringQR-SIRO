document.addEventListener('DOMContentLoaded', function() {
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
    
        // Limpia clases previas
        toast.classList.remove('success', 'error', 'show');
    
        // Aplica clase según el tipo
        toast.classList.add(type, 'show');
    
        // Oculta después de 5 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }
     // Mostrar el botón solo si se hace scroll hacia abajo
    window.onscroll = function () {
      const btn = document.getElementById("scrollTopBtn");
      if (
        document.body.scrollTop > 200 ||
        document.documentElement.scrollTop > 200
      ) {
        btn.style.display = "block";
      } else {
        btn.style.display = "none";
      }
    };

    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    scrollTopBtn.addEventListener('click', function () {
        scrollToTop();
    });

    pasteBtn.addEventListener('click', function () {
    navigator.clipboard.readText()
        .then(text => {
            if (text) {
                qrStringInput.value = text;
                showToast('Texto pegado desde el portapapeles', 'success');
            } else {
                showToast('El portapapeles está vacío', 'error');
            }
        })
        .catch(err => {
            showToast('Error al pegar: ' + err, 'error');
        });
});
    
    copyBtn.addEventListener('click', function () {
        const text = qrStringInput.value;
        if (text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    showToast('Texto copiado al portapapeles', 'success');
                })
                .catch(err => {
                    showToast('Error al copiar: ' + err, 'error');
                });
        } else {
            showToast('No hay texto para copiar', 'error');
        }
    });

    const analyzeBtn = document.getElementById('analyzeBtn');
    const qrStringInput = document.getElementById('qrString');
    const resultsContainer = document.getElementById('results');

     // Variable global para conservar el estado de validación manual
    let manualValidationState = {
        node50Verified: false,
        node51Verified: false,
        node52Verified: false,
        node60Verified: false,
        node61Verified: false,
        node62Verified: false,
        node80Verified: false
    };

    
    // FUNCIÓN ADICIONAL: Limpiar el estado cuando se necesite (opcional)
    function resetManualValidationState() {
        manualValidationState.node50Verified = false;
        manualValidationState.node51Verified = false;
        manualValidationState.node52Verified = false;
        manualValidationState.node60Verified = false;
        manualValidationState.node61Verified = false;
        manualValidationState.node62Verified = false;
        manualValidationState.node80Verified = false;
        console.log("Estados reseteados")
    }

    limpiarString.addEventListener('click', function() {
        resetManualValidationState();
        document.getElementById('qrString').value = '';
        document.getElementById('results').innerHTML = '';
        document.getElementById('qrCode').innerHTML = '';
    });

    


    function generateQR(qrString) {
        const resultsContainer = document.getElementById('results'); // Asegúrate de que este contenedor existe
    
        // Crear contenedor principal similar a showInfo
        const resultItem = document.createElement('div');
        resultItem.className = 'positions-info';
    
        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.textContent = 'ℹ️ Código QR generado:';
    
        const qrContainer = document.createElement('div');
        qrContainer.id = 'qrCodeTemp';
    
        // Limpiar código QR previo si existe
        const existing = document.getElementById('qrCodeTemp');
        if (existing) existing.remove();
    
        // Agregar el título y el contenedor del QR
        resultItem.appendChild(resultTitle);
        resultItem.appendChild(qrContainer);
    
        // Crear el QR dentro del nuevo contenedor
        new QRCode(qrContainer, {
            text: qrString,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    
        // Agregar el contenedor al HTML
        resultsContainer.appendChild(resultItem);
    }
    

    // Definir posiciones fijas para cada nodo
    const nodePositions = {
        '00': { start: 0, length: 6 }, // Nodo 00: posición 0, longitud 6
        '01': { start: 6, length: 6 }, // Nodo 01: posición 6, longitud 6
        '41': { start: 12, length: 46 }, // Nodo 41: posición 12, longitud 58
        '50': { start: 58, length: 19 },  // Nodo 50: posición 70, longitud 19 (incluyendo CUIT)
        '51': { start: 77, length: 30 },   // Nodo 51: posición 77, longitud 30 (incluyendo CBU)
        '52': { start: 107, variable: true }, // Nodo 52: posición 107, longitud 8 (incluyendo MCC) LISTO
        '53': { start: null, variable: true  }, // Nodo 53: posición 115, longitud 7
        '58': { start: null, variable: true  }, // Nodo 58
        '59': { start: null, variable: true }, // Marcar como nodo de longitud variable
        '60': { start: null, variable: true }, // Nodo 60 también es variable
        '61': { start: null, variable: true }, // Nodo 61 también es variable
        '62': { start: null, variable: true }, // Nuevo nodo 62 (posición variable)
        '80': { start: null, variable: true }, // Nuevo nodo 80 (posición variable)
        '63': { start: null, variable: true } // Nuevo nodo 63 (posición variable)
    };

    
   

    // Iniciar analisis al ejecutar el botón
    analyzeBtn.addEventListener('click', function() {
        analyzeQRString();
    });

    // Validar nodo por nodo
    function analyzeQRString() {
        const qrString = qrStringInput.value.trim();
        resultsContainer.innerHTML = '';

        if (!qrString) {
            showError('General', 'Por favor ingrese un StringQR válido.');
            return;
        }

        let valid = true; // Flag general

        // Extraer los nodos por posición
        try {
            const nodes = extractNodesByPosition(qrString);
            

            // Validar nodo 00
            if (nodes.node00) {
                validateNode00(nodes.node00.content, nodes.node00.position);
            } else {
                valid = false;
                showError('Nodo 00', 'No se pudo extraer el nodo 00 (posición insuficiente).');
            }

            // Validar nodo 01
            if (nodes.node01) {
                validateNode01(nodes.node01.content, nodes.node01.position);
            } else {
                valid = false;
                showError('Nodo 01', 'No se pudo extraer el nodo 01 (posición insuficiente).');
            }

            // Validar nodo 41
            if (nodes.node41) {
                validateNode41(nodes.node41.content, nodes.node41.position);
            } else {
                valid = false;
                showError('Nodo 41', 'No se pudo extraer el nodo 41 (posición insuficiente).');
            }

            // Validar nodo 50
            if (nodes.node50) {
                validateNode50(nodes.node50.content, nodes.node50.position);
            } else {
                valid = false;
                showError('Nodo 50', 'No se pudo extraer el nodo 50 (posición insuficiente).');
            }

            // Validar nodo 51
            if (nodes.node51) {
                validateNode51(nodes.node51.content, nodes.node51.position);
            } else {
                valid = false;
                showError('Nodo 51', 'No se pudo extraer el nodo 51 (posición insuficiente).');
            }

                // Validar nodo 52
            if (nodes.node52) {
                validateNode52(qrString, nodes.node52.position);
            } else {
                valid = false;
                showError('Nodo 52', 'No se pudo extraer el nodo 52 (posición insuficiente).');
            }

            // Validar nodo 53
            if (nodes.node53) {
                validateNode53(qrString, nodes.node53.position);
            } else {
                valid = false;
                showError('Nodo 53', 'No se pudo extraer el nodo 53 (posición insuficiente).');
            }

            // Validar nodo 58
            if (nodes.node58) {
                validateNode58(qrString, nodes.node58.position);
            } else {
                valid = false;
                showError('Nodo 58', 'No se pudo extraer el nodo 58 (posición insuficiente).');
            }

            // Validar nodo 59
            if (nodes.node59) {
                validateNode59(qrString, nodes.node59.position);
            } else {
                valid = false;
                showError('Nodo 59', 'No se pudo extraer el nodo 59 (posición insuficiente).');
            }


            // Validar nodo 60
            if (nodes.node60) {
                validateNode60(qrString, nodes.node60.position);
            } else {
                valid = false;
                showError('Nodo 60', 'No se pudo extraer el nodo 60 (posición insuficiente).');
            }

            // Validar nodo 61
            if (nodes.node61) {
                validateNode61(qrString, nodes.node61.position);
            } else {
                valid = false;
                showError('Nodo 61', 'No se pudo extraer el nodo 61 (posición insuficiente).');
            }

            // Validar nodo 62
            if (nodes.node62) {
                validateNode62(qrString, nodes.node62.position);
            } else {
                valid = false;
                showError('Nodo 62', 'No se pudo extraer el nodo 62 (posición insuficiente).');
            }

            // Validar nodo 80
            if (nodes.node80) {
                validateNode80(qrString, nodes.node80.position, nodes.node62);
            } else {
                showInfo('Nodo 80', 'No esta presente el nodo 80. Verificar que el comprobante del nodo 62 este cargado en SIRO');
            }

            // Validar nodo 63
            if (nodes.node63) {
                validateNode63(qrString, nodes.node63.position);
            } else {
                valid = false;
                showError('Nodo 63', 'No se pudo extraer el nodo 63 (posición insuficiente).');
            }

        } catch (error) {
            showError('Error de análisis', error.message);

        }

        
        // Si todo fue válido, se genera la imagen QR
        if (valid) {
            generateQR(qrString);
            validarQRAPI(qrString);
        }
    }

    // Extraer y formar cada nodo
    function extractNodesByPosition(qrString) {
        const nodes = {};

         // Definir un orden específico para procesar los nodos
        // Es crucial procesar primero los nodos fijos y luego los variables en orden de dependencia
        const processingOrder = ['00', '01', '41', '50', '51', '52', '53', '58', '59', '60', '61', '62', '80', '63'];

        console.log("Orden de procesamiento de nodos:", processingOrder);

        // Procesar nodos en el orden específico
        for (const nodeId of processingOrder) {
            console.log(`Procesando nodo ${nodeId}...`);
            const position = nodePositions[nodeId];

            if (!position) {
                console.log(`No se encontró configuración para el nodo ${nodeId}`);
                continue;
            }

        const { start, length, variable } = position;

            // Si es el nodo 60, su posición depende de dónde termine el nodo 59
        if (nodeId === '60') {
            // Solo calculamos si tenemos el nodo 59
            if (nodes.node59) {
                // La posición inicial del nodo 60 es donde termina el nodo 59
                const node59End = nodes.node59.position.start + 4; // Prefijo "59xx"
                const node59Length = parseInt(qrString.substring(nodes.node59.position.start + 2, nodes.node59.position.start + 4), 10);
                const node60Start = node59End + node59Length;

                // Si hay suficientes caracteres para al menos leer el encabezado del nodo 60
                if (node60Start + 4 <= qrString.length) {
                    nodes[`node${nodeId}`] = {
                        content: qrString.substring(node60Start),
                        position: { start: node60Start }
                    };
                }
            }
            continue; // Pasamos al siguiente nodo
        }

            // Si es el nodo 61, su posición depende de dónde termine el nodo 60
        if (nodeId === '61') {
            // Solo calculamos si tenemos el nodo 60
            if (nodes.node60) {
                // La posición inicial del nodo 61 es donde termina el nodo 60
                const node60End = nodes.node60.position.start + 4; // Prefijo "60xx"
                const node60Length = parseInt(qrString.substring(nodes.node60.position.start + 2, nodes.node60.position.start + 4), 10);
                const node61Start = node60End + node60Length;


                // Si hay suficientes caracteres para al menos leer el encabezado del nodo 60
                if (node61Start + 4 <= qrString.length) {
                    nodes[`node${nodeId}`] = {
                        content: qrString.substring(node61Start),
                        position: { start: node61Start },
                    };
                }

            }
            continue; // Pasamos al siguiente nodo
        }

        if (nodeId === '62') {
            // Solo calculamos si tenemos el nodo 61
            if (nodes.node61) {
                // La posición inicial del nodo 62 es donde termina el nodo 61
                const node61End = nodes.node61.position.start + 4; // Prefijo "61xx"
                const node61Length = parseInt(qrString.substring(nodes.node61.position.start + 2, nodes.node61.position.start + 4), 10);
                const node62Start = node61End + node61Length;

                // Si hay suficientes caracteres para al menos leer el encabezado del nodo 62
                if (node62Start + 4 <= qrString.length) {
                    nodes[`node${nodeId}`] = {
                        content: qrString.substring(node62Start),
                        position: { start: node62Start }
                    };
                }
            }
            continue; // Pasamos al siguiente nodo
        }


             // Si es un nodo de longitud variable (como el nodo 52)
            if (nodeId === '52') {
                // Solo obtenemos la posición de inicio, la validación específica
                // se realizará en la función validateNode52
                if (start < qrString.length) {
                    nodes[`node${nodeId}`] = {
                        content: qrString.substring(start), // Todo el contenido restante
                        position: { start }
                    };
                }
            }

            if (nodeId === '53') {
            // Solo calculamos si tenemos el nodo 52
            if (nodes.node52) {
                // La posición inicial del nodo 53 es donde termina el nodo 52
                const node52End = nodes.node52.position.start + 4; // Prefijo "52xx"
                const node52Length = parseInt(qrString.substring(nodes.node52.position.start + 2, nodes.node52.position.start + 4), 10);
                const node53Start = node52End + node52Length;

                // Si hay suficientes caracteres para al menos leer el encabezado del nodo 62
                if (node53Start + 4 <= qrString.length) {
                    nodes[`node${nodeId}`] = {
                        content: qrString.substring(node53Start),
                        position: { start: node53Start }
                    };
                }
            }
            continue; // Pasamos al siguiente nodo
        }

        if (nodeId === '58') {
            // Solo calculamos si tenemos el nodo 53
            if (nodes.node53) {
                // La posición inicial del nodo 58 es donde termina el nodo 53
                const node53End = nodes.node53.position.start + 4; // Prefijo "53xx"
                const node53Length = parseInt(qrString.substring(nodes.node53.position.start + 2, nodes.node53.position.start + 4), 10);
                const node58Start = node53End + node53Length;

                // Si hay suficientes caracteres para al menos leer el encabezado del nodo 62
                if (node58Start + 4 <= qrString.length) {
                    nodes[`node${nodeId}`] = {
                        content: qrString.substring(node58Start),
                        position: { start: node58Start }
                    };
                }
            }
            continue; // Pasamos al siguiente nodo
        }

        if (nodeId === '59') {
            // Solo calculamos si tenemos el nodo 58
            if (nodes.node58) {
                // La posición inicial del nodo 59 es donde termina el nodo 58
                const node58End = nodes.node58.position.start + 4; // Prefijo "58xx"
                const node58Length = parseInt(qrString.substring(nodes.node58.position.start + 2, nodes.node58.position.start + 4), 10);
                const node59Start = node58End + node58Length;

                // Si hay suficientes caracteres para al menos leer el encabezado del nodo 62
                if (node59Start + 4 <= qrString.length) {
                    nodes[`node${nodeId}`] = {
                        content: qrString.substring(node59Start),
                        position: { start: node59Start }
                    };
                }
            }
            continue; // Pasamos al siguiente nodo
        }


                // Agregar el nodo 63 que depende de dónde termina el nodo 80 o el nodo 62
        if (nodeId === '63') {
            let node63Start;

            // Primero verificamos si existe el nodo 80
            if (nodes.node80) {
                // Si existe el nodo 80, calculamos donde termina para obtener la posición del nodo 63
                const node80End = nodes.node80.position.start + 4; // Prefijo "80xx"
                const node80Length = parseInt(qrString.substring(nodes.node80.position.start + 2, nodes.node80.position.start + 4), 10);
                node63Start = node80End + node80Length;
            }
            // Si no existe el nodo 80, verificamos si existe el nodo 62
            else if (nodes.node62) {
                // La posición inicial del nodo 63 es donde termina el nodo 62
                const node62End = nodes.node62.position.start + 4; // Prefijo "62xx"
                const node62Length = parseInt(qrString.substring(nodes.node62.position.start + 2, nodes.node62.position.start + 4), 10);
                node63Start = node62End + node62Length;
            }
            // Si se pudo calcular la posición inicial del nodo 63
            if (node63Start && node63Start + 4 <= qrString.length) {
                nodes[`node${nodeId}`] = {
                    content: qrString.substring(node63Start),
                    position: { start: node63Start }
                };
            }
            continue; // Pasamos al siguiente nodo
        }


             // Agregar el nodo 80 que depende de dónde termina el nodo 62
        if (nodeId === '80') {
            // Solo calculamos si tenemos el nodo 62
            if (nodes.node62) {
                // La posición inicial del nodo 80 es donde termina el nodo 62
                const node62End = nodes.node62.position.start + 4; // Prefijo "62xx"
                const node62Length = parseInt(qrString.substring(nodes.node62.position.start + 2, nodes.node62.position.start + 4), 10);
                const node80Start = node62End + node62Length;

                // Si hay suficientes caracteres para al menos leer el encabezado del nodo 80
                if (node80Start + 4 <= qrString.length) {
                    // Verificar si comienza con 6304 (no es nodo 80)
                    const potentialNode80Content = qrString.substring(node80Start);
                    if (potentialNode80Content.substring(0, 4) === '6304') {
                        // Si comienza con 6304, no agregamos nodo 80 al array nodes
                        console.log("Encontrado '6304' en posición de nodo 80, no es un nodo 80 válido");

                    } else {
                        // Si no comienza con 6304, agregamos el nodo 80 normalmente
                        nodes[`node${nodeId}`] = {
                            content: potentialNode80Content,
                            position: { start: node80Start }
                        };
                    }
                }
            }
            continue; // Pasamos al siguiente nodo
        }

                // Para nodos de longitud fija
                else if (start + length <= qrString.length) {
                    const nodeContent = qrString.substring(start, start + length);
                    nodes[`node${nodeId}`] = {
                        content: nodeContent,
                        position: { start, end: start + length - 1 }
                    };
                }
            }

        return nodes;
    }
//----------------------------------------------------------
    // VALIDACION NODO 00 (FIJO)
    function validateNode00(nodeContent, position) {
        const expectedPrefix = '000201';

        if (nodeContent === expectedPrefix) {
            showSuccess('Nodo 00', `El nodo tiene el valor correcto: ${expectedPrefix}`, nodeContent, position);
        } else {
            showError('Nodo 00', `El nodo debe ser ${expectedPrefix}, pero es ${nodeContent}`, nodeContent, position);
        }
    }
//----------------------------------------------------------
    // VALIDACION NODO 01 (FIJO)
    function validateNode01(nodeContent, position) {
        const expectedPrefix = '010211';

        if (nodeContent === expectedPrefix) {
            showSuccess('Nodo 01', `El nodo tiene el valor correcto: ${expectedPrefix}`, nodeContent, position);
        } else {
            showError('Nodo 01', `El nodo debe ser ${expectedPrefix}, pero es ${nodeContent}`, nodeContent, position);
        }
    }
//----------------------------------------------------------
    // VALIDACION NODO 41 (FIJO)
    function validateNode41(nodeContent, position) {
        const expectedPrefix = '41420017ar.com.bancoroela981130598910045990201';

        if (nodeContent === expectedPrefix) {
            showSuccess('Nodo 41', `El nodo tiene el valor correcto`, nodeContent, position);
        } else {
            showError('Nodo 41', `El nodo no tiene el valor esperado`, nodeContent, position);
        }
    }
//----------------------------------------------------------
    // VALIDACION NODO 50 (CUIT VARIABLE)
    function validateNode50(nodeContent, position) {
        // El nodo 50 debe tener el formato correcto
        if (!nodeContent.startsWith('50150011')) {
            showError('Nodo 50', `El nodo debe comenzar con 50150011`, nodeContent, position);
            return;
        }

        // Extraer el CUIT que comienza después de "50150011"
        const cuit = nodeContent.substring(8, 20);

        // Verificar que el CUIT tenga 11 dígitos y sean todos números
        if (cuit.length !== 11 || !/^\d{11}$/.test(cuit)) {
            showError('Nodo 50', `El CUIT debe ser un número de 11 dígitos, pero se encontró: ${cuit}`, nodeContent, position);
            return;
        }


        // Mostrar advertencia (amarillo) porque el CUIT requiere verificación manual
        showCuitWarning(nodeContent, cuit, position);
    }

    // VISUALIZACION Y MODIFICACION DE CUIT (Relacion a nodo 50)
    function showCuitWarning(nodeContent, cuit, position) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item warning';
        resultItem.id = 'node50-result'; // Para poder actualizarlo más tarde

        // Determinar el estado inicial basado en la validación manual previa
        const isManuallyVerified = manualValidationState.node50Verified;
        resultItem.className = isManuallyVerified ? 'result-item success' : 'result-item warning';
        resultItem.id = 'node50-result';

        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = isManuallyVerified 
            ? '✅ Nodo 50: CUIT verificado manualmente'
            : '⚠️ Nodo 50: CUIT requiere verificación manual';

        const resultMessage = document.createElement('div');
        resultMessage.innerHTML = `<strong>CUIT encontrado:</strong> <span id="displayed-cuit">${cuit}</span>`;

        // Agregar capa de edición del CUIT
        const editCuitDiv = document.createElement('div');
        editCuitDiv.className = 'edit-cuit';
        editCuitDiv.style.display = 'none'; // Inicialmente oculto
        editCuitDiv.innerHTML = `
            <input type="text" id="edit-cuit-input" value="${cuit}" placeholder="XXXXXXXXXXX" maxlength="11">
            <button id="save-cuit-btn">Guardar</button>
            <button id="cancel-cuit-btn">Cancelar</button>
        `;

        // Ícono de edición
        const editIcon = document.createElement('span');
        editIcon.innerHTML = ' ✏️';
        editIcon.className = 'edit-icon';
        editIcon.title = 'Editar CUIT';

        // Agregar el ícono al mensaje
        resultMessage.querySelector('span').appendChild(editIcon);

        // Checkbox para validación manual
        const manualValidationDiv = document.createElement('div');
        manualValidationDiv.className = 'manual-validation';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'manual-validation-checkbox';
        checkbox.checked = isManuallyVerified; // Restaurar el estado previo

        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', 'manual-validation-checkbox');
        checkboxLabel.textContent = 'Verificado manualmente';

        manualValidationDiv.appendChild(checkbox);
        manualValidationDiv.appendChild(checkboxLabel);

        // Área para mostrar el contenido del nodo
        const nodeDetails = document.createElement('div');
        nodeDetails.className = 'node-details';

        const positionText = document.createElement('div');
        positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.end}`;

        const nodeContentElem = document.createElement('div');
        nodeContentElem.className = 'node-content';
        nodeContentElem.textContent = nodeContent;
        nodeContentElem.id = 'node50-content';

        nodeDetails.appendChild(positionText);
        nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
        nodeDetails.appendChild(nodeContentElem);

        // Armar el resultado
        resultItem.appendChild(resultTitle);
        resultItem.appendChild(resultMessage);
        resultItem.appendChild(editCuitDiv);
        resultItem.appendChild(manualValidationDiv);
        resultItem.appendChild(nodeDetails);

        // Agregar al contenedor de resultados
        resultsContainer.appendChild(resultItem);

        // Asociar eventos a los elementos creados
        setupCuitEditEvents(cuit, position);
    }

    function setupCuitEditEvents(originalCuit, position) {
        // Referencias a elementos
        const editIcon = document.querySelector('.edit-icon');
        const editCuitDiv = document.querySelector('.edit-cuit');
        const saveCuitBtn = document.getElementById('save-cuit-btn');
        const cancelCuitBtn = document.getElementById('cancel-cuit-btn');
        const editCuitInput = document.getElementById('edit-cuit-input');
        const displayedCuit = document.getElementById('displayed-cuit');
        const manualCheckbox = document.getElementById('manual-validation-checkbox');
        const resultItem = document.getElementById('node50-result');

        // Evento para mostrar el editor
        editIcon.addEventListener('click', function() {
            editCuitDiv.style.display = 'flex';
        });

        // Evento para cancelar la edición
        cancelCuitBtn.addEventListener('click', function() {
            editCuitDiv.style.display = 'none';
        });

        // Evento para guardar el CUIT editado
        saveCuitBtn.addEventListener('click', function() {
            const newFormattedCuit = editCuitInput.value.trim();

            // Verificar formato básico (con guiones)
            const cuitPattern = /^\d{11}$/;
            if (!cuitPattern.test(newFormattedCuit)) {
                alert('El formato del CUIT debe ser 11 dígitos numéricos');
                return;
            }

            // Actualizar el CUIT mostrado
            displayedCuit.textContent = newFormattedCuit;
            editCuitDiv.style.display = 'none';

             // 🔁 Volver a insertar el ícono de edición
            const newEditIcon = document.createElement('span');
            newEditIcon.innerHTML = ' ✏️';
            newEditIcon.className = 'edit-icon';
            newEditIcon.title = 'Editar CUIT';

            displayedCuit.appendChild(newEditIcon);
            // 🔁 Reasociar evento al nuevo ícono
            newEditIcon.addEventListener('click', function () {
                editCuitDiv.style.display = 'flex';
            });

            // Actualizar el string QR en el input principal
            updateQRStringWithNewCuit(originalCuit, newFormattedCuit, position);
        });

        // Evento para el checkbox de validación manual
        manualCheckbox.addEventListener('change', function() {
            // GUARDAR EL ESTADO EN LA VARIABLE GLOBAL
            manualValidationState.node50Verified = this.checked;
            if (this.checked) {
                resultItem.className = 'result-item success';
                resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 50: CUIT verificado manualmente';
            } else {
                resultItem.className = 'result-item warning';
                resultItem.querySelector('.result-title').innerHTML = '⚠️ Nodo 50: CUIT requiere verificación manual';
            }
        });
    }

    function updateQRStringWithNewCuit(oldCuit, newCuit, position) {
        // Obtener el string QR actual
        let qrString = qrStringInput.value.trim();

        // Calcular la posición exacta del CUIT en el string QR
        const cuitPosition = position.start + 8; // La posición donde comienza el CUIT (después de "50150011")

        if (cuitPosition + oldCuit.length <= qrString.length) {
            // Reemplazar el CUIT en la posición exacta
            const newQrString =
                qrString.substring(0, cuitPosition) +
                newCuit +
                qrString.substring(cuitPosition + oldCuit.length);

            // Actualizar el input
            qrStringInput.value = newQrString;

            // Actualizar el contenido del nodo mostrado
            const nodeContent = document.getElementById('node50-content');
            if (nodeContent) {
                // Actualizar la presentación del nodo completo con el nuevo CUIT
                const prefix = nodeContent.textContent.substring(0, 8); // "501500112"
                const suffix = nodeContent.textContent.substring(8 + oldCuit.length); // Si hay algo después del CUIT
                nodeContent.textContent = prefix + newCuit + suffix;
            }
        } else {
            alert('No se pudo actualizar el CUIT en la posición exacta. El string QR es demasiado corto.');
        }
        // Volver a analizar el string QR
        analyzeQRString();
    }
//----------------------------------------------------------
    // VALIDACION NODO 51 (CBU VARIABLE)
    function validateNode51(nodeContent, position) {
        // El nodo 51 debe tener el formato correcto con el prefijo "5126"
        if (!nodeContent.startsWith('5126')) {
            showError('Nodo 51', `El nodo debe comenzar con 5126`, nodeContent, position);
            return;
        }

        // Extraer el CBU que comienza en la posición 8 (índice 8)
        const cbu = nodeContent.substring(8);

        // Verificar que el CBU tenga 22 dígitos y sean todos números
        if (cbu.length !== 22 || !/^\d{22}$/.test(cbu)) {
            showError('Nodo 51', `El CBU debe ser un número de 22 dígitos, pero se encontró: ${cbu}`, nodeContent, position);
            return;
        }


        // Mostrar advertencia (amarillo) porque el CBU requiere verificación manual
        showCbuWarning(nodeContent, cbu, position);
    }


    // VISUALIZACION Y MODIFICACION DE CBU (Relacion a nodo 51)
    function showCbuWarning(nodeContent, cbu, position) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item warning';
        resultItem.id = 'node51-result'; // Para poder actualizarlo más tarde

        // Determinar el estado inicial basado en la validación manual previa
        const isManuallyVerified = manualValidationState.node51Verified;
        resultItem.className = isManuallyVerified ? 'result-item success' : 'result-item warning';
        resultItem.id = 'node51-result';

        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = isManuallyVerified 
            ? '✅ Nodo 51: CBU verificado manualmente'
            : '⚠️ Nodo 51: CBU requiere verificación manual';

        const resultMessage = document.createElement('div');
        resultMessage.innerHTML = `<strong>CBU encontrado:</strong> <span id="displayed-cbu">${cbu}</span>`;

        // Agregar capa de edición del CBU
        const editCbuDiv = document.createElement('div');
        editCbuDiv.className = 'edit-cbu';
        editCbuDiv.style.display = 'none'; // Inicialmente oculto
        editCbuDiv.innerHTML = `
            <input type="text" id="edit-cbu-input" value="${cbu}" placeholder="XXXXXXXXXXXXXXXXXXXXXX" maxlength="22">
            <button id="save-cbu-btn">Guardar</button>
            <button id="cancel-cbu-btn">Cancelar</button>
        `;

        // Ícono de edición
        const editIcon = document.createElement('span');
        editIcon.innerHTML = ' ✏️';
        editIcon.className = 'edit-icon';
        editIcon.title = 'Editar CBU';

        // Agregar el ícono al mensaje
        resultMessage.querySelector('span').appendChild(editIcon);

        // Checkbox para validación manual
        const manualValidationDiv = document.createElement('div');
        manualValidationDiv.className = 'manual-validation';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'manual-validation-checkbox-cbu';
        checkbox.checked = isManuallyVerified; // Restaurar el estado previo

        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', 'manual-validation-checkbox-cbu');
        checkboxLabel.textContent = 'Verificado manualmente';

        manualValidationDiv.appendChild(checkbox);
        manualValidationDiv.appendChild(checkboxLabel);

        // Área para mostrar el contenido del nodo
        const nodeDetails = document.createElement('div');
        nodeDetails.className = 'node-details';

        const positionText = document.createElement('div');
        positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.end}`;

        const nodeContentElem = document.createElement('div');
        nodeContentElem.className = 'node-content';
        nodeContentElem.textContent = nodeContent;
        nodeContentElem.id = 'node51-content';

        nodeDetails.appendChild(positionText);
        nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
        nodeDetails.appendChild(nodeContentElem);

        // Armar el resultado
        resultItem.appendChild(resultTitle);
        resultItem.appendChild(resultMessage);
        resultItem.appendChild(editCbuDiv);
        resultItem.appendChild(manualValidationDiv);
        resultItem.appendChild(nodeDetails);

        // Agregar al contenedor de resultados
        resultsContainer.appendChild(resultItem);

        // Asociar eventos a los elementos creados
        setupCbuEditEvents(cbu, position);
    }


    function setupCbuEditEvents(originalCbu, position) {
        // Referencias a elementos del nodo 51 (CBU)
        const editIcon = document.querySelector('#node51-result .edit-icon');
        const editCbuDiv = document.querySelector('#node51-result .edit-cbu');
        const saveCbuBtn = document.getElementById('save-cbu-btn');
        const cancelCbuBtn = document.getElementById('cancel-cbu-btn');
        const editCbuInput = document.getElementById('edit-cbu-input');
        const displayedCbu = document.getElementById('displayed-cbu');
        const manualCheckbox = document.getElementById('manual-validation-checkbox-cbu');
        const resultItem = document.getElementById('node51-result');

        // Evento para mostrar el editor
        editIcon.addEventListener('click', function() {
            editCbuDiv.style.display = 'flex';
        });

        // Evento para cancelar la edición
        cancelCbuBtn.addEventListener('click', function() {
            editCbuDiv.style.display = 'none';
        });

        // Evento para guardar el CBU editado
        saveCbuBtn.addEventListener('click', function() {
            const numericCbu = editCbuInput.value.trim();

            // Verificar que sea un número de 22 dígitos
            if (numericCbu.length !== 22 || !/^\d{22}$/.test(numericCbu)) {
                alert('El CBU debe contener exactamente 22 dígitos numéricos');
                return;
            }

            // Actualizar el CBU mostrado con formato
            displayedCbu.textContent = numericCbu;
            editCbuDiv.style.display = 'none';

              // 🔁 Volver a insertar el ícono de edición
            const newEditIcon = document.createElement('span');
            newEditIcon.innerHTML = ' ✏️';
            newEditIcon.className = 'edit-icon';
            newEditIcon.title = 'Editar CBU';

            displayedCbu.appendChild(newEditIcon);
            // 🔁 Reasociar evento al nuevo ícono
            newEditIcon.addEventListener('click', function () {
                editCbuDiv.style.display = 'flex';
            });


            // Actualizar el string QR en el input principal
            updateQRStringWithNewCbu(originalCbu, numericCbu, position);
        });

        // Evento para el checkbox de validación manual
        manualCheckbox.addEventListener('change', function() {
            // GUARDAR EL ESTADO EN LA VARIABLE GLOBAL
            manualValidationState.node51Verified = this.checked;
            if (this.checked) {
                resultItem.className = 'result-item success';
                resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 51: CBU verificado manualmente';
            } else {
                resultItem.className = 'result-item warning';
                resultItem.querySelector('.result-title').innerHTML = '⚠️ Nodo 51: CBU requiere verificación manual';
            }
        });
    }

    function updateQRStringWithNewCbu(oldCbu, newCbu, position) {
    const qrStringInput = document.getElementById('qrString');
    let currentQrString = qrStringInput.value.trim();

    // Validar que el nuevo CBU tenga exactamente 22 dígitos numéricos
    if (!/^\d{22}$/.test(newCbu)) {
        alert('El CBU debe contener exactamente 22 dígitos numéricos.');
        return;
    }

    // El nodo 51 comienza con "51260022", luego sigue el CBU (22 dígitos)
    const prefix = '51260022';
    const newNodeValue = prefix + newCbu;

    // Reemplazar el contenido del nodo 51 en la cadena QR
    const updatedQrString =
        currentQrString.substring(0, position.start) +
        newNodeValue +
        currentQrString.substring(position.end + 1);

    // Actualizar el campo de entrada con la nueva cadena QR
    qrStringInput.value = updatedQrString;

    const nodeContent = document.getElementById('node51-content');
    if (nodeContent) {
        nodeContent.textContent = newNodeValue;
    }
    // Volver a analizar el string QR
    analyzeQRString();
}
//----------------------------------------------------------
    // VALIDACION NODO 52 (MCC VARIABLE)
function validateNode52(qrString, position) {
    // Verificar que hay suficientes caracteres para al menos leer los 4 primeros caracteres del nodo
    if (qrString.length < position.start + 4) {
        showError('Nodo 52', `No hay suficientes caracteres para leer el nodo 52 completo`, "", { start: position.start, end: position.start + 3 });
        return;
    }

    // Obtener los primeros 4 caracteres del nodo
    const nodePrefix = qrString.substring(position.start, position.start + 2);
    const lengthIndicator = qrString.substring(position.start + 2, position.start + 4);

    // Verificar que el nodo comience con "52"
    if (nodePrefix !== "52") {
        showError('Nodo 52', `El nodo debe comenzar con 52, pero se encontró: ${nodePrefix}`,
                qrString.substring(position.start, position.start + 4),
                { start: position.start, end: position.start + 3 });
        return;
    }

    // Verificar que el indicador de longitud sea numérico
    if (!/^\d{2}$/.test(lengthIndicator)) {
        showError('Nodo 52', `El indicador de longitud debe ser numérico de 2 dígitos, pero se encontró: ${lengthIndicator}`,
                qrString.substring(position.start, position.start + 4),
                { start: position.start, end: position.start + 3 });
        return;
    }

    // Convertir el indicador de longitud a número
    const contentLength = parseInt(lengthIndicator, 10);

    // Verificar que la longitud sea un valor válido (entre 3 y 4 para MCC)
    if (contentLength < 3 || contentLength > 4) {
        showError('Nodo 52', `La longitud indicada para MCC debe ser 03 o 04, pero se encontró: ${contentLength}`,
                qrString.substring(position.start, position.start + 4),
                { start: position.start, end: position.start + 3 });
        return;
    }

    // Verificar que haya suficientes caracteres para el contenido
    if (qrString.length < position.start + 4 + contentLength) {
        showError('Nodo 52', `La longitud indicada es ${contentLength}, pero no hay suficientes caracteres en el StringQR`,
                qrString.substring(position.start, position.start + 4 + Math.min(contentLength, qrString.length - position.start - 4)),
                { start: position.start, end: position.start + 3 + Math.min(contentLength, qrString.length - position.start - 4) });
        return;
    }

    // Obtener el contenido del MCC
    const mcc = qrString.substring(position.start + 4, position.start + 4 + contentLength);

    // Verificar que el MCC sea numérico
    if (!/^\d+$/.test(mcc)) {
        showError('Nodo 52', `El MCC debe ser numérico, pero se encontró: ${mcc}`,
                qrString.substring(position.start, position.start + 4 + contentLength),
                { start: position.start, end: position.start + 3 + contentLength });
        return;
    }

    // Calcular la posición final real del nodo
    const endPosition = position.start + 3 + contentLength;

    // Mostrar advertencia (amarillo) porque el MCC requiere verificación manual
    showMccWarning(
        qrString.substring(position.start, position.start + 4 + contentLength),
        nodePrefix,
        lengthIndicator,
        mcc,
        { start: position.start, end: endPosition }
    );
}

// VISUALIZACION Y MODIFICACION DE MCC (Relacion a nodo 52)
function showMccWarning(nodeContent, prefix, lengthIndicator, mcc, position) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item warning';
    resultItem.id = 'node52-result';

    // Determinar el estado inicial basado en la validación manual previa
    const isManuallyVerified = manualValidationState.node52Verified;
    resultItem.className = isManuallyVerified ? 'result-item success' : 'result-item warning';
    resultItem.id = 'node52-result';

    const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = isManuallyVerified 
            ? '✅ Nodo 52: MCC verificado manualmente'
            : '⚠️ Nodo 52: MCC requiere verificación manual';

    const resultMessage = document.createElement('div');
    resultMessage.innerHTML = `
        <strong>Prefijo:</strong> ${prefix}<br>
        <strong>Indicador de longitud:</strong> ${lengthIndicator} (${parseInt(lengthIndicator, 10)} caracteres)<br>
        <strong>MCC:</strong> <span id="displayed-mcc">${mcc}</span>
    `;

    // Agregar capa de edición del MCC
    const editMccDiv = document.createElement('div');
    editMccDiv.className = 'edit-mcc'; 
    editMccDiv.style.display = 'none'; // Inicialmente oculto
    editMccDiv.innerHTML = `
        <input type="text" id="edit-mcc-input" value="${mcc}" placeholder="MCC (3-4 dígitos)" maxlength="4">
        <button id="save-mcc-btn">Guardar</button>
        <button id="cancel-mcc-btn">Cancelar</button>
    `;

    // Ícono de edición
    const editIcon = document.createElement('span');
    editIcon.innerHTML = ' ✏️';
    editIcon.className = 'edit-icon';
    editIcon.title = 'Editar MCC';

    // Agregar el ícono al mensaje
    const mccSpan = resultMessage.querySelector('#displayed-mcc');
    if (mccSpan) {
        mccSpan.appendChild(editIcon);
    }

    // Checkbox para validación manual
    const manualValidationDiv = document.createElement('div');
    manualValidationDiv.className = 'manual-validation';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'manual-validation-checkbox-mcc';
    checkbox.checked = isManuallyVerified; // Restaurar el estado previo

    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', 'manual-validation-checkbox-mcc');
    checkboxLabel.textContent = 'Verificado manualmente';

    manualValidationDiv.appendChild(checkbox);
    manualValidationDiv.appendChild(checkboxLabel);

    // Área para mostrar el contenido del nodo
    const nodeDetails = document.createElement('div');
    nodeDetails.className = 'node-details';

    const positionText = document.createElement('div');
    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.end}`;

    const nodeContentElem = document.createElement('div');
    nodeContentElem.className = 'node-content';
    nodeContentElem.textContent = nodeContent;
    nodeContentElem.id = 'node52-content';

    nodeDetails.appendChild(positionText);
    nodeDetails.appendChild(document.createTextNode('Contenido del nodo completo:'));
    nodeDetails.appendChild(nodeContentElem);

    // Armar el resultado
    resultItem.appendChild(resultTitle);
    resultItem.appendChild(resultMessage);
    resultItem.appendChild(editMccDiv);
    resultItem.appendChild(manualValidationDiv);
    resultItem.appendChild(nodeDetails);

    // Agregar al contenedor de resultados
    resultsContainer.appendChild(resultItem);

    // Asociar eventos a los elementos creados
    setupMccEditEvents(mcc, position, lengthIndicator);
}

function setupMccEditEvents(originalMcc, position, originalLengthIndicator) {
    // Referencias a elementos
    const editIcon = document.querySelector('#node52-result .edit-icon');
    const editMccDiv = document.querySelector('#node52-result .edit-mcc');
    const saveMccBtn = document.getElementById('save-mcc-btn');
    const cancelMccBtn = document.getElementById('cancel-mcc-btn');
    const editMccInput = document.getElementById('edit-mcc-input');
    const displayedMcc = document.getElementById('displayed-mcc');
    const manualCheckbox = document.getElementById('manual-validation-checkbox-mcc');
    const resultItem = document.getElementById('node52-result');

    // Evento para mostrar el editor
    editIcon.addEventListener('click', function() {
        editMccDiv.style.display = 'flex';
    });

    // Evento para cancelar la edición
    cancelMccBtn.addEventListener('click', function() {
        editMccDiv.style.display = 'none';
    });

    // Evento para guardar el MCC editado
    saveMccBtn.addEventListener('click', function() {
        const newMcc = editMccInput.value.trim();

        // Verificar que sea un número
        if (!/^\d+$/.test(newMcc)) {
            alert('El MCC debe contener solo dígitos numéricos');
            return;
        }

        // Verificar que la longitud sea 3 o 4 dígitos
        if (newMcc.length < 3 || newMcc.length > 4) {
            alert('El MCC debe contener 3 o 4 dígitos numéricos');
            return;
        }

        // Actualizar el MCC mostrado
        if (displayedMcc) {
            // Conservar solo el texto, sin el ícono de edición
            const editIconElement = displayedMcc.querySelector('.edit-icon');
            displayedMcc.textContent = newMcc;
            if (editIconElement) {
                displayedMcc.appendChild(editIconElement);
            }
        }

        editMccDiv.style.display = 'none';

        // Actualizar el string QR en el input principal
        updateQRStringWithNewMcc(originalMcc, newMcc, position, originalLengthIndicator);
    });

    // Evento para el checkbox de validación manual
    manualCheckbox.addEventListener('change', function() {
        // GUARDAR EL ESTADO EN LA VARIABLE GLOBAL
        manualValidationState.node52Verified = this.checked;
        if (this.checked) {
            resultItem.className = 'result-item success';
            resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 52: MCC verificado manualmente';
        } else {
            resultItem.className = 'result-item warning';
            resultItem.querySelector('.result-title').innerHTML = '⚠️ Nodo 52: MCC requiere verificación manual';
        }
    });
}

function updateQRStringWithNewMcc(oldMcc, newMcc, position, originalLengthIndicator) {
    const qrStringInput = document.getElementById('qrString');
    let currentQrString = qrStringInput.value.trim();

    // Validar que el nuevo MCC tenga 3 o 4 dígitos numéricos
    if (!/^\d{3,4}$/.test(newMcc)) {
        alert('El MCC debe contener 3 o 4 dígitos numéricos.');
        return;
    }

    // Generar el nuevo indicador de longitud (dos dígitos)
    const newLengthIndicator = newMcc.length.toString().padStart(2, '0');

    // Verificar que la longitud sea válida (03 o 04)
    if (newMcc.length < 3 || newMcc.length > 4) {
        alert(`La longitud del MCC debe ser 3 o 4 dígitos. Longitud actual: ${newMcc.length}`);
        return;
    }

    // Calcular la posición donde empieza el nodo 52
    const nodeStartPosition = position.start;

    // Crear el nuevo nodo 52 completo
    const newNode52 = "52" + newLengthIndicator + newMcc;

    // Calcular la longitud del nodo 52 original
    const originalNode52Length = 4 + parseInt(originalLengthIndicator, 10); // 2 (prefijo) + 2 (longitud) + contenido original

    // Encontrar los nodos que siguen al nodo 52 (si existen)
    const remainingString = currentQrString.substring(nodeStartPosition + originalNode52Length);

    // Actualizar el StringQR reemplazando el nodo 52 original por el nuevo
    const updatedQrString =
        currentQrString.substring(0, nodeStartPosition) +
        newNode52 +
        remainingString;

    // Actualizar el input con el nuevo StringQR
    qrStringInput.value = updatedQrString;

    // Actualizar el elemento que muestra el nodo completo
    const nodeContentElem = document.getElementById('node52-content');
    if (nodeContentElem) {
        nodeContentElem.textContent = newNode52;
    }

    // Actualizar la información de posición
    const positionText = document.querySelector('#node52-result .node-details strong').parentElement;
    if (positionText) {
        const newEndPosition = position.start + newNode52.length - 1;
        positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${newEndPosition}`;
    }

    // Actualizar el indicador de longitud mostrado en la UI
    const contentInfoElement = document.querySelector('#node52-result strong:nth-of-type(2)');
    if (contentInfoElement) {
        contentInfoElement.nextSibling.textContent = ` ${newLengthIndicator} (${parseInt(newLengthIndicator, 10)} caracteres)`;
    }
    
    // Volver a analizar el string QR
    analyzeQRString();
}
//----------------------------------------------------------
    // VALIDACION NODO 53 (FIJO)
    function validateNode53(qrString, position) {
        const expectedPrefix = '5303032';
        const nodeContent = qrString.substring(position.start, position.start + 7);


        if (nodeContent === expectedPrefix) {
            showSuccess('Nodo 53', `El nodo tiene el valor correcto`, nodeContent, position);
        } else {
            showError('Nodo 53', `El nodo no tiene el valor esperado`, nodeContent, position);
        }
    }
//----------------------------------------------------------
    // VALIDACION NODO 58 (FIJO)
    function validateNode58(qrString, position) {
        const expectedPrefix = '5802AR';
        const nodeContent = qrString.substring(position.start, position.start + 6);
        

        if (nodeContent === expectedPrefix) {
            showSuccess('Nodo 58', `El nodo tiene el valor correcto`, nodeContent, position);
        } else {
            showError('Nodo 58', `El nodo no tiene el valor esperado`, nodeContent, position);
        }
    }
//----------------------------------------------------------
    // VALIDACION NODO 59 (LONGITUD VARIABLE)
    function validateNode59(qrString, position) {
        // Verificar que hay suficientes caracteres para al menos leer los 4 primeros caracteres del nodo
        if (qrString.length < position.start + 4) {
            showError('Nodo 59', `No hay suficientes caracteres para leer el nodo 59 completo`, "", { start: position.start, end: position.start + 3 });
            return;
        }

        // Obtener los primeros 4 caracteres del nodo
        const nodePrefix = qrString.substring(position.start, position.start + 2);
        const lengthIndicator = qrString.substring(position.start + 2, position.start + 4);

        // Verificar que el nodo comience con "59"
        if (nodePrefix !== "59") {
            showError('Nodo 59', `El nodo debe comenzar con 59, pero se encontró: ${nodePrefix}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Verificar que el indicador de longitud sea numérico
        if (!/^\d{2}$/.test(lengthIndicator)) {
            showError('Nodo 59', `El indicador de longitud debe ser numérico de 2 dígitos, pero se encontró: ${lengthIndicator}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Convertir el indicador de longitud a número
        const contentLength = parseInt(lengthIndicator, 10);

        // Verificar que la longitud sea un valor válido (entre 1 y 99)
        if (contentLength < 1 || contentLength > 99) {
            showError('Nodo 59', `La longitud indicada debe estar entre 01 y 99, pero se encontró: ${contentLength}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Verificar que haya suficientes caracteres para el contenido
        if (qrString.length < position.start + 4 + contentLength) {
            showError('Nodo 59', `La longitud indicada es ${contentLength}, pero no hay suficientes caracteres en el StringQR`,
                    qrString.substring(position.start, position.start + 4 + Math.min(contentLength, qrString.length - position.start - 4)),
                    { start: position.start, end: position.start + 3 + Math.min(contentLength, qrString.length - position.start - 4) });
            return;
        }

        // Obtener el contenido del campo variable
        const variableContent = qrString.substring(position.start + 4, position.start + 4 + contentLength);

        // Verificar que no contenga la letra ñ
        if (/ñ/i.test(variableContent)) {
            showError('Nodo 59', `El contenido no debe contener la letra "ñ"`,
                    qrString.substring(position.start, position.start + 4 + contentLength),
                    { start: position.start, end: position.start + 3 + contentLength });
            return;
        }

        // Verificar que no contenga letras minúsculas (a-z)
        if (/[a-z]/.test(variableContent)) {
            showError('Nodo 59', `El contenido no debe contener letras minúsculas (a-z)`,
                    qrString.substring(position.start, position.start + 4 + contentLength),
                    { start: position.start, end: position.start + 3 + contentLength });
            return;
        }

        // Calcular la posición final real del nodo
        const endPosition = position.start + 3 + contentLength;

        // Mostrar advertencia (amarillo) porque el contenido requiere verificación manual
        showNode59Warning(
            qrString.substring(position.start, position.start + 4 + contentLength),
            nodePrefix,
            lengthIndicator,
            variableContent,
            { start: position.start, end: endPosition }
        );
    }

    // VISUALIZACION Y MODIFICACION DE NODO 59
    function showNode59Warning(nodeContent, prefix, lengthIndicator, variableContent, position) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item success';
        resultItem.id = 'node59-result';

        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = '✅ Nodo 59: Validación Exitosa';


        const resultMessage = document.createElement('div');
        resultMessage.innerHTML = `
            <strong>Prefijo:</strong> ${prefix}<br>
            <strong>Indicador de longitud:</strong> ${lengthIndicator} (${parseInt(lengthIndicator, 10)} caracteres)<br>
            <strong>Nombre de convenio:</strong> <span id="displayed-content59">${variableContent}</span>
        `;

        // Agregar capa de edición del contenido variable
        const editContentDiv = document.createElement('div');
        editContentDiv.className = 'edit-cbu'; // Reutilizamos los estilos de edit-cbu
        editContentDiv.style.display = 'none'; // Inicialmente oculto
        editContentDiv.innerHTML = `
            <input type="text" id="edit-content59-input" value="${variableContent}" placeholder="Contenido (máx. 99 caracteres)" maxlength="99">
            <button id="save-content59-btn">Guardar</button>
            <button id="cancel-content59-btn">Cancelar</button>
        `;

        // Ícono de edición
        const editIcon = document.createElement('span');
        editIcon.innerHTML = ' ✏️';
        editIcon.className = 'edit-icon';
        editIcon.title = 'Editar contenido';

        // Agregar el ícono al mensaje
        const contentSpan = resultMessage.querySelector('#displayed-content59');
        if (contentSpan) {
            contentSpan.appendChild(editIcon);
        }



        // Área para mostrar el contenido del nodo
        const nodeDetails = document.createElement('div');
        nodeDetails.className = 'node-details';

        const positionText = document.createElement('div');
        positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.end}`;

        const nodeContentElem = document.createElement('div');
        nodeContentElem.className = 'node-content';
        nodeContentElem.textContent = nodeContent;
        nodeContentElem.id = 'node59-content';

        nodeDetails.appendChild(positionText);
        nodeDetails.appendChild(document.createTextNode('Contenido del nodo completo:'));
        nodeDetails.appendChild(nodeContentElem);

        // Armar el resultado
        resultItem.appendChild(resultTitle);
        resultItem.appendChild(resultMessage);
        resultItem.appendChild(editContentDiv);
        resultItem.appendChild(nodeDetails);

        // Agregar al contenedor de resultados
        resultsContainer.appendChild(resultItem);

        // Asociar eventos a los elementos creados
        setupNode59EditEvents(variableContent, position, lengthIndicator);
    }

    function setupNode59EditEvents(originalContent, position, originalLengthIndicator) {
        // Referencias a elementos
        const editIcon = document.querySelector('#node59-result .edit-icon');
        const editContentDiv = document.querySelector('#node59-result .edit-cbu');
        const saveContentBtn = document.getElementById('save-content59-btn');
        const cancelContentBtn = document.getElementById('cancel-content59-btn');
        const editContentInput = document.getElementById('edit-content59-input');
        const displayedContent = document.getElementById('displayed-content59');


        // Evento para mostrar el editor
        editIcon.addEventListener('click', function() {
            editContentDiv.style.display = 'flex';
        });

        // Evento para cancelar la edición
        cancelContentBtn.addEventListener('click', function() {
            editContentDiv.style.display = 'none';
        });

        // Evento para guardar el contenido editado
        saveContentBtn.addEventListener('click', function() {
            const newContent = editContentInput.value.trim();

            // Verificar que no contenga la letra ñ
            if (/ñ/i.test(newContent)) {
                alert('El contenido no debe contener la letra "ñ"');
                return;
            }

            // Verificar que no contenga letras minúsculas
            if (/[a-z]/.test(newContent)) {
                alert('El contenido no debe contener letras minúsculas (a-z)');
                return;
            }

            // Verificar la longitud máxima
            if (newContent.length > 99) {
                alert('El contenido no puede exceder los 99 caracteres');
                return;
            }

            // Verificar que no esté vacío
            if (newContent.length === 0) {
                alert('El contenido no puede estar vacío');
                return;
            }

            // Actualizar el contenido mostrado
            if (displayedContent) {
                // Conservar solo el texto, sin el ícono de edición
                const editIconElement = displayedContent.querySelector('.edit-icon');
                displayedContent.textContent = newContent;
                if (editIconElement) {
                    displayedContent.appendChild(editIconElement);
                }
            }

            editContentDiv.style.display = 'none';

            // Actualizar el string QR en el input principal
            updateQRStringWithNewNode59Content(originalContent, newContent, position, originalLengthIndicator);
        });

    }

    function updateQRStringWithNewNode59Content(oldContent, newContent, position, originalLengthIndicator) {
        const qrStringInput = document.getElementById('qrString');
        let currentQrString = qrStringInput.value.trim();

        // Generar el nuevo indicador de longitud (dos dígitos)
        const newLengthIndicator = newContent.length.toString().padStart(2, '0');

        // Verificar que la longitud sea válida (entre 01 y 99)
        if (parseInt(newLengthIndicator, 10) < 1 || parseInt(newLengthIndicator, 10) > 99) {
            alert(`La longitud del contenido debe estar entre 1 y 99 caracteres. Longitud actual: ${newContent.length}`);
            return;
        }

        // Calcular la posición donde empieza el nodo 59
        const nodeStartPosition = position.start;

        // Crear el nuevo nodo 59 completo
        const newNode59 = "59" + newLengthIndicator + newContent;


        // Calcular la longitud del nodo 59 original
        const originalNode59Length = 4 + parseInt(originalLengthIndicator, 10); // 2 (prefijo) + 2 (longitud) + contenido original

        // Actualizar el StringQR reemplazando el nodo 59 original por el nuevo
        const updatedQrString =
            currentQrString.substring(0, nodeStartPosition) +
            newNode59 +
            currentQrString.substring(nodeStartPosition + originalNode59Length);

        // Actualizar el input con el nuevo StringQR
        qrStringInput.value = updatedQrString;

        // Actualizar el elemento que muestra el nodo completo
        const nodeContentElem = document.getElementById('node59-content');
        if (nodeContentElem) {
            nodeContentElem.textContent = newNode59;
        }

        // Actualizar la información de posición
        const positionText = document.querySelector('#node59-result .node-details strong').parentElement;
        if (positionText) {
            const newEndPosition = position.start + newNode59.length - 1;
            positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${newEndPosition}`;
        }

        // Actualizar el indicador de longitud mostrado en la UI
        const contentInfoElement = document.querySelector('#node59-result strong:nth-of-type(2)');
        if (contentInfoElement) {
            contentInfoElement.nextSibling.textContent = ` ${newLengthIndicator} (${parseInt(newLengthIndicator, 10)} caracteres)`;
        }
        analyzeQRString()
    }
//--------------------------------------------------------VALIDACION NODO 60
    // VALIDACION NODO 60 (PROVINCIA - LONGITUD VARIABLE)
    function validateNode60(qrString, position) {
        // Verificar que hay suficientes caracteres para al menos leer los 4 primeros caracteres del nodo
        if (qrString.length < position.start + 4) {
            showError('Nodo 60', `No hay suficientes caracteres para leer el nodo 60 completo`, "", { start: position.start, end: position.start + 3 });
            return;
        }

        // Obtener los primeros 4 caracteres del nodo
        const nodePrefix = qrString.substring(position.start, position.start + 2);
        const lengthIndicator = qrString.substring(position.start + 2, position.start + 4);

        // Verificar que el nodo comience con "60"
        if (nodePrefix !== "60") {
            showError('Nodo 60', `El nodo debe comenzar con 60, pero se encontró: ${nodePrefix}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Verificar que el indicador de longitud sea numérico
        if (!/^\d{2}$/.test(lengthIndicator)) {
            showError('Nodo 60', `El indicador de longitud debe ser numérico de 2 dígitos, pero se encontró: ${lengthIndicator}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Convertir el indicador de longitud a número
        const contentLength = parseInt(lengthIndicator, 10);

        // Verificar que la longitud sea un valor válido (entre 1 y 99)
        if (contentLength < 1 || contentLength > 99) {
            showError('Nodo 60', `La longitud indicada debe estar entre 01 y 99, pero se encontró: ${contentLength}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Verificar que haya suficientes caracteres para el contenido
        if (qrString.length < position.start + 4 + contentLength) {
            showError('Nodo 60', `La longitud indicada es ${contentLength}, pero no hay suficientes caracteres en el StringQR`,
                    qrString.substring(position.start, position.start + 4 + Math.min(contentLength, qrString.length - position.start - 4)),
                    { start: position.start, end: position.start + 3 + Math.min(contentLength, qrString.length - position.start - 4) });
            return;
        }

        // Obtener el contenido del campo variable (provincia)
        const variableContent = qrString.substring(position.start + 4, position.start + 4 + contentLength);

        // Verificar que no contenga la letra ñ
        if (/ñ/i.test(variableContent)) {
            showError('Nodo 60', `El contenido no debe contener la letra "ñ"`,
                    qrString.substring(position.start, position.start + 4 + contentLength),
                    { start: position.start, end: position.start + 3 + contentLength });
            return;
        }

        // Verificar que no contenga letras minúsculas
        if (/[a-z]/.test(variableContent)) {
            showError('Nodo 60', `El contenido no debe contener letras minúsculas (a-z)`,
                    qrString.substring(position.start, position.start + 4 + contentLength),
                    { start: position.start, end: position.start + 3 + contentLength });
        return;
        }

        // Calcular la posición final real del nodo
        const endPosition = position.start + 3 + contentLength;

        // Mostrar advertencia (amarillo) porque el contenido requiere verificación manual
        showNode60Warning(
            qrString.substring(position.start, position.start + 4 + contentLength),
            nodePrefix,
            lengthIndicator,
            variableContent,
            { start: position.start, end: endPosition }
        );
    }


    // VISUALIZACION Y MODIFICACION DE NODO 60 (PROVINCIA)
    function showNode60Warning(nodeContent, prefix, lengthIndicator, variableContent, position) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item warning';
        resultItem.id = 'node60-result';

        // Determinar el estado inicial basado en la validación manual previa
        const isManuallyVerified = manualValidationState.node60Verified;
        resultItem.className = isManuallyVerified ? 'result-item success' : 'result-item warning';
        resultItem.id = 'node60-result';

        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = isManuallyVerified 
            ? '✅ Nodo 60: Provincia verificada manualmente'
            : '⚠️ Nodo 60: Provincia requiere verificación manual';

        const resultMessage = document.createElement('div');
        resultMessage.innerHTML = `
            <strong>Prefijo:</strong> ${prefix}<br>
            <strong>Indicador de longitud:</strong> ${lengthIndicator} (${parseInt(lengthIndicator, 10)} caracteres)<br>
            <strong>Provincia:</strong> <span id="displayed-content60">${variableContent}</span>
        `;

        // Agregar capa de edición del contenido variable
        const editContentDiv = document.createElement('div');
        editContentDiv.className = 'edit-provincia'; // Nuevo estilo para edición de provincia
        editContentDiv.style.display = 'none'; // Inicialmente oculto
        editContentDiv.innerHTML = `
            <input type="text" id="edit-content60-input" value="${variableContent}" placeholder="Provincia (máx. 99 caracteres)" maxlength="99">
            <button id="save-content60-btn">Guardar</button>
            <button id="cancel-content60-btn">Cancelar</button>
        `;

        // Ícono de edición
        const editIcon = document.createElement('span');
        editIcon.innerHTML = ' ✏️';
        editIcon.className = 'edit-icon';
        editIcon.title = 'Editar provincia';

        // Agregar el ícono al mensaje
        const contentSpan = resultMessage.querySelector('#displayed-content60');
        if (contentSpan) {
            contentSpan.appendChild(editIcon);
        }

        // Checkbox para validación manual
        const manualValidationDiv = document.createElement('div');
        manualValidationDiv.className = 'manual-validation';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'manual-validation-checkbox-content60';
        checkbox.checked = isManuallyVerified; // Restaurar el estado previo

        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', 'manual-validation-checkbox-content60');
        checkboxLabel.textContent = 'Verificado manualmente';

        manualValidationDiv.appendChild(checkbox);
        manualValidationDiv.appendChild(checkboxLabel);

        // Área para mostrar el contenido del nodo
        const nodeDetails = document.createElement('div');
        nodeDetails.className = 'node-details';

        const positionText = document.createElement('div');
        positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.end}`;

        const nodeContentElem = document.createElement('div');
        nodeContentElem.className = 'node-content';
        nodeContentElem.textContent = nodeContent;
        nodeContentElem.id = 'node60-content';

        nodeDetails.appendChild(positionText);
        nodeDetails.appendChild(document.createTextNode('Contenido del nodo completo:'));
        nodeDetails.appendChild(nodeContentElem);

        // Armar el resultado
        resultItem.appendChild(resultTitle);
        resultItem.appendChild(resultMessage);
        resultItem.appendChild(editContentDiv);
        resultItem.appendChild(manualValidationDiv);
        resultItem.appendChild(nodeDetails);

        // Agregar al contenedor de resultados
        resultsContainer.appendChild(resultItem);

        // Asociar eventos a los elementos creados
        setupNode60EditEvents(variableContent, position, lengthIndicator);
    }

    function setupNode60EditEvents(originalContent, position, originalLengthIndicator) {
        // Referencias a elementos
        const editIcon = document.querySelector('#node60-result .edit-icon');
        const editContentDiv = document.querySelector('#node60-result .edit-provincia');
        const saveContentBtn = document.getElementById('save-content60-btn');
        const cancelContentBtn = document.getElementById('cancel-content60-btn');
        const editContentInput = document.getElementById('edit-content60-input');
        const displayedContent = document.getElementById('displayed-content60');
        const manualCheckbox = document.getElementById('manual-validation-checkbox-content60');
        const resultItem = document.getElementById('node60-result');

        // Evento para mostrar el editor
        editIcon.addEventListener('click', function() {
            editContentDiv.style.display = 'flex';
        });

        // Evento para cancelar la edición
        cancelContentBtn.addEventListener('click', function() {
            editContentDiv.style.display = 'none';
        });

        // Evento para guardar el contenido editado
        saveContentBtn.addEventListener('click', function() {
            const newContent = editContentInput.value.trim();

            // Verificar que no contenga la letra ñ
            if (/ñ/i.test(newContent)) {
                alert('El contenido no debe contener la letra "ñ"');
                return;
            }

            // Verificar que no contenga letras minúsculas
            if (/[a-z]/.test(newContent)) {
                alert('El contenido no debe contener letras minúsculas (a-z)');
                return;
            }

            // Verificar la longitud máxima
            if (newContent.length > 99) {
                alert('El nombre de provincia no puede exceder los 99 caracteres');
                return;
            }

            // Verificar que no esté vacío
            if (newContent.length === 0) {
                alert('El nombre de provincia no puede estar vacío');
                return;
            }

            // Actualizar el contenido mostrado
            if (displayedContent) {
                // Conservar solo el texto, sin el ícono de edición
                const editIconElement = displayedContent.querySelector('.edit-icon');
                displayedContent.textContent = newContent;
                if (editIconElement) {
                    displayedContent.appendChild(editIconElement);
                }
            }

            editContentDiv.style.display = 'none';

            // Actualizar el string QR en el input principal
            updateQRStringWithNewNode60Content(originalContent, newContent, position, originalLengthIndicator);
        });

        // Evento para el checkbox de validación manual
        manualCheckbox.addEventListener('change', function() {
            // GUARDAR EL ESTADO EN LA VARIABLE GLOBAL
            manualValidationState.node60Verified = this.checked;
            if (this.checked) {
                resultItem.className = 'result-item success';
                resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 60: Provincia verificada manualmente';
            } else {
                resultItem.className = 'result-item warning';
                resultItem.querySelector('.result-title').innerHTML = '⚠️ Nodo 60: Provincia requiere verificación manual';
            }
        });
    }


    function updateQRStringWithNewNode60Content(oldContent, newContent, position, originalLengthIndicator) {
        const qrStringInput = document.getElementById('qrString');
        let currentQrString = qrStringInput.value.trim();

        // Generar el nuevo indicador de longitud (dos dígitos)
        const newLengthIndicator = newContent.length.toString().padStart(2, '0');

        // Verificar que la longitud sea válida (entre 01 y 99)
        if (parseInt(newLengthIndicator, 10) < 1 || parseInt(newLengthIndicator, 10) > 99) {
            alert(`La longitud del contenido debe estar entre 1 y 99 caracteres. Longitud actual: ${newContent.length}`);
            return;
        }

        // Calcular la posición donde empieza el nodo 60
        const nodeStartPosition = position.start;

        // Crear el nuevo nodo 60 completo
        const newNode60 = "60" + newLengthIndicator + newContent;

        // Calcular la longitud del nodo 60 original
        const originalNode60Length = 4 + parseInt(originalLengthIndicator, 10); // 2 (prefijo) + 2 (longitud) + contenido original

        // Encontrar los nodos que siguen al nodo 60 (si existen)
        const remainingString = currentQrString.substring(nodeStartPosition + originalNode60Length);

        // Actualizar el StringQR reemplazando el nodo 60 original por el nuevo
        const updatedQrString =
            currentQrString.substring(0, nodeStartPosition) +
            newNode60 +
            remainingString;

        // Actualizar el input con el nuevo StringQR
        qrStringInput.value = updatedQrString;

        // Actualizar el elemento que muestra el nodo completo
        const nodeContentElem = document.getElementById('node60-content');
        if (nodeContentElem) {
            nodeContentElem.textContent = newNode60;
        }

        // Actualizar la información de posición
        const positionText = document.querySelector('#node60-result .node-details strong').parentElement;
        if (positionText) {
            const newEndPosition = position.start + newNode60.length - 1;
            positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${newEndPosition}`;
        }

        // Actualizar el indicador de longitud mostrado en la UI
        const contentInfoElement = document.querySelector('#node60-result strong:nth-of-type(2)');
        if (contentInfoElement) {
            contentInfoElement.nextSibling.textContent = ` ${newLengthIndicator} (${parseInt(newLengthIndicator, 10)} caracteres)`;
        }
        analyzeQRString()
    }

//---------------------------------------------------------- ANALISIS NODO 61

    // VALIDACION NODO 61 (CODIGO POSTAL - LONGITUD VARIABLE)
    function validateNode61(qrString, position) {
        // Verificar que hay suficientes caracteres para al menos leer los 4 primeros caracteres del nodo
        if (qrString.length < position.start + 4) {
            showError('Nodo 61', `No hay suficientes caracteres para leer el nodo 61 completo`, "", { start: position.start, end: position.start + 3 });
            return;
        }

        // Obtener los primeros 4 caracteres del nodo
        const nodePrefix = qrString.substring(position.start, position.start + 2);
        const lengthIndicator = qrString.substring(position.start + 2, position.start + 4);

        // Verificar que el nodo comience con "60"
        if (nodePrefix !== "61") {
            showError('Nodo 61', `El nodo debe comenzar con 61, pero se encontró: ${nodePrefix}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Verificar que el indicador de longitud sea numérico
        if (!/^\d{2}$/.test(lengthIndicator)) {
            showError('Nodo 61', `El indicador de longitud debe ser numérico de 2 dígitos, pero se encontró: ${lengthIndicator}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Convertir el indicador de longitud a número
        const contentLength = parseInt(lengthIndicator, 10);

        // Verificar que la longitud sea un valor válido (entre 1 y 99)
        if (contentLength < 1 || contentLength > 99) {
            showError('Nodo 61', `La longitud indicada debe estar entre 01 y 99, pero se encontró: ${contentLength}`,
                    qrString.substring(position.start, position.start + 4),
                    { start: position.start, end: position.start + 3 });
            return;
        }

        // Verificar que haya suficientes caracteres para el contenido
        if (qrString.length < position.start + 4 + contentLength) {
            showError('Nodo 61', `La longitud indicada es ${contentLength}, pero no hay suficientes caracteres en el StringQR`,
                    qrString.substring(position.start, position.start + 4 + Math.min(contentLength, qrString.length - position.start - 4)),
                    { start: position.start, end: position.start + 3 + Math.min(contentLength, qrString.length - position.start - 4) });
            return;
        }

        // Obtener el contenido del campo variable (COD)
        const variableContent = qrString.substring(position.start + 4, position.start + 4 + contentLength);

        // Verificar que no contenga la letra ñ
        if (/ñ/i.test(variableContent)) {
            showError('Nodo 61', `El contenido no debe contener la letra "ñ"`,
                    qrString.substring(position.start, position.start + 4 + contentLength),
                    { start: position.start, end: position.start + 3 + contentLength });
            return;
        }

        // Verificar que no contenga letras minúsculas
        if (/[a-z]/.test(variableContent)) {
            showError('Nodo 61', `El contenido no debe contener letras minúsculas (a-z)`,
                qrString.substring(position.start, position.start + 4 + contentLength),
                { start: position.start, end: position.start + 3 + contentLength });
            return;
        }

        // Calcular la posición final real del nodo
        const endPosition = position.start + 3 + contentLength;

        // Mostrar advertencia (amarillo) porque el contenido requiere verificación manual
        showNode61Warning(
            qrString.substring(position.start, position.start + 4 + contentLength),
            nodePrefix,
            lengthIndicator,
            variableContent,
            { start: position.start, end: endPosition }
        );
    }

    // VISUALIZACION Y MODIFICACION DE NODO 61 (Codigo Postal)
    function showNode61Warning(nodeContent, prefix, lengthIndicator, variableContent, position) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item warning';
        resultItem.id = 'node61-result';

        
        // Determinar el estado inicial basado en la validación manual previa
        const isManuallyVerified = manualValidationState.node61Verified;
        resultItem.className = isManuallyVerified ? 'result-item success' : 'result-item warning';
        resultItem.id = 'node61-result';

        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = isManuallyVerified 
            ? '✅ Nodo 61: Código Postal verificado manualmente'
            : '⚠️ Nodo 61: Código Postal requiere verificación manual';

        const resultMessage = document.createElement('div');
        resultMessage.innerHTML = `
            <strong>Prefijo:</strong> ${prefix}<br>
            <strong>Indicador de longitud:</strong> ${lengthIndicator} (${parseInt(lengthIndicator, 10)} caracteres)<br>
            <strong>Codigo Postal:</strong> <span id="displayed-content61">${variableContent}</span>
        `;

        // Agregar capa de edición del contenido variable
        const editContentDiv = document.createElement('div');
        editContentDiv.className = 'edit-provincia'; // Nuevo estilo para edición de provincia
        editContentDiv.style.display = 'none'; // Inicialmente oculto
        editContentDiv.innerHTML = `
            <input type="text" id="edit-content61-input" value="${variableContent}" placeholder="Codigo Postal (máx. 99 caracteres)" maxlength="99">
            <button id="save-content61-btn">Guardar</button>
            <button id="cancel-content61-btn">Cancelar</button>
        `;

        // Ícono de edición
        const editIcon = document.createElement('span');
        editIcon.innerHTML = ' ✏️';
        editIcon.className = 'edit-icon';
        editIcon.title = 'Editar Codigo Postal';

        // Agregar el ícono al mensaje
        const contentSpan = resultMessage.querySelector('#displayed-content61');
        if (contentSpan) {
            contentSpan.appendChild(editIcon);
        }

        // Checkbox para validación manual
        const manualValidationDiv = document.createElement('div');
        manualValidationDiv.className = 'manual-validation';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'manual-validation-checkbox-content61';
        checkbox.checked = isManuallyVerified; // Restaurar el estado previo

        const checkboxLabel = document.createElement('label');
        checkboxLabel.setAttribute('for', 'manual-validation-checkbox-content61');
        checkboxLabel.textContent = 'Verificado manualmente';

        manualValidationDiv.appendChild(checkbox);
        manualValidationDiv.appendChild(checkboxLabel);

        // Área para mostrar el contenido del nodo
        const nodeDetails = document.createElement('div');
        nodeDetails.className = 'node-details';

        const positionText = document.createElement('div');
        positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.end}`;

        const nodeContentElem = document.createElement('div');
        nodeContentElem.className = 'node-content';
        nodeContentElem.textContent = nodeContent;
        nodeContentElem.id = 'node61-content';

        nodeDetails.appendChild(positionText);
        nodeDetails.appendChild(document.createTextNode('Contenido del nodo completo:'));
        nodeDetails.appendChild(nodeContentElem);

        // Armar el resultado
        resultItem.appendChild(resultTitle);
        resultItem.appendChild(resultMessage);
        resultItem.appendChild(editContentDiv);
        resultItem.appendChild(manualValidationDiv);
        resultItem.appendChild(nodeDetails);

        // Agregar al contenedor de resultados
        resultsContainer.appendChild(resultItem);

        // Asociar eventos a los elementos creados
        setupNode61EditEvents(variableContent, position, lengthIndicator);
    }

    function setupNode61EditEvents(originalContent, position, originalLengthIndicator) {
        // Referencias a elementos
        const editIcon = document.querySelector('#node61-result .edit-icon');
        const editContentDiv = document.querySelector('#node61-result .edit-provincia');
        const saveContentBtn = document.getElementById('save-content61-btn');
        const cancelContentBtn = document.getElementById('cancel-content61-btn');
        const editContentInput = document.getElementById('edit-content61-input');
        const displayedContent = document.getElementById('displayed-content61');
        const manualCheckbox = document.getElementById('manual-validation-checkbox-content61');
        const resultItem = document.getElementById('node61-result');

        // Evento para mostrar el editor
        editIcon.addEventListener('click', function() {
            editContentDiv.style.display = 'flex';
        });

        // Evento para cancelar la edición
        cancelContentBtn.addEventListener('click', function() {
            editContentDiv.style.display = 'none';
        });

        // Evento para guardar el contenido editado
        saveContentBtn.addEventListener('click', function() {
            const newContent = editContentInput.value.trim();

            // Verificar que no contenga la letra ñ
            if (/ñ/i.test(newContent)) {
                alert('El contenido no debe contener la letra "ñ"');
                return;
            }

            // Verificar que no contenga letras minúsculas
            if (/[a-z]/.test(newContent)) {
                alert('El contenido no debe contener letras minúsculas (a-z)');
                return;
            }

            // Verificar la longitud máxima
            if (newContent.length > 99) {
                alert('El Codigo Postal no puede exceder los 99 caracteres');
                return;
            }

            // Verificar que no esté vacío
            if (newContent.length === 0) {
                alert('El Codigo Postal no puede estar vacío');
                return;
            }

            // Actualizar el contenido mostrado
            if (displayedContent) {
                // Conservar solo el texto, sin el ícono de edición
                const editIconElement = displayedContent.querySelector('.edit-icon');
                displayedContent.textContent = newContent;
                if (editIconElement) {
                    displayedContent.appendChild(editIconElement);
                }
            }

            editContentDiv.style.display = 'none';

            // Actualizar el string QR en el input principal
            updateQRStringWithNewNode61Content(originalContent, newContent, position, originalLengthIndicator);
        });

        // Evento para el checkbox de validación manual
        manualCheckbox.addEventListener('change', function() {
            // GUARDAR EL ESTADO EN LA VARIABLE GLOBAL
            manualValidationState.node61Verified = this.checked;
            if (this.checked) {
                resultItem.className = 'result-item success';
                resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 61: Código Postal verificado manualmente';
            } else {
                resultItem.className = 'result-item warning';
                resultItem.querySelector('.result-title').innerHTML = '⚠️ Nodo 61: Código Postal requiere verificación manual';
            }
        });
    }


    function updateQRStringWithNewNode61Content(oldContent, newContent, position, originalLengthIndicator) {
        const qrStringInput = document.getElementById('qrString');
        let currentQrString = qrStringInput.value.trim();

        // Generar el nuevo indicador de longitud (dos dígitos)
        const newLengthIndicator = newContent.length.toString().padStart(2, '0');

        // Verificar que la longitud sea válida (entre 01 y 99)
        if (parseInt(newLengthIndicator, 10) < 1 || parseInt(newLengthIndicator, 10) > 99) {
            alert(`La longitud del contenido debe estar entre 1 y 99 caracteres. Longitud actual: ${newContent.length}`);
            return;
        }

        // Calcular la posición donde empieza el nodo 61
        const nodeStartPosition = position.start;

        // Crear el nuevo nodo 61 completo
        const newNode61 = "61" + newLengthIndicator + newContent;

        // Calcular la longitud del nodo 61 original
        const originalNode61Length = 4 + parseInt(originalLengthIndicator, 10); // 2 (prefijo) + 2 (longitud) + contenido original

        // Encontrar los nodos que siguen al nodo 61 (si existen)
        const remainingString = currentQrString.substring(nodeStartPosition + originalNode61Length);

        // Actualizar el StringQR reemplazando el nodo 61 original por el nuevo
        const updatedQrString =
            currentQrString.substring(0, nodeStartPosition) +
            newNode61 +
            remainingString;

        // Actualizar el input con el nuevo StringQR
        qrStringInput.value = updatedQrString;

        // Actualizar el elemento que muestra el nodo completo
        const nodeContentElem = document.getElementById('node61-content');
        if (nodeContentElem) {
            nodeContentElem.textContent = newNode61;
        }

        // Actualizar la información de posición
        const positionText = document.querySelector('#node61-result .node-details strong').parentElement;
        if (positionText) {
            const newEndPosition = position.start + newNode61.length - 1;
            positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${newEndPosition}`;
        }

        // Actualizar el indicador de longitud mostrado en la UI
        const contentInfoElement = document.querySelector('#node61-result strong:nth-of-type(2)');
        if (contentInfoElement) {
            contentInfoElement.nextSibling.textContent = ` ${newLengthIndicator} (${parseInt(newLengthIndicator, 10)} caracteres)`;
        }
        analyzeQRString()
    }


 //------------------NODO 62----------------------------------------
// Función para generar un nuevo UUID desde la API
async function generateNewUUID() {
    try {
        const response = await fetch('https://www.uuidgenerator.net/api/version1');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const uuid = await response.text();
        // Eliminar los guiones del UUID
        const cleanUuid = uuid.trim().replace(/-/g, '');
        
        return cleanUuid;
    } catch (error) {
        console.error('Error al generar UUID:', error);
        throw error;
    }
}

// 3. Agrega la función de validación para el nodo 62
function validateNode62(qrString, position) {
    // Verificar que el nodo comience con '62'
    if (!qrString.substring(position.start, position.start + 2) === '62') {
        showError('Nodo 62', 'El nodo debe comenzar con 62', qrString.substring(position.start), position);
        return;
    }

    // Obtener la longitud indicada por los siguientes dos dígitos
    const lengthIndicator = parseInt(qrString.substring(position.start + 2, position.start + 4), 10);

    // Verificar que haya suficientes caracteres para el nodo completo
    if (position.start + 4 + lengthIndicator > qrString.length) {
        showError('Nodo 62', 'La longitud indicada excede el tamaño del string QR', qrString.substring(position.start), position);
        return;
    }

    // Extraer el contenido del nodo
    const nodeContent = qrString.substring(position.start, position.start + 4 + lengthIndicator);

    // Validar la estructura interna del nodo
    try {
        const { uuid, comprobante, cpe, isValid, errorMessage } = parseNode62Content(nodeContent);

        if (!isValid) {
            showError('Nodo 62', errorMessage, nodeContent, position);
            return;
        }

        // Mostrar el nodo con opciones de edición
        showNode62Success(nodeContent, uuid, comprobante, cpe, position);

    } catch (error) {
        showError('Nodo 62', `Error al analizar el nodo: ${error.message}`, nodeContent, position);
    }
}

// 4. Función para analizar el contenido interno del nodo 62
function parseNode62Content(nodeContent) {
    // El contenido comienza después del prefijo "62xx"
    let content = nodeContent.substring(4);
    let currentPosition = 0;
    let uuid = null;
    let comprobante = null;
    let cpe = null;
    let isValid = true;
    let errorMessage = '';

    // Verificar el indicador de longitud (Campo 2)
    const lengthIndicator = parseInt(nodeContent.substring(2, 4), 10);

    // Campo 3: UUID (obligatorio)
    if (content.length < 36 || !content.startsWith('0032')) {
        return {
            isValid: false,
            errorMessage: 'El campo UUID debe comenzar con 0032 seguido de 32 caracteres alfanuméricos'
        };
    }

    uuid = content.substring(4, 4 + 32); // Extraer los 32 caracteres del UUID
    currentPosition = 4 + 32;

      // Verificar si queda suficiente contenido para el campo 4 (opcional)
    let hasComprobante = false;
    if (currentPosition + 4 <= content.length) {
        // Verificar si el siguiente campo es el comprobante (0120)
        if (content.substring(currentPosition, currentPosition + 4) === '0120') {
            hasComprobante = true;
            // Asegurarse de que hay suficientes caracteres para el comprobante completo
            if (currentPosition + 24 <= content.length) {
                comprobante = content.substring(currentPosition + 4, currentPosition + 24);
                currentPosition += 24;
            } else {
                return {
                    isValid: false,
                    errorMessage: 'El campo de comprobante está incompleto'
                };
            }
        }
    }

    // Validar el indicador de longitud según los campos presentes
    const expectedLength = hasComprobante ? 83 : 59;
    if (lengthIndicator !== expectedLength) {
        return {
            isValid: false,
            errorMessage: `El indicador de longitud debe ser ${expectedLength} ${hasComprobante ? 'cuando el comprobante está presente' : 'cuando no hay comprobante'}, pero es ${lengthIndicator}`
        };
    }

    // Campo 5: CPE (obligatorio)
    if (currentPosition + 4 > content.length || content.substring(currentPosition, currentPosition + 4) !== '0619') {
        return {
            isValid: false,
            errorMessage: 'El campo CPE debe comenzar con 0619'
        };
    }

    // Verificar que haya suficientes caracteres para el CPE completo
    if (currentPosition + 23 <= content.length) {
        cpe = content.substring(currentPosition + 4, currentPosition + 23);
    } else {
        return {
            isValid: false,
            errorMessage: 'El campo CPE está incompleto'
        };
    }

    return { uuid, comprobante, cpe, isValid: true };
}

// Función modificada para mostrar el resultado exitoso del nodo 62 con opciones de edición
function showNode62Success(nodeContent, uuid, comprobante, cpe, position) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item warning';
    resultItem.id = 'node62-result';

     // Determinar el estado inicial basado en la validación manual previa
        const isManuallyVerified = manualValidationState.node62Verified;
        resultItem.className = isManuallyVerified ? 'result-item success' : 'result-item warning';
        resultItem.id = 'node62-result';

        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = isManuallyVerified 
            ? '✅ Nodo 62: Datos verificado manualmente'
            : '⚠️ Nodo 62: Datos requieren de verificación manual';

    // Contenedor para mostrar los valores
    const valuesContainer = document.createElement('div');
    valuesContainer.className = 'node62-values';

    // 1. UUID (obligatorio)
    const uuidDiv = document.createElement('div');
    uuidDiv.innerHTML = `<strong>UUID:</strong> <span id="displayed-uuid">${uuid}</span> <span class="edit-icon" title="Editar UUID" id="edit-uuid-icon">✏️</span>`;

    // 2. Comprobante (opcional)
    const comprobanteDiv = document.createElement('div');
    if (comprobante) {
        comprobanteDiv.innerHTML = `<strong>Comprobante:</strong> <span id="displayed-comprobante">${comprobante}</span> <span class="edit-icon" title="Editar Comprobante" id="edit-comprobante-icon">✏️</span>`;
    } else {
        comprobanteDiv.innerHTML = `<strong>Comprobante:</strong> <span id="displayed-comprobante">No presente</span> <span class="add-icon" title="Agregar Comprobante" id="add-comprobante-icon">➕</span>`;
    }

    // 3. CPE (obligatorio)
    const cpeDiv = document.createElement('div');
    cpeDiv.innerHTML = `<strong>CPE:</strong> <span id="displayed-cpe">${cpe}</span> <span class="edit-icon" title="Editar CPE" id="edit-cpe-icon">✏️</span>`;

    // Agregar los elementos al contenedor
    valuesContainer.appendChild(uuidDiv);
    valuesContainer.appendChild(comprobanteDiv);
    valuesContainer.appendChild(cpeDiv);

    // Formularios de edición (inicialmente ocultos)
    const editFormsContainer = document.createElement('div');
    editFormsContainer.className = 'edit-forms-container';

    // 1. Formulario de edición para UUID - MODIFICADO para incluir el botón de generar
    const uuidForm = document.createElement('div');
    uuidForm.className = 'edit-form';
    uuidForm.id = 'edit-uuid-form';
    uuidForm.style.display = 'none';
    uuidForm.innerHTML = `
        <input type="text" id="edit-uuid-input" value="${uuid}" placeholder="UUID" maxlength="32">
        <button id="generate-uuid-btn">Generar nuevo UUID</button>
        <button id="save-uuid-btn">Guardar</button>
        <button id="cancel-uuid-btn">Cancelar</button>
    `;

    // 2. Formulario de edición para Comprobante
    const comprobanteForm = document.createElement('div');
    comprobanteForm.className = 'edit-form';
    comprobanteForm.id = 'edit-comprobante-form';
    comprobanteForm.style.display = 'none';
    comprobanteForm.innerHTML = `
        <input type="text" id="edit-comprobante-input" value="${comprobante || ''}" placeholder="Número de comprobante (20 dígitos)" maxlength="20">
        <button id="save-comprobante-btn">Guardar</button>
        <button id="cancel-comprobante-btn">Cancelar</button>
    `;

    // 3. Formulario de edición para CPE
    const cpeForm = document.createElement('div');
    cpeForm.className = 'edit-form';
    cpeForm.id = 'edit-cpe-form';
    cpeForm.style.display = 'none';
    cpeForm.innerHTML = `
        <input type="text" id="edit-cpe-input" value="${cpe}" placeholder="CPE (19 dígitos)" maxlength="19">
        <button id="save-cpe-btn">Guardar</button>
        <button id="cancel-cpe-btn">Cancelar</button>
    `;

    // Checkbox para validación manual
    const manualValidationDiv = document.createElement('div');
    manualValidationDiv.className = 'manual-validation';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'manual-validation-checkbox-form';
    checkbox.checked = isManuallyVerified; // Restaurar el estado previo

    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', 'manual-validation-checkbox-form');
    checkboxLabel.textContent = 'Verificado manualmente';

    manualValidationDiv.appendChild(checkbox);
    manualValidationDiv.appendChild(checkboxLabel);

    // Agregar los formularios al contenedor
    editFormsContainer.appendChild(uuidForm);
    editFormsContainer.appendChild(comprobanteForm);
    editFormsContainer.appendChild(cpeForm);

    // Área para mostrar el contenido del nodo
    const nodeDetails = document.createElement('div');
    nodeDetails.className = 'node-details';

    const positionText = document.createElement('div');
    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.start + nodeContent.length - 1}`;

    const nodeContentElem = document.createElement('div');
    nodeContentElem.className = 'node-content';
    nodeContentElem.textContent = nodeContent;
    nodeContentElem.id = 'node62-content';

    nodeDetails.appendChild(positionText);
    nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
    nodeDetails.appendChild(nodeContentElem);

    // Armar el resultado final
    resultItem.appendChild(resultTitle);
    resultItem.appendChild(valuesContainer);
    resultItem.appendChild(editFormsContainer);
    resultItem.appendChild(manualValidationDiv);
    resultItem.appendChild(nodeDetails);

    // Agregar al contenedor de resultados
    resultsContainer.appendChild(resultItem);

    // Configurar los eventos para la edición
    setupNode62EditEvents(uuid, comprobante, cpe, position);
}

// Función modificada para configurar los eventos de edición del nodo 62
function setupNode62EditEvents(uuid, comprobante, cpe, position) {
    // Referencias a los íconos de edición
    const editUuidIcon = document.getElementById('edit-uuid-icon');
    const editComprobanteIcon = document.getElementById('edit-comprobante-icon') || document.getElementById('add-comprobante-icon');
    const editCpeIcon = document.getElementById('edit-cpe-icon');

    // Referencias a los formularios
    const uuidForm = document.getElementById('edit-uuid-form');
    const comprobanteForm = document.getElementById('edit-comprobante-form');
    const cpeForm = document.getElementById('edit-cpe-form');

    // Referencias a los botones
    const generateUuidBtn = document.getElementById('generate-uuid-btn'); // NUEVO BOTÓN
    const saveUuidBtn = document.getElementById('save-uuid-btn');
    const cancelUuidBtn = document.getElementById('cancel-uuid-btn');
    const saveComprobanteBtn = document.getElementById('save-comprobante-btn');
    const cancelComprobanteBtn = document.getElementById('cancel-comprobante-btn');
    const saveCpeBtn = document.getElementById('save-cpe-btn');
    const cancelCpeBtn = document.getElementById('cancel-cpe-btn');
    const manualCheckbox = document.getElementById('manual-validation-checkbox-form');
    const resultItem = document.getElementById('node62-result');

    // Eventos para el UUID
    editUuidIcon.addEventListener('click', function() {
        uuidForm.style.display = 'flex';
    });

    cancelUuidBtn.addEventListener('click', function() {
        uuidForm.style.display = 'none';
    });

    // NUEVO: Evento para generar UUID
    generateUuidBtn.addEventListener('click', async function() {
        const button = this;
        const originalText = button.textContent;
        
        try {
            // Cambiar el texto del botón para mostrar que está cargando
            button.textContent = 'Generando...';
            button.disabled = true;
            
            // Generar el nuevo UUID
            const newUuid = await generateNewUUID();
            
            // Cargar el UUID en el input
            document.getElementById('edit-uuid-input').value = newUuid;
            
            // Restaurar el botón
            button.textContent = originalText;
            button.disabled = false;
            
        } catch (error) {
            // En caso de error, mostrar mensaje y restaurar el botón
            alert('Error al generar UUID: ' + error.message);
            button.textContent = originalText;
            button.disabled = false;
        }
    });

    saveUuidBtn.addEventListener('click', function() {
        const newUuid = document.getElementById('edit-uuid-input').value.trim().replace(/-/g, '');

        // Validar el UUID (debe tener 32 caracteres alfanuméricos)
        if (newUuid.length !== 32 || !/^[a-zA-Z0-9]{32}$/.test(newUuid)) {
            alert('El UUID debe tener 32 caracteres alfanuméricos');
            return;
        }

        // Actualizar el UUID mostrado
        document.getElementById('displayed-uuid').textContent = newUuid;
        uuidForm.style.display = 'none';

        // Actualizar el string QR
        updateQRStringWithNewNode62(position, newUuid, comprobante, cpe);
    });

    // Eventos para el Comprobante
    editComprobanteIcon.addEventListener('click', function() {
        comprobanteForm.style.display = 'flex';
    });

    cancelComprobanteBtn.addEventListener('click', function() {
        comprobanteForm.style.display = 'none';
    });

    saveComprobanteBtn.addEventListener('click', function() {
        const newComprobante = document.getElementById('edit-comprobante-input').value.trim();

        // Si está vacío, eliminamos el campo
        if (newComprobante === '') {
            document.getElementById('displayed-comprobante').textContent = 'No presente';
            document.getElementById('edit-comprobante-icon').className = 'add-icon';
            document.getElementById('edit-comprobante-icon').id = 'add-comprobante-icon';
            document.getElementById('add-comprobante-icon').title = 'Agregar Comprobante';
            comprobanteForm.style.display = 'none';

            // Actualizar el string QR sin comprobante
            updateQRStringWithNewNode62(position, uuid.replace(/-/g, ''), null, cpe);
            return;
        }

        // Validar el Comprobante (debe tener 20 caracteres)
        if (newComprobante.length !== 20 || !/^[a-zA-Z0-9]{20}$/.test(newComprobante)) {
            alert('El número de comprobante debe tener 20 caracteres alfanuméricos');
            return;
        }

        // Actualizar el comprobante mostrado
        document.getElementById('displayed-comprobante').textContent = newComprobante;

        // Cambiar el ícono si es necesario
        if (document.getElementById('add-comprobante-icon')) {
            document.getElementById('add-comprobante-icon').className = 'edit-icon';
            document.getElementById('add-comprobante-icon').id = 'edit-comprobante-icon';
            document.getElementById('edit-comprobante-icon').title = 'Editar Comprobante';
        }

        comprobanteForm.style.display = 'none';

        // Actualizar el string QR
        updateQRStringWithNewNode62(position, uuid.replace(/-/g, ''), newComprobante, cpe);
    });

    // Eventos para el CPE
    editCpeIcon.addEventListener('click', function() {
        cpeForm.style.display = 'flex';
    });

    cancelCpeBtn.addEventListener('click', function() {
        cpeForm.style.display = 'none';
    });

    saveCpeBtn.addEventListener('click', function() {
        const newCpe = document.getElementById('edit-cpe-input').value.trim();

        // Validar el CPE (debe tener 19 caracteres numéricos)
        if (newCpe.length !== 19 || !/^\d{19}$/.test(newCpe)) {
            alert('El CPE debe tener 19 dígitos numéricos');
            return;
        }

        // Actualizar el CPE mostrado
        document.getElementById('displayed-cpe').textContent = newCpe;
        cpeForm.style.display = 'none';

        // Actualizar el string QR
        updateQRStringWithNewNode62(position, uuid.replace(/-/g, ''), comprobante, newCpe);
    });

    // Evento para el checkbox de validación manual
    manualCheckbox.addEventListener('change', function() {
        // GUARDAR EL ESTADO EN LA VARIABLE GLOBAL
        manualValidationState.node62Verified = this.checked;
        if (this.checked) {
            resultItem.className = 'result-item success';
            resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 62: Datos verificado manualmente';
        } else {
            resultItem.className = 'result-item warning';
            resultItem.querySelector('.result-title').innerHTML = '⚠️ Nodo 62: Datos requieren de verificación manual';
        }
    });
}

// 8. Función para actualizar el string QR con el nuevo nodo 62
function updateQRStringWithNewNode62(position, uuid, comprobante, cpe) {
    // Obtener el string QR actual
    let qrString = qrStringInput.value.trim();

    // Construir el nuevo contenido del nodo 62
    let newNode62Content = '62';

    // Construir los campos internos
    let node62InnerContent = `0032${uuid}`;

    // Agregar campo de comprobante si está presente
    if (comprobante) {
        node62InnerContent += `0120${comprobante}`;
    }

    // Agregar campo CPE (obligatorio)
    node62InnerContent += `0619${cpe}`;

    // Calcular la longitud correcta según si hay comprobante o no
    const lengthValue = comprobante ? 83 : 59;
    const lengthStr = lengthValue.toString().padStart(2, '0');
    newNode62Content += lengthStr + node62InnerContent;

    // Encontrar la posición del nodo 62 existente
    const node62Start = position.start;

    // Buscar el final del nodo 62 existente (podría ser variable)
    let node62End;

    // Si estamos en el final del string, simplemente tomamos hasta el final
    if (node62Start + 4 >= qrString.length) {
        node62End = qrString.length;
    } else {
        // Obtener la longitud indicada por los dos dígitos después de "62"
        const existingLength = parseInt(qrString.substring(node62Start + 2, node62Start + 4), 10);
        node62End = node62Start + 4 + existingLength;

        // Si la longitud calculada excede la longitud del string, limitarla
        if (node62End > qrString.length) {
            node62End = qrString.length;
        }
    }

    // Reemplazar el nodo 62 existente con el nuevo
    const newQrString =
        qrString.substring(0, node62Start) +
        newNode62Content +
        qrString.substring(node62End);

    // Actualizar el input
    qrStringInput.value = newQrString;

    // Actualizar el contenido del nodo mostrado
    const nodeContent = document.getElementById('node62-content');
    if (nodeContent) {
        nodeContent.textContent = newNode62Content;
    }
    analyzeQRString();
}


//-------------------NODO 80---------------------------------------
// Función para validar el nodo 80
function validateNode80(qrString, position, node62) {
    // Verificar que el nodo comience con '80'
    if (!qrString.substring(position.start, position.start + 2) === '80') {
        showError('Nodo 80', 'El nodo debe comenzar con 80', qrString.substring(position.start), position);
        return;
    }

    // Obtener la longitud indicada por los siguientes dos dígitos
    const lengthIndicator = parseInt(qrString.substring(position.start + 2, position.start + 4), 10);

    // Verificar que haya suficientes caracteres para el nodo completo
    if (position.start + 4 + lengthIndicator > qrString.length) {
        showError('Nodo 80', 'La longitud indicada excede el tamaño del string QR', qrString.substring(position.start), position);
        return;
    }

    // Extraer el contenido del nodo
    const nodeContent = qrString.substring(position.start, position.start + 4 + lengthIndicator);

    // Validar la estructura interna del nodo
    try {
        const parseResult = parseNode80Content(nodeContent);
        console.log("PARSE RESULT NODO 80")
        console.log(parseResult)

        if (!parseResult.isValid) {
            showError('Nodo 80', parseResult.errorMessage, nodeContent, position);
            return;
        }

        // Verificar que el UUID del nodo 80 coincida con el del nodo 62
        console.log("VERIFICACIÓN UUID")
        if (node62) {
            console.log("ENTRO")
            const node62Content = qrString.substring(node62.position.start);
            const node62Result = parseNode62Content(node62Content);
            console.log(node62Content);
            console.log(node62Result);

            if (node62Result.isValid && node62Result.uuid !== parseResult.uuid) {
                // En lugar de mostrar error directo, mostrar error con opción de corrección
                showUUIDMismatchError(nodeContent, parseResult, node62Result, position, qrString);
                return;
            }
        }

        // Mostrar el nodo con opciones de edición
        showNode80Success(nodeContent, parseResult, position);

    } catch (error) {
        showError('Nodo 80', `Error al analizar el nodo: ${error.message}`, nodeContent, position);
    }
}


// Nueva función para mostrar error de UUID con opción de corrección
function showUUIDMismatchError(nodeContent, node80ParseResult, node62ParseResult, position, qrString) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item error';
    resultItem.id = 'node80-uuid-error';

    const resultTitle = document.createElement('div');
    resultTitle.className = 'result-title';
    resultTitle.innerHTML = `❌ Nodo 80: UUID no coincide con Nodo 62`;

    const resultMessage = document.createElement('div');
    resultMessage.innerHTML = `
        <strong>UUID Nodo 80:</strong> <span id="node80-uuid">${node80ParseResult.uuid}</span><br>
        <strong>UUID Nodo 62:</strong> <span id="node62-uuid">${node62ParseResult.uuid}</span><br>
        <em>Los UUID deben coincidir entre los nodos 62 y 80.</em>
    `;

    // Botón para corregir el UUID
    const fixButton = document.createElement('button');
    fixButton.id = 'fix-uuid-btn';
    fixButton.className = 'fix-button';
    fixButton.textContent = 'Coincidir UUID';

    // Área para mostrar el contenido del nodo
    const nodeDetails = document.createElement('div');
    nodeDetails.className = 'node-details';

    const positionText = document.createElement('div');
    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.start + nodeContent.length - 1}`;

    const nodeContentElem = document.createElement('div');
    nodeContentElem.className = 'node-content';
    nodeContentElem.textContent = nodeContent;
    nodeContentElem.id = 'node80-content';

    nodeDetails.appendChild(positionText);
    nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
    nodeDetails.appendChild(nodeContentElem);

    // Armar el resultado
    resultItem.appendChild(resultTitle);
    resultItem.appendChild(resultMessage);
    resultItem.appendChild(fixButton);
    resultItem.appendChild(nodeDetails);

    // Agregar al contenedor de resultados
    resultsContainer.appendChild(resultItem);

    // Asociar eventos a los elementos creados
    setupUUIDFixEvent(node80ParseResult.uuid, node62ParseResult.uuid, position, qrString, nodeContent);
}

// Función para configurar el evento de corrección de UUID
function setupUUIDFixEvent(oldUUID, newUUID, position, qrString, nodeContent) {
    const fixUuidBtn = document.getElementById('fix-uuid-btn');

    fixUuidBtn.addEventListener('click', function() {
        // Actualizar el UUID en el string QR
        updateQRStringWithCorrectUUID(oldUUID, newUUID, position, qrString, nodeContent);

        // Cambiar el estado visual del resultado
        const resultItem = document.getElementById('node80-uuid-error');
        resultItem.className = 'result-item success';
        resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 80: UUID corregido';

        // Actualizar el UUID mostrado
        document.getElementById('node80-uuid').textContent = newUUID;

        // Actualizar el contenido del nodo mostrado
        const nodeContentElem = document.getElementById('node80-content');
        if (nodeContentElem) {
            // Reconstruir el nodo con el UUID corregido
            const correctedNodeContent = reconstructNode80WithNewUUID(nodeContent, newUUID);
            nodeContentElem.textContent = correctedNodeContent;
        }

        // Desactivar el botón
        this.disabled = true;
        this.style.display = 'none';
        this.textContent = 'UUID Corregido';
    });
}

// Función para reconstruir el nodo 80 con el nuevo UUID
function reconstructNode80WithNewUUID(originalNodeContent, newUUID) {
    // El UUID está en la posición 8 (después de "80XX0032")
    const prefix = originalNodeContent.substring(0, 8); // "80XX0032"
    const suffix = originalNodeContent.substring(8 + 32); // Todo después del UUID
    
    return prefix + newUUID + suffix;
}

// Función para actualizar el string QR con el UUID corregido
function updateQRStringWithCorrectUUID(oldUUID, newUUID, position, qrString, nodeContent) {
    // Obtener el string QR actual del input
    let qrStringInput = document.getElementById('qrString');

    // Calcular la posición exacta del UUID en el string QR
    // El UUID está después de "80XX0032", donde XX es la longitud
    const uuidPosition = position.start + 8; // Posición donde comienza el UUID

    if (uuidPosition + oldUUID.length <= qrString.length) {
        // Reemplazar el UUID en la posición exacta
        const newQrString =
            qrString.substring(0, uuidPosition) +
            newUUID +
            qrString.substring(uuidPosition + oldUUID.length);

        // Actualizar el input
        qrStringInput.value = newQrString;
        
        console.log('UUID actualizado en posición:', uuidPosition);
        console.log('UUID anterior:', oldUUID);
        console.log('UUID nuevo:', newUUID);
    } else {
        alert('No se pudo actualizar el UUID en la posición exacta. El string QR es demasiado corto.');
        return;
    }

    // Volver a analizar el string QR
    analyzeQRString();
}



// Función para analizar el contenido interno del nodo 80
function parseNode80Content(nodeContent) {
    // El contenido comienza después del prefijo "80xx"
    let content = nodeContent.substring(4);
    let currentPosition = 0;
    let uuid = null;
    let firstDueDate = null;
    let firstAmount = null;
    let secondDueDays = null;
    let secondAmount = null;
    let thirdDueDays = null;
    let thirdAmount = null;
    let isValid = true;
    let errorMessage = '';

    // Verificar el indicador de longitud (Campo 2)
    const lengthIndicator = parseInt(nodeContent.substring(2, 4), 10);

    // Campo 3: UUID (obligatorio)
    if (content.length < 36 || !content.startsWith('0032')) {
        return {
            isValid: false,
            errorMessage: 'El campo UUID debe comenzar con 0032 seguido de 32 caracteres alfanuméricos'
        };
    }

    uuid = content.substring(4, 4 + 32); // Extraer los 32 caracteres del UUID
    currentPosition = 4 + 32;

    // Campo 4: Primer vencimiento (obligatorio)
    if (currentPosition + 4 > content.length || !content.substring(currentPosition, currentPosition + 2) === '01') {
        return {
            isValid: false,
            errorMessage: 'El campo de primer vencimiento debe comenzar con 01'
        };
    }

    // Longitud del campo 4
    const campo4Length = parseInt(content.substring(currentPosition + 2, currentPosition + 4), 10);

    if (currentPosition + 4 + campo4Length > content.length) {
        return {
            isValid: false,
            errorMessage: 'El campo de primer vencimiento está incompleto'
        };
    }

    // Fecha de primer vencimiento (AAMMDD - 6 dígitos)
    firstDueDate = content.substring(currentPosition + 4, currentPosition + 10);

    // Validar formato de fecha
    if (!/^\d{6}$/.test(firstDueDate)) {
        return {
            isValid: false,
            errorMessage: 'La fecha de primer vencimiento debe tener formato AAMMDD (6 dígitos numéricos)'
        };
    }

    // Monto del primer vencimiento (hasta 13 dígitos)
    const amountLength = campo4Length - 6; // Restamos los 6 dígitos de la fecha
    firstAmount = content.substring(currentPosition + 10, currentPosition + 10 + amountLength);
    // Validar formato de monto (hasta 13 dígitos, con posibilidad de 2 decimales)
    if (
        !/^\d{1,13}(\.\d{1,2})?$/.test(firstAmount) ||
        firstAmount.length > 13
        ) {
        return {
            isValid: false,
            errorMessage: 'El monto del primer vencimiento debe ser numérico (hasta 13 dígitos)'
        };
    }



    currentPosition += 4 + campo4Length;

    // Campo 5: Segundo vencimiento (opcional)
    let hasSecondDueDate = false;
    if (currentPosition + 4 <= content.length && content.substring(currentPosition, currentPosition + 2) === '02') {
        hasSecondDueDate = true;

        // Longitud del campo 5
        const campo5Length = parseInt(content.substring(currentPosition + 2, currentPosition + 4), 10);

        if (currentPosition + 4 + campo5Length > content.length) {
            return {
                isValid: false,
                errorMessage: 'El campo de segundo vencimiento está incompleto'
            };
        }

        // Días hasta el segundo vencimiento (2 dígitos)
        secondDueDays = content.substring(currentPosition + 4, currentPosition + 6);

        // Validar formato de días
        if (!/^\d{2}$/.test(secondDueDays)) {
            return {
                isValid: false,
                errorMessage: 'Los días hasta el segundo vencimiento deben ser 2 dígitos numéricos'
            };
        }

        // Monto del segundo vencimiento (hasta 13 dígitos)
        const secondAmountLength = campo5Length - 2; // Restamos los 2 dígitos de los días
        secondAmount = content.substring(currentPosition + 6, currentPosition + 6 + secondAmountLength);

        // Validar formato de monto
        if (
            !/^\d{1,13}(\.\d{1,2})?$/.test(secondAmount) ||
            secondAmount.length > 13
            ) {
            return {
                isValid: false,
                errorMessage: 'El monto del segundo vencimiento debe ser numérico (hasta 13 dígitos)'
            };
        }



        currentPosition += 4 + campo5Length;
    }

    // Campo 6: Tercer vencimiento (opcional)
    let hasThirdDueDate = false;
    if (currentPosition + 4 <= content.length && content.substring(currentPosition, currentPosition + 2) === '03') {
        hasThirdDueDate = true;

        // Longitud del campo 6
        const campo6Length = parseInt(content.substring(currentPosition + 2, currentPosition + 4), 10);

        if (currentPosition + 4 + campo6Length > content.length) {
            return {
                isValid: false,
                errorMessage: 'El campo de tercer vencimiento está incompleto'
            };
        }

        // Días hasta el tercer vencimiento (2 dígitos)
        thirdDueDays = content.substring(currentPosition + 4, currentPosition + 6);

        // Validar formato de días
        if (!/^\d{2}$/.test(thirdDueDays)) {
            return {
                isValid: false,
                errorMessage: 'Los días hasta el tercer vencimiento deben ser 2 dígitos numéricos'
            };
        }

        // Monto del tercer vencimiento (hasta 13 dígitos)
        const thirdAmountLength = campo6Length - 2; // Restamos los 2 dígitos de los días
        thirdAmount = content.substring(currentPosition + 6, currentPosition + 6 + thirdAmountLength);

        // Validar formato de monto
        if (
        !/^\d{1,13}(\.\d{1,2})?$/.test(thirdAmount) ||
        thirdAmount.length > 13
        ) {
            return {
                isValid: false,
                errorMessage: 'El monto del tercer vencimiento debe ser numérico (hasta 13 dígitos)'
            };
        }


    }

    return {
        uuid,
        firstDueDate,
        firstAmount,
        secondDueDays,
        secondAmount,
        thirdDueDays,
        thirdAmount,
        hasSecondDueDate,
        hasThirdDueDate,
        isValid: true
    };
}


// Función para mostrar el resultado exitoso del nodo 80 con opciones de edición
function showNode80Success(nodeContent, parseResult, position) {
    const { uuid, firstDueDate, firstAmount, secondDueDays, secondAmount, thirdDueDays, thirdAmount, hasSecondDueDate, hasThirdDueDate } = parseResult;

    const resultItem = document.createElement('div');
    resultItem.className = 'result-item warning';
    resultItem.id = 'node80-result';

    // Determinar el estado inicial basado en la validación manual previa
        const isManuallyVerified = manualValidationState.node80Verified;
        resultItem.className = isManuallyVerified ? 'result-item success' : 'result-item warning';
        resultItem.id = 'node80-result';

        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = isManuallyVerified 
            ? '✅ Nodo 80: Datos verificados manualmente'
            : '⚠️ Nodo 80: Datos requieren de verificación manual';

    // Contenedor para mostrar los valores
    const valuesContainer = document.createElement('div');
    valuesContainer.className = 'node80-values';

    // 1. UUID (obligatorio)
    const uuidDiv = document.createElement('div');
    uuidDiv.innerHTML = `<strong>UUID:</strong> <span id="displayed-node80-uuid">${uuid}</span> <span class="edit-icon" title="Editar UUID" id="edit-node80-uuid-icon"></span>`;

    // 2. Primer vencimiento (obligatorio)
    const firstDueDateFormatted = formatDateDisplay(firstDueDate);
    const firstDueDateDiv = document.createElement('div');
    firstDueDateDiv.innerHTML = `<strong>Primer vencimiento:</strong> <span id="displayed-first-due-date">${firstDueDateFormatted}</span> <span class="edit-icon" title="Editar fecha" id="edit-first-due-date-icon">✏️</span>`;

    const firstAmountDiv = document.createElement('div');
    firstAmountDiv.innerHTML = `<strong>Monto primer vencimiento:</strong> <span id="displayed-first-amount">${firstAmount}</span> <span class="edit-icon" title="Editar monto" id="edit-first-amount-icon">✏️</span>`;

    // 3. Segundo vencimiento (opcional)
    const secondDueDateDiv = document.createElement('div');
    if (hasSecondDueDate) {
        secondDueDateDiv.innerHTML = `<strong>Días hasta segundo vencimiento:</strong> <span id="displayed-second-due-days">${secondDueDays}</span> <span class="edit-icon" title="Editar días" id="edit-second-due-days-icon">✏️</span>`;
    } else {
        secondDueDateDiv.innerHTML = `<strong>Segundo vencimiento:</strong> <span id="displayed-second-due-days">No presente</span> <span class="add-icon" title="Agregar segundo vencimiento" id="add-second-due-date-icon">➕</span>`;
    }

    const secondAmountDiv = document.createElement('div');
    if (hasSecondDueDate) {
        secondAmountDiv.innerHTML = `<strong>Monto segundo vencimiento:</strong> <span id="displayed-second-amount">${secondAmount}</span> <span class="edit-icon" title="Editar monto" id="edit-second-amount-icon">✏️</span>`;
    } else {
        secondAmountDiv.style.display = 'none';
    }

    // 4. Tercer vencimiento (opcional)
    const thirdDueDateDiv = document.createElement('div');
    if (hasThirdDueDate) {
        thirdDueDateDiv.innerHTML = `<strong>Días hasta tercer vencimiento:</strong> <span id="displayed-third-due-days">${thirdDueDays}</span> <span class="edit-icon" title="Editar días" id="edit-third-due-days-icon">✏️</span>`;
    } else {
        thirdDueDateDiv.innerHTML = `<strong>Tercer vencimiento:</strong> <span id="displayed-third-due-days">No presente</span> <span class="add-icon" title="Agregar tercer vencimiento" id="add-third-due-date-icon">➕</span>`;
    }

    const thirdAmountDiv = document.createElement('div');
    if (hasThirdDueDate) {
        thirdAmountDiv.innerHTML = `<strong>Monto tercer vencimiento:</strong> <span id="displayed-third-amount">${thirdAmount}</span> <span class="edit-icon" title="Editar monto" id="edit-third-amount-icon">✏️</span>`;
    } else {
        thirdAmountDiv.style.display = 'none';
    }

    // Agregar los elementos al contenedor
    valuesContainer.appendChild(uuidDiv);
    valuesContainer.appendChild(firstDueDateDiv);
    valuesContainer.appendChild(firstAmountDiv);
    valuesContainer.appendChild(secondDueDateDiv);
    valuesContainer.appendChild(secondAmountDiv);
    valuesContainer.appendChild(thirdDueDateDiv);
    valuesContainer.appendChild(thirdAmountDiv);

    // Formularios de edición (inicialmente ocultos)
    const editFormsContainer = document.createElement('div');
    editFormsContainer.className = 'edit-forms-container';

    // 1. Formulario de edición para UUID
    const uuidForm = document.createElement('div');
    uuidForm.className = 'edit-form';
    uuidForm.id = 'edit-node80-uuid-form';
    uuidForm.style.display = 'none';
    uuidForm.innerHTML = `
        <input type="text" id="edit-node80-uuid-input" value="${uuid}" placeholder="UUID" maxlength="32">
        <button id="save-node80-uuid-btn">Guardar</button>
        <button id="cancel-node80-uuid-btn">Cancelar</button>
    `;

    // 2. Formulario de edición para Fecha del primer vencimiento
    const firstDueDateForm = document.createElement('div');
    firstDueDateForm.className = 'edit-form';
    firstDueDateForm.id = 'edit-first-due-date-form';
    firstDueDateForm.style.display = 'none';
    firstDueDateForm.innerHTML = `
        <input type="date" id="edit-first-due-date-input" value="${formatDateForInput(firstDueDate)}">
        <button id="save-first-due-date-btn">Guardar</button>
        <button id="cancel-first-due-date-btn">Cancelar</button>
    `;

    // 3. Formulario de edición para Monto del primer vencimiento
    const firstAmountForm = document.createElement('div');
    firstAmountForm.className = 'edit-form';
    firstAmountForm.id = 'edit-first-amount-form';
    firstAmountForm.style.display = 'none';
    firstAmountForm.innerHTML = `
        <input type="number" id="edit-first-amount-input" value="${firstAmount}" step="0.01" min="0" max="99999999999.99">
        <button id="save-first-amount-btn">Guardar</button>
        <button id="cancel-first-amount-btn">Cancelar</button>
    `;

    // 4. Formulario de edición para Días hasta el segundo vencimiento
    const secondDueDaysForm = document.createElement('div');
    secondDueDaysForm.className = 'edit-form';
    secondDueDaysForm.id = 'edit-second-due-days-form';
    secondDueDaysForm.style.display = 'none';
    secondDueDaysForm.innerHTML = `
        <input type="number" id="edit-second-due-days-input" value="${secondDueDays || ''}" min="1" max="99" placeholder="Días">
        <button id="save-second-due-days-btn">Guardar</button>
        <button id="cancel-second-due-days-btn">Cancelar</button>
    `;

    // 5. Formulario de edición para Monto del segundo vencimiento
    const secondAmountForm = document.createElement('div');
    secondAmountForm.className = 'edit-form';
    secondAmountForm.id = 'edit-second-amount-form';
    secondAmountForm.style.display = 'none';
    secondAmountForm.innerHTML = `
        <input type="number" id="edit-second-amount-input" value="${secondAmount || ''}" step="0.01" min="0" max="99999999999.99" placeholder="Monto">
        <button id="save-second-amount-btn">Guardar</button>
        <button id="cancel-second-amount-btn">Cancelar</button>
    `;

    // 6. Formulario de edición para Días hasta el tercer vencimiento
    const thirdDueDaysForm = document.createElement('div');
    thirdDueDaysForm.className = 'edit-form';
    thirdDueDaysForm.id = 'edit-third-due-days-form';
    thirdDueDaysForm.style.display = 'none';
    thirdDueDaysForm.innerHTML = `
        <input type="number" id="edit-third-due-days-input" value="${thirdDueDays || ''}" min="1" max="99" placeholder="Días">
        <button id="save-third-due-days-btn">Guardar</button>
        <button id="cancel-third-due-days-btn">Cancelar</button>
    `;

    // 7. Formulario de edición para Monto del tercer vencimiento
    const thirdAmountForm = document.createElement('div');
    thirdAmountForm.className = 'edit-form';
    thirdAmountForm.id = 'edit-third-amount-form';
    thirdAmountForm.style.display = 'none';
    thirdAmountForm.innerHTML = `
        <input type="number" id="edit-third-amount-input" value="${thirdAmount || ''}" step="0.01" min="0" max="99999999999.99" placeholder="Monto">
        <button id="save-third-amount-btn">Guardar</button>
        <button id="cancel-third-amount-btn">Cancelar</button>
    `;

    // Agregar los formularios al contenedor
    editFormsContainer.appendChild(uuidForm);
    editFormsContainer.appendChild(firstDueDateForm);
    editFormsContainer.appendChild(firstAmountForm);
    editFormsContainer.appendChild(secondDueDaysForm);
    editFormsContainer.appendChild(secondAmountForm);
    editFormsContainer.appendChild(thirdDueDaysForm);
    editFormsContainer.appendChild(thirdAmountForm);

    // Checkbox para validación manual
    const manualValidationDiv = document.createElement('div');
    manualValidationDiv.className = 'manual-validation';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'manual-validation-checkbox-node80';
    checkbox.checked = isManuallyVerified; // Restaurar el estado previo

    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('for', 'manual-validation-checkbox-node80');
    checkboxLabel.textContent = 'Verificado manualmente';

    manualValidationDiv.appendChild(checkbox);
    manualValidationDiv.appendChild(checkboxLabel);

    // Área para mostrar el contenido del nodo
    const nodeDetails = document.createElement('div');
    nodeDetails.className = 'node-details';

    const positionText = document.createElement('div');
    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.start + nodeContent.length - 1}`;

    const nodeContentElem = document.createElement('div');
    nodeContentElem.className = 'node-content';
    nodeContentElem.textContent = nodeContent;
    nodeContentElem.id = 'node80-content';

    nodeDetails.appendChild(positionText);
    nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
    nodeDetails.appendChild(nodeContentElem);

    // Armar el resultado final
    resultItem.appendChild(resultTitle);
    resultItem.appendChild(valuesContainer);
    resultItem.appendChild(editFormsContainer);
    resultItem.appendChild(manualValidationDiv);
    resultItem.appendChild(nodeDetails);

    // Agregar al contenedor de resultados
    resultsContainer.appendChild(resultItem);

    // Configurar los eventos para la edición
    setupNode80EditEvents(parseResult, position);
}

// Función para formatear la fecha AAMMDD a formato legible
function formatDateDisplay(dateStr) {
    // Extraer año, mes y día
    const year = parseInt('20' + dateStr.substring(0, 2), 10);
    const month = parseInt(dateStr.substring(2, 4), 10);
    const day = parseInt(dateStr.substring(4, 6), 10);

    // Crear objeto de fecha
    const date = new Date(year, month - 1, day);

    // Formatear a dd/mm/yyyy
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

    return formattedDate;
}

// Función para formatear la fecha para input tipo date (YYYY-MM-DD)
function formatDateForInput(dateStr) {
    // Extraer año, mes y día
    const year = parseInt('20' + dateStr.substring(0, 2), 10);
    const month = parseInt(dateStr.substring(2, 4), 10);
    const day = parseInt(dateStr.substring(4, 6), 10);

    // Formatear a YYYY-MM-DD
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Función para convertir fecha de input a formato AAMMDD
function formatDateToAammdd(dateStr) {
    // Formato esperado: YYYY-MM-DD
    const year = dateStr.substring(2, 4); // Tomamos solo los dos últimos dígitos del año
    const month = dateStr.substring(5, 7);
    const day = dateStr.substring(8, 10);

    return year + month + day;
}

// Función para configurar los eventos de edición del nodo 80
// Función para configurar los eventos de edición del nodo 80
function setupNode80EditEvents(parseResult, position) {
    // Referencias a los íconos de edición
    const editUuidIcon = document.getElementById('edit-node80-uuid-icon');
    const editFirstDueDateIcon = document.getElementById('edit-first-due-date-icon');
    const editFirstAmountIcon = document.getElementById('edit-first-amount-icon');

    let editSecondDueDaysIcon, editSecondAmountIcon;
    let editThirdDueDaysIcon, editThirdAmountIcon;

    // Configurar referencias para segundo vencimiento
    if (parseResult.hasSecondDueDate) {
        editSecondDueDaysIcon = document.getElementById('edit-second-due-days-icon');
        editSecondAmountIcon = document.getElementById('edit-second-amount-icon');
    } else {
        editSecondDueDaysIcon = document.getElementById('add-second-due-date-icon');
    }

    // Configurar referencias para tercer vencimiento
    if (parseResult.hasThirdDueDate) {
        editThirdDueDaysIcon = document.getElementById('edit-third-due-days-icon');
        editThirdAmountIcon = document.getElementById('edit-third-amount-icon');
    } else {
        editThirdDueDaysIcon = document.getElementById('add-third-due-date-icon');
    }

    // Referencias a los formularios
    const uuidForm = document.getElementById('edit-node80-uuid-form');
    const firstDueDateForm = document.getElementById('edit-first-due-date-form');
    const firstAmountForm = document.getElementById('edit-first-amount-form');
    const secondDueDaysForm = document.getElementById('edit-second-due-days-form');
    const secondAmountForm = document.getElementById('edit-second-amount-form');
    const thirdDueDaysForm = document.getElementById('edit-third-due-days-form');
    const thirdAmountForm = document.getElementById('edit-third-amount-form');

    // Referencias a los elementos mostrados
    const resultItem = document.getElementById('node80-result');
    const manualCheckbox = document.getElementById('manual-validation-checkbox-node80');

    // Evento para el checkbox de validación manual
    manualCheckbox.addEventListener('change', function() {
         // GUARDAR EL ESTADO EN LA VARIABLE GLOBAL
        manualValidationState.node80Verified = this.checked;
        if (this.checked) {
            resultItem.className = 'result-item success';
            resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 80: Datos verificados manualmente';
        } else {
            resultItem.className = 'result-item warning';
            resultItem.querySelector('.result-title').innerHTML = '⚠️ Nodo 80: Datos requieren de verificación manual';
        }
    });

    /* Eventos para el UUID
    editUuidIcon.addEventListener('click', function() {
        uuidForm.style.display = 'flex';
    });
    

    document.getElementById('cancel-node80-uuid-btn').addEventListener('click', function() {
        uuidForm.style.display = 'none';
    });

    document.getElementById('save-node80-uuid-btn').addEventListener('click', function() {
        const newUuid = document.getElementById('edit-node80-uuid-input').value.trim().replace(/-/g, '');

        // Validar el UUID (debe tener 32 caracteres alfanuméricos)
        if (newUuid.length !== 32 || !/^[a-zA-Z0-9]{32}$/.test(newUuid)) {
            alert('El UUID debe tener 32 caracteres alfanuméricos');
            return;
        }

        // Actualizar el UUID mostrado
        document.getElementById('displayed-node80-uuid').textContent = newUuid;
        uuidForm.style.display = 'none';

        // Actualizar el string QR con el nuevo nodo 80
        updateQRStringWithNewNode80(
            position,
            newUuid,
            parseResult.firstDueDate,
            parseResult.firstAmount,
            parseResult.secondDueDays,
            parseResult.secondAmount,
            parseResult.thirdDueDays,
            parseResult.thirdAmount,
            parseResult.hasSecondDueDate,
            parseResult.hasThirdDueDate
        );
    });
    */

    // Eventos para la fecha del primer vencimiento
    editFirstDueDateIcon.addEventListener('click', function() {
        firstDueDateForm.style.display = 'flex';
    });

    document.getElementById('cancel-first-due-date-btn').addEventListener('click', function() {
        firstDueDateForm.style.display = 'none';
    });

    document.getElementById('save-first-due-date-btn').addEventListener('click', function() {
        const newDateInput = document.getElementById('edit-first-due-date-input').value;

        if (!newDateInput) {
            alert('La fecha del primer vencimiento es obligatoria');
            return;
        }

        // Convertir a formato AAMMDD
        const newFirstDueDate = formatDateToAammdd(newDateInput);

        // Formatear para mostrar
        const formattedDate = formatDateDisplay(newFirstDueDate);

        // Actualizar la fecha mostrada
        document.getElementById('displayed-first-due-date').textContent = formattedDate;
        firstDueDateForm.style.display = 'none';

        // Actualizar parseResult
        parseResult.firstDueDate = newFirstDueDate;

        // Actualizar el QR
        updateQRStringWithNewNode80(
            position,
            parseResult.uuid,
            newFirstDueDate,
            parseResult.firstAmount,
            parseResult.secondDueDays,
            parseResult.secondAmount,
            parseResult.thirdDueDays,
            parseResult.thirdAmount,
            parseResult.hasSecondDueDate,
            parseResult.hasThirdDueDate
        );
    });

    // Eventos para el monto del primer vencimiento
    editFirstAmountIcon.addEventListener('click', function() {
        firstAmountForm.style.display = 'flex';
    });

    document.getElementById('cancel-first-amount-btn').addEventListener('click', function() {
        firstAmountForm.style.display = 'none';
    });

    document.getElementById('save-first-amount-btn').addEventListener('click', function() {
        const newAmountInput = parseFloat(document.getElementById('edit-first-amount-input').value);

        if (isNaN(newAmountInput) || newAmountInput <= 0) {
            alert('El monto del primer vencimiento debe ser un número positivo');
            return;
        }

        // Formatear el nuevo monto para mostrar
        const formattedAmount = newAmountInput;
        document.getElementById('displayed-first-amount').textContent = formattedAmount;
        firstAmountForm.style.display = 'none';

        // Convertir a formato sin decimales
        const unformattedAmount = formattedAmount;

        // Actualizar parseResult
        parseResult.firstAmount = unformattedAmount;

        // Actualizar el QR
        updateQRStringWithNewNode80(
            position,
            parseResult.uuid,
            parseResult.firstDueDate,
            unformattedAmount,
            parseResult.secondDueDays,
            parseResult.secondAmount,
            parseResult.thirdDueDays,
            parseResult.thirdAmount,
            parseResult.hasSecondDueDate,
            parseResult.hasThirdDueDate
        );
    });

    // Eventos para los días hasta el segundo vencimiento
    editSecondDueDaysIcon.addEventListener('click', function() {
        secondDueDaysForm.style.display = 'flex';

        // Si estamos agregando un segundo vencimiento nuevo
        if (!parseResult.hasSecondDueDate) {
            document.getElementById('displayed-second-due-days').textContent = 'Pendiente...';
            
            // Inicializar valores por defecto si no existen
            if (!parseResult.secondAmount) {
                parseResult.secondAmount = "000";
                document.getElementById('displayed-second-amount').textContent = '0.00';
            }

            // Mostrar el contenedor del monto si está oculto
            const secondAmountDiv = document.getElementById('displayed-second-amount').parentNode;
            if (secondAmountDiv) {
                secondAmountDiv.style.display = 'block';
            }
        }
    });

    document.getElementById('cancel-second-due-days-btn').addEventListener('click', function() {
        secondDueDaysForm.style.display = 'none';

        // Si estábamos agregando un nuevo segundo vencimiento y cancelamos
        if (!parseResult.hasSecondDueDate) {
            document.getElementById('displayed-second-due-days').textContent = 'No presente';

            // Ocultar el contenedor del monto
            const secondAmountDiv = document.getElementById('displayed-second-amount').parentNode;
            if (secondAmountDiv) {
                secondAmountDiv.style.display = 'none';
            }
        }
    });

    document.getElementById('save-second-due-days-btn').addEventListener('click', function() {
        const newDays = document.getElementById('edit-second-due-days-input').value;

        // Validar los días
        if (!newDays || isNaN(parseInt(newDays)) || parseInt(newDays) < 1 || parseInt(newDays) > 99) {
            alert('Los días hasta el segundo vencimiento deben ser un número entre 1 y 99');
            return;
        }

        // Formatear días como 2 dígitos
        const formattedDays = parseInt(newDays).toString().padStart(2, '0');

        // Actualizar los días mostrados
        document.getElementById('displayed-second-due-days').textContent = formattedDays;
        secondDueDaysForm.style.display = 'none';

        // Si estamos agregando un segundo vencimiento nuevo
        if (!parseResult.hasSecondDueDate) {
            // Actualizar parseResult primero
            parseResult.hasSecondDueDate = true;
            parseResult.secondDueDays = formattedDays;
            if (!parseResult.secondAmount) {
                parseResult.secondAmount = "000";
            }

            // Cambiar el ícono de agregar por uno de editar
            const addIcon = document.getElementById('add-second-due-date-icon');
            if (addIcon) {
                addIcon.className = 'edit-icon';
                addIcon.id = 'edit-second-due-days-icon';
                addIcon.title = 'Editar días';
            }

            // Agregar un ícono de edición para el monto si no existe
            const secondAmountText = document.querySelector('#displayed-second-amount');
            if (secondAmountText && !document.getElementById('edit-second-amount-icon')) {
                const editIcon = document.createElement('span');
                editIcon.className = 'edit-icon';
                editIcon.id = 'edit-second-amount-icon';
                editIcon.title = 'Editar monto';
                editIcon.textContent = '✏️';
                secondAmountText.parentNode.appendChild(editIcon);

                // Configurar evento para el nuevo ícono
                editIcon.addEventListener('click', function() {
                    secondAmountForm.style.display = 'flex';
                });
            }

            // Actualizar la referencia al nuevo ícono
            editSecondAmountIcon = document.getElementById('edit-second-amount-icon');

            // Abrir el formulario de edición del monto inmediatamente
            setTimeout(() => {
                secondAmountForm.style.display = 'flex';
            }, 100);
        } else {
            // Solo actualizar los días si ya existía el segundo vencimiento
            parseResult.secondDueDays = formattedDays;
        }

        // Actualizar el QR
        updateQRStringWithNewNode80(
            position,
            parseResult.uuid,
            parseResult.firstDueDate,
            parseResult.firstAmount,
            formattedDays,
            parseResult.secondAmount,
            parseResult.thirdDueDays,
            parseResult.thirdAmount,
            true,
            parseResult.hasThirdDueDate
        );
    });

    // Eventos para el monto del segundo vencimiento
    if (parseResult.hasSecondDueDate && editSecondAmountIcon) {
        editSecondAmountIcon.addEventListener('click', function() {
            secondAmountForm.style.display = 'flex';
        });
    }

    document.getElementById('cancel-second-amount-btn').addEventListener('click', function() {
        secondAmountForm.style.display = 'none';
    });

    document.getElementById('save-second-amount-btn').addEventListener('click', function() {
        const newAmountInput = parseFloat(document.getElementById('edit-second-amount-input').value);

        if (isNaN(newAmountInput) || newAmountInput <= 0) {
            alert('El monto del segundo vencimiento debe ser un número positivo');
            return;
        }

        // Formatear el nuevo monto para mostrar
        const formattedAmount = newAmountInput;
        document.getElementById('displayed-second-amount').textContent = formattedAmount;
        secondAmountForm.style.display = 'none';

        // Convertir a formato sin decimales
        const unformattedAmount = formattedAmount;

        // Actualizar parseResult
        parseResult.secondAmount = unformattedAmount;

        // Actualizar el QR
        updateQRStringWithNewNode80(
            position,
            parseResult.uuid,
            parseResult.firstDueDate,
            parseResult.firstAmount,
            parseResult.secondDueDays,
            unformattedAmount,
            parseResult.thirdDueDays,
            parseResult.thirdAmount,
            parseResult.hasSecondDueDate,
            parseResult.hasThirdDueDate
        );
    });

    // Eventos para los días hasta el tercer vencimiento
    editThirdDueDaysIcon.addEventListener('click', function() {
        thirdDueDaysForm.style.display = 'flex';

        // Si estamos agregando un tercer vencimiento nuevo
        if (!parseResult.hasThirdDueDate) {
            document.getElementById('displayed-third-due-days').textContent = 'Pendiente...';
            
            // Inicializar valores por defecto si no existen
            if (!parseResult.thirdAmount) {
                parseResult.thirdAmount = "000";
                document.getElementById('displayed-third-amount').textContent = '0.00';
            }

            // Mostrar el contenedor del monto si está oculto
            const thirdAmountDiv = document.getElementById('displayed-third-amount').parentNode;
            if (thirdAmountDiv) {
                thirdAmountDiv.style.display = 'block';
            }
        }
    });

    document.getElementById('cancel-third-due-days-btn').addEventListener('click', function() {
        thirdDueDaysForm.style.display = 'none';

        // Si estábamos agregando un nuevo tercer vencimiento y cancelamos
        if (!parseResult.hasThirdDueDate) {
            document.getElementById('displayed-third-due-days').textContent = 'No presente';

            // Ocultar el contenedor del monto
            const thirdAmountDiv = document.getElementById('displayed-third-amount').parentNode;
            if (thirdAmountDiv) {
                thirdAmountDiv.style.display = 'none';
            }
        }
    });

    document.getElementById('save-third-due-days-btn').addEventListener('click', function() {
        const newDays = document.getElementById('edit-third-due-days-input').value;

        // Validar los días
        if (!newDays || isNaN(parseInt(newDays)) || parseInt(newDays) < 1 || parseInt(newDays) > 99) {
            alert('Los días hasta el tercer vencimiento deben ser un número entre 1 y 99');
            return;
        }

        // Formatear días como 2 dígitos
        const formattedDays = parseInt(newDays).toString().padStart(2, '0');

        // Actualizar los días mostrados
        document.getElementById('displayed-third-due-days').textContent = formattedDays;
        thirdDueDaysForm.style.display = 'none';

        // Si estamos agregando un tercer vencimiento nuevo
        if (!parseResult.hasThirdDueDate) {
            // Actualizar parseResult primero
            parseResult.hasThirdDueDate = true;
            parseResult.thirdDueDays = formattedDays;
            if (!parseResult.thirdAmount) {
                parseResult.thirdAmount = "000";
            }

            // Cambiar el ícono de agregar por uno de editar
            const addIcon = document.getElementById('add-third-due-date-icon');
            if (addIcon) {
                addIcon.className = 'edit-icon';
                addIcon.id = 'edit-third-due-days-icon';
                addIcon.title = 'Editar días';
            }

            // Agregar un ícono de edición para el monto si no existe
            const thirdAmountText = document.querySelector('#displayed-third-amount');
            if (thirdAmountText && !document.getElementById('edit-third-amount-icon')) {
                const editIcon = document.createElement('span');
                editIcon.className = 'edit-icon';
                editIcon.id = 'edit-third-amount-icon';
                editIcon.title = 'Editar monto';
                editIcon.textContent = '✏️';
                thirdAmountText.parentNode.appendChild(editIcon);

                // Configurar evento para el nuevo ícono
                editIcon.addEventListener('click', function() {
                    thirdAmountForm.style.display = 'flex';
                });
            }

            // Actualizar la referencia al nuevo ícono
            editThirdAmountIcon = document.getElementById('edit-third-amount-icon');

            // Abrir el formulario de edición del monto inmediatamente
            setTimeout(() => {
                thirdAmountForm.style.display = 'flex';
            }, 100);
        } else {
            // Solo actualizar los días si ya existía el tercer vencimiento
            parseResult.thirdDueDays = formattedDays;
        }

        // Actualizar el QR
        updateQRStringWithNewNode80(
            position,
            parseResult.uuid,
            parseResult.firstDueDate,
            parseResult.firstAmount,
            parseResult.secondDueDays,
            parseResult.secondAmount,
            formattedDays,
            parseResult.thirdAmount,
            parseResult.hasSecondDueDate,
            true
        );
    });

    // Eventos para el monto del tercer vencimiento
    if (parseResult.hasThirdDueDate && editThirdAmountIcon) {
        editThirdAmountIcon.addEventListener('click', function() {
            thirdAmountForm.style.display = 'flex';
        });
    }

    document.getElementById('cancel-third-amount-btn').addEventListener('click', function() {
        thirdAmountForm.style.display = 'none';
    });

    document.getElementById('save-third-amount-btn').addEventListener('click', function() {
        const newAmountInput = parseFloat(document.getElementById('edit-third-amount-input').value);

        if (isNaN(newAmountInput) || newAmountInput <= 0) {
            alert('El monto del tercer vencimiento debe ser un número positivo');
            return;
        }

        // Formatear el nuevo monto para mostrar
        const formattedAmount = newAmountInput;
        document.getElementById('displayed-third-amount').textContent = formattedAmount;
        thirdAmountForm.style.display = 'none';

        // Convertir a formato sin decimales
        const unformattedAmount = formattedAmount;

        // Actualizar parseResult
        parseResult.thirdAmount = unformattedAmount;

        // Actualizar el QR
        updateQRStringWithNewNode80(
            position,
            parseResult.uuid,
            parseResult.firstDueDate,
            parseResult.firstAmount,
            parseResult.secondDueDays,
            parseResult.secondAmount,
            parseResult.thirdDueDays,
            unformattedAmount,
            parseResult.hasSecondDueDate,
            true
        );
    });
}

// Función para actualizar el string QR con el nuevo nodo 80
function updateQRStringWithNewNode80(position, uuid, firstDueDate, firstAmount, secondDueDays, secondAmount, thirdDueDays, thirdAmount, hasSecondDueDate, hasThirdDueDate) {
    // Obtener el string QR actual
    let qrString = qrStringInput.value.trim();

    // Construir el nuevo contenido del nodo 80
    let newNode80Content = '80';

    // Construir los campos internos
    let node80InnerContent = `0032${uuid}`;

    // Primer vencimiento (obligatorio)
    // Calculamos la longitud del campo 4 (primer vencimiento)
    // La longitud incluye la fecha (6 dígitos) + el monto (variable)
    const firstAmountClean = firstAmount.toString();
    const campo4Length = 6 + firstAmountClean.length;
    node80InnerContent += `01${campo4Length.toString().padStart(2, '0')}${firstDueDate}${firstAmountClean}`;

    // Segundo vencimiento (opcional)
    if (hasSecondDueDate && secondDueDays && secondAmount) {
        const secondAmountClean = secondAmount.toString();
        // La longitud incluye los días (2 dígitos) + el monto (variable)
        const campo5Length = 2 + secondAmountClean.length;
        node80InnerContent += `02${campo5Length.toString().padStart(2, '0')}${secondDueDays}${secondAmountClean}`;
    }

    // Tercer vencimiento (opcional)
    if (hasThirdDueDate && thirdDueDays && thirdAmount) {
        const thirdAmountClean = thirdAmount.toString();
        // La longitud incluye los días (2 dígitos) + el monto (variable)
        const campo6Length = 2 + thirdAmountClean.length;
        node80InnerContent += `03${campo6Length.toString().padStart(2, '0')}${thirdDueDays}${thirdAmountClean}`;
    }

    // Calcular la longitud total del nodo 80 (sin contar los primeros 4 caracteres "80xx")
    const totalLength = node80InnerContent.length;
    newNode80Content += totalLength.toString().padStart(2, '0') + node80InnerContent;

    // Encontrar la posición del nodo 80 existente
    const node80Start = position.start;

    // Buscar el final del nodo 80 existente
    let node80End;

    // Si estamos en el final del string, simplemente tomamos hasta el final
    if (node80Start + 4 >= qrString.length) {
        node80End = qrString.length;
    } else {
        // Obtener la longitud indicada por los dos dígitos después de "80"
        const existingLength = parseInt(qrString.substring(node80Start + 2, node80Start + 4), 10);
        node80End = node80Start + 4 + existingLength;

        // Si la longitud calculada excede la longitud del string, limitarla
        if (node80End > qrString.length) {
            node80End = qrString.length;
        }
    }

    // Reemplazar el nodo 80 existente con el nuevo
    const newQrString =
        qrString.substring(0, node80Start) +
        newNode80Content +
        qrString.substring(node80End);

    // Actualizar el input
    qrStringInput.value = newQrString;

    // Actualizar el contenido del nodo mostrado
    const nodeContent = document.getElementById('node80-content');
    if (nodeContent) {
        nodeContent.textContent = newNode80Content;
    }

    // Volver a analizar el string QR
    analyzeQRString();
}
//---------------------------------------------------------- NODO 63 PROBAR CALCULADORA DE CRC

// VALIDACION NODO 63 (CRC)
function validateNode63(qrString, position) {
    // Obtener el contenido del nodo 63 a partir de la posición
    const nodeContent = qrString.substring(position.start, position.end);

    // El nodo 63 debe tener el formato correcto
    if (!nodeContent.startsWith('6304')) {
        showError('Nodo 63', `El nodo debe comenzar con 6304`, nodeContent, position);
        return;
    }

    // Extraer el CRC que comienza después de "6304"
    const crc = nodeContent.substring(4, 8);

    // Verificar que el CRC tenga 4 caracteres alfanuméricos
    if (crc.length !== 4 || !/^[A-Za-z0-9]{4}$/.test(crc)) {
        showError('Nodo 63', `El CRC debe ser un valor alfanumérico de 4 caracteres, pero se encontró: ${crc}`, nodeContent, position);
        return;
    }

    // Calcular el CRC esperado usando la función calcularCRC()
    // El string QR para calcular el CRC es todo el QR excepto los últimos 4 caracteres
    const qrStringForCRC = qrString.substring(0, qrString.length - 4);
    const expectedCRC = calcularCRC(qrStringForCRC);

    // Comparar el CRC encontrado con el esperado
    if (crc === expectedCRC) {
        showSuccess('Nodo 63', `CRC verificado correctamente: ${crc}`, nodeContent, position);
    } else {
        // Si no coincide, mostrar error con opción para corregir
        showCRCError(nodeContent, crc, expectedCRC, position, qrString);
    }
}

// VISUALIZACION Y CORRECCION DE CRC (Relacion a nodo 63)
function showCRCError(nodeContent, foundCRC, expectedCRC, position, qrString) {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item error';
    resultItem.id = 'node63-result';

    const resultTitle = document.createElement('div');
    resultTitle.className = 'result-title';
    resultTitle.innerHTML = `❌ Nodo 63: CRC incorrecto`;

    const resultMessage = document.createElement('div');
    resultMessage.innerHTML = `
        <strong>CRC encontrado:</strong> <span id="displayed-crc">${foundCRC}</span><br>
        <strong>CRC esperado:</strong> <span id="expected-crc">${expectedCRC}</span>
    `;

    // Botón para corregir el CRC
    const fixButton = document.createElement('button');
    fixButton.id = 'fix-crc-btn';
    fixButton.className = 'fix-button';
    fixButton.textContent = 'Corregir CRC';

    // Área para mostrar el contenido del nodo
    const nodeDetails = document.createElement('div');
    nodeDetails.className = 'node-details';

    const positionText = document.createElement('div');
    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.start + 7}`;

    const nodeContentElem = document.createElement('div');
    nodeContentElem.className = 'node-content';
    nodeContentElem.textContent = nodeContent;
    nodeContentElem.id = 'node63-content';

    nodeDetails.appendChild(positionText);
    nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
    nodeDetails.appendChild(nodeContentElem);

    // Armar el resultado
    resultItem.appendChild(resultTitle);
    resultItem.appendChild(resultMessage);
    resultItem.appendChild(fixButton);
    resultItem.appendChild(nodeDetails);

    // Agregar al contenedor de resultados
    resultsContainer.appendChild(resultItem);

    // Asociar eventos a los elementos creados
    setupCRCFixEvent(foundCRC, expectedCRC, position, qrString);
}

function showSuccess(nodeName, message, nodeContent, position) {
    console.log("SHOOOOOOW")
    console.log(position)
    console.log(nodeContent)
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item success';

    const resultTitle = document.createElement('div');
    resultTitle.className = 'result-title';
    resultTitle.innerHTML = `✅ ${nodeName}: ${message}`;

    // Área para mostrar el contenido del nodo
    const nodeDetails = document.createElement('div');
    nodeDetails.className = 'node-details';

    const positionText = document.createElement('div');
    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.start + nodeContent.length - 1}`;

    const nodeContentElem = document.createElement('div');
    nodeContentElem.className = 'node-content';
    nodeContentElem.textContent = nodeContent;

    nodeDetails.appendChild(positionText);
    nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
    nodeDetails.appendChild(nodeContentElem);

    // Armar el resultado
    resultItem.appendChild(resultTitle);
    resultItem.appendChild(nodeDetails);

    // Agregar al contenedor de resultados
    resultsContainer.appendChild(resultItem);
}

function setupCRCFixEvent(foundCRC, expectedCRC, position, qrString) {
    const fixCrcBtn = document.getElementById('fix-crc-btn');

    fixCrcBtn.addEventListener('click', function() {
        // Actualizar el CRC en el string QR
        updateQRStringWithCorrectCRC(foundCRC, expectedCRC, position, qrString);

        // Cambiar el estado visual del resultado
        const resultItem = document.getElementById('node63-result');
        resultItem.className = 'result-item success';
        resultItem.querySelector('.result-title').innerHTML = '✅ Nodo 63: CRC corregido';

        // Actualizar el CRC mostrado en el contenido del nodo
        const nodeContent = document.getElementById('node63-content');
        if (nodeContent) {
            // Actualizar la presentación del nodo completo con el nuevo CRC
            const prefix = nodeContent.textContent.substring(0, 4); // "6304"
            const suffix = nodeContent.textContent.substring(4 + foundCRC.length); // Si hay algo después del CRC
            nodeContent.textContent = prefix + expectedCRC + suffix;
        }

        // Actualizar el CRC mostrado
        document.getElementById('displayed-crc').textContent = expectedCRC;

        // Desactivar el botón
        this.disabled = true;
        this.style.display = 'none';
        this.textContent = 'CRC Corregido';
    });
}

function updateQRStringWithCorrectCRC(oldCRC, newCRC, position, qrString) {
    // Obtener el string QR actual del input
    let qrStringInput = document.getElementById('qrString');

    // Calcular la posición exacta del CRC en el string QR
    const crcPosition = position.start + 4; // La posición donde comienza el CRC (después de "6304")

    if (crcPosition + oldCRC.length <= qrString.length) {
        // Reemplazar el CRC en la posición exacta
        const newQrString =
            qrString.substring(0, crcPosition) +
            newCRC +
            qrString.substring(crcPosition + oldCRC.length);

        // Actualizar el input
        qrStringInput.value = newQrString;
    } else {
        alert('No se pudo actualizar el CRC en la posición exacta. El string QR es demasiado corto.');
    }

    // Volver a analizar el string QR
    analyzeQRString();
}





















/**
 * Función para calcular el CRC según el estándar ISO/IEC 13239
 * utilizando el polinomio '1021' (hex) y un valor inicial 'FFFF' (hex)
 * @param {string} stringQR - String del código QR sobre el cual calcular el CRC
 * @returns {string} - Valor CRC como string alfanumérico de 4 caracteres
 */
function calcularCRC(stringQR) {
  // Polinomio y valor inicial según especificaciones
  const polinomio = 0x1021;
  let crc = 0xFFFF;

  // Convertir string a array de bytes
  const bytes = [];
  for (let i = 0; i < stringQR.length; i++) {
    bytes.push(stringQR.charCodeAt(i));
  }

  // Calcular CRC según ISO/IEC 13239
  for (let i = 0; i < bytes.length; i++) {
    crc ^= (bytes[i] << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polinomio) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  // Convertir el resultado a una cadena alfanumérica de 4 caracteres
  return convertirACaracteresAlfanumericos(crc);
}

/**
 * Convierte un valor hexadecimal a una representación alfanumérica
 * @param {number} valor - Valor hexadecimal de 2 bytes (16 bits)
 * @returns {string} - Representación alfanumérica de 4 caracteres
 */
function convertirACaracteresAlfanumericos(valor) {
  const caracteresAlfanumericos = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
  let resultado = "";

  // Extraer cada nibble (4 bits) y convertirlo a su valor alfanumérico
  for (let i = 12; i >= 0; i -= 4) {
    const nibble = (valor >> i) & 0xF;
    if (nibble < caracteresAlfanumericos.length) {
      resultado += caracteresAlfanumericos[nibble];
    } else {
      // En caso de que el valor esté fuera del rango de caracteres alfanuméricos
      resultado += "?";
    }
  }

  return resultado;
}


//----------------------------------------------------------
// Valor de la variable CODIGO_QR
function validarQRAPI(qrStringInput) {
    const resultsContainer = document.getElementById('results'); // Asegúrate de tener este contenedor

    // Limpiamos entradas previas (opcional)
    // resultsContainer.innerHTML = '';

    const CODIGO_QR = qrStringInput;

    const url = `/api/resolve?data=${encodeURIComponent(CODIGO_QR)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Respuesta de la API:', data);

            // Crear contenedor estilo showInfo
            const resultItem = document.createElement('div');
            resultItem.className = 'positions-info';

            const resultTitle = document.createElement('div');
            resultTitle.className = 'result-title';
            resultTitle.textContent = 'ℹ️ Resultado de la validación QR';

            const resultMessage = document.createElement('div');
            resultMessage.textContent = 'Respuesta recibida de la API:';

            // Mostrar el contenido de la respuesta formateado
            const responseContent = document.createElement('pre');
            responseContent.className = 'node-content';
            responseContent.textContent = JSON.stringify(data, null, 2); // formato legible

            resultItem.appendChild(resultTitle);
            resultItem.appendChild(resultMessage);
            resultItem.appendChild(responseContent);

            resultsContainer.appendChild(resultItem);
        })
        .catch(error => {
            console.error('Error al consultar la API:', error);

            const resultItem = document.createElement('div');
            resultItem.className = 'positions-info';

            const resultTitle = document.createElement('div');
            resultTitle.className = 'result-title';
            resultTitle.textContent = '❌ Error al validar QR';

            const resultMessage = document.createElement('div');
            resultMessage.textContent = error.message;

            resultItem.appendChild(resultTitle);
            resultItem.appendChild(resultMessage);

            resultsContainer.appendChild(resultItem);
        });
}


//----------------------------------------------------------

            // MUESTRA DE MENSAJES DE EXITO Y ERROR
            function showSuccess(title, message, nodeContent, position) {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item success';

                const resultTitle = document.createElement('div');
                resultTitle.className = 'result-title';
                resultTitle.textContent = `✅ ${title}: Validación exitosa`;

                const resultMessage = document.createElement('div');
                resultMessage.textContent = message;

                resultItem.appendChild(resultTitle);
                resultItem.appendChild(resultMessage);

                if (nodeContent) {
                    const nodeDetails = document.createElement('div');
                    nodeDetails.className = 'node-details';

                    const positionText = document.createElement('div');
                      // Calcular end si no existe
                    const endPosition = position.end !== undefined ? position.end : position.start + nodeContent.length - 1;
                    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${endPosition}`;
                    nodeDetails.appendChild(positionText);

                    const nodeContentElem = document.createElement('div');
                    nodeContentElem.className = 'node-content';
                    nodeContentElem.textContent = nodeContent;

                    nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
                    nodeDetails.appendChild(nodeContentElem);
                    resultItem.appendChild(nodeDetails);
                }

                resultsContainer.appendChild(resultItem);
            }

            function showError(title, message, nodeContent, position) {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item error';

                const resultTitle = document.createElement('div');
                resultTitle.className = 'result-title';
                resultTitle.textContent = `❌ ${title}: Error de validación`;

                const resultMessage = document.createElement('div');
                resultMessage.textContent = message;

                resultItem.appendChild(resultTitle);
                resultItem.appendChild(resultMessage);

                if (nodeContent && position) {
                    const nodeDetails = document.createElement('div');
                    nodeDetails.className = 'node-details';

                    const positionText = document.createElement('div');
                    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.end}`;
                    nodeDetails.appendChild(positionText);

                    const nodeContentElem = document.createElement('div');
                    nodeContentElem.className = 'node-content';
                    nodeContentElem.textContent = nodeContent;

                    nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
                    nodeDetails.appendChild(nodeContentElem);
                    resultItem.appendChild(nodeDetails);
                }

                resultsContainer.appendChild(resultItem);
            }

            function showInfo(title, message, nodeContent, position) {
                const resultItem = document.createElement('div');
                resultItem.className = 'positions-info';

                const resultTitle = document.createElement('div');
                resultTitle.className = 'result-title';
                resultTitle.textContent = `ℹ️ ${title}: No se realizó validación`;

                const resultMessage = document.createElement('div');
                resultMessage.textContent = message;

                resultItem.appendChild(resultTitle);
                resultItem.appendChild(resultMessage);

                if (nodeContent && position) {
                    const nodeDetails = document.createElement('div');
                    nodeDetails.className = 'node-details';

                    const positionText = document.createElement('div');
                    positionText.innerHTML = `<strong>Posición:</strong> ${position.start}-${position.end}`;
                    nodeDetails.appendChild(positionText);

                    const nodeContentElem = document.createElement('div');
                    nodeContentElem.className = 'node-content';
                    nodeContentElem.textContent = nodeContent;

                    nodeDetails.appendChild(document.createTextNode('Contenido del nodo:'));
                    nodeDetails.appendChild(nodeContentElem);
                    resultItem.appendChild(nodeDetails);
                }

                resultsContainer.appendChild(resultItem);
            }

            function showPositionsInfo() {
                const resultItem = document.createElement('div');
                resultItem.className = 'positions-info';

                const resultTitle = document.createElement('div');
                resultTitle.className = 'result-title';
                resultTitle.textContent = 'ℹ️ Posiciones de Nodos en StringQR';

                const tableHTML = `
                    <table class="positions-table">
                        <thead>
                            <tr>
                                <th>Nodo</th>
                                <th>Posición inicio</th>
                                <th>Longitud</th>
                                <th>Posición fin</th>
                                <th>Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>00</td>
                                <td>${nodePositions['00'].start}</td>
                                <td>${nodePositions['00'].length}</td>
                                <td>${nodePositions['00'].start + nodePositions['00'].length - 1}</td>
                                <td>Prefijo validación</td>
                            </tr>
                            <tr>
                                <td>01</td>
                                <td>${nodePositions['01'].start}</td>
                                <td>${nodePositions['01'].length}</td>
                                <td>${nodePositions['01'].start + nodePositions['01'].length - 1}</td>
                                <td>Prefijo secundario</td>
                            </tr>
                            <tr>
                                <td>41</td>
                                <td>${nodePositions['41'].start}</td>
                                <td>${nodePositions['41'].length}</td>
                                <td>${nodePositions['41'].start + nodePositions['41'].length - 1}</td>
                                <td>Datos de la cuenta</td>
                            </tr>
                            <tr>
                                <td>50</td>
                                <td>${nodePositions['50'].start}</td>
                                <td>${nodePositions['50'].length}</td>
                                <td>${nodePositions['50'].start + nodePositions['50'].length - 1}</td>
                                <td>CUIT (posición ${nodePositions['50'].start + 9} a ${nodePositions['50'].start + 19})</td>
                            </tr>
                        </tbody>
                    </table>
                `;

                const descriptionHTML = `
                    <p style="margin-top: 15px;">La validación ahora se realiza por posiciones fijas en lugar de buscar secuencias numéricas:</p>
                    <ul style="margin-left: 20px; margin-top: 10px; list-style-type: disc;">
                        <li>Los nodos se extraen de posiciones específicas del StringQR</li>
                        <li>El CUIT se encuentra en la posición ${nodePositions['50'].start + 9} a ${nodePositions['50'].start + 19}</li>
                        <li>Al editar el CUIT, se reemplaza exactamente en esa posición</li>
                    </ul>
                `;

                resultItem.appendChild(resultTitle);
                resultItem.innerHTML += tableHTML + descriptionHTML;

                resultsContainer.appendChild(resultItem);
            }

            // Ejemplo predefinido para facilitar pruebas
            qrStringInput.value = '00020101021141420017ar.com.bancoroela98113059891004599020150150011202339532705126002224700056100000005829385204869953030325802AR5924CREMONA  MARCELO GABRIEL6007CORDOBA6108X5014AXH62590032b1565d38371b11f09cd20242ac1200020619000000044515005829380730032b1565d38371b11f09cd20242ac12000201112505221000002070120000030701300006304B97D';
        
        
 // Verificar que jsQR se haya cargado
        window.addEventListener('load', () => {
            if (typeof jsQR === 'undefined') {
                console.error('jsQR no se pudo cargar. Intentando cargar manualmente...');
                loadJsQRManually();
            } else {
                console.log('jsQR cargado correctamente');
            }
        });

        // Función para cargar jsQR manualmente si falla el CDN
        function loadJsQRManually() {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/jsqr@1.4.0/dist/jsQR.js';
            script.onload = () => {
                console.log('jsQR cargado desde unpkg');
            };
            script.onerror = () => {
                console.error('Error cargando jsQR desde unpkg también');
                showErrorAnalizer('Error: No se pudo cargar la librería de decodificación. Verifica tu conexión a internet.');
            };
            document.head.appendChild(script);
        }
        const fileInput = document.getElementById('fileInput');
        const preview = document.getElementById('preview');
        const result = document.getElementById('result');
        const qrContent = document.getElementById('qrContent');
        const loading = document.getElementById('loading');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const uploadArea = document.querySelector('.upload-area');
        const clearBtn = document.getElementById('clearBtn');

        // Eventos de drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        function handleFile(file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                showErrorAnalizer('Por favor, selecciona un archivo de imagen válido.');
                return;
            }

            // Mostrar loading
            loading.style.display = 'block';
            result.style.display = 'none';

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Mostrar vista previa
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    clearBtn.style.display = 'inline-block';

                    // Procesar imagen
                    processImage(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function processImage(img) {
            // Verificar que jsQR esté disponible
            if (typeof jsQR === 'undefined') {
                loading.style.display = 'none';
                showErrorAnalizer('Error: La librería de decodificación no está disponible. Recarga la página e inténtalo de nuevo.');
                return;
            }

            // Ajustar canvas al tamaño de la imagen
            canvas.width = img.width;
            canvas.height = img.height;

            // Dibujar imagen en canvas
            ctx.drawImage(img, 0, 0);

            // Obtener datos de imagen
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            try {
                // Decodificar QR
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                loading.style.display = 'none';

                if (code) {
                    showResultAnalizer(code.data);
                } else {
                    showErrorAnalizer('No se pudo detectar un código QR en esta imagen. Asegúrate de que la imagen sea clara y contenga un código QR válido.');
                }
            } catch (error) {
                loading.style.display = 'none';
                showErrorAnalizer('Error al procesar la imagen: ' + error.message);
            }
        }

        function showResultAnalizer(text) {
            qrContent.textContent = text;
            result.className = 'result-container';
            result.style.display = 'block';
            copyBtnAnalizer.style.display = 'block';
        }

        function showErrorAnalizer(message) {
            qrContent.textContent = message;
            result.className = 'result-container error';
            result.style.display = 'block';
            copyBtnAnalizer.style.display = 'none';
        }

        const copyBtnAnalizer = document.getElementById('copy-btn');
        copyBtnAnalizer.addEventListener('click', function() {
        copyToClipboard()
    });

        clearBtn.addEventListener('click', function() {
        clearAll()
    });


        function copyToClipboard() {
            const text = qrContent.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '¡Copiado!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }).catch(() => {
                // Fallback para navegadores que no soportan clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '¡Copiado!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        }

        function clearAll() {
            preview.style.display = 'none';
            result.style.display = 'none';
            clearBtn.style.display = 'none';
            fileInput.value = '';
            qrContent.textContent = '';
        }
        
        
        });