'use strict';

const express = require('express');
const historyController = require('../controllers/historyController');

const router = express.Router();

router.get('/', historyController.getAllHistory);
router.delete('/:id', historyController.deleteHistory);

module.exports = router;
