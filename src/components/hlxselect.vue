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
      <img
        v-if="
          showSearchIcon &&
          (
            selectionType === 'lookup' ||
            (selectionType === 'dropdown' && searchEnabled)
          )
        "
        :src="searchIcon"
        class="field-icon"
        alt="Search"
      />

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
        @keydown.down.prevent="moveDown"
        @keydown.up.prevent="moveUp"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.esc="closeList"
      />

      <!-- Clear Icon -->
      <img
      v-if="
        selectedRecord &&
        clearable &&
        !isDisabled &&
        !readonly &&
        !(selectionType === 'dropdown' && !searchEnabled)
      "        :src="closeIcon"
              class="action-icon"
              alt="Clear"
              @click.stop="clearSelection"
            />

      <!-- Dropdown Icon -->
      <img
        v-if="selectionType === 'dropdown'"
        :src="dropdownIcon"
        :class="{rotated: isOpen}"
        class="action-icon dropdown-arrow"
        alt="Dropdown"
        @click.stop="toggleList"
      />

    </div>

    <!-- Validation -->
    <div v-if="isInvalid" class="error-message">
      {{ validationMessage }}
    </div>

    <!-- Options -->
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
  <!-- Warning Icon -->
  <svg
    width="27"
    height="26"
    viewBox="0 0 27 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.7942 25.6253H5.06542C4.19146 25.6265 3.33211 25.4012 2.57112 24.9714C1.81013 24.5417 1.17346 23.9221 0.72316 23.173C0.272863 22.424 0.0242987 21.5711 0.00169289 20.6974C-0.0209129 19.8238 0.183211 18.9591 0.59417 18.1878L8.85292 2.74033C9.29641 1.91227 9.95627 1.22005 10.7622 0.737464C11.5681 0.254876 12.4898 0 13.4292 0C14.3685 0 15.2903 0.254876 16.0962 0.737464C16.9021 1.22005 17.5619 1.91227 18.0054 2.74033L26.2642 18.1878C26.6761 18.9591 26.881 19.8239 26.8589 20.698C26.8368 21.5721 26.5885 22.4255 26.1382 23.175C25.6879 23.9244 25.051 24.5444 24.2897 24.9743C23.5283 25.4042 22.6685 25.6294 21.7942 25.6278V25.6253ZM13.4292 1.87533C12.828 1.86982 12.237 2.03028 11.7211 2.33904C11.2053 2.6478 10.7846 3.09289 10.5054 3.62533L2.24792 19.0691C1.98865 19.5547 1.85981 20.0993 1.87396 20.6497C1.88812 21.2 2.0448 21.7373 2.32869 22.209C2.61258 22.6807 3.01398 23.0706 3.49366 23.3408C3.97334 23.611 4.51489 23.7521 5.06542 23.7503H21.7942C22.3446 23.7518 22.886 23.6106 23.3655 23.3403C23.845 23.0701 24.2462 22.6801 24.53 22.2084C24.8137 21.7368 24.9703 21.1996 24.9844 20.6494C24.9985 20.0991 24.8696 19.5546 24.6104 19.0691L16.3529 3.62408C16.0736 3.09187 15.6528 2.64704 15.137 2.3385C14.6212 2.02997 14.0302 1.8697 13.4292 1.87533ZM14.3667 14.6878V9.68783C14.3667 9.43919 14.2679 9.20073 14.0921 9.02492C13.9163 8.8491 13.6778 8.75033 13.4292 8.75033C13.1805 8.75033 12.9421 8.8491 12.7663 9.02492C12.5904 9.20073 12.4917 9.43919 12.4917 9.68783V14.6878C12.4917 14.9365 12.5904 15.1749 12.7663 15.3507C12.9421 15.5266 13.1805 15.6253 13.4292 15.6253C13.6778 15.6253 13.9163 15.5266 14.0921 15.3507C14.2679 15.5266 14.3667 15.7649 14.3667 15.5133V14.6878ZM14.7042 18.4378C14.7042 18.1063 14.5725 17.7884 14.3381 17.5539C14.1036 17.3195 13.7857 17.1878 13.4542 17.1878H13.4417C13.195 17.1903 12.9546 17.2657 12.7506 17.4045C12.5467 17.5434 12.3885 17.7395 12.2958 17.9681C12.2031 18.1967 12.1801 18.4476 12.2297 18.6893C12.2794 18.9309 12.3994 19.1525 12.5747 19.326C12.75 19.4996 12.9727 19.6174 13.2149 19.6646C13.457 19.7119 13.7077 19.6864 13.9354 19.5914C14.163 19.4965 14.3575 19.3363 14.4943 19.131C14.6311 18.9257 14.7042 18.6845 14.7042 18.4378Z"
      fill="#FF5050"
    />
  </svg>

  <h3>Unable to load records</h3>

  <p>Please try again.</p>

  <button
    type="button"
    class="card-retry-button"
    @mousedown.prevent
    @click="retryApiOptions"
  >
    <!-- Retry Icon -->
    <svg
      width="16"
      height="16"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.9573 7.22054C12.8087 8.56036 12.2469 9.82075 11.3498 10.8269C10.4527 11.8331 9.26477 12.5353 7.95071 12.836C6.63665 13.1368 5.26157 13.0212 4.01613 12.5054C2.77068 11.9896 1.71659 11.099 1 9.95721V11.8332C1 11.9658 0.947322 12.093 0.853553 12.1868C0.759785 12.2805 0.632608 12.3332 0.5 12.3332C0.367392 12.3332 0.240215 12.2805 0.146447 12.1868C0.0526784 12.093 0 11.9656 0 11.8332V8.49988C0 8.36727 0.0526784 8.24009 0.146447 8.14632C0.240215 8.05256 0.367392 7.99988 0.5 7.99988H3.83333C3.96594 7.99988 4.09312 8.05256 4.18689 8.14632C4.28065 8.24009 4.33333 8.36727 4.33333 8.49988C4.33333 8.63249 4.28065 8.75966 4.18689 8.85343C4.09312 8.9472 3.96594 8.99988 3.83333 8.99988H1.61333C2.14851 10.0546 3.01001 10.9084 4.06959 11.434C5.12917 11.9596 6.33016 12.1289 7.49375 11.9168C8.65735 11.7047 9.72134 11.1224 10.5273 10.2568C11.3333 9.39112 11.8383 8.28831 11.9667 7.11254C11.9727 7.04643 11.9918 6.98217 12.023 6.92353C12.0541 6.86489 12.0966 6.81303 12.1479 6.77099C12.1993 6.72894 12.2586 6.69755 12.3222 6.67864C12.3858 6.65973 12.4526 6.65369 12.5186 6.66086C12.5846 6.66803 12.6485 6.68827 12.7066 6.72041C12.7647 6.75254 12.8158 6.79593 12.857 6.84803C12.8981 6.90012 12.9285 6.9599 12.9463 7.02385C12.9641 7.08781 12.969 7.15468 12.9607 7.22054H12.9573ZM12.5 0.666544C12.3674 0.666544 12.2402 0.719222 12.1464 0.81299C12.0527 0.906758 12 1.03394 12 1.16654V3.04254C11.2834 1.90074 10.2293 1.01019 8.98387 0.494354C7.73843 -0.0214799 6.36335 -0.137033 5.04929 0.163715C3.73523 0.464464 2.54729 1.16661 1.6502 2.17281C0.753099 3.179 0.191291 4.43939 0.0426666 5.77921C0.0355407 5.84453 0.0413584 5.91061 0.0597865 5.97367C0.0782147 6.03674 0.108892 6.09556 0.150066 6.14676C0.191239 6.19796 0.2421 6.24055 0.299742 6.27209C0.357384 6.30362 0.420676 6.32348 0.486 6.33054C0.504208 6.33156 0.522459 6.33054 0.540667 6.33054C0.66374 6.33028 0.782391 6.28463 0.873908 6.20234C0.965424 6.12005 1.02338 6.0069 1.03667 5.88454C1.16674 4.71007 1.67228 3.60892 2.47816 2.74471C3.28404 1.88051 4.34725 1.29938 5.50978 1.08769C6.67232 0.875999 7.87213 1.04505 8.93091 1.56971H9.16667C9.03406 3.99988 8.66667 3.99988 8.66667 4.49988C8.66667 4.63248 8.90688 4.05256 8.81311 4.14632C8.71935 4.24009 12.8536 0.81299 12.8536 0.81299L13 4.49988V1.16654C13 1.03394 12.9473 0.906758 12.8536 0.81299C12.7598 0.719222 12.6326 0.666544 12.5 0.666544Z"
        fill="#54BD95"
      />
    </svg>

    <span>{{ retryText }}</span>
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
          <img
            v-if="showOptionIcon"
            :src="userIcon"
            class="option-icon"
            alt=""
          />

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

                <!-- Status Dot -->
                <span
                  v-if="isStatusField(key)"
                  class="status-dot"
                  :style="getStatusStyle(
                    getFieldValue(record, key)
                  )"
                ></span>

                {{ hasFieldValue(record,key)?getFieldValue(record, key)
                :secondaryFallback }}&nbsp;

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

        <!-- Load More Error: retain already loaded records and allow retry. -->
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

  <!-- Warning Icon -->
  <svg
  width="40"
  height="40"
  viewBox="0 0 27 26"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M21.7942 25.6253H5.06542C4.19146 25.6265 3.33211 25.4012 2.57112 24.9714C1.81013 24.5417 1.17346 23.9221 0.72316 23.173C0.272863 22.424 0.0242987 21.5711 0.00169289 20.6974C-0.0209129 19.8238 0.183211 18.9591 0.59417 18.1878L8.85292 2.74033C9.29641 1.91227 9.95627 1.22005 10.7622 0.737464C11.5681 0.254876 12.4898 0 13.4292 0C14.3685 0 15.2903 0.254876 16.0962 0.737464C16.9021 1.22005 17.5619 1.91227 18.0054 2.74033L26.2642 18.1878C26.6761 18.9591 26.881 19.8239 26.8589 20.698C26.8368 21.5721 26.5885 22.4255 26.1382 23.175C25.6879 23.9244 25.051 24.5444 24.2897 24.9743C23.5283 25.4042 22.6685 25.6294 21.7942 25.6278V25.6253ZM13.4292 1.87533C12.828 1.86982 12.237 2.03028 11.7211 2.33904C11.2053 2.6478 10.7846 3.09289 10.5054 3.62533L2.24792 19.0691C1.98865 19.5547 1.85981 20.0993 1.87396 20.6497C1.88812 21.2 2.0448 21.7373 2.32869 22.209C2.61258 22.6807 3.01398 23.0706 3.49366 23.3408C3.97334 23.611 4.51489 23.7521 5.06542 23.7503H21.7942C22.3446 23.7518 22.886 23.6106 23.3655 23.3403C23.845 23.0701 24.2462 22.6801 24.53 22.2084C24.8137 21.7368 24.9703 21.1996 24.9844 20.6494C24.9985 20.0991 24.8696 19.5546 24.6104 19.0691L16.3529 3.62408C16.0736 3.09187 15.6528 2.64704 15.137 2.3385C14.6212 2.02997 14.0302 1.8697 13.4292 1.87533ZM14.3667 14.6878V9.68783C14.3667 9.43919 14.2679 9.20073 14.0921 9.02492C13.9163 8.8491 13.6778 8.75033 13.4292 8.75033C13.1805 8.75033 12.9421 8.8491 12.7663 9.02492C12.5904 9.20073 12.4917 9.43919 12.4917 9.68783V14.6878C12.4917 14.9365 12.5904 15.1749 12.7663 15.3507C12.9421 15.5266 13.1805 15.6253 13.4292 15.6253C13.6778 15.6253 13.9163 15.5266 14.0921 15.3507C14.2679 15.1749 14.3667 14.9365 14.3667 14.6878ZM14.7042 18.4378C14.7042 18.1063 14.5725 17.7884 14.3381 17.5539C14.1036 17.3195 13.7857 17.1878 13.4542 17.1878H13.4417C13.195 17.1903 12.9546 17.2657 12.7506 17.4045C12.5467 17.5434 12.3885 17.7395 12.2958 17.9681C12.2031 18.1967 12.1801 18.4476 12.2297 18.6893C12.2794 18.9309 12.3994 19.1525 12.5747 19.326C12.75 19.4996 12.9727 19.6174 13.2149 19.6646C13.457 19.7119 13.7077 19.6864 13.9354 19.5914C14.163 19.4965 14.3575 19.3363 14.4943 19.131C14.6311 18.9257 14.7042 18.6845 14.7042 18.4378Z"
    fill="#FF5050"
  />
