
<template>
  <div class="hlx-select">

    <!-- Selection Field -->
    <div
      class="selection-field"
      :class="{
        'field-error': isInvalid,
        disabled: isDisabled,
        focused: isFocused,
        readonly: readonly,
        'has-value': hasFieldContent,
        'non-search-dropdown':
          selectionType === 'dropdown' && !searchEnabled
      }"
      @click="openList"
    >

      <!-- Floating Label -->
      <label
        class="floating-label"
        :class="{
          floated: isFocused || hasFieldContent,
          'label-focused': isFocused && !isInvalid,
          'label-error': isInvalid
        }"
      >
        {{ label }}
        <span v-if="required" class="required">*</span>
      </label>

   
<!-- Search Icon -->
<i
v-if="searchEnabled"
  class="icon-search-regular field-icon"
  aria-hidden="true"
></i>

      <!-- Input -->
      <input
        ref="searchInput"
        v-model="searchText"
        type="text"
        :placeholder="inputPlaceholder"
        :disabled="isDisabled"
        :readonly="
          readonly ||
          (selectionType === 'dropdown' && !searchEnabled)
        "
        @input="handleSearch"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.tab="handleTab"
        @keydown.down.prevent="moveDown"
        @keydown.up.prevent="moveUp"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.esc="closeList"
      />

            <!-- Clear Icon -->
<i
  v-if="
    selectedRecord &&
    clearable &&
    !isDisabled &&
    !readonly &&
    !(selectionType === 'dropdown' && !searchEnabled)
  "
  class="icon-times-circle-regular action-icon clear-icon"
  aria-hidden="true"
  @click.stop="clearSelection"
></i>

      <!-- Dropdown Icon -->
<i
  v-if="selectionType === 'dropdown'"
  :class="{ rotated: isOpen }"
  class="icon-angle-down-filled action-icon dropdown-arrow"
  aria-hidden="true"
  @click.stop="toggleList"
></i>

    </div>

    <!-- Validation -->
    <div v-if="isInvalid" class="error-message">
      {{ validationMessage }}
    </div>

    <!-- Options -->
   <div
  v-if="
    isOpen &&
    (
      selectionType === 'dropdown' ||
      searchText.trim().length > 0 ||
      isLoading ||
      apiError
    )
  "
  class="options-container"
  :style="dropdownStyle"
>

      <!-- Loading -->
      <div v-if="isLoading" class="options-loading-state">
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span>{{ loadingText }}</span>
      </div>

      <!-- API Error -->
      <div
        v-else-if="apiError && filteredOptions.length === 0"
        class="options-error-state"
      >
        <i
  class="icon-triangle-exclamation-regular error-icon"
  aria-hidden="true"
></i>

        <h3>Unable to load records</h3>

        <p>Please try again.</p>

        <button
          type="button"
          class="card-retry-button"
          @mousedown.prevent
          @click="retryApiOptions"
        >
          <i
  class="icon-rotate-regular"
  aria-hidden="true"
></i>

          <span>Retry</span>
        </button>
      </div>

      <!-- No Results -->
<div
  v-else-if="
    (
      selectionType === 'dropdown' ||
      searchText.trim().length > 0
    ) &&
    filteredOptions.length === 0
  "
  class="empty-message"
>
  <span v-if="isDependencyBlocked">
    {{ dependencyText }}
  </span>

  <span v-else-if="dependentOptions.length === 0">
    {{ noOptionsText }}
  </span>

  <span v-else>
    {{ emptyText }}
  </span>

  <!-- Add New Record -->
  <button
    v-if="
      selectionType === 'lookup' &&
      apiEnabled &&
      createEnabled &&
      createApiUrl &&
      createFields.length
    "
    type="button"
    class="add-record-button"
    @mousedown.prevent
    @click.stop="openCreateForm"
  >
    <span class="add-record-icon">+</span>
    Add New Record
  </button>
</div>
    
      <!-- Option List -->
      <template v-else>

        <div
          v-for="(record, index) in visibleOptions"
          :key="getFieldValue(record, valueKey) ?? index"
          class="option-item"
          :class="{
            highlighted: highlightedIndex === index,
            selected:
              selectedRecord &&
              getFieldValue(selectedRecord, valueKey) ===
              getFieldValue(record, valueKey),
            'option-disabled': isOptionDisabled(record)
          }"
          @mousedown.prevent="selectRecord(record)"
        >
      <!-- Option Icon -->
<i
  v-if="optionIcon"
  :class="['option-icon', optionIcon]"
  aria-hidden="true"
></i>

          <div class="option-content">

            <!-- Primary Field -->
            <div class="option-title">
              {{ getFieldValue(record, displayKey) ?? 'Unnamed record' }}
            </div>

            <!-- Secondary Fields -->
            <div
              v-if="visibleSecondaryFields(record).length"
              class="option-subtitle"
            >
              <span
                v-for="(key, fieldIndex) in visibleSecondaryFields(record)"
                :key="key"
                class="secondary-item"
              >

                
<!-- Status Values -->
<template v-if="isStatusField(key)">
  <span
    v-for="(statusValue, statusIndex) in getStatusValues(record, key)"
    :key="`${key}-${statusIndex}`"
    class="status-entry"
  >
    <div class="option-status">
      <span
        class="status-dot"
        :style="getStatusStyle(statusValue)"
      ></span>

      <span class="status-text">
        {{ getStatusLabel(statusValue) }}
      </span>
    </div>

    <span
      v-if="statusIndex < getStatusValues(record, key).length - 1"
    >
      ,
    </span>
  </span>
</template>


                <!-- Normal Secondary Field -->
                <template v-else>
                  <span>
                    {{
                      hasFieldValue(record, key)
                        ? getFieldValue(record, key)
                        : secondaryFallback
                    }}
                  </span>
                </template>

                <!-- Separator -->
                <svg
                  v-if="
                    fieldIndex <
                    visibleSecondaryFields(record).length - 1
                  "
                  width="4"
                  height="4"
                  viewBox="0 0 2 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="1"
                    cy="1"
                    r="1"
                    fill="#8D8D8D"
                  />
                </svg>

                &nbsp;

              </span>
            </div>

            <!-- Disabled Option Reason -->
            <div
              v-if="
                isOptionDisabled(record) &&
                disabledReasonKey &&
                getFieldValue(record, disabledReasonKey)
              "
              class="option-disabled-reason"
            >
              {{ getFieldValue(record, disabledReasonKey) }}
            </div>

          </div>

        </div>

        <!-- Load More Error -->
        <div v-if="apiEnabled && apiError" class="options-inline-error">
          <span>Unable to load more records.</span>

          <button
            type="button"
            class="card-retry-button"
            @mousedown.prevent
            @click="retryApiOptions"
          >
            {{ retryText }}
          </button>
        </div>

      </template>

    </div>

    <!-- Selected Record Details Card -->
    <div
      v-if="
        showCard &&
        selectedRecord &&
        (cardLoading || cardError || hasVisibleCardData)
      "
      class="details-card"
    >

      <!-- Loading State -->
      <div v-if="cardLoading" class="card-loading-state">
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="card-loading-text">{{ cardLoadingText }}</span>
      </div>

      <!-- Error State -->
      <div v-else-if="cardError" class="card-error-state">

        <i
  class="icon-triangle-exclamation-regular error-icon"
  aria-hidden="true"
></i>

        <h3>Unable to load data</h3>

        <p>{{ cardErrorMessage }}</p>

        <button
          type="button"
          class="card-retry-button"
          @click="$emit('retry', selectedRecord)"
        >
          <i
  class="icon-rotate-regular"
  aria-hidden="true"
