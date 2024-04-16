class EventBus {
  constructor() {
    this.eventTypeList = ["paste", "deleteCell", "deleteRow"];
    this.eventObject = {};
  }

  publish(eventName, ...args) {
    const callbackList = this.eventObject[eventName];

    if (!callbackList) return;
    for (let callback of callbackList) {
      callback(...args);
    }
  }

  subscribe(eventName, callback) {
    if (
      !this.eventTypeList.includes(eventName) ||
      typeof callback !== "function"
    ) {
      return;
    }

    if (!this.eventObject[eventName]) {
      this.eventObject[eventName] = [];
    }

    this.eventObject[eventName].push(callback);
  }
}

const eventBus = new EventBus();

export { eventBus };
