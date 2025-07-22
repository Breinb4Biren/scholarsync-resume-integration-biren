import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  text: '',
  parsed: null, //(name, skills, etc.)
  loading: false,
  error: null,
};

export const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    startParsing: (state) => {
      state.loading = true;
      state.error = null;
    },
    setParsedText: (state, action) => {
      state.loading = false;
      state.text = action.payload;
    },
    setParsedData: (state, action) => {
      state.parsed = action.payload;
    },
    setResumeError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { startParsing, setParsedText, setParsedData, setResumeError } = resumeSlice.actions;
export default resumeSlice.reducer;
