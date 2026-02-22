import React from 'react';
import { StepProps } from './types';
import { SafetyRiskScreening } from '../SafetyRiskScreening';

export function SafetyScreeningStep({ formData, updateFormData }: StepProps) {
    return (
        <SafetyRiskScreening
            data={formData.safetyScreeningData}
            onChange={(data) => updateFormData('safetyScreeningData', data)}
            countryCode={formData.country}
        />
    );
}
