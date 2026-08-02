"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const response_1 = require("./utils/response");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
// 404 Handler
app.use((req, res) => {
    (0, response_1.errorResponse)(res, 'Route not found', 404);
});
// Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    (0, response_1.errorResponse)(res, 'Internal server error', 500);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map