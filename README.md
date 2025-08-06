# Gestor de Licencias de Software

Sistema para gestionar y automatizar las renovaciones de licencias de software. Desarrollado como solución a un ejercicio de prueba tecnica.

## Propuesta de Solución

### Enfoque Principal: Sistema de Gestión Web con Notificaciones Automáticas

He desarrollado una aplicación web completa con un sistema automatizado que incluye:

**Componentes de la Solución:**
- Dashboard en tiempo real con estadísticas de licencias
- Sistema de notificaciones automáticas que alerta 7, 3 y 1 día antes de la renovación
- Gestión completa de licencias (CRUD) con interfaz intuitiva
- Filtros y búsqueda para facilitar la gestión
- Exportación/importación de datos para respaldos

**Flujo de Automatización:**
```
1. Usuario registra licencia → Sistema calcula días restantes
2. Sistema verifica diariamente → Identifica licencias próximas a expirar
3. Notificaciones automáticas → Alerta al responsable
4. Dashboard actualizado → Muestra estado en tiempo real
```

## Características

- Dashboard con estadísticas en tiempo real
- Notificaciones automáticas (7, 3 y 1 día antes)
- Gestión completa de licencias (CRUD)
- Exportación/importación de datos
- Interfaz responsiva
- Cálculo automático de estados (activa, expirando, expirada)
- Filtros por estado y búsqueda por nombre

## Instalación

1. Descargar los archivos
2. Abrir `index.html` en el navegador
3. Permitir notificaciones cuando se solicite

## Uso

### Agregar Licencia
1. Clic en "Agregar Licencia"
2. Completar el formulario
3. Guardar

### Notificaciones
- Activar desde el botón "Activar Notificaciones"
- Se recibirán alertas automáticas

### Exportar/Importar
- Usar botones "Exportar" e "Importar" para respaldos

## Automatización Implementada

### Herramientas Utilizadas:
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: LocalStorage del navegador
- **Notificaciones**: Web Notifications API
- **UI/UX**: FontAwesome para iconos, diseño responsivo

### Características Técnicas Implementadas:

**Sistema de Notificaciones:**
```javascript
// Verificación automática cada minuto
setInterval(() => {
  checkExpiringLicenses();
}, 60000);

// Alertas en días específicos (7, 3, 1)
const reminderDays = [7, 3, 1];
```

**Cálculo Automático de Estados:**
```javascript
if (diffDays < 0) {
  license.status = 'expired';
} else if (diffDays <= 7) {
  license.status = 'expiring';
} else {
  license.status = 'active';
}
```

## Estructura de Datos

```javascript
{
  id: "string",
  softwareName: "string",
  renewalDate: "YYYY-MM-DD",
  amount: number,
  responsible: "string",
  email: "string",
  notes: "string",
  status: "active|expiring|expired",
  daysRemaining: number,
  createdAt: "ISO string",
  updatedAt: "ISO string"
}
```

## Tecnologías

- HTML5
- CSS3 
- JavaScript ES6+ 
- LocalStorage para persistencia
- Notifications API del navegador

## Justificación Técnica

### Ventajas del Enfoque Elegido:

**Simplicidad y Accesibilidad:**
- No requiere instalación de software
- Funciona en cualquier navegador moderno
- Interfaz intuitiva para usuarios no técnicos

**Automatización Completa:**
- Cálculos automáticos de días restantes
- Estados dinámicos (activa, expirando, expirada)
- Notificaciones push del navegador

**Persistencia de Datos:**
- LocalStorage mantiene datos entre sesiones
- Exportación/importación para respaldos
- No requiere servidor externo

### Riesgos y Limitaciones Identificadas:

**Limitaciones Actuales:**
- Datos almacenados localmente (no sincronización entre dispositivos)
- Sin autenticación de usuarios
- Dependencia de permisos de notificaciones del navegador
- Sin integración con sistemas externos

**Riesgos:**
- Pérdida de datos si se borra el navegador
- Notificaciones pueden ser bloqueadas por el usuario
- Sin control de versiones o auditoría de cambios

## Funcionalidades Técnicas

### Notificaciones
```javascript
// Verificación cada minuto
setInterval(() => {
  checkExpiringLicenses();
}, 60000);
```

### Estados Automáticos
```javascript
if (diffDays < 0) {
  license.status = 'expired';
} else if (diffDays <= 7) {
  license.status = 'expiring';
} else {
  license.status = 'active';
}
```

## Escalabilidad de la Solución

### Para Múltiples Hojas/Equipos:

**Arquitectura Propuesta:**
```
1. Base de datos centralizada (PostgreSQL/MongoDB)
2. API REST para gestión de datos
3. Autenticación por equipos/usuarios
4. Dashboard multi-tenant
```

**Implementación Técnica:**
- **Backend**: Node.js + Express o Python + FastAPI
- **Base de datos**: PostgreSQL con esquema multi-tenant
- **Autenticación**: JWT tokens por equipo
- **Frontend**: React/Vue.js con routing por equipos

### Estructura de Datos Escalable:
```javascript
// Esquema propuesto para múltiples equipos
{
  teamId: "string",
  licenses: [{
    id: "string",
    softwareName: "string",
    renewalDate: "date",
    amount: "number",
    responsible: "string",
    teamId: "string"
  }],
  notificationSettings: {
    teamId: "string",
    reminderDays: [7, 3, 1],
    channels: ["email", "slack", "web"]
  }
}
```

## Integración con Otras Herramientas

### Integraciones Propuestas:

**Slack Integration:**
```javascript
// Webhook para enviar mensajes a Slack
const sendSlackNotification = async (license, daysRemaining) => {
  const message = {
    text: `Licencia ${license.softwareName} expira en ${daysRemaining} días`,
    channel: '#licenses',
    attachments: [{
      fields: [
        { title: "Responsable", value: license.responsible },
        { title: "Monto", value: `$${license.amount}` }
      ]
    }]
  };
  
  await fetch(slackWebhookUrl, {
    method: 'POST',
    body: JSON.stringify(message)
  });
};
```

**Email Integration:**
```javascript
// Integración con servicios de email (SendGrid, Mailgun)
const sendEmailNotification = async (license, daysRemaining) => {
  const emailData = {
    to: license.email,
    subject: `Renovación de licencia: ${license.softwareName}`,
    template: 'license-renewal',
    variables: {
      softwareName: license.softwareName,
      daysRemaining: daysRemaining,
      renewalDate: license.renewalDate,
      amount: license.amount
    }
  };
  
  await emailService.send(emailData);
};
```

**Trello Integration:**
```javascript
// Crear tarjetas automáticas en Trello
const createTrelloCard = async (license) => {
  const cardData = {
    name: `Renovar: ${license.softwareName}`,
    desc: `Responsable: ${license.responsible}\nMonto: $${license.amount}`,
    idList: trelloListId,
    due: license.renewalDate
  };
  
  await trelloAPI.createCard(cardData);
};
```

### Arquitectura de Integración:
```
Sistema Principal → API Gateway → Integraciones
                                    ├── Slack Webhooks
                                    ├── Email Service
                                    ├── Trello API
                                    └── Webhook Endpoints
```