></i>

          <span>Retry</span>
        </button>

      </div>

      <!-- Details -->
      <div
        v-else-if="visibleCardFields.length"
        class="card-body"
        :style="cardGridStyle"
      >

        <div
          v-for="field in visibleCardFields"
          :key="field.key"
          class="detail-item"
        >

          <label>{{ field.label }}</label>

          
<!-- Status -->
<span
  v-if="field.format === 'status'"
  class="status-value"
>
  <span
    v-for="(statusValue, statusIndex) in (
      Array.isArray(field.value)
        ? field.value
        : [field.value]
    )"
    :key="`${field.key}-${statusIndex}`"
    class="status-entry"
  >
    <div class="detail-status">
      <span
        class="status-dot"
        :style="getStatusStyle(statusValue)"
      ></span>

      <span class="status-text">
        {{ getStatusLabel(statusValue) }}
      </span>
    </div>
  </span>
</span>


          <!-- Normal Value -->
          <span
            v-else
            class="detail-value"
          >
            {{ formatCardValue(field) }}
          </span>

        </div>

      </div>

      <!-- Empty State -->
      <div v-else class="empty-card">
        {{ emptyCardText }}
      </div>

    </div>
    <!-- Create Record Overlay -->
<div
  v-if="isCreateOpen"
  class="create-overlay"
  @click.self="closeCreateForm"
>
  <div class="create-modal">

    <!-- Header -->
    <div class="create-modal-header">
      <h3>Add New Record</h3>

      <button
        type="button"
        class="create-close-button"
        :disabled="createFormLoading"
        @click="closeCreateForm"
      >
        &times;
      </button>
    </div>

    <!-- Form -->
    <form
      class="create-form"
      @submit.prevent="submitCreateForm"
    >

      <div class="create-form-fields">

        <div
          v-for="field in createFields"
          :key="field.key"
          class="create-field"
          :class="{
            'create-field-focused':
              createFocusedField === field.key
          }"
        >

          <!-- Select -->
          <template v-if="field.type === 'select'">

            <label
              class="create-floating-label floated"
              :class="{
                'create-label-focused':
                  createFocusedField === field.key
              }"
            >
              {{ field.label }}
              <span v-if="field.required" class="required">*</span>
            </label>

            <select
              v-model="createFormData[field.key]"
              :required="!!field.required"
              @focus="createFocusedField = field.key"
              @blur="createFocusedField = ''"
            >
              <option value="" disabled>
                {{ field.placeholder || `Select ${field.label}` }}
              </option>

              <option
                v-for="option in field.options || []"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label ?? option.name ?? option.value }}
              </option>
            </select>

          </template>

          <!-- Textarea -->
          <template v-else-if="field.type === 'textarea'">

            <label
              class="create-floating-label floated"
              :class="{
                'create-label-focused':
                  createFocusedField === field.key
              }"
            >
              {{ field.label }}
              <span v-if="field.required" class="required">*</span>
            </label>

            <textarea
              v-model="createFormData[field.key]"
              :required="!!field.required"
              :placeholder="field.placeholder || ''"
              rows="3"
              @focus="createFocusedField = field.key"
              @blur="createFocusedField = ''"
            ></textarea>

          </template>

          <!-- Normal Input -->
          <template v-else>

            <label
              class="create-floating-label"
              :class="{
                floated:
                  createFocusedField === field.key ||
                  (
                    createFormData[field.key] !== '' &&
                    createFormData[field.key] !== null &&
                    createFormData[field.key] !== undefined
                  ),
                'create-label-focused':
                  createFocusedField === field.key
              }"
            >
              {{ field.label }}
              <span v-if="field.required" class="required">*</span>
            </label>

            <input
              v-model="createFormData[field.key]"
              :type="field.type || 'text'"
              :required="!!field.required"
              :placeholder="
                createFocusedField === field.key
                  ? (field.placeholder || '')
                  : ''
              "
              @focus="createFocusedField = field.key"
              @blur="createFocusedField = ''"
            />

          </template>

        </div>

      </div>

      <!-- API Error -->
      <div
        v-if="createFormError"
        class="create-form-error"
      >
        {{ createFormError }}
      </div>

      <!-- Footer -->
      <div class="create-modal-footer">

        <button
          type="button"
          class="create-cancel-button"
          :disabled="createFormLoading"
          @click="closeCreateForm"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="create-submit-button"
          :disabled="createFormLoading"
        >
          {{
            createFormLoading
              ? "Saving..."
              : "Submit"
          }}
        </button>

      </div>

    </form>

  </div>
</div>

  </div>
</template>

<script>


