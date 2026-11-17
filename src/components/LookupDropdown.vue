
<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits([
  "update:modelValue",
  "selected"
]);

// COMPONENT STATE
const records = ref([]);
const searchText = ref("");
const selectedRecord = ref(null);
const isOpen = ref(false);
const isLoading = ref(false);
const error = ref("");
const highlightedIndex = ref(-1);
const showRequiredError = ref(false);

// CONFIGURATION
const selection = computed(
  () => props.config?.selection ?? {}
);

const searchConfig = computed(
  () => props.config?.search ?? {}
);

const dropdown = computed(
  () => props.config?.dropdown ?? {}
);

const detailsConfig = computed(
  () => props.config?.detailsCard ?? {}
);

const isLookup = computed(
  () => selection.value.type === "lookup"
);

// NESTED FIELD ACCESS
function getFieldValue(record, fieldPath) {
  if (!record || !fieldPath) return undefined;

  return String(fieldPath)
    .split(".")
    .reduce((value, key) => value?.[key], record);
}

// LOAD JSON DATA
async function loadRecords() {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch(props.config.dataSource);

    if (!response.ok) {
      throw new Error("Failed to load records");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid dataset format");
    }

    records.value = data;

    if (props.modelValue !== null) {
      restoreSelection(props.modelValue);
    }
  } catch (err) {
    error.value = err.message;
    console.error("Dataset loading error:", err);
  } finally {
    isLoading.value = false;
  }
}

// RESTORE SELECTION
function restoreSelection(id) {
  const record = records.value.find(
    item =>
      getFieldValue(item, selection.value.valueField) === id
  );

  if (record) {
    selectedRecord.value = record;

    searchText.value =
      getFieldValue(
        record,
        selection.value.selectedValue
      ) ?? "";

    showRequiredError.value = false;
  } else {
    selectedRecord.value = null;
    searchText.value = "";
  }
}

// FILTER AND SORT RECORDS
const filteredRecords = computed(() => {
  let result = [...records.value];

  const filter = dropdown.value.filter;

  if (filter?.enabled) {
    result = result.filter(record => {
      if (filter.operator === "equals") {
        return (
          getFieldValue(record, filter.field) === filter.value
        );
      }

      return true;
    });
  }

  if (isLookup.value && searchConfig.value.enabled) {
    const query =
      searchConfig.value.trimSpaces !== false
        ? searchText.value.trim()
        : searchText.value;

    if (query) {
      result = result.filter(record => {
        return (searchConfig.value.fields ?? []).some(field => {
          const recordValue = getFieldValue(record, field);

          if (
            recordValue === null ||
            recordValue === undefined
          ) {
            return false;
          }

          let value = String(recordValue);
          let search = query;

          if (searchConfig.value.caseSensitive !== true) {
            value = value.toLowerCase();
            search = search.toLowerCase();
          }

          return value.includes(search);
        });
      });
    }
  }

  const sort = dropdown.value.sort;

  if (sort?.field) {
    result.sort((a, b) => {
      const first = String(
        getFieldValue(a, sort.field) ?? ""
      );

      const second = String(
        getFieldValue(b, sort.field) ?? ""
      );

      const comparison = first.localeCompare(
        second,
        undefined,
        { sensitivity: "base" }
      );

      return sort.direction === "desc"
        ? -comparison
        : comparison;
    });
  }

  return result;
});

// OPTION VALUES
function getPrimaryValue(record) {
  return (
    getFieldValue(record, dropdown.value.primaryField) ?? "—"
  );
}

function getSecondaryValue(record, field) {
  const value = getFieldValue(record, field.field);

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  return value;
}

// DISABLED OPTION
function isOptionDisabled(record) {
  if (
    props.config.behavior?.disableInactive &&
    getFieldValue(record, "status") === "Inactive"
  ) {
    return true;
  }

  return false;
}

