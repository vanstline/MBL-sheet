import Store from "../../store/index";

class EventBus {
  constructor() {
    this.eventTypeList = ["paste", "deleteCell", "deleteRow"];
    this.eventObject = {};
  }

  publish(eventName, ...args) {
    const callbackList = this.eventObject[eventName];
    if (!callbackList) return;
    const { startR = 0, endR = 0, startC = 0, endC = 0 } = args?.[1] || {};
    for (var r = startR; r <= endR; r++) {
      for (let c = startC; c <= endC; c++) {
        const callbackList = this.eventObject[eventName];
        for (let callback of callbackList) {
          if (Store.checkMark[r][c]) {
            Store.checkMark[r][c].mark = false;
          }
        }
      }
    }
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
