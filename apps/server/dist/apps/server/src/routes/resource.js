"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resource_1 = require("../controllers/resource");
const auth_1 = require("../middleware/auth");
const shared_1 = require("@remotely/shared");
const router = (0, express_1.Router)();
// Publicly browseable
router.get('/', resource_1.getResources);
router.get('/:id', resource_1.getResourceDetails);
// Admin/Staff only
router.post('/', auth_1.authenticate, (0, auth_1.authorize)([shared_1.UserRole.BUSINESS_ADMIN, shared_1.UserRole.SUPER_ADMIN]), resource_1.createResource);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)([shared_1.UserRole.BUSINESS_ADMIN, shared_1.UserRole.SUPER_ADMIN]), resource_1.updateResource);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)([shared_1.UserRole.BUSINESS_ADMIN, shared_1.UserRole.SUPER_ADMIN]), resource_1.deleteResource);
router.post('/slots', auth_1.authenticate, (0, auth_1.authorize)([shared_1.UserRole.BUSINESS_ADMIN, shared_1.UserRole.STAFF]), resource_1.createTimeSlots);
exports.default = router;