// SELECT RECORD
function selectRecord(record) {
  if (isOptionDisabled(record)) return;

  selectedRecord.value = record;

  searchText.value =
    getFieldValue(
      record,
      selection.value.selectedValue
    ) ?? "";

  isOpen.value = false;
  highlightedIndex.value = -1;
  showRequiredError.value = false;

  emit(
    "update:modelValue",
    getFieldValue(record, selection.value.valueField)
  );

  emit("selected", record);
}

// CLEAR SELECTION
function clearSelection() {
  selectedRecord.value = null;
  searchText.value = "";
  highlightedIndex.value = -1;

  showRequiredError.value = !!selection.value.required;

  emit("update:modelValue", null);
  emit("selected", null);
}

// OPEN DROPDOWN
function openDropdown() {
  if (
    selection.value.disabled ||
    selection.value.readonly
  ) {
    return;
  }

  isOpen.value = true;
  highlightedIndex.value = -1;
}

// TOGGLE DROPDOWN
function toggleDropdown() {
  if (
    selection.value.disabled ||
    selection.value.readonly
  ) {
    return;
  }

  isOpen.value = !isOpen.value;
  highlightedIndex.value = -1;
}

// SEARCH
function handleSearch(event) {
  searchText.value = event.target.value;

  if (selectedRecord.value) {
    selectedRecord.value = null;

    emit("update:modelValue", null);
    emit("selected", null);
  }

  showRequiredError.value = false;
  isOpen.value = true;
  highlightedIndex.value = -1;
}

// REQUIRED VALIDATION
function validateSelection() {
  if (
    selection.value.required &&
    !selectedRecord.value
  ) {
    showRequiredError.value = true;
    return false;
  }

  showRequiredError.value = false;
  return true;
}

function handleBlur() {
  setTimeout(() => {
    if (
      selection.value.required &&
      !selectedRecord.value &&
      !isOpen.value
    ) {
      showRequiredError.value = true;
    }
  }, 150);
}

// KEYBOARD NAVIGATION
function handleKeydown(event) {
  if (event.key === "ArrowDown") {
    event.preventDefault();

    if (!isOpen.value) {
      openDropdown();
      return;
    }

    highlightedIndex.value = Math.min(
      highlightedIndex.value + 1,
      filteredRecords.value.length - 1
    );
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();

    highlightedIndex.value = Math.max(
      highlightedIndex.value - 1,
      0
    );
  }

  if (event.key === "Enter" && isOpen.value) {
    event.preventDefault();

    const record =
      filteredRecords.value[highlightedIndex.value];

    if (record) {
      selectRecord(record);
    }
  }

  if (event.key === "Escape") {
    isOpen.value = false;
    highlightedIndex.value = -1;
  }
}

// ========================================
// DETAILS CARD IMPLEMENTATION
// ========================================

// GET CONFIGURED DETAILS CARD FIELDS
const cardFields = computed(() => {
  const config = detailsConfig.value;

  if (
    config.visible !== true ||
    !Array.isArray(config.fields)
  ) {
    return [];
  }

  return [...config.fields]
    .filter(field => field.field)
    .sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
    .filter(field => {
      const value = getFieldValue(
        selectedRecord.value,
        field.field
      );

      if (field.showIfAvailable) {
        return (
          value !== null &&
          value !== undefined &&
          value !== ""
        );
      }

      return true;
    });
});

// FORMAT DETAILS CARD VALUES
function getCardValue(field) {
  const value = getFieldValue(
    selectedRecord.value,
    field.field
  );

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  switch (field.format) {
    case "status":
      return String(value);

    case "date": {
      const date = new Date(value);

      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString();
    }

    case "currency": {
      const amount = Number(value);

      if (!Number.isFinite(amount)) {
        return String(value);
      }

      return new Intl.NumberFormat(
        field.locale || "en-CA",
        {
          style: "currency",
          currency: field.currency || "CAD"
        }
      ).format(amount);
    }

    case "boolean":
      return value ? "Yes" : "No";

    case "address":
      return Array.isArray(value)
        ? value.join(", ")
        : String(value);

    default:
      return typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  }
}

