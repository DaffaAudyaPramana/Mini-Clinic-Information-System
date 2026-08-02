"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const registrationController_1 = require("../controllers/registrationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
// Registration can be viewed and managed by petugas_pendaftaran
router.get('/', registrationController_1.getRegistrations);
router.post('/', (0, authMiddleware_1.authorizeRole)(['administrator', 'petugas_pendaftaran']), registrationController_1.createRegistration);
router.put('/:id/status', (0, authMiddleware_1.authorizeRole)(['administrator', 'petugas_pendaftaran', 'dokter']), registrationController_1.updateRegistrationStatus);
exports.default = router;
