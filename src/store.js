import { reactive } from 'vue'

// Базовые категории товаров
const defaultCategories = [
    { id: '1', name: 'Тренажеры' },
    { id: '2', name: 'Гантели и штанги' },
    { id: '3', name: 'Гимнастика' },
    { id: '4', name: 'Игровые виды спорта' },
    { id: '5', name: 'Туризм и отдых' },
    { id: '6', name: 'Спортивная одежда' }
]

export const store = reactive({
    // Состояние
    categories: [],
    inventories: [],
    isLoading: false,
    error: null,

    // API endpoint
    apiUrl: 'https://6712a5e16c5f5ced662443cb.mockapi.io/api/v2',

    // Методы
    async fetchCategories() {
        this.isLoading = true;
        try {
            const response = await fetch(`${this.apiUrl}/categories`);

            if (!response.ok) {
                throw new Error('Не удалось загрузить категории');
            }

            const data = await response.json();
            this.categories = data.length > 0 ? data : defaultCategories;
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
            this.error = error.message;
            this.categories = defaultCategories;
        } finally {
            this.isLoading = false;
        }
    },

    async fetchInventories() {
        this.isLoading = true;
        this.error = null;

        try {
            const response = await fetch(`${this.apiUrl}/inventories`);

            if (!response.ok) {
                throw new Error('Не удалось загрузить данные инвентаря');
            }

            this.inventories = await response.json();
        } catch (error) {
            console.error('Ошибка при загрузке инвентаря:', error);
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    },

    async getInventoryById(id) {
        try {
            const response = await fetch(`${this.apiUrl}/inventories/${id}`);

            if (!response.ok) {
                throw new Error('Не удалось загрузить данные товара');
            }

            return await response.json();
        } catch (error) {
            console.error(`Ошибка при загрузке товара с ID ${id}:`, error);
            throw error;
        }
    },

    async createInventory(item) {
        try {
            const response = await fetch(`${this.apiUrl}/inventories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                throw new Error('Не удалось создать товар');
            }

            const newItem = await response.json();
            this.inventories.push(newItem);
            return newItem;
        } catch (error) {
            console.error('Ошибка при создании товара:', error);
            throw error;
        }
    },

    async updateInventory(id, item) {
        try {
            const response = await fetch(`${this.apiUrl}/inventories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });

            if (!response.ok) {
                throw new Error('Не удалось обновить товар');
            }

            const updatedItem = await response.json();

            // Обновляем локальный массив
            const index = this.inventories.findIndex(i => i.id === id);
            if (index !== -1) {
                this.inventories[index] = updatedItem;
            }

            return updatedItem;
        } catch (error) {
            console.error(`Ошибка при обновлении товара с ID ${id}:`, error);
            throw error;
        }
    },

    async deleteInventory(id) {
        try {
            const response = await fetch(`${this.apiUrl}/inventories/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Не удалось удалить товар');
            }

            // Удаляем из локального массива
            this.inventories = this.inventories.filter(item => item.id !== id);

            return true;
        } catch (error) {
            console.error(`Ошибка при удалении товара с ID ${id}:`, error);
            throw error;
        }
    }
})