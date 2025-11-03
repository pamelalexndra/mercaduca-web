import express from 'express';
import {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    updateProductoPartial,
    deleteProducto
} from '../controllers/productosController.js';


const router = express.Router();

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.patch('/:id', updateProductoPartial);
router.delete('/:id', deleteProducto);

export default router;