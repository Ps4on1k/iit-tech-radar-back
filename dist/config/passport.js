"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = require("../config");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: config_1.config.google.clientId,
    clientSecret: config_1.config.google.clientSecret,
    callbackURL: config_1.config.google.callbackUrl,
}, (accessToken, refreshToken, profile, done) => {
    // В реальном приложении здесь была бы логика сохранения/поиска пользователя в БД
    const user = {
        id: profile.id,
        email: profile.emails?.[0]?.value || '',
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        avatar: profile.photos?.[0]?.value,
        provider: profile.provider,
        providerId: profile.id,
    };
    done(null, user);
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map