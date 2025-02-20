<script>
import { getInventoryById } from '../apiService';

export default {
  name: "InventoryDetails",
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      item: null,
      isLoading: true,
      error: null
    }
  },
  async created() {
    await this.fetchInventoryItem();
  },
  computed: {
    itemName() {
      if (!this.item) return 'Загрузка...';
      return this.item.name || this.item.id || this.item.title || 'Название недоступно';
    },
    itemCategory() {
      if (!this.item) return 'Не указано';
      return this.item.category || 'Не указано';
    },
    formattedPrice() {
      if (!this.item) return '0.00';
      const price = this.item.price || 0;
      return typeof price === 'number'
          ? price.toFixed(2)
          : Number(price).toFixed(2);
    },
    itemQuantity() {
      if (!this.item) return 0;
      return this.item.quantity || 0;
    },
    itemDescription() {
      if (!this.item) return '';
      return this.item.description || 'Описание отсутствует';
    },
    hasPhotos() {
      return this.item && this.item.photos && this.item.photos.length > 0;
    },
    mainPhoto() {
      if (!this.hasPhotos) return null;
      const index = this.item.avatarIndex || 0;
      return index < this.item.photos.length ? this.item.photos[index] : this.item.photos[0];
    }
  },
  methods: {
    async fetchInventoryItem() {
      this.isLoading = true;
      this.error = null;

      try {
        this.item = await getInventoryById(this.id);
        console.log('Данные товара получены и нормализованы:', this.item);
      } catch (error) {
        this.error = error.message || 'Произошла ошибка при загрузке данных';
        console.error('Ошибка при загрузке товара:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto">
    <div v-if="isLoading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div v-else-if="item" class="bg-white shadow rounded-lg overflow-hidden">
      <!-- Верхняя панель с кнопками -->
      <div class="flex justify-between items-center p-6 border-b">
        <h1 class="text-2xl font-bold">{{ itemName }}</h1>
        <router-link
            :to="`/edit/${id}`"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Редактировать
        </router-link>
      </div>

      <!-- Галерея фотографий -->
      <div class="p-6 border-b">
        <h2 class="text-xl font-semibold mb-4">Фотографии</h2>
        <div v-if="hasPhotos" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
              v-for="(photo, index) in item.photos"
              :key="index"
              class="relative rounded-lg overflow-hidden bg-gray-100"
          >
            <img
                :src="photo || '/placeholder-image.jpg'"
                :alt="`Фото ${index + 1} - ${itemName}`"
                class="w-full h-48 object-cover"
                @error="$event.target.src = '/placeholder-image.jpg'"
            />
            <div
                v-if="index === (item.avatarIndex || 0)"
                class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded"
            >
              Основное фото
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">
          Нет доступных фотографий
        </div>
      </div>

      <!-- Основная информация -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 class="text-xl font-semibold mb-4">Характеристики</h2>
          <div class="space-y-3">
            <div class="flex justify-between border-b pb-2">
              <span class="font-medium text-gray-600">Категория:</span>
              <span>{{ itemCategory }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-medium text-gray-600">Цена:</span>
              <span class="font-semibold">{{ formattedPrice }} ₽</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-medium text-gray-600">В наличии:</span>
              <span>{{ itemQuantity }} шт.</span>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Описание</h2>
          <div
              v-if="itemDescription"
              class="prose prose-sm max-w-none"
          >
            <p>{{ itemDescription }}</p>
          </div>
          <div v-else class="text-gray-500 italic">
            Описание отсутствует
          </div>
        </div>
      </div>

      <!-- Нижняя панель с кнопкой возврата -->
      <div class="bg-gray-50 px-6 py-4">
        <router-link
            to="/"
            class="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Вернуться к списку товаров
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>