// STATUS CLASS
function getStatusClass(field) {
  return String(getCardValue(field))
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

// WATCH PARENT MODEL VALUE
watch(
  () => props.modelValue,
  value => {
    if (value === null || value === undefined) {
      selectedRecord.value = null;
      searchText.value = "";
    } else if (records.value.length) {
      restoreSelection(value);
    }
  }
);

// EXPOSE VALIDATION
defineExpose({
  validateSelection
});

// INITIALIZE
onMounted(() => {
  loadRecords();
});
</script>

<template>
  <div class="lookup-component">

    <!-- FIELD LABEL -->
    <label class="field-label">
      {{ selection.label }}

      <span
        v-if="selection.required"
        class="required"
      >
        *
      </span>
    </label>

    <!-- SELECTION FIELD -->
    <div
      class="selection-wrapper"
      :class="{
        'field-disabled': selection.disabled,
        'field-error': showRequiredError && !selectedRecord
      }"
    >
      <!-- SEARCH ICON -->
      <span class="search-icon">
        <svg
          width="17"
          height="17"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M28.7067 27.2931L23.5854 22.1718C25.5268 19.866 26.5027 16.8994 26.3094 13.8913C26.116 10.8832 24.7684 8.06596 22.5477 6.02764C20.3271 3.98932 17.405 2.88741 14.3913 2.9519C11.3777 3.01638 8.50542 4.24228 6.37397 6.37373C4.24253 8.50518 3.01663 11.3775 2.95214 14.3911C2.88766 17.4047 3.98957 20.3268 6.02788 22.5475C8.0662 24.7682 10.8834 26.1158 13.8915 26.3091C16.8996 26.5025 19.8662 25.5266 22.172 23.5851L27.2934 28.7065C27.4829 28.8831 27.7337 28.9793 27.9927 28.9747C28.2518 28.9701 28.499 28.8652 28.6822 28.682C28.8654 28.4987 28.9704 28.2516 28.9749 27.9925C28.9795 27.7334 28.8833 27.4827 28.7067 27.2931ZM5.00004 14.6665C5.00004 12.7546 5.56697 10.8856 6.62916 9.29595C7.69135 7.70627 9.20108 6.46727 10.9674 5.73562C12.7338 5.00397 14.6774 4.81254 16.5526 5.18553C18.4277 5.55852 20.1502 6.47918 21.5021 7.83109C22.854 9.183 23.7746 10.9054 24.1476 12.7806C24.5206 14.6557 24.3292 16.5994 23.5975 18.3657C22.8659 20.1321 21.6269 21.6418 20.0372 22.704C18.4475 23.766 16.5786 24.3331 14.6667 24.3331C12.1038 24.3303 9.64669 23.3109 7.83445 21.4987C6.02221 19.6865 5.00286 17.2294 5.00004 14.6665Z"
            fill="#909090"
          />
        </svg>
      </span>

      <!-- LOOKUP INPUT -->
      <input
        v-if="isLookup"
        :value="searchText"
        :placeholder="selection.placeholder"
        :disabled="selection.disabled"
        :readonly="selection.readonly"
        :class="{
          'input-error': showRequiredError && !selectedRecord
        }"
        @input="handleSearch"
        @focus="openDropdown"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- DROPDOWN INPUT -->
      <input
        v-else
        :value="searchText"
        :placeholder="selection.placeholder"
        readonly
        :disabled="selection.disabled"
        :class="{
          'input-error': showRequiredError && !selectedRecord
        }"
        @click="openDropdown"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- CLEAR BUTTON -->
      <button
        v-if="
          selection.clearable &&
          selectedRecord &&
          !selection.disabled &&
          !selection.readonly
        "
        class="clear-button"
        type="button"
        aria-label="Clear selection"
        @click="clearSelection"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.71094 7.88423L14.1016 13.2044L13.3984 13.8974L8 8.58486L2.60156 13.8974L1.89844 13.2044L7.28906 7.88423L1.89844 2.56403L2.60156 1.87109L8 7.18359L13.3984 1.87109L14.1016 2.56403L8.71094 7.88423Z"
            fill="#5A746A"
          />
        </svg>
      </button>

      <!-- DROPDOWN ARROW -->
      <button
        v-if="!selection.disabled && !selection.readonly"
        class="arrow-button"
        type="button"
        aria-label="Toggle options"
        @click="toggleDropdown"
      >
        <span :class="{ rotated: isOpen }">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.00002 11.1669C7.93435 11.1671 7.8693 11.1542 7.80864 11.129C7.74799 11.1038 7.69294 11.0668 7.64669 11.0202L2.98002 6.35356C2.8917 6.25877 2.84362 6.13341 2.8459 6.00388C2.84819 5.87434 2.90066 5.75075 2.99227 5.65914C3.08388 5.56753 3.20747 5.51506 3.337 5.51277C3.46654 5.51049 3.5919 5.55857 3.68669 5.64689L8.00002 9.95956L12.3134 5.64689C12.4081 5.55857 12.5335 5.51049 12.663 5.51277C12.7926 5.51506 12.9162 5.56753 13.0078 5.65914C13.0994 5.75075 13.1564 6.00388 13.1541 6.00388L13.02 6.35356L8.35335 11.0202C8.3071 11.0668 8.25205 11.1038 8.1914 11.129C8.13074 11.1542 8.06569 11.1671 8.00002 11.1669Z"
              fill="#25314C"
            />
          </svg>
        </span>
      </button>
    </div>

    <!-- REQUIRED ERROR -->
    <div
      v-if="showRequiredError && !selectedRecord"
      class="required-error-message"
    >
      {{ selection.errorMessage || "This field is required" }}
    </div>

    <!-- OPTIONS LIST -->
    <div
      v-if="isOpen"
      class="options-list"
    >
      <div
        v-if="isLoading"
        class="message"
      >
        Loading records...
      </div>

      <div
        v-else-if="error"
        class="message error-message"
      >
        {{ error }}

        <button
          type="button"
          @click="loadRecords"
        >
          Retry
        </button>
      </div>

      <div
        v-else-if="records.length === 0"
        class="message"
      >
        No options available
      </div>

      <div
        v-else-if="filteredRecords.length === 0"
        class="message"
      >
        No records found
      </div>

      <div
        v-else
        class="options-container"
      >
        <div
          v-for="(record, index) in filteredRecords"
          :key="getFieldValue(record, selection.valueField)"
          class="option"
          :class="{
            'option-active': highlightedIndex === index,
            'option-disabled': isOptionDisabled(record)
          }"
          :aria-disabled="isOptionDisabled(record)"
          @click="selectRecord(record)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="option-primary">
            {{ getPrimaryValue(record) }}
          </div>

          <div class="option-secondary">
            <span
              v-for="field in (dropdown.secondaryFields ?? [])"
              :key="field.field"
              class="secondary-item"
            >
              <template
                v-if="getSecondaryValue(record, field) !== null"
              >
                <span
                  v-if="field.label"
                  class="secondary-label"
                >
                  {{ field.label }}:
                </span>

                <span
                  v-if="field.format === 'status'"
                  class="status-value"
                >
                  <span
                    class="status-dot"
                    :class="
                      String(
                        getSecondaryValue(record, field)
                      ).toLowerCase()
                    "
                  ></span>

                  {{ getSecondaryValue(record, field) }}
                </span>

                <span v-else>
                  {{ getSecondaryValue(record, field) }}
                </span>
              </template>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAILS CARD -->
    <div
      v-if="
        selectedRecord &&
        detailsConfig.visible === true &&
        cardFields.length > 0
      "
      class="details-card"
      :style="{
        '--card-columns': detailsConfig.columns || 3
      }"
    >
      <div
        v-for="field in cardFields"
        :key="field.field"
        class="details-field"
      >
        <div class="details-label">
          {{ field.label || field.field }}
        </div>

        <div
          v-if="field.format === 'status'"
          class="details-status"
        >
          <span
            class="status-dot"
            :class="getStatusClass(field)"
          ></span>

          {{ getCardValue(field) }}
        </div>

        <div
          v-else
          class="details-value"
          :class="{
            'address-value': field.format === 'address'
          }"
        >
          {{ getCardValue(field) }}
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap");