export default {
  name: "hlxselect",

  props: {

    // Selection Configuration
    selectionType: {
      type: String,
      default: "lookup",
      validator(value) {
        return ["lookup", "dropdown"].includes(value);
      }
    },

    label: {
      type: String,
      default: "Select Record"
    },

    placeholder: {
      type: String,
      default: ""
    },

    searchEnabled: {
      type: Boolean,
      default: true
    },
    statusKey: {
      type: String,
      default: ""
    },

    statusValueKey: {
      type: String,
      default: "value"
    },

    statusColorKey: {
      type: String,
      default: "color"
    },

        // Icons
    fieldIcon: {
      type: [String,Object,Function],
      default: ""
    },

    // Icons
optionIcon: {
  type: String,
  default: ""
},

optionIconKey: {
  type: String,
  default: ""
},
    // Create Record
createEnabled: {
  type: Boolean,
  default: false
},

createApiUrl: {
  type: String,
  default: ""
},

createFields: {
  type: Array,
  default: () => []
},

createResponseKey: {
  type: String,
  default: ""
},
    // Records
    options: {
      type: Array,
      default: () => []
    },

    // Dependent Lookup
    dependency: {
      type: Object,
      default: null
    },

    dependencyText: {
      type: String,
      default: "Select a parent record first"
    },

    dependencies: {
      type: Array,
      default: () => []
    },

    valueKey: {
      type: String,
      default: "id"
    },

    displayKey: {
      type: String,
      default: "name"
    },

    secondaryKey: {
      type: [String, Array],
      default: ""
    },

    secondaryFallback: {
      type: String,
      default: ""
    },

    searchKeys: {
      type: Array,
      default: () => []
    },

    // Selection
    modelValue: {
      type: [String, Number],
      default: null
    },

    // Behavior
    required: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    readonly: {
      type: Boolean,
      default: false
    },

    clearable: {
      type: Boolean,
      default: true
    },

    disabledKey: {
      type: String,
      default: ""
    },

    disabledReasonKey: {
      type: String,
      default: ""
    },

    // Messages
    noOptionsText: {
      type: String,
      default: "No options available"
    },

    emptyText: {
      type: String,
      default: "No results found"
    },

    // Loading
    loading: {
      type: Boolean,
      default: false
    },

    loadingText: {
      type: String,
      default: "Loading records..."
    },

    // Sorting
    sortKey: {
      type: String,
      default: ""
    },

    sortDirection: {
      type: String,
      default: "asc",
      validator(value) {
        return ["asc", "desc"].includes(value);
      }
    },

    // Pagination / Remote Loading
    pageSize: {
      type: Number,
      default: 0
    },

    hasMore: {
      type: Boolean,
      default: false
    },

    // Details Card
    showCard: {
      type: Boolean,
      default: false
    },

    cardFields: {
      type: Array,
      default: () => []
    },

    cardColumns: {
      type: Number,
      default: 2,
      validator(value) {
        return [1, 2, 3, 4].includes(value);
      }
    },

    cardLoading: {
      type: Boolean,
      default: false
    },

    cardLoadingText: {
      type: String,
      default: "Loading details..."
    },

    cardError: {
      type: Boolean,
      default: false
    },

    cardErrorMessage: {
      type: String,
      default: "Unable to load record details"
    },

    retryText: {
      type: String,
      default: "Retry"
    },

    emptyCardText: {
      type: String,
      default: "No data"
    },

    // Validation
    error: {
      type: Boolean,
      default: false
    },

    customError: {
      type: String,
      default: ""
    },

    errorMessage: {
      type: String,
      default: "Please select a record"
    },

    statusIcon: {
      type: [Object, Function, String],
      default: null
    },

    statusOptions: {
      type: Array,
      default: () => []
    },

    dependencyOperator: {
      type: String,
      default: "AND",
      validator: value =>
        ["AND", "OR"].includes(value.toUpperCase())
    },

    apiEnabled: {
      type: Boolean,
      default: false
    },

    apiUrl: {
      type: String,
      default: ""
    },

    apiResponseKey: {
      type: String,
      default: ""
    }

  },

  emits: [
  "update:modelValue",
  "select",
  "clear",
  "search",
  "retry",
  "load-more",
  "created"
],

  data() {
    return {

isOpen: false,
    dropdownStyle: {
      top: "0px",
      left: "0px",
      width: "100%",
      maxHeight: "220px"
    },

    isFocused: false,
    searchText: "",

    selectedRecord: null,

    highlightedIndex: -1,
    localVisibleCount: 0,
    showError: false,

      blurTimer: null,
      apiOptions: [],
      apiLoading: false,
      apiLoaded: false,
      apiCurrentPage: 0,
      apiTotalPages: 1,
      apiError: false,
      apiAbortController: null,
      apiRequestId: 0,
      apiNextUrl: null,
      initialModelValue: this.modelValue,
      invalidSelection: false,
      // Create Record Form
isCreateOpen: false,
createFormData: {},
createFormError: "",
createFormLoading: false,
createFocusedField: ""
    };
  },

  computed: {

    // Determine Whether Field Has a Value
    hasFieldContent() {
      return Boolean(
        this.searchText ||
        this.selectedRecord
      );
    },

    // Secondary Fields
    secondaryFields() {
      if (Array.isArray(this.secondaryKey)) {
        return this.secondaryKey;
      }

      return this.secondaryKey
        ? [this.secondaryKey]
        : [];
    },

    // Check Whether Parent Selection Is Missing
    isDependencyBlocked() {

      const hasValue = dependency => {
        return (
          dependency.parentValue !== null &&
          dependency.parentValue !== undefined &&
          dependency.parentValue !== ""
        );
      };

      if (this.dependencyOperator.toUpperCase() === "OR") {
        return !this.activeDependencies.some(hasValue);
      }

      return this.activeDependencies.some(dependency => {
        return !hasValue(dependency);
      });

    },

    activeDependencies() {

      if (this.dependencies.length > 0) {
        return this.dependencies;
      }

      return this.dependency
        ? [this.dependency]
        : [];

    },

    // Combine External Disabled State and Dependency State
    isDisabled() {
      return this.disabled || this.isDependencyBlocked;
    },

    // Filter Options Based on Parent Selection
    dependentOptions() {

      if (this.activeDependencies.length === 0) {
        return this.availableOptions;
      }

      if (this.isDependencyBlocked) {
        return [];
      }

      const validDependencies = this.activeDependencies.filter(
        dependency => (
          dependency.parentValue !== null &&
          dependency.parentValue !== undefined &&
          dependency.parentValue !== ""
        )
      );

      return this.availableOptions.filter(record => {

        const matches = dependency => {
          return this.matchesDependency(record, dependency);
        };

        return this.dependencyOperator.toUpperCase() === "OR"
          ? validDependencies.some(matches)
          : validDependencies.every(matches);

      });

    },

    // Filter and Sort Options
    filteredOptions() {
      const searchValue = this.searchText
        .trim()
        .toLowerCase();

      // Lookup initially shows no records.
      if (
        this.selectionType === "lookup" &&
        !searchValue
      ) {
        return [];
      }

      // Dropdown without search shows all records.
      if (
        this.selectionType === "dropdown" &&
        !this.searchEnabled
      ) {
        return this.sortOptions(this.dependentOptions);
      }

      // Search configured fields or default fields.
      const fields = this.searchKeys.length
        ? this.searchKeys
        : [
            this.displayKey,
            ...this.secondaryFields
          ].filter(Boolean);

      const filtered = this.dependentOptions.filter(record => {
        return fields.some(path => {
          const value = this.getFieldValue(record, path);

          if (value === undefined || value === null) {
            return false;
          }

          const searchableValue =
            typeof value === "object"
              ? JSON.stringify(value)
              : String(value);

          return searchableValue
            .toLowerCase()
            .includes(searchValue);
        });
      });

      return this.sortOptions(filtered);
    },

    // Visible Options
    visibleOptions() {

      // API Lookup: display every fetched matching record.
      if (
        this.selectionType === "lookup" &&
        this.apiEnabled
      ) {
        return this.filteredOptions;
      }

      // No local pagination when pageSize is 0.
      if (this.pageSize <= 0) {
        return this.filteredOptions;
      }

      const limit = this.localVisibleCount || this.pageSize;

      return this.filteredOptions.slice(0, limit);
    },

    // Visible Card Fields
    visibleCardFields() {
      if (!this.selectedRecord) {
        return [];
      }

      return this.cardFields
        .filter(field => field.visible !== false)
        .map(field => {
          const actualValue =
            field.format === "status"
              ? this.getStatusValues(
                  this.selectedRecord,
                  field.key
                )
              : this.getFieldValue(
                  this.selectedRecord,
                  field.key
                );

          const hasActualValue = Array.isArray(actualValue)
            ? actualValue.length > 0
            : actualValue !== null &&
              actualValue !== undefined &&
              actualValue !== "";

          const hasFallback =
            field.fallback !== undefined &&
            field.fallback !== null &&
            field.fallback !== "";

          return {
            ...field,
            value: hasActualValue
              ? actualValue
              : hasFallback
                ? field.format === "status"
                  ? [field.fallback]
                  : field.fallback
                : null
          };
        })
        .filter(field => field.value !== null);
    },

    // Card Layout
    cardGridStyle() {
      const columns = [1, 2, 3, 4].includes(this.cardColumns)
        ? this.cardColumns
        : 2;

      return {
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      };
    },

    // Validation
    isInvalid() {
      return (
        this.error ||
        this.showError ||
        this.invalidSelection ||
        Boolean(this.customError.trim())
      );
    },

    validationMessage() {
      if (this.invalidSelection) {
        return "The selected record is no longer available.Please select another record.";
      }

      return this.customError || this.errorMessage;
    },

    // Input Placeholder
    inputPlaceholder() {
      if (this.isFocused && !this.selectedRecord) {
        return this.placeholder;
      }

      return "";
    },

    hasVisibleCardData() {
      return this.visibleCardFields.length > 0;
    },

    availableOptions() {
      return this.apiEnabled
        ? this.apiOptions
        : this.options;
    },

    isLoading() {
      return this.loading || this.apiLoading;
    }

  },

  watch: {

    searchText() {
      if (this.isOpen) {
        this.updateDropdownPosition();
      }
    },

    visibleOptions() {
      if (this.isOpen) {
        this.updateDropdownPosition();
      }
    },

    isLoading() {
      if (this.isOpen) {
        this.updateDropdownPosition();
      }
    },

    apiError() {
      if (this.isOpen) {
        this.updateDropdownPosition();
      }
    },

    modelValue: {
      immediate: true,

      handler(newValue) {

        if (
          newValue === null ||
          newValue === undefined ||
          newValue === ""
        ) {
          this.selectedRecord = null;
          this.searchText = "";
          this.invalidSelection = false;
          return;
        }

        this.syncSelectedRecord(newValue);
      }
    },

    options: {
      deep: true,

      handler() {

        if (
          this.modelValue === null ||
          this.modelValue === undefined ||
          this.modelValue === ""
        ) {
          return;
        }

        this.syncSelectedRecord(this.modelValue);
      }
    },

    // Synchronize a preselected API record when it arrives.
    apiOptions: {
      deep: true,

      handler(records) {
        if (
          this.modelValue === null ||
          this.modelValue === undefined ||
          this.modelValue === ""
        ) {
          return;
        }

        const recordExists = records.some(record => {
          return (
            this.getFieldValue(record, this.valueKey) ===
            this.modelValue
          );
        });

        if (recordExists && !this.isOpen) {
          this.syncSelectedRecord(this.modelValue);
        }
      }
    },

    // Search Mode Changes
    searchEnabled() {
      this.searchText = "";
      this.highlightedIndex = -1;
    },

    // Selection Mode Changes
    selectionType() {
      this.closeList();
      this.searchText = "";
    },

    // External Validation
    error(newValue) {
      if (!newValue) {
        this.showError = false;
      }
    },

    // Parent Selection Changes
    activeDependencies: {
      deep: true,

      handler() {
        this.closeList();

        if (
          this.modelValue === null ||
          this.modelValue === undefined ||
          this.modelValue === ""
        ) {
          return;
        }

        const matchingRecord = this.dependentOptions.find(record => {
          return (
            this.getFieldValue(record, this.valueKey) ===
            this.modelValue
          );
        });

        if (matchingRecord) {
          this.syncSelectedRecord(this.modelValue);
        } else {
          this.selectedRecord = null;
          this.searchText = "";

          this.$emit("update:modelValue", null);
          this.$emit("clear");
        }

      }

    },

    dependencyOperator: {
      handler() {
        this.closeList();

        if (
          this.modelValue === null ||
          this.modelValue === undefined ||
          this.modelValue === ""
        ) {
          return;
        }

        const matchingRecord = this.dependentOptions.find(record => {
          return (
            this.getFieldValue(record, this.valueKey) ===
            this.modelValue
          );
        });

        if (matchingRecord) {
          this.syncSelectedRecord(this.modelValue);
        } else {
          this.selectedRecord = null;
          this.searchText = "";
          this.$emit("update:modelValue", null);
          this.$emit("clear");
        }
      }
    }

  },

  mounted() {
  document.addEventListener(
    "pointerdown",
    this.handleOutsideClick
  );

  window.addEventListener(
    "scroll",
    this.updateDropdownPosition,
    true
  );

  window.addEventListener(
    "resize",
    this.updateDropdownPosition
  );
},

  beforeUnmount() {
  document.removeEventListener(
    "pointerdown",
    this.handleOutsideClick
  );

  window.removeEventListener(
    "scroll",
    this.updateDropdownPosition,
    true
  );

  window.removeEventListener(
    "resize",
    this.updateDropdownPosition
  );

  if (this.blurTimer) {
    clearTimeout(this.blurTimer);
  }
},

  methods: {

      getNestedValue(data, path) {
  if (!data || !path) {
    return undefined;
  }

  return path.split(".").reduce((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    return current[key];
  }, data);
},

    // Nested Property
    getFieldValue(record, path) {
      if (record === null || record === undefined) {
        return undefined;
      }

      // Support arrays of primitive values.
      if (
        typeof record !== "object" &&
        typeof record !== "function"
      ) {
        return path ? undefined : record;
      }

      if (!path) {
        return record;
      }

      return String(path)
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .filter(Boolean)
        .reduce((current, key) => {
          if (
            current === null ||
            current === undefined
          ) {
            return undefined;
          }

          return current[key];
        }, record);
    },

    // Check Whether Value Exists
    hasFieldValue(record, path) {
      const value = this.getFieldValue(record, path);

      return (
        value !== undefined &&
        value !== null &&
        value !== ""
      );
    },

    syncSelectedRecord(value) {
      const record = this.dependentOptions.find(item => {
        return (
          this.getFieldValue(item, this.valueKey) === value
        );
      });

      if (record) {
        this.selectedRecord = record;

        this.searchText =
          this.getFieldValue(record, this.displayKey) ?? "";

        this.invalidSelection = false;
        return;
      }

      // A record may simply not be loaded yet when using an API.
      if (this.apiEnabled) {
        this.selectedRecord = null;
        this.searchText = "";
        this.invalidSelection = false;
        return;
      }

      // The selected ID is missing from the local options.
      this.selectedRecord = null;
      this.searchText = "";
      this.invalidSelection = true;
    },

    // SORTING
    sortOptions(records) {

      if (!this.sortKey) {
        return records;
      }

      return [...records].sort((a, b) => {

        const first = this.getFieldValue(
          a,
          this.sortKey
        );

        const second = this.getFieldValue(
          b,
          this.sortKey
        );

        const comparison = String(first ?? "").localeCompare(
          String(second ?? ""),
          undefined,
          {
            numeric: true,
            sensitivity: "base"
          }
        );

        return this.sortDirection === "desc"
          ? -comparison
          : comparison;

      });

    },

    openList() {
  if (this.isDisabled || this.readonly) {
    return;
  }

  this.isOpen = true;
  this.isFocused = true;
  this.highlightedIndex = -1;

  this.updateDropdownPosition();

  this.$nextTick(() => {
    this.$refs.searchInput?.focus();
  });
},

    // Dropdown Arrow
    toggleList() {

      if (this.isDisabled || this.readonly) {
        return;
      }

      if (this.isOpen) {
        this.closeList();
      } else {
        this.openList();
      }

    },

    // INPUT FOCUS
    handleFocus() {

      if (this.isDisabled || this.readonly) {
        return;
      }

      this.isFocused = true;

      if (!this.isOpen) {
        this.openList();
      }

    },

    // HANDLE TAB
    handleTab() {
      if (this.isDisabled || this.readonly) {
        return;
      }

      this.openList();
    },

    // SEARCH
    handleSearch() {

      if (
        this.selectionType === "dropdown" &&
        !this.searchEnabled
      ) {
        return;
      }

      this.isOpen = true;
      this.highlightedIndex = -1;
      this.localVisibleCount = 0;

      if (
        this.selectionType === "lookup" &&
        this.apiEnabled
      ) {

        if (this.searchText.trim()) {
          this.fetchApiOptions(true);
        } else {
          // Cancel the previous search when input is cleared.
          this.apiAbortController?.abort();
          this.apiRequestId++;

          this.apiOptions = [];
          this.apiCurrentPage = 0;
          this.apiTotalPages = 1;
          this.apiNextUrl = null;
          this.apiLoaded = false;
          this.apiLoading = false;
          this.apiError = false;
        }
      }

      this.$emit("search", this.searchText);
    },

    // SECONDARY FIELDS
    visibleSecondaryFields(record) {
      return this.secondaryFields.filter(key => {
        if (this.isStatusField(key)) {
          return (
            this.getStatusValues(record, key).length > 0 ||
            this.secondaryFallback !== ""
          );
        }

        return (
          this.hasFieldValue(record, key) ||
          this.secondaryFallback !== ""
        );
      });
    },

    // STATUS FIELD
    isStatusField(key) {
      const fieldName = String(key)
        .split(".")
        .pop()
        .replace(/\[\d+\]/g, "")
        .toLowerCase();

      return fieldName === "status";
    },

    // Get Status Values - Supports Nested Objects and Arrays
    getStatusValues(record, path) {
      if (
        record === null ||
        record === undefined ||
        !path
      ) {
        return [];
      }

      const parts = String(path)
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .filter(Boolean);

      const resolveValues = (current, index) => {
        if (
          current === null ||
          current === undefined
        ) {
          return [];
        }

        if (Array.isArray(current)) {
          return current.flatMap(item =>
            resolveValues(item, index)
          );
        }

        if (index >= parts.length) {
          return [current];
        }

        return resolveValues(
          current[parts[index]],
          index + 1
        );
      };

      return resolveValues(record, 0).filter(value =>
        value !== null &&
        value !== undefined &&
        value !== ""
      );
    },

getStatusOption(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const getOptionValue = option => {
    if (!option || typeof option !== "object") {
      return option;
    }

    return (
      option[this.statusValueKey] ??
      option.value ??
      option.code ??
      option.statusCode ??
      option.status_code ??
      option.id ??
      option.name ??
      option.label
    );
  };

  // Resolve an object status using its configured value property.
  const statusValue =
    typeof value === "object"
      ? getOptionValue(value)
      : value;

  const configuredStatus = this.statusOptions.find(option => {
    const optionValue = getOptionValue(option);

    return (
      optionValue !== undefined &&
      optionValue !== null &&
      String(optionValue).toLowerCase() ===
        String(statusValue).toLowerCase()
    );
  });

  if (configuredStatus) {
    return configuredStatus;
  }

  // Use the original object when no configured option matches.
  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  return null;
},

getStatusLabel(value) {
  const status = this.getStatusOption(value);

  if (status) {
    return (
      status.name ??
      status.label ??
      status[this.statusValueKey] ??
      status.value ??
      ""
    );
  }

  return typeof value === "object"
    ? ""
    : String(value ?? "");
},

getStatusStyle(value) {
  const status = this.getStatusOption(value);

  return {
    backgroundColor:
      status && typeof status === "object"
        ? (
            status[this.statusColorKey] ??
            status.color ??
            "#999999"
          )
        : "#999999"
  };
},

   

    // SELECT RECORD
    selectRecord(record) {

      if (
        this.isDisabled ||
        this.readonly ||
        this.isOptionDisabled(record)
      ) {
        return;
      }

      this.selectedRecord = record;

      const selectedValue = this.getFieldValue(
        record,
        this.valueKey
      );

      // Send Unique ID to Parent
      this.$emit(
        "update:modelValue",
        selectedValue
      );

      // Send Complete Record to Parent
      this.$emit("select", record);

      this.searchText =
        this.getFieldValue(record, this.displayKey) ?? "";

      this.isOpen = false;
      this.isFocused = false;

      this.highlightedIndex = -1;

      this.showError = false;
      this.invalidSelection = false;
      this.$emit("search", "");

    },

    // CLEAR SELECTION
    clearSelection() {
      this.selectedRecord = null;
      this.searchText = "";

      this.apiOptions = [];
      this.apiCurrentPage = 0;
      this.apiTotalPages = 1;
      this.apiLoaded = false;
      this.apiError = false;

      this.isOpen = false;
      this.highlightedIndex = -1;
      this.isFocused = true;

      this.invalidSelection = false;

      this.$emit("update:modelValue", null);
      this.$emit("clear");
      this.$emit("search", "");

      this.$nextTick(() => {
        this.$refs.searchInput?.focus();
      });

      if (this.required) {
        this.validate();
      }
    },

    // CLOSE OPTIONS
    closeList() {
      this.isOpen = false;
      this.highlightedIndex = -1;
      this.isFocused = false;

      if (this.selectedRecord) {
        this.searchText =
          this.getFieldValue(
            this.selectedRecord,
            this.displayKey
          ) ?? "";
      }
    },

    // OUTSIDE CLICK
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) {

        this.isOpen = false;
        this.highlightedIndex = -1;
        this.isFocused = false;

        if (this.selectedRecord) {
          // Restore the selected record's display value.
          this.searchText =
            this.getFieldValue(
              this.selectedRecord,
              this.displayKey
            ) ?? "";
        } else {
          // Clear unselected search text.
          this.searchText = "";
        }
      }
    },

    // DISABLED OPTION
    isOptionDisabled(record) {

      if (!this.disabledKey) {
        return false;
      }

      return Boolean(
        this.getFieldValue(record, this.disabledKey)
      );

    },

    // KEYBOARD NAVIGATION
    moveDown() {

      if (!this.isOpen) {
        this.openList();
        return;
      }

      const available = this.filteredOptions
        .map((record, index) => ({ record, index }))
        .filter(item => !this.isOptionDisabled(item.record))
        .filter(item => item.index < this.visibleOptions.length);

      if (!available.length) return;

      const currentPosition = available.findIndex(
        item => item.index === this.highlightedIndex
      );

      const nextPosition =
        (currentPosition + 1) % available.length;

      this.highlightedIndex =
        available[nextPosition].index;

      this.scrollHighlightedIntoView();

    },
    updateDropdownPosition() {
      this.$nextTick(() => {
        if (!this.isOpen) {
          return;
        }

        const field = this.$el.querySelector(".selection-field");

        if (!field) {
          return;
        }

        const rect = field.getBoundingClientRect();
        const dropdown = this.$el.querySelector(".options-container");
        const maxDropdownHeight = 220;
        const viewportPadding = 8;
        const gap = 4;
        const spaceAbove = Math.max(
          0,
          rect.top - gap - viewportPadding
        );
        const spaceBelow = Math.max(
          0,
          window.innerHeight - rect.bottom - gap - viewportPadding
        );
        const contentHeight = dropdown
          ? Math.min(dropdown.scrollHeight, maxDropdownHeight)
          : maxDropdownHeight;
        const fitsBelow = spaceBelow >= contentHeight;
        const fitsAbove = spaceAbove >= contentHeight;
        const openAbove =
          !fitsBelow && (fitsAbove || spaceAbove > spaceBelow);
        const availableHeight = openAbove ? spaceAbove : spaceBelow;
        const maxHeight = Math.min(maxDropdownHeight, availableHeight);
        const dropdownHeight = dropdown
          ? Math.min(contentHeight, maxHeight)
          : maxHeight;
        const width = Math.min(
          rect.width,
          window.innerWidth - viewportPadding * 2
        );
        const left = Math.min(
          Math.max(viewportPadding, rect.left),
          window.innerWidth - viewportPadding - width
        );
        const top = openAbove
          ? rect.top - gap - dropdownHeight
          : rect.bottom + gap;

        this.dropdownStyle = {
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          maxHeight: `${maxHeight}px`
        };
      });
    },

    moveUp() {

      if (!this.isOpen) {
        this.openList();
        return;
      }

      const available = this.filteredOptions
        .map((record, index) => ({ record, index }))
        .filter(item => !this.isOptionDisabled(item.record))
        .filter(item => item.index < this.visibleOptions.length);

      if (!available.length) return;

      const currentPosition = available.findIndex(
        item => item.index === this.highlightedIndex
      );

      const previousPosition =
        currentPosition <= 0
          ? available.length - 1
          : currentPosition - 1;

      this.highlightedIndex =
        available[previousPosition].index;

      this.scrollHighlightedIntoView();

    },

    scrollHighlightedIntoView() {

      this.$nextTick(() => {

        const highlighted =
          this.$el.querySelector(".option-item.highlighted");

        highlighted?.scrollIntoView({
          block: "nearest"
        });

      });

    },

    // Select Highlighted Record
   selectHighlighted() {
  const record = this.visibleOptions[this.highlightedIndex];

  if (record && !this.isOptionDisabled(record)) {
    this.selectRecord(record);
  }
},

    // UNIVERSAL FIELD FORMATTING
    formatFieldValue(value, field = {}) {

      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return field.fallback ?? "";
      }

      if (field.format === "date") {

        const date = new Date(value);

        return Number.isNaN(date.getTime())
          ? String(value)
          : date.toLocaleDateString("en-IN");

      }

      if (field.format === "currency") {

        return new Intl.NumberFormat(
          field.locale || "en-CA",
          {
            style: "currency",
            currency: field.currency || "CAD"
          }
        ).format(Number(value));

      }

      if (field.format === "boolean") {
        return value ? "Yes" : "No";
      }

      if (field.format === "status") {
        return this.getStatusLabel(value);
      }

      if (Array.isArray(value)) {

        return value.map(item => {

          if (
            item !== null &&
            typeof item === "object"
          ) {
            return JSON.stringify(item);
          }

          return String(item);

        }).join(", ");

      }

      if (typeof value === "object") {
        return JSON.stringify(value);
      }

      return String(value);

    },

    // CARD FORMATTING
    formatCardValue(field) {

      return this.formatFieldValue(
        field.value,
        field
      ) || field.fallback || "Not available";

    },

    // VALIDATION
    validate() {
      if (this.required && !this.selectedRecord) {
        this.showError = true;

        this.openList();

        this.$nextTick(() => {
          this.$refs.searchInput?.focus();
        });

        return false;
      }

      this.showError = false;
      return true;
    },

    handleBlur() {

      if (this.blurTimer) {
        clearTimeout(this.blurTimer);
      }

      this.blurTimer = setTimeout(() => {

        if (!this.$el.contains(document.activeElement)) {

          this.isFocused = false;

          if (this.selectedRecord) {

            this.searchText =
              this.getFieldValue(
                this.selectedRecord,
                this.displayKey
              ) ?? "";

          }

          if (this.required && !this.selectedRecord) {
            this.showError = true;
          }

        }

      }, 0);

    },

    matchesDependency(record, dependency) {

      const fieldValue = this.getFieldValue(
        record,
        dependency.parentKey
      );

      const parentValue = dependency.parentValue;

      const operator = dependency.operator || "equals";

      switch (operator) {

        case "equals":

          return Array.isArray(fieldValue)
            ? fieldValue.includes(parentValue)
            : fieldValue === parentValue;

        case "notEquals":

          return Array.isArray(fieldValue)
            ? !fieldValue.includes(parentValue)
            : fieldValue !== parentValue;

        case "includes":

          return Array.isArray(fieldValue)
            ? fieldValue.includes(parentValue)
            : fieldValue === parentValue;

        case "notIncludes":

          return Array.isArray(fieldValue)
            ? !fieldValue.includes(parentValue)
            : fieldValue !== parentValue;

        default:
          return false;
      }

    },

    reset() {
      if (this.blurTimer) {
        clearTimeout(this.blurTimer);
        this.blurTimer = null;
      }

      // Cancel pending API requests.
      this.apiAbortController?.abort();
      this.apiAbortController = null;
      this.apiRequestId += 1;
      this.apiLoading = false;
      this.apiError = false;

      // Reset UI state.
      this.isOpen = false;
      this.isFocused = false;
      this.highlightedIndex = -1;
      this.localVisibleCount = 0;
      this.showError = false;
      this.invalidSelection = false;

      // Restore the initial selection.
      const initialValue = this.initialModelValue;

      this.$emit("update:modelValue", initialValue);

      if (
        initialValue !== null &&
        initialValue !== undefined
      ) {
        this.syncSelectedRecord(initialValue);
      } else {
        this.selectedRecord = null;
        this.searchText = "";
      }

      this.$emit("clear");
      this.$emit("search", "");
    },

    async fetchApiOptions(reset = false) {
      if (!this.apiEnabled || !this.apiUrl) {
        return;
      }

      if (!reset && this.apiLoaded) {
        return;
      }

      // Cancel the previous request.
      this.apiAbortController?.abort();

      const requestId = ++this.apiRequestId;
      const controller = new AbortController();

      this.apiAbortController = controller;

      const searchTerm = this.searchText.trim();

      if (reset) {
        this.apiOptions = [];
        this.apiCurrentPage = 0;
        this.apiTotalPages = 1;
        this.apiNextUrl = null;
        this.apiLoaded = false;
      }

      this.apiLoading = true;
      this.apiError = false;

      try {
        const records = await this.fetchAllApiPages(
          searchTerm,
          controller.signal,
          requestId
        );

        // Ignore an outdated search response.
        if (requestId !== this.apiRequestId) {
          return;
        }

        this.apiOptions = records;
        this.apiLoaded = true;
        this.apiError = false;

      } catch (error) {
        if (
          requestId !== this.apiRequestId ||
          error.name === "AbortError"
        ) {
          return;
        }

        this.apiError = true;
        console.error("Lookup API Error:", error);

      } finally {
        if (requestId === this.apiRequestId) {
          this.apiLoading = false;
          this.apiAbortController = null;
        }
      }
    },

    // Fetch all pages for the current search.
    async fetchAllApiPages(searchTerm, signal, requestId) {
      const allRecords = [];
      const seenIds = new Set();

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        if (requestId !== this.apiRequestId) {
          return [];
        }

        const url = new URL(
          this.apiUrl,
          window.location.origin
        );

        url.searchParams.set("page", page);
        url.searchParams.set("search", searchTerm);

        const response = await fetch(url, { signal });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();

        if (requestId !== this.apiRequestId) {
          return [];
        }

        // Extract records using apiResponseKey when configured.
        let records = this.apiResponseKey
          ? this.getFieldValue(result, this.apiResponseKey)
          : result;

        // Support common response structures.
        if (!Array.isArray(records)) {
          const data = records ?? result;

          if (Array.isArray(data)) {
            records = data;
          } else {
            records =
              data?.results ??
              data?.items ??
              data?.records ??
              data?.courses ??
              data?.data ??
              [];
          }
        }

        if (!Array.isArray(records)) {
          throw new Error(
            "Invalid API response: expected an array of records"
          );
        }

        // Add records without duplicates.
        records.forEach(record => {
          const id = this.getFieldValue(
            record,
            this.valueKey
          );

          if (
            id === undefined ||
            id === null ||
            !seenIds.has(id)
          ) {
            allRecords.push(record);

            if (id !== undefined && id !== null) {
              seenIds.add(id);
            }
          }
        });

        // Read pagination metadata.
        const pagination =
          result.pagination ??
          result.meta ??
          result.pageInfo ??
          result.page_info ??
          records.pagination ??
          {};

        const totalPages = Number(
          pagination.totalPages ??
          pagination.total_pages ??
          pagination.lastPage ??
          pagination.last_page ??
          result.totalPages ??
          result.total_pages ??
          0
        );

        const hasNextPage =
          pagination.hasNextPage ??
          pagination.has_next_page ??
          pagination.hasMore ??
          pagination.has_more ??
          result.hasNextPage ??
          result.has_next_page;

        const responsePageSize = Number(
          pagination.pageSize ??
          pagination.page_size ??
          pagination.per_page ??
          result.pageSize ??
          result.per_page ??
          0
        );

        this.apiCurrentPage = page;

        if (totalPages > 0) {
          this.apiTotalPages = totalPages;
          hasMore = page < totalPages;

        } else if (typeof hasNextPage === "boolean") {
          hasMore = hasNextPage;
          this.apiTotalPages = page + (hasMore ? 1 : 0);

        } else if (responsePageSize > 0) {
          hasMore = records.length === responsePageSize;
          this.apiTotalPages = page + (hasMore ? 1 : 0);

        } else {
          // Without pagination metadata, stop safely.
          hasMore = false;
          this.apiTotalPages = page;
        }

        page++;

        // Prevent an endless pagination loop.
        if (page > 1000) {
          throw new Error("Maximum pagination limit exceeded");
        }
      }

      return allRecords;
    },

    async loadMoreOptions() {

      if (this.apiLoading || this.loadingMore) {
        return;
      }

      // API pagination
      if (this.apiEnabled) {

        if (this.apiCurrentPage >= this.apiTotalPages) {
          return;
        }

        await this.fetchApiOptions();

        return;
      }

      // Local pagination
      if (
        this.pageSize > 0 &&
        this.visibleOptions.length < this.filteredOptions.length
      ) {

        const currentCount =
          this.localVisibleCount || this.pageSize;

        this.localVisibleCount =
          currentCount + this.pageSize;

        return;
      }

      // Notify parent when additional local records
      // need to be fetched externally.
      if (this.hasMore) {
        this.$emit("load-more");
      }

    },

    async retryApiOptions() {
      if (this.apiLoading) {
        return;
      }

      this.apiError = false;

      await this.fetchApiOptions(true);
    },
    // OPEN CREATE FORM
