import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResumeUploader from '../components/ResumeUploader';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import resumeReducer from '@/redux/resumeSlice';
import suggestionReducer from '@/redux/suggestionSlice';

describe('ResumeUploader Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        resume: resumeReducer,
        suggestion: suggestionReducer,
      },
      preloadedState: {
        resume: {
          loading: false,
          error: null,
          text: '',
          parsed: null,
        },
        suggestion: {
          suggestions: [],
        },
      },
    });
  });

  it('renders upload and clear buttons', () => {
    render(
      <Provider store={store}>
        <ResumeUploader />
      </Provider>
    );

    expect(screen.getByText(/Upload & Parse/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear/i)).toBeInTheDocument();
  });

  it('displays file name after selecting', () => {
    render(
      <Provider store={store}>
        <ResumeUploader />
      </Provider>
    );

    const file = new File(['sample content'], 'resume.pdf', { type: 'application/pdf' });

    const input = document.getElementById('resumeUpload');
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/✅ Selected: resume.pdf/i)).toBeInTheDocument();
  });
});