.lookup-component,
.lookup-component * {
  font-family: "Open Sans", sans-serif;
  box-sizing: border-box;
}

.lookup-component {
  position: relative;
  width: 100%;
  font-size: 14px;
}

/* FIELD LABEL */
.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #244f43;
}

.required {
  color: red;
}

/* SELECTION FIELD */
.selection-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 42px;
  border: 1px solid #cbe1dd;
  border-radius: 7px;
  background: white;
}

.selection-wrapper:focus-within {
  border-color: #54bd95;
  box-shadow: 0 0 0 2px #47c56920;
}

.selection-wrapper input {
  flex: 1;
  min-width: 0;
  padding: 10px;
  border: none;
  outline: none;
  background: transparent;
  color: #173e34;
  font-size: 14px;
}

.search-icon {
  display: flex;
  align-items: center;
  padding-left: 12px;
}

/* REQUIRED ERROR */
.selection-wrapper.field-error {
  border-color: #dc2626;
}

.selection-wrapper.field-error:focus-within {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px #dc262620;
}

.selection-wrapper input.input-error::placeholder {
  color: #dc2626;
  opacity: 1;
}

.selection-wrapper input.input-error {
  color: #dc2626;
}

.required-error-message {
  margin-top: 5px;
  font-size: 12px;
  color: #dc2626;
}

