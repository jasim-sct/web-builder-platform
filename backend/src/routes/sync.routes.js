const express = require('express');
const syncController = require('../controllers/sync.controller');

const router = express.Router();

router.get('/', syncController.getSyncData);

module.exports = router;
