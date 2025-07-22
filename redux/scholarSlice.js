import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

export const scholarSlice = createSlice({
  name: 'scholar',
  initialState,
  reducers: {
    startFetch: (state) => {
      state.loading = true;
      state.error = null;
    },
    setScholarProfile: (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    },
    setScholarError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { startFetch, setScholarProfile, setScholarError } = scholarSlice.actions;
export default scholarSlice.reducer;
