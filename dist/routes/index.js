"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRoutes = exports.authRoutes = exports.techRadarRoutes = void 0;
var techRadar_1 = require("./techRadar");
Object.defineProperty(exports, "techRadarRoutes", { enumerable: true, get: function () { return __importDefault(techRadar_1).default; } });
var auth_1 = require("./auth");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_1).default; } });
var import_1 = require("./import");
Object.defineProperty(exports, "importRoutes", { enumerable: true, get: function () { return __importDefault(import_1).default; } });
//# sourceMappingURL=index.js.map