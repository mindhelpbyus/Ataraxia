import React from 'react';
import { StepProps } from './types';
import { PresentingConcerns } from '../PresentingConcerns';

export function PresentingConcernsStep({ formData, updateFormData }: StepProps) {
    return (
        <PresentingConcerns
            data={formData.presentingConcernsData}
            onChange={(data) => updateFormData('presentingConcernsData', data)}
        />
    );
}
