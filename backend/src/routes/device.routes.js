const express = require('express');
const deviceController = require('../controllers/device.controller');

const router = express.Router();

router.post('/register', deviceController.registerDevice);
router.post('/:id/heartbeat', deviceController.heartbeat);
router.get('/user/:userId', deviceController.getDevicesByUser);

module.exports = router;
