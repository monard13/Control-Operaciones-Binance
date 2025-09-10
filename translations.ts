
export const translations = {
  en: {
    // General
    back: 'Back',
    clear: 'Clear',
    status: 'Status',
    action: 'Action',
    type: 'Type',
    total: 'Total',
    fee: 'Fee',
    paid: 'Paid',
    processing: 'Processing...',
    errorOccurred: 'An unknown error occurred.',

    // Tabs
    dashboard: 'Dashboard',
    purchaseOrderGenerator: 'Purchase Order Generator',
    operationsHistory: 'Operations History',

    // Dashboard View
    dashboardTitle: 'Financial Dashboard',
    dashboardSubtitle: 'A consolidated view of your operations.',
    totalOrders: 'Total Orders',
    totalPendingAmount: 'Total Pending Amount',
    totalPaidAmount: 'Total Paid Amount',
    totalBRLExecuted: 'Total BRL Executed',
    totalUSDTExecuted: 'Total USDT Executed',
    totalFeesPaid: 'Total Fees Paid',

    // Generator View
    generatorTitle: 'Purchase Order Generator',
    generatorSubtitle: 'Enter a total amount to generate a series of Purchase Order payments.',
    config: 'Configuration',
    maxPixValue: 'Maximum PIX Value',
    maxPixValueDescription: 'This value is used in the formula to determine the number of values to generate.',
    totalAmountPlaceholder: 'Total amount of the Purchase Order',
    generate: 'Generate',
    generating: 'Generating...',
    willGenerateLinks: 'It will generate',
    paymentLinks: 'payment links.',
    generatedResults: 'Generated Results',
    registerOperation: 'Register Operation',
    registeredOrders: 'Registered Orders',
    poCode: 'PO Code',
    date: 'Date',
    totalAmount: 'Total Amount',
    totalBRLExec: 'Total BRL (Exec.)',
    totalUSDTExec: 'Total USDT (Exec.)',
    feeExec: 'Fee (Exec.)',
    process: 'Process',
    processed: 'Processed',

    // Detail View
    orderDetailTitle: 'Order Detail',
    backToList: 'Back to list',
    noLinksInOrder: 'This order has no links.',
    pastePaymentLink: 'Paste payment link here',

    // Execution Processor View
    processExecutionTitle: 'Process Execution',
    uploadOrDrop: 'Upload files or drag and drop them here',
    executionRegistered: 'Execution registered',
    selectedFiles: 'Selected files:',
    extractInfoFromFiles: 'Extract Information from {0} file(s)',
    infoAddedToTable: 'Information from {0} file(s) was added to the table.',
    manualEntry: 'Manual Entry',
    addRecord: 'Add Record',
    extractedInfo: 'Extracted Information',
    registerExecution: 'Register Execution',
    executionWasRegistered: 'Execution Registered',
    
    // History View
    historySubtitle: 'View, filter, and export all your registered operations.',
    exportToCSV: 'Export to CSV',
    searchPlaceholder: 'Search by PO Code, amounts...',
    startDate: 'Start Date',
    endDate: 'End Date',
    noOperationsFound: 'No registered operations match the current filters.',
    averagePriceHeader: 'Avg. Price (Exec.)',

    // Errors & Validations
    errorPositiveNumber: 'Please enter a valid positive number.',
    errorFixConfig: 'Please fix the errors in the configuration before generating.',
    errorInputPositive: 'Input must be a positive number.',
    errorCannotGenerateZero: 'Cannot generate 0 values. Check the input values.',
    errorValueGreaterThan: 'The value must be greater than {0}.',
    errorValueNotEmpty: 'The value cannot be empty. Minimum: {0}',
    errorSelectFile: 'Please select at least one file.',
    errorFileNotImage: 'File {0} is not an image.',
    errorFillOneField: 'Please fill at least one field to add the record.',
    errorCouldNotParse: 'Could not parse extracted data.',

    // Table Headers (Execution)
    orderNumber: 'Order No.',
    filledQuantity: 'Filled / Quantity',
    icebergValue: 'Iceberg Value',
    averagePrice: 'Average / Price',
    conditions: 'Conditions',
    creationDate: 'Creation Date',
    updateDate: 'Update Date',

    // Statuses
    statusPending: 'pending',
    statusPaid: 'paid',

    // Gemini Prompt (kept in English for consistency)
    geminiPrompt: "From the provided image of a trade confirmation, extract all the specified fields. The values should be extracted exactly as they appear. Respond with a JSON object that adheres to the provided schema. The response must be an array containing one or more trade objects if multiple are detected.",
  },
  es: {
    // General
    back: 'Volver',
    clear: 'Limpiar',
    status: 'Estado',
    action: 'Acción',
    type: 'Tipo',
    total: 'Total',
    fee: 'Taxa',
    paid: 'Pagado',
    processing: 'Procesando...',
    errorOccurred: 'Ocurrió un error desconocido.',

    // Tabs
    dashboard: 'Dashboard',
    purchaseOrderGenerator: 'Generador de Orden de Compra',
    operationsHistory: 'Historial de Operaciones',

    // Dashboard View
    dashboardTitle: 'Dashboard Financiero',
    dashboardSubtitle: 'Una vista consolidada de sus operaciones.',
    totalOrders: 'Total de Órdenes',
    totalPendingAmount: 'Monto Total Pendiente',
    totalPaidAmount: 'Monto Total Pagado',
    totalBRLExecuted: 'Total BRL Ejecutado',
    totalUSDTExecuted: 'Total USDT Ejecutado',
    totalFeesPaid: 'Total Taxas Pagadas',
    
    // Generator View
    generatorTitle: 'Generador de Orden de Compra',
    generatorSubtitle: 'Introduce un monto total para generar una serie de pagos por Orden de Compra.',
    config: 'Configuración',
    maxPixValue: 'Valor Máximo de PIX',
    maxPixValueDescription: 'Este valor se usa en la fórmula para determinar el número de valores a generar.',
    totalAmountPlaceholder: 'Monto total de la Orden de Compra',
    generate: 'Generar',
    generating: 'Generando...',
    willGenerateLinks: 'Se generarán',
    paymentLinks: 'links de pago.',
    generatedResults: 'Resultados Generados',
    registerOperation: 'Registrar Operación',
    registeredOrders: 'Órdenes Registradas',
    poCode: 'PO Code',
    date: 'Fecha',
    totalAmount: 'Monto Total',
    totalBRLExec: 'Total BRL (Ejec.)',
    totalUSDTExec: 'Total USDT (Ejec.)',
    feeExec: 'Taxa (Ejec.)',
    process: 'Procesar',
    processed: 'Procesado',

    // Detail View
    orderDetailTitle: 'Detalle de la Orden',
    backToList: 'Volver a la lista',
    noLinksInOrder: 'Esta orden no tiene links.',
    pastePaymentLink: 'Pegar link de pago aquí',
    
    // Execution Processor View
    processExecutionTitle: 'Procesar Ejecución',
    uploadOrDrop: 'Sube archivos o arrástralos y suéltalos aquí',
    executionRegistered: 'Ejecución registrada',
    selectedFiles: 'Archivos seleccionados:',
    extractInfoFromFiles: 'Extraer Información de {0} archivo(s)',
    infoAddedToTable: 'Se agregó la información de {0} archivo(s) a la tabla.',
    manualEntry: 'Ingreso Manual',
    addRecord: 'Adicionar Registro',
    extractedInfo: 'Información Extraída',
    registerExecution: 'Registrar Ejecución',
    executionWasRegistered: 'Ejecución Registrada',
    
    // History View
    historySubtitle: 'Visualiza, filtra y exporta todas tus operaciones registradas.',
    exportToCSV: 'Exportar a CSV',
    searchPlaceholder: 'Buscar por PO Code, montos...',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    noOperationsFound: 'Ninguna operación registrada coincide con los filtros actuales.',
    averagePriceHeader: 'Precio Prom. (Ejec.)',

    // Errors & Validations
    errorPositiveNumber: 'Por favor, introduce un número positivo válido.',
    errorFixConfig: 'Por favor, corrige los errores en la configuración antes de generar.',
    errorInputPositive: 'La entrada debe ser un número positivo.',
    errorCannotGenerateZero: 'No se pueden generar 0 valores. Revisa los valores de entrada.',
    errorValueGreaterThan: 'El valor debe ser mayor que {0}.',
    errorValueNotEmpty: 'El valor no puede estar vacío. Mínimo: {0}',
    errorSelectFile: 'Por favor, selecciona al menos un archivo.',
    errorFileNotImage: 'El archivo {0} no es una imagen.',
    errorFillOneField: 'Por favor, complete al menos un campo para agregar el registro.',
    errorCouldNotParse: 'No se pudieron analizar los datos extraídos.',

    // Table Headers (Execution)
    orderNumber: 'Nº da Ordem',
    filledQuantity: 'Preenchida / Quantia',
    icebergValue: 'Valor Iceberg',
    averagePrice: 'Média / Preço',
    conditions: 'Condições',
    creationDate: 'Data de Criação',
    updateDate: 'Data da Atualização',

    // Statuses
    statusPending: 'pendiente',
    statusPaid: 'pagado',

    // Gemini Prompt
    geminiPrompt: "From the provided image of a trade confirmation, extract all the specified fields. The values should be extracted exactly as they appear. Respond with a JSON object that adheres to the provided schema. The response must be an array containing one or more trade objects if multiple are detected.",
  },
  pt: {
    // General
    back: 'Voltar',
    clear: 'Limpar',
    status: 'Status',
    action: 'Ação',
    type: 'Tipo',
    total: 'Total',
    fee: 'Taxa',
    paid: 'Pago',
    processing: 'Processando...',
    errorOccurred: 'Ocorreu um erro desconhecido.',

    // Tabs
    dashboard: 'Painel',
    purchaseOrderGenerator: 'Gerador de Ordem de Compra',
    operationsHistory: 'Histórico de Operações',

    // Dashboard View
    dashboardTitle: 'Painel Financeiro',
    dashboardSubtitle: 'Uma visão consolidada de suas operações.',
    totalOrders: 'Total de Pedidos',
    totalPendingAmount: 'Valor Total Pendente',
    totalPaidAmount: 'Valor Total Pago',
    totalBRLExecuted: 'Total BRL Executado',
    totalUSDTExecuted: 'Total USDT Executado',
    totalFeesPaid: 'Total de Taxas Pagas',
    
    // Generator View
    generatorTitle: 'Gerador de Ordem de Compra',
    generatorSubtitle: 'Insira um valor total para gerar uma série de pagamentos de Ordem de Compra.',
    config: 'Configuração',
    maxPixValue: 'Valor Máximo do PIX',
    maxPixValueDescription: 'Este valor é usado na fórmula para determinar o número de valores a serem gerados.',
    totalAmountPlaceholder: 'Valor total da Ordem de Compra',
    generate: 'Gerar',
    generating: 'Gerando...',
    willGenerateLinks: 'Serão gerados',
    paymentLinks: 'links de pagamento.',
    generatedResults: 'Resultados Gerados',
    registerOperation: 'Registrar Operação',
    registeredOrders: 'Pedidos Registrados',
    poCode: 'Cód. OC',
    date: 'Data',
    totalAmount: 'Valor Total',
    totalBRLExec: 'Total BRL (Exec.)',
    totalUSDTExec: 'Total USDT (Exec.)',
    feeExec: 'Taxa (Exec.)',
    process: 'Processar',
    processed: 'Processado',

    // Detail View
    orderDetailTitle: 'Detalhe do Pedido',
    backToList: 'Voltar para a lista',
    noLinksInOrder: 'Este pedido não possui links.',
    pastePaymentLink: 'Cole o link de pagamento aqui',
    
    // Execution Processor View
    processExecutionTitle: 'Processar Execução',
    uploadOrDrop: 'Carregue arquivos ou arraste e solte-os aqui',
    executionRegistered: 'Execução registrada',
    selectedFiles: 'Arquivos selecionados:',
    extractInfoFromFiles: 'Extrair Informações de {0} arquivo(s)',
    infoAddedToTable: 'A informação de {0} arquivo(s) foi adicionada à tabela.',
    manualEntry: 'Entrada Manual',
    addRecord: 'Adicionar Registro',
    extractedInfo: 'Informações Extraídas',
    registerExecution: 'Registrar Execução',
    executionWasRegistered: 'Execução Registrada',

    // History View
    historySubtitle: 'Visualize, filtre e exporte todas as suas operações registradas.',
    exportToCSV: 'Exportar para CSV',
    searchPlaceholder: 'Pesquisar por Cód. OC, valores...',
    startDate: 'Data de Início',
    endDate: 'Data de Fim',
    noOperationsFound: 'Nenhuma operação registrada corresponde aos filtros atuais.',
    averagePriceHeader: 'Preço Méd. (Exec.)',

    // Errors & Validations
    errorPositiveNumber: 'Por favor, insira um número positivo válido.',
    errorFixConfig: 'Por favor, corrija os erros na configuração antes de gerar.',
    errorInputPositive: 'A entrada deve ser um número positivo.',
    errorCannotGenerateZero: 'Não é possível gerar 0 valores. Verifique os valores de entrada.',
    errorValueGreaterThan: 'O valor deve ser maior que {0}.',
    errorValueNotEmpty: 'O valor não pode estar vazio. Mínimo: {0}',
    errorSelectFile: 'Por favor, selecione pelo menos um arquivo.',
    errorFileNotImage: 'O arquivo {0} não é uma imagem.',
    errorFillOneField: 'Por favor, preencha pelo menos um campo para adicionar o registro.',
    errorCouldNotParse: 'Não foi possível analisar os dados extraídos.',

    // Table Headers (Execution)
    orderNumber: 'Nº da Ordem',
    filledQuantity: 'Preenchida / Quantia',
    icebergValue: 'Valor Iceberg',
    averagePrice: 'Média / Preço',
    conditions: 'Condições',
    creationDate: 'Data de Criação',
    updateDate: 'Data da Atualização',

    // Statuses
    statusPending: 'pendente',
    statusPaid: 'pago',

    // Gemini Prompt
    geminiPrompt: "From the provided image of a trade confirmation, extract all the specified fields. The values should be extracted exactly as they appear. Respond with a JSON object that adheres to the provided schema. The response must be an array containing one or more trade objects if multiple are detected.",
  }
};
