import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScholarInput from '../components/ScholarInput';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import scholarReducer from '../redux/scholarSlice';
import suggestionReducer from '../redux/suggestionSlice';

// Mock the fetch call
global.fetch = jest.fn();

const renderWithStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      scholar: scholarReducer,
      suggestion: suggestionReducer,
    },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <ScholarInput />
    </Provider>
  );
};

describe('ScholarInput Component', () => {
  beforeEach(() => {
    fetch.mockClear(); // reset fetch mock before each test
  });

  it('renders input and fetch button', () => {
    renderWithStore();

    expect(screen.getByPlaceholderText(/Google Scholar/i)).toBeInTheDocument();
    expect(screen.getByText(/Fetch Scholar Data/i)).toBeInTheDocument();
  });

  it('shows error alert if invalid URL is entered', () => {
    renderWithStore();

    window.alert = jest.fn(); // mock alert
    const input = screen.getByPlaceholderText(/Google Scholar/i);
    const fetchBtn = screen.getByText(/Fetch Scholar Data/i);

    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(fetchBtn);

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid Google Scholar URL');
  });

  it('dispatches fetch and displays data on valid response', async () => {
    const mockProfile = { name: 'Andrew Ng', affiliation: 'Stanford' };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    renderWithStore();

    const input = screen.getByPlaceholderText(/Google Scholar/i);
    const fetchBtn = screen.getByText(/Fetch Scholar Data/i);

    fireEvent.change(input, { target: { value: 'https://scholar.google.com/citations?user=XYZ' } });
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(screen.getByText(/Scholar Info/i)).toBeInTheDocument();
      expect(screen.getByText(/Andrew Ng/)).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Profile not found' }),
    });

    renderWithStore();

    const input = screen.getByPlaceholderText(/Google Scholar/i);
    const fetchBtn = screen.getByText(/Fetch Scholar Data/i);

    fireEvent.change(input, { target: { value: 'https://scholar.google.com/citations?user=ABC' } });
    fireEvent.click(fetchBtn);

    await waitFor(() => {
      expect(screen.getByText(/Error: Profile not found/i)).toBeInTheDocument();
    });
  });
});
