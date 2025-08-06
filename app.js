// Gestor de Licencias - Sistema para no olvidar renovaciones
// Estructura de datos para las licencias
/**
 * @typedef {Object} License
 * @property {string} id
 * @property {string} softwareName
 * @property {string} renewalDate
 * @property {number} amount
 * @property {string} responsible
 * @property {string} email
 * @property {string} notes
 * @property {string} status
 * @property {number} daysRemaining
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

class LicenseManager {
    constructor() {
        this.licenses = [];
        this.notificationsEnabled = false;
        this.notificationCheckInterval = null;
        this.init();
    }

    // Inicializa todo
    init() {
        this.loadLicenses();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderTable();
        this.checkNotificationPermission();
        this.startNotificationCheck();
        this.loadSampleData(); // datos de ejemplo si no hay nada
    }

    // Configura los eventos
    setupEventListeners() {
        // Formulario
        document.getElementById('licenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLicense();
        });

        // Búsqueda
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterLicenses();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterLicenses();
        });

        // Cerrar modales
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeModal();
                closeConfirmModal();
            }
        });
    }

    // Carga desde localStorage
    loadLicenses() {
        const stored = localStorage.getItem('licenses');
        this.licenses = stored ? JSON.parse(stored) : [];
        this.updateLicenseStatuses();
    }

    // Guarda en localStorage
    saveLicenses() {
        localStorage.setItem('licenses', JSON.stringify(this.licenses));
    }

    // Datos de ejemplo
    loadSampleData() {
        if (this.licenses.length === 0) {
            const sampleData = [
                {
                    id: this.generateId(),
                    softwareName: 'Elementor Pro',
                    renewalDate: this.addDays(new Date(), 15).toISOString().split('T')[0],
                    amount: 49.00,
                    responsible: 'Juan Pérez',
                    email: 'juan.perez@empresa.com',
                    notes: 'Licencia anual para el equipo de diseño',
                    status: 'active',
                    daysRemaining: 15,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    softwareName: 'HubSpot CRM',
                    renewalDate: this.addDays(new Date(), 5).toISOString().split('T')[0],
                    amount: 89.00,
                    responsible: 'María García',
                    email: 'maria.garcia@empresa.com',
                    notes: 'CRM principal para ventas',
                    status: 'expiring',
                    daysRemaining: 5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    softwareName: 'Adobe Creative Suite',
                    renewalDate: this.addDays(new Date(), -2).toISOString().split('T')[0],
                    amount: 599.00,
                    responsible: 'Carlos López',
                    email: 'carlos.lopez@empresa.com',
                    notes: 'Suite completa para diseño gráfico',
                    status: 'expired',
                    daysRemaining: -2,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            
            this.licenses = sampleData;
            this.saveLicenses();
            this.showToast('Datos de ejemplo cargados', 'info');
        }
    }

    // Actualiza los estados de las licencias basado en fechas
    updateLicenseStatuses() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.licenses.forEach(license => {
            const renewalDate = new Date(license.renewalDate);
            const diffTime = renewalDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            license.daysRemaining = diffDays;

            // Actualizar estado
            if (diffDays < 0) {
                license.status = 'expired';
            } else if (diffDays <= 7) {
                license.status = 'expiring';
            } else {
                license.status = 'active';
            }

            license.updatedAt = new Date().toISOString();
        });

        this.saveLicenses();
    }

    // Genera un ID unico
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Agrega dias a una fecha
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    // Abre el modal para agregar/editar
    openModal(licenseId = null) {
        const modal = document.getElementById('licenseModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('licenseForm');

        if (licenseId) {
            // Modo edicion
            const license = this.licenses.find(l => l.id === licenseId);
            if (license) {
                modalTitle.textContent = 'Editar Licencia';
                this.populateForm(license);
                form.dataset.editId = licenseId;
            }
        } else {
            // Modo agregar
            modalTitle.textContent = 'Agregar Nueva Licencia';
            form.reset();
            delete form.dataset.editId;
        }

        modal.style.display = 'block';
    }

    // Cierra el modal
    closeModal() {
        document.getElementById('licenseModal').style.display = 'none';
    }

    // Llena el formulario con datos existentes
    populateForm(license) {
        document.getElementById('softwareName').value = license.softwareName;
        document.getElementById('renewalDate').value = license.renewalDate;
        document.getElementById('amount').value = license.amount;
        document.getElementById('responsible').value = license.responsible;
        document.getElementById('email').value = license.email || '';
        document.getElementById('notes').value = license.notes || '';
    }

    // Guarda una licencia
    saveLicense() {
        const form = document.getElementById('licenseForm');
        const editId = form.dataset.editId;

        const licenseData = {
            softwareName: document.getElementById('softwareName').value.trim(),
            renewalDate: document.getElementById('renewalDate').value,
            amount: parseFloat(document.getElementById('amount').value),
            responsible: document.getElementById('responsible').value.trim(),
            email: document.getElementById('email').value.trim(),
            notes: document.getElementById('notes').value.trim()
        };

        // Validación basica
        if (!licenseData.softwareName || !licenseData.renewalDate || 
            !licenseData.amount || !licenseData.responsible) {
            this.showToast('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        if (editId) {
            // Actualizar licencia existente
            const index = this.licenses.findIndex(l => l.id === editId);
            if (index !== -1) {
                this.licenses[index] = {
                    ...this.licenses[index],
                    ...licenseData,
                    updatedAt: new Date().toISOString()
                };
                this.showToast('Licencia actualizada correctamente', 'success');
            }
        } else {
            // Agregar nueva licencia
            const newLicense = {
                id: this.generateId(),
                ...licenseData,
                status: 'active',
                daysRemaining: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.licenses.push(newLicense);
            this.showToast('Licencia agregada correctamente', 'success');
        }

        this.updateLicenseStatuses();
        this.saveLicenses();
        this.updateDashboard();
        this.renderTable();
        this.closeModal();
    }

    // Elimina una licencia
    deleteLicense(licenseId) {
        this.showConfirmModal(
            '¿Estás seguro de que quieres eliminar esta licencia? Esta acción no se puede deshacer.',
            () => {
                this.licenses = this.licenses.filter(l => l.id !== licenseId);
                this.saveLicenses();
                this.updateDashboard();
                this.renderTable();
                this.showToast('Licencia eliminada correctamente', 'success');
            }
        );
    }

    // Renderiza la tabla de licencias
    renderTable() {
        const tbody = document.getElementById('licensesTableBody');
        const licenses = this.getFilteredLicenses();

        if (licenses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No se encontraron licencias</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = licenses.map(license => `
            <tr>
                <td>${license.softwareName}</td>
                <td>${this.formatDate(license.renewalDate)}</td>
                <td>
                    <span class="days-remaining ${this.getDaysRemainingClass(license.daysRemaining)}">
                        ${this.formatDaysRemaining(license.daysRemaining)}
                    </span>
                </td>
                <td>$${license.amount.toFixed(2)}</td>
                <td>${license.responsible}</td>
                <td>
                    <span class="status-badge status-${license.status}">
                        ${this.getStatusText(license.status)}
                    </span>
                </td>
                <td class="table-actions">
                    <button class="btn btn-sm btn-secondary" onclick="openModal('${license.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLicense('${license.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Obtiene las licencias filtradas
    getFilteredLicenses() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        return this.licenses.filter(license => {
            const matchesSearch = license.softwareName.toLowerCase().includes(searchTerm) ||
                                license.responsible.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }

    // Filtra las licencias
    filterLicenses() {
        this.renderTable();
    }

    // Actualiza el dashboard
    updateDashboard() {
        const total = this.licenses.length;
        const expiring = this.licenses.filter(l => l.status === 'expiring').length;
        const expired = this.licenses.filter(l => l.status === 'expired').length;

        document.getElementById('totalLicenses').textContent = total;
        document.getElementById('expiringSoon').textContent = expiring;
        document.getElementById('expired').textContent = expired;
    }

    // Formatea una fecha
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Formatea los días restantes
    formatDaysRemaining(days) {
        if (days < 0) {
            return `Expirada hace ${Math.abs(days)} días`;
        } else if (days === 0) {
            return 'Expira hoy';
        } else if (days === 1) {
            return 'Expira mañana';
        } else {
            return `${days} días`;
        }
    }

    // Obtiene la clase CSS para los días restantes
    getDaysRemainingClass(days) {
        if (days < 0) return 'critical';
        if (days <= 7) return 'warning';
        return 'safe';
    }

    // Obtiene el texto del estado
    getStatusText(status) {
        const statusMap = {
            'active': 'Activa',
            'expiring': 'Expira pronto',
            'expired': 'Expirada'
        };
        return statusMap[status] || status;
    }

    // Exporta los datos
    exportData() {
        const dataStr = JSON.stringify(this.licenses, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `licencias_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Datos exportados correctamente', 'success');
    }

    // Importa los datos
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    if (Array.isArray(importedData)) {
                        this.licenses = importedData;
                        this.updateLicenseStatuses();
                        this.saveLicenses();
                        this.updateDashboard();
                        this.renderTable();
                        this.showToast('Datos importados correctamente', 'success');
                    } else {
                        throw new Error('Formato inválido');
                    }
                } catch (error) {
                    this.showToast('Error al importar el archivo', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Muestra un toast
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Muestra modal de confirmación
    showConfirmModal(message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmButton = document.getElementById('confirmButton');
        
        confirmMessage.textContent = message;
        modal.style.display = 'block';
        
        confirmButton.onclick = () => {
            onConfirm();
            this.closeConfirmModal();
        };
    }

    // Cierra el modal de confirmación
    closeConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
    }

    // Verifica permisos de notificación
    async checkNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Este navegador no soporta notificaciones');
            return;
        }

        if (Notification.permission === 'granted') {
            this.notificationsEnabled = true;
            this.updateNotificationButton();
        }
    }

    // Activa/desactiva notificaciones
    async toggleNotifications() {
        if (!('Notification' in window)) {
            this.showToast('Tu navegador no soporta notificaciones', 'error');
            return;
        }

        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.notificationsEnabled = true;
                this.startNotificationCheck();
                this.showToast('Notificaciones activadas', 'success');
            } else {
                this.showToast('Permisos de notificación denegados', 'error');
            }
        } else if (Notification.permission === 'granted') {
            this.notificationsEnabled = !this.notificationsEnabled;
            if (this.notificationsEnabled) {
                this.startNotificationCheck();
                this.showToast('Notificaciones activadas', 'success');
            } else {
                this.stopNotificationCheck();
                this.showToast('Notificaciones desactivadas', 'info');
            }
        }

        this.updateNotificationButton();
    }

    // Actualiza el boton de notificaciones
    updateNotificationButton() {
        const button = document.getElementById('notificationStatus');
        button.textContent = this.notificationsEnabled ? 'Desactivar Notificaciones' : 'Activar Notificaciones';
    }

    // Inicia la verificacion de notificaciones
    startNotificationCheck() {
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
        }
        
        this.notificationCheckInterval = setInterval(() => {
            this.checkExpiringLicenses();
        }, 60000); // Verificar cada minuto
        
        // Verificar inmediatamente
        this.checkExpiringLicenses();
    }

    // Detiene la verificacion de notificaciones
    stopNotificationCheck() {
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
            this.notificationCheckInterval = null;
        }
    }

    // Verifica licencias que expiran pronto
    checkExpiringLicenses() {
        if (!this.notificationsEnabled) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.licenses.forEach(license => {
            const renewalDate = new Date(license.renewalDate);
            const diffTime = renewalDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Notificar si expira en 7, 3 o 1 día
            if (diffDays === 7 || diffDays === 3 || diffDays === 1) {
                this.sendNotification(license, diffDays);
            }
        });
    }

    // Envia una notificacion
    sendNotification(license, daysRemaining) {
        const title = 'Licencia por expirar';
        const body = `${license.softwareName} expira en ${daysRemaining} día${daysRemaining > 1 ? 's' : ''}. Responsable: ${license.responsible}`;
        
        const notification = new Notification(title, {
            body: body,
            icon: '/favicon.ico', // TODO: agregar icono real
            tag: `license-${license.id}` // Evitar duplicados
        });

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

// Funciones globales para los onclick
function openModal(licenseId = null) {
    licenseManager.openModal(licenseId);
}

function closeModal() {
    licenseManager.closeModal();
}

function closeConfirmModal() {
    licenseManager.closeConfirmModal();
}

function exportData() {
    licenseManager.exportData();
}

function importData() {
    licenseManager.importData();
}

function toggleNotifications() {
    licenseManager.toggleNotifications();
}

function deleteLicense(licenseId) {
    licenseManager.deleteLicense(licenseId);
}

// Inicializar cuando el DOM esté listo
let licenseManager;
document.addEventListener('DOMContentLoaded', () => {
    licenseManager = new LicenseManager();
}); 