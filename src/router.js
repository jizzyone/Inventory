import { createRouter, createWebHistory } from 'vue-router'
import InventoryList from '@/components/InventoryList.vue'
import InventoryEditor from '@/components/InventoryEditor.vue'
import InventoryDetails from '@/components/InventoryDetails.vue'

const routes = [
    {
        path: '/',
        name: 'InventoryList',
        component: InventoryList
    },
    {
        path: '/create',
        name: 'CreateInventory',
        component: InventoryEditor
    },
    {
        path: '/edit/:id',
        name: 'EditInventory',
        component: InventoryEditor,
        props: true
    },
    {
        path: '/inventory/:id',
        name: 'InventoryDetails',
        component: InventoryDetails,
        props: true
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router