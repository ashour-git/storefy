// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { LogoUpload } from '../LogoUpload';

afterEach(() => cleanup());

describe('LogoUpload', () => {
  it('shows preview with remove and width control when a logo exists', () => {
    const onRemove = vi.fn();
    const onWidthChange = vi.fn();
    render(
      <LogoUpload logoUrl="https://cdn.test/logo.png" logoWidth="40px" uploading={false} onSelect={() => undefined} onRemove={onRemove} onWidthChange={onWidthChange} />
    );
    expect(screen.getByAltText('Logo')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledOnce();
    fireEvent.change(screen.getByLabelText(/logo width/i), { target: { value: '48px' } });
    expect(onWidthChange).toHaveBeenCalledWith('48px');
  });

  it('shows uploading state and disables input', () => {
    render(
      <LogoUpload logoUrl="" logoWidth="40px" uploading onSelect={() => undefined} onRemove={() => undefined} onWidthChange={() => undefined} />
    );
    expect(screen.getByText(/uploading/i)).toBeDefined();
  });

  it('forwards the selected file', () => {
    const onSelect = vi.fn();
    render(
      <LogoUpload logoUrl="" logoWidth="40px" uploading={false} onSelect={onSelect} onRemove={() => undefined} onWidthChange={() => undefined} />
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onSelect).toHaveBeenCalledWith(file);
  });
});
