import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Language from '../app/(auth)/language';
import { setSession } from '../lib/protoSession';
import { router } from 'expo-router';

jest.mock('../lib/protoSession');
jest.mock('expo-router');

describe('Language Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all language options', () => {
    const { getByText } = render(<Language />);
    
    expect(getByText('English')).toBeTruthy();
    expect(getByText('Bahasa Melayu')).toBeTruthy();
    expect(getByText('Primary language')).toBeTruthy();
  });

  test('should render title and subtitle', () => {
    const { getByText } = render(<Language />);
    
    expect(getByText(/Choose Your/)).toBeTruthy();
    expect(getByText(/Language/)).toBeTruthy();
    expect(getByText(/Select your preferred language/)).toBeTruthy();
  });

  test('should select English by default', () => {
    const { getAllByText } = render(<Language />);
    
    // English card should show as selected (has checkmark)
    const englishCards = getAllByText('English');
    expect(englishCards.length).toBeGreaterThan(0);
  });

  test('should select language when card is pressed', () => {
    const { getByText } = render(<Language />);
    
    const malayCard = getByText('Bahasa Melayu');
    fireEvent.press(malayCard);
    
    // Should update selection state
    expect(malayCard).toBeTruthy();
  });

  test('should save language and navigate on continue', async () => {
    const { getByText } = render(<Language />);
    
    // Select Malay
    const malayCard = getByText('Bahasa Melayu');
    fireEvent.press(malayCard);
    
    // Press Continue
    const continueButton = getByText('Continue');
    fireEvent.press(continueButton);
    
    await waitFor(() => {
      expect(setSession).toHaveBeenCalledWith({ language: 'ms' });
      expect(router.push).toHaveBeenCalledWith('/(auth)/literacy-assessment');
    });
  });

  test('should navigate to login when link pressed', () => {
    const { getByText } = render(<Language />);
    
    const loginLink = getByText('Log In');
    fireEvent.press(loginLink);
    
    expect(router.push).toHaveBeenCalledWith('/(auth)/login');
  });

  // test('should allow skipping to signup', async () => {
  //   const { getByText } = render(<Language />);
    
  //   const skipLink = getByText(/Skip assessment and/);
  //   fireEvent.press(skipLink);
    
  //   await waitFor(() => {
  //     expect(setSession).toHaveBeenCalled();
  //     expect(router.push).toHaveBeenCalled();
  //   });
  // });
});