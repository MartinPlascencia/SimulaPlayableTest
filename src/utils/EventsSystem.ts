class EventsSystem {
    private _listeners: Record<string, Set<Function>> = {};

    public on(event: string, callback: Function) {
        if (!this._listeners[event]) {
            this._listeners[event] = new Set();
        }
        this._listeners[event].add(callback);
    }

    public off(event: string, callback: Function) {
        this._listeners[event]?.delete(callback);
    }

    public emit(event: string, ...args: any[]) {
        this._listeners[event]?.forEach(cb => cb(...args));
    }

    public removeAllListeners() {
        this._listeners = {};
    }
}

export default new EventsSystem();