openCreateForm() {

  if (
    !this.apiEnabled ||
    !this.createEnabled ||
    !this.createApiUrl
  ) {
    return;
  }

  // Initialize every configured form field.
  this.createFormData = {};

  this.createFields.forEach(field => {
    this.createFormData[field.key] =
      field.type === "checkbox"
        ? false
        : "";
  });

  this.createFormError = "";
  this.createFocusedField = "";
  this.isCreateOpen = true;
},


// CLOSE CREATE FORM
closeCreateForm() {

  if (this.createFormLoading) {
    return;
  }

  this.isCreateOpen = false;
  this.createFormError = "";
  this.createFocusedField = "";
},


// SUBMIT CREATE FORM

async submitCreateForm() {
  if (
    !this.apiEnabled ||
    !this.createEnabled ||
    !this.createApiUrl ||
    this.createFormLoading
  ) {
    return;
  }

  // Validate required fields.
  const missingField = this.createFields.find(field => {
    if (!field.required) return false;

    const value = this.createFormData[field.key];

    return (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    );
  });

  if (missingField) {
    this.createFormError = `${missingField.label} is required.`;
    return;
  }

  this.createFormLoading = true;
  this.createFormError = "";

  try {
    // Prepare the payload.
    const payload = {};

    this.createFields.forEach(field => {
      payload[field.key] = this.createFormData[field.key];
    });

    // Send POST request.
    const response = await fetch(this.createApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    // Read the response body.
    const responseText = await response.text();

    let result = {};

    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error("The API returned an invalid JSON response.");
    }

    console.log("Create API Response:", result);

    // Handle API errors, including duplicate email.
    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        result.errmsg ||
        `Unable to create record. Status: ${response.status}`
      );
    }

    // Collect possible record locations.
    const candidates = [];
    const visited = new Set();

    const findCreatedRecord = (value, depth = 0) => {
      if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        visited.has(value) ||
        depth > 5
      ) {
        return null;
      }

      visited.add(value);

      const id = this.getFieldValue(value, this.valueKey);

      // A valid created record must contain the configured ID.
      if (id !== undefined && id !== null && id !== "") {
        return value;
      }

      // Search nested response objects.
      for (const key of Object.keys(value)) {
        const found = findCreatedRecord(value[key], depth + 1);

        if (found) {
          return found;
        }
      }

      return null;
    };

    // Check the configured response key first.
    if (this.createResponseKey) {
      candidates.push(
        this.getFieldValue(result, this.createResponseKey)
      );
    }

    // Check common API response properties.
    candidates.push(
      result.data,
      result.user,
      result.record,
      result.person,
      result.createdRecord,
      result
    );

    let createdRecord = null;

    for (const candidate of candidates) {
      createdRecord = findCreatedRecord(candidate);

      if (createdRecord) break;
    }

    if (!createdRecord) {
      console.error(
        "Created record could not be extracted. Actual API response:",
        result
      );

      throw new Error(
        `Created record not found in API response. Expected a record containing "${this.valueKey}". Check the Create API Response in the console.`
      );
    }

    const createdId = this.getFieldValue(
      createdRecord,
      this.valueKey
    );

    // Add or update the created record in API options.
    const existingIndex = this.apiOptions.findIndex(record =>
      String(this.getFieldValue(record, this.valueKey)) ===
      String(createdId)
    );

    if (existingIndex === -1) {
      this.apiOptions = [
        createdRecord,
        ...this.apiOptions
      ];
    } else {
      this.apiOptions.splice(existingIndex, 1, createdRecord);
    }

    // Select the newly created record.
    this.isCreateOpen = false;
    this.selectRecord(createdRecord);

    // Notify parent.
    this.$emit("created", createdRecord);

    this.createFormData = {};
    this.createFormError = "";

  } catch (error) {
    console.error("Create Record API Error:", error);

    this.createFormError =
      error.message || "Unable to create record.";

  } finally {
    this.createFormLoading = false;
  }
}

  }

};
</script>

