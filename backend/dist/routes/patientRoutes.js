"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patientController_1 = require("../controllers/patientController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Protect all patient routes with authentication
router.use(authMiddleware_1.authenticate);
// Only allow admin and petugas pendaftaran to manage patients
router.use((0, authMiddleware_1.authorizeRole)(['administrator', 'petugas_pendaftaran']));
router.get('/', patientController_1.getPatients);
router.get('/:id', patientController_1.getPatientById);
router.post('/', patientController_1.createPatient);
router.put('/:id', patientController_1.updatePatient);
router.delete('/:id', patientController_1.deletePatient);
exports.default = router;
