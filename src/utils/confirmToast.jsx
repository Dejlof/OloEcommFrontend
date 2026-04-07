// src/utils/confirmToast.jsx
import { toast } from 'react-toastify';

/**
 * Shows a toastify confirmation prompt.
 * @param {string} message  - The question to ask the user
 * @param {Function} onConfirm - Called when the user clicks "Confirm"
 */
export function confirmToast(message, onConfirm) {
  toast.warn(
    ({ closeToast }) => (
      <div>
        <p className="text-sm font-medium text-gray-800 mb-3">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={() => { closeToast(); onConfirm(); }}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition">
            Confirm
          </button>
          <button
            onClick={closeToast}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition">
            Cancel
          </button>
        </div>
      </div>
    ),
    { autoClose: false, closeOnClick: false }
  );
}
