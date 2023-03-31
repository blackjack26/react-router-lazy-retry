export const lazyRetry = (lazyFn, id, opts) => async () => {
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
        const route = await lazyFn();
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
            window.localStorage.setItem(key, 'true');
            const pathname = opts.router?.state.navigation.location?.pathname ?? null;
            if (pathname) {
                window.location.href = pathname;
            }
            else {
                window.location.reload();
            }
        });
    }
};
