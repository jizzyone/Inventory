// API сервис для работы с данными инвентаря и категорий
const API_BASE_URL = 'https://6712a5e16c5f5ced662443cb.mockapi.io/api/v2';

// Фиксированные категории на случай недоступности API
const DEFAULT_CATEGORIES = [
    { id: '1', name: 'Тренажеры' },
    { id: '2', name: 'Гантели и штанги' },
    { id: '3', name: 'Гимнастика' },
    { id: '4', name: 'Игровые виды спорта' },
    { id: '5', name: 'Туризм и отдых' },
    { id: '6', name: 'Спортивная одежда' },
    { id: '7', name: 'Бассейн и плавание' },
    { id: '8', name: 'Теннис и бадминтон' },
    { id: '9', name: 'Ножницы' }
];

/**
 * Нормализует данные товара для единообразного формата
 * @param {Object} rawItem - Исходные данные товара
 * @returns {Object} - Нормализованные данные товара
 */
const normalizeInventoryItem = (rawItem) => {
    // Если данные пустые, возвращаем пустой объект
    if (!rawItem) return {};

    // Обработка количества: проверяем оба поля - quantity и count
    let normalizedQuantity;
    if (rawItem.quantity !== undefined && rawItem.quantity !== null) {
        // Если есть quantity, используем его
        normalizedQuantity = Number(rawItem.quantity);
        if (isNaN(normalizedQuantity)) {
            console.warn(`Товар ${rawItem.id || rawItem.name || rawItem.title || 'без названия'} имеет невалидное quantity: ${rawItem.quantity}`);
            normalizedQuantity = rawItem.quantity; // Сохраняем исходное значение
        }
    } else if (rawItem.count !== undefined && rawItem.count !== null) {
        // Если quantity нет, но есть count, используем его
        normalizedQuantity = Number(rawItem.count);
        if (isNaN(normalizedQuantity)) {
            console.warn(`Товар ${rawItem.id || rawItem.name || rawItem.title || 'без названия'} имеет невалидное count: ${rawItem.count}`);
            normalizedQuantity = rawItem.count; // Сохраняем исходное значение
        }
    } else {
        // Если нет ни quantity, ни count, устанавливаем 0
        normalizedQuantity = 0;
    }

    // Базовая структура
    const result = {
        id: rawItem.id || '',
        name: rawItem.name || rawItem.title || '',
        category: rawItem.category || rawItem.categoryName || '',
        price: parseFloat(rawItem.price) || 0,
        quantity: normalizedQuantity,
        count: normalizedQuantity, // Дублируем для совместимости
        // Обрезаем описание до 255 символов, если оно длиннее
        description: (rawItem.description || rawItem.desc || '').slice(0, 255),
        photos: [],
        avatarIndex: 0
    };

    // Обработка фотографий
    if (Array.isArray(rawItem.photos) && rawItem.photos.length > 0) {
        result.photos = [...rawItem.photos];
    } else if (Array.isArray(rawItem.images) && rawItem.images.length > 0) {
        result.photos = [...rawItem.images];
    } else if (Array.isArray(rawItem.gallery) && rawItem.gallery.length > 0) {
        result.photos = [...rawItem.gallery];
    } else if (rawItem.image || rawItem.photo || rawItem.avatar) {
        result.photos = [rawItem.image || rawItem.photo || rawItem.avatar];
        result.avatar = rawItem.avatar || rawItem.image || rawItem.photo;
    }

    // Обработка индекса аватарки
    if (typeof rawItem.avatarIndex === 'number') {
        result.avatarIndex = rawItem.avatarIndex;
    } else if (typeof rawItem.mainPhotoIndex === 'number') {
        result.avatarIndex = rawItem.mainPhotoIndex;
    } else if (result.photos.length > 0) {
        result.avatarIndex = 0;
    }

    return result;
};

const normalizeCategory = (category) => {
    if (!category) return null;

    return {
        id: category.id || '',
        // Используем поле title из API, если оно есть, иначе используем name или пустую строку
        name: category.title || category.name || ''
    };
};

/**
 * Получение списка категорий
 * @returns {Promise<Array>} Список категорий
 */
const getCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const categories = await response.json();
        console.log('Полученные категории из API:', categories);

        if (Array.isArray(categories) && categories.length > 0) {
            // Нормализуем категории
            const normalizedCategories = categories.map(category => normalizeCategory(category))
                .filter(cat => cat && cat.name); // Отфильтровываем категории без имени

            console.log('Нормализованные категории:', normalizedCategories);

            if (normalizedCategories.length > 0) {
                return normalizedCategories;
            }
        }

        console.warn('API вернул некорректные категории, используем предопределенные');
        return DEFAULT_CATEGORIES;
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        return DEFAULT_CATEGORIES;
    }
};

/**
 * Получение списка товаров инвентаря
 * @returns {Promise<Array>} Список нормализованных товаров
 */
const getInventories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/inventories`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const items = await response.json();

        if (Array.isArray(items)) {
            return items.map(item => normalizeInventoryItem(item));
        } else {
            console.warn('API вернул некорректные данные инвентаря');
            return [];
        }
    } catch (error) {
        console.error('Ошибка при загрузке инвентаря:', error);
        return [];
    }
};

/**
 * Получение детальной информации о товаре по ID
 * @param {string} id - ID товара
 * @returns {Promise<Object>} Нормализованные данные товара
 */
const getInventoryById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/inventories/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const item = await response.json();
        return normalizeInventoryItem(item);
    } catch (error) {
        console.error(`Ошибка при загрузке товара с ID ${id}:`, error);
        throw error;
    }
};

/**
 * Создание нового товара
 * @param {Object} item - Данные нового товара
 * @returns {Promise<Object>} Созданный товар
 */
const createInventory = async (item) => {
    try {
        const response = await fetch(`${API_BASE_URL}/inventories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при создании товара:', error);
        throw error;
    }
};

/**
 * Обновление существующего товара
 * @param {string} id - ID товара
 * @param {Object} item - Обновленные данные товара
 * @returns {Promise<Object>} Обновленный товар
 */
const updateInventory = async (id, item) => {
    try {
        const response = await fetch(`${API_BASE_URL}/inventories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Ошибка при обновлении товара с ID ${id}:`, error);
        throw error;
    }
};

/**
 * Удаление товара
 * @param {string} id - ID товара для удаления
 * @returns {Promise<boolean>} Результат удаления
 */
const deleteInventory = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/inventories/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error(`Ошибка при удалении товара с ID ${id}:`, error);
        throw error;
    }
};

export {
    getCategories,
    getInventories,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory,
    normalizeInventoryItem,
    normalizeCategory
};