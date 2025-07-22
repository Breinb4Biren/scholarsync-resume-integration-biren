import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk: fetch project suggestions from backend
export const fetchSuggestions = createAsyncThunk(
  'suggestions/fetch',
  async ({ resumeData, scholarData }, thunkAPI) => {
    try {
      const res = await fetch('/api/suggest-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, scholarData }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch suggestions');
      }

      const data = await res.json();
      return data.suggestions;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const suggestionSlice = createSlice({
  name: 'suggestions',
  initialState: {
    suggestions: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSuggestions: (state) => {
      state.suggestions = [];
      state.error = null;
      state.loading = false;
    },// (optional future actions can go here)
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.suggestions = []; // clear old suggestions while loading
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload || [];
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});
export const { clearSuggestions } = suggestionSlice.actions;
export default suggestionSlice.reducer;
