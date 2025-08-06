// Configuración del sistema de licencias
// TODO: mover esto a un archivo de configuración más robusto en el futuro

const CONFIG = {
    // Configuración de notificaciones
    notifications: {
        enabled: true,
        checkInterval: 60000, 
        warningDays: [7, 3, 1], 
        autoClose: 5000 
    },

    // Configuración de la interfaz
    ui: {
        itemsPerPage: 10, 
        autoRefresh: true,
        showEmptyState: true
    },

    // configuracion de datos
    data: {
        storageKey: 'licenses',
        backupInterval: 24 * 60 * 60 * 1000, // 24 horas
        maxBackups: 5
    },

    // configuración de validacion
    validation: {
        minAmount: 0,
        maxAmount: 999999,
        requiredFields: ['softwareName', 'renewalDate', 'amount', 'responsible']
    },

    // configuracion de exportacion
    export: {
        defaultFormat: 'json',
        includeMetadata: true,
        filenamePrefix: 'licencias_'
    }
};

// Configuracion de desarrollo
const DEV_CONFIG = {
    debug: true,
    logLevel: 'info',
    mockData: false,
    performance: {
        enableProfiling: false,
        logRenderTimes: false
    }
};

// Función para obtener configuracion
function getConfig(key) {
    return CONFIG[key] || null;
}

// Función para obtener configuracion de desarrollo
function getDevConfig(key) {
    return DEV_CONFIG[key] || null;
}

// Función para validar configuracion
function validateConfig() {
    const required = ['notifications', 'ui', 'data'];
    for (const key of required) {
        if (!CONFIG[key]) {
            console.warn(`Configuración faltante: ${key}`);
        }
    }
}

// Validar al cargar
validateConfig();

// Exportar para uso global
window.CONFIG = CONFIG;
window.getConfig = getConfig;
window.getDevConfig = getDevConfig; 