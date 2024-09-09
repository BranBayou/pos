// stores/TaxStore.js
import { defineStore } from 'pinia';

export const useTaxStore = defineStore('tax', {
  state: () => ({
    gstRate: 0.005, // GST 0.5%
    pstRate: 0.007, // PST 0.7%
  }),

  actions: {
    // Calculate GST based on price
    calculateGST(price) {
      return (price * this.gstRate).toFixed(2);
    },

    // Calculate PST based on price
    calculatePST(price) {
      return (price * this.pstRate).toFixed(2);
    },

    // Calculate Total Tax (GST + PST) based on price
    calculateTotalTax(price) {
      const gst = price * this.gstRate;
      const pst = price * this.pstRate;
      return (gst + pst).toFixed(2);
    },
  },
});

