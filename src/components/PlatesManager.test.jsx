import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlatesManager from './PlatesManager';
import { DEFAULT_PLATES } from '../lib/plates';

describe('PlatesManager', () => {
  it('lists current plates and adds a new one', async () => {
    const onAdd = vi.fn();
    render(<PlatesManager plates={DEFAULT_PLATES} onAdd={onAdd} onRemove={() => {}} />);
    expect(screen.getByText(/25 kg/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/peso del disco/i), '12');
    await userEvent.click(screen.getByRole('button', { name: /añadir disco/i }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ weight: 12 }));
  });

  it('removes a plate', async () => {
    const onRemove = vi.fn();
    render(<PlatesManager plates={DEFAULT_PLATES} onAdd={() => {}} onRemove={onRemove} />);
    await userEvent.click(screen.getAllByRole('button', { name: /eliminar disco/i })[0]);
    expect(onRemove).toHaveBeenCalledWith(DEFAULT_PLATES[0].id);
  });

  it('picks a preset color from the popover (no full palette shown by default)', async () => {
    const onAdd = vi.fn();
    render(<PlatesManager plates={DEFAULT_PLATES} onAdd={onAdd} onRemove={() => {}} />);
    // Palette is collapsed: only the single current-color swatch is visible.
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/peso del disco/i), '8');
    await userEvent.click(screen.getByRole('button', { name: /color del disco/i }));
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
    await userEvent.click(options[1]);
    // Popover closes after choosing.
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /añadir disco/i }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ weight: 8, color: expect.stringMatching(/^#/) }));
  });

  it('creates a custom color from the shade grid', async () => {
    const onAdd = vi.fn();
    render(<PlatesManager plates={DEFAULT_PLATES} onAdd={onAdd} onRemove={() => {}} />);
    await userEvent.type(screen.getByLabelText(/peso del disco/i), '7');
    await userEvent.click(screen.getByRole('button', { name: /color del disco/i }));
    const options = screen.getAllByRole('option');
    // beyond the standard presets there are many generated shades to pick from
    expect(options.length).toBeGreaterThan(DEFAULT_PLATES.length + 10);
    await userEvent.click(options[options.length - 1]);
    await userEvent.click(screen.getByRole('button', { name: /añadir disco/i }));
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ weight: 7, color: expect.stringMatching(/^#[0-9a-f]{6}$/i) }));
  });

  it('edits an existing plate and saves via onUpdate', async () => {
    const onUpdate = vi.fn();
    // heaviest plate is shown first; edit it and change the weight
    const heaviest = [...DEFAULT_PLATES].sort((a, b) => b.weight - a.weight)[0];
    render(<PlatesManager plates={DEFAULT_PLATES} onAdd={() => {}} onRemove={() => {}} onUpdate={onUpdate} />);
    await userEvent.click(screen.getAllByRole('button', { name: /editar disco/i })[0]);
    const weightInput = screen.getByDisplayValue(String(heaviest.weight));
    await userEvent.clear(weightInput);
    await userEvent.type(weightInput, '22.5');
    await userEvent.click(screen.getByRole('button', { name: /^guardar$/i }));
    expect(onUpdate).toHaveBeenCalledWith(heaviest.id, expect.objectContaining({ weight: 22.5 }));
  });
});
