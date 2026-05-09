const express = require('express');
const PlantsController = require('../controllers/plantsController');

const router = express.Router();

router.get('/', PlantsController.getAllPlants);
router.get('/stats', PlantsController.getStats);
router.get('/toxic', PlantsController.getToxicPlants);
router.get('/non-toxic', PlantsController.getNonToxicPlants);
router.get('/search', PlantsController.searchPlants);
router.get('/family', PlantsController.filterByFamily);
router.get('/:id', PlantsController.getPlantById);

module.exports = router;