</svg>

  <h3>Unable to load data</h3>

  <p>{{ cardErrorMessage }}</p>

  <button
    type="button"
    class="card-retry-button"
    @click="$emit('retry', selectedRecord)"
  >
    <svg
  width="16"
  height="16"
  viewBox="0 0 13 13"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M12.9573 7.22054C12.8087 8.56036 12.2469 9.82075 11.3498 10.8269C10.4527 11.8331 9.26477 12.5353 7.95071 12.836C6.63665 13.1368 5.26157 13.0212 4.01613 12.5054C2.77068 11.9896 1.71659 11.099 1 9.95721V11.8332C1 11.9658 0.947322 12.093 0.853553 12.1868C0.759785 12.2805 0.632608 12.3332 0.5 12.3332C0.367392 12.3332 0.240215 12.2805 0.146447 12.1868C0.0526784 12.093 0 11.9658 0 11.8332V8.49988C0 8.36727 0.0526784 8.24009 0.146447 8.14632C0.240215 8.05256 0.367392 7.99988 0.5 7.99988H3.83333C3.96594 7.99988 4.09312 8.05256 4.18689 8.14632C4.28065 8.24009 4.33333 8.36727 4.33333 8.49988C4.33333 8.63249 4.28065 8.75966 4.18689 8.85343C4.09312 8.9472 3.96594 8.99988 3.83333 8.99988H1.61333C2.14851 10.0546 3.01001 10.9084 4.06959 11.434C5.12917 11.9596 6.33016 12.1289 7.49375 11.9168C8.65735 11.7047 9.72134 11.1224 10.5273 10.2568C11.3333 9.39112 11.8381 8.28831 11.9667 7.11254C11.9727 7.04643 11.9918 6.98217 12.023 6.92353C12.0541 6.86489 12.0966 6.81303 12.1479 6.77099C12.1993 6.72894 12.2586 6.69755 12.3222 6.67864C12.3858 6.65973 12.4526 6.65369 12.5186 6.66086C12.5846 6.66803 12.6485 6.68827 12.7066 6.72041C12.7647 6.75254 12.8158 6.79593 12.857 6.84803C12.8981 6.90012 12.9285 6.9599 12.9463 7.02385C12.9641 7.08781 12.969 7.15468 12.9607 7.22054H12.9573ZM12.5 0.666544C12.3674 0.666544 12.2402 0.719222 12.1464 0.81299C12.0527 0.906758 12 1.03394 12 1.16654V3.04254C11.2834 1.90074 10.2293 1.01019 8.98387 0.494354C7.73843 -0.0214799 6.36335 -0.137033 5.04929 0.163715C3.73523 0.464464 2.54729 1.16661 1.6502 2.17281C0.753099 3.179 0.191291 4.43939 0.0426666 5.77921C0.0355407 5.84453 0.0413582 5.91061 0.0597865 5.97367C0.0782147 6.03674 0.108892 6.09556 0.150066 6.14676C0.191239 6.19796 0.2421 6.24055 0.299742 6.27209C0.357384 6.30362 0.420676 6.32348 0.486 6.33054C0.504208 6.33156 0.522459 6.33156 0.540667 6.33054C0.66374 6.33028 0.782391 6.28463 0.873908 6.20234C0.965424 6.12005 1.02338 6.0069 1.03667 5.88454C1.16674 4.71007 1.67228 3.60892 2.47816 2.74471C3.28404 1.88051 4.34725 1.29938 5.50978 1.08769C6.67232 0.875999 7.87213 1.04505 8.93091 1.56971C9.9897 2.09437 10.8509 2.94665 11.3867 3.99988H9.16667C9.03406 3.99988 8.90688 4.05256 8.81311 4.14632C8.71935 4.24009 8.66667 4.36727 8.66667 4.49988C8.66667 4.63248 8.71935 4.75966 8.81311 4.85343C8.90688 4.9472 9.03406 4.99988 9.16667 4.99988H12.5C12.6326 4.99988 12.7598 4.9472 12.8536 4.85343C12.9473 4.75966 13 4.63248 13 4.49988V1.16654C13 1.03394 12.9473 0.906758 12.8536 0.81299C12.7598 0.719222 12.6326 0.666544 12.5 0.666544Z"
    fill="#54BD95"
  />
