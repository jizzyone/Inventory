<script>
import { getCategories, getInventoryById, updateInventory, createInventory, deleteInventory } from '../apiService';

// Предопределенные категории на случай недоступности API
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

export default {
  name: "InventoryEditor",
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      item: {
        name: '',
        category: '',
        price: 0,
        quantity: 1,
        description: '',
        photos: [],
        avatarIndex: 0
      },
      errors: {
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: ''
      },
      categories: [],
      isLoading: false,
      isEditing: false,
      useDefaultCategories: false
    }
  },
  async created() {
    console.log('InventoryEditor создан, ID:', this.id);

    // Загрузка категорий
    this.isLoading = true;
    try {
      const apiCategories = await getCategories();
      console.log('Категории из API:', apiCategories);

      if (Array.isArray(apiCategories) && apiCategories.length > 0) {
        // Проверяем, что у категорий есть необходимые поля
        const validCategories = apiCategories.filter(cat =>
            cat && typeof cat === 'object' && 'name' in cat
        );

        if (validCategories.length > 0) {
          this.categories = validCategories;
          console.log('Используем категории из API:', this.categories);
        } else {
          this.useDefaultCategories = true;
          this.categories = DEFAULT_CATEGORIES;
          console.log('API вернул некорректные категории, используем предопределенные');
        }
      } else {
        this.useDefaultCategories = true;
        this.categories = DEFAULT_CATEGORIES;
        console.log('API вернул пустой массив категорий, используем предопределенные');
      }
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      this.useDefaultCategories = true;
      this.categories = DEFAULT_CATEGORIES;
      console.log('Ошибка при загрузке категорий, используем предопределенные');
    }

    // Если есть id, значит редактируем существующий товар
    if (this.id) {
      this.isEditing = true;
      try {
        const loadedItem = await getInventoryById(this.id);
        console.log('Загруженные данные товара:', loadedItem);
        this.item = loadedItem;

        // Если категория товара не существует в списке категорий, добавим её
        if (this.item.category && !this.categories.some(c => c.name === this.item.category)) {
          this.categories.push({
            id: `custom-${Date.now()}`,
            name: this.item.category
          });
          console.log('Добавлена пользовательская категория:', this.item.category);
        }
      } catch (error) {
        console.error('Ошибка при загрузке товара:', error);
        alert(`Не удалось загрузить данные товара: ${error.message}`);
      }
    }
    this.isLoading = false;
  },
  methods: {
    validate() {
      let isValid = true;

      // Проверка имени
      this.errors.name = '';
      if (!this.item.name || this.item.name.length < 3) {
        this.errors.name = 'Название должно содержать не менее 3 символов';
        isValid = false;
      } else if (/^\d+$/.test(this.item.name)) {
        this.errors.name = 'Название не может состоять только из цифр';
        isValid = false;
      }

      // Проверка категории
      this.errors.category = '';
      if (!this.item.category) {
        this.errors.category = 'Необходимо выбрать категорию';
        isValid = false;
      }

      // Проверка цены
      this.errors.price = '';
      if (!this.item.price || this.item.price <= 0) {
        this.errors.price = 'Цена должна быть больше 0';
        isValid = false;
      }

      // Проверка количества
      this.errors.quantity = '';
      if (!this.item.quantity || this.item.quantity < 1) {
        this.errors.quantity = 'Количество должно быть не менее 1';
        isValid = false;
      }

      // Проверка описания
      this.errors.description = '';
      if (this.item.description && this.item.description.length > 255) {
        this.errors.description = 'Описание не должно превышать 255 символов';
        isValid = false;
      }

      return isValid;
    },

    async saveItem() {
      if (!this.validate()) {
        return;
      }

      this.isLoading = true;
      try {
        // Подготовка данных перед отправкой
        const itemToSave = {
          ...this.item,
          price: parseFloat(this.item.price),
          quantity: parseInt(this.item.quantity)
        };

        console.log('Сохраняемые данные:', itemToSave);

        if (this.isEditing) {
          await updateInventory(this.id, itemToSave);
        } else {
          await createInventory(itemToSave);
        }

        // Перенаправление на главную страницу
        this.$router.push('/');
      } catch (error) {
        console.error('Ошибка при сохранении товара:', error);
        alert(`Не удалось сохранить товар: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },

    async deleteItem() {
      if (!this.isEditing) return;

      if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
        return;
      }

      this.isLoading = true;
      try {
        await deleteInventory(this.id);
        this.$router.push('/');
      } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        alert(`Не удалось удалить товар: ${error.message}`);
      } finally {
        this.isLoading = false;
      }
    },

    addPhotoUrl() {
      this.item.photos.push('');
    },

    removePhoto(index) {
      this.item.photos.splice(index, 1);
      // Если удаляем аватар, сбрасываем его на первое фото
      if (index === this.item.avatarIndex && this.item.photos.length > 0) {
        this.item.avatarIndex = 0;
      }
    },

    setAsAvatar(index) {
      this.item.avatarIndex = index;
    }
  }
}
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl mb-6">{{ isEditing ? 'Редактирование товара' : 'Создание нового товара' }}</h1>

    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <form v-else @submit.prevent="saveItem" class="space-y-6">
      <!-- Название -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Название *
        </label>
        <input
            v-model="item.name"
            type="text"
            placeholder="Введите название товара"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            :class="{'border-red-500': errors.name}"
        />
        <p v-if="errors.name" class="text-red-500 text-sm">{{ errors.name }}</p>
      </div>

      <!-- Категория -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Категория *
        </label>
        <div class="relative">
          <select
              v-model="item.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              :class="{'border-red-500': errors.category}"
          >
            <option value="" disabled>Выберите категорию</option>
            <option v-for="category in categories" :key="category.id" :value="category.name">
              {{ category.name }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <div v-if="useDefaultCategories" class="text-amber-600 text-sm mt-1">
          API категорий недоступен. Используются предопределенные категории.
        </div>
        <p v-if="errors.category" class="text-red-500 text-sm">{{ errors.category }}</p>
      </div>

      <!-- Цена -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Цена *
        </label>
        <input
            v-model.number="item.price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            :class="{'border-red-500': errors.price}"
        />
        <p v-if="errors.price" class="text-red-500 text-sm">{{ errors.price }}</p>
      </div>

      <!-- Количество -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Количество *
        </label>
        <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            step="1"
            placeholder="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            :class="{'border-red-500': errors.quantity}"
        />
        <p v-if="errors.quantity" class="text-red-500 text-sm">{{ errors.quantity }}</p>
      </div>

      <!-- Описание -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Описание (максимум 255 символов)
        </label>
        <textarea
            v-model="item.description"
            rows="4"
            maxlength="255"
            placeholder="Введите описание товара"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            :class="{'border-red-500': errors.description}"
        ></textarea>
        <p class="text-sm text-gray-500" :class="{ 'text-red-500': item.description && item.description.length > 240 }">
          {{ item.description ? item.description.length : 0 }}/255
        </p>
        <p v-if="errors.description" class="text-red-500 text-sm">{{ errors.description }}</p>
      </div>

      <!-- Фото галерея -->
      <div class="space-y-4">
        <label class="block text-sm font-medium text-gray-700">
          Фото галерея
        </label>

        <div v-for="(photo, index) in item.photos" :key="index" class="flex items-center space-x-3 p-3 border rounded-md">
          <input
              v-model="item.photos[index]"
              type="text"
              placeholder="URL фотографии"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />

          <button
              type="button"
              @click="setAsAvatar(index)"
              class="px-4 py-2 text-sm font-medium rounded-md"
              :class="item.avatarIndex === index ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'"
          >
            {{ item.avatarIndex === index ? 'Аватар' : 'Сделать аватаром' }}
          </button>

          <button
              type="button"
              @click="removePhoto(index)"
              class="p-2 text-red-600 hover:text-red-800"
          >
            Удалить
          </button>
        </div>

        <button
            type="button"
            @click="addPhotoUrl"
            class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
        >
          + Добавить фото
        </button>
      </div>

      <div class="flex space-x-4 pt-6">
        <button
            type="submit"
            class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ isEditing ? 'Сохранить изменения' : 'Создать товар' }}
        </button>

        <button
            v-if="isEditing"
            type="button"
            @click="deleteItem"
            class="px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Удалить товар
        </button>

        <button
            type="button"
            @click="$router.push('/')"
            class="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Отмена
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Прозрачный фон для выпадающего списка категорий - фикс отображения в некоторых браузерах */
select {
  background-color: transparent;
}

/* Убедимся, что опции выпадающего списка видны */
select option {
  background-color: white;
  color: black;
  padding: 8px;
}

/* Исправление проблем с фоном в Chrome и Firefox */
@-moz-document url-prefix() {
  select {
    padding-right: 25px;
    background-position: calc(100% - 10px) center;
  }
}

@supports (-webkit-appearance: none) {
  select {
    background-position: right 10px center;
  }
}
</style>