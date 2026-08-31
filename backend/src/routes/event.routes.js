const express = require('express');
const eventController = require('../controllers/event.controller');

const router = express.Router();

router.get('/sync', eventController.syncEvents);
router.post('/', eventController.createEvent);
router.get('/:id', eventController.getEventById);
router.post('/:id/receive', eventController.receiveEvent);

module.exports = router;
