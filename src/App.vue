
<template>
  <div class="page">

    <section class="component-section">
      <h3>1. Lookup: single secondary field, sorting, validation</h3>

      <HlxSelect
        ref="customerLookup"
        v-model="lookupCustomerId"
        selection-type="lookup"
        label="Customer Lookup"
        :options="customers"
        value-key="id"
        display-key="name"
        :secondary-key="['email', 'city', 'status']"
        :search-keys="[]"
        sort-key="name"
        sort-direction="asc"
        field-icon="search"
        :option-icon="building"
        :status-options="statusOptions"
        status-key="status"
        :required="true"
        :page-size="lookupPageSize"
        :show-card="true"
        :card-fields="customerCardFields"
        :card-columns="3"
        @select="log('Lookup selected', $event)"
      />

      <button @click="submitLookup">Validate Lookup</button>
    </section>

    <section class="component-section">
      <h3>2. Lookup: multiple secondary fields and custom validation</h3>

      <HlxSelect
        v-model="multipleSecondaryId"
        selection-type="lookup"
        label="Customer with Multiple Secondary Fields"
        :options="customers"
        value-key="id"
        display-key="name"
        :secondary-key="['email', 'status', 'id']"
        :search-keys="['id', 'name']"
        option-icon="user"
        :status-options="statusOptions"
        status-key="status"
        :show-card="true"
        :card-fields="customerCardFields"
        :card-columns="2"
        :custom-error="customError"
        required
        @select="handleSelect"
              />
    </section>

    <section class="component-section">
      <h3>3. Remote Customer Lookup</h3>

      <HlxSelect
        v-model="remoteLookupId"
        selection-type="lookup"
        label="Remote Customer Lookup"
        :options="remoteLookupOptions"
        value-key="id"
        display-key="name"
        secondary-key="email"
        :search-keys="['name', 'email', 'city']"
        :loading="remoteLookupLoading"
        loading-text="Searching remote records..."
        :show-card="true"
        :card-fields="customerCardFields"
        :card-columns="2"
        :status-options="statusOptions"
        status-key="status"
        @search="searchRemoteLookup"
        @select="log('Remote lookup selected', $event)"
      />
    </section>

    <section class="component-section">
      <h3>4. Searchable dropdown: local array</h3>

      <HlxSelect
        v-model="searchableDropdownId"
        selection-type="dropdown"
        label="Search Local Customers"
        :search-enabled="true"
        :options="customers"
        value-key="id"
        display-key="name"
        secondary-key="email"
        :search-keys="['name']"
        :show-card="true"
        :card-fields="customerCardFields"
        :card-columns="2"
        :status-options="statusOptions"
        status-key="status"
        @select="log('Local searchable dropdown selected', $event)"
      />
    </section>

    <section class="component-section">
      <h3>5. Normal dropdown: local array, search disabled</h3>

      <HlxSelect
        v-model="normalDropdownId"
        selection-type="dropdown"
        label="Choose Customer"
        :search-enabled="false"
        :options="customers"
        value-key="id"
        display-key="name"
        secondary-key="email"
        :show-card="true"
        :card-fields="customerCardFields"
        :card-columns="1"
        :status-options="statusOptions"
        status-key="status"
        @select="log('Normal dropdown selected', $event)"
      />
    </section>

    <section class="component-section">
      <h3>6. Searchable dropdown: externally fetched options</h3>

      <HlxSelect
        v-model="remoteDropdownId"
        selection-type="dropdown"
        label="Remote Customer Dropdown"
        :search-enabled="true"
        :options="remoteDropdownOptions"
        value-key="id"
        display-key="name"
        secondary-key="email"
        :search-keys="['name', 'email', 'city']"
        :loading="remoteDropdownLoading"
        :show-card="true"
        :card-fields="customerCardFields"
        :card-columns="2"
        :status-options="statusOptions"
        status-key="status"
      />
    </section>

    <section class="component-section">
      <h3>7. Lookup: nested object properties</h3>

      <HlxSelect
        v-model="nestedLookupId"
        selection-type="lookup"
        label="Nested Customer Lookup"
        :options="nestedCustomers"
        value-key="customer.id"
        display-key="customer.personal.name"
        :secondary-key="[
          'customer.contact.email',
          'customer.address.city'
        ]"
        :search-keys="[
          'customer.personal.name',
          'customer.contact.email',
          'customer.address.city'
        ]"
        :show-card="true"
        :card-fields="nestedCustomerCardFields"
        :card-columns="2"
        :status-options="statusOptions"
        status-key="customer.status"
        @select="log('Nested customer selected', $event)"
      />
    </section>

    <section class="component-section">
      <h3>8. Lookup: nested array properties</h3>

      <HlxSelect
        v-model="nestedAccountLookupId"
        selection-type="lookup"
        label="Nested Account Lookup"
        :options="nestedCustomers"
        value-key="customer.id"
        display-key="customer.personal.name"
        :secondary-key="[
          'customer.accounts.0.accountName',
          'customer.accounts.0.status'
        ]"
        :search-keys="[
          'customer.personal.name',
          'customer.accounts.0.accountName',
          'customer.accounts.0.status'
        ]"
        :show-card="true"
        :card-fields="nestedAccountCardFields"
        :card-columns="1"
        :status-options="statusOptions"
        status-key="customer.accounts.0.status"
        @select="log('Nested account selected', $event)"
      />
    </section>

    <section class="component-section">
      <h3>9. Dependent lookups: Country → State → City</h3>

      <HlxSelect
        v-model="selectedCountryId"
        selection-type="lookup"
        label="Select Country"
        :options="countries"
        value-key="id"
        display-key="name"
        @select="resetCountryChildren"
      />

      <HlxSelect
        v-model="selectedStateId"
        selection-type="lookup"
        label="Select State"
        :options="states"
        value-key="id"
        display-key="name"
        :dependency="{
          parentValue: selectedCountryId,
          parentKey: 'countryId'
        }"
        @select="resetStateChildren"
      />

      <HlxSelect
        v-model="selectedCityId"
        selection-type="lookup"
        label="Select City"
        :options="cities"
        value-key="id"
        display-key="name"
        :dependency="{
          parentValue: selectedStateId,
          parentKey: 'stateId'
        }"
      />
    </section>

    <section class="component-section">
      <h3>10. Multi-level dependencies: Organization → Department → Employee → Project</h3>

      <HlxSelect
        v-model="selectedOrganizationId"
        selection-type="lookup"
        label="Select Organization"
        :options="organizations"
        value-key="id"
        display-key="name"
        @select="resetOrganizationChildren"
      />

      <HlxSelect
        v-model="selectedDepartmentId"
        selection-type="lookup"
        label="Select Department"
        :options="departments"
        value-key="id"
        display-key="name"
        :dependency="{
          parentValue: selectedOrganizationId,
          parentKey: 'organizationId'
        }"
        @select="resetDepartmentChildren"
      />

      <HlxSelect
        v-model="selectedEmployeeId"
        selection-type="lookup"
        label="Select Employee"
        :options="employees"
        value-key="id"
        display-key="name"
        :dependencies="[
          {
            parentValue: selectedOrganizationId,
            parentKey: 'organizationId',
            operator: 'equals'
          },
          {
            parentValue: selectedDepartmentId,
            parentKey: 'departmentId',
            operator: 'equals'
          }
        ]"
        dependency-operator="AND"
        @select="resetEmployeeChildren"
      />

      <HlxSelect
        v-model="selectedProjectId"
        selection-type="lookup"
        label="Select Project"
        :options="projects"
        value-key="id"
        display-key="name"
        :dependency="{
          parentValue: selectedEmployeeId,
          parentKey: 'employeeId'
        }"
      />
    </section>

    <section class="component-section">
      <h3>11. Multiple dependencies: AND condition with flat fields</h3>

      <p>Both organizationId and departmentId must match.</p>

      <HlxSelect
        v-model="andEmployeeId"
        selection-type="lookup"
        label="Employee — Organization AND Department"
        :options="employees"
        value-key="id"
        display-key="name"
        :dependencies="[
          {
            parentValue: selectedOrganizationId,
            parentKey: 'organizationId'
          },
          {
            parentValue: selectedDepartmentId,
            parentKey: 'departmentId'
          }
        ]"
        @select="log('AND employee selected', $event)"
      />
    </section>

    <section class="component-section">
      <h3>12. Multiple dependencies: AND condition with nested fields</h3>

      <HlxSelect
        v-model="nestedAndEmployeeId"
        selection-type="lookup"
        label="Nested Employee — Organization AND Department"
        :options="nestedEmployees"
        value-key="id"
        display-key="name"
        :dependencies="[
          {
            parentValue: selectedOrganizationId,
            parentKey: 'organization.id'
          },
          {
            parentValue: selectedDepartmentId,
            parentKey: 'department.id'
          }
        ]"
        @select="log('Nested AND employee selected', $event)"
      />
    </section>

    <section class="component-section">
      <h3>13. Field states and disabled options</h3>

      <p>
        The first field is disabled, the second is read-only,
        and the third disables records whose disabled property is true.
      </p>

      <HlxSelect
        v-model="disabledCustomerId"
        selection-type="dropdown"
        label="Disabled Customer Field"
        :options="customers"
        value-key="id"
        display-key="name"
        :disabled="true"
      />

      <HlxSelect
        v-model="readonlyCustomerId"
        selection-type="dropdown"
        label="Read-only Customer Field"
        :options="customers"
        value-key="id"
        display-key="name"
        :readonly="true"
      />

      <HlxSelect
        v-model="disabledOptionCustomerId"
        selection-type="dropdown"
        label="Dropdown with a Disabled Option"
        :options="customers"
        value-key="id"
        display-key="name"
        disabled-key="disabled"
        disabled-reason-key="disabledReason"
        :search-enabled="false"
        @select="log('Enabled option selected', $event)"
        @clear="log('Disabled-option demo cleared', null)"
      />
    </section>

    <section class="component-section">
      <h3>14. Details card: loading, error and retry</h3>

      <HlxSelect
        v-model="cardStateCustomerId"
        selection-type="dropdown"
        label="Customer Details Card State"
        :options="customers"
        value-key="id"
        display-key="name"
        :search-enabled="false"
        :show-card="true"
        :card-fields="customerCardFields"
        :card-columns="2"
        :card-loading="cardDemoLoading"
        :card-error="cardDemoError"
        :status-options="statusOptions"
        status-key="status"
        retry-text="Retry loading"
        @select="loadCardDetails"
        @retry="retryCardDetails"
      />
    </section>

    <section class="component-section">
      <h3>Additional customer details and secondary fallback</h3>

      <HlxSelect
        v-model="selectedCustomerId"
        selection-type="dropdown"
        :options="customersd"
        option-icon="user"
        :show-card="true"
        :card-fields="cardfields"
        :card-columns="1"
        value-key="id"
        display-key="name"
        secondary-fallback="Not available"
        :secondary-key="['id', 'city']"
        :search-enabled="false"
      />

      <p>Selected ID: {{ selectedCustomerId }}</p>
    </section>

    <section class="component-section">
      <h3>15. API-based Course Lookup</h3>

      <HlxSelect
        v-model="selectedCourseId"
        selection-type="lookup"
        label="Search Courses"
        api-url="http://localhost:5000/api/courses"
        :api-enabled="true"
        value-key="_id"
        display-key="title"
        :options="[]"
        :secondary-key="[
          'category',
          'rating',
          'instructor.name'
        ]"
        :search-keys="['title', 'category', 'rating']"
        :show-card="true"
        :card-fields="courseCardFields"
        :card-columns="2"
        api-response-key="courses"
        sort-key="title"
      />

      <p>Selected Course ID: {{ selectedCourseId }}</p>
    </section>

    <section class="component-section">
      <h3>16. Lookup: stale and unavailable selected record testing</h3>

      <HlxSelect
        ref="staleSelectionLookup"
        v-model="staleSelectionCustomerId"
        selection-type="lookup"
        label="Stale Selection Test"
        :options="staleTestCustomers"
        value-key="id"
        display-key="name"
        secondary-key="email"
        :search-keys="['name', 'email', 'city']"
        :required="false"
        :show-card="true"
        :card-fields="customerCardFields"
        :card-columns="2"
        :status-options="statusOptions"
        status-key="status"
        clearable
        @select="log('Stale test selected', $event)"
        @clear="log('Stale test cleared', null)"
      />

      <div class="test-info">
        <p>
          <strong>Selected ID:</strong>
          {{ staleSelectionCustomerId }}
        </p>

        <p>
          <strong>Selected Record:</strong>
          {{ staleSelectedCustomer
            ? staleSelectedCustomer.name
            : "Record unavailable" }}
        </p>

        <p>
          <strong>Available Records:</strong>
          {{ staleTestCustomers.length }}
        </p>
      </div>

      <div class="test-actions">
        <button @click="removeStaleSelectedRecord">
          1. Remove Selected Record
        </button>

        <button @click="restoreStaleTestCustomers">
          2. Restore All Records
        </button>

        <button @click="selectStaleTestCustomer">
          3. Select Another Customer
        </button>

        <button @click="clearStaleTestSelection">
          4. Clear Selection
        </button>

        <button @click="resetStaleTestSelection">
          5. Reset Lookup
        </button>

        <button @click="validateStaleTestSelection">
          6. Validate Selection
        </button>
      </div>

      <p>
        <strong>Last Test:</strong>
        {{ staleTestMessage }}
      </p>
    </section>

    <section class="component-section">
  <h3>17. API-based User Lookup with Dynamic Record Creation</h3>

  <HlxSelect
    v-model="selectedUserId"
    selection-type="lookup"
    label="Search Users"
    api-url="http://localhost:5000/api/users"
    :api-enabled="true"
    api-response-key="users"
    display-key="name"
    value-key="_id"
    :options="[]"
    :search-keys="['name']"
    :show-card="true"

    :card-fields="[
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'isActive', label: 'Active' },
      { key: 'addedDate', label: 'Added Date' }
    ]"

    :create-enabled="true"
    create-api-url="http://localhost:5000/api/users"
    create-response-key="data"
    :create-fields="createUserFields"
    @created="handleUserCreated"
  />