</svg>

    <span>{{ retryText }}</span>
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
              class="status-dot"
              :style="getStatusStyle(
                field.value,
                field.statusColors
              )"
            ></span>

            {{ formatCardValue(field) }}

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

  </div>
</template>


<script>
import searchIcon from "../assets/search.svg";
import dropdownIcon from "../assets/dropdown.svg";
import closeIcon from "../assets/close.svg";
import userIcon from "../assets/user.svg";

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

    // Icons
    showSearchIcon: {
      type: Boolean,
      default: true
    },

    showOptionIcon: {
      type: Boolean,
      default: false
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
dependencies:{
  type:Array,
  default:()=>[]
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
    secondaryFallback:{
      type:String,
      default:""
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

    // Status Colors
    statusColors: {
      type: Object,
      default: () => ({
        Active: "#2caf72",
        Inactive: "#dc3545",
        Pending: "#f0a43a"
      })
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
    "load-more"
  ],

  data() {
    return {
      searchIcon,
      dropdownIcon,
      closeIcon,
      userIcon,

      isOpen: false,
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
invalidSelection: false
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
    },// Check Whether Parent Selection Is Missing

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

    visibleCardFields() {
  if (!this.selectedRecord) {
    return [];
  }

  return this.cardFields
    .filter(field => field.visible !== false)
    .map(field => {
      const actualValue = this.getFieldValue(
        this.selectedRecord,
        field.key
      );

      const hasActualValue =
        actualValue !== null &&
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
            ? field.fallback
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
      return this.error || this.showError || this.invalidSelection;
    },

    validationMessage() {
      if(this.invalidSelection){
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
          this.invalidSelection=false;
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
  },

  beforeUnmount() {

    document.removeEventListener(
      "pointerdown",
      this.handleOutsideClick
    );

    if (this.blurTimer) {
      clearTimeout(this.blurTimer);
    }

  },
  
  methods: {

    //nested property
    
getFieldValue(record, path) {
  if (!record || !path) {
    return undefined;
  }

  return String(path).split(".").reduce((current, key) => {
    if (current === null || current === undefined) {
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

    // ---------------------------------
    // INPUT FOCUS
    // ---------------------------------

    handleFocus() {

      if (this.isDisabled || this.readonly) {
        return;
      }

      this.isFocused = true;

      if (!this.isOpen) {
        this.openList();
      }

    },

    // ---------------------------------
    // SEARCH
    // ---------------------------------

    

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

    // ---------------------------------
    // SECONDARY FIELDS
    // ---------------------------------

    visibleSecondaryFields(record) {

      return this.secondaryFields.filter(key => {

        return (this.hasFieldValue(record, key) ||
        this.secondaryFallback !=="");

      });

    },

    // ---------------------------------
    // STATUS FIELD
    // ---------------------------------

    isStatusField(key) {

      return (
        String(key).toLowerCase() === "status"
      );

    },

    getStatusStyle(value, customColors = null) {

      const colors = {
        ...this.statusColors,
        ...(customColors || {})
      };

      const matchedKey = Object.keys(colors).find(
        key => key.toLowerCase() === String(value).toLowerCase()
      );

      return {
        "--status-dot-color":
          matchedKey ? colors[matchedKey] : "#999999"
      };

    },

    // ---------------------------------
    // SELECT RECORD
    // ---------------------------------

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
      this.invalidSelection=false;
      this.$emit("search", "");

    },

    // ---------------------------------
    // CLEAR SELECTION
    // ---------------------------------

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
    this.validateSelection();
  }
},

    // ---------------------------------
    // CLOSE OPTIONS
    // ---------------------------------

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

    // ---------------------------------
    // OUTSIDE CLICK
    // ---------------------------------

    handleOutsideClick(event) {
  if (!this.$el.contains(event.target)) {
    // No committed selection yet:
    // Keep the options open.
    if (!this.selectedRecord) {
      return;
    }

    // A committed selection exists:
    // Close the options and restore its display value.
    this.isOpen = false;
    this.highlightedIndex = -1;
    this.isFocused = false;

    this.searchText =
      this.getFieldValue(
        this.selectedRecord,
        this.displayKey
      ) ?? "";
  }
},

    // ---------------------------------
    // DISABLED OPTION
    // ---------------------------------

    isOptionDisabled(record) {

      if (!this.disabledKey) {
        return false;
      }

      return Boolean(
        this.getFieldValue(record, this.disabledKey)
      );

    },

    // ---------------------------------
    // KEYBOARD NAVIGATION
    // ---------------------------------

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

      const record =
        this.filteredOptions[this.highlightedIndex];

      if (record && !this.isOptionDisabled(record)) {
        this.selectRecord(record);
      }

    },

    // ---------------------------------
    // UNIVERSAL FIELD FORMATTING
    // ---------------------------------

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
        return String(value);
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

    // ---------------------------------
    // CARD FORMATTING
    // ---------------------------------

    formatCardValue(field) {

      return this.formatFieldValue(
        field.value,
        field
      ) || field.fallback || "Not available";

    },

    // ---------------------------------
    // VALIDATION
    // ---------------------------------

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
}


  }

};
</script>

<style scoped>

.hlx-select {
  position: relative;
  width: 100%;
  max-width: 600px;
  font-family: "Open Sans Variable";
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

.selection-field:hover {
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

/* Disabled */
.selection-field.disabled .floating-label.floated {
  color: #d8d8d8;
}
.selection-field.disabled:hover {
  color: #d8d8d8;
}

/* Hover effect only for normal, enabled inputs */
.selection-field:not(.readonly):not(.disabled):hover {
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
.field-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
  color:#A6A6A6;
}
.action-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
  color:rgb(86,85,83);
  margin-left: 6px;
}
.dropdown-arrow {
  transition: transform 0.2s ease;
}
.dropdown-arrow.rotated {
  transform: rotate(180deg);
}
/* Options Container */
.options-container {
  position: absolute;
  top: 45px;
  left: 0;
  right: 0;
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
  background: white;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  box-shadow: 0px 8px 25px -4px rgba(0, 0, 0, 0.4);
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

.option-icon {
  width: 17px;
  height: 17px;
  object-fit: contain;
  flex-shrink: 0;
}

.option-title {
  font-size: 14px;
  color: black;
  overflow-wrap: anywhere;
}

.option-subtitle {
  margin-top: 4px;
  color: #777;
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
  color: #777;
}

/* Status */

.option-status,
.status-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 400;
}

.status-dot {
  width: 7px;
  height: 7px;
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
  padding: 20px;
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
  margin-bottom: 16px;
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
  gap: 12px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: #54bd95;
  font-size: 14px;
  cursor: pointer;
}

/* Responsive */

@media (max-width: 600px) {
  .card-body {
    grid-template-columns: 1fr !important;
  }
}

</style>
