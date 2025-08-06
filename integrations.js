/**
 * Archivo de demostración para integraciones futuras
 * Este archivo muestra cómo se podrían integrar otras herramientas
 */

class IntegrationManager {
    constructor() {
        this.slackWebhookUrl = null;
        this.emailConfig = null;
        this.trelloConfig = null;
    }

    /**
     * Configuración para integración con Slack
     */
    setupSlackIntegration(webhookUrl) {
        this.slackWebhookUrl = webhookUrl;
        console.log('Integración con Slack configurada');
    }

    /**
     * Envía notificación a Slack
     */
    async sendToSlack(message, channel = '#general') {
        if (!this.slackWebhookUrl) {
            console.warn('Slack webhook no configurado');
            return;
        }

        const payload = {
            text: message,
            channel: channel,
            username: 'Gestor de Licencias',
            icon_emoji: ':key:'
        };

        try {
            const response = await fetch(this.slackWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Notificación enviada a Slack');
            } else {
                console.error('Error enviando a Slack:', response.status);
            }
        } catch (error) {
            console.error('Error en integración con Slack:', error);
        }
    }

    /**
     * Configuración para envío de emails
     */
    setupEmailIntegration(config) {
        this.emailConfig = config;
        console.log('Integración de email configurada');
    }

    /**
     * Envía email de notificación
     */
    async sendEmail(to, subject, body) {
        if (!this.emailConfig) {
            console.warn('Configuración de email no disponible');
            return;
        }

        // Aquí se integraría con un servicio de email como SendGrid, Mailgun, etc.
        console.log(`Email enviado a ${to}: ${subject}`);
    }

    /**
     * Configuración para integración con Trello
     */
    setupTrelloIntegration(apiKey, boardId, listId) {
        this.trelloConfig = { apiKey, boardId, listId };
        console.log('Integración con Trello configurada');
    }

    /**
     * Crea tarea en Trello
     */
    async createTrelloCard(title, description, dueDate) {
        if (!this.trelloConfig) {
            console.warn('Configuración de Trello no disponible');
            return;
        }

        const payload = {
            name: title,
            desc: description,
            due: dueDate,
            idList: this.trelloConfig.listId
        };

        try {
            const response = await fetch(`https://api.trello.com/1/cards?key=${this.trelloConfig.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const card = await response.json();
                console.log('Tarea creada en Trello:', card.id);
                return card;
            } else {
                console.error('Error creando tarea en Trello:', response.status);
            }
        } catch (error) {
            console.error('Error en integración con Trello:', error);
        }
    }

    /**
     * Integración con Google Sheets
     */
    async syncWithGoogleSheets(spreadsheetId, credentials) {
        // Esta integración requeriría la API de Google Sheets
        console.log('Sincronización con Google Sheets configurada');
    }

    /**
     * Integración con sistemas de facturación
     */
    async createInvoice(license, billingSystem) {
        // Integración con sistemas como Stripe, PayPal, etc.
        console.log(`Factura creada para ${license.softwareName}`);
    }

    /**
     * Envía notificación múltiple (Slack + Email + Trello)
     */
    async sendMultiChannelNotification(license, daysRemaining) {
        const message = `⚠️ Renovación de Licencia - ${license.softwareName}
        
        La licencia expira en ${daysRemaining} día${daysRemaining > 1 ? 's' : ''}.
        Responsable: ${license.responsible}
        Monto: $${license.amount.toFixed(2)}
        Fecha: ${license.renewalDate}`;

        // Enviar a Slack
        await this.sendToSlack(message, '#licencias');

        // Enviar email si hay dirección configurada
        if (license.email) {
            await this.sendEmail(
                license.email,
                `Renovación de Licencia - ${license.softwareName}`,
                message
            );
        }

        // Crear tarea en Trello
        await this.createTrelloCard(
            `Renovar licencia: ${license.softwareName}`,
            message,
            license.renewalDate
        );
    }
}

// Ejemplo de uso
const integrationManager = new IntegrationManager();

// Configurar integraciones (estos valores serían configurados por el usuario)
integrationManager.setupSlackIntegration('https://hooks.slack.com/services/YOUR/WEBHOOK/URL');
integrationManager.setupEmailIntegration({
    service: 'sendgrid',
    apiKey: 'your-api-key'
});
integrationManager.setupTrelloIntegration('your-trello-api-key', 'board-id', 'list-id');

// Exportar para uso en la aplicación principal
window.IntegrationManager = IntegrationManager;
window.integrationManager = integrationManager; 