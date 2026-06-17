import React from 'react';
import { Controller, UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import { SceneSelector } from './SceneSelector';
import { DegreeInput } from './DegreeInput';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Scene } from '@/types/scene';
import type { SceneLink } from '@/types/link';

interface LinkFormProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors<any>;
  setValue: (name: string, value: any, options?: any) => void;
  availableScenes: Scene[];
  editingLink: SceneLink | null;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LinkForm({
  register,
  control,
  errors,
  setValue,
  availableScenes,
  editingLink,
  isPending,
  onCancel,
  onSubmit,
}: LinkFormProps) {
  // Destination options for creation
  const destinationOptions = availableScenes;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 w-full">
      {/* Target scene selector */}
      {!editingLink && (
        <div>
          {destinationOptions.length > 0 ? (
            <Controller
              name="to_scene_id"
              control={control}
              render={({ field }) => (
                <SceneSelector
                  value={field.value}
                  onChange={field.onChange}
                  availableScenes={destinationOptions}
                  error={errors.to_scene_id?.message as string}
                />
              )}
            />
          ) : (
            <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg">
              There are no other scenes in this tour to link to. 
              Please add another scene first!
            </div>
          )}
        </div>
      )}

      {/* Disabled target scene info display when editing */}
      {editingLink && (
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Leads to scene
          </label>
          <div className="w-full h-10 px-3 border border-gray-200 bg-gray-50 rounded-lg text-sm flex items-center text-gray-500 font-medium select-none">
            {editingLink.to_scene_title}
          </div>
        </div>
      )}

      {/* Degree input with compass rose */}
      <Controller
        name="degree"
        control={control}
        render={({ field }) => (
          <DegreeInput
            label="Direction"
            value={field.value}
            onChange={(deg) => setValue('degree', deg, { shouldValidate: true })}
            error={errors.degree?.message as string}
          />
        )}
      />

      {/* Label */}
      <Input
        label="Label (optional)"
        placeholder="e.g. To cafeteria, Exit, Room 3"
        error={errors.label?.message as string}
        {...register('label')}
      />

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          loading={isPending}
          disabled={!editingLink && destinationOptions.length === 0}
        >
          {editingLink ? 'Save Changes' : 'Add Link'}
        </Button>
      </div>
    </form>
  );
}