<style scoped>

.hlx-select {
  position: relative;
  width: 100%;
  max-width: 600px;
  font-family: "Open Sans Variable", sans-serif;

}
.hlx-select,
.hlx-select *:not([class*="icon-"]) {
  font-family: inherit !important;   /* or: 'Inter', system-ui, sans-serif */
}
/* Selection Field */

.selection-field {
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d8d8d8;
  border-radius: 5px;
  background: white;
  transition: border-color 0.2s;
}

.selection-field:not(.field-error):hover {
  border-color: #54bd95;
}
.selection-field.focused {
  border-color: #54bd95;
}

.selection-field.field-error {
  border-color: #dc3545;
}

.selection-field.disabled {
  background: rgb(247,247,247);
  cursor: not-allowed;
}

/* Floating Label */

.floating-label {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  color: #a6a6a6;
  background: white;
  font-size: 14px;
  pointer-events: none;
  opacity: 1;
  transition: all 0.2s ease;
}

.floating-label.floated {
  top: 0;
  left: 9px;
  padding: 0 4px;
  font-size: 12px;
}

/* Focused: label follows the green border */
.selection-field.focused .floating-label.floated {
  color: #54bd95;
}

/* Error: label follows the red border */
.selection-field.field-error .floating-label.floated {
  color: #dc3545;
}

