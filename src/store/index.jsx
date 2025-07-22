import axios from 'axios';
import { create } from 'zustand';
import apiInstance from '@api/apiInstance';



const useStore = create((set) => ({
  revenueGraphData: null,
  revenueSampleData: null,
  collectionData: null,
  collection2Data: null,
  collection2GraphData: null,
  sortByRefData: null,
  sortByRefAgingData: null,
  reloadTc: null,
  requestBody: {},
  AgingRequestBody: {},
  ExpenseRequestBody: {},
  ExpenseReportRequestBody: {},
  CancellationReportRequestBody: {},
  userDetails: {},
  AopRequestBody: {},
  AopReportRequestBody: {},
  AopProjectionReportRequestBody: {},
  developerReportRequestBody: {},
  developerProjectionReportRequestBody: {},
  collectiveDeveloperReportRequestBody: {},

  collection1RequestBody: {},
  collection2RequestBody: {},
  collection2GraphRequestBody: {},

  updateUserDetails: async (newUserDetails) => {
    set({ userDetails: newUserDetails });
  },

  updateCollection1RequestBody: async(newRequestBody) => {
    const updatedRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );
    set({collection1RequestBody: updatedRequestBody});
    await useStore.getState().fetchCollection1Data();
  },

  updateRequestBody: async (newRequestBody) => {
    const updatedRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );

    set({ requestBody: updatedRequestBody });
    await useStore.getState().fetchRevenueGraphData();
    await useStore.getState().fetchRevenueSampleData();
  },

  updateAgingRequestBody: async (newRequestBody) => {
    const updatedAgingRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );

    set({ AgingRequestBody: updatedAgingRequestBody });
  },

  updateAopRequestBody: async (newRequestBody) => {
    const updatedAopRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );

    set({ AopRequestBody: updatedAopRequestBody });
  },

  updatedeveloperReportRequestBody: async (newRequestBody) => {
    const updateddeveloperReportRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );
  
    set({ developerReportRequestBody: updateddeveloperReportRequestBody });
  },

  updateCollectivedeveloperReportRequestBody: async (newRequestBody) => {
    const updatedcollectivedeveloperReportRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );
  
    set({ collectiveDeveloperReportRequestBody: updatedcollectivedeveloperReportRequestBody });
  },

  updatedeveloperProjectionReportRequestBody: async (newRequestBody) => {
    const updateddeveloperProjectionReportRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );
  
    set({ developerProjectionReportRequestBody: updateddeveloperProjectionReportRequestBody });
  },

  updateAopReportRequestBody: async (newRequestBody) => {
    const updatedAopReportRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );
  
    set({ AopReportRequestBody: updatedAopReportRequestBody });
  },
  
  updateAopProjectionReportRequestBody: async (newRequestBody) => {
    const updatedAopProjectionReportRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );
  
    set({ AopProjectionReportRequestBody: updatedAopProjectionReportRequestBody });
  },

  updateExpenseRequestBody: async (newRequestBody) => {
    const updatedExpenseRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );

    set({ ExpenseRequestBody: updatedExpenseRequestBody });
  },

  updateExpenseReportRequestBody: async (newRequestBody) => {
    const updatedExpenseReportRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );

    set({ ExpenseReportRequestBody: updatedExpenseReportRequestBody });
  },

  updateCancellationReportRequestBody: async (newRequestBody) => {
    const updatedCancellationReportRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );

    set({ CancellationReportRequestBody: updatedCancellationReportRequestBody });
  },

  updateSortByRefBody: async (newRequestBody) => {
    set({ sortByRefData: newRequestBody });
  },

  updateSortByAgingRefBody: async (newRequestBody) => {
    set({ sortByRefAgingData: newRequestBody });
  },

  updateTablec: async (newRequestBody) => {
    set({ reloadTc: newRequestBody });
  },

  updateCollection2RequestBody: async(newRequestBody) => {
    const updatedRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value])
    );
    set({collection2RequestBody: updatedRequestBody});
  },

  updateCollection2GraphRequestBody: async (newRequestBody) => {
    const updatedRequestBody = Object.fromEntries(
      Object.entries(newRequestBody).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(',') : value,
      ])
    );
    set({ collection2GraphRequestData: updatedRequestBody });
    await useStore.getState().fetchCollection2GraphData();
  },

  fetchRevenueSampleData: async () => {
    try {
      const { requestBody } = useStore.getState();
      const response = await apiInstance('client/expense/revenue2.php', 'POST', requestBody);
      set({ revenueSampleData: response.data });
    } catch (error) {
      console.error('Error fetching data from revenueSampleData:', error);
    }
  },
  
  fetchRevenueGraphData: async () => {
    try {
      const { requestBody } = useStore.getState();
      const response = await apiInstance('client/expense/revenueGraphFilter.php', 'POST', requestBody);
      set({ revenueGraphData: response.data }); 
    } catch (error) {
      console.error('Error fetching data from API:', error);
    }
  },
  
  fetchCollection1Data: async () => {
    try {
      const { collection1RequestBody } = useStore.getState();
  
      // Check if collection1RequestBody is not empty
      const hasRequestBody = Object.keys(collection1RequestBody).length !== 0;
  
      const response = await apiInstance(
        'client/collections/collection1.php',
        'POST',
        hasRequestBody ? collection1RequestBody : {}
      );
  
      //console.log(response.data);
      set({ collectionData: response.data });
    } catch (error) {
      console.error('Error fetching data from collection1 API:', error);
    }
  },
  
  fetchCollection2Data: async () => {
    try {
      const { collection2RequestBody } = useStore.getState();
  
      // Check if collection2RequestBody is not empty
      const hasRequestBody = Object.keys(collection2RequestBody).length !== 0;
  
      const response = await apiInstance(
        'client/collections/collection2.php',
        'POST',
        hasRequestBody ? collection2RequestBody : {}
      );
  
      set({ collection2Data: response.data });
    } catch (error) {
      console.error('Error fetching data from collection2 API:', error);
    }
  },
  
  fetchCollection2GraphData: async () => {
    try {
      const { collection2GraphRequestBody } = useStore.getState();
      // Check if collection2RequestBody is not empty
      const hasRequestBody = Object.keys(collection2GraphRequestBody).length !== 0;
  
      const response = await apiInstance(
        'client/collections/collectiongraph.php',
        'POST',
        hasRequestBody ? collection2GraphRequestBody : {}
      );
  
     // console.log(response.data);
      set({ collection2GraphData: response.data });
    } catch (error) {
      console.error('Error fetching data from collection graph 2 API:', error);
    }
  },
  

  resetAndFetchData: async () => {
    set({ requestBody: null }); 
    set({ AgingRequestBody: null });
    set({ collection1RequestBody: null });
    set({ collection2RequestBody: null });
    set({ ExpenseRequestBody: null});
    await get().fetchRevenueSampleData(); 
    await get().fetchRevenueGraphData(); 
    await get().updateRequestBody();
    await get().fetchCollection1Data();   
    await get().updateCollection1RequestBody();
    await get().fetchCollection2Data();
  },

}));

export default useStore;
