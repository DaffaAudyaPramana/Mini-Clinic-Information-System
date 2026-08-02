"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicalRecordController_1 = require("../controllers/medicalRecordController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
// Only doctors can create medical records
router.post('/', (0, authMiddleware_1.authorizeRole)(['administrator', 'dokter']), medicalRecordController_1.createMedicalRecord);
// Doctors and admins can view patient history
router.get('/patient/:patient_id', (0, authMiddleware_1.authorizeRole)(['administrator', 'dokter']), medicalRecordController_1.getPatientHistory);
exports.default = router;
