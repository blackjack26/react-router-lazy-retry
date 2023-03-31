"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyRetry = void 0;
const lazyRetry = (lazyFn, id, opts) => () => __awaiter(void 0, void 0, void 0, function* () {
    let key = `retry-${id}-refreshed`;
    if (opts.refreshStorageKey) {
        if (['string', 'function'].includes(typeof opts.refreshStorageKey)) {
            key =
                typeof opts.refreshStorageKey === 'string'
                    ? opts.refreshStorageKey
                    : opts.refreshStorageKey(id);
        }
        else {
            console.warn('"refreshStorageKey" must either be a function or a string. Using default storage key instead');
        }
    }
    // Check if the window has already been refreshed
    const hasRefreshed = Boolean(JSON.parse(window.localStorage.getItem(key) || 'false'));
    try {
        const route = yield lazyFn();
        window.localStorage.removeItem(key); // reset the refresh on success
        return route;
    }
    catch (e) {
        if (hasRefreshed) {
            // The page has already been reloaded. Assuming that user is already using the latest version of the
            // application, let the application crash and raise the error.
            throw e;
        }
        // Assuming that the user is not on the latest version of the application. Refresh the page immediately.
        return new Promise(() => {
            var _a, _b, _c;
            window.localStorage.setItem(key, 'true');
            const pathname = (_c = (_b = (_a = opts.router) === null || _a === void 0 ? void 0 : _a.state.navigation.location) === null || _b === void 0 ? void 0 : _b.pathname) !== null && _c !== void 0 ? _c : null;
            if (pathname) {
                window.location.href = pathname;
            }
            else {
                window.location.reload();
            }
        });
    }
});
exports.lazyRetry = lazyRetry;
