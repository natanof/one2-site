// Importar os serviços da API
import { DeviceModels, CommonIssues, Stock, Services, Orders } from './apiService.js';

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Carregar dados iniciais
        await loadInitialData();
        
        // Inicializar a interface do usuário
        initializeUI();
        
        // Navegar para a visualização padrão
        navigateTo('dashboard');
        
        console.log('Aplicação inicializada com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar a aplicação:', error);
        showToast('Erro ao carregar os dados. Por favor, recarregue a página.', 'danger');
    }
});

// Carregar dados iniciais da API
async function loadInitialData() {
    try {
        const [models, stock, services, orders] = await Promise.all([
            DeviceModels.getAll(),
            Stock.getAll(),
            Services.getAll(),
            Orders.getAll()
        ]);
        
        // Armazenar dados no estado da aplicação
        window.appState = {
            models,
            stock,
            services,
            orders,
            // Outros estados da aplicação podem ser adicionados aqui
        };
        
        return true;
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        throw error;
    }
}

// Inicializar a interface do usuário
function initializeUI() {
    // Configurar eventos de navegação
    document.querySelectorAll('[data-navigate]').forEach(button => {
        button.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-navigate');
            navigateTo(view);
        });
    });
    
    // Outras inicializações de UI podem ser adicionadas aqui
}

// Navegar entre as visualizações
function navigateTo(view) {
    // Esconder todas as visualizações
    document.querySelectorAll('.view').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Mostrar a visualização solicitada
    const targetView = document.getElementById(`${view}-view`);
    if (targetView) {
        targetView.classList.remove('hidden');
        
        // Atualizar o menu ativo
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('bg-secondary-blue', 'text-white');
            item.classList.add('text-gray-700', 'hover:bg-gray-100');
        });
        
        const activeItem = document.querySelector(`[data-navigate="${view}"]`);
        if (activeItem) {
            activeItem.classList.remove('text-gray-700', 'hover:bg-gray-100');
            activeItem.classList.add('bg-secondary-blue', 'text-white');
        }
        
        // Atualizar o título da página
        document.title = `ONETECH - ${view.charAt(0).toUpperCase() + view.slice(1)}`;
        
        // Rolar para o topo
        window.scrollTo(0, 0);
        
        // Chamar a função de renderização específica da visualização, se existir
        const renderFunction = window[`render${view.charAt(0).toUpperCase() + view.slice(1)}`];
        if (typeof renderFunction === 'function') {
            renderFunction();
        }
    }
}

// Função auxiliar para mostrar notificações
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    }`;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remover o toast após 5 segundos
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, 5000);
}

// Expor funções globais necessárias
window.navigateTo = navigateTo;
window.showToast = showToast;

// Inicializar os ícones do Lucide
lucide.createIcons();
