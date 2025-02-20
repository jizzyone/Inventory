<script>
import { getInventories } from '../apiService';

export default {
  name: "InventoryList",
  data() {
    return {
      inventories: [],
      displayedInventories: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    paginationItems() {
      const pageNumbers = [];
      const maxVisiblePages = 5;

      if (this.totalPages <= maxVisiblePages) {
        // Отображаем все страницы, если их <= maxVisiblePages
        for (let i = 1; i <= this.totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Всегда показываем первую страницу
        pageNumbers.push(1);

        if (this.currentPage <= 3) {
          pageNumbers.push(2, 3, 4);
        } else if (this.currentPage >= this.totalPages - 2) {
          pageNumbers.push(this.totalPages - 3, this.totalPages - 2, this.totalPages - 1);
        } else {
          pageNumbers.push(this.currentPage - 1, this.currentPage, this.currentPage + 1);
        }

        // Всегда показываем последнюю страницу
        if (!pageNumbers.includes(this.totalPages)) {
          pageNumbers.push(this.totalPages);
        }

        // Добавляем разделители
        const sortedNumbers = [...new Set(pageNumbers)].sort((a, b) => a - b);
        const result = [];

        for (let i = 0; i < sortedNumbers.length; i++) {
          if (i > 0 && sortedNumbers[i] - sortedNumbers[i - 1] > 1) {
            result.push('...');
          }
          result.push(sortedNumbers[i]);
        }

        return result;
      }

      return pageNumbers;
    }
  },
  created() {
    this.fetchInventories();
  },
  methods: {
    // Проверяет, валидно ли количество товара (больше или равно 1)
    isValidQuantity(item) {
      // Проверяем наличие поля quantity или count
      const quantityValue = item.quantity !== undefined ? item.quantity :
          (item.count !== undefined ? item.count : 0);

      // Пробуем преобразовать в число, если это строка
      const numericQuantity = Number(quantityValue);

      // Проверяем, что это действительное число и оно >= 1
      return !isNaN(numericQuantity) && numericQuantity >= 1;
    },

    // Получить количество товара для отображения
    getDisplayQuantity(item) {
      // Проверяем наличие поля quantity или count
      const quantityValue = item.quantity !== undefined ? item.quantity :
          (item.count !== undefined ? item.count : 0);

      // Пробуем преобразовать в число, если это строка
      const numericQuantity = Number(quantityValue);

      // Если преобразование успешно, возвращаем число, иначе исходное значение
      return !isNaN(numericQuantity) ? numericQuantity : quantityValue;
    },

    async fetchInventories() {
      this.isLoading = true;
      this.error = null;

      try {
        const allInventories = await getInventories();
        console.log('Все полученные товары:', allInventories);

        // Сохраняем все товары
        this.inventories = allInventories;

        // Фильтруем только товары с количеством >= 1
        this.displayedInventories = allInventories.filter(item => this.isValidQuantity(item));

        this.totalItems = this.displayedInventories.length;

        console.log(`Загружено ${allInventories.length} товаров, отображается ${this.displayedInventories.length}`);
        console.log('Отфильтрованные товары:', this.displayedInventories);

        if (allInventories.length > 0 && this.displayedInventories.length === 0) {
          console.warn('Все товары были отфильтрованы! Проверьте логику фильтрации.');
          // Выводим первые 3 товара для отладки
          for (let i = 0; i < Math.min(3, allInventories.length); i++) {
            const item = allInventories[i];
            console.log(`Товар #${i+1}:`, {
              id: item.id,
              title: item.title || item.name,
              quantity: item.quantity,
              count: item.count,
              валидность: this.isValidQuantity(item)
            });
          }
        }
      } catch (error) {
        this.error = 'Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.';
        console.error('Ошибка при загрузке инвентаря:', error);
        this.inventories = [];
        this.displayedInventories = [];
        this.totalItems = 0;
      } finally {
        this.isLoading = false;
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        window.scrollTo(0, 0);
      }
    },

    getPaginatedItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.displayedInventories.slice(startIndex, endIndex);
    }
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center p-6">
      <h1 class="text-3xl">Инвентарь</h1>

      <router-link
          to="/create"
          class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        + Добавить товар
      </router-link>
    </div>

    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6">
      {{ error }}
    </div>

    <div v-else class="p-6 text-left">

      <!-- Таблица инвентаря -->
      <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Название
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Категория
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Цена
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Количество
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Фото
            </th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="displayedInventories.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
              {{ inventories.length > 0
                ? 'Нет товаров с положительным количеством на складе.'
                : 'Список инвентаря пуст. Создайте новый товар.'
              }}
            </td>
          </tr>

          <tr v-for="item in getPaginatedItems()" :key="item.id" class="hover:bg-gray-50">
            <router-link :to="`/inventory/${item.id}`" custom v-slot="{ navigate }">
              <td @click="navigate" class="px-6 py-4 cursor-pointer">
                <div class="font-medium text-indigo-600">
                  {{ item.name || item.title || "Без названия" }}
                </div>
              </td>
              <td @click="navigate" class="px-6 py-4 cursor-pointer">
                {{ item.category || "Не указано" }}
              </td>
              <td @click="navigate" class="px-6 py-4 cursor-pointer">
                {{ item.price ? (typeof item.price === 'number' ? item.price.toFixed(2) : Number(item.price).toFixed(2)) : '0.00' }} ₽
              </td>
              <td @click="navigate" class="px-6 py-4 cursor-pointer">
                {{ getDisplayQuantity(item) }} шт.
              </td>
              <td @click="navigate" class="px-6 py-4 cursor-pointer">
                <div class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                  <img
                      v-if="item.photos && item.photos.length > 0"
                      :src="item.photos[item.avatarIndex || 0]"
                      alt="Фото товара"
                      class="w-full h-full object-cover"
                      @error="$event.target.src = '/placeholder-image.jpg'"
                  />
                  <img
                      v-else-if="item.avatar"
                      :src="item.avatar"
                      alt="Фото товара"
                      class="w-full h-full object-cover"
                      @error="$event.target.src = '/placeholder-image.jpg'"
                  />
                  <span v-else class="text-xs text-gray-500">Нет фото</span>
                </div>
              </td>
            </router-link>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="flex justify-center space-x-2 mt-6">
        <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border"
            :class="currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          &laquo;
        </button>

        <button
            v-for="(page, index) in paginationItems"
            :key="index"
            @click="typeof page === 'number' ? goToPage(page) : null"
            class="px-3 py-1 rounded border"
            :class="[
            typeof page !== 'number' ? 'text-gray-500 border-gray-200 cursor-default' :
            page === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>

        <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border"
            :class="currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'"
        >
          &raquo;
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>