</section>

  </div>
</template>

<script>
import HlxSelect from "./components/hlxselect.vue";
import nestedCustomerData from "./data/nested-customers.json";
import userIcon from "./assets/user.svg";
import buildingIcon from "./assets/buildings_icon.svg";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default {
  name: "App",

  components: {
    HlxSelect
  },

  data() {
    return {
     
    selectedUserId: null,

    createUserFields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
        placeholder: "Enter user name"
      },
      {
        key: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "Enter email address"
      },
      {
        key: "role",
        label: "Role",
        type: "select",
        required: true,
        placeholder: "Select role",
        options: [
          {
            label: "Admin",
            value: "admin"
          },
          {
            label: "student",
            value: "student"
          },
          {
            label: "instructor",
            value: "instructor"
          }
        ]
      },
      {
        key: "isActive",
        label: "Active Status",
        type: "select",
        required: false,
        placeholder: "Select status",
        options: [
          {
            label: "Active",
            value: true
          },
          {
            label: "Inactive",
            value: false
          }
        ]
      },
      {
        key: "addedDate",
        label: "Added Date",
        type: "date",
        required: false
      }
    ],
      user: userIcon,
      building: buildingIcon,

      lookupCustomerId: null,
      multipleSecondaryId: null,
      remoteLookupId: null,
      searchableDropdownId: null,
      normalDropdownId: null,
      remoteDropdownId: null,
      nestedLookupId: null,
      nestedAccountLookupId: null,

      disabledCustomerId: 102,
      readonlyCustomerId: 101,
      disabledOptionCustomerId: null,

      cardStateCustomerId: 103,
      cardDemoLoading: false,
      cardDemoError: true,

      selectedCountryId: null,
      selectedStateId: null,
      selectedCityId: null,

      selectedOrganizationId: null,
      selectedDepartmentId: null,
      selectedEmployeeId: null,
      selectedProjectId: null,
      andEmployeeId: null,
      nestedAndEmployeeId: null,
      selectedUserId: null,
      selectedCourseId: null,
      selectedCustomerId: null,

      staleSelectionCustomerId: 101,
      customError: "Enter a valid data",

      staleTestCustomers: [
        {
          id: 101,
          name: "BAC Technologies",
          email: "bac@example.com",
          city: "Coimbatore",
          status: "Active",
          age: 23,
          amount: 15000
        },
        {
          id: 102,
          name: "ABC Solutions",
          email: "abc@example.com",
          city: "Chennai",
          status: "Active",
          age: 25,
          amount: 20000
        },
        {
          id: 103,
          name: "XYZ Technologies",
          email: "xyz@example.com",
          city: "Madurai",
          status: "Inactive",
          age: 24,
          amount: 18000
        }
      ],

      staleTestMessage: "Initial selection loaded",

      statusOptions: [
        {
          name: "Active",
          value: "Active",
          color: "#16A34A",
          backgroundColor: "#DCFCE7",
          textColor: "#166534"
        },
        {
          name: "Inactive",
          value: "Inactive",
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          textColor: "#991B1B"
        },
        {
          name: "Pending",
          value: "Pending",
          color: "#D97706",
          backgroundColor: "#FEF3C7",
          textColor: "#92400E"
        },
        {
          name: "Draft",
          value: "Draft",
          color: "#2563EB",
          backgroundColor: "#DBEAFE",
          textColor: "#1E40AF"
        }
      ],

      courseCardFields: [
        { key: "title", label: "Course Title" },
        { key: "category", label: "Category" },
        { key: "description", label: "Description" },
        { key: "rating", label: "Rating" },
        { key: "instructor.name", label: "Instructor" },
        { key: "instructor.email", label: "Instructor Email" }
      ],

      customersd: [
        {
          id: 101,
          name: "Technologies and Software Development Private Limited",
          city: "Coimbatore, Tamil Nadu, India - Software Development Division"
        },
        {
          id: 102,
          name: "Vaishu",
          city: "Chennai"
        },
        {
          id: 103,
          name: "Vaishu",
          city: "Coimbatore"
        },
        {
          id: 103,
          name: "Niranj",
          city: "Cbe"
        },
        {
          id: 104,
          name: "jo"
        },
        {
          id: 105,
          name: "Srinivas"
        }
      ],

      customers: [
        {
          id: 101,
          name: "Vaishu",
          email: "vaishu@gmail.com",
          city: "Coimbatore",
          status: "Active",
          age: 23,
          amount: 15000
        },
        {
          id: 102,
          name: "Arun",
          email: "arun@gmail.com",
          city: "Chennai",
          status: "Inactive",
          age: 25,
          amount: 20000,
          disabled: true,
          disabledReason: "Unavailable"
        },
        {
          id: 103,
          name: "Priya",
          email: "priya@gmail.com",
          city: "Madurai",
          status: "Pending",
          age: 24,
          amount: 18000
        },
        {
          id: 104,
          name: "Kavin",
          email: "kavin@gmail.com",
          city: "Salem",
          status: "Active",
          age: 26,
          amount: 25000
        },
        {
          id: 105,
          name: "Divya",
          email: "divya@gmail.com",
          city: "Trichy",
          status: "Active",
          age: 22,
          amount: 12000
        },
        {
          id: 106,
          name: "Harini",
          email: "harini@gmail.com",
          city: "Erode",
          status: "Inactive",
          age: 24,
          amount: 17000
        },
        {
          id: 107,
          name: "Nila",
          email: "nila@gmail.com",
          city: "Tiruppur",
          status: "Pending",
          age: 23,
          amount: 19000
        },
        {
          id: 108,
          name: "Meena",
          email: "meena@gmail.com",
          city: "Salem",
          status: "Active",
          age: 25,
          amount: 22000
        }
      ],

      remoteApiCustomers: [
        {
          id: 501,
          name: "Remote Asha",
          email: "asha@remote.test",
          city: "Coimbatore",
          status: "Active",
          age: 27,
          amount: 31000
        },
        {
          id: 502,
          name: "Remote Bala",
          email: "bala@remote.test",
          city: "Chennai",
          status: "Pending",
          age: 29,
          amount: 28000
        },
        {
          id: 503,
          name: "Remote Charan",
          email: "charan@remote.test",
          city: "Madurai",
          status: "Active",
          age: 31,
          amount: 35000
        },
        {
          id: 504,
          name: "Remote Deepa",
          email: "deepa@remote.test",
          city: "Salem",
          status: "Inactive",
          age: 26,
          amount: 26000
        }
      ],

      remoteLookupOptions: [],
      remoteDropdownOptions: [],

      remoteLookupLoading: false,
      remoteDropdownLoading: false,

      lookupPageSize: 4,
      lookupLoadingMore: false,

      nestedCustomers: nestedCustomerData.customers,

      cardfields: [
        { key: "id", label: "Id" },
        { key: "name", label: "Name" },
        { key: "city", label: "City" }
      ],

      customerCardFields: [
        { key: "name", label: "Customer Name" },
        { key: "email", label: "Email" },
        { key: "city", label: "City" },
        { key: "status", label: "Status", format: "status" },
        { key: "age", label: "Age" },
        {
          key: "amount",
          label: "Amount",
          format: "currency",
          currency: "CAD",
          locale: "en-CA"
        }
      ],

      nestedCustomerCardFields: [
        { key: "customer.personal.name", label: "Customer Name" },
        { key: "customer.personal.age", label: "Age" },
        { key: "customer.contact.email", label: "Email" },
        { key: "customer.contact.phone", label: "Phone" },
        { key: "customer.address.city", label: "City" },
        { key: "customer.address.state", label: "State" }
      ],

      nestedAccountCardFields: [
        { key: "customer.accounts.0.accountId", label: "Account ID" },
        { key: "customer.accounts.0.accountName", label: "Account Name" },
        {
          key: "customer.accounts.0.status",
          label: "Account Status",
          format: "status"
        },
        {
          key: "customer.accounts.0.balance",
          label: "Balance",
          format: "currency",
          currency: "INR",
          locale: "en-IN"
        }
      ],

      countries: [
        { id: 1, name: "India" },
        { id: 2, name: "USA" }
      ],

      states: [
        { id: 101, countryId: 1, name: "Tamil Nadu" },
        { id: 102, countryId: 1, name: "Kerala" },
        { id: 103, countryId: 1, name: "Karnataka" },
        { id: 104, countryId: 2, name: "California" },
        { id: 105, countryId: 2, name: "Texas" }
      ],

      cities: [
        { id: 1001, stateId: 101, name: "Coimbatore" },
        { id: 1002, stateId: 101, name: "Chennai" },
        { id: 1003, stateId: 102, name: "Kochi" },
        { id: 1004, stateId: 102, name: "Kozhikode" },
        { id: 1005, stateId: 103, name: "Bengaluru" },
        { id: 1006, stateId: 104, name: "Los Angeles" },
        { id: 1007, stateId: 105, name: "Houston" }
      ],

      organizations: [
        { id: 1, name: "ABC Technologies" },
        { id: 2, name: "XYZ Solutions" }
      ],

      departments: [
        { id: 101, organizationId: 1, name: "Development" },
        { id: 102, organizationId: 1, name: "Testing" },
        { id: 103, organizationId: 1, name: "HR" },
        { id: 104, organizationId: 2, name: "Finance" },
        { id: 105, organizationId: 2, name: "Marketing" }
      ],

      employees: [
        { id: 201, organizationId: 1, departmentId: 101, name: "Vaishu" },
        { id: 202, organizationId: 1, departmentId: 101, name: "Arun" },
        { id: 203, organizationId: 1, departmentId: 102, name: "Priya" },
        { id: 204, organizationId: 1, departmentId: 103, name: "Kavin" },
        { id: 205, organizationId: 2, departmentId: 104, name: "Divya" },
        { id: 206, organizationId: 2, departmentId: 105, name: "Harini" }
      ],

      projects: [
        { id: 301, employeeId: 201, name: "E-Commerce Application" },
        { id: 302, employeeId: 201, name: "CRM Application" },
        { id: 303, employeeId: 202, name: "Inventory System" },
        { id: 304, employeeId: 203, name: "Testing Automation" },
        { id: 305, employeeId: 204, name: "HR Management System" },
        { id: 306, employeeId: 205, name: "Finance Dashboard" },
        { id: 307, employeeId: 206, name: "Marketing Portal" }
      ],

      nestedEmployees: [
        {
          id: 201,
          name: "Vaishu",
          organization: { id: 1, name: "ABC Technologies" },
          department: { id: 101, name: "Development" }
        },
        {
          id: 202,
          name: "Arun",
          organization: { id: 1, name: "ABC Technologies" },
          department: { id: 101, name: "Development" }
        },
        {
          id: 203,
          name: "Priya",
          organization: { id: 1, name: "ABC Technologies" },
          department: { id: 102, name: "Testing" }
        },
        {
          id: 204,
          name: "Divya",
          organization: { id: 2, name: "XYZ Solutions" },
          department: { id: 104, name: "Finance" }
        }
      ]
    };
  },

  computed: {
    lookupHasMore() {
      return this.lookupPageSize < this.customers.length;
    },

    staleSelectedCustomer() {
      return this.staleTestCustomers.find(
        customer => customer.id === this.staleSelectionCustomerId
      ) || null;
    }
  },

  methods: {

    handleUserCreated(user) {
    console.log("New user created:", user);
  },

    log(label, record) {
      console.log(label, record);
    },

    submitLookup() {
      if (this.$refs.customerLookup.validate()) {
        const submittedCustomer = this.customers.find(
          customer => customer.id === this.lookupCustomerId
        );

        console.log("========== SUBMITTED CUSTOMER DETAILS ==========");
        console.log("Customer ID:", submittedCustomer?.id);
        console.log("Full Customer Object:", submittedCustomer);

        if (submittedCustomer) {
          console.table([submittedCustomer]);
        }

        console.log("=================================================");
        this.$refs.customerLookup.reset();
      }
    },

    async loadMoreCustomers() {
      if (this.lookupLoadingMore || !this.lookupHasMore) return;

      this.lookupLoadingMore = true;

      try {
        await delay(500);
        this.lookupPageSize = Math.min(
          this.lookupPageSize + 4,
          this.customers.length
        );
      } finally {
        this.lookupLoadingMore = false;
      }
    },
    handleSelect(record){
      this.customError="";
    },
    async searchRemoteLookup(searchText) {
      this.remoteLookupLoading = true;

      try {
        await delay(350);
        const query = String(searchText || "").trim().toLowerCase();

        this.remoteLookupOptions = this.remoteApiCustomers.filter(record =>
          !query ||
          [record.name, record.email, record.city].some(value =>
            value.toLowerCase().includes(query)
          )
        );
      } finally {
        this.remoteLookupLoading = false;
      }
    },

    async searchRemoteDropdown(searchText) {
      this.remoteDropdownLoading = true;

      try {
        await delay(350);
        const query = String(searchText || "").trim().toLowerCase();

        this.remoteDropdownOptions = this.remoteApiCustomers.filter(record =>
          !query ||
          [record.name, record.email, record.city].some(value =>
            value.toLowerCase().includes(query)
          )
        );
      } finally {
        this.remoteDropdownLoading = false;
      }
    },

    resetCountryChildren() {
      this.selectedStateId = null;
      this.selectedCityId = null;
    },

    resetStateChildren() {
      this.selectedCityId = null;
    },

    resetOrganizationChildren() {
      this.selectedDepartmentId = null;
      this.selectedEmployeeId = null;
      this.selectedProjectId = null;
      this.andEmployeeId = null;
      this.nestedAndEmployeeId = null;
    },

    resetDepartmentChildren() {
      this.selectedEmployeeId = null;
      this.selectedProjectId = null;
      this.andEmployeeId = null;
      this.nestedAndEmployeeId = null;
    },

    resetEmployeeChildren() {
      this.selectedProjectId = null;
    },

    async loadCardDetails() {
      this.cardDemoError = false;
      this.cardDemoLoading = true;

      try {
        await delay(900);
        this.cardDemoError = false;
      } catch (error) {
        this.cardDemoError = true;
      } finally {
        this.cardDemoLoading = false;
      }
    },

    async retryCardDetails() {
      this.cardDemoError = false;
      this.cardDemoLoading = true;

      try {
        await delay(900);
        this.cardDemoError = false;
      } catch (error) {
        this.cardDemoError = true;
      } finally {
        this.cardDemoLoading = false;
      }
    },

    removeStaleSelectedRecord() {
      if (this.staleSelectionCustomerId === null) {
        this.staleTestMessage = "No selected record to remove";
        return;
      }

      const removedId = this.staleSelectionCustomerId;

      this.staleTestCustomers = this.staleTestCustomers.filter(
        customer => customer.id !== removedId
      );

      this.staleTestMessage = `Removed record ID: ${removedId}`;
    },

    restoreStaleTestCustomers() {
      this.staleTestCustomers = [
        {
          id: 101,
          name: "BAC Technologies",
          email: "bac@example.com",
          city: "Coimbatore",
          status: "Active",
          age: 23,
          amount: 15000
        },
        {
          id: 102,
          name: "ABC Solutions",
          email: "abc@example.com",
          city: "Chennai",
          status: "Active",
          age: 25,
          amount: 20000
        },
        {
          id: 103,
          name: "XYZ Technologies",
          email: "xyz@example.com",
          city: "Madurai",
          status: "Inactive",
          age: 24,
          amount: 18000
        }
      ];

      this.staleTestMessage = "All records restored";
    },

    selectStaleTestCustomer() {
      this.staleSelectionCustomerId = 102;
      this.staleTestMessage = "Selected customer ID 102";
    },

    clearStaleTestSelection() {
      this.$refs.staleSelectionLookup.clearSelection();
      this.staleTestMessage = "Selection cleared";
    },

    resetStaleTestSelection() {
      this.$refs.staleSelectionLookup.reset();
      this.staleTestMessage = "Lookup reset";
    },

    validateStaleTestSelection() {
      const isValid = this.$refs.staleSelectionLookup.validate();

      this.staleTestMessage = isValid
        ? "Validation passed"
        : "Validation failed";

      console.log("Stale selection validation:", isValid);
    }
  }
};
</script>

<style>
.page {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
  font-family: "Open Sans Variable", sans-serif;
}

.component-section {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid #e2e2e2;
  border-radius: 8px;
}

.component-section h3 {
  margin: 0 0 18px;
  font-size: 17px;
}

.component-section p {
  color: #666;
  font-size: 13px;
}

.component-section .hlx-select + .hlx-select {
  margin-top: 18px;
}

button {
  margin-top: 12px;
  padding: 8px 14px;
  cursor: pointer;
}

.test-info {
  margin-top: 15px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
}

.test-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.test-actions button {
  margin-top: 0;
}
</style>
