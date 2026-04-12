"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistStatus = exports.ReservationStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["BUSINESS_ADMIN"] = "BUSINESS_ADMIN";
    UserRole["STAFF"] = "STAFF";
    UserRole["CUSTOMER"] = "CUSTOMER";
})(UserRole || (exports.UserRole = UserRole = {}));
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "PENDING";
    ReservationStatus["CONFIRMED"] = "CONFIRMED";
    ReservationStatus["CANCELLED"] = "CANCELLED";
    ReservationStatus["ATTENDED"] = "ATTENDED";
    ReservationStatus["NOSHOW"] = "NOSHOW";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
var WaitlistStatus;
(function (WaitlistStatus) {
    WaitlistStatus["WAITING"] = "WAITING";
    WaitlistStatus["PROMOTED"] = "PROMOTED";
    WaitlistStatus["CANCELLED"] = "CANCELLED";
})(WaitlistStatus || (exports.WaitlistStatus = WaitlistStatus = {}));