/* Disabled 
.selection-field.disabled .floating-label.floated {
  color: #d8d8d8;
}*/
.selection-field.disabled:hover {
  color: #d8d8d8;
}

/* Hover effect only for normal, enabled inputs */
.selection-field:not(.field-error):not(.readonly):not(.disabled):hover {
  border-color: #54bd95;
}

/* Readonly field hover */
.selection-field.readonly:hover  {
  border-color: #d8d8d8 !important;
}

/* Disabled field should not show hover effect */
.selection-field.disabled:hover {
  border-color: #d8d8d8;
  cursor: not-allowed;
}
.required {
  color: #dc3545;
}
/* Input */
.selection-field input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height:36px;
  border: none;
  background:rgb(255,255,255);
  outline: none;
  padding: 10px 0;
  font-size: 14px;
  background: transparent;
}
.selection-field input::placeholder {
  color: #a6a6a6;
}
/* Icons */
/* Icons */
.field-icon {
  font-size: 18px;
  line-height: 1;
  margin-right: 8px;
  flex-shrink: 0;
  color: #A6A6A6;
}

.action-icon {
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  color: rgb(86, 85, 83);
  margin-left: 6px;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
  font-size: 14px;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  width: 18px;
  min-width: 18px;
  flex-shrink: 0;
  margin-top: 3px;
}
/* Options Container */
.options-container {
  position: fixed;
  top: 0;
  left: 0;
  right: auto;
  z-index: 100;

  width: 100%;
  max-height: 220px;
  overflow-y: auto;
  box-sizing: border-box;

  background: white;
  border-radius: 5px;

  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.4);
}

