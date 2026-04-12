"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middleware/error");
const auth_1 = __importDefault(require("./routes/auth"));
const resource_1 = __importDefault(require("./routes/resource"));
const reservation_1 = __importDefault(require("./routes/reservation"));
const organization_1 = __importDefault(require("./routes/organization"));
const resourceType_1 = __importDefault(require("./routes/resourceType"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/resources', resource_1.default);
app.use('/api/reservations', reservation_1.default);
app.use('/api/organizations', organization_1.default);
app.use('/api/resource-types', resourceType_1.default);
// Error handling
app.use(error_1.errorHandler);
exports.default = app;
