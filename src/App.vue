
<script setup>
import { ref, computed } from "vue";

import LookupDropdown from "./components/LookupDropdown.vue";
import lookupConfig from "./config/lookupConfig.json";

const customerId = ref(null);
const selectedCustomer = ref(null);

// Receive the complete selected customer record
function handleCustomerSelection(record) {
  selectedCustomer.value = record;

  console.log("Selected customer:", record);
}

// Automatically generate card fields from the selected record
const customerDetails = computed(() => {
  if (
    !selectedCustomer.value ||
    typeof selectedCustomer.value !== "object"
  ) {
    return [];
  }

  return Object.entries(selectedCustomer.value)
    .filter(([key]) => key !== "_id" && key !== "__v")
    .map(([key, value]) => ({
      label: formatLabel(key),
      value: formatValue(value)
    }));
});

// Convert field names into readable labels
function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, char => char.toUpperCase());
}

// Format values for display
function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}
</script>

<template>
  <div class="page">

    <h2>Reusable Lookup / Dropdown</h2>

    <!-- CUSTOMER LOOKUP -->
    <section class="form-section">
      <h3>Customer Lookup</h3>

      <LookupDropdown
        v-model="customerId"
        :config="lookupConfig.customerLookup"
        @selected="handleCustomerSelection"
      />
    </section>

    <!-- CUSTOMER DETAILS CARD -->
    <section
      v-if="selectedCustomer && customerDetails.length"
      class="details-card"
    >
      <div class="card-header">
        <h3>Customer Details</h3>
      </div>

      <div class="details-grid">
        <div
          v-for="(item, index) in customerDetails"
          :key="index"
          class="details-item"
        >
          <label>{{ item.label }}</label>

          <p>{{ item.value }}</p>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.page {
  max-width: 100%;
  margin: 40px auto;
  padding: 0 20px;
  font-family: Arial, sans-serif;
}

h2 {
  color: #172b4d;
  margin-bottom: 36px;
}

.form-section {
  margin-bottom: 25px;
  padding: 30px;
  border: 1px solid #dce3ed;
  border-radius: 12px;
  background: white;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #334b68;
  font-size: 22px;
}

/* DETAILS CARD */

.details-card {
  margin-top: 25px;
  padding: 28px;
  border: 1px solid #dce3ed;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding-bottom: 18px;
  margin-bottom: 25px;
  border-bottom: 1px solid #e2e8f0;
}

.card-header h3 {
  margin: 0;
  color: #334b68;
  font-size: 22px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px 25px;
}

.details-item {
  min-width: 0;
}

.details-item label {
  display: block;
  margin-bottom: 9px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.details-item p {
  margin: 0;
  color: #243b53;
  font-size: 15px;
  font-weight: 500;
  overflow-wrap: anywhere;
}

@media (max-width: 700px) {
  .details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 450px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