/* Option */
.option-item {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px;
  cursor: pointer;
}
.option-item:last-child {
  border-bottom: none;
}
.option-item:hover,
.option-item.highlighted {
  background: #a8dec9;
}
.option-item.selected:hover {
  background: #a8dec9 !important;
}
.option-item.selected {
  background: #54bd95;
  color: white;
}
.option-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
.option-content {
  flex: 1;
  min-width: 0;
}

.option-icon{
  font-size: 30px;
}

.option-title {
  font-size: 14px;
  color: black;
  overflow-wrap: anywhere;
}

.option-subtitle {
  margin-top: 4px;
  color: #8d8d8d;
  font-size: 10px;
}

.secondary-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}



.option-item.selected .option-title,
.option-item.selected .option-subtitle{
  color: white;
}

.option-item:hover .option-title {
  color: black;
}

.option-item:hover .option-subtitle {
  color: #8d8d8d;
}
.option-icon:hover .option-icon{
  color:black !important;
}

/* Status */

.option-status,
.status-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
}

.status-dot {
  width: 6px;
  height: 6px;
  display: inline-block;
  border-radius: 50%;
  background: var(--status-dot-color, #999999);
  flex-shrink: 0;
}

.secondary-item .status-dot {
  width: 6px;
  height: 6px;
}

/* Loading and Empty */

.empty-message,
.loading-message {
  padding: 15px;
  text-align: center;
  color: #888;
  font-size: 12px;
}

.loading-message {
  color: #3478db;
}

/* Validation */

.error-message {
  margin-top: 5px;
  font-size: 11px;
  color: #dc3545;
}

/* Details Card */

.details-card {
  margin-top: 10px;
  border-radius: 6px;
  background: #d4d4d444;
  overflow: hidden;
  padding: 10px;
}

.card-body {
  display: grid;
  gap: 20px;
  padding: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.detail-item label {
  color: #4d4d4d;
  font-size: 12px;
  font-weight: 400;
}

.detail-value,
.status-value {
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 400;
  color: #222;
}

.empty-card {
  padding: 18px;
  color: #888;
  text-align: center;
}

/* Card Loading and Error */

.card-message,
.card-error {
  padding: 20px;
  text-align: center;
  font-size: 13px;
}

.card-message {
  color: #3478db;
}

.card-error {
  color: #dc3545;
}

.retry-button {
  margin-top: 8px;
  padding: 7px 16px;
  border: 1px solid #54bd95;
  border-radius: 4px;
  background: white;
  color: #21865f;
  cursor: pointer;
}

.retry-button:hover {
  background: #eaf7f1;
}

/* Options Loading and Error */

.options-loading-state {
  min-height: 75px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #858585;
  font-size: 12px;
}

.options-error-state {
  min-height: 145px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 15px;
}

.options-error-state h3 {
  margin: 8px 0 0;
  color: #ff4d4f;
  font-size: 13px;
  font-weight: 400;
}

.options-error-state p {
  margin: 6px 0 8px;
  color: #858585;
  font-size: 12px;
}

.options-inline-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  color: #dc3545;
  font-size: 11px;
}

.non-search-dropdown input {
  cursor: pointer;
  caret-color: transparent;
}

.non-search-dropdown {
  cursor: pointer;
}
.option-disabled-reason {
  margin-top: 4px;
  font-size: 11px;
  color: #777;
}
.api-error-message {
  padding: 15px;
  text-align: center;
  color: #dc3545;
  font-size: 12px;
}

.api-error-message p {
  margin: 0 0 10px;
}


/* Details Card Loading State */

.card-loading-state {
  min-height: 290px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  align-items: center;
  justify-content: center;
}

.card-loading-text {
  color: #858585;
  font-size: 12px;
}

.loading-dots {
  width: 49px;
  height: 26px;
  border: 1px solid #C8C8C8;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #B2B2B2;
  animation: loadingPulse 1s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
  background: #65BD95;
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loadingPulse {
  0%, 80%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }

  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Details Card Error State */

.card-error-state {
  min-height: 290px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.error-icon {
  font-size: 27px;
  line-height: 1;
  color: #FF5050;
  margin-bottom: 16px;
}
.card-error-state .error-icon {
  font-size: 40px;
}

.card-error-state h3 {
  margin: 0;
  color: #ff4d4f;
  font-size: 14px;
  font-weight: 400;
}

.card-error-state p {
  margin: 10px 0 18px;
  color: #858585;
  font-size: 14px;
}

.card-retry-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: #54bd95;
  font-size: 14px;
  cursor: pointer;
}
.option-status,
.detail-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  min-width: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-text {
  font-size: inherit;
}
/* Add Record Button */

.add-record-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 12px;
  padding: 9px;
  border: 1px solid #54bd95;
  border-radius: 5px;
  background: white;
  color: #21865f;
  font-size: 13px;
  cursor: pointer;
}

.add-record-button:hover {
  background: #eaf7f1;
}

.add-record-icon {
  font-size: 20px;
  line-height: 14px;
}


/* Create Overlay */

.create-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.35);
}