/* BUTTONS */
.clear-button,
.arrow-button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #334155;
  padding: 8px;
}

.arrow-button span {
  display: inline-block;
  transition: transform 0.2s;
}

.arrow-button .rotated {
  transform: rotate(180deg);
}

/* DISABLED */
.field-disabled {
  background: #f1f5f9;
  opacity: 0.75;
}

/* OPTIONS LIST */
.options-list {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #dbe2eb;
  border-radius: 7px;
  box-shadow: 0 5px 15px #00000012;
}

.option {
  padding: 12px;
  border-bottom: 1px solid #edf0f5;
  cursor: pointer;
}

.option:hover,
.option-active {
  background: #eefff9;
}

.option-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.option-primary {
  font-size: 14px;
  font-weight: 600;
  color: #17233e;
  overflow-wrap: anywhere;
}

/* SECONDARY VALUES */
.option-secondary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 7px;
  font-size: 12px;
  color: #64748b;
}

.secondary-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.secondary-label {
  color: #64748b;
}

.status-value {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* STATUS DOT */
.status-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #94a3b8;
}

.status-dot.active {
  background: #22b573;
}

.status-dot.inactive {
  background: #ef4444;
}

/* MESSAGES */
.message {
  padding: 18px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
}

.error-message {
  color: #dc2626;
}

/* DETAILS CARD */
.details-card {
  display: grid;
  grid-template-columns: repeat(
    var(--card-columns, 3),
    minmax(0, 1fr)
  );
  gap: 20px;
  width: 100%;
  margin-top: 16px;
  padding: 20px;
  background: #f1f4f7;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.details-field {
  min-width: 0;
}

.details-label {
  margin-bottom: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #648b7b;
}

.details-value {
  font-size: 14px;
  font-weight: 500;
  color: #173e34;
  overflow-wrap: anywhere;
}

.address-value {
  white-space: normal;
  line-height: 1.6;
}

.details-status {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  color: #173e34;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .details-card {
    grid-template-columns: 1fr;
  }
}
</style>
