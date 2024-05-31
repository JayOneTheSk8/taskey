export const dispatchEvent = (eventName: string, payload = {}) => {
  const event = new CustomEvent(eventName, { detail: payload });
  window.dispatchEvent(event);
};
