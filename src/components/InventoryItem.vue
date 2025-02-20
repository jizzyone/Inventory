<script>
export default {
  name: "InventoryItem",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    // Добавляем вычисляемые свойства для безопасного доступа к данным
    itemName() {
      return this.item.name || this.item.title || this.item.productName || "Без названия";
    },
    itemCategory() {
      return this.item.category || this.item.categoryName || "Не указано";
    },
    formattedPrice() {
      try {
        const price = this.item.price || 0;
        return typeof price === 'number'
            ? price.toFixed(2)
            : Number(price).toFixed(2);
      } catch (e) {
        console.error('Ошибка форматирования цены:', e);
        return '0.00';
      }
    },
    itemQuantity() {
      return this.item.quantity || this.item.count || 0;
    },
    avatarUrl() {
      if (this.item.photos && this.item.photos.length > 0) {
        const index = this.item.avatarIndex || 0;
        return this.item.photos[index];
      }
      if (this.item.image) return this.item.image;
      if (this.item.photo) return this.item.photo;
      return null;
    }
  }
}
</script>

<template>
  <div class="flex flex-row justify-between text-left items-center py-3 hover:bg-gray-50">
    <div class="w-1/5 font-medium">{{ itemName }}</div>
    <div class="w-1/5">{{ itemCategory }}</div>
    <div class="w-1/5">{{ formattedPrice }} ₽</div>
    <div class="w-1/5">{{ itemQuantity }} шт.</div>
    <div class="w-1/5">
      <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Фото товара"
          class="w-16 h-16 object-cover rounded"
          @error="$event.target.src = '/placeholder-image.jpg'"
      />
      <div v-else class="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
        <span class="text-xs text-gray-500">Нет фото</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>