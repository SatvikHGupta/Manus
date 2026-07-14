const STORAGE_KEY = 'manus_device_id';

// One stable ID per browser (survives reloads, shared by every tab of the
// same browser via localStorage - so multiple tabs never look like
// separate devices). Generated once, on first ever need.
export function getDeviceId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
