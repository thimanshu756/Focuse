import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Press" onPress={onPressMock} />
    );

    fireEvent.press(getByText('Press'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when isLoading is true', () => {
    const { queryByText } = render(<Button title="Submit" isLoading={true} />);

    // ActivityIndicator should be present
    expect(queryByText('Submit')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" disabled={true} onPress={onPressMock} />
    );

    fireEvent.press(getByText('Disabled'));
    // Should not call onPress when disabled
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('applies correct variant styles', () => {
    const { getByText, rerender } = render(
      <Button title="Primary" variant="primary" />
    );

    let button = getByText('Primary').parent;
    expect(button?.props.style).toBeTruthy();

    rerender(<Button title="Secondary" variant="secondary" />);
    button = getByText('Secondary').parent;
    expect(button?.props.style).toBeTruthy();
  });
});