.create-modal {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.create-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

.create-modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 17px;
  font-weight: 500;
}

.create-close-button {
  border: none;
  background: transparent;
  color: #777;
  font-size: 25px;
  cursor: pointer;
}

.create-form-fields {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.create-field {
  position: relative;
  min-height: 42px;
  border: 1px solid #d8d8d8;
  border-radius: 5px;
  background: white;
  transition: border-color 0.2s;
}

.create-field:hover,
.create-field.create-field-focused {
  border-color: #54bd95;
}

.create-field input,
.create-field select,
.create-field textarea {
  width: 100%;
  min-height: 42px;
  padding: 12px 10px 8px;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  font-family: inherit;
  font-size: 13px;
  box-sizing: border-box;
}

.create-field textarea {
  resize: vertical;
  min-height: 75px;
}

.create-floating-label {
  position: absolute;
  top: 50%;
  left: 10px;
  z-index: 1;
  transform: translateY(-50%);
  padding: 0;
  background: white;
  color: #a6a6a6;
  font-size: 13px;
  pointer-events: none;
  transition: all 0.2s ease;
}

.create-floating-label.floated {
  top: 0;
  left: 8px;
  padding: 0 4px;
  font-size: 11px;
}

.create-label-focused {
  color: #54bd95;
}

.create-form-error {
  margin-top: 15px;
  color: #dc3545;
  font-size: 12px;
}

.create-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.create-cancel-button,
.create-submit-button {
  min-width: 85px;
  padding: 9px 16px;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
}

.create-cancel-button {
  border: 1px solid #d8d8d8;
  background: white;
  color: #555;
}

.create-submit-button {
  border: 1px solid #54bd95;
  background: #54bd95;
  color: white;
}

.create-submit-button:disabled,
.create-cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-icon {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease;
}

.selection-field:hover .clear-icon {
  opacity: 1;
  visibility: visible;
}
/* Responsive */

@media (max-width: 600px) {
  .card-body {
    grid-template-columns: 1fr !important;
  }
}

</style>