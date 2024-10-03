const pubsub = {
    events: {},
    subscribe: function(eventName, fn) {
        // Associate provided function with eventName in events object
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    unsubscribe: function(eventName, fn) {
        if (this.events[eventName]) {
            for (let i = 0; i < this.events[eventName].length; i++) {
                // Find function fn associated with eventName in events object and remove it
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            }
        }
    },
    publish: function(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function(fn) {
                // Call each function in events object associated with eventName
                fn(data);
            });
        }
    }
};