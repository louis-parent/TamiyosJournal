type Constructor<T> = new (...args: any[]) => T;
type CallbackArg = any | undefined;

export default function Listenable<T extends Constructor<{}>>(SuperClass: T) {
    return class extends SuperClass {
        listeners: Map<string, Array<(data: CallbackArg) => void>> = new Map();

        addEventListener(event: string, callback: (data: CallbackArg) => void) {
            let listeners = this.listeners.get(event);
            
            if(listeners === undefined) {
                listeners = new Array<(data: CallbackArg) => void>();
                this.listeners.set(event, listeners);
            }

            listeners.push(callback);
        }

        emitEvent(event: string, data: CallbackArg) {
            const listeners = this.listeners.get(event);

            if(listeners !== undefined) {
                for(const listener of listeners) {
                    listener(data);
                }
            }
        }
    }